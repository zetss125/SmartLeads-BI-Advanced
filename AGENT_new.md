# SmartLeads BI - Next.js Implementation (Completed)

## Architecture

```
C:\SmartLeads-BI-advanced\
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Dashboard
│   │   ├── globals.css             # Tailwind v4 entry
│   │   ├── login/page.tsx          # Login/Register page
│   │   ├── leads/page.tsx          # Lead management with filters + CSV export
│   │   ├── upload/page.tsx         # Dataset upload with drag-drop
│   │   ├── settings/page.tsx       # Dark mode + preferences
│   │   ├── social-analytics/page.tsx # Mock social media analytics site
│   │   ├── competitor-reviews/page.tsx # Product review analysis site
│   │   └── api/
│   │       ├── auth/               # register, login, logout, me
│   │       ├── leads/route.ts      # CRUD leads
│   │       ├── upload/route.ts     # CSV/JSON/Excel upload + auto-mapping
│   │       ├── chat/route.ts       # AI chatbot via OpenRouter
│   │       ├── marketing/route.ts  # Marketing strategy generation
│   │       ├── social-analytics/route.ts # Mock social analytics data
│   │       ├── reviews/generate/route.ts # Competitor review generation
│   │       └── competitor-reviews/route.ts # Review analysis + strategy
│   ├── components/
│   │   ├── Layout.tsx              # Sidebar nav + mobile menu
│   │   ├── LeadCard.tsx            # Lead display card
│   │   ├── FileUpload.tsx          # Drag-drop file upload
│   │   ├── ChatbotPanel.tsx        # AI assistant chat panel
│   │   └── MarketingPanel.tsx      # Strategy + task management
│   ├── lib/
│   │   ├── tokenizer.ts            # ONNX tokenizer (fixed vocab)
│   │   ├── normalizer.ts           # File parsing + column mapping
│   │   ├── scoring.ts              # ONNX inference + behavioral boosts
│   │   ├── chatbot.ts              # OpenRouter AI chat
│   │   ├── marketing.ts            # OpenRouter marketing strategy
│   │   └── auth.ts                 # JWT + bcrypt auth
│   ├── store/
│   │   └── index.ts                # In-memory leads storage
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── middleware.ts               # Auth redirect middleware
├── backend/
│   └── assets/
│       └── model.onnx              # Trained scoring model
├── .env.local                      # Environment configuration
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## Features Implemented

### 1. Authentication System
- Register with name, email, password
- Login with JWT tokens + httpOnly cookies
- Protected routes and API middleware
- Logout with cookie cleanup

### 2. Lead Scoring Pipeline
- Upload CSV/JSON/Excel files with drag-drop
- Auto-detect column mapping with LLM fallback
- ONNX model inference for AI scoring
- Behavioral rule boosts (cart added, restock, sizing, urgency)
- Priority classification (High 80+, Medium 45-79, Low <45)
- CSV export with all lead data

### 3. Dashboard & Lead Management
- Real-time stats (total, high/medium/low counts)
- Search by name, email, platform
- Priority filter buttons
- Lead cards with score, signals, urgency badges

### 4. AI Chatbot Assistant
- OpenRouter via openai/gpt-oss-20b:free
- Natural language querying
- Filter, summarize, analyze leads
- Update contact status via chat

### 5. Marketing Strategy Generator
- Lead analytics compilation
- OpenRouter-generated marketing plans
- Task assignment to team (Sarah, David, Alex)
- Task completion tracking

### 6. Mock Social Media Analytics Site
- Dashboard with followers, engagement, post stats
- Lead list with follower counts and engagement rates
- Comment section per lead with sentiment analysis
- Generate sample datasets (CSV download)
- Sync leads to main app via API connection button

### 7. Competitor Review Analysis System
- Upload product image or enter product name
- Generate realistic mock reviews with ratings
- Rating distribution visualization
- AI-powered competitor strategy report
- Strategic recommendations with priority levels

## OpenRouter Configuration

```
Default model: openai/gpt-oss-20b:free
API endpoint: https://openrouter.ai/api/v1/chat/completions
```

## Running the App

```powershell
cd SmartLeads-BI-advanced
npm run dev
# Open http://localhost:3000
# Register an account, then upload sample_dataset.csv
```
