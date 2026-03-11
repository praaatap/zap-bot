"""Data models for Meeting Assistant"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class MeetingStatus(str, Enum):
    """Meeting status enum"""
    SCHEDULED = "SCHEDULED"
    RINGING = "RINGING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class CreateMeetingRequest(BaseModel):
    """Create meeting request"""
    title: str
    description: Optional[str] = None
    participants: List[str] = Field(default_factory=list)
    meeting_date: datetime
    meeting_platform: str  # "zoom", "teams", "google-meet", etc


class MessageRole(str, Enum):
    """Message role enum"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    """Chat message"""
    role: MessageRole
    content: str
    timestamp: Optional[datetime] = None


class MeetingChatRequest(BaseModel):
    """Meeting chat request"""
    meeting_id: str
    query: str
    context_limit: int = 5


class RAGSource(BaseModel):
    """RAG source/chunk"""
    chunk_id: str
    content: str
    relevance_score: float
    timestamp: Optional[float] = None


class ChatResponse(BaseModel):
    """Chat response with RAG"""
    answer: str
    sources: List[RAGSource] = Field(default_factory=list)
    confidence: float
    processing_time_ms: float
    intent: Optional[str] = None


class MeetingTranscriptChunk(BaseModel):
    """Meeting transcript chunk (real-time)"""
    meeting_id: str
    content: str
    speaker: Optional[str] = None
    timestamp: float
    duration: Optional[float] = None


class MeetingStatus_Update(BaseModel):
    """Meeting status update"""
    meeting_id: str
    status: MeetingStatus
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MeetingSummary(BaseModel):
    """Meeting summary"""
    meeting_id: str
    title: str
    summary: str
    key_points: List[str] = Field(default_factory=list)
    action_items: List[str] = Field(default_factory=list)
    participants: List[str] = Field(default_factory=list)
    duration_minutes: Optional[float] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class ConversationMessage(BaseModel):
    """Stored conversation message"""
    meeting_id: str
    role: MessageRole
    content: str
    retrieved_chunks: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class LiveEvent(BaseModel):
    """Live event for real-time updates"""
    meeting_id: str
    event_type: str  # "transcript_chunk", "status_update", "summary_generated", etc
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MeetingDashboard(BaseModel):
    """Dashboard view - live and upcoming meetings"""
    live_meetings: List[Dict[str, Any]]
    upcoming_meetings: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthStatus(BaseModel):
    """Health check status"""
    status: str
    service: str
    timestamp: datetime
    groq_available: bool
    pinecone_available: bool
    database_available: bool
