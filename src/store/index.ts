import {
  LeadApproval,
  LiveEvent,
  LiveHistoryPoint,
  NormalizedLead,
  SocialComment,
  SocialPost,
} from "@/types";

let inMemoryLeads: NormalizedLead[] = [];
let inMemoryApprovals: LeadApproval[] = [];
let liveEvents: LiveEvent[] = [];
let liveHistory: LiveHistoryPoint[] = [];
let socialPosts: SocialPost[] = [];

const CUSTOMER_BASE = 24;

export function getLeads(): NormalizedLead[] {
  return [...inMemoryLeads];
}

export function setLeads(leads: NormalizedLead[]): void {
  inMemoryLeads = leads;
}

export function addLeads(leads: NormalizedLead[]): void {
  inMemoryLeads = [...leads, ...inMemoryLeads];
}

export function addLead(lead: NormalizedLead): void {
  addLeads([lead]);
}

export function deleteLead(id: string): boolean {
  const initialLength = inMemoryLeads.length;
  inMemoryLeads = inMemoryLeads.filter(l => l.id !== id);
  return inMemoryLeads.length !== initialLength;
}

export function updateLeadContacted(id: string, contacted: boolean): NormalizedLead | null {
  const lead = inMemoryLeads.find(l => l.id === id);
  if (!lead) return null;
  lead.contacted = contacted;
  return { ...lead };
}

export function updateLeadsContacted(ids: string[], contacted: boolean): void {
  inMemoryLeads.forEach(l => {
    if (l.id && ids.includes(l.id)) {
      l.contacted = contacted;
    }
  });
}

export function generateId(): string {
  return "lead_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
}

export function getCustomerCount(): number {
  const contacted = inMemoryLeads.filter((l) => l.contacted).length;
  const approved = inMemoryApprovals.filter((a) => a.status === "Approved").length;
  return CUSTOMER_BASE + contacted + approved;
}

export function getApprovals(): LeadApproval[] {
  return [...inMemoryApprovals];
}

export function addApproval(approval: LeadApproval): void {
  inMemoryApprovals = [approval, ...inMemoryApprovals];
}

export function getLiveEvents(): LiveEvent[] {
  return [...liveEvents];
}

export function recordLiveEvent(event: Omit<LiveEvent, "id" | "timestamp"> & { timestamp?: string }): LiveEvent {
  const saved: LiveEvent = {
    id: "event_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36),
    timestamp: event.timestamp || new Date().toISOString(),
    type: event.type,
    title: event.title,
    description: event.description,
  };
  liveEvents = [saved, ...liveEvents].slice(0, 40);
  return saved;
}

export function getLiveHistory(): LiveHistoryPoint[] {
  return [...liveHistory];
}

export function recordHistoryPoint(): LiveHistoryPoint {
  const point: LiveHistoryPoint = {
    timestamp: new Date().toISOString(),
    totalLeads: inMemoryLeads.length,
    customers: getCustomerCount(),
    approvals: inMemoryApprovals.length,
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

export function getSocialPosts(): SocialPost[] {
  seedSocialPosts();
  return socialPosts.map((post) => ({
    ...post,
    comments: [...post.comments],
  }));
}

export function addSocialComment(postId: string, comment: SocialComment): SocialPost | null {
  seedSocialPosts();
  const post = socialPosts.find((p) => p.id === postId);
  if (!post) return null;

  post.comments = [...post.comments, comment];
  post.likes += 3 + Math.floor(Math.random() * 8);
  return {
    ...post,
    comments: [...post.comments],
  };
}

function seedSocialPosts(): void {
  if (socialPosts.length > 0) return;

  socialPosts = [
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
}
