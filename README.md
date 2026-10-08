# UniAssist

AI-Powered Student Chatbot for IEEE Day Hackathon 2026.

Problem Statement 3 – AI-Powered Student Chatbot.

## Frontend Stack
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Modern CSS (University & IEEE Design Tokens)
- **Icons:** Lucide React
- **Markdown & Tables:** React Markdown + Remark GFM

## Current Status
- **Phase 1** – Core UI functionality complete (Conversational arena, starter question cards, grounded citations, anti-hallucination fallback, multi-step retrieval state, inline error recovery).
- **Phase 2** – UI/UX upgrade complete (Spacious workspace, compact 260px sidebar, 2-column responsive starter grid, clean grounding indicators, refined typography).
- **Current Mode:** Mock / Demo mode (Fully functional offline simulation with strict topic intent classification).
- **Backend / API Integration:** Pending.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Local Setup
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
The application will be available at `http://localhost:5173/`.

### Production Build & Lint
```bash
# Run linter
npm run lint

# Build production bundle
npm run build
```

## Team Collaboration Note
Backend API services, RAG knowledge base retrieval, LLM pipeline, and Google Authentication integration will be integrated into this frontend by the team in upcoming phases.
