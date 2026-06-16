import axios from "axios";
import { NormalizedLead } from "../utils/normalizer";

export interface ChatAction {
  type: "FILTER" | "UPDATE_STATUS" | "RESET_FILTERS" | "NONE";
  payload?: any;
}

export interface ChatResponse {
  message: string;
  actions: ChatAction[];
}

/**
 * Sends chatbot prompt to OpenRouter and returns parsed action and text response.
 */
export async function processChatQuery(
  userQuery: string,
  leads: NormalizedLead[],
  chatHistory: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";

  if (!apiKey) {
    return {
      message: "OpenRouter API Key is missing. Please check your backend configurations.",
      actions: [{ type: "NONE" }]
    };
  }

  // Anonymize/abbreviate lead details to save tokens and protect privacy
  const leadDataForLLM = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    platform: l.platform,
    score: l.score,
    priority: l.priority,
    urgency: l.urgency,
    signals: l.signals,
    date: l.date,
    contacted: l.contacted
  }));

  const systemPrompt = `You are the SmartLeads BI Lead Assistant. You help small/medium retailers query, analyze, and manage their lead datasets.
You have access to the following lead dataset:
${JSON.stringify(leadDataForLLM)}

Your task is to:
1. Answer questions in natural language (summarize, analyze patterns, compare platforms, etc.).
2. Generate structural instructions (actions) when the user wants to filter, update contact status, or clear filters.

You MUST respond strictly in the following JSON format:
{
  "message": "Your conversational answer here. No emojis.",
  "actions": [
    {
      "type": "FILTER" | "UPDATE_STATUS" | "RESET_FILTERS" | "NONE",
      "payload": <any payload for the action>
    }
  ]
}

Action Specifications:
- FILTER: For queries like "show me leads with score above 80", set type "FILTER" and payload: { "field": "score", "operator": "gt", "value": 80 } (or operator "lt", "eq", or for dates).
- UPDATE_STATUS: For queries like "mark all leads from Texas/with score above 90/named Rawad as contacted", set type "UPDATE_STATUS" and payload: { "ids": ["id1", "id2"], "contacted": true }. You must scan the lead dataset yourself to select the correct lead IDs that match the criteria.
- RESET_FILTERS: For queries like "show all leads" or "clear filters", set type "RESET_FILTERS".
- NONE: For general questions or summaries, set type "NONE".

Remember: DO NOT include emojis. Return only the raw JSON.`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-6), // keep last 6 turns
      { role: "user", content: userQuery }
    ];

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        messages: messages,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    let content = response.data?.choices?.[0]?.message?.content?.trim() || "";
    if (content.startsWith("```")) {
      content = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsed: ChatResponse = JSON.parse(content);
    return parsed;
  } catch (error) {
    return {
      message: `Failed to communicate with the AI model. Error: ${(error as Error).message}`,
      actions: [{ type: "NONE" }]
    };
  }
}
