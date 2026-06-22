import { NextRequest, NextResponse } from "next/server";
import { processChatQuery } from "@/lib/chatbot";
import { getLeads, updateLeadsContacted } from "@/store";
import { NormalizedLead } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { query, leads, history } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing required parameter: query" }, { status: 400 });
    }

    let activeLeads = Array.isArray(leads) ? leads : getLeads();
    const result = await processChatQuery(query, activeLeads, history || []);

    if (result.actions) {
      for (const action of result.actions) {
        if (action.type === "UPDATE_STATUS" && action.payload?.ids) {
          const idsToUpdate: string[] = action.payload.ids;
          const contactedStatus: boolean = !!action.payload.contacted;
          updateLeadsContacted(idsToUpdate, contactedStatus);
        }
        if (action.type === "FILTER" && action.payload) {
          const { field, operator, value } = action.payload;
          if (field && operator && value !== undefined) {
            activeLeads = activeLeads.filter((l: any) => {
              const fieldVal = l[field];
              if (fieldVal === undefined) return false;
              if (operator === "gt") return Number(fieldVal) > Number(value);
              if (operator === "lt") return Number(fieldVal) < Number(value);
              if (operator === "eq") return String(fieldVal).toLowerCase() === String(value).toLowerCase();
              if (operator === "contains") return String(fieldVal).toLowerCase().includes(String(value).toLowerCase());
              return true;
            });
            const count = activeLeads.length;
            result.message += ` Found ${count} matching lead${count !== 1 ? "s" : ""}.`;
          }
        }
        if (action.type === "RESET_FILTERS") {
          activeLeads = getLeads();
          result.message += " Showing all leads.";
        }
      }
    }

    return NextResponse.json({ ...result, filteredLeads: activeLeads });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
