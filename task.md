# SmartLeads BI — Implementation Tasks

## Phase 4: Persistent Store + Encryption (Foundation)
- [x] Create `src/lib/encryption.ts` — AES-256-GCM PII encryption
- [x] Create `src/lib/persistentStore.ts` — File-backed JSON store
- [x] Modify `src/store/index.ts` — Swap in-memory arrays for PersistentStore
- [x] Modify `.gitignore` — Add `.smartleads-data/`
- [x] Add `ConsentRecord` and `AuditEntry` types to `src/types/index.ts`

## Phase 3: Multi-Factor Scoring Model
- [x] Add `FactorScore`, `ScoringResult` types to `src/types/index.ts`
- [x] Rewrite `src/lib/scoring.ts` — 10-dimensional factor decomposition
- [x] Create `src/components/ScoreBreakdown.tsx` — Radar chart component
- [x] Modify `src/components/LeadCard.tsx` — Add factor breakdown display

## Phase 1: Real-Time Event Bus
- [x] Create `src/lib/eventBus.ts` — SSE event bus
- [x] Create `src/app/api/events/route.ts` — SSE streaming endpoint
- [x] Create `src/components/AlertBanner.tsx` — Urgent lead alerts
- [x] Modify `src/app/page.tsx` — SSE connection + alert banner

## Phase 2: Social Pipeline
- [x] Create `src/lib/socialPipeline.ts` — 4-stage ingestion pipeline
- [x] Create `src/app/social-pipeline/page.tsx` — Pipeline visualization
- [x] Modify `src/components/Layout.tsx` — Add Social Pipeline nav item

## Phase 5: API Keys + CLI
- [x] Create `src/lib/apiKeys.ts` — Key generation/validation
- [x] Create `src/lib/rateLimit.ts` — Per-key rate limiting
- [x] Create `src/app/api/keys/route.ts` — Key CRUD endpoint
- [x] Create `src/app/api/keys/[id]/route.ts` — Single key ops
- [x] Modify `src/middleware.ts` — API key auth + rate limiting
- [x] API key management UI in settings
- [x] Create CLI directory structure + commands (`smartleads-cli`)

## Phase 6: Test-User Front Page
- [x] Create `src/lib/seedData.ts` — Pre-seeded demo data
- [x] Create `src/components/QuickActions.tsx` — Quick action bar
- [x] Create `src/components/CommandPalette.tsx` — Ctrl+K palette
- [x] Modify `src/app/page.tsx` — Guided tour + quick actions

## Phase 7: Production Hardening
- [x] Create `src/lib/validation.ts` — Input schemas
- [x] Structured error responses on endpoints
- [x] Add rate limit headers to responses
