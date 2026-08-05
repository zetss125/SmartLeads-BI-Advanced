import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createAPIKey, getUserAPIKeys } from "@/lib/apiKeys";
import { APIScope } from "@/types";

// Helper to extract user ID from JWT cookie
function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = getUserAPIKeys(userId);
    return NextResponse.json({ data: keys });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, scopes } = body;

    if (!name || typeof name !== "string" || name.length < 1) {
      return NextResponse.json({ error: "Invalid key name" }, { status: 400 });
    }

    if (!Array.isArray(scopes) || scopes.length === 0) {
      return NextResponse.json({ error: "At least one scope is required" }, { status: 400 });
    }

    const { key, token } = createAPIKey(userId, name, scopes as APIScope[]);

    return NextResponse.json(
      { 
        message: "API key created successfully",
        data: { 
          key, // Does not contain the unhashed token
          token // ONLY return this once!
        } 
      }, 
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
