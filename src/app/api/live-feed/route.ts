import { NextResponse } from "next/server";
import { getLiveSnapshot } from "@/lib/liveSimulation";

export async function GET() {
  try {
    const snapshot = await getLiveSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
