// ─── Core Lead Types ───────────────────────────────────────────────

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
  scoreBreakdown?: FactorScore[];
  confidenceLevel?: number;
  trendLine?: "accelerating" | "steady" | "decelerating";
  recommendedAction?: string;
  consentStatus?: ConsentRecord;
  encryptedFields?: string[];   // List of field names that are encrypted
}

// ─── 10-Factor Scoring Model ──────────────────────────────────────

export interface FactorScore {
  dimension: string;
  label: string;
  rawValue: number;        // 0-100 raw signal strength
  weight: number;          // Factor weight (negative for resistance factors)
  contribution: number;    // rawValue * weight = contribution to final score
  evidence: string[];      // What data points contributed to this factor
  trend: "rising" | "stable" | "declining";
}

export interface ScoringResult {
  finalScore: number;
  priority: "High" | "Medium" | "Low";
  factors: FactorScore[];
  trendLine: "accelerating" | "steady" | "decelerating";
  recommendedAction: string;
  confidenceLevel: number;  // 0-1 based on data completeness
}

// ─── Real-Time Events ─────────────────────────────────────────────

export type SmartLeadsEventType =
  | "lead.created"
  | "lead.scored"
  | "lead.urgent_alert"
  | "social.comment_converted"
  | "approval.status_changed"
  | "system.info";

export interface SmartLeadsEvent {
  id: string;
  type: SmartLeadsEventType;
  payload: Record<string, unknown>;
  timestamp: string;
  urgency: "critical" | "high" | "normal";
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

// ─── Approvals ────────────────────────────────────────────────────

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

// ─── Social Media ─────────────────────────────────────────────────

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

// ─── Social Pipeline ──────────────────────────────────────────────

export type PipelineDecision = "pass" | "filter_out" | "flag_review";

export interface PipelineStageResult {
  stageName: string;
  stageIndex: number;
  decision: PipelineDecision;
  reason: string;
  confidence: number;
  processingTimeMs: number;
}

export interface SocialInteraction {
  id: string;
  platform: string;
  user: string;
  text: string;
  postId: string;
  campaign: string;
  timestamp: string;
  pipelineResults?: PipelineStageResult[];
  finalDecision?: PipelineDecision;
  convertedLeadId?: string;
  intentSignals?: string[];
  sentimentScore?: number;
}

// ─── Column Mapping ───────────────────────────────────────────────

export interface ColumnMapping {
  name: string;
  email: string;
  phone: string;
  platform: string;
  signals: string;
  urgency: string;
  date: string;
}

// ─── AI Chat ──────────────────────────────────────────────────────

export interface ChatAction {
  type: "FILTER" | "UPDATE_STATUS" | "RESET_FILTERS" | "NONE";
  payload?: any;
}

export interface ChatResponse {
  message: string;
  actions: ChatAction[];
}

// ─── Marketing ────────────────────────────────────────────────────

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

// ─── Users & Auth ─────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

// ─── API Keys ─────────────────────────────────────────────────────

export type APIScope =
  | "leads:read"
  | "leads:write"
  | "leads:delete"
  | "scoring:run"
  | "social:read"
  | "social:write"
  | "marketing:generate"
  | "chat:query"
  | "analytics:read"
  | "admin:full";

export interface APIKey {
  id: string;
  name: string;
  hashedKey: string;
  prefix: string;          // First 8 chars for display identification
  userId: string;
  scopes: APIScope[];
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  rateLimit: number;       // Requests per minute
  active: boolean;
  requestCount: number;
}

// ─── Consent & Privacy ────────────────────────────────────────────

export interface ConsentRecord {
  leadId: string;
  personalDataConsent: boolean;
  socialAnalyticsConsent: boolean;
  marketingConsent: boolean;
  consentTimestamp: string;
  consentSource: "approval_form" | "api" | "csv_import" | "manual";
  retentionDays: number;
  scheduledDeletion?: string;
}

// ─── Audit Trail ──────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: "create" | "read" | "update" | "delete" | "export" | "api_access" | "login" | "key_created" | "key_revoked";
  resource: string;
  details: string;
}

// ─── Rate Limiting ────────────────────────────────────────────────

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
}
