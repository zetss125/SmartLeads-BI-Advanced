import axios from "axios";
import { NormalizedLead } from "../utils/normalizer";

export interface MarketingTask {
  id: string;
  assignee: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export interface MarketingStrategyResponse {
  strategy: string; // Markdown formatted strategy plan
  tasks: MarketingTask[];
}

/**
 * Compiles lead analytics and calls OpenRouter to generate marketing strategies and assigned checklists.
 */
export async function generateMarketingStrategy(
  leads: NormalizedLead[],
  assignTasks: boolean
): Promise<MarketingStrategyResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";

  if (!leads || leads.length === 0) {
    return {
      strategy: "No leads available to generate a marketing strategy. Please upload a dataset first.",
      tasks: []
    };
  }

  // Compile lead statistics
  const total = leads.length;
  const highCount = leads.filter(l => l.priority === "High").length;
  const medCount = leads.filter(l => l.priority === "Medium").length;
  const lowCount = leads.filter(l => l.priority === "Low").length;

  const platforms: Record<string, number> = {};
  const signalCounts: Record<string, number> = {};
  let highUrgencyCount = 0;

  leads.forEach(l => {
    // Platform stats
    const plat = l.platform.toLowerCase();
    platforms[plat] = (platforms[plat] || 0) + 1;
    
    // Urgency stats
    if (l.urgency === "high") highUrgencyCount++;

    // Signals stats
    l.signals.forEach(sig => {
      const s = sig.toLowerCase();
      signalCounts[s] = (signalCounts[s] || 0) + 1;
    });
  });

  const topSignals = Object.entries(signalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sig, count]) => `${sig} (x${count})`)
    .join(", ");

  const topPlatforms = Object.entries(platforms)
    .sort((a, b) => b[1] - a[1])
    .map(([plat, count]) => `${plat}: ${count}`)
    .join(", ");

  const analyticsSummary = `
- Total Leads: ${total}
- High Priority (score 80+): ${highCount}
- Medium Priority (score 45-79): ${medCount}
- Low Priority (score <45): ${lowCount}
- High Urgency Intent Leads: ${highUrgencyCount}
- Top Platforms: ${topPlatforms}
- Top Behavioral Signals: ${topSignals}
  `.trim();

  if (!apiKey) {
    return {
      strategy: `### Basic Marketing Strategy (API Key Missing)

**Lead Distribution:**
- High priority leads: ${highCount}
- Medium priority leads: ${medCount}
- Low priority leads: ${lowCount}

**Outreach Recommendations:**
1. Direct DM outreach on dominant channels: ${topPlatforms}.
2. Focus on top user triggers: ${topSignals}.
3. Prioritize high urgency leads immediately.`,
      tasks: assignTasks ? [
        { id: "task-1", assignee: "Sarah", title: "Reach out to high-intent leads on Instagram/Facebook", priority: "High", completed: false },
        { id: "task-2", assignee: "David", title: "Create custom sizing/fit posts to address common user queries", priority: "Medium", completed: false }
      ] : []
    };
  }

  const prompt = `You are an expert retail marketing strategist. Analyze the following lead summary and generate a comprehensive marketing plan and task assignments for a sales and marketing team.

Retail Lead Analytics Summary:
${analyticsSummary}

Available team members for task assignment:
- Sarah (Outreach & Direct Sales Representative)
- David (Social Media & Content Creator)
- Alex (Marketing Automation Specialist)

Generate the strategy and task list. You MUST respond strictly in the following JSON format:
{
  "strategy": "Your detailed marketing strategy. Use Markdown sections, tables, lists, and clear outreach channels, messaging angles, and timing recommendations. NO EMOJIS.",
  "tasks": [
    {
      "id": "unique-task-string",
      "assignee": "Sarah" | "David" | "Alex",
      "title": "Clear action-oriented task description",
      "priority": "High" | "Medium" | "Low",
      "completed": false
    }
  ]
}

Instructions:
- The strategy must analyze score distributions and top channels.
- Give Sarah direct sales outreach tasks, David content creation tasks, and Alex automation or setup tasks.
- If assignTasks is false, you should return an empty array [] for "tasks" in the JSON.
- DO NOT use any emojis in the strategy text or tasks.
- Return ONLY raw JSON.`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
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

    const parsed: MarketingStrategyResponse = JSON.parse(content);
    
    // If user requested no tasks, ensure they are empty
    if (!assignTasks) {
      parsed.tasks = [];
    }

    return parsed;
  } catch (error) {
    return {
      strategy: `Error generating marketing strategy: ${(error as Error).message}`,
      tasks: []
    };
  }
}
