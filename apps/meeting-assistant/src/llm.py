"""LLM and LangChain integration with Groq"""

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser
from typing import List, Dict, Any
import json
import logging

logger = logging.getLogger(__name__)


class MeetingAssistantLLM:
    """Meeting Assistant LLM powered by Groq"""

    def __init__(self, api_key: str, model: str = "mixtral-8x7b-32768"):
        self.llm = ChatGroq(
            temperature=0.7,
            groq_api_key=api_key,
            model_name=model,
        )
        self.model = model

    def answer_meeting_question(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
    ) -> tuple[str, float]:
        """Answer a question about meeting using RAG context"""
        try:
            # Build context from chunks
            context = self._build_context(context_chunks)

            system_prompt = """You are a helpful meeting assistant. Your role is to answer questions about meetings based on the provided context.

Guidelines:
- Answer questions based ONLY on the provided meeting context
- Be concise and specific
- If information is not in the context, say "This information wasn't discussed in the meeting"
- Highlight key points that support your answer
- Be factual, not speculative"""

            human_template = """Meeting Context:
{context}

Question: {query}

Please provide a helpful answer based on the meeting context above."""

            prompt = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(system_prompt),
                HumanMessagePromptTemplate.from_template(human_template),
            ])

            chain = prompt | self.llm | StrOutputParser()

            answer = chain.invoke({
                "context": context,
                "query": query,
            })

            # Calculate confidence based on context relevance
            confidence = self._calculate_confidence(context_chunks)

            return answer, confidence

        except Exception as e:
            logger.error(f"Error in answer_meeting_question: {e}")
            raise

    def detect_query_intent(self, query: str) -> str:
        """Detect intent from user query for intent-aware responses."""
        q = (query or "").strip().lower()

        if any(token in q for token in ["recap", "tl;dr", "quick recap", "short recap", "brief recap"]):
            return "recap"
        if any(token in q for token in ["summary", "summarize", "summarise", "overall summary"]):
            return "summary"
        if any(token in q for token in ["action item", "todo", "to-do", "tasks", "follow up", "follow-up"]):
            return "action_items"
        if any(token in q for token in ["decision", "decisions", "agreed", "final call"]):
            return "decisions"
        if any(token in q for token in ["next step", "next steps", "what next", "plan ahead"]):
            return "next_steps"

        return "qa"

    def generate_intent_response(
        self,
        query: str,
        transcript: str,
        context_chunks: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Generate answer based on detected query intent."""
        intent = self.detect_query_intent(query)

        try:
            if intent == "recap":
                answer = self.generate_recap(transcript, max_length=500)
                return {"intent": intent, "answer": answer, "confidence": 0.9}

            if intent in ["summary", "decisions", "next_steps"]:
                summary_data = self.generate_meeting_summary(transcript)

                if intent == "summary":
                    answer = summary_data.get("summary", "No summary available")
                elif intent == "decisions":
                    decisions = summary_data.get("decisions", [])
                    answer = "\n".join(f"- {d}" for d in decisions) if decisions else "No explicit decisions were identified."
                else:
                    next_steps = summary_data.get("next_steps", [])
                    answer = "\n".join(f"- {s}" for s in next_steps) if next_steps else "No explicit next steps were identified."

                return {"intent": intent, "answer": answer, "confidence": 0.88}

            if intent == "action_items":
                action_items = self.extract_action_items(transcript)
                answer = "\n".join(f"- {item}" for item in action_items) if action_items else "No action items were found."
                return {"intent": intent, "answer": answer, "confidence": 0.87}

            answer, confidence = self.answer_meeting_question(query, context_chunks)
            return {"intent": "qa", "answer": answer, "confidence": confidence}

        except Exception as e:
            logger.error(f"Error in generate_intent_response: {e}")
            answer, confidence = self.answer_meeting_question(query, context_chunks)
            return {"intent": "qa", "answer": answer, "confidence": confidence}

    def generate_meeting_summary(self, transcript: str) -> Dict[str, Any]:
        """Generate comprehensive meeting summary"""
        try:
            system_prompt = """You are an expert meeting summarizer. Analyze the meeting transcript and provide:
1. A concise summary (2-3 sentences)
2. Key points discussed (5-7 bullet points)
3. Action items (what needs to be done, by whom, deadline if mentioned)
4. Decisions made
5. Next steps

Format your response as JSON with keys: summary, key_points, action_items, decisions, next_steps"""

            human_template = """Please summarize this meeting transcript:

{transcript}"""

            prompt = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(system_prompt),
                HumanMessagePromptTemplate.from_template(human_template),
            ])

            chain = prompt | self.llm | StrOutputParser()

            response = chain.invoke({"transcript": transcript})

            # Try to parse as JSON
            try:
                summary_data = json.loads(response)
            except json.JSONDecodeError:
                # Fallback if not valid JSON
                summary_data = {
                    "summary": response,
                    "key_points": [],
                    "action_items": [],
                    "decisions": [],
                    "next_steps": [],
                }

            return summary_data

        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            raise

    def extract_action_items(self, transcript: str) -> List[str]:
        """Extract action items from transcript"""
        try:
            system_prompt = """Extract all action items from this meeting transcript. 
Action items are tasks that need to be done, typically mentioned with phrases like:
- "We need to..."
- "Someone should..."
- "Follow up on..."
- "Please..."
- "By [date]..."

Return ONLY a JSON array of strings, each being an action item."""

            human_template = """Meeting transcript:

{transcript}

Extract action items as a JSON array."""

            prompt = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(system_prompt),
                HumanMessagePromptTemplate.from_template(human_template),
            ])

            chain = prompt | self.llm | StrOutputParser()

            response = chain.invoke({"transcript": transcript})

            try:
                action_items = json.loads(response)
            except json.JSONDecodeError:
                action_items = [response]

            return action_items if isinstance(action_items, list) else [action_items]

        except Exception as e:
            logger.error(f"Error extracting action items: {e}")
            return []

    def generate_recap(self, transcript: str, max_length: int = 500) -> str:
        """Generate quick recap of meeting"""
        try:
            human_template = f"""Please provide a brief recap of this meeting in under {max_length} characters:

{transcript}"""

            prompt = ChatPromptTemplate.from_messages([
                HumanMessagePromptTemplate.from_template(human_template),
            ])

            chain = prompt | self.llm | StrOutputParser()

            recap = chain.invoke({})
            return recap[:max_length]

        except Exception as e:
            logger.error(f"Error generating recap: {e}")
            return ""

    def _build_context(self, chunks: List[Dict[str, Any]]) -> str:
        """Build context string from chunks"""
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            speaker = chunk.get("speaker", "Unknown")
            content = chunk.get("content", "")
            timestamp = chunk.get("timestamp", "")
            score = chunk.get("score", 0.0)

            context_parts.append(
                f"[Chunk {i} - {speaker} - Relevance: {score:.2f}]\n{content}\n"
            )

        return "\n".join(context_parts)

    def _calculate_confidence(self, chunks: List[Dict[str, Any]]) -> float:
        """Calculate confidence based on retrieval scores"""
        if not chunks:
            return 0.0

        scores = [chunk.get("score", 0.0) for chunk in chunks]
        avg_score = sum(scores) / len(scores)
        return min(avg_score, 1.0)


# Global LLM instance
_llm: MeetingAssistantLLM = None


def get_llm(api_key: str, model: str = "mixtral-8x7b-32768") -> MeetingAssistantLLM:
    """Get LLM instance"""
    global _llm
    if _llm is None:
        _llm = MeetingAssistantLLM(api_key, model)
    return _llm
