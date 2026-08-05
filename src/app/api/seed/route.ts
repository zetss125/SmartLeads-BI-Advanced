import { NextResponse } from "next/server";
import { ensureDemoData } from "@/lib/seedData";

export async function POST() {
  try {
    await ensureDemoData();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
