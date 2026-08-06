import { NextRequest, NextResponse } from "next/server";
import { getLiveSnapshot } from "@/lib/liveSimulation";
import { enforceAuth } from "@/lib/authGuard";

export async function GET(req: NextRequest) {
  const auth = enforceAuth(req, "analytics:read");
  if (auth.error) return auth.error;
  try {
    const snapshot = await getLiveSnapshot();
    const response = NextResponse.json(snapshot);
    Object.entries(auth.headers || {}).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
