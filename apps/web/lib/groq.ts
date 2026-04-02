import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Generate meeting summary using Groq
 */
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

Respond in JSON format:
{
  "summary": "...",
  "actionItems": ["...", "..."],
  "keyPoints": ["...", "..."],
  "sentiment": "..."
}`;

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are an AI assistant specialized in analyzing meeting transcripts and extracting key information.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

    return {
        summary: result.summary || "No summary available",
        actionItems: result.actionItems || [],
        keyPoints: result.keyPoints || [],
        sentiment: result.sentiment || "Neutral",
    };
}

/**
 * Answer questions about meeting using RAG
 */
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

Provide a clear, concise answer based ONLY on the context provided. If the answer is not in the context, say "I don't have enough information to answer that."`;

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful AI assistant that answers questions about meeting transcripts.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.2,
        max_tokens: 500,
    });

    return completion.choices?.[0]?.message?.content || "Unable to generate response";
}

/**
 * Extract action items from transcript
 */
export async function extractActionItems(transcript: string): Promise<string[]> {
    const prompt = `Extract all action items, tasks, and follow-ups mentioned in this meeting transcript. List each as a clear, actionable item.

Transcript:
${transcript}

Return only the action items as a JSON array of strings.`;

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices?.[0]?.message?.content || '{"actionItems":[]}');
    return result.actionItems || [];
}

/**
 * Generate meeting highlights
 */
export async function generateMeetingHighlights(transcript: string): Promise<string[]> {
    const prompt = `Identify the 3-5 most important moments or decisions from this meeting transcript.

Transcript:
${transcript}

Return as a JSON array of highlight strings.`;

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.4,
        max_tokens: 800,
        response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices?.[0]?.message?.content || '{"highlights":[]}');
    return result.highlights || [];
}

/**
 * Classify meeting sentiment and topics
 */
export async function analyzeMeetingSentiment(
    transcript: string
): Promise<{
    sentiment: string;
    topics: string[];
    mood: string;
}> {
    const prompt = `Analyze the sentiment, main topics, and overall mood of this meeting.

Transcript:
${transcript}

Return in JSON format:
{
  "sentiment": "Positive/Neutral/Negative/Mixed",
  "topics": ["topic1", "topic2", ...],
  "mood": "brief description of the meeting atmosphere"
}`;

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

    return {
        sentiment: result.sentiment || "Neutral",
        topics: result.topics || [],
        mood: result.mood || "Professional",
    };
}
