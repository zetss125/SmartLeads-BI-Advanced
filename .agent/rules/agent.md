---
trigger: always_on
---

# SmartLeads BI - Next.js Implementation (Completed)

## Summary

The project was migrated from React+Vite+Express to Next.js 16 with App Router, incorporating all original features plus two major new subsystems: a mock Social Media Analytics site and a Competitor Review Analysis system.

## Architecture

- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: JWT + bcryptjs (register/login with httpOnly cookies)
- **Scoring**: ONNX Runtime (model.onnx) + behavioral rule boosts
- **AI**: OpenRouter API (openai/gpt-oss-20b:free)
- **Data**: In-memory storage (no database required)
- **Middleware**: Auth redirect + API protection

## Key Files

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Dashboard with stats + MarketingPanel |
| `src/app/leads/page.tsx` | Lead management, filters, CSV export |
| `src/app/upload/page.tsx` | Dataset upload with drag-drop |
| `src/app/login/page.tsx` | Register/login form |
| `src/app/settings/page.tsx` | Dark mode + preferences |
| `src/app/social-analytics/page.tsx` | Mock social media analytics site |
| `src/app/competitor-reviews/page.tsx` | Product review analysis site |
| `src/middleware.ts` | Auth redirect middleware |
| `src/lib/scoring.ts` | ONNX inference + behavioral boosts |
| `src/lib/normalizer.ts` | File parsing + column mapping |
| `src/lib/chatbot.ts` | OpenRouter AI chat |
| `src/lib/marketing.ts` | Marketing strategy generation |
| `src/lib/auth.ts` | JWT + bcrypt authentication |
| `src/store/index.ts` | In-memory leads storage |
| `src/types/index.ts` | TypeScript interfaces |

## Commands

```powershell
npm run dev    # Start dev server on :3000
npm run build  # Production build
npm start      # Start production server
```

## Environment Variables

| Variable | Value |
|----------|-------|
| `OPENROUTER_API_KEY` | `<your-openrouter-api-key>` |
| `OPENROUTER_MODEL` | openai/gpt-oss-20b:free |
| `NEXTAUTH_SECRET` | (placeholder) |
| `JWT_SECRET` | smartleads-bi-jwt-secret-key-change-in-production |
