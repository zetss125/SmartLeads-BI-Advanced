# SmartLeads BI

SmartLeads BI is a Next.js lead intelligence demo for retailers. It uploads lead files, normalizes the data, scores each lead, and shows live mock growth across the dashboard, leads, analytics, approval, and social media flows.

## Core Features

- CSV, JSON, and Excel lead upload
- Automatic column mapping with optional OpenRouter assistance
- Lead scoring with ONNX fallback behavior and business-rule boosts
- Live in-memory lead growth simulation
- Dashboard buttons for live growth, approval email flow, and mock social post flow
- Leads management with live polling, filters, contact status, and CSV export
- AI chatbot and marketing strategy generation through OpenRouter
- Mock social analytics, competitor review generation, and review analysis

## Live Demo Flows

- `/live-growth`: shows a live graph of leads and customers increasing.
- `/approval-simulation`: simulates an email approval request, form submission, and confirmation email.
- `/mock-social`: simulates replying under a promoted social post and converting that reply into a scored lead.

All demo data is in memory only. Restarting the server clears users, leads, approvals, events, and mock social comments.

## Environment

Create `.env.local`:

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=poolside/laguna-m.1:free
JWT_SECRET=replace-this-secret
```

The app still works without `OPENROUTER_API_KEY`, but AI-assisted features use fallback responses.

## Run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`, register an account, and use `sample_dataset.csv` or the live demo pages.
