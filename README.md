# NoteForge

Turn lecture slides into structured, studyable notes — automatically.

Upload a PDF or PPTX deck and NoteForge extracts the content, restructures it into topic-based sections using AI, and generates a glossary and self-test quiz for each section. Built to solve a real problem: lecture slides are bullet-heavy and unstructured, making last-minute revision inefficient.

**Live demo:** [your-vercel-url-here](#)

---

## How it works

1. **Upload** a PDF or PPTX slide deck
2. **Extraction** — Python (`pdfplumber` / `python-pptx`) pulls raw text per slide
3. **AI restructuring** — Google Gemini groups slides into logical topic sections, rewrites the content into clear notes (not copy-pasted bullets), and generates a glossary + 5-question quiz per section
4. **View & study** — browse notes by section, test yourself with the interactive quiz, and export to PDF

```
Upload → Extract (Python) → Restructure (Gemini) → Store (MongoDB) → View (React)
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Axios, custom CSS |
| Backend | Node.js, Express, Multer |
| Database | MongoDB (Atlas), Mongoose |
| Extraction | Python — `pdfplumber`, `python-pptx` |
| AI | Google Gemini (`gemini-2.5-flash`) via `google-genai` SDK, structured output enforced with Pydantic schemas |
| Deployment | Vercel (frontend), Render (backend, via Docker) |

The backend is deliberately polyglot: Node/Express handles the API and orchestration, while a separate Python process (spawned via `child_process`) handles document parsing and the LLM call — chosen because Python's PDF/PPTX libraries are more mature than their JS equivalents.

## Features

- PDF and PPTX upload with automatic content extraction
- AI-generated section grouping based on content density, not a fixed slide count
- Notes genuinely rewritten for clarity, not just reformatted slide text
- Auto-generated glossary of technical terms per section
- Interactive multiple-choice quiz (5 questions per section) with instant feedback
- PDF export of the final notes
- Traceability — every section links back to its original source slide numbers

## Running locally

**Prerequisites:** Node.js, Python 3, MongoDB Atlas account, Gemini API key

**1. Clone and set up the extractor**
```bash
cd extractor
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```
Create `extractor/.env`:
```
GEMINI_API_KEY=your_key_here
```

**2. Set up the server**
```bash
cd server
npm install
```
Create `server/.env`:
```
MONGO_URI=your_mongodb_connection_string
PYTHON_PATH=../extractor/venv/Scripts/python.exe
```
Run it:
```bash
npm run dev
```

**3. Set up the client**
```bash
cd client
npm install
```
Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```
Run it:
```bash
npm run dev
```

Open `http://localhost:5173`.

## Deployment

- **Frontend** deployed on Vercel, root directory set to `client/`
- **Backend** deployed on Render as a Docker web service (installs both Node and Python in one container), root directory at the repo root with `server/Dockerfile`
- **Database** MongoDB Atlas, with network access opened to allow Render's IPs

## Known limitations (by design, for MVP scope)

- No OCR — scanned/image-based PDFs with no text layer won't extract content
- Diagrams and images from slides aren't currently rendered alongside notes
- PDF export uses the browser's native print-to-PDF rather than a custom-designed document
- Free-tier hosting (Render) spins down after inactivity, causing a slower first request after idle time

## Author

Driswin Kumar K — B.Tech CSE
