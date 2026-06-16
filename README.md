# SmartLeads BI

SmartLeads BI is an AI-powered lead generation and scoring platform designed for small and medium retailers. It transforms raw social media engagement data into actionable, prioritized leads, automating marketing strategies and chat-based data analysis.

## Features

- **Automated Lead Scoring:** Employs a transformer-based encoder via ONNX Runtime to score leads based on behavioral signals.
- **Universal Data Ingestion:** Supports CSV, JSON, and Excel file uploads for extracting lead engagement metrics from any social media platform.
- **AI Chatbot Assistant:** Features an OpenRouter-powered (gpt-oss-20b) assistant that allows natural language queries against your lead dataset.
- **Marketing Strategy Generator:** Automatically generates detailed marketing plans and task lists based on current lead distributions.
- **Premium UI:** A responsive, dark-mode enabled dashboard built with React and Tailwind CSS v4.

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- Python 3.10+ (for model generation, optional if ONNX model is already generated)

### 1. Environment Configuration

In the `backend` directory, create a `.env` file:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-oss-20b:free
NODE_ENV=development
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The API server will run on `http://localhost:3000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React app will be accessible at `http://localhost:5173`.

### 4. Playwright Testing
```bash
cd frontend
npx playwright test
```

## Deployment

### Backend (Railway)
The backend is configured for deployment on Railway via the included `railway.toml`. Connect your GitHub repository to Railway to automatically build and deploy the Node/Express server.

### Frontend (GitHub Pages / Vercel)
The frontend can be built via `npm run build`. A `vercel.json` file is included in the frontend directory to proxy `/api/*` requests to the deployed Railway backend.

## License
MIT
