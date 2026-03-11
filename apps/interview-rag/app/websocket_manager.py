from fastapi import WebSocket, AsyncGenerator
from typing import Dict, Set
import asyncio
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # interview_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, interview_id: str, websocket: WebSocket):
        """Register WebSocket connection"""
        await websocket.accept()
        
        if interview_id not in self.active_connections:
            self.active_connections[interview_id] = set()
        
        self.active_connections[interview_id].add(websocket)
        logger.info(f"Client connected to interview {interview_id}")
    
    async def disconnect(self, interview_id: str, websocket: WebSocket):
        """Unregister WebSocket connection"""
        if interview_id in self.active_connections:
            self.active_connections[interview_id].discard(websocket)
            
            # Clean up empty sets
            if not self.active_connections[interview_id]:
                del self.active_connections[interview_id]
        
        logger.info(f"Client disconnected from interview {interview_id}")
    
    async def broadcast(self, interview_id: str, message: dict):
        """Broadcast message to all connected clients"""
        if interview_id not in self.active_connections:
            return
        
        message["timestamp"] = datetime.utcnow().isoformat()
        data = json.dumps(message)
        
        disconnected = set()
        
        for websocket in self.active_connections[interview_id]:
            try:
                await websocket.send_text(data)
            except Exception as e:
                logger.error(f"Error sending message: {e}")
                disconnected.add(websocket)
        
        # Clean up disconnected clients
        for ws in disconnected:
            self.active_connections[interview_id].discard(ws)
    
    async def broadcast_status_update(
        self,
        interview_id: str,
        status: str,
        metadata: dict = None
    ):
        """Broadcast status update"""
        message = {
            "type": "status_update",
            "status": status,
            "metadata": metadata or {}
        }
        await self.broadcast(interview_id, message)
    
    async def broadcast_transcript_chunk(
        self,
        interview_id: str,
        content: str,
        speaker: str = None,
        timestamp: int = None
    ):
        """Broadcast new transcript chunk"""
        message = {
            "type": "transcript_chunk",
            "content": content,
            "speaker": speaker,
            "timestamp": timestamp
        }
        await self.broadcast(interview_id, message)
    
    async def broadcast_answer(
        self,
        interview_id: str,
        query: str,
        answer: str,
        sources: list = None
    ):
        """Broadcast answer to live viewers"""
        message = {
            "type": "assistant_response",
            "query": query,
            "answer": answer,
            "sources": sources or []
        }
        await self.broadcast(interview_id, message)
    
    def get_active_interviews(self) -> list:
        """Get list of active interviews with connection counts"""
        return [
            {
                "interview_id": iid,
                "connections": len(conns)
            }
            for iid, conns in self.active_connections.items()
        ]
    
    def get_connection_count(self, interview_id: str) -> int:
        """Get number of connections for an interview"""
        return len(self.active_connections.get(interview_id, set()))

# Global connection manager
manager = ConnectionManager()

def get_connection_manager():
    return manager
