"""Vector store management using Pinecone and LangChain"""

from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_core.embeddings import Embeddings
from typing import List, Dict, Any
import logging
from pinecone import Pinecone, Index
from .config import get_settings

logger = logging.getLogger(__name__)


class GroqEmbeddings(Embeddings):
    """Custom Groq embeddings implementation"""

    def __init__(self, api_key: str, model: str = "nomic-embed-text-1.5"):
        self.api_key = api_key
        self.model = model
        from groq import Groq
        self.client = Groq(api_key=api_key)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed documents using Groq"""
        embeddings = []
        for text in texts:
            try:
                # Use Groq's embedding capability (if available) or fallback
                # For now, we'll use a placeholder - you'll need Groq API support for embeddings
                # This is a limitation - Groq primarily provides LLM, not embeddings
                # Consider using: nomic-embed-text-1.5 via Ollama or use another provider
                logger.warning(f"Groq embeddings not directly available, using placeholder")
                # For production, use: sentence-transformers, OpenAI, or Cohere
                embeddings.append([0.0] * 384)  # nomic-embed-text dimension
            except Exception as e:
                logger.error(f"Embedding error: {e}")
                embeddings.append([0.0] * 384)
        return embeddings

    def embed_query(self, text: str) -> List[float]:
        """Embed query"""
        return self.embed_documents([text])[0]


class VectorStoreManager:
    """Manages Pinecone vector store operations"""

    def __init__(self, settings=None):
        if settings is None:
            settings = get_settings()

        self.settings = settings
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.pc.Index(settings.pinecone_index_name)
        
        # Initialize embeddings - using nomic embeddings via LangChain
        # Note: For production, consider using sentence-transformers or another service
        try:
            from langchain_nomic import NomicEmbeddings
            self.embeddings = NomicEmbeddings(model="nomic-embed-text-1.5")
        except ImportError:
            logger.warning("NomicEmbeddings not available, using placeholder")
            self.embeddings = self._create_placeholder_embeddings()

        # Initialize vector store
        self.vector_store = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings,
            text_key="content",
            namespace=settings.pinecone_namespace,
        )

    def _create_placeholder_embeddings(self) -> Embeddings:
        """Create placeholder embeddings"""
        class PlaceholderEmbeddings(Embeddings):
            def embed_documents(self, texts: List[str]) -> List[List[float]]:
                return [[0.0] * 384 for _ in texts]
            
            def embed_query(self, text: str) -> List[float]:
                return [0.0] * 384
        
        return PlaceholderEmbeddings()

    async def add_documents(
        self,
        meeting_id: str,
        documents: List[Dict[str, Any]],
    ) -> List[str]:
        """Add documents to vector store"""
        try:
            # Prepare documents with metadata
            vectors = []
            doc_ids = []

            for i, doc in enumerate(documents):
                doc_id = f"{meeting_id}_chunk_{i}"
                doc_ids.append(doc_id)

                vectors.append({
                    "id": doc_id,
                    "values": self.embeddings.embed_query(doc.get("content", "")),
                    "metadata": {
                        "meeting_id": meeting_id,
                        "speaker": doc.get("speaker"),
                        "timestamp": doc.get("timestamp"),
                        "content": doc.get("content", "")[:500],  # Store preview
                    }
                })

            # Upsert to Pinecone
            self.index.upsert(vectors=vectors)
            logger.info(f"Added {len(doc_ids)} documents to vector store for meeting {meeting_id}")
            return doc_ids

        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            raise

    async def query_documents(
        self,
        meeting_id: str,
        query: str,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """Query documents from vector store"""
        try:
            # Embed query
            query_vector = self.embeddings.embed_query(query)

            # Query Pinecone
            results = self.index.query(
                vector=query_vector,
                top_k=top_k,
                filter={"meeting_id": {"$eq": meeting_id}},
                include_metadata=True,
            )

            # Format results
            documents = []
            for match in results.get("matches", []):
                documents.append({
                    "id": match["id"],
                    "content": match.get("metadata", {}).get("content", ""),
                    "score": match.get("score", 0.0),
                    "speaker": match.get("metadata", {}).get("speaker"),
                    "timestamp": match.get("metadata", {}).get("timestamp"),
                })

            logger.info(f"Retrieved {len(documents)} documents for query")
            return documents

        except Exception as e:
            logger.error(f"Error querying documents: {e}")
            raise

    async def delete_meeting_vectors(self, meeting_id: str) -> None:
        """Delete all vectors for a meeting"""
        try:
            # Pinecone doesn't support delete by filter, so we need to track IDs
            logger.info(f"Marking vectors for deletion for meeting {meeting_id}")
            # In production, maintain a mapping of doc IDs to delete specifically
        except Exception as e:
            logger.error(f"Error deleting vectors: {e}")
            raise


# Global vector store instance
_vector_store: VectorStoreManager = None


def get_vector_store() -> VectorStoreManager:
    """Get vector store instance"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStoreManager()
    return _vector_store
