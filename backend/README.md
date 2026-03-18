# Making Repos Speakable - Backend API

**Give brain and tongue to your GitHub repositories.**

This is the backend API for "Making Repos Speakable" - an AI-powered application that transforms GitHub repositories into interactive, queryable knowledge bases.

## Features

- GitHub repository validation and ingestion
- RAG-powered Q&A with vector search
- Single file upload support
- Groq LLM integration (free, no billing)

## Tech Stack

- **FastAPI** - High-performance Python web framework
- **Pinecone** - Vector database
- **Groq API** - LLaMA 3.1 LLM (truly free)
- **Sentence Transformers** - Embeddings

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/validate-repo` | Validate GitHub repository |
| POST | `/ingest` | Ingest repository |
| GET | `/ingest/status` | Get ingestion status |
| POST | `/ingest/clear` | Clear all vectors |
| POST | `/ingest/single` | Upload single file |
| POST | `/ask` | Ask a question |
| POST | `/ask/single` | Ask about uploaded file |

## Environment Variables

- `GROQ_API_KEY` - Groq API key (get free at https://console.groq.com/)
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_INDEX_NAME` - Pinecone index name

## License

MIT
