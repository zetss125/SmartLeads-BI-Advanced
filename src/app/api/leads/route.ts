import { NextRequest, NextResponse } from "next/server";
import { getLeads, deleteLead, updateLeadContacted } from "@/store";

export async function GET(req: NextRequest) {
  try {
    let filtered = getLeads();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const platform = searchParams.get("platform");
    const priority = searchParams.get("priority");
    const contacted = searchParams.get("contacted");

    if (name) {
      filtered = filtered.filter(l => l.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (platform) {
      filtered = filtered.filter(l => l.platform.toLowerCase() === platform.toLowerCase());
    }
    if (priority) {
      filtered = filtered.filter(l => l.priority?.toLowerCase() === priority.toLowerCase());
    }
    if (contacted !== null) {
      const isContacted = contacted === "true";
      filtered = filtered.filter(l => l.contacted === isContacted);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const deleted = deleteLead(id);
    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Lead ${id} deleted successfully` });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, contacted } = await req.json();

    if (!id || contacted === undefined) {
      return NextResponse.json({ error: "Lead ID and contacted status are required" }, { status: 400 });
    }

    const updated = updateLeadContacted(id, contacted);
    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
