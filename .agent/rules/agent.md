---
trigger: always_on
---

---
trigger: always_on
---

# SmartLeads BI - AI Lead Scoring & Marketing Assistant

## Business Requirements

A web-based lead generation and scoring platform for small and medium sized retailers that transforms raw social media engagement data into prioritized leads. The product replaces manual lead tracking with automated prioritization, reducing marketing costs and improving efficiency for retailers who cannot afford enterprise CRM systems.

Core functionality includes automated lead scoring, flexible data ingestion from any social media platform, AI chatbot assistance, and automated marketing strategy generation.

### Core Features

- Upload any social media analytics dataset (CSV, JSON, Excel, or direct API format) and automatically normalize into behavioral sentences for AI scoring
- AI-powered lead scoring using transformer-based encoder that outputs 0-100 scores with High (80+), Medium (45-79), and Low (below 45) priority labels
- Interactive dashboard displaying ranked leads with filters by score, name, date, and platform
- Export functionality to CSV/Excel with lead contact table
- AI chatbot assistant for natural language queries on lead data (filtering, summarization, analytics)
- Automated marketing strategy generator that creates detailed marketing plans based on lead insights
- Optional team task assignment based on member profiles

### Data Ingestion & Normalization

- Upload datasets from Facebook, Instagram, TikTok, Twitter/X, LinkedIn, or any platform with engagement data
- Supported formats: CSV, JSON, Excel (.xlsx, .xls), and direct API payloads
- Auto-detection of file format and column mapping
- LLM-assisted column mapping for unfamiliar formats with user confirmation
- Output standardized behavioral sentences like "Added to cart; Viewed details; HIGH urgency"

### Lead Scoring Logic

- Scores calculated from behavioral signals: cart additions, restock requests, sizing inquiries, wishlist saves, and urgency markers
- Weighted signal boosts for high-value actions
- Final score ranges: 80-100 = High priority, 45-79 = Medium priority, below 45 = Low priority
- Calibrated metrics reflecting retail sales team priorities

### AI Chatbot Capabilities

- Natural language filtering: "Show me leads with score above 80 from last 7 days"
- Summarization: "How many high-intent leads came from Facebook vs Instagram?"
- Basic analytics: "Which signal cluster converts most often?"
- Action execution: "Mark all leads from Texas as contacted"
- Access to anonymized lead dataset, scores, urgency levels, signals, and contact status

### Marketing System Strategy

- Analyzes lead set for score distribution, top signals, urgency clusters, and geographic concentrations
- Generates detailed marketing plan with outreach channels, messaging angles, and timing recommendations
- Optional task assignment to team member profiles with individual task lists
- Task completion tracking in dashboard

### Authentication & User Roles

- Login with Facebook token authentication
- No payment system (demo/exhibition purposes only)
- User settings with dark mode toggle

## Technical Details

- Implemented as a modern full-stack web application
- Frontend: React.js with Vite, Tailwind CSS, React Router v6, Axios
- Backend: Node.js/TypeScript with ONNX Runtime for transformer inference
- Data normalization module for multi-format social media ingestion
- AI scoring: Exported PyTorch transformer model running via ONNX Runtime in Node.js
- AI chatbot: OpenRouter API with model openai/gpt-oss-20b:free
- Marketing generator: OpenRouter API with model openai/gpt-oss-20b:free
- Car recognition (if applicable): OpenRouter API with model openai/gpt-oss-20b:free
- Deployment: Railway (backend) + Vercel (routing) + GitHub Pages (frontend)
- No persistent database required for MVP (simulated data stream)
- Environment variables stored in .env file with OpenRouter API key

## OpenRouter Configuration


Default model: openai/gpt-oss-20b:free

API endpoint: https://openrouter.ai/api/v1/chat/completions

## Color Scheme

Premium retail aesthetic using Tailwind CSS with custom spacing and rounded geometries. Professional dark mode support. Primary palette: deep navy, slate gray, emerald accent for positive scores, amber for medium priority, rose for low priority.

## Strategy

