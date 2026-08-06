import { NextRequest, NextResponse } from "next/server";
import { getApprovals } from "@/store";
import { submitApprovalRequest } from "@/lib/liveSimulation";
import { enforceAuth } from "@/lib/authGuard";

export async function GET(req: NextRequest) {
  const auth = enforceAuth(req, "analytics:read");
  if (auth.error) return auth.error;
  const response = NextResponse.json({ approvals: getApprovals() });
  Object.entries(auth.headers || {}).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const auth = enforceAuth(req, "leads:write");
    if (auth.error) return auth.error;
    const body = await req.json();
    const required = ["name", "email", "platform", "source", "campaign"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    if (!body.consentPersonalInfo || !body.consentSocialAnalytics) {
      return NextResponse.json({ error: "Both consent checkboxes are required" }, { status: 400 });
    }

    const approval = await submitApprovalRequest({
      name: body.name,
      email: body.email,
      platform: body.platform,
      source: body.source,
      campaign: body.campaign,
      consentPersonalInfo: !!body.consentPersonalInfo,
      consentSocialAnalytics: !!body.consentSocialAnalytics,
    });

    return NextResponse.json({ success: true, approval });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
