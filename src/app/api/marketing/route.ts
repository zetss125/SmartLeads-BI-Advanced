import { NextRequest, NextResponse } from "next/server";
import { generateMarketingStrategy } from "@/lib/marketing";
import { getLeads } from "@/store";
import { enforceAuth } from "@/lib/authGuard";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const auth = enforceAuth(req, "marketing:generate");
    if (auth.error) return auth.error;
    const { leads, assignTasks } = await req.json();
    const activeLeads = Array.isArray(leads) ? leads : getLeads();
    const result = await generateMarketingStrategy(activeLeads, assignTasks !== false);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
