import { NextRequest, NextResponse } from "next/server";
import { parseFile, autoMapColumns, getLLMAssistedMapping, normalizeRows, ColumnMapping } from "@/lib/normalizer";
import { scoreBatchLeads } from "@/lib/scoring";
import { addLeads, generateId } from "@/store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mappingRaw = formData.get("mapping") as string | null;
    const force = formData.get("force") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawRows = await parseFile(buffer, file.name);

    if (rawRows.length === 0) {
      return NextResponse.json({ error: "The uploaded file is empty" }, { status: 400 });
    }

    const headers = Object.keys(rawRows[0]);
    let activeMapping: ColumnMapping | null = null;

    if (mappingRaw) {
      try {
        activeMapping = JSON.parse(mappingRaw);
      } catch {
        return NextResponse.json({ error: "Invalid column mapping format" }, { status: 400 });
      }
    }

    if (!activeMapping) {
      const autoMap = autoMapColumns(headers);
      if (autoMap) {
        activeMapping = autoMap;
      } else {
        const suggestedMapping = await getLLMAssistedMapping(headers);

        if (force !== "true") {
          return NextResponse.json({
            mappingRequired: true,
            headers,
            suggestedMapping
          });
        }
        activeMapping = suggestedMapping;
      }
    }

    const normalized = normalizeRows(rawRows, activeMapping!);
    const scored = await scoreBatchLeads(normalized);

    const processedLeads = scored.map(lead => ({
      ...lead,
      id: generateId()
    }));

    addLeads(processedLeads);

    return NextResponse.json({
      success: true,
      mappingUsed: activeMapping,
      leads: processedLeads
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
