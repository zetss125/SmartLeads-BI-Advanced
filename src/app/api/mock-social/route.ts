import { NextRequest, NextResponse } from "next/server";
import { addSocialComment, getSocialPosts } from "@/store";
import { createAndStoreLead } from "@/lib/liveSimulation";
import { enforceAuth } from "@/lib/authGuard";

function detectSignals(text: string): string[] {
  const lower = text.toLowerCase();
  const signals = ["commented on marketed post"];

  if (lower.includes("restock")) signals.push("restock request");
  if (lower.includes("size") || lower.includes("fit")) signals.push("asked about sizing");
  if (lower.includes("link") || lower.includes("send")) signals.push("clicked link");
  if (lower.includes("buy") || lower.includes("cart")) signals.push("added to cart");

  return signals;
}

export async function GET(req: NextRequest) {
  const auth = enforceAuth(req, "social:read");
  if (auth.error) return auth.error;
  const response = NextResponse.json({ posts: getSocialPosts() });
  Object.entries(auth.headers || {}).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const auth = enforceAuth(req, "social:write");
    if (auth.error) return auth.error;
    const { postId, user, email, text } = await req.json();

    if (!postId || !user || !text) {
      return NextResponse.json({ error: "postId, user, and text are required" }, { status: 400 });
    }

    const post = getSocialPosts().find((p) => p.id === postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const signals = detectSignals(text);
    const urgency = signals.some((s) => s.includes("restock") || s.includes("cart")) ? "high" : "medium";
    const lead = await createAndStoreLead(
      {
        name: user,
        email: email || `${user.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@social.example`,
        phone: "",
        platform: post.platform,
        signals,
        urgency,
        date: new Date().toISOString(),
        behavioralSentence: `${signals.join("; ")}; ${post.campaign}; ${
          urgency === "high" ? "HIGH urgency" : "Medium urgency"
        }`,
      },
      `${user} replied to the ${post.campaign} social post and was added as a lead.`
    );

    const comment = {
      id: "comment_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36),
      user,
      text,
      timestamp: new Date().toISOString(),
      convertedLeadId: lead.id,
    };
    const updatedPost = addSocialComment(postId, comment);

    return NextResponse.json({ success: true, post: updatedPost, lead });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
