import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { Pinecone } from "@pinecone-database/pinecone";

const region = process.env.AWS_REGION || "us-east-1";
const bucket = process.env.S3_BUCKET || "zap-bot-meetings";
const apiCallbackUrl = process.env.API_CALLBACK_URL || "";
const modelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";
const embedModelId = process.env.BEDROCK_EMBED_MODEL_ID || "amazon.titan-embed-text-v2:0";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "pc-mock-key-for-dev",
});

const s3 = new S3Client({ region });
const bedrock = new BedrockRuntimeClient({ region });

// ── Main handler ───────────────────────────────────────────────────

/**
 * @param {object} event
 * @param {string} event.meetingId  - The meeting ID
 * @param {string} event.bucket     - S3 bucket (overrides env)
 * @param {string} [event.s3TranscriptKey] - S3 key for transcript JSON
 * @param {string} [event.s3RecordingKey]  - S3 key for recording (metadata only)
 */
export const handler = async (event) => {
    console.log("🚀 Meeting Processor started:", JSON.stringify(event, null, 2));

    const meetingId = event.meetingId;
    const effectiveBucket = event.bucket || bucket;
    const transcriptKey = event.s3TranscriptKey || `transcripts/${meetingId}.json`;

    if (!meetingId) {
        throw new Error("meetingId is required in the event payload");
    }

    // ── Step 1: Fetch transcript from S3 ──────────────────────────
    console.log(`📦 Fetching transcript: s3://${effectiveBucket}/${transcriptKey}`);

    let transcript;
    try {
        const cmd = new GetObjectCommand({ Bucket: effectiveBucket, Key: transcriptKey });
        const res = await s3.send(cmd);
        const body = await streamToString(res.Body);
        transcript = JSON.parse(body);
    } catch (err) {
        console.warn("⚠️  Transcript not found in S3, using mock data:", err.message);
        // Use mock transcript for testing
        transcript = {
            meetingId,
            language: "en",
            entries: [
                { speaker: "Alice", text: "Welcome to the Zap Bot project sync. We need to integrate Pinecone.", startTime: 0, endTime: 6 },
                { speaker: "Bob", text: "I'll handle the embedding logic using Bedrock Titan.", startTime: 7, endTime: 14 },
                { speaker: "Alice", text: "Great. Make sure we chunk the transcript properly for RAG.", startTime: 15, endTime: 22 },
            ],
        };
    }

    // ── Step 2: AI Summarization & Action Items ───────────────────
    const formattedTranscript = formatTranscriptForAI(transcript);
    let aiResult;
    try {
        console.log(`🧠 Calling Bedrock model for summary: ${modelId}`);
        aiResult = await processWithBedrock(formattedTranscript, meetingId);
    } catch (err) {
        console.warn("⚠️  Bedrock summary failed, using mock:", err.message);
        aiResult = extractWithRules(transcript);
    }

    // ── Step 3: Semantic Chunking & Vector Ingestion ──────────────
    console.log("🧩 Beginning vector ingestion process...");
    try {
        const chunks = chunkTranscript(transcript);
        console.log(`📦 Generated ${chunks.length} chunks for embedding.`);

        const vectors = await generateEmbeddings(chunks, meetingId);
        console.log(`⚡ Generated ${vectors.length} embeddings.`);

        await upsertToPinecone(vectors);
        console.log("✅ Vectors upserted to Pinecone.");
    } catch (err) {
        console.error("❌ Vector ingestion failed:", err.message);
    }

    // ── Step 4: Build structured output ───────────────────────────
    const output = {
        meetingId,
        processedAt: new Date().toISOString(),
        summary: aiResult.summary,
        keyDecisions: aiResult.keyDecisions || [],
        actionItems: aiResult.actionItems || [],
        duration: transcript.entries?.length > 0
            ? Math.ceil((transcript.entries.at(-1)?.endTime || 0) / 60)
            : 0,
        speakerStats: buildSpeakerStats(transcript),
    };

    // ── Step 5: Upload AI result to S3 ────────────────────────────
    const outputKey = `ai-results/${meetingId}.json`;
    await s3.send(new PutObjectCommand({
        Bucket: effectiveBucket,
        Key: outputKey,
        Body: JSON.stringify(output, null, 2),
        ContentType: "application/json",
    }));

    // ── Step 6: Notify API server ──────────────────────────────────
    if (apiCallbackUrl) {
        try {
            const callbackUrl = apiCallbackUrl.replace(":id", meetingId);
            await fetch(callbackUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meetingId,
                    summary: output.summary,
                    actionItems: output.actionItems,
                    s3ResultKey: outputKey,
                }),
            });
        } catch (err) {
            console.warn("⚠️  Failed to notify API server:", err.message);
        }
    }

    return { statusCode: 200, meetingId, summary: output.summary };
};

