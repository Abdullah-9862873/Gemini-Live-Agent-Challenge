AI Multimodal Tutor - Implementation Plan
=========================================

Project Overview
----------------
AI Multimodal Tutor transforms a GitHub programming course into a live AI-powered 
tutor using Vector DB + RAG + Gemini LLM with multimodal interaction (text, voice, 
code/images).

================================================================================
Phase 1: Project Setup & Infrastructure (Day 1 - Morning)
================================================================================

1. Create project directory structure
   ai-tutor-hackathon/
   ├── backend/
   │   ├── main.py
   │   ├── rag_pipeline.py
   │   ├── github_ingest.py
   │   ├── vector_db.py
   │   ├── llm_chain.py
   │   ├── multimodal.py
   │   └── requirements.txt
   ├── frontend/
   │   ├── components/
   │   ├── pages/
   │   ├── hooks/
   │   ├── styles/
   │   └── package.json
   ├── scripts/
   │   ├── deploy_gcp.sh
   │   └── ingest_course.sh
   ├── docker/
   │   ├── Dockerfile
   │   └── .dockerignore
   ├── .env.example
   └── README.md

2. Initialize Git repository
   - Run git init
   - Create .gitignore (Python, Node, Docker)

3. Set up virtual environment
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r backend/requirements.txt

4. Configure environment variables (.env)
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_ENVIRONMENT=us-east-1
   GEMINI_API_KEY=your_gemini_key
   GITHUB_TOKEN=your_github_token
   GITHUB_REPO=owner/repo-name
   GOOGLE_CLOUD_PROJECT=your-gcp-project

5. Set up Google Cloud
   - Create GCP project
   - Enable APIs: Cloud Run, Container Registry, Vertex AI
   - Install Google Cloud SDK

6. Create Docker configuration
   - backend/Dockerfile
   - docker-compose.yml for local dev

================================================================================
Phase 2: Backend - Core Components (Day 1 - Afternoon)
================================================================================

1. Set up FastAPI with basic endpoints
   - POST /ask - Text question
   - POST /ask/voice - Voice input
   - POST /ask/upload - Code/image upload
   - GET /health - Health check
   - POST /ingest - Trigger course ingestion

2. Implement vector_db.py
   - Pinecone connection setup
   - Index creation/management
   - upsert, query, delete operations
   - Metadata structure design

3. Implement github_ingest.py
   - Fetch repo content via GitHub API
   - Content parsing (Markdown, code files)
   - Chunking strategy (by headers, paragraphs, code blocks)
   - Metadata extraction (topic, file path, line numbers)

4. Implement embedding model integration
   - Use sentence-transformers or Google Embeddings API
   - Batch embedding generation for efficiency

5. Test Vector DB ingestion
   - Ingest sample course content
   - Verify search returns relevant results

================================================================================
Phase 3: RAG Pipeline (Day 2 - Morning)
================================================================================

1. Implement rag_pipeline.py
   - Query preprocessing
   - Generate query embedding
   - Vector DB similarity search (top-k=3-5)
   - Context assembly from matches

2. Add metadata filtering
   - Filter by topic/category
   - Filter by file type
   - Support for date-based filtering

3. Implement fallback logic
   - If no relevant context found (score < threshold)
   - Fall back to general Gemini knowledge
   - Flag responses as "general" vs "course-grounded"

4. Test RAG pipeline
   - End-to-end: question -> embedding -> search -> context
   - Verify context relevance

================================================================================
Phase 4: LLM Integration (Day 2 - Afternoon)
================================================================================

1. Configure Gemini API
   - Set up google.generativeai
   - Choose model (gemini-pro, gemini-pro-vision)

2. Build prompt templates
   - System prompt with course context instructions
   - User prompt with question + retrieved context
   - Format for code examples
   - Format for step-by-step explanations

3. Implement llm_chain.py
   - Combine RAG context with prompt
   - Call Gemini API
   - Parse and return response
   - Error handling and retries

4. Add multimodal output generation
   - Code snippet formatting (markdown/code blocks)
   - Diagram generation prompts for Gemini
   - Structure response: text + code + diagram reference

5. Integrate TTS for voice output
   - Use Google Cloud Text-to-Speech API
   - Convert response text to audio
   - Return audio URL or base64

