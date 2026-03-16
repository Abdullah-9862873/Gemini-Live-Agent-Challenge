// =============================================================================
// AI Multimodal Tutor - API Service
// =============================================================================
// Phase: 5 - Frontend Development
// Purpose: API communication layer with backend
// Version: 5.0.0
// =============================================================================

import axios, { AxiosInstance } from 'axios';

// API Base URL - defaults to localhost:8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API Service class for communicating with the backend.
 * Handles all HTTP requests to the FastAPI backend.
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('[API] Response error:', error);
        return Promise.reject(error);
      }
    );
  }

  // =============================================================================
  // Health & Info Endpoints
  // =============================================================================

  /**
   * Get API health status
   */
  async getHealth(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  /**
   * Get API root information
   */
  async getInfo(): Promise<any> {
    const response = await this.client.get('/');
    return response.data;
  }

  // =============================================================================
  // Ingestion Endpoints
  // =============================================================================

  /**
   * Validate GitHub repository (check if public/private)
   */
  async validateRepo(repo: string): Promise<any> {
    const response = await this.client.post('/validate-repo', {
      repo,
    });
    return response.data;
  }

  /**
   * Trigger course ingestion from GitHub repository
   */
  async ingestCourse(repo?: string, extensions?: string[]): Promise<any> {
    const response = await this.client.post('/ingest', {
      repo,
      extensions,
    });
    return response.data;
  }

  /**
   * Get ingestion status and statistics
   */
  async getIngestStatus(): Promise<any> {
    const response = await this.client.get('/ingest/status');
    return response.data;
  }

  /**
   * Upload and ingest a single file
   */
  async ingestSingleFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/ingest/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Ask a question about the single file
   */
  async askSingleFile(question: string, top_k: number = 5): Promise<any> {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('top_k', top_k.toString());
    
    const response = await this.client.post('/ask/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Clear single file content
   */
  async clearSingleFile(): Promise<any> {
    const response = await this.client.post('/ingest/single/clear');
    return response.data;
  }

  // =============================================================================
  // Q&A Endpoints
  // =============================================================================

  /**
   * Ask a question with RAG + LLM
   */
  async askQuestion(params: {
    question: string;
    top_k?: number;
    threshold?: number;
    prompt_type?: string;
    include_voice?: boolean;
  }): Promise<any> {
    const response = await this.client.post('/ask', params);
    return response.data;
  }

  /**
   * Direct RAG query (raw context, no LLM)
   */
  async ragQuery(query: string, top_k: number = 5, threshold: number = 0.7): Promise<any> {
    const response = await this.client.post('/rag/query', null, {
      params: { query, top_k, threshold },
    });
    return response.data;
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  /**
   * Check if backend is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.getHealth();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export interface AskRequest {
  question: string;
  top_k?: number;
  threshold?: number;
  prompt_type?: string;
  include_voice?: boolean;
}

export interface AskResponse {
  question: string;
  answer: string;
  has_context: boolean;
  context_used: boolean;
  sources: string[];
  num_contexts: number;
  top_score: number;
  has_code: boolean;
  code_blocks: CodeBlock[];
  voice_audio?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface IngestResponse {
  status: string;
  message: string;
  chunks_created: number;
  vectors_stored: number;
}

export interface HealthResponse {
  status: string;
  phase: string;
  version: string;
  components?: Record<string, string>;
}

export default apiService;
