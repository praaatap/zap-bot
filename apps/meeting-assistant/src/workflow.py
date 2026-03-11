"""LangGraph workflow for meeting assistant"""

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from typing import TypedDict, List, Dict, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """State for meeting assistant agent"""
    meeting_id: str
    query: str
    retrieved_chunks: List[Dict[str, Any]]
    answer: Optional[str]
    confidence: float
    processing_steps: List[str]
    messages: List[BaseMessage]
    timestamp: datetime


class MeetingWorkflow:
    """LangGraph workflow for meeting assistant"""

    def __init__(self, llm, vector_store):
        self.llm = llm
        self.vector_store = vector_store
        self.graph = self._build_graph()

    def _build_graph(self):
        """Build the LangGraph workflow"""
        workflow = StateGraph(AgentState)

        # Define nodes
        workflow.add_node("retrieve", self._retrieve_documents)
        workflow.add_node("answer", self._generate_answer)
        workflow.add_node("finalize", self._finalize_response)

        # Define edges
        workflow.add_edge("retrieve", "answer")
        workflow.add_edge("answer", "finalize")
        workflow.add_edge("finalize", END)

        # Set entry point
        workflow.set_entry_point("retrieve")

        return workflow.compile()

    async def _retrieve_documents(self, state: AgentState) -> AgentState:
        """Retrieve relevant documents from vector store"""
        logger.info(f"Retrieving documents for query: {state['query']}")

        try:
            chunks = await self.vector_store.query_documents(
                meeting_id=state["meeting_id"],
                query=state["query"],
                top_k=5,
            )

            state["retrieved_chunks"] = chunks
            state["processing_steps"].append("retrieved_documents")
            logger.info(f"Retrieved {len(chunks)} chunks")

        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            state["retrieved_chunks"] = []
            state["processing_steps"].append(f"retrieve_error: {str(e)}")

        return state

    async def _generate_answer(self, state: AgentState) -> AgentState:
        """Generate answer using LLM and retrieved context"""
        logger.info("Generating answer using LLM")

        try:
            answer, confidence = self.llm.answer_meeting_question(
                query=state["query"],
                context_chunks=state["retrieved_chunks"],
            )

            state["answer"] = answer
            state["confidence"] = confidence
            state["processing_steps"].append("generated_answer")

            # Add to message history
            state["messages"] = [
                HumanMessage(content=state["query"]),
                AIMessage(content=answer),
            ]

        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            state["answer"] = f"Unable to generate answer: {str(e)}"
            state["confidence"] = 0.0
            state["processing_steps"].append(f"answer_error: {str(e)}")

        return state

    async def _finalize_response(self, state: AgentState) -> AgentState:
        """Finalize response for return"""
        logger.info("Finalizing response")
        state["processing_steps"].append("finalized")
        state["timestamp"] = datetime.utcnow()
        return state

    async def process_query(self, meeting_id: str, query: str) -> Dict[str, Any]:
        """Process a query through the workflow"""
        initial_state: AgentState = {
            "meeting_id": meeting_id,
            "query": query,
            "retrieved_chunks": [],
            "answer": None,
            "confidence": 0.0,
            "processing_steps": [],
            "messages": [],
            "timestamp": datetime.utcnow(),
        }

        # Run the graph
        result = self.graph.invoke(initial_state)

        return {
            "answer": result["answer"],
            "sources": result["retrieved_chunks"],
            "confidence": result["confidence"],
            "processing_steps": result["processing_steps"],
            "timestamp": result["timestamp"].isoformat(),
        }


# Global workflow instance
_workflow: Optional[MeetingWorkflow] = None


def get_workflow(llm, vector_store) -> MeetingWorkflow:
    """Get workflow instance"""
    global _workflow
    if _workflow is None:
        _workflow = MeetingWorkflow(llm, vector_store)
    return _workflow
