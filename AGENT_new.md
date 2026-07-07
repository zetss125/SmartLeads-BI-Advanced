# SmartLeads BI Agent Notes

## Current Architecture

SmartLeads BI is implemented as a single Next.js app.

- Pages live in `src/app`.
- API routes live in `src/app/api`.
- Shared UI lives in `src/components`.
- Lead scoring, normalization, chatbot, marketing, auth, and live simulation helpers live in `src/lib`.
- In-memory data storage lives in `src/store/index.ts`.

There is no database. Leads, users, approvals, live events, chart history, and mock social comments are kept only while the server process is running.

## Main Backend Flows

### Lead Upload

`POST /api/upload`

1. Accepts CSV, JSON, or Excel.
2. Maps source columns to standard lead fields.
3. Normalizes each row into a `NormalizedLead`.
4. Scores each lead.
5. Stores the result in memory.

### Lead Scoring

Lead scoring starts with ONNX model inference when available. If the runtime or model is unavailable, the score starts at `50`.

Business-rule boosts then adjust the score:

- Added to cart: `+15`
- Restock request: `+15`
- Sizing, size, or fit question: `+10`
- Wishlist or save: `+5`
- High urgency: `+10`
- Low urgency: `-10`

Priority bands:

- `80+`: High
- `45-79`: Medium
- `<45`: Low

### Live Simulation

`GET /api/live-feed`

Advances the live demo and returns:

- Total lead count
- High, medium, and low priority counts
- Mock customer count
- Approval count
- Recent leads
- Live events
- Growth chart history

The live feed is intentionally in-memory and non-persistent.

### Approval Simulation

`GET /api/approvals`

Returns submitted approval records.

`POST /api/approvals`

Creates an approved consent record and adds a scored lead to the main lead list.

### Mock Social Page

`GET /api/mock-social`

Returns promoted mock social posts and comments.

`POST /api/mock-social`

Adds a comment under a promoted post, detects basic buying signals, creates a scored lead, and updates the social post.

## User-Facing Pages

- `/`: dashboard with live counts and entry buttons for new demo flows
- `/leads`: live lead management
- `/live-growth`: live lead and customer graph
- `/approval-simulation`: mock email consent and confirmation flow
- `/mock-social`: promoted post reply simulation
- `/social-analytics`: mock analytics and lead sync
- `/upload`: dataset upload
- `/competitor-reviews`: review generation and analysis
- `/settings`: theme preferences

## OpenRouter

Preferred model in `.env.local`:

```env
OPENROUTER_MODEL=poolside/laguna-m.1:free
```

The app has fallback behavior when the API key is missing.

## Validation Checklist

- Dashboard counts update through `/api/live-feed`.
- Leads page refreshes without full-page flicker.
- Live growth graph updates as leads/customers increase.
- Approval form submission creates an approved record and a new scored lead.
- Mock social reply adds a comment and a new scored lead.
- README remains minimal and current.
