export interface NormalizedLead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  platform: string;
  signals: string[];
  urgency: string;
  date: string;
  behavioralSentence: string;
  score?: number;
  priority?: "High" | "Medium" | "Low";
  contacted?: boolean;
}

export interface LiveEvent {
  id: string;
  type: "lead" | "approval" | "social";
  title: string;
  description: string;
  timestamp: string;
}

export interface LiveHistoryPoint {
  timestamp: string;
  totalLeads: number;
  customers: number;
  approvals: number;
}

export interface LeadApproval {
  id: string;
  leadId?: string;
  name: string;
  email: string;
  platform: string;
  source: string;
  campaign: string;
  requestDate: string;
  submittedAt: string;
  status: "Pending" | "Approved";
  consentPersonalInfo: boolean;
  consentSocialAnalytics: boolean;
  requestContent: string;
  confirmationContent: string;
}

export interface SocialComment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  convertedLeadId?: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  brand: string;
  imageUrl: string;
  caption: string;
  campaign: string;
  postedAt: string;
  likes: number;
  comments: SocialComment[];
}

export interface ColumnMapping {
  name: string;
  email: string;
  phone: string;
  platform: string;
  signals: string;
  urgency: string;
  date: string;
}

export interface ChatAction {
  type: "FILTER" | "UPDATE_STATUS" | "RESET_FILTERS" | "NONE";
  payload?: any;
}

export interface ChatResponse {
  message: string;
  actions: ChatAction[];
}

export interface MarketingTask {
  id: string;
  assignee: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export interface MarketingStrategyResponse {
  strategy: string;
  tasks: MarketingTask[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}
