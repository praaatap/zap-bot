from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from .models import Interview, InterviewChunk, ConversationMessage, LiveEvent, get_db
from .services import get_embedding_service, get_llm_service, get_transcript_processor
from .rag_chain import InterviewRAGChain
from .websocket_manager import get_connection_manager
from .config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["interview"])

# Initialize RAG chain
embedding_svc = get_embedding_service()
llm_svc = get_llm_service()
rag_chain = InterviewRAGChain(embedding_svc, llm_svc)
tx_processor = get_transcript_processor()
ws_manager = get_connection_manager()

# ============= Interview Management =============

@router.post("/interviews")
async def create_interview(
    candidate_id: str,
    candidate_name: str,
    position: str,
    interview_date: str,
    interviewer: str,
    candidate_email: str = None,
    db: Session = Depends(get_db)
):
    """Create a new interview"""
    try:
        interview = Interview(
            candidate_id=candidate_id,
            candidate_name=candidate_name,
            candidate_email=candidate_email,
            position=position,
            interview_date=datetime.fromisoformat(interview_date),
            interviewer=interviewer,
            status="SCHEDULED"
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        
        logger.info(f"Created interview {interview.id} for {candidate_name}")
        
        return {
            "id": interview.id,
            "candidate_name": interview.candidate_name,
            "position": interview.position,
            "status": interview.status
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating interview: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/interviews/{interview_id}")
async def get_interview(
    interview_id: str,
    db: Session = Depends(get_db)
):
    """Get interview details"""
    interview = db.query(Interview).filter(
        Interview.id == interview_id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return {
        "id": interview.id,
        "candidate_id": interview.candidate_id,
        "candidate_name": interview.candidate_name,
        "position": interview.position,
        "status": interview.status,
        "is_live": interview.is_live,
        "start_time": interview.start_time,
        "end_time": interview.end_time,
        "call_duration": interview.call_duration,
        "summary": interview.summary
    }

@router.get("/interviews")
async def list_interviews(
    is_live: bool = None,
    db: Session = Depends(get_db)
):
    """List interviews"""
    query = db.query(Interview)
    
    if is_live is not None:
        query = query.filter(Interview.is_live == is_live)
    
    interviews = query.order_by(Interview.interview_date.desc()).limit(50).all()
    
    return [
        {
            "id": i.id,
            "candidate_name": i.candidate_name,
            "position": i.position,
            "status": i.status,
            "is_live": i.is_live
        }
        for i in interviews
    ]

# ============= RAG Chat =============

@router.post("/rag/{interview_id}/chat")
async def chat_with_interview(
    interview_id: str,
    query: str,
    db: Session = Depends(get_db)
):
    """Ask question about interview using RAG"""
    try:
        # Verify interview exists
        interview = db.query(Interview).filter(
            Interview.id == interview_id
        ).first()
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Run RAG pipeline
        rag_response = await rag_chain.run(query, interview_id)
        
        # Save conversation
        user_msg = ConversationMessage(
            interview_id=interview_id,
            role="user",
            content=query,
            retrieved_chunks=[c["chunk_id"] for c in rag_response["sources"]]
        )
        db.add(user_msg)
        
        assistant_msg = ConversationMessage(
            interview_id=interview_id,
            role="assistant",
            content=rag_response["answer"],
            retrieved_chunks=[c["chunk_id"] for c in rag_response["sources"]]
        )
        db.add(assistant_msg)
        
        db.commit()
        
        logger.info(f"RAG chat for interview {interview_id}")
        
        # Broadcast to live viewers
        await ws_manager.broadcast_answer(
            interview_id,
            query,
            rag_response["answer"],
            rag_response["sources"]
        )
        
        return rag_response
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in RAG chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rag/{interview_id}/ingest")
async def ingest_transcript(
    interview_id: str,
    transcript: str,
    db: Session = Depends(get_db)
):
    """Ingest interview transcript"""
    try:
        interview = db.query(Interview).filter(
            Interview.id == interview_id
        ).first()
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Process transcript into chunks
        chunks = tx_processor.chunk_transcript(transcript)
        
        # Save chunks to DB
        for chunk in chunks:
            db_chunk = InterviewChunk(
                interview_id=interview_id,
                content=chunk["content"],
                chunk_index=chunk["index"],
                speaker=chunk["speaker"]
            )
            db.add(db_chunk)
        
        # Upsert to Pinecone
        await embedding_svc.upsert_chunks(interview_id, chunks)
        
        # Update interview
        interview.transcript = transcript
        interview.updated_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Ingested {len(chunks)} chunks for interview {interview_id}")
        
        return {
            "success": True,
            "chunk_count": len(chunks),
            "interview_id": interview_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error ingesting transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rag/{interview_id}/history")
async def get_conversation_history(
    interview_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get conversation history"""
    messages = db.query(ConversationMessage).filter(
        ConversationMessage.interview_id == interview_id
    ).order_by(ConversationMessage.created_at.asc()).limit(limit).all()
    
    return [
        {
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]

# ============= Live Status =============

@router.post("/status/{interview_id}/start")
async def start_interview(
    interview_id: str,
    db: Session = Depends(get_db)
):
    """Start interview (mark as live)"""
    try:
        interview = db.query(Interview).filter(
            Interview.id == interview_id
        ).first()
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        interview.is_live = True
        interview.status = "IN_PROGRESS"
        interview.start_time = datetime.utcnow()
        
        event = LiveEvent(
            interview_id=interview_id,
            event_type="call_started",
            data={"action": "interview_started"}
        )
        
        db.add(event)
        db.commit()
        
        logger.info(f"Started interview {interview_id}")
        await ws_manager.broadcast_status_update(interview_id, "IN_PROGRESS")
        
        return {"success": True, "status": "IN_PROGRESS"}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error starting interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/status/{interview_id}/end")
async def end_interview(
    interview_id: str,
    db: Session = Depends(get_db)
):
    """End interview"""
    try:
        interview = db.query(Interview).filter(
            Interview.id == interview_id
        ).first()
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        interview.is_live = False
        interview.status = "COMPLETED"
        interview.end_time = datetime.utcnow()
        
        if interview.start_time:
            duration = int((interview.end_time - interview.start_time).total_seconds())
            interview.call_duration = duration
        
        event = LiveEvent(
            interview_id=interview_id,
            event_type="call_ended",
            data={"action": "interview_ended", "duration": interview.call_duration}
        )
        
        db.add(event)
        db.commit()
        
        logger.info(f"Ended interview {interview_id}")
        await ws_manager.broadcast_status_update(interview_id, "COMPLETED")
        
        return {"success": True, "status": "COMPLETED"}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error ending interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{interview_id}")
async def get_interview_status(
    interview_id: str,
    db: Session = Depends(get_db)
):
    """Get interview status"""
    interview = db.query(Interview).filter(
        Interview.id == interview_id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return {
        "id": interview.id,
        "candidate_name": interview.candidate_name,
        "status": interview.status,
        "is_live": interview.is_live,
        "start_time": interview.start_time.isoformat() if interview.start_time else None,
        "end_time": interview.end_time.isoformat() if interview.end_time else None,
        "call_duration": interview.call_duration,
        "viewers": ws_manager.get_connection_count(interview_id)
    }

@router.get("/status")
async def get_all_statuses(db: Session = Depends(get_db)):
    """Get all interviews status"""
    live = db.query(Interview).filter(Interview.is_live == True).all()
    
    return {
        "live": [
            {
                "id": i.id,
                "candidate_name": i.candidate_name,
                "status": i.status,
                "viewers": ws_manager.get_connection_count(i.id)
            }
            for i in live
        ],
        "active_interviews": ws_manager.get_active_interviews()
    }

@router.post("/status/{interview_id}/transcript-chunk")
async def report_transcript_chunk(
    interview_id: str,
    content: str,
    speaker: str = None,
    timestamp: int = None,
    db: Session = Depends(get_db)
):
    """Report live transcript chunk (during call)"""
    try:
        interview = db.query(Interview).filter(
            Interview.id == interview_id
        ).first()
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Append to transcript
        interview.transcript = (interview.transcript or "") + f"\n[{speaker}]: {content}"
        
        event = LiveEvent(
            interview_id=interview_id,
            event_type="transcript_chunk",
            data={"content": content, "speaker": speaker, "timestamp": timestamp}
        )
        
        db.add(event)
        db.commit()
        
        # Broadcast update
        await ws_manager.broadcast_transcript_chunk(
            interview_id,
            content,
            speaker,
            timestamp
        )
        
        return {"success": True}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error reporting transcript chunk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{interview_id}/events")
async def get_interview_events(
    interview_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get interview events"""
    events = db.query(LiveEvent).filter(
        LiveEvent.interview_id == interview_id
    ).order_by(LiveEvent.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "event_type": e.event_type,
            "data": e.data,
            "timestamp": e.timestamp.isoformat()
        }
        for e in events
    ]

# ============= Health =============

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "interview-rag-python",
        "interviews": ws_manager.get_active_interviews()
    }
