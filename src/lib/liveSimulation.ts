import { scoreLead } from "@/lib/scoring";
import {
  addApproval,
  addLead,
  generateId,
  getApprovals,
  getCustomerCount,
  getLeads,
  getLiveEvents,
  getLiveHistory,
  recordHistoryPoint,
  recordLiveEvent,
} from "@/store";
import { LeadApproval, NormalizedLead } from "@/types";

let lastAutoLeadAt = 0;
let demoLeadIndex = 0;

const demoNames = [
  "Ava Morgan",
  "Noah Brooks",
  "Layla Chen",
  "Ethan Rivera",
  "Mia Hassan",
  "Leo Carter",
  "Nora Patel",
  "Sam Wilson",
  "Iris Young",
  "Adam Stone",
];

const demoPlatforms = ["Instagram", "TikTok", "Facebook", "LinkedIn", "Twitter"];

const demoSignals = [
  ["added to cart", "asked about sizing"],
  ["restock request", "saved to wishlist"],
  ["clicked link", "sent message"],
  ["viewed details", "commented on post"],
  ["checkout question", "high urgency"],
  ["wishlist save", "fit question"],
];

function buildDemoLead(source = "Live web activity"): NormalizedLead {
  const index = demoLeadIndex++;
  const name = demoNames[index % demoNames.length];
  const platform = demoPlatforms[index % demoPlatforms.length];
  const signals = demoSignals[index % demoSignals.length];
  const urgency = signals.some((s) => s.includes("high") || s.includes("cart") || s.includes("restock"))
    ? "high"
    : index % 4 === 0
      ? "low"
      : "medium";

  const behavioralSentence = `${signals.join("; ")}; ${
    urgency === "high" ? "HIGH urgency" : urgency === "low" ? "Low urgency" : "Medium urgency"
  }; ${source}`;

  return {
    id: generateId(),
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    phone: "",
    platform,
    signals,
    urgency,
    date: new Date().toISOString(),
    behavioralSentence,
    contacted: false,
  };
}

export async function createAndStoreLead(input?: Partial<NormalizedLead>, eventDescription?: string): Promise<NormalizedLead> {
  const draft = {
    ...buildDemoLead(input?.behavioralSentence || "Live web activity"),
    ...input,
    id: input?.id || generateId(),
    contacted: input?.contacted ?? false,
  };
  const scored = await scoreLead(draft);
  addLead(scored);
  recordLiveEvent({
    type: eventDescription?.toLowerCase().includes("social") ? "social" : "lead",
    title: "New live lead captured",
    description: eventDescription || `${scored.name} entered from ${scored.platform} with ${scored.priority} priority.`,
  });
  recordHistoryPoint();
  return scored;
}

export async function advanceLiveSimulation(): Promise<void> {
  const now = Date.now();
  const leads = getLeads();

  if (leads.length === 0) {
    await createAndStoreLead(undefined, "Seeded the first live lead for the dashboard demo.");
    lastAutoLeadAt = now;
    return;
  }

  if (!lastAutoLeadAt) {
    lastAutoLeadAt = now;
    recordHistoryPoint();
    return;
  }

  const elapsed = now - lastAutoLeadAt;
  if (elapsed < 7000) {
    recordHistoryPoint();
    return;
  }

  const count = Math.min(2, Math.floor(elapsed / 7000));
  for (let i = 0; i < count; i++) {
    await createAndStoreLead(undefined, "A shopper interacted with a live campaign and became a scored lead.");
  }
  lastAutoLeadAt = now;
}

export async function submitApprovalRequest(data: {
  name: string;
  email: string;
  platform: string;
  source: string;
  campaign: string;
  consentPersonalInfo: boolean;
  consentSocialAnalytics: boolean;
}): Promise<LeadApproval> {
  const lead = await createAndStoreLead(
    {
      name: data.name,
      email: data.email,
      platform: data.platform,
      signals: ["submitted approval form", "clicked email request", "high urgency"],
      urgency: "high",
      date: new Date().toISOString(),
      behavioralSentence: `clicked email request; submitted approval form; ${data.campaign}; HIGH urgency`,
    },
    `${data.name} approved personal information sharing from the email request flow.`
  );

  const now = new Date().toISOString();
  const approval: LeadApproval = {
    id: "approval_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36),
    leadId: lead.id,
    name: data.name,
    email: data.email,
    platform: data.platform,
    source: data.source,
    campaign: data.campaign,
    requestDate: now,
    submittedAt: now,
    status: "Approved",
    consentPersonalInfo: data.consentPersonalInfo,
    consentSocialAnalytics: data.consentSocialAnalytics,
    requestContent: `Email request sent to ${data.email} asking approval to share personal information for ${data.campaign}.`,
    confirmationContent: `Confirmation email sent to ${data.email}: personal information and social analytics approval received.`,
  };

  addApproval(approval);
  recordLiveEvent({
    type: "approval",
    title: "Approval request submitted",
    description: `${approval.name} approved data sharing for ${approval.campaign}.`,
  });
  recordHistoryPoint();
  return approval;
}

export async function getLiveSnapshot() {
  await advanceLiveSimulation();
  const leads = getLeads();
  const high = leads.filter((l) => l.priority === "High").length;
  const medium = leads.filter((l) => l.priority === "Medium").length;
  const low = leads.filter((l) => l.priority === "Low").length;

  return {
    stats: {
      total: leads.length,
      high,
      medium,
      low,
      customers: getCustomerCount(),
      approvals: getApprovals().length,
    },
    recentLeads: leads.slice(0, 6),
    approvals: getApprovals(),
    events: getLiveEvents(),
    history: getLiveHistory(),
  };
}
