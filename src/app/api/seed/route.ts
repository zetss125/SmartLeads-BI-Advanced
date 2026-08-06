import { NextRequest, NextResponse } from "next/server";
import { ensureDemoData } from "@/lib/seedData";
import { enforceAuth } from "@/lib/authGuard";

export async function POST(req: NextRequest) {
  const auth = enforceAuth(req, "admin:full");
  if (auth.error) return auth.error;

  try {
    await ensureDemoData();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
