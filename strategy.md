# SmartLeads BI Strategy Document

This document outlines the system architecture, component design, data flow, and validation strategy for the SmartLeads BI platform.

## Architecture Overview

The system is organized as a decoupled monorepo containing:
- Backend: A Node.js and TypeScript Express application. It runs ONNX Runtime for local transformer inference and calls the OpenRouter API for LLM-based column mapping, chatbot interaction, and marketing plan generation.
- Frontend: A React SPA scaffolded with Vite and styled using Tailwind CSS, featuring a responsive, premium retail design (deep navy, slate gray, and bright priority accents).
- Scripts: Python training and export scripts to create the ONNX lead scoring model.

```
+-------------------------------------------------------------+
|                        React Frontend                       |
+-------------------------------------------------------------+
        |                                             ^
        | API Payloads / Files                        | JSON responses
        v                                             |
+-------------------------------------------------------------+
|                 Node.js / TS Express Server                  |
+---------------------+---------------------------------------+
                      |
                      +---> Ingestion: Normalizes CSV/JSON/Excel
                      |
                      +---> scoring: Runs local ONNX Transformer Model
                      |
                      +---> chatbot & marketing: Calls OpenRouter API
```

## Lead Scoring Data Flow

1. Dataset Ingestion:
   - Retailer uploads a CSV, JSON, or Excel file containing customer interaction history.
   - If the schema is unrecognized, the backend uses OpenRouter (openai/gpt-oss-20b:free) to predict the column mappings (e.g., mapping "buyer_email" to "email", "added_to_cart" to "cart_actions").
   - The system formats the engagement history of each lead into a behavioral sentence, e.g., "Added to cart; Viewed details; HIGH urgency".

2. Scorer Tokenization:
   - The backend tokenizes the behavioral sentence using a pre-defined vocabulary of 100 retail interaction terms.
   - The sentence is mapped to a fixed-length (32) integer sequence, padded with 0.

3. Transformer Inference:
   - The tokenized sequence is passed to `onnxruntime-node` which executes `model.onnx`.
   - The ONNX model (a 2-layer Transformer Encoder with self-attention) processes the sequence and outputs a score.
   - The backend adjusts the score based on predefined booster weights (e.g., +15 points for explicit cart additions or sizing inquiries).
   - The final score is constrained to the 0-100 range.
   - Priority bands: High (80+), Medium (45-79), Low (<45).

## AI Chatbot Flow

- The frontend interacts with a conversational panel.
- The backend hosts a `/api/chat` endpoint.
- When a query is received, the backend builds a prompt containing:
  - The natural language query.
  - The current anonymized lead dataset (including scores, priority levels, contact status, and interaction details).
- The model (openai/gpt-oss-20b:free) processes the prompt and returns a markdown response containing answers to the user's questions or structured instructions (e.g., identifying leads to mark as contacted).

## Marketing Strategy Flow

- The backend analyzes the parsed dataset, compiling metrics on:
  - Overall score distribution (High vs. Medium vs. Low counts).
  - Most frequent behavioral triggers (e.g., cart additions vs. size inquiries).
  - Urgency concentrations.
  - Regional distribution.
- These metrics are formatted into a prompt template for OpenRouter.
- The generated marketing strategy details:
  - Recommended outreach channels.
  - Custom copy templates for High, Medium, and Low intent categories.
  - Assigned follow-up tasks split across mock team member profiles.

## Project Execution Strategy

### Phase 1: Model Development and Export
- Write a Python script to create, train on mock data, and export the transformer encoder to ONNX format.
- Store the ONNX model in the backend assets folder.

### Phase 2: Express Backend Setup
- Configure TypeScript, Express, and required NPM packages.
- Implement tokenization and ONNX runtime integration.
- Write dataset parsing modules for CSV, JSON, and Excel.
- Integrate OpenRouter API for column mapping, chatbot interaction, and marketing plan generation.
- Implement unit tests covering parsing, tokenization, scoring, and API communication.

### Phase 3: React Frontend Scaffold
- Initialize Vite + React project.
- Configure Tailwind CSS with the design system colors.
- Build simulated login, settings (dark mode), dashboard list/grid, chatbot drawer, and marketing strategy panel.
- Implement data export (CSV/Excel format helper).

### Phase 4: Integration and System Tests
- Connect frontend components with backend API routes.
- Execute end-to-end user flows: uploading spreadsheets, receiving scored leads, query execution via chatbot, and creating tasks.
- Create automated Playwright tests to verify UI reactivity and page flows.
