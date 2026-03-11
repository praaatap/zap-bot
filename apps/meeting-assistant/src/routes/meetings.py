"""API routes for meetings"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from uuid import uuid4
from datetime import datetime
import logging

from ..models import (
    CreateMeetingRequest,
    MeetingStatus_Update,
    MeetingDashboard,
)
from ..database import get_database
from ..websocket_manager import get_connection_manager
from ..config import get_settings

router = APIRouter(prefix="/api/meetings", tags=["meetings"])
logger = logging.getLogger(__name__)


@router.post("", response_model=dict)
async def create_meeting(
    request: CreateMeetingRequest,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Create a new meeting"""
    try:
        meeting_id = str(uuid4())
        
        await db.create_meeting(meeting_id, {
            "title": request.title,
            "description": request.description,
            "platform": request.meeting_platform,
            "participants": request.participants,
            "scheduled_at": request.meeting_date,
        })

        return {
            "id": meeting_id,
            "title": request.title,
            "status": "SCHEDULED",
        }

    except Exception as e:
        logger.error(f"Error creating meeting: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{meeting_id}", response_model=dict)
async def get_meeting(
    meeting_id: str,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Get meeting details"""
    try:
        meeting = await db.get_meeting(meeting_id)
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")

        return {
            "id": meeting.id,
            "title": meeting.title,
            "description": meeting.description,
            "platform": meeting.platform,
            "status": meeting.status,
            "participants": meeting.participants,
            "starts_at": meeting.scheduled_at,
            "started_at": meeting.started_at,
            "ended_at": meeting.ended_at,
            "duration_seconds": meeting.duration_seconds,
            "is_live": meeting.is_live,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching meeting: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{meeting_id}/start", response_model=dict)
async def start_meeting(
    meeting_id: str,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Start a meeting (mark as live)"""
    try:
        meeting = await db.get_meeting(meeting_id)
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")

        await db.update_meeting_status(meeting_id, "IN_PROGRESS")

        # Broadcast status update
        manager = get_connection_manager()
        await manager.broadcast_status_update(meeting_id, "IN_PROGRESS", {
            "started_at": datetime.utcnow().isoformat(),
        })

        return {"success": True, "meeting_id": meeting_id, "status": "IN_PROGRESS"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting meeting: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{meeting_id}/end", response_model=dict)
async def end_meeting(
    meeting_id: str,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """End a meeting"""
    try:
        meeting = await db.get_meeting(meeting_id)
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")

        await db.update_meeting_status(meeting_id, "COMPLETED")

        # Broadcast status update
        manager = get_connection_manager()
        await manager.broadcast_status_update(meeting_id, "COMPLETED", {
            "ended_at": datetime.utcnow().isoformat(),
        })

        return {"success": True, "meeting_id": meeting_id, "status": "COMPLETED"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending meeting: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{meeting_id}/status", response_model=dict)
async def update_meeting_status(
    meeting_id: str,
    update: MeetingStatus_Update,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Update meeting status"""
    try:
        await db.update_meeting_status(meeting_id, update.status.value)

        # Broadcast status update
        manager = get_connection_manager()
        await manager.broadcast_status_update(
            meeting_id,
            update.status.value,
            update.metadata,
        )

        return {"success": True, "meeting_id": meeting_id, "status": update.status.value}

    except Exception as e:
        logger.error(f"Error updating meeting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/live/dashboard", response_model=MeetingDashboard)
async def get_dashboard(
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Get live and upcoming meetings"""
    try:
        live = await db.get_live_meetings()
        
        live_meetings = [
            {
                "id": m.id,
                "title": m.title,
                "participants": m.participants,
                "started_at": m.started_at.isoformat() if m.started_at else None,
                "platform": m.platform,
            }
            for m in live
        ]

        # Upcoming meetings would come from a query
        upcoming_meetings = []

        return MeetingDashboard(
            live_meetings=live_meetings,
            upcoming_meetings=upcoming_meetings,
        )

    except Exception as e:
        logger.error(f"Error fetching dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{meeting_id}/analytics", response_model=dict)
async def get_meeting_analytics(
    meeting_id: str,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Get computed meeting analytics"""
    try:
        analytics = await db.get_meeting_analytics(meeting_id)
        if not analytics:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return analytics

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching meeting analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{meeting_id}/events", response_model=dict)
async def get_meeting_events(
    meeting_id: str,
    settings=Depends(get_settings),
    db=Depends(lambda: get_database(get_settings().database_url)),
):
    """Get transcript/event timeline friendly payload"""
    try:
        chunks = await db.get_meeting_chunks(meeting_id)
        return {
            "meeting_id": meeting_id,
            "chunks": chunks,
            "count": len(chunks),
        }

    except Exception as e:
        logger.error(f"Error fetching meeting events: {e}")
        raise HTTPException(status_code=500, detail=str(e))
