# SmartLeads BI — Production-Ready Upgrade Strategy

> Comprehensive implementation plan addressing all issues from [Group 4-comments.docx](file:///c:/SmartLeads-BI-advanced/Group%204-comments.docx), building a zero-bug test-user front page, and adding a GitHub/Jira-style CLI-accessible API key system.

---

## Professor's Issues — Summary & Mapping

The professor identified **7 critical areas** that need work. Every item below maps directly to a specific concern:

| # | Professor's Concern | Current Gap | Planned Fix |
|---|---|---|---|
| 1 | **Immediate follow-up** — "basket abandonment must be followed up immediately, not in hours/days" | No real-time event system; leads are uploaded and scored asynchronously with no urgency triggers | Real-time WebSocket event bus + instant alert triggers (Phase 1) |
| 2 | **Social media scanning** — "requires MASSIVE processing power, sophisticated filters" | Mock social page is purely cosmetic; no actual ingestion pipeline | Simulated social ingestion pipeline with filter/NLP pipeline demo (Phase 2) |
| 3 | **Rules-based scoring defeats ML/AI purpose** | `scoring.ts` behavioral boosts are hardcoded `if/else` rules on top of ONNX | Multi-factor scoring model with explained factor decomposition (Phase 3) |
| 4 | **Scoring model needs theoretical/data-science underpinning** | No documentation of what factors drive purchase; no transparency into score composition | Factor Decomposition Engine — 10-dimensional scoring with visual breakdown (Phase 3) |
| 5 | **SaaS / agent-based future** — "consider how your programme could be offered as a SaaS" | No multi-tenant architecture, no API, no programmatic access | Full API key system with CLI client, rate limiting, tenant isolation (Phase 5) |
| 6 | **Persistent memory / secure storage** — "without these, the product is non-viable" | In-memory arrays (`let inMemoryLeads: NormalizedLead[] = []`) wiped on restart | File-backed persistent store + encrypted PII fields (Phase 4) |
| 7 | **PII / data privacy** — "system will have to consider security and data privacy far more seriously" | No encryption, no consent tracking beyond approval form, no data retention policy | PII encryption layer, consent management, data retention controls (Phase 4) |

---

## Architecture Overview — Target State

```mermaid
graph TB
    subgraph "Client Layer"
        WEB["Web Dashboard<br/>(Next.js App Router)"]
        CLI["CLI Client<br/>(smartleads-cli)"]
        WEBHOOK["Webhook Consumers<br/>(External Systems)"]
    end

    subgraph "API Gateway"
        MW["Middleware Layer<br/>Auth + Rate Limit + API Key Validation"]
    end

    subgraph "Core Services"
        RT["Real-Time Event Bus<br/>(SSE / WebSocket)"]
        SCORE["Multi-Factor Scoring Engine<br/>(ONNX + Factor Decomposition)"]
        SOCIAL["Social Ingestion Pipeline<br/>(Filter → NLP → Score)"]
        AI["AI Services<br/>(Chat + Marketing + Column Mapping)"]
    end

    subgraph "Data Layer"
        STORE["Persistent JSON Store<br/>(File-backed, encrypted PII)"]
        KEYS["API Key Store<br/>(Hashed keys, scoped permissions)"]
        AUDIT["Audit Log"]
    end

    WEB --> MW
    CLI --> MW
    WEBHOOK --> MW
    MW --> RT
    MW --> SCORE
    MW --> SOCIAL
    MW --> AI
    RT --> STORE
    SCORE --> STORE
    SOCIAL --> STORE
    AI --> STORE
    MW --> KEYS
    MW --> AUDIT
```

---

## Phase 1: Real-Time Event Bus & Instant Follow-Up System

> **Addresses:** Issue #1 — "basket abandonment must be followed up immediately"

### Problem
The current system requires vendors to download → upload → wait for scoring. There is no mechanism to detect and alert on time-sensitive behavioral signals (cart abandonment, restock requests) in real-time.

### Solution

#### [NEW] [eventBus.ts](file:///c:/SmartLeads-BI-advanced/src/lib/eventBus.ts)
Server-side event bus that:
- Maintains a registry of SSE (Server-Sent Events) client connections
- Broadcasts events in real-time to all connected dashboard sessions
- Supports event types: `lead.created`, `lead.scored`, `lead.urgent_alert`, `social.comment_converted`, `approval.status_changed`

```typescript
// Core event types
type EventType = 
  | 'lead.created' 
  | 'lead.scored' 
  | 'lead.urgent_alert'   // Fires when a lead with cart-abandon/restock signals is detected
  | 'social.comment_converted'
  | 'approval.status_changed';

interface SmartLeadsEvent {
  id: string;
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: string;
  urgency: 'critical' | 'high' | 'normal';
}
```

#### [NEW] [src/app/api/events/route.ts](file:///c:/SmartLeads-BI-advanced/src/app/api/events/route.ts)
SSE endpoint (`GET /api/events`) that streams real-time events to the dashboard. Uses `ReadableStream` with Next.js App Router.

#### [MODIFY] [scoring.ts](file:///c:/SmartLeads-BI-advanced/src/lib/scoring.ts)
After scoring, if a lead has urgency signals (cart abandonment, restock request, sizing inquiry with high urgency), automatically emit a `lead.urgent_alert` event. The event includes:
- Lead ID and name
- Detected trigger (e.g., "Cart abandoned 12 minutes ago")
- Recommended action (e.g., "Send 10% discount email within 15 minutes")
- Countdown timer value

#### [NEW] Real-Time Alert Banner Component
A persistent banner at the top of the dashboard that:
- Shows a pulsing red/amber indicator when urgent leads are detected
- Displays: "⚡ 3 leads require immediate follow-up — cart abandoned < 30 min ago"
- Clicking expands to show each urgent lead with one-click action buttons: "Send Email", "Mark Contacted", "Dismiss"
- Auto-dismisses after the lead is actioned

#### [MODIFY] [page.tsx](file:///c:/SmartLeads-BI-advanced/src/app/page.tsx) (Dashboard)
- Connect to SSE endpoint on mount
- Display real-time alert banner
- Update stats counters live without polling (replace current `setInterval(fetchStats, 4000)`)

---

## Phase 2: Social Media Ingestion Pipeline

> **Addresses:** Issue #2 — "scanning social media requires MASSIVE processing, sophisticated filters, logic, AI"

### Problem
The current mock social page is cosmetic. The professor wants to see that the team understands the complexity of real social media ingestion, even if demonstrated at smaller scale.

### Solution

#### [NEW] [socialPipeline.ts](file:///c:/SmartLeads-BI-advanced/src/lib/socialPipeline.ts)
A demonstrated 4-stage social ingestion pipeline:

```
Stage 1: INGEST     → Receive social media comments/DMs (simulated feed)
Stage 2: FILTER     → Apply keyword filters, spam detection, language check
Stage 3: NLP/SCORE  → Extract intent signals (purchase intent, product interest, complaint)
Stage 4: CONVERT    → Create scored lead from qualifying social interaction
```

Each stage logs its processing decisions visibly in the UI so evaluators can see the pipeline in action:

```typescript
interface PipelineStage {
  name: string;
  input: SocialInteraction;
  decision: 'pass' | 'filter_out' | 'flag_review';
  reason: string;
  confidence: number;
  processingTimeMs: number;
}
```

#### [NEW] Social Pipeline Visualization Page
A new page `/social-pipeline` that shows:
- A live stream of simulated social media interactions arriving
- Each interaction flowing through the 4-stage pipeline with visual indicators
- Filtered-out interactions shown in a "rejected" column with reasons
- Qualifying interactions auto-creating leads with a smooth animation
- Processing metrics: throughput, conversion rate, false positive rate

#### Filter Rules (demonstrated subset of what production would require):
1. **Language filter** — Only process English-language comments
2. **Spam filter** — Detect bot patterns (repeated text, excessive links, emoji-only)
3. **Intent classifier** — Keyword + pattern matching for:
   - Purchase intent: "buy", "price", "how much", "where can I get", "in stock?"
   - Product interest: "size", "fit", "color", "when available"
   - Complaints: "broken", "refund", "terrible", "worst"
   - Restock demand: "restock", "sold out", "when back"
4. **Deduplication** — Same user commenting on same product within 24h = single lead
5. **Sentiment scoring** — Positive, neutral, negative classification affecting lead score

#### [MODIFY] [Layout.tsx](file:///c:/SmartLeads-BI-advanced/src/components/Layout.tsx)
Add "Social Pipeline" to sidebar navigation.

---

## Phase 3: Multi-Factor Scoring Model with Theoretical Underpinning

> **Addresses:** Issues #3, #4 — "Rules defeat ML purpose", "Scoring needs theoretical underpinning", "What are the 10/100 factors?"

### Problem
Current scoring is ONNX model output + hardcoded behavioral boosts (`if sentence includes 'cart'`). The professor explicitly asked: "What are the 10 factors that indicate imminent purchase? Price resistance? Quality resistance?"

### Solution — 10-Dimensional Factor Decomposition Model

#### The Theoretical Framework

Every lead is evaluated across **10 scientifically-grounded purchasing factor dimensions**:

| Dimension | Description | Data Source | Weight |
|---|---|---|---|
| **1. Purchase Intent** | Explicit buying signals (add to cart, checkout initiated, "buy now" clicks) | Behavioral data | 0.20 |
| **2. Product Engagement** | Page views, time on product pages, comparison behavior | Behavioral data | 0.15 |
| **3. Urgency Signals** | Time-sensitive behavior (restock requests, limited-edition interest, countdown page views) | Behavioral data | 0.12 |
| **4. Social Proof Seeking** | Reviews read, ratings checked, "most popular" filters used | Behavioral + social | 0.08 |
| **5. Price Sensitivity** | Coupon usage, sale page visits, price comparison behavior, cart abandonment at checkout | Behavioral data | -0.10 (resistance factor) |
| **6. Quality Resistance** | Return history, complaint signals, negative review authoring | Historical + social | -0.08 (resistance factor) |
| **7. Brand Affinity** | Repeat visits, newsletter signup, loyalty program, follow/like on social | Behavioral + social | 0.12 |
| **8. Recency** | How recently the interaction occurred (exponential decay: 1h = 1.0, 24h = 0.5, 7d = 0.1) | Timestamp | 0.10 |
| **9. Channel Strength** | Platform-specific conversion rates (Instagram DM > Facebook comment > Twitter mention) | Platform data | 0.08 |
| **10. Demographic Fit** | Age/location/interest alignment with product target audience | Profile data (where available) | 0.05 |

> **Key insight from professor:** "You cannot predict 'purchase'. You can only evaluate the factors contributing to, or against 'purchase' and determine the trend line."

#### [MODIFY] [scoring.ts](file:///c:/SmartLeads-BI-advanced/src/lib/scoring.ts)
Replace the flat `applyBehavioralBoosts` with `computeFactorScores`:

```typescript
interface FactorScore {
  dimension: string;
  rawValue: number;       // 0-100 raw signal strength
  weight: number;         // Factor weight (negative for resistance factors)
  contribution: number;   // rawValue * weight = contribution to final score
  evidence: string[];     // What data points contributed to this factor
  trend: 'rising' | 'stable' | 'declining';  // Direction over time
}

interface ScoringResult {
  finalScore: number;
  priority: 'High' | 'Medium' | 'Low';
  factors: FactorScore[];
  trendLine: 'accelerating' | 'steady' | 'decelerating';
  recommendedAction: string;
  confidenceLevel: number;  // 0-1 based on data completeness
}
```

The ONNX model provides the base embedding; the factor decomposition happens on top:
1. ONNX model processes the behavioral sentence → base score (contextual understanding)
2. Factor extraction parses signals, urgency, platform, recency into 10 dimensions
3. Each dimension gets a raw score, weighted contribution, and evidence chain
4. Resistance factors (price sensitivity, quality resistance) are subtracted
5. Final score = weighted sum, clamped 0-100
6. Confidence level reflects data completeness (more factors with data = higher confidence)

#### [NEW] Score Breakdown Component
On the lead detail card, show a **radar chart** of all 10 factors with:
- Visual breakdown of what drives the score up vs. down
- Color coding: green for positive factors, red for resistance factors
- Evidence trail: "Purchase Intent: 85 — based on: 'added to cart', 'viewed checkout page', 'saved payment method'"
- Trend arrows showing if each factor is improving or declining

#### [NEW] [src/types/index.ts](file:///c:/SmartLeads-BI-advanced/src/types/index.ts) additions
Add `FactorScore`, `ScoringResult`, and `ScoreBreakdown` interfaces.

---

## Phase 4: Persistent Storage, PII Encryption & Data Privacy

> **Addresses:** Issues #6, #7 — "persistent memory must be solved", "PII and data privacy far more seriously"

### Problem
All data lives in `let inMemoryLeads: NormalizedLead[] = []`. Server restart = total data loss. No encryption of PII (names, emails, phones). No consent management beyond the approval simulation.

### Solution

#### [MODIFY] [store/index.ts](file:///c:/SmartLeads-BI-advanced/src/store/index.ts) — File-Backed Persistent Store
Replace in-memory arrays with a file-backed JSON store:

```typescript
// Data directory: .smartleads-data/ (gitignored)
// Files:
//   leads.json      — Encrypted lead records
//   approvals.json  — Approval records
//   events.json     — Event log
//   social.json     — Social posts and comments
//   api-keys.json   — Hashed API keys
//   audit.json      — Audit trail

class PersistentStore<T> {
  private filePath: string;
  private cache: T[];
  
  constructor(filename: string) { ... }
  
  async load(): Promise<T[]> { /* Read from disk, decrypt PII fields */ }
  async save(): Promise<void> { /* Encrypt PII fields, write to disk */ }
  async add(item: T): Promise<void> { /* Add to cache + save */ }
  async update(id: string, patch: Partial<T>): Promise<void> { ... }
  async delete(id: string): Promise<boolean> { ... }
}
```

#### [NEW] [encryption.ts](file:///c:/SmartLeads-BI-advanced/src/lib/encryption.ts)
PII field encryption using Node.js `crypto`:

```typescript
// AES-256-GCM encryption for PII fields
// Key derived from JWT_SECRET via PBKDF2
// Fields encrypted: name, email, phone
// Fields NOT encrypted: id, score, priority, signals (non-PII analytics data)

export function encryptPII(data: string): string;
export function decryptPII(encrypted: string): string;
export function hashForSearch(data: string): string; // For searching encrypted fields
```

#### [NEW] Consent Management System
- Every lead record tracks consent status:
  ```typescript
  interface ConsentRecord {
    leadId: string;
    personalDataConsent: boolean;
    socialAnalyticsConsent: boolean;
    marketingConsent: boolean;
    consentTimestamp: string;
    consentSource: string;      // 'approval_form' | 'api' | 'csv_import'
    retentionDays: number;      // Default 90, configurable
    scheduledDeletion?: string;  // ISO date when data will be auto-purged
  }
  ```
- Data retention policy: Leads without consent auto-purge after configurable retention period
- "Right to Delete" API endpoint: `DELETE /api/leads/:id/data` — permanently removes all PII

#### [NEW] Audit Trail
Every data access and modification is logged:
```typescript
interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'api_access';
  resource: string;
  details: string;
  ipAddress?: string;
}
```

#### [MODIFY] [.gitignore](file:///c:/SmartLeads-BI-advanced/.gitignore)
Add `.smartleads-data/` to prevent data files from being committed.

---

## Phase 5: API Key System & CLI Client (SaaS Foundation)

> **Addresses:** Issue #5 — "consider how your programme could be offered as a SaaS, or as agent-based"

### Problem
No programmatic access exists. The professor wants to see the system architectured for SaaS delivery. Users currently can only interact through the web UI.

### Solution — Full API Key System with GitHub/Jira-style CLI

#### 5A: API Key Management

##### [NEW] [apiKeys.ts](file:///c:/SmartLeads-BI-advanced/src/lib/apiKeys.ts)
```typescript
interface APIKey {
  id: string;                    // slk_xxxxxxxxxxxx (SmartLeads Key prefix)
  name: string;                  // User-defined label
  hashedKey: string;             // SHA-256 hash (never store plaintext)
  prefix: string;                // First 8 chars for identification
  userId: string;                // Owner
  scopes: APIScope[];            // Granular permissions
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;            // Optional expiration
  rateLimit: number;             // Requests per minute
  active: boolean;
}

type APIScope = 
  | 'leads:read' 
  | 'leads:write' 
  | 'leads:delete'
  | 'scoring:run'
  | 'social:read'
  | 'social:write'
  | 'marketing:generate'
  | 'chat:query'
  | 'analytics:read'
  | 'admin:full';
```

##### [NEW] API Key Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/keys` | Generate a new API key (returns plaintext ONCE) |
| `GET` | `/api/keys` | List all keys for current user (masked) |
| `DELETE` | `/api/keys/:id` | Revoke a key |
| `PATCH` | `/api/keys/:id` | Update key name, scopes, rate limit |

##### [MODIFY] [middleware.ts](file:///c:/SmartLeads-BI-advanced/src/middleware.ts)
Add API key authentication alongside JWT cookies:
```
Authorization: Bearer slk_xxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Check `Authorization` header first
- If present, validate against hashed key store
- Check scopes against requested endpoint
- Apply per-key rate limiting
- Falls through to cookie-based JWT auth if no API key header

##### [NEW] API Key Management UI Page (`/settings/api-keys`)
Settings page section where users can:
- Generate new keys with custom names and scope selection
- View existing keys (showing prefix + last 4 chars only, e.g., `slk_ab12...xyz9`)
- Copy key to clipboard (only on creation)
- Revoke keys with confirmation
- See usage stats per key (last used, request count)

#### 5B: CLI Client — `smartleads`

##### [NEW] `/cli/` directory
A standalone Node.js CLI tool that connects to the SmartLeads API:

```
smartleads-bi-advanced/
├── cli/
│   ├── package.json
│   ├── bin/
│   │   └── smartleads.js       # Entry point (#!/usr/bin/env node)
│   ├── src/
│   │   ├── index.ts            # Command router
│   │   ├── auth.ts             # API key storage (~/.smartleads/config.json)
│   │   ├── commands/
│   │   │   ├── auth.ts         # smartleads auth login / logout / status
│   │   │   ├── leads.ts        # smartleads leads list / get / score / export
│   │   │   ├── upload.ts       # smartleads upload <file>
│   │   │   ├── social.ts       # smartleads social list / convert
│   │   │   ├── marketing.ts    # smartleads marketing generate
│   │   │   ├── chat.ts         # smartleads chat "query string"
│   │   │   └── keys.ts         # smartleads keys list / create / revoke
│   │   ├── api.ts              # HTTP client wrapper
│   │   └── output.ts           # Table/JSON/color formatting
│   └── tsconfig.json
```

##### CLI Commands & Usage

```bash
# Authentication
smartleads auth login                    # Interactive: paste API key
smartleads auth login --key slk_xxx      # Direct key input
smartleads auth status                   # Show current auth state
smartleads auth logout                   # Remove stored key

# Lead Management
smartleads leads list                    # Table of all leads
smartleads leads list --priority high    # Filter by priority
smartleads leads list --format json      # JSON output for piping
smartleads leads get <lead-id>           # Detailed lead view with score breakdown
smartleads leads score <lead-id>         # Re-score a specific lead
smartleads leads export --format csv     # Export leads to CSV
smartleads leads delete <lead-id>        # Delete a lead

# Dataset Upload
smartleads upload ./customers.csv        # Upload and auto-score
smartleads upload ./data.xlsx --dry-run  # Preview mapping without saving

# Social Media
smartleads social list                   # List social posts
smartleads social convert <comment-id>   # Convert social comment to lead

# AI Features
smartleads chat "which leads should I contact first?"
smartleads marketing generate            # Generate marketing strategy

# API Key Management
smartleads keys list                     # List your API keys
smartleads keys create --name "CI/CD"    # Create new key
smartleads keys revoke <key-id>          # Revoke a key
```

##### CLI Output Formatting
- **Tables**: Colorized, aligned columns with priority color coding (green/amber/red)
- **JSON mode**: `--format json` flag on all commands for scripting/piping
- **Progress bars**: For upload and batch scoring operations
- **Interactive prompts**: For destructive operations (delete, revoke)

##### Configuration Storage
```
~/.smartleads/
├── config.json     # { "api_key": "slk_xxx", "server": "http://localhost:3000" }
└── .history        # Command history
```

#### 5C: Public API Documentation Page

##### [NEW] `/api-docs` page
A beautiful API documentation page accessible from the dashboard:
- All endpoints documented with method, URL, parameters, request/response bodies
- Code examples in `curl`, `JavaScript`, `Python`
- Interactive "Try it" buttons that execute requests with the user's API key
- Rate limit information and scope requirements per endpoint

---

## Phase 6: Test-User Front Page — Zero-Bug Autonomous Experience

> **Addresses:** The user request for a "front page where test-users have full autonomy with zero bugs"

### Design Philosophy
Test users should be able to experience the **entire platform end-to-end** without any setup, configuration, or encountering dead ends. Every button works. Every flow completes. Every error is handled gracefully.

### [NEW] Test User Dashboard (`/` after login with test account)

#### Pre-Seeded Demo Environment
When a test user registers or logs in, the system automatically:
1. **Seeds 25 realistic leads** across 5 platforms (Instagram, TikTok, Facebook, LinkedIn, Twitter/X)
2. **Pre-scores all leads** with the 10-factor decomposition model
3. **Seeds 5 social media posts** with active comment threads
4. **Seeds 3 approval records** (1 Pending, 1 Approved, 1 with full consent)
5. **Generates 1 marketing strategy** based on the seeded data
6. **Creates 1 API key** for immediate CLI testing

#### Guided Tour Overlay
On first login, a non-intrusive guided overlay highlights key features:
1. "📊 Your leads are already scored — click any card to see the factor breakdown"
2. "⚡ Watch the real-time alert banner for urgent leads"
3. "💬 Try the AI chatbot — ask 'which leads should I contact first?'"
4. "🔑 Your API key is ready in Settings — try the CLI"
5. "📤 Upload your own dataset to see live scoring"

Each step is dismissible, skippable, and never blocks interaction.

#### Zero-Bug Requirements Checklist
Every page must satisfy:

| Requirement | Implementation |
|---|---|
| **No empty states** | Pre-seeded data ensures every page has content |
| **No broken links** | All sidebar navigation targets exist and render |
| **No unhandled errors** | Every `fetch` has error boundary + user-friendly fallback |
| **No loading spinners > 2s** | SSE eliminates polling; data fetched on mount with optimistic UI |
| **No 500 errors** | All API routes wrapped in try-catch with structured error responses |
| **No auth dead-ends** | Middleware handles all redirect cases; expired tokens auto-redirect to login |
| **Accessible** | All interactive elements have ARIA labels; keyboard navigable |
| **Mobile responsive** | All pages tested at 375px, 768px, 1024px, 1440px breakpoints |

#### Fast Request Submission
For test users to send requests "fast and easy":

1. **Quick Actions Bar** (top of dashboard):
   - "Score New Lead" — inline form: name, email, platform, behavior → immediate score result
   - "Upload Dataset" — drag-drop zone right on dashboard (no navigation needed)
   - "Ask AI" — inline chat input that expands to full panel

2. **Keyboard Shortcuts**:
   - `Ctrl+K` — Command palette (search leads, navigate pages, trigger actions)
   - `Ctrl+U` — Quick upload
   - `Ctrl+/` — Open AI chat
   - `Ctrl+N` — Create new lead

3. **Batch Operations**:
   - Select multiple leads → bulk "Mark Contacted", "Export", "Delete"
   - Bulk scoring with progress indicator

---

## Phase 7: Rate Limiting, Error Handling & Production Hardening

### Rate Limiting
```typescript
interface RateLimitConfig {
  windowMs: number;        // 60000 (1 minute)
  maxRequests: number;     // Default 60, configurable per API key
  burstLimit: number;      // Allow 10 burst requests above limit
}
```

- Per API key rate limits stored in key config
- Web UI users get higher limits (120/min) since they're interactive
- Rate limit headers on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- 429 responses include `Retry-After` header

### Error Handling
Every API route follows this pattern:
```typescript
export async function GET(request: NextRequest) {
  try {
    // Validate auth (JWT or API key)
    // Validate input (Zod schema)
    // Execute business logic
    // Return structured response
    return NextResponse.json({ data: result, meta: { timestamp, requestId } });
  } catch (error) {
    // Log to audit trail
    // Return structured error
    return NextResponse.json(
      { error: { code: 'ERR_CODE', message: 'Human-readable', details: {} } },
      { status: appropriateCode }
    );
  }
}
```

### Input Validation
Add Zod schemas for all API inputs to prevent garbage-in-garbage-out:
```typescript
const LeadCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  platform: z.enum(['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Twitter', 'unknown']),
  signals: z.array(z.string()).min(1),
  urgency: z.enum(['high', 'medium', 'low']),
});
```

---

## File Change Summary

### New Files (18 files)

| File | Purpose |
|---|---|
| `src/lib/eventBus.ts` | SSE event bus for real-time alerts |
| `src/lib/socialPipeline.ts` | 4-stage social media ingestion pipeline |
| `src/lib/encryption.ts` | AES-256-GCM PII encryption |
| `src/lib/apiKeys.ts` | API key generation, validation, scoping |
| `src/lib/rateLimit.ts` | Per-key rate limiting |
| `src/lib/persistentStore.ts` | File-backed JSON store |
| `src/lib/validation.ts` | Zod input validation schemas |
| `src/app/api/events/route.ts` | SSE streaming endpoint |
| `src/app/api/keys/route.ts` | API key CRUD endpoint |
| `src/app/api/keys/[id]/route.ts` | Single key operations |
| `src/app/social-pipeline/page.tsx` | Social pipeline visualization |
| `src/app/api-docs/page.tsx` | API documentation page |
| `src/components/AlertBanner.tsx` | Real-time urgent lead alerts |
| `src/components/ScoreBreakdown.tsx` | 10-factor radar chart |
| `src/components/QuickActions.tsx` | Dashboard quick action bar |
| `src/components/CommandPalette.tsx` | Ctrl+K command palette |
| `cli/` (entire directory) | CLI client package |
| `.smartleads-data/` | Persistent data directory |

### Modified Files (8 files)

| File | Changes |
|---|---|
| `src/lib/scoring.ts` | Replace behavioral boosts with 10-factor decomposition |
| `src/store/index.ts` | Swap in-memory arrays for PersistentStore |
| `src/middleware.ts` | Add API key auth + rate limiting |
| `src/types/index.ts` | Add FactorScore, ScoringResult, APIKey, ConsentRecord types |
| `src/app/page.tsx` | SSE connection, AlertBanner, QuickActions, guided tour |
| `src/app/leads/page.tsx` | Score breakdown on cards, batch operations, keyboard shortcuts |
| `src/components/Layout.tsx` | Add Social Pipeline + API Docs to nav |
| `src/components/LeadCard.tsx` | Factor breakdown radar chart |

---

## Verification Plan

### Automated Tests
```bash
# Unit tests for scoring model
npm run test -- --filter scoring