// ── Vector Logic ───────────────────────────────────────────────────

function chunkTranscript(transcript, maxTokens = 400) {
    const entries = transcript.entries || [];
    const chunks = [];
    let currentChunk = { text: "", speakers: new Set(), startTime: entries[0]?.startTime || 0 };
    let currentCount = 0;

    for (const entry of entries) {
        const entryText = `[${entry.speaker}]: ${entry.text}\n`;
        const wordCount = entry.text.split(/\s+/).length;

        if (currentCount + wordCount > maxTokens && currentChunk.text) {
            currentChunk.endTime = entry.startTime;
            chunks.push({
                ...currentChunk,
                speakers: Array.from(currentChunk.speakers),
                text: currentChunk.text.trim()
            });
            currentChunk = { text: entryText, speakers: new Set([entry.speaker]), startTime: entry.startTime };
            currentCount = wordCount;
        } else {
            currentChunk.text += entryText;
            currentChunk.speakers.add(entry.speaker);
            currentCount += wordCount;
        }
    }

    if (currentChunk.text) {
        currentChunk.endTime = entries[entries.length - 1]?.endTime || currentChunk.startTime + 60;
        chunks.push({
            ...currentChunk,
            speakers: Array.from(currentChunk.speakers),
            text: currentChunk.text.trim()
        });
    }

    return chunks;
}

async function generateEmbeddings(chunks, meetingId) {
    const vectors = [];

    for (const [index, chunk] of chunks.entries()) {
        const payload = {
            inputText: chunk.text,
            dimensions: 1024,
            normalize: true
        };

        const cmd = new InvokeModelCommand({
            modelId: embedModelId,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });

        const res = await bedrock.send(cmd);
        const body = JSON.parse(new TextDecoder().decode(res.body));

        vectors.push({
            id: `${meetingId}-chunk-${index}`,
            values: body.embedding,
            metadata: {
                meetingId,
                text: chunk.text,
                speakers: chunk.speakers,
                startTime: chunk.startTime,
                endTime: chunk.endTime
            }
        });
    }

    return vectors;
}

async function upsertToPinecone(vectors) {
    const indexName = process.env.PINECONE_INDEX || "zap-bot";
    const index = pinecone.Index(indexName);

    // Pinecone handles batches up to 100
    await index.upsert(vectors);
}

// ── AI Processing ──────────────────────────────────────────────────

async function processWithBedrock(transcriptText, meetingId) {
    const prompt = `You are an expert meeting analyst. Analyze this meeting transcript and extract:
1. A concise summary (2-3 sentences)
2. Key decisions made
3. Action items with owner names

Transcript:
${transcriptText}

Respond ONLY with valid JSON:
{
  "summary": "...",
  "keyDecisions": ["..."],
  "actionItems": [{ "task": "...", "owner": "..." }]
}`;

    const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
    };

    const cmd = new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
    });

    const response = await bedrock.send(cmd);
    const text = JSON.parse(new TextDecoder().decode(response.body)).content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
}

// ── Helpers ────────────────────────────────────────────────────────

function formatTranscriptForAI(transcript) {
    return (transcript.entries || [])
        .map(e => `[${e.speaker}]: ${e.text}`)
        .join("\n");
}

function buildSpeakerStats(transcript) {
    const stats = {};
    for (const e of transcript.entries || []) {
        if (!stats[e.speaker]) stats[e.speaker] = { utterances: 0, wordCount: 0 };
        stats[e.speaker].utterances++;
        stats[e.speaker].wordCount += e.text.split(/\s+/).length;
    }
    return stats;
}

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString("utf-8");
}
