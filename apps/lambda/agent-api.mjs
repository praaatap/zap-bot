import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const region = process.env.AWS_REGION || "us-east-1";
const modelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

const bedrock = new BedrockRuntimeClient({ region });

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

function parseBody(event) {
  if (!event?.body) return {};
  try {
    return typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch {
    return {};
  }
}

function detectPlatform(url) {
  if (url.includes("meet.google.com")) return "google_meet";
  if (url.includes("zoom.us")) return "zoom";
  if (url.includes("teams.microsoft.com")) return "teams";
  return "google_meet";
}

async function createMeetingBaasBot(meetingUrl) {
  const apiKey = process.env.MEETING_BAAS_API_KEY;
  const baseUrl = process.env.MEETING_BAAS_BASE_URL || "https://api.meetingbaas.com/v2";

  if (!apiKey) {
    return { id: `mock-bot-${Date.now()}`, status: "joining" };
  }

  const res = await fetch(`${baseUrl}/bots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: "Zap Bot",
      entry_message: "Zap Bot joined to assist with live suggestions.",
      recording: { mode: "speaker_view" },
      transcription: { enabled: true, language: "en" },
      webhook_url: process.env.MEETING_BAAS_WEBHOOK_URL
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`MeetingBaaS error ${res.status}: ${txt}`);
  }

  return res.json();
}

async function suggestReply(payload) {
  const suggestionPrompt = `You are an AI meeting copilot.
User needs real-time response help.

Meeting: ${payload.meetingTitle || "Ad-hoc meeting"}
Question from user: ${payload.prompt}
Recent context:\n${payload.context || "No transcript context available."}

Return exactly:
1) Suggested response (2-4 sentences)
2) One follow-up question
3) One caveat/risk`;

  const cmd = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 350,
      messages: [{ role: "user", content: suggestionPrompt }]
    })
  });

  const res = await bedrock.send(cmd);
  return JSON.parse(new TextDecoder().decode(res.body)).content[0].text;
}

export const handler = async (event) => {
  const method = event?.requestContext?.http?.method || event?.httpMethod || "GET";
  const path = event?.rawPath || event?.path || "/";

  if (method === "OPTIONS") {
    return response(200, { ok: true });
  }

  if (method === "GET" && path.endsWith("/health")) {
    return response(200, {
      ok: true,
      service: "zap-bot-agent-api",
      mode: "serverless",
      timestamp: new Date().toISOString()
    });
  }

  if (method === "POST" && path.endsWith("/meetings/join")) {
    const body = parseBody(event);
    if (!body?.meetingUrl) return response(400, { success: false, error: "meetingUrl is required" });

    try {
      const bot = await createMeetingBaasBot(body.meetingUrl);
      return response(200, {
        success: true,
        data: {
          id: `mtg-${Date.now()}`,
          title: body.title || "Ad-hoc Meeting",
          meetingUrl: body.meetingUrl,
          platform: detectPlatform(body.meetingUrl),
          botId: bot.id,
          botStatus: bot.status || "joining",
          startTime: body.startTime || new Date().toISOString()
        }
      });
    } catch (error) {
      return response(500, { success: false, error: error instanceof Error ? error.message : "Failed to join" });
    }
  }

  if (method === "POST" && path.endsWith("/chat/suggest")) {
    const body = parseBody(event);
    if (!body?.prompt) return response(400, { success: false, error: "prompt is required" });

    try {
      const suggestion = await suggestReply(body);
      return response(200, { success: true, suggestion });
    } catch (error) {
      return response(200, {
        success: true,
        suggestion: `Suggested response:\n"A safe answer is to align on owner, timeline, and dependency now."\n\nFollow-up question:\n"Should we confirm owner and due date before we close this topic?"\n\nCaveat:\n"We should validate assumptions with the team before committing."`
      });
    }
  }

  return response(404, { success: false, error: "Route not found" });
};