1. Write plan with success criteria for each phase to be checked off. Include project scaffolding, including .gitignore, and rigorous unit testing.
2. Execute the plan ensuring all criteria are met
3. Carry out extensive integration testing with Playwright or similar, fixing defects
4. Only complete when the web app is finished and tested, with the server running and ready for the user

## Phase 1: Project Setup & Backend Migration

- [ ] Initialize TypeScript/Node.js project with Express
- [ ] Install ONNX Runtime and required dependencies
- [ ] Export trained PyTorch transformer model to ONNX format
- [ ] Implement tokenizer for behavioral sentence serialization
- [ ] Build scoring endpoint with weighted signal boosts
- [ ] Create data normalization module for CSV, JSON, Excel uploads
- [ ] Implement auto-detection of file formats
- [ ] Build LLM-assisted column mapping using OpenRouter API
- [ ] Unit tests for scoring logic and data normalization

## Phase 2: Frontend Development

- [ ] Scaffold React app with Vite and Tailwind CSS
- [ ] Build authentication flow (Login.jsx)
- [ ] Create LeadDashboard component with AI scoring integration
- [ ] Build LeadCard component with signal tags
- [ ] Implement file upload component for social media datasets
- [ ] Create LeadsPage with search filtering, sorting, pagination
- [ ] Add CSV/Excel export functionality
- [ ] Build Settings component with dark mode toggle
- [ ] Unit tests for frontend components

## Phase 3: AI Chatbot Integration

- [ ] Build chat interface component (collapsible panel)
- [ ] Integrate OpenRouter API with openai/gpt-oss-20b:free model
- [ ] Implement structured query generation from natural language
- [ ] Build query executor against lead dataset
- [ ] Add chatbot actions (filter, summarize, analytics, mark contacted)
- [ ] Unit tests for chatbot query handling

## Phase 4: Marketing System Module

- [ ] Build lead analysis function (score distribution, signals, urgency, geography)
- [ ] Create prompt template for marketing plan generation
- [ ] Integrate OpenRouter API for plan generation
- [ ] Build optional task assignment to team profiles
- [ ] Create task list and completion tracking UI
- [ ] Add settings toggle for module (on/off)
- [ ] Unit tests for marketing logic

## Phase 5: Integration & Testing

- [ ] Connect frontend to backend API endpoints
- [ ] Test file upload for all supported formats (CSV, JSON, Excel)
- [ ] Verify end-to-end scoring pipeline
- [ ] Test chatbot responses for all query types
- [ ] Test marketing plan generation
- [ ] Run Playwright integration tests across all user flows
- [ ] Fix defects identified during testing

## Phase 6: Deployment & Documentation

- [ ] Deploy backend to Railway
- [ ] Deploy frontend to GitHub Pages
- [ ] Configure Vercel for API routing
- [ ] Set up environment variables for OpenRouter API key
- [ ] Write concise README with setup instructions
- [ ] Final integration test on deployed environment

## Coding Standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Be concise. Keep README minimal. IMPORTANT: no emojis ever
3. Use TypeScript for all backend code
4. Write unit tests for all core functions
5. Use environment variables for all secrets (API keys)
6. Document API endpoints with comments
7. No hardcoded values in production code

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Upload dataset file (CSV/JSON/Excel) |
| POST | /api/score | Score single lead |
| POST | /api/score-batch | Score batch of leads |
| POST | /api/chat | Chatbot query |
| POST | /api/marketing/generate | Generate marketing plan |
| GET | /api/leads | Get all leads with optional filters |
| DELETE | /api/leads/:id | Delete lead |

## Environment Variables

OPENROUTER_MODEL=openai/gpt-oss-20b:free
RAILWAY_TOKEN=optional
NODE_ENV=production


## Success Criteria

- User can upload any social media analytics dataset (CSV, JSON, Excel) and receive scored leads within seconds
- AI scoring accurately assigns High/Medium/Low priorities based on behavioral signals
- Chatbot correctly answers natural language questions about lead data
- Marketing system generates actionable marketing plans from lead insights
- Dashboard loads instantly with responsive design
- Dark mode toggle works across all pages
- CSV export contains all lead data with scores
- Zero cost infrastructure except optional Railway paid tier
- All unit tests and integration tests pass
- Deployment works on Railway + Vercel + GitHub Pages
