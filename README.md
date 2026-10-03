# VivaMate — AI-Powered Personalized Viva Practice

> **Master your oral vivas with open-weight AI.**  
> Built for the *"Build for a Friend"* Hacktoberfest 2026 Challenge.

---

## 1. Overview
**VivaMate** is an interactive, student-focused mock viva practice platform. It helps engineering and computer science students prepare for technical oral examinations by generating structured viva questions, conducting one-question-at-a-time mock exams, providing real-time AI answer evaluations, and delivering a comprehensive performance dashboard.

VivaMate supports two operational modes:
- 💻 **Local Mode**: Uses **Ollama + Qwen3 4B** running on your local machine for on-device inference.
- 🚀 **Production Mode**: Hosted FastAPI on **Render** using **Hugging Face Inference Providers** with open-weight Qwen3 models (`AI_PROVIDER=huggingface`).

---

## 2. Problem
Oral viva examinations test conceptual depth, real-time articulation, and technical clarity under pressure. However, students face major preparation hurdles:
- **Lack of Practice Partners**: Studying alone makes it hard to simulate interactive viva questioning.
- **Generic Flashcards**: Traditional static quizzes don't evaluate open-ended explanations or offer constructive feedback.
- **Cost & Proprietary Locking**: Proprietary AI services often require subscriptions or API tokens.

---

## 3. Solution
VivaMate solves these challenges by combining a modern, reactive web UI with a lightweight backend powered by open-weight AI models. Students can upload their course materials (PDF or TXT) or specify custom topics to generate targeted, university-level viva questions, receive instant scoring with detailed feedback, and review performance seamlessly.

---

## 4. Key Features
- 📄 **PDF / TXT Study Material Upload**: Ingest course documents and extract text directly in memory.
- 🎯 **Targeted Question Generation**: Generate viva questions from uploaded study materials or manually specified subjects with customizable difficulty (*Easy*, *Medium*, *Hard*, *Mixed*) and count (1–10).
- 🎙️ **Interactive Mock Viva Engine**: Clean, focused interface displaying one question at a time with progress tracking and answer submission.
- 🤖 **AI Answer Evaluation**: Analyzes open-ended student answers to produce:
  - Numerical score ($0–10$)
  - Correctness classification (*Incorrect*, *Partially Correct*, *Mostly Correct*, *Correct*)
  - Detailed feedback highlighting missing concepts
  - Ideal reference answer
  - Follow-up question
- 📊 **Final Viva Performance Dashboard**:
  - Overall score percentage and circular progress visualization
  - Automated strengths identification (high-scoring questions)
  - Actionable areas to improve (lower-scoring feedback)
  - Accordion-based question review
  - Session actions (*Practice Again*, *Generate New Viva*)

---

## 5. How It Works
1. **Upload & Ingest**: Upload course notes or choose a computer science topic.
2. **Generate**: Open-weight AI creates structured viva questions formatted specifically for university engineering students.
3. **Practice**: Answer questions sequentially in the interactive mock viva view.
4. **Evaluate & Review**: Receive immediate AI evaluation for each response, followed by an end-of-session performance report.

---

## 6. Architecture & Operational Modes

### Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend [React + Vite Frontend - Vercel]
        UI[User Interface]
        DocUp[Document Uploader]
        GenComp[Viva Question Generator]
        MockViva[Mock Viva Session UI]
        Report[Viva Performance Dashboard]
    end

    subgraph Backend [FastAPI Backend Service - Render]
        API[FastAPI Router /api/*]
        DocService[PDF/TXT Extractor - pypdf]
        Factory[AI Provider Factory get_ai_service]
    end

    subgraph LocalMode [Local Mode: AI_PROVIDER=ollama]
        Ollama[Ollama REST API http://127.0.0.1:11434]
        QwenLocal[Qwen3 4B Local Model]
    end

    subgraph ProdMode [Production Mode: AI_PROVIDER=huggingface]
        HFRouter[Hugging Face Inference Router]
        HFModel[Open-Weight Qwen3 Model]
    end

    UI --> DocUp
    DocUp -->|POST /api/documents/upload| API
    GenComp -->|POST /api/ai/questions| API
    GenComp -->|POST /api/ai/questions/from-material| API
    MockViva -->|POST /api/ai/evaluate| API
    
    API --> DocService
    API --> Factory
    
    Factory -->|Local Provider| Ollama
    Ollama --> QwenLocal
    
    Factory -->|Production Provider| HFRouter
    HFRouter --> HFModel

    Report <---|Session State| MockViva
```

---

## 7. Open-Source AI & Privacy Disclosures

- **Local Mode (`AI_PROVIDER=ollama`)**:
  - Runs **100% on-device** via local Ollama.
  - Course materials, uploaded notes, and student answers remain strictly on your local machine.
  - Zero token costs or cloud dependencies.

- **Production Mode (`AI_PROVIDER=huggingface`)**:
  - Deployed on **Render** (FastAPI backend) and **Vercel** (React frontend).
  - Connects asynchronously to Hugging Face Inference Providers using `HF_TOKEN` and `HF_MODEL`.
  - In production mode, study material text is processed via Hugging Face's open-weight inference router endpoints.

---

## 8. Tech Stack
- **Frontend**: React 19, Vite, Vanilla CSS (Design Tokens & Glassmorphism), Lucide React
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, HTTPX, PyPDF, Python-Multipart, Uvicorn
- **AI Providers**: 
  - Local: Ollama (`qwen3:4b`)
  - Production: Hugging Face Inference Providers (`Qwen/Qwen3-4B-Instruct-2507`)

---

## 9. Project Structure
```text
Hacktober_Challenge/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai.py             # AI generation & evaluation endpoints
│   │   │   ├── documents.py      # PDF/TXT extraction endpoints
│   │   │   └── health.py         # Health check endpoint
│   │   ├── core/
│   │   │   └── config.py         # App & AI settings
│   │   ├── schemas/
│   │   │   ├── ai.py             # Pydantic request/response schemas
│   │   │   └── document.py       # Document upload schemas
│   │   ├── services/
│   │   │   ├── ai/               # AI provider abstraction
│   │   │   │   ├── base.py       # Abstract BaseAIService
│   │   │   │   ├── ollama.py     # Ollama local provider
│   │   │   │   ├── huggingface.py# Hugging Face inference provider
│   │   │   │   ├── remote.py     # HTTP open-weight remote provider
│   │   │   │   └── factory.py    # Environment provider resolver
│   │   │   └── document.py       # PyPDF text extractor
│   │   └── main.py               # FastAPI application entry point
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentUploader.jsx      # PDF/TXT file upload component
│   │   │   ├── MockVivaSession.jsx       # Interactive viva session runner
│   │   │   ├── VivaPerformanceReport.jsx # Final performance dashboard
│   │   │   └── VivaQuestionGenerator.jsx # Setup & question card UI
│   │   ├── App.jsx                       # Main layout & health indicator
│   │   ├── main.jsx                      # Vite entry point
│   │   └── index.css                     # Design system & styles
│   ├── package.json                      # Frontend dependencies
│   └── vite.config.js                    # Vite server configuration
├── render.yaml                           # Render backend deployment config
├── vercel.json                           # Vercel deployment config
├── .gitignore
├── LICENSE
└── README.md
```

---

## 10. Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default (Local) | Production (Render) Example |
| :--- | :--- | :--- | :--- |
| `AI_PROVIDER` | Selection: `"ollama"` or `"huggingface"` | `ollama` | `huggingface` |
| `OLLAMA_BASE_URL` | Local Ollama REST URL | `http://127.0.0.1:11434` | — |
| `OLLAMA_MODEL` | Local Ollama model tag | `qwen3:4b` | — |
| `HF_BASE_URL` | Hugging Face Inference Router URL | — | `https://router.huggingface.co/v1` |
| `HF_TOKEN` | Hugging Face User Access Token | — | `hf_...` |
| `HF_MODEL` | Open-weight model name | — | `Qwen/Qwen3-4B-Instruct-2507` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://127.0.0.1:5173` | `https://vivamate.vercel.app` |

### Frontend (`frontend/.env`)

| Variable | Description | Default | Production Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of FastAPI backend service | `http://localhost:8000` | `https://vivamate-backend.onrender.com` |

---

## 11. Local Setup Guide

### Step 1: Install & Launch Ollama
1. Download and install [Ollama](https://ollama.ai/).
2. Pull and verify the Qwen3 4B model in your terminal:
   ```bash
   ollama pull qwen3:4b
   ```
3. Ensure Ollama is running at `http://127.0.0.1:11434`.

### Step 2: Backend Setup (FastAPI)
1. Open terminal and navigate to the project directory:
   ```bash
   cd Hacktober_Challenge
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell / Git Bash)**:
     ```bash
     python -m venv backend/venv
     source backend/venv/Scripts/activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv backend/venv
     source backend/venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The API will be available at `http://127.0.0.1:8000`.*

### Step 3: Frontend Setup (React / Vite)
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd Hacktober_Challenge/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 12. Deployment Guide

### Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository and set **Root Directory** to `backend`.
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables in Render Dashboard:
   - `AI_PROVIDER`: `huggingface`
   - `HF_TOKEN`: `<your_hugging_face_user_access_token>`
   - `HF_MODEL`: `Qwen/Qwen3-4B-Instruct-2507`
   - `CORS_ORIGINS`: `https://your-frontend-app.vercel.app`

### Frontend Deployment (Vercel)
1. Import the project into **Vercel**.
2. Set **Root Directory** to `frontend`.
3. Configure Environment Variables in Vercel Dashboard:
   - `VITE_API_BASE_URL`: `https://vivamate-backend.onrender.com`
4. Deploy!

---

## 13. API Overview

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Returns backend connection status and service health. |
| `/api/ai/test` | `POST` | Validates connectivity between FastAPI and the active AI provider. |
| `/api/ai/questions` | `POST` | Generates topic-based viva questions with specified count and difficulty. |
| `/api/ai/questions/from-material` | `POST` | Generates viva questions directly derived from uploaded study material text. |
| `/api/ai/evaluate` | `POST` | Evaluates a student's answer, returning score, correctness, feedback, ideal answer, and follow-up. |
| `/api/documents/upload` | `POST` | Accepts a PDF or TXT file upload and extracts plain text content in memory. |

---

## 14. MVP Limitations
- **File Formats**: Supports PDF (`.pdf`) and Plain Text (`.txt`) files only.
- **In-Memory Processing**: Uploaded study materials are held in transient memory per request; no permanent server storage or database is attached.
- **Context Limits**: Large PDF files are truncated to an initial character limit suitable for LLM prompt windows.
- **Stateless Sessions**: Session history is stored purely in React state and resets upon browser reload.
- **Text-Only Input**: Voice input and speech synthesis are not yet integrated.

---

## 15. Future Improvements
- 🧩 **Advanced Document RAG**: Vector embeddings and semantic retrieval for long-form textbooks.
- 🗣️ **Voice-Based Viva Mode**: Speech-to-text (STT) answer recording and text-to-speech (TTS) interviewer voice generation.
- 📊 **Progress History & Analytics**: Local database integration (SQLite) to track long-term score trends over time.
- 📁 **Broader File Support**: Support for `.docx`, `.pptx`, and markdown files.

---

## 16. License
This project is licensed under the [MIT License](LICENSE).
