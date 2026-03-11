"""Database models for Meeting Assistant"""

from sqlalchemy import create_engine, Column, String, DateTime, Float, Integer, JSON, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()


class Meeting(Base):
    """Meeting database model"""
    __tablename__ = "meetings"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    platform = Column(String)  # zoom, teams, google-meet, etc
    status = Column(String, default="SCHEDULED")  # SCHEDULED, IN_PROGRESS, COMPLETED
    
    # Participants and metadata
    participants = Column(JSON, default=list)
    scheduled_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Content
    transcript = Column(Text)
    summary = Column(Text)
    
    # Status
    is_live = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MeetingChunk(Base):
    """Meeting transcript chunk"""
    __tablename__ = "meeting_chunks"

    id = Column(String, primary_key=True)
    meeting_id = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    speaker = Column(String)
    timestamp = Column(Float)  # seconds from start
    chunk_index = Column(Integer)
    
    # Vector store reference
    vector_id = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class ConversationMessage(Base):
    """Conversation message history"""
    __tablename__ = "conversation_messages"

    id = Column(String, primary_key=True)
    meeting_id = Column(String, nullable=False)
    role = Column(String)  # user, assistant
    content = Column(Text)
    retrieved_chunk_ids = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class MeetingEvent(Base):
    """Meeting events for real-time tracking"""
    __tablename__ = "meeting_events"

    id = Column(String, primary_key=True)
    meeting_id = Column(String, nullable=False)
    event_type = Column(String)  # transcript_chunk, status_update, summary_generated
    data = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class DatabaseManager:
    """Database management"""

    def __init__(self, database_url: str):
        self.engine = create_engine(database_url, echo=False)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self._init_db()

    def _init_db(self):
        """Initialize database"""
        try:
            Base.metadata.create_all(self.engine)
            logger.info("Database initialized")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise

    def get_session(self):
        """Get database session"""
        return self.SessionLocal()

    async def create_meeting(self, meeting_id: str, data: dict):
        """Create meeting"""
        session = self.get_session()
        try:
            meeting = Meeting(
                id=meeting_id,
                title=data.get("title"),
                description=data.get("description"),
                platform=data.get("platform"),
                participants=data.get("participants", []),
                scheduled_at=data.get("scheduled_at"),
            )
            session.add(meeting)
            session.commit()
            logger.info(f"Created meeting {meeting_id}")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating meeting: {e}")
            raise
        finally:
            session.close()

    async def get_meeting(self, meeting_id: str):
        """Get meeting by ID"""
        session = self.get_session()
        try:
            return session.query(Meeting).filter(Meeting.id == meeting_id).first()
        finally:
            session.close()

    async def update_meeting_status(self, meeting_id: str, status: str):
        """Update meeting status"""
        session = self.get_session()
        try:
            meeting = session.query(Meeting).filter(Meeting.id == meeting_id).first()
            if meeting:
                meeting.status = status
                if status == "IN_PROGRESS":
                    meeting.is_live = True
                    meeting.started_at = datetime.utcnow()
                elif status == "COMPLETED":
                    meeting.is_live = False
                    meeting.ended_at = datetime.utcnow()
                    if meeting.started_at:
                        meeting.duration_seconds = int((meeting.ended_at - meeting.started_at).total_seconds())
                session.commit()
                logger.info(f"Updated meeting {meeting_id} status to {status}")
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating meeting status: {e}")
            raise
        finally:
            session.close()

    async def add_chunk(self, meeting_id: str, chunk_id: str, data: dict):
        """Add transcript chunk"""
        session = self.get_session()
        try:
            chunk = MeetingChunk(
                id=chunk_id,
                meeting_id=meeting_id,
                content=data.get("content"),
                speaker=data.get("speaker"),
                timestamp=data.get("timestamp"),
                chunk_index=data.get("chunk_index"),
                vector_id=data.get("vector_id"),
            )
            session.add(chunk)
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding chunk: {e}")
            raise
        finally:
            session.close()

    async def add_message(self, message_id: str, data: dict):
        """Add conversation message"""
        session = self.get_session()
        try:
            msg = ConversationMessage(
                id=message_id,
                meeting_id=data.get("meeting_id"),
                role=data.get("role"),
                content=data.get("content"),
                retrieved_chunk_ids=data.get("retrieved_chunk_ids", []),
            )
            session.add(msg)
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding message: {e}")
            raise
        finally:
            session.close()

    async def add_meeting_event(self, event_id: str, data: dict):
        """Store meeting event"""
        session = self.get_session()
        try:
            event = MeetingEvent(
                id=event_id,
                meeting_id=data.get("meeting_id"),
                event_type=data.get("event_type"),
                data=data.get("data", {}),
            )
            session.add(event)
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding event: {e}")
            raise
        finally:
            session.close()

    async def append_transcript_chunk(self, meeting_id: str, content: str, speaker: str = None):
        """Append a chunk to meeting transcript text"""
        session = self.get_session()
        try:
            meeting = session.query(Meeting).filter(Meeting.id == meeting_id).first()
            if not meeting:
                return

            prefix = f"[{speaker}] " if speaker else ""
            line = f"{prefix}{content}".strip()
            existing = (meeting.transcript or "").strip()
            meeting.transcript = f"{existing}\n{line}".strip() if existing else line
            meeting.updated_at = datetime.utcnow()
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Error appending transcript chunk: {e}")
            raise
        finally:
            session.close()

    async def get_conversation_history(self, meeting_id: str, limit: int = 50):
        """Get recent conversation messages"""
        session = self.get_session()
        try:
            messages = (
                session.query(ConversationMessage)
                .filter(ConversationMessage.meeting_id == meeting_id)
                .order_by(ConversationMessage.created_at.asc())
                .limit(limit)
                .all()
            )
            return [
                {
                    "id": m.id,
                    "role": m.role,
                    "content": m.content,
                    "retrieved_chunk_ids": m.retrieved_chunk_ids or [],
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                }
                for m in messages
            ]
        finally:
            session.close()

    async def get_meeting_chunks(self, meeting_id: str):
        """Get transcript chunks for a meeting"""
        session = self.get_session()
        try:
            chunks = (
                session.query(MeetingChunk)
                .filter(MeetingChunk.meeting_id == meeting_id)
                .order_by(MeetingChunk.timestamp.asc())
                .all()
            )
            return [
                {
                    "id": c.id,
                    "content": c.content,
                    "speaker": c.speaker,
                    "timestamp": c.timestamp,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                }
                for c in chunks
            ]
        finally:
            session.close()

    async def get_meeting_analytics(self, meeting_id: str):
        """Compute meeting analytics for dashboard/insights"""
        session = self.get_session()
        try:
            meeting = session.query(Meeting).filter(Meeting.id == meeting_id).first()
            if not meeting:
                return None

            chunks = (
                session.query(MeetingChunk)
                .filter(MeetingChunk.meeting_id == meeting_id)
                .all()
            )

            total_words = 0
            speaker_map = {}
            for chunk in chunks:
                words = len((chunk.content or "").split())
                total_words += words
                key = chunk.speaker or "Unknown"
                if key not in speaker_map:
                    speaker_map[key] = {"speaker": key, "chunks": 0, "words": 0}
                speaker_map[key]["chunks"] += 1
                speaker_map[key]["words"] += words

            speakers = sorted(speaker_map.values(), key=lambda x: x["words"], reverse=True)
            for speaker in speakers:
                speaker["share"] = round((speaker["words"] / total_words) * 100, 1) if total_words else 0.0

            transcript_text = meeting.transcript or ""
            questions_count = transcript_text.count("?")

            return {
                "meeting_id": meeting.id,
                "status": {
                    "state": meeting.status,
                    "is_live": meeting.is_live,
                },
                "overview": {
                    "duration_seconds": meeting.duration_seconds or 0,
                    "chunks_count": len(chunks),
                    "word_count": total_words,
                    "questions_count": questions_count,
                    "summary_ready": bool(meeting.summary),
                },
                "speakers": speakers,
                "updated_at": meeting.updated_at.isoformat() if meeting.updated_at else None,
            }
        finally:
            session.close()

    async def get_live_meetings(self):
        """Get all live meetings"""
        session = self.get_session()
        try:
            return session.query(Meeting).filter(Meeting.is_live == True).all()
        finally:
            session.close()


# Global database instance
_db: DatabaseManager = None


def get_database(database_url: str) -> DatabaseManager:
    """Get database instance"""
    global _db
    if _db is None:
        _db = DatabaseManager(database_url)
    return _db
