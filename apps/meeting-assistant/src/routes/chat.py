"""API routes for chat and RAG"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import Optional, List
from uuid import uuid4
from datetime import datetime
import json
import logging
import time

from ..models import (
    MeetingChatRequest,
    ChatResponse,
    MeetingTranscriptChunk,
    MeetingSummary,
)
from ..vector_store import get_vector_store
from ..llm import get_llm
from ..database import get_database
from ..websocket_manager import get_connection_manager
from ..workflow import get_workflow
from ..config import get_settings

router = APIRouter(prefix="/api/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/{meeting_id}/ask", response_model=ChatResponse)
async def ask_meeting_question(
    meeting_id: str,
    request: MeetingChatRequest,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Ask a question about the meeting using RAG"""
    start_time = time.time()
    
    try:
        # Get vector store and LLM
        vector_store = get_vector_store()
        llm = get_llm(settings.groq_api_key, settings.groq_model_llm)

        meeting = await db.get_meeting(meeting_id)
        transcript_text = meeting.transcript if meeting and meeting.transcript else ""

        intent = llm.detect_query_intent(request.query)
        fast_intents = {"recap", "summary", "action_items", "decisions", "next_steps"}

        chunks = []
        if intent not in fast_intents:
            # Only do vector retrieval for open QA; intent requests can answer directly from transcript.
            chunks = await vector_store.query_documents(
                meeting_id=meeting_id,
                query=request.query,
                top_k=request.context_limit,
            )

            if not chunks:
                logger.warning(f"No chunks found for query in meeting {meeting_id}")

        # Generate intent-aware answer
        intent_result = llm.generate_intent_response(
            query=request.query,
            transcript=transcript_text,
            context_chunks=chunks,
        )
        answer = intent_result["answer"]
        confidence = intent_result["confidence"]
        intent = intent_result["intent"]

        # Store conversation
        message_id = str(uuid4())
        chunk_ids = [chunk["id"] for chunk in chunks]
        
        await db.add_message(message_id, {
            "meeting_id": meeting_id,
            "role": "user",
            "content": request.query,
            "retrieved_chunk_ids": chunk_ids,
        })

        response_id = str(uuid4())
        await db.add_message(response_id, {
            "meeting_id": meeting_id,
            "role": "assistant",
            "content": answer,
            "retrieved_chunk_ids": chunk_ids,
        })

        processing_time_ms = (time.time() - start_time) * 1000

        return ChatResponse(
            answer=answer,
            sources=[
                {
                    "chunk_id": chunk["id"],
                    "content": chunk["content"],
                    "relevance_score": chunk["score"],
                }
                for chunk in chunks
            ],
            confidence=confidence,
            processing_time_ms=processing_time_ms,
            intent=intent,
        )

    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{meeting_id}/ingest", response_model=dict)
async def ingest_meeting_transcript(
    meeting_id: str,
    request: dict = None,
    file: Optional[UploadFile] = None,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Ingest meeting transcript (full or partial)"""
    try:
        transcript = None

        # Get transcript from request or file
        if request:
            transcript = request.get("transcript")
        elif file:
            content = await file.read()
            transcript = content.decode("utf-8")

        if not transcript:
            raise HTTPException(status_code=400, detail="No transcript provided")

        # Chunk transcript
        vector_store = get_vector_store()
        chunk_size = settings.chunk_size
        overlap = settings.chunk_overlap

        chunks = []
        tokens = transcript.split()
        start = 0

        while start < len(tokens):
            end = min(start + chunk_size, len(tokens))
            chunk_text = " ".join(tokens[start:end])
            
            chunks.append({
                "content": chunk_text,
                "speaker": None,  # Could be extracted if format supports it
                "timestamp": None,
            })

            start = end - overlap

        # Add to vector store
        doc_ids = await vector_store.add_documents(meeting_id, chunks)

        logger.info(f"Ingested {len(doc_ids)} chunks for meeting {meeting_id}")

        return {
            "success": True,
            "meeting_id": meeting_id,
            "chunks_ingested": len(doc_ids),
            "chunk_ids": doc_ids,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ingesting transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{meeting_id}/transcript-chunk", response_model=dict)
async def report_transcript_chunk(
    meeting_id: str,
    chunk: MeetingTranscriptChunk,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Report a live transcript chunk (during meeting)"""
    try:
        # Store chunk
        chunk_id = f"{meeting_id}_chunk_{chunk.timestamp}"
        
        await db.add_chunk(meeting_id, chunk_id, {
            "content": chunk.content,
            "speaker": chunk.speaker,
            "timestamp": chunk.timestamp,
            "chunk_index": 0,
        })

        await db.append_transcript_chunk(meeting_id, chunk.content, chunk.speaker)
        await db.add_meeting_event(str(uuid4()), {
            "meeting_id": meeting_id,
            "event_type": "transcript_chunk",
            "data": {
                "chunk_id": chunk_id,
                "speaker": chunk.speaker,
                "timestamp": chunk.timestamp,
            },
        })

        # Add to vector store
        vector_store = get_vector_store()
        await vector_store.add_documents(
            meeting_id,
            [{
                "content": chunk.content,
                "speaker": chunk.speaker,
                "timestamp": chunk.timestamp,
            }],
        )

        # Broadcast to connected clients
        manager = get_connection_manager()
        await manager.broadcast_transcript_chunk(
            meeting_id,
            chunk.content,
            chunk.speaker,
            chunk.timestamp,
        )

        analytics = await db.get_meeting_analytics(meeting_id)
        if analytics:
            await manager.broadcast_analytics_update(meeting_id, analytics)

        return {"success": True, "chunk_id": chunk_id}

    except Exception as e:
        logger.error(f"Error reporting transcript chunk: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{meeting_id}/summary", response_model=MeetingSummary)
async def generate_meeting_summary(
    meeting_id: str,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Generate meeting summary from transcript"""
    try:
        # Get meeting
        meeting = await db.get_meeting(meeting_id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")

        if not meeting.transcript:
            raise HTTPException(status_code=400, detail="No transcript available")

        # Generate summary
        llm = get_llm(settings.groq_api_key, settings.groq_model_llm)
        summary_data = llm.generate_meeting_summary(meeting.transcript)

        return MeetingSummary(
            meeting_id=meeting_id,
            title=meeting.title,
            summary=summary_data.get("summary", ""),
            key_points=summary_data.get("key_points", []),
            action_items=summary_data.get("action_items", []),
            participants=meeting.participants,
            duration_minutes=meeting.duration_seconds / 60 if meeting.duration_seconds else None,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{meeting_id}/recap", response_model=dict)
async def get_meeting_recap(
    meeting_id: str,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Get quick recap of meeting"""
    try:
        meeting = await db.get_meeting(meeting_id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")

        if not meeting.transcript:
            return {"recap": "No transcript available yet"}

        llm = get_llm(settings.groq_api_key, settings.groq_model_llm)
        recap = llm.generate_recap(meeting.transcript)

        return {"recap": recap, "meeting_id": meeting_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recap: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{meeting_id}/history", response_model=List[dict])
async def get_conversation_history(
    meeting_id: str,
    limit: int = Query(50, ge=1, le=500),
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Get conversation history for a meeting"""
    try:
        return await db.get_conversation_history(meeting_id, limit)

    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
