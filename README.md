# Making Repos Speakable

**Give life to your repositories. Ask anything about any codebase.**

An AI-powered application that transforms GitHub repositories into interactive, queryable knowledge bases using RAG (Retrieval-Augmented Generation) and Large Language Models.

## Features

- **GitHub Repository Analysis** - Validate and ingest any public GitHub repository
- **RAG-Powered Q&A** - Ask natural language questions about any codebase
- **Single File Upload** - Upload and query individual files
- **Voice Input** - Ask questions using your voice
- **Vector Search** - Fast, accurate context retrieval using semantic search

## Tech Stack

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type-safe JavaScript
- **CSS Modules** - Scoped styling with dark theme UI

### Backend
- **FastAPI** - High-performance Python web framework
- **Python 3.8+** - Runtime environment

### AI/ML Services
| Service | Purpose |
|---------|---------|
| **Groq API** | LLM inference (LLaMA 3.1 8B) - Truly free, no billing required |
| **Pinecone** | Vector database for storing and searching embeddings |
| **Sentence Transformers** | Generate semantic embeddings (all-MiniLM-L6-v2) |
| **GitHub API** | Repository validation and metadata |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   User      │────▶│   Frontend   │────▶│   FastAPI       │
│  Browser    │◀────│   (Next.js)  │◀────│   Backend       │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                         ┌─────────────────────────┼─────────────────────────┐
                         │                         │                         │
                         ▼                         ▼                         ▼
                  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
                  │   GitHub    │          │  Pinecone   │          │    Groq     │
                  │    API      │          │ Vector DB   │          │     LLM     │
                  └─────────────┘          └─────────────┘          └─────────────┘
```

### Flow
1. **Ingestion**: GitHub repo → chunks → embeddings → Pinecone
2. **Query**: Question → embedding → Pinecone (context) → Groq (answer) → User

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- GitHub account

### 1. Clone the Repository

```bash
git clone https://github.com/Abdullah-9862873/Gemini-Live-Agent-Challenge.git
cd Gemini-Live-Agent-Challenge
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Pinecone Configuration
# Get your free API key at: https://www.pinecone.io/
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=repo-vectors

# Groq Configuration
# Get your free API key at: https://console.groq.com/ (no billing required)
GROQ_API_KEY=your_groq_api_key

# GitHub Token (optional, for higher rate limits)
GITHUB_TOKEN=your_github_token

# Optional settings
EMBEDDING_MODEL=all-MiniLM-L6-v2
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.3
```

### 5. Groq API Setup (Free)

1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up for a free account (no credit card required)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key and add it to your `.env` file as `GROQ_API_KEY`

**Groq Free Tier:**
- Unlimited requests per month
- No billing/credit card required
- Uses LLaMA 3.1 8B model
- Fast inference speeds

### 6. Pinecone Setup (Free Tier)

1. Go to [https://www.pinecone.io/](https://www.pinecone.io/)
2. Create a free account
3. Create a new Index:
   - **Index Name:** `repo-vectors` (or your choice)
   - **Dimension:** 384
   - **Metric:** Cosine
4. Copy your API key and add it to `.env`

### 7. Run the Application

**Start Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

python -m uvicorn main:app --reload --port 8000
```

**Start Frontend (new terminal):**
```bash
cd frontend
npm run dev
```

### 8. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## Usage

### GitHub Repository Mode

1. Enter a public GitHub repository URL (e.g., `microsoft/vscode` or `https://github.com/microsoft/vscode`)
2. Click **Check** to validate the repository
3. Click **Ingest This Repository** to load it into the vector database
4. Ask questions about the codebase using the input field
5. View AI-powered answers with source citations

### Single File Mode

1. Switch to **Single File** mode
2. Upload any code file (.py, .js, .java, etc.)
3. Ask questions specific to that file

### Clear Data

Click the **Clear** button to reset the vector database and start fresh.

## Project Structure

```
Gemini-Live-Agent-Challenge/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Environment configuration
│   ├── llm_chain.py         # Groq LLM integration
│   ├── rag_pipeline.py     # RAG pipeline implementation
│   ├── vector_db.py        # Pinecone vector database
│   ├── embeddings.py        # Sentence transformer embeddings
│   ├── github_ingest.py     # GitHub repository ingestion
│   ├── ingestion_pipeline.py # Complete ingestion workflow
│   ├── single_file.py      # Single file processing
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── pages/
│   │   └── index.tsx        # Main application page
│   ├── components/         # React components
│   ├── styles/              # CSS modules
│   ├── lib/
│   │   └── api.ts          # API service layer
│   └── package.json
├── .env                     # Environment variables (create this)
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/validate-repo` | Validate GitHub repository |
| POST | `/ingest` | Ingest repository into vector DB |
| GET | `/ingest/status` | Get ingestion status |
| POST | `/ingest/clear` | Clear all vectors |
| POST | `/ingest/single` | Upload single file |
| POST | `/ask` | Ask a question (RAG + LLM) |
| POST | `/ask/single` | Ask about uploaded file |

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Groq](https://groq.com/) - Free LLM inference
- [Pinecone](https://www.pinecone.io/) - Vector database
- [Hugging Face](https://huggingface.co/) - Sentence transformers
- [GitHub](https://github.com/) - Repository hosting
