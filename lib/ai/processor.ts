import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY!,
    baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
})

export async function processMeetingTranscript(transcript: any) {
    try {
        let transcriptText = ''

        if (Array.isArray(transcript)) {
            transcriptText = transcript
                .map((item: any) => `${item.speaker || 'Speaker'}: ${item.words.map((w: any) => w.word).join(' ')}`)
                .join('\n')
        } else if (typeof transcript === 'string') {
            transcriptText = transcript
        } else if (transcript.text) {
            transcriptText = transcript.text
        }

        if (!transcriptText || transcriptText.trim().length === 0) {
            throw new Error('No transcript content found')
        }

        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant that analyzes meeting transcripts and provides concise summaries and action items.

                    Please analyze the meeting transcript and provide:
                    1. A clear, concise summary (2-3 sentences) of the main discussion points and decisions
                    2. A list of specific action items mentioned in the meeting

                    Format your response as valid JSON:
                    {
                        "summary": "Your summary here",
                        "actionItems": [
                            "Action item description 1",
                            "Action item description 2"
                        ]
                    }

                    Return only raw JSON. No markdown backticks.`
                },
                {
                    role: "user",
                    content: `Please analyze this meeting transcript:\n\n${transcriptText}`
                }
            ],
            temperature: 0.1,
            max_tokens: 1000
        })

        const response = completion.choices?.[0]?.message?.content

        if (!response) {
            throw new Error('No response from AI')
        }

        const parsed = JSON.parse(response)

        const actionItems = Array.isArray(parsed.actionItems) ? parsed.actionItems : []

        return {
            summary: parsed.summary || 'Summary couldn\'t be generated',
            actionItems: actionItems
        }

    } catch (error) {
        console.error('[AI] Transcript processing failed:', error)
        return {
            summary: 'Meeting transcript processed. Please check the full transcript for details.',
            actionItems: []
        }
    }
}

export async function answerQuestionWithContext(params: {
    question: string;
    context: string;
    meetingTitle?: string;
    history?: string;
}) {
    const { question, context, meetingTitle, history } = params;
    
    try {
        const completion = await openai.chat.completions.create({
            model: process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant",
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: `You are Zap Bot, a meeting assistant. 
                    Answer the question using the provided meeting context. 
                    Be professional, concise, and helpful.
                    
                    ${history ? `Recent conversation history:\n${history}` : ''}`
                },
                {
                    role: "user",
                    content: `Meeting: ${meetingTitle || "Untitled Meeting"}\n\nContext:\n${context}\n\nQuestion: ${question}`
                }
            ],
            max_tokens: 800
        });

        return completion.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate an answer."
    } catch (error) {
        console.error('[AI] Answering failed:', error)
        return "I encountered an error while processing your request."
    }
}