================================================================================
Phase 5: Frontend Development (Day 3)
================================================================================

1. Initialize Next.js/React project
   npx create-next-app@latest frontend
   # or
   npm create vite@latest frontend -- --template react

2. Build UI components
   - QuestionInput.tsx - Text input form
   - VoiceInput.tsx - Voice recording button
   - FileUpload.tsx - Code/screenshot upload
   - ResponseDisplay.tsx - Show answers
   - CodeBlock.tsx - Syntax highlighted code
   - DiagramView.tsx - Display generated images

3. Implement API calls
   - Axios/Fetch wrapper for FastAPI endpoints
   - Request/response handling
   - Error states

4. Add loading & error handling
   - Loading spinners during API calls
   - Error messages for failed requests
   - Retry logic

5. Style with responsive design
   - CSS modules or Tailwind CSS
   - Mobile-friendly layout

================================================================================
Phase 6: Multimodal I/O Features (Day 4 - Morning)
================================================================================

1. Implement voice input
   - Web Speech API (SpeechRecognition)
   - Fallback for browsers without support
   - Visual feedback during recording

2. Implement voice output
   - Play received TTS audio
   - Playback controls (play/pause)

3. Add code syntax highlighting
   - Use Prism.js or highlight.js
   - Support multiple languages

4. Implement diagram/image display
   - Parse Gemini image responses
   - Display in modal or inline
   - Download option

5. Handle file uploads
   - Accept code snippets (.py, .js, .java, etc.)
   - Accept screenshots (png, jpg)
   - Preview before sending

================================================================================
Phase 7: Integration & Testing (Day 4 - Afternoon)
================================================================================

1. Connect frontend to backend
   - CORS configuration in FastAPI
   - API endpoint testing

2. End-to-end flow testing
   - Full user journey: ask -> retrieve -> respond
   - Verify multimodal outputs

3. Performance optimization
   - Lazy loading for images
   - Caching responses
   - Optimize embedding generation

4. Edge case handling
   - Empty questions
   - Very long questions
   - No matching context
   - API rate limits

5. User acceptance testing
   - Test with sample questions
   - Gather feedback
   - Fix issues

================================================================================
Phase 8: Deployment & Demo (Day 5)
================================================================================

1. Build Docker image
   docker build -t ai-tutor-backend ./backend
   docker build -t ai-tutor-frontend ./frontend

2. Push to Google Container Registry
   docker tag ai-tutor-backend gcr.io/PROJECT/ai-tutor-backend
   docker push gcr.io/PROJECT/ai-tutor-backend

3. Deploy to Cloud Run
   gcloud run deploy ai-tutor-backend --image gcr.io/PROJECT/ai-tutor-backend

4. Record demo video (<4 minutes)
   - Show voice input: "Explain quick sort"
   - Show Vector DB search
   - Show multimodal response (text + code + diagram + voice)

5. Prepare Devpost submission
   - Write project description
   - Upload screenshots/video
   - Add deployment links

6. Final testing & bug fixes
   - Smoke tests on deployed version
   - Fix any critical issues

================================================================================
Technical Dependencies
================================================================================

Backend (Python):
- fastapi
- uvicorn
- pinecone-client
- google-generativeai
- python-dotenv
- requests
- sentence-transformers
- google-cloud-texttospeech

Frontend (JavaScript/React):
- next or react
- axios
- prismjs
- react-syntax-highlighter

Infrastructure:
- Google Cloud Platform
- Cloud Run
- Container Registry
- Pinecone Vector DB

================================================================================
API Endpoints Summary
================================================================================

Method  Endpoint      Description
------  ---------     -------------
GET     /health       Health check
POST    /ask          Text question
POST    /ask/voice    Voice question (audio)
POST    /ask/upload   Code/image upload
POST    /ingest       Trigger course ingestion
GET     /history      Get session history

================================================================================
Success Criteria
================================================================================
[ ] Vector DB populated with course content
[ ] RAG returns relevant context for queries
[ ] Gemini generates grounded, course-specific answers
[ ] Frontend accepts text, voice, and file inputs
[ ] Response includes text, code, and optional diagram/audio
[ ] Deployed on Google Cloud Run
[ ] Working demo video recorded

================================================================================
