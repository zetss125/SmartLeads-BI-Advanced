import {
  LeadApproval,
  LiveEvent,
  LiveHistoryPoint,
  NormalizedLead,
  SocialComment,
  SocialPost,
  AuditEntry,
} from "@/types";
import {
  getLeadsStore,
  getApprovalsStore,
  getEventsStore,
  getSocialStore,
  getAuditStore,
} from "@/lib/persistentStore";
import { generateId } from "@/lib/encryption";

// ─── Live History (kept in-memory as it's ephemeral chart data) ───
let liveHistory: LiveHistoryPoint[] = [];

const CUSTOMER_BASE = 24;

// ─── Leads ────────────────────────────────────────────────────────

export function getLeads(): NormalizedLead[] {
  return getLeadsStore().getAll();
}

export function setLeads(leads: NormalizedLead[]): void {
  getLeadsStore().set(leads);
}

export function addLeads(leads: NormalizedLead[]): void {
  getLeadsStore().addMany(leads);
}

export function addLead(lead: NormalizedLead): void {
  getLeadsStore().add(lead);
}

export function deleteLead(id: string): boolean {
  return getLeadsStore().delete(id);
}

export function updateLeadContacted(id: string, contacted: boolean): NormalizedLead | null {
  return getLeadsStore().update(id, { contacted });
}

export function updateLeadsContacted(ids: string[], contacted: boolean): void {
  getLeadsStore().updateMany(ids, { contacted });
}

export { generateId };

export function getCustomerCount(): number {
  const contacted = getLeadsStore().filter((l: NormalizedLead) => l.contacted === true).length;
  const approved = getApprovalsStore().filter((a: LeadApproval) => a.status === "Approved").length;
  return CUSTOMER_BASE + contacted + approved;
}

// ─── Approvals ────────────────────────────────────────────────────

export function getApprovals(): LeadApproval[] {
  return getApprovalsStore().getAll();
}

export function addApproval(approval: LeadApproval): void {
  getApprovalsStore().add(approval);
}

// ─── Live Events ──────────────────────────────────────────────────

export function getLiveEvents(): LiveEvent[] {
  return getEventsStore().getAll();
}

export function recordLiveEvent(event: Omit<LiveEvent, "id" | "timestamp"> & { timestamp?: string }): LiveEvent {
  const saved: LiveEvent = {
    id: generateId("event"),
    timestamp: event.timestamp || new Date().toISOString(),
    type: event.type,
    title: event.title,
    description: event.description,
  };
  getEventsStore().add(saved);
  getEventsStore().trim(40);
  return saved;
}

// ─── Live History ─────────────────────────────────────────────────

export function getLiveHistory(): LiveHistoryPoint[] {
  return [...liveHistory];
}

export function recordHistoryPoint(): LiveHistoryPoint {
  const point: LiveHistoryPoint = {
    timestamp: new Date().toISOString(),
    totalLeads: getLeadsStore().count(),
    customers: getCustomerCount(),
    approvals: getApprovalsStore().count(),
  };

  const previous = liveHistory[liveHistory.length - 1];
  if (
    previous &&
    previous.totalLeads === point.totalLeads &&
    previous.customers === point.customers &&
    previous.approvals === point.approvals
  ) {
    liveHistory[liveHistory.length - 1] = point;
  } else {
    liveHistory = [...liveHistory, point].slice(-24);
  }

  return point;
}

// ─── Social Posts ─────────────────────────────────────────────────

export function getSocialPosts(): SocialPost[] {
  seedSocialPosts();
  const store = getSocialStore();
  return store.getAll().map((post: SocialPost) => ({
    ...post,
    comments: [...post.comments],
  }));
}

export function addSocialComment(postId: string, comment: SocialComment): SocialPost | null {
  seedSocialPosts();
  const store = getSocialStore();
  const post = store.getById(postId) as SocialPost | undefined;
  if (!post) return null;

  const updatedComments = [...post.comments, comment];
  const updatedLikes = post.likes + 3 + Math.floor(Math.random() * 8);
  store.update(postId, { comments: updatedComments, likes: updatedLikes });

  return {
    ...post,
    comments: updatedComments,
    likes: updatedLikes,
  };
}

function seedSocialPosts(): void {
  const store = getSocialStore();
  if (store.count() > 0) return;

  const posts: SocialPost[] = [
    {
      id: "post_denim_drop",
      platform: "Instagram",
      brand: "SmartLeads Retail",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      caption: "New denim arrivals are live. Comment your size and we will send the best fit guide.",
      campaign: "Spring Denim Retargeting",
      postedAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
      likes: 842,
      comments: [
        {
          id: "comment_seed_1",
          user: "maya_style",
          text: "Can you send the size chart for the relaxed jacket?",
          timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
        },
      ],
    },
    {
      id: "post_sneaker_restock",
      platform: "TikTok",
      brand: "SmartLeads Retail",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      caption: "The limited sneaker restock opens today. Reply RESTOCK if you want the link first.",
      campaign: "Limited Sneaker Restock",
      postedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      likes: 1360,
      comments: [
        {
          id: "comment_seed_2",
          user: "runclub_omar",
          text: "RESTOCK size 10 please",
          timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
        },
      ],
    },
    {
      id: "post_weekend_bag",
      platform: "Facebook",
      brand: "SmartLeads Retail",
      imageUrl: "https://images.unsplash.com/photo-1542295669297-4d352b042bca?auto=format&fit=crop&w=900&q=80",
      caption: "Weekend travel bags are back. Ask a question below and our team will follow up.",
      campaign: "Weekend Travel Bag Launch",
      postedAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
      likes: 516,
      comments: [],
    },
  ];

  posts.forEach((p) => store.add(p));
}

// ─── Audit Trail ──────────────────────────────────────────────────

export function recordAudit(entry: Omit<AuditEntry, "id" | "timestamp">): void {
  const auditEntry: AuditEntry = {
    id: generateId("audit"),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  getAuditStore().add(auditEntry);
  getAuditStore().trim(500); // Keep last 500 audit entries
}

export function getAuditLog(): AuditEntry[] {
  return getAuditStore().getAll();
}
