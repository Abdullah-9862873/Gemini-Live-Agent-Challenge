# =============================================================================
# AI Multimodal Tutor - RAG Pipeline
# =============================================================================
# Phase: 3 - RAG Pipeline
# Purpose: Retrieval-Augmented Generation pipeline for question answering
# Version: 3.0.0
# =============================================================================

from typing import List, Dict, Any, Optional, Union
import logging
from backend.vector_db import vector_db
from backend.embeddings import embedding_model
from backend.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Retrieval-Augmented Generation Pipeline.
    
    This class handles the complete RAG workflow:
    1. Convert user query to embedding
    2. Search Vector DB for relevant context
    3. Filter results by metadata
    4. Assemble context for LLM
    5. Determine if fallback is needed
    
    Attributes:
        vector_db: Pinecone Vector DB instance
        embeddings: Embedding model instance
        top_k: Number of results to retrieve
        threshold: Minimum similarity score for relevance
    """
    
    def __init__(
        self,
        top_k: int = None,
        threshold: float = None
    ):
        """
        Initialize the RAG pipeline.
        
        Args:
            top_k: Number of results to retrieve (uses config default if None)
            threshold: Minimum similarity score (uses config default if None)
        """
        self.vector_db = vector_db
        self.embeddings = embedding_model
        self.top_k = top_k or settings.top_k_results
        self.threshold = threshold or settings.similarity_threshold
    
    def preprocess_query(self, query: str) -> str:
        """
        Preprocess user query for better retrieval.
        
        Args:
            query: Raw user query string
        
        Returns:
            Preprocessed query string
        """
        query = query.strip()
        
        query = query.lower()
        
        return query
    
    def generate_query_embedding(self, query: str) -> List[float]:
        """
        Generate embedding vector for the query.
        
        Args:
            query: Preprocessed query string
        
        Returns:
            Embedding vector as list of floats
        """
        logger.info(f"Generating embedding for query: {query[:50]}...")
        embedding = self.embeddings.encode_single(query)
        return embedding
    
    def search_vector_db(
        self,
        query_embedding: List[float],
        top_k: int = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search Vector DB for relevant context.
        
        Args:
            query_embedding: Query embedding vector
            top_k: Number of results (uses default if None)
            filters: Optional metadata filters
        
        Returns:
            List of search results with metadata and scores
        """
        top_k = top_k or self.top_k
        
        logger.info(f"Searching Vector DB with top_k={top_k}")
        
        results = self.vector_db.query_vectors(
            query_vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter_dict=filters
        )
        
        return results.get("matches", [])
    
    def filter_by_threshold(
        self,
        results: List[Dict[str, Any]],
        threshold: float = None
    ) -> List[Dict[str, Any]]:
        """
        Filter results by similarity threshold.
        
        Args:
            results: Search results from Vector DB
            threshold: Minimum similarity score (uses default if None)
        
        Returns:
            Filtered list of results
        """
        threshold = threshold or self.threshold
        
        filtered = [
            result for result in results
            if result.get("score", 0) >= threshold
        ]
        
        logger.info(f"Filtered {len(results)} results to {len(filtered)} by threshold {threshold}")
        
        return filtered
    
    def extract_contexts(
        self,
        results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Extract context information from search results.
        
        Args:
            results: Filtered search results
        
        Returns:
            List of context dictionaries with text and metadata
        """
        contexts = []
        
        for result in results:
            context = {
                "text": result.get("metadata", {}).get("text", ""),
                "source": result.get("metadata", {}).get("source", ""),
                "topic": result.get("metadata", {}).get("topic", ""),
                "file_type": result.get("metadata", {}).get("file_type", ""),
                "language": result.get("metadata", {}).get("language", ""),
                "score": result.get("score", 0)
            }
            contexts.append(context)
        
        return contexts
    
    def assemble_context_text(
        self,
        contexts: List[Dict[str, Any]],
        include_sources: bool = True
    ) -> str:
        """
        Assemble context texts into a single string for LLM prompt.
        
        Args:
            contexts: List of context dictionaries
            include_sources: Whether to include source citations
        
        Returns:
            Assembled context string
        """
        if not contexts:
            return ""
        
        context_parts = []
        
        for i, ctx in enumerate(contexts, 1):
            text = ctx.get("text", "")
            context_parts.append(f"[Context {i}]\n{text}")
            
            if include_sources:
                source = ctx.get("source", "")
                if source:
                    context_parts[-1] += f"\nSource: {source}"
        
        return "\n\n".join(context_parts)
    
    def run(
        self,
        query: str,
        top_k: int = None,
        threshold: float = None,
        filters: Optional[Dict[str, Any]] = None,
        include_sources: bool = True
    ) -> Dict[str, Any]:
        """
        Run the complete RAG pipeline.
        
        Args:
            query: User question/query string
            top_k: Number of results to retrieve
            threshold: Minimum similarity threshold
            filters: Optional metadata filters
            include_sources: Whether to include source citations
        
        Returns:
            Dictionary with context results and metadata
        
        Example:
            >>> rag = RAGPipeline()
            >>> result = rag.run("What is merge sort?")
            >>> print(result["answer"])
            "Based on the course material, merge sort is..."
            >>> print(result["contexts"][0]["source"])
            "README.md"
        """
        logger.info("=" * 50)
        logger.info(f"RAG Pipeline - Query: {query[:50]}...")
        logger.info("=" * 50)
        
        try:
            # Step 1: Preprocess query
            processed_query = self.preprocess_query(query)
            
            # Step 2: Generate embedding
            query_embedding = self.generate_query_embedding(processed_query)
            
            # Step 3: Search Vector DB
            search_results = self.search_vector_db(
                query_embedding,
                top_k=top_k,
                filters=filters
            )
            
            # Step 4: Filter by threshold
            filtered_results = self.filter_by_threshold(
                search_results,
                threshold=threshold
            )
            
            # Step 5: Extract contexts
            contexts = self.extract_contexts(filtered_results)
            
            # Step 6: Assemble context text
            context_text = self.assemble_context_text(contexts, include_sources)
            
            # Determine if we have relevant context
            has_relevant_context = len(contexts) > 0
            
            logger.info(f"RAG Pipeline - Found {len(contexts)} relevant contexts")
            logger.info("=" * 50)
            
            return {
                "query": query,
                "processed_query": processed_query,
                "has_relevant_context": has_relevant_context,
                "contexts": contexts,
                "context_text": context_text,
                "num_results": len(contexts),
                "top_score": contexts[0].get("score", 0) if contexts else 0,
                "status": "success"
            }
        
        except Exception as e:
            logger.error(f"RAG Pipeline failed: {e}")
            return {
                "query": query,
                "has_relevant_context": False,
                "contexts": [],
                "context_text": "",
                "num_results": 0,
                "top_score": 0,
                "status": "error",
                "error": str(e)
            }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def retrieve_context(
    query: str,
    top_k: int = None,
    threshold: float = None
) -> Dict[str, Any]:
    """
    Retrieve relevant context from Vector DB for a query.
    
    Convenience function that uses the RAG pipeline.
    
    Args:
        query: User question/query string
        top_k: Number of results to retrieve
        threshold: Minimum similarity threshold
    
    Returns:
        Dictionary with context results
    """
    pipeline = RAGPipeline(top_k=top_k, threshold=threshold)
    return pipeline.run(query=query)


def check_context_available() -> bool:
    """
    Check if Vector DB has any content indexed.
    
    Returns:
        True if context is available, False otherwise
    """
    try:
        stats = vector_db.get_index_stats()
        total_vectors = stats.get("total_vector_count", 0)
        return total_vectors > 0
    except Exception:
        return False


def get_context_count() -> int:
    """
    Get the number of vectors in the Vector DB.
    
    Returns:
        Number of indexed vectors
    """
    try:
        stats = vector_db.get_index_stats()
        return stats.get("total_vector_count", 0)
    except Exception:
        return 0
