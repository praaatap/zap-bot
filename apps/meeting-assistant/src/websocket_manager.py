"""WebSocket management for real-time meeting updates"""

from fastapi import WebSocket
from typing import Set, Dict, List
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections"""

    def __init__(self):
        # Map of meeting_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, meeting_id: str, websocket: WebSocket):
        """Connect a WebSocket to a meeting"""
        await websocket.accept()
        
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = set()
        
        self.active_connections[meeting_id].add(websocket)
        logger.info(f"WebSocket connected to meeting {meeting_id}")

    async def disconnect(self, meeting_id: str, websocket: WebSocket):
        """Disconnect a WebSocket"""
        if meeting_id in self.active_connections:
            self.active_connections[meeting_id].discard(websocket)
            
            if not self.active_connections[meeting_id]:
                del self.active_connections[meeting_id]
        
        logger.info(f"WebSocket disconnected from meeting {meeting_id}")

    async def broadcast(
        self,
        meeting_id: str,
        event_type: str,
        data: Dict,
    ):
        """Broadcast event to all connected clients for a meeting"""
        if meeting_id not in self.active_connections:
            return

        message = json.dumps({
            "type": event_type,
            "data": data,
        })

        disconnected = []
        for websocket in self.active_connections[meeting_id]:
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to websocket: {e}")
                disconnected.append(websocket)

        # Clean up disconnected
        for ws in disconnected:
            self.active_connections[meeting_id].discard(ws)

    async def broadcast_transcript_chunk(
        self,
        meeting_id: str,
        content: str,
        speaker: str = None,
        timestamp: float = None,
    ):
        """Broadcast transcript chunk update"""
        await self.broadcast(meeting_id, "transcript_chunk", {
            "content": content,
            "speaker": speaker,
            "timestamp": timestamp,
        })

    async def broadcast_status_update(
        self,
        meeting_id: str,
        status: str,
        metadata: Dict = None,
    ):
        """Broadcast status update"""
        await self.broadcast(meeting_id, "status_update", {
            "status": status,
            "metadata": metadata or {},
        })

    async def broadcast_summary_generated(
        self,
        meeting_id: str,
        summary: Dict,
    ):
        """Broadcast meeting summary"""
        await self.broadcast(meeting_id, "summary_generated", summary)

    async def broadcast_analytics_update(
        self,
        meeting_id: str,
        analytics: Dict,
    ):
        """Broadcast computed analytics update"""
        await self.broadcast(meeting_id, "analytics_update", analytics)

    def get_active_meetings(self) -> List[str]:
        """Get list of active meeting IDs with connections"""
        return list(self.active_connections.keys())

    def get_connection_count(self, meeting_id: str) -> int:
        """Get number of connections to a meeting"""
        return len(self.active_connections.get(meeting_id, set()))


# Global connection manager
_manager = ConnectionManager()


def get_connection_manager() -> ConnectionManager:
    """Get connection manager instance"""
    return _manager
