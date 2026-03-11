from langgraph.graph import StateGraph, END
from langchain.schema import HumanMessage, AIMessage
from typing import TypedDict, List, Optional
import logging

logger = logging.getLogger(__name__)

class RAGState(TypedDict):
    query: str
    interview_id: str
    context_chunks: List[dict]
    answer: str
    sources: List[dict]
    confidence: float

class InterviewRAGChain:
    def __init__(self, embedding_service, llm_service):
        self.embedding_service = embedding_service
        self.llm_service = llm_service
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build LangGraph workflow for RAG"""
        graph = StateGraph(RAGState)
        
        # Define nodes
        graph.add_node("retrieve", self._retrieve_node)
        graph.add_node("generate", self._generate_node)
        graph.add_node("format_response", self._format_response_node)
        
        # Define edges
        graph.add_edge("retrieve", "generate")
        graph.add_edge("generate", "format_response")
        graph.add_edge("format_response", END)
        
        # Set entry point
        graph.set_entry_point("retrieve")
        
        return graph.compile()
    
    async def _retrieve_node(self, state: RAGState) -> RAGState:
        """Retrieve relevant chunks from Pinecone"""
        logger.info(f"Retrieving chunks for query: {state['query']}")
        
        try:
            chunks = await self.embedding_service.query_vectors(
                query=state["query"],
                interview_id=state["interview_id"],
                top_k=5
            )
            
            state["context_chunks"] = chunks
            logger.info(f"Retrieved {len(chunks)} chunks")
        except Exception as e:
            logger.error(f"Retrieval error: {e}")
            state["context_chunks"] = []
        
        return state
    
    async def _generate_node(self, state: RAGState) -> RAGState:
        """Generate answer using retrieved context"""
        logger.info("Generating answer with LLM")
        
        if not state["context_chunks"]:
            state["answer"] = "No relevant information found in the interview transcript."
            state["confidence"] = 0.0
            return state
        
        try:
            # Build context from chunks
            context = "\n\n".join([
                f"[{chunk['speaker']}]: {chunk['content']}"
                for chunk in state["context_chunks"]
            ])
            
            # Generate answer
            answer = await self.llm_service.generate_answer(
                query=state["query"],
                context=context
            )
            
            state["answer"] = answer
            
            # Calculate confidence from chunk scores
            if state["context_chunks"]:
                avg_score = sum(c["score"] for c in state["context_chunks"]) / len(state["context_chunks"])
                state["confidence"] = min(1.0, avg_score)
            
        except Exception as e:
            logger.error(f"Generation error: {e}")
            state["answer"] = "Error generating answer"
            state["confidence"] = 0.0
        
        return state
    
    async def _format_response_node(self, state: RAGState) -> RAGState:
        """Format final response with sources"""
        state["sources"] = [
            {
                "chunk_id": chunk["id"],
                "text": chunk["content"][:200],
                "speaker": chunk["speaker"],
                "score": chunk["score"]
            }
            for chunk in state["context_chunks"]
        ]
        return state
    
    async def run(
        self,
        query: str,
        interview_id: str
    ) -> dict:
        """Execute RAG pipeline"""
        logger.info(f"Running RAG pipeline for interview {interview_id}")
        
        initial_state: RAGState = {
            "query": query,
            "interview_id": interview_id,
            "context_chunks": [],
            "answer": "",
            "sources": [],
            "confidence": 0.0
        }
        
        # Execute graph synchronously (LangGraph doesn't have async invoke yet)
        result = self.graph.invoke(initial_state)
        
        return {
            "answer": result["answer"],
            "sources": result["sources"],
            "confidence": result["confidence"]
        }
