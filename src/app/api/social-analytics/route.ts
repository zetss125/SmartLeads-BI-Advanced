import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const MOCK_SOCIAL_DATA = {
  followers: 28450,
  following: 1240,
  posts: 892,
  engagement: 4.7,
  leads: [
    { id: "soc_1", username: "sarah_style", platform: "Instagram", followers: 12400, engagement: 6.2, lastPost: "2026-06-20", content: "Summer collection try-on haul", comments: 89, likes: 2340 },
    { id: "soc_2", username: "john_doe_fit", platform: "Instagram", followers: 8700, engagement: 4.1, lastPost: "2026-06-19", content: "New workout gear review", comments: 45, likes: 1200 },
    { id: "soc_3", username: "emma_beauty", platform: "TikTok", followers: 42000, engagement: 8.9, lastPost: "2026-06-21", content: "Get ready with me - new products", comments: 234, likes: 8900 },
    { id: "soc_4", username: "mike_tech", platform: "Twitter", followers: 5600, engagement: 3.2, lastPost: "2026-06-18", content: "Thread: Top 10 gadgets this month", comments: 67, likes: 890 },
    { id: "soc_5", username: "olivia_blog", platform: "Facebook", followers: 18300, engagement: 2.8, lastPost: "2026-06-20", content: "Weekly meal prep ideas", comments: 156, likes: 3400 },
  ],
  comments: [
    { id: "c1", leadId: "soc_1", user: "fashion_lover", text: "Love this! Where is the top from?", timestamp: "2026-06-20T14:30:00Z", sentiment: "positive" },
    { id: "c2", leadId: "soc_1", user: "style_guru", text: "The fit looks amazing on you", timestamp: "2026-06-20T15:00:00Z", sentiment: "positive" },
    { id: "c3", leadId: "soc_1", user: "neutral_critic", text: "Would love to see more size options", timestamp: "2026-06-20T16:00:00Z", sentiment: "neutral" },
    { id: "c4", leadId: "soc_2", user: "gym_rat", text: "What brand is that?", timestamp: "2026-06-19T10:00:00Z", sentiment: "neutral" },
    { id: "c5", leadId: "soc_3", user: "makeup_queen", text: "Tried this yesterday, obsessed!", timestamp: "2026-06-21T08:00:00Z", sentiment: "positive" },
    { id: "c6", leadId: "soc_3", user: "skincare_junkie", text: "Not a fan of the formula honestly", timestamp: "2026-06-21T09:00:00Z", sentiment: "negative" },
    { id: "c7", leadId: "soc_4", user: "tech_enthusiast", text: "Great thread, saved for later", timestamp: "2026-06-18T20:00:00Z", sentiment: "positive" },
    { id: "c8", leadId: "soc_5", user: "home_cook", text: "Made this yesterday, so good!", timestamp: "2026-06-20T18:00:00Z", sentiment: "positive" },
    { id: "c9", leadId: "soc_5", user: "foodie_adventures", text: "Do you have a version without dairy?", timestamp: "2026-06-20T19:00:00Z", sentiment: "neutral" },
  ]
};

export async function GET() {
  return NextResponse.json(MOCK_SOCIAL_DATA);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, params } = body;

    if (action === "sync-leads") {
      const leads = MOCK_SOCIAL_DATA.leads.map(l => ({
        name: l.username,
        email: `${l.username}@socialmedia.com`,
        phone: "",
        platform: l.platform,
        signals: ["social engagement", "content interaction", "audience building"],
        urgency: l.engagement > 5 ? "high" : "medium",
        date: l.lastPost,
        behavioralSentence: `Social engagement: ${l.engagement}% rate; Active content: ${l.content}; HIGH urgency`,
        contacted: false
      }));

      const { scoreLead } = await import("@/lib/scoring");
      const { generateId, addLeads } = await import("@/store");

      const scored = [];
      for (const lead of leads) {
        const scoredLead = await scoreLead(lead);
        const withId = { ...scoredLead, id: generateId() };
        scored.push(withId);
        addLeads([withId]);
      }

      return NextResponse.json({ success: true, leads: scored, count: scored.length });
    }

    if (action === "generate-dataset") {
      const { count = 10, platform: targetPlatform = "" } = params || {};
      const platforms = ["Instagram", "TikTok", "Facebook", "Twitter", "LinkedIn"];
      const names = ["Alice Wonder", "Bob Smith", "Carol Davis", "David Lee", "Eva Martinez", "Frank Wilson", "Grace Kim", "Henry Taylor", "Iris Chen", "Jack Brown"];
      const signals = ["added to cart", "viewed details", "saved to wishlist", "requested restock", "asked sizing", "commented on post", "shared product", "clicked link", "sent message", "made purchase"];
      const urgencies = ["high", "medium", "low"];

      const dataset = [];
      for (let i = 0; i < count; i++) {
        const platform = targetPlatform || platforms[Math.floor(Math.random() * platforms.length)];
        const signalCount = 1 + Math.floor(Math.random() * 3);
        const selectedSignals = [];
        for (let j = 0; j < signalCount; j++) {
          selectedSignals.push(signals[Math.floor(Math.random() * signals.length)]);
        }

        dataset.push({
          name: names[i % names.length],
          email: `${names[i % names.length].toLowerCase().replace(" ", ".")}@example.com`,
          platform,
          signals: selectedSignals.join("; "),
          urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        });
      }

      return NextResponse.json({ success: true, dataset, count: dataset.length });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