# API endpoint tests
npm run test -- --filter api

# CLI integration tests  
cd cli && npm test
```

### Manual Verification
1. **Register new test user** → verify pre-seeded data loads on all pages
2. **Upload sample_dataset.csv** → verify instant scoring with factor breakdown
3. **Check real-time alerts** → verify urgent leads trigger banner within 2 seconds
4. **Generate API key** → copy key → use CLI to query leads
5. **CLI full flow**: `smartleads auth login` → `smartleads leads list` → `smartleads chat "top leads"` → `smartleads leads export`
6. **Data persistence**: restart server (`npm run dev`) → verify all leads/keys survive
7. **Navigate every page**: zero empty states, zero 500 errors, zero broken links
8. **Mobile test**: check dashboard at 375px width

### Performance Targets
| Metric | Target |
|---|---|
| Dashboard load | < 800ms |
| Lead scoring (single) | < 200ms |
| Batch scoring (100 leads) | < 5s |
| API response (any endpoint) | < 500ms |
| SSE event delivery | < 100ms |
| CLI command execution | < 2s |

---

## Implementation Order

> [!IMPORTANT]
> Recommended execution order based on dependencies:

1. **Phase 4** (Persistent Store + Encryption) — Foundation for everything else
2. **Phase 3** (Scoring Model) — Core value proposition
3. **Phase 1** (Real-Time Events) — Depends on persistent store
4. **Phase 2** (Social Pipeline) — Depends on scoring + events
5. **Phase 5** (API Keys + CLI) — Depends on middleware + persistent store
6. **Phase 6** (Test User Front Page) — Integration of all above
7. **Phase 7** (Rate Limiting + Hardening) — Final polish

## Open Questions

> [!IMPORTANT]
> These decisions will impact implementation scope and timeline:

1. **Database vs. File Storage**: The plan uses file-backed JSON (`.smartleads-data/`). Should we invest in SQLite instead for better query support and concurrent access? SQLite adds a dependency but is significantly more robust for production.

2. **CLI Distribution**: Should the CLI be a standalone npm package (`npm install -g smartleads-cli`) or kept as a local tool in the monorepo? Standalone is more polished but requires npm publishing setup.

3. **WebSocket vs. SSE**: SSE is simpler and unidirectional (server → client). WebSocket allows bidirectional communication (useful if we want the dashboard to push events back). Which do you prefer?

4. **Scope of Implementation**: All 7 phases together represent ~15-20 hours of work. Would you like to prioritize specific phases, or should I implement all of them?

5. **Zod dependency**: Adding Zod for input validation adds ~60KB. The alternative is manual validation (more code, less type-safe). Preference?
