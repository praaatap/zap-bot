"""API routes for health and status"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from ..models import HealthStatus
from ..config import get_settings
from ..vector_store import get_vector_store
from ..llm import get_llm
from ..websocket_manager import get_connection_manager
from datetime import datetime

router = APIRouter(prefix="/api", tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/health", response_model=HealthStatus)
async def health_check(settings=Depends(get_settings)):
    """Health check endpoint"""
    
    # Check Groq
    groq_available = False
    try:
        llm = get_llm(settings.groq_api_key, settings.groq_model_llm)
        groq_available = True
    except Exception as e:
        logger.warning(f"Groq unavailable: {e}")

    # Check Pinecone
    pinecone_available = False
    try:
        vector_store = get_vector_store()
        pinecone_available = True
    except Exception as e:
        logger.warning(f"Pinecone unavailable: {e}")

    # Check database
    database_available = False
    try:
        from ..database import get_database
        db = get_database(settings.database_url)
        database_available = True
    except Exception as e:
        logger.warning(f"Database unavailable: {e}")

    return HealthStatus(
        status="ok" if all([groq_available, pinecone_available, database_available]) else "degraded",
        service="meeting-assistant",
        timestamp=datetime.utcnow(),
        groq_available=groq_available,
        pinecone_available=pinecone_available,
        database_available=database_available,
    )


@router.get("/status", response_model=dict)
async def get_status(settings=Depends(get_settings)):
    """Get service status"""
    manager = get_connection_manager()
    active_meetings = manager.get_active_meetings()
    
    total_connections = sum(
        manager.get_connection_count(meeting_id)
        for meeting_id in active_meetings
    )

    return {
        "service": "meeting-assistant",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "active_meetings": len(active_meetings),
        "total_websocket_connections": total_connections,
        "meetings": active_meetings,
    }
