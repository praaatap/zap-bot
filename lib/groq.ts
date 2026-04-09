import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY || "";
const hfApiKey = process.env.HUGGINGFACE_API_KEY || "";
const hfModel = process.env.HUGGINGFACE_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

function extractJsonObject(text: string): any {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) {
        throw new Error("No JSON object found in model output");
    }

    const jsonChunk = text.slice(first, last + 1);
    return JSON.parse(jsonChunk);
}

async function generateTextWithHuggingFace(prompt: string, maxTokens = 1200, temperature = 0.3): Promise<string> {
    if (!hfApiKey) {
        throw new Error("HUGGINGFACE_API_KEY is not set");
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${hfApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: maxTokens,
                temperature,
                return_full_text: false,
            },
            options: {
                wait_for_model: true,
            },
        }),
    });

    const json: any = await response.json();
    if (!response.ok) {
        throw new Error(json?.error || `Hugging Face API error (${response.status})`);
    }

    if (Array.isArray(json) && json[0]?.generated_text) {
        return String(json[0].generated_text);
    }

    if (typeof json?.generated_text === "string") {
        return json.generated_text;
    }

    if (typeof json === "string") {
        return json;
    }

    return JSON.stringify(json);
}

async function generateTextWithGroq(prompt: string, maxTokens = 1200, temperature = 0.3): Promise<string> {
    if (!groq) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful AI assistant for meeting analysis.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        model: process.env.GROQ_MODEL || "mixtral-8x7b-32768",
        temperature,
        max_tokens: maxTokens,
    });

    return completion.choices?.[0]?.message?.content || "";
}

async function generateText(prompt: string, maxTokens = 1200, temperature = 0.3): Promise<string> {
    if (hfApiKey) {
        return generateTextWithHuggingFace(prompt, maxTokens, temperature);
    }
    return generateTextWithGroq(prompt, maxTokens, temperature);
}

async function generateJson<T>(prompt: string, fallback: T, maxTokens = 1200): Promise<T> {
    try {
        const output = await generateText(`${prompt}\n\nReturn valid JSON only.`, maxTokens, 0.3);
        return extractJsonObject(output) as T;
    } catch (error) {
        console.error("AI JSON parse fallback:", error);
        return fallback;
    }
}

export async function generateMeetingSummary(
    transcript: string,
    meetingTitle?: string
): Promise<{
    summary: string;
    actionItems: string[];
    keyPoints: string[];
    sentiment: string;
}> {
    const prompt = `Analyze the following meeting transcript and provide:
1. A concise summary (2-3 sentences)
2. Key action items (bullet points)
3. Main discussion points
4. Overall sentiment (Positive/Neutral/Collaborative/Tense)

Meeting Title: ${meetingTitle || "Untitled Meeting"}

Transcript:
${transcript}

Respond in JSON format with keys: summary, actionItems, keyPoints, sentiment.`;

    const result = await generateJson(
        prompt,
        {
            summary: "No summary available",
            actionItems: [],
            keyPoints: [],
            sentiment: "Neutral",
        },
        1800
    );

    return {
        summary: result.summary || "No summary available",
        actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
        keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
        sentiment: result.sentiment || "Neutral",
    };
}

export async function answerMeetingQuestion(
    question: string,
    context: string,
    meetingTitle?: string
): Promise<string> {
    const prompt = `You are an AI assistant helping analyze a meeting. Use the provided context to answer the question accurately.

Meeting: ${meetingTitle || "Untitled Meeting"}

Context from transcript:
${context}

Question: ${question}

Provide a concise answer based only on this context. If uncertain, say you don't have enough information.`;

    const text = await generateText(prompt, 600, 0.2);
    return text || "Unable to generate response";
}

export async function extractActionItems(transcript: string): Promise<string[]> {
    const prompt = `Extract all action items, tasks, and follow-ups mentioned in this meeting transcript.

Transcript:
${transcript}

Respond as JSON: { "actionItems": ["..."] }`;

    const result = await generateJson<{ actionItems: string[] }>(prompt, { actionItems: [] }, 1200);
    return Array.isArray(result.actionItems) ? result.actionItems : [];
}

export async function generateMeetingHighlights(transcript: string): Promise<string[]> {
    const prompt = `Identify the 3-5 most important moments or decisions from this meeting transcript.

Transcript:
${transcript}

Respond as JSON: { "highlights": ["..."] }`;

    const result = await generateJson<{ highlights: string[] }>(prompt, { highlights: [] }, 1000);
    return Array.isArray(result.highlights) ? result.highlights : [];
}

export async function analyzeMeetingSentiment(
    transcript: string
): Promise<{
    sentiment: string;
    topics: string[];
    mood: string;
}> {
    const prompt = `Analyze sentiment, main topics, and overall mood of this meeting transcript.

Transcript:
${transcript}

Respond as JSON with keys: sentiment, topics, mood.`;

    const result = await generateJson(
        prompt,
        {
            sentiment: "Neutral",
            topics: [],
            mood: "Professional",
        },
        900
    );

    return {
        sentiment: result.sentiment || "Neutral",
        topics: Array.isArray(result.topics) ? result.topics : [],
        mood: result.mood || "Professional",
    };
}
