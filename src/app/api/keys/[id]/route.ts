import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { revokeAPIKey, updateAPIKey } from "@/lib/apiKeys";

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const success = revokeAPIKey(id, userId);

    if (!success) {
      return NextResponse.json({ error: "Key not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "API key revoked successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    // Only allow updating name, scopes, or rateLimit
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.scopes !== undefined) updates.scopes = body.scopes;
    if (body.rateLimit !== undefined) updates.rateLimit = body.rateLimit;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedKey = updateAPIKey(id, userId, updates);

    if (!updatedKey) {
      return NextResponse.json({ error: "Key not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "API key updated successfully",
      data: updatedKey
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
  }
}
