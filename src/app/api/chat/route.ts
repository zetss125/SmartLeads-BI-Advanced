import { NextRequest, NextResponse } from "next/server";
import { processChatQuery } from "@/lib/chatbot";
import { getLeads, updateLeadsContacted } from "@/store";
import { NormalizedLead } from "@/types";
import { enforceAuth } from "@/lib/authGuard";

const FILTER_FIELDS = new Set(["score", "priority", "urgency", "platform", "name", "date", "contacted"]);
const FILTER_OPERATORS = new Set(["gt", "lt", "eq", "contains"]);
const MAX_UPDATE_IDS = 100;

export async function POST(req: NextRequest) {
  try {
    const auth = enforceAuth(req, "chat:query");
    if (auth.error) return auth.error;

    const { query, leads, history } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing required parameter: query" }, { status: 400 });
    }

    let activeLeads = Array.isArray(leads) ? leads : getLeads();
    const result = await processChatQuery(query, activeLeads, history || []);

    if (result.actions) {
      const allLeads = getLeads();
      const validIds = new Set(allLeads.map((l: NormalizedLead) => l.id));

      for (const action of result.actions) {
        if (action.type === "UPDATE_STATUS") {
          const payload = action.payload || {};
          const contacted: boolean = payload.contacted === true;
          const ids: unknown = payload.ids;

          // Only trust IDs that actually exist in the store, and cap the count.
          if (Array.isArray(ids) && ids.length > 0) {
            const idsToUpdate = (ids as unknown[])
              .filter((id): id is string => typeof id === "string" && validIds.has(id))
              .slice(0, MAX_UPDATE_IDS);
            if (idsToUpdate.length > 0) {
              updateLeadsContacted(idsToUpdate, contacted);
            }
          }
        }
        if (action.type === "FILTER" && action.payload) {
          const { field, operator, value } = action.payload;
          if (
            typeof field === "string" &&
            FILTER_FIELDS.has(field) &&
            typeof operator === "string" &&
            FILTER_OPERATORS.has(operator) &&
            value !== undefined
          ) {
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

    const response = NextResponse.json({ ...result, filteredLeads: activeLeads });
    Object.entries(auth.headers || {}).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
