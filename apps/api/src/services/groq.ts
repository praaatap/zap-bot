/**
 * Groq AI Service
 * High-speed inference for summarization and chat
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function groqChat(prompt: string, model: string = "llama-3.1-70b-versatile") {
    if (!GROQ_API_KEY) {
        console.warn("⚠️ GROQ_API_KEY not found, using mock response.");
        return `[Groq Mock] Based on the context, here is a fast response using ${model}: ${prompt.slice(0, 50)}...`;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
                max_tokens: 1024,
            }),
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response from Groq";
    } catch (err) {
        console.error("❌ Groq API error:", err);
        throw err;
    }
}

export async function groqSummarize(transcript: string) {
    const prompt = `
        Summarize the following meeting transcript. 
        Provide:
        1. A concise 3-paragraph summary.
        2. A list of key action items.
        3. A list of "Smart Chapters" with titles and approximate start times in seconds.
        4. "Top Highlights" (key moments) with types (Decisions, Blockers, Questions) and timestamps.

        Transcript:
        ${transcript}
    `.trim();

    return groqChat(prompt);
}
