from pinecone import Pinecone
from langchain_community.vectorstores import Pinecone as PineconeVectorStore
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_anthropic import ChatAnthropic
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import HumanMessage, AIMessage, BaseMessage
import logging

from .config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        # Initialize Pinecone
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.pc.Index(settings.pinecone_index_name)
        
        # Use HuggingFace embeddings (free alternative)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Pinecone vector store
        self.vectorstore = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings,
            text_key="content"
        )
        
        logger.info("EmbeddingService initialized")
    
    def embed_text(self, text: str) -> list:
        """Embed text using HuggingFace"""
        return self.embeddings.embed_query(text)
    
    async def upsert_chunks(
        self,
        interview_id: str,
        chunks: list[dict]
    ) -> None:
        """Upsert chunks to Pinecone"""
        try:
            vectors = []
            for chunk in chunks:
                embedding = self.embed_text(chunk["content"])
                vectors.append({
                    "id": chunk["id"],
                    "values": embedding,
                    "metadata": {
                        "interview_id": interview_id,
                        "content": chunk["content"],
                        "speaker": chunk.get("speaker"),
                        "index": chunk.get("index"),
                    }
                })
            
            # Upsert in batches
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                self.index.upsert(vectors=vectors[i:i+batch_size])
            
            logger.info(f"Upserted {len(vectors)} vectors for interview {interview_id}")
        except Exception as e:
            logger.error(f"Error upserting chunks: {e}")
            raise
    
    async def query_vectors(
        self,
        query: str,
        interview_id: str,
        top_k: int = 5
    ) -> list[dict]:
        """Query similar chunks from Pinecone"""
        try:
            query_embedding = self.embed_text(query)
            
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                filter={"interview_id": {"$eq": interview_id}},
                include_metadata=True
            )
            
            chunks = []
            for match in results.matches:
                chunks.append({
                    "id": match.id,
                    "content": match.metadata.get("content", ""),
                    "score": match.score,
                    "speaker": match.metadata.get("speaker"),
                })
            
            return chunks
        except Exception as e:
            logger.error(f"Error querying vectors: {e}")
            return []

class LLMService:
    def __init__(self):
        # Initialize LLM - use Groq if available, fallback to Anthropic
        if settings.groq_api_key:
            self.llm = ChatGroq(
                api_key=settings.groq_api_key,
                model_name="mixtral-8x7b-32768",
                temperature=0.7,
                max_tokens=1024
            )
            logger.info("Using Groq LLM")
        elif settings.anthropic_api_key:
            self.llm = ChatAnthropic(
                api_key=settings.anthropic_api_key,
                model_name="claude-3-sonnet-20240229",
                temperature=0.7,
                max_tokens=1024
            )
            logger.info("Using Anthropic LLM")
        else:
            raise ValueError("No LLM API key configured")
    
    async def generate_answer(
        self,
        query: str,
        context: str,
        conversation_history: list[BaseMessage] = None
    ) -> str:
        """Generate answer using LLM with context"""
        try:
            system_prompt = """You are an expert interview analysis assistant. Your role is to answer questions about interview transcripts.

Guidelines:
- Answer based ONLY on the provided context
- Be concise and specific
- If information is not in context, say "This information is not covered in the interview"
- Provide relevant details
- For candidate assessment: focus on facts, not assumptions"""
            
            messages = []
            
            # Add conversation history if available
            if conversation_history:
                messages.extend(conversation_history)
            
            # Add system context and current query
            messages.append(HumanMessage(content=f"""Context from interview:
{context}

Question: {query}

Please answer based on the context above."""))
            
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            raise
    
    async def generate_summary(self, transcript: str) -> str:
        """Generate interview summary"""
        try:
            prompt = f"""Summarize this interview transcript, highlighting:
- Candidate's key qualifications
- Technical skills
- Communication style
- Notable strengths
- Areas for development
- Overall fit assessment

Transcript:
{transcript}"""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            raise

class TranscriptProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def chunk_transcript(self, transcript: str) -> list[dict]:
        """Split transcript into chunks"""
        chunks = self.text_splitter.split_text(transcript)
        
        chunk_dicts = []
        for idx, chunk in enumerate(chunks):
            speaker = self._extract_speaker(chunk)
            chunk_dicts.append({
                "id": f"chunk_{idx}",
                "content": chunk,
                "index": idx,
                "speaker": speaker
            })
        
        return chunk_dicts
    
    def _extract_speaker(self, text: str) -> str:
        """Extract speaker name from chunk"""
        lines = text.split("\n")
        if lines:
            # Look for patterns like "Speaker: text"
            first_line = lines[0]
            if ":" in first_line:
                potential_speaker = first_line.split(":")[0].strip()
                if len(potential_speaker) < 50:  # Reasonable name length
                    return potential_speaker
        return "Unknown"

# Singleton instances
embedding_svc = None
llm_svc = None
transcript_processor = TranscriptProcessor()

def get_embedding_service():
    global embedding_svc
    if embedding_svc is None:
        embedding_svc = EmbeddingService()
    return embedding_svc

def get_llm_service():
    global llm_svc
    if llm_svc is None:
        llm_svc = LLMService()
    return llm_svc

def get_transcript_processor():
    return transcript_processor
