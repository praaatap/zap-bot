from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Integer, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

from .config import settings

# Database setup
engine = create_engine(settings.database_url, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Models
class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, index=True)
    candidate_name = Column(String)
    candidate_email = Column(String, nullable=True)
    position = Column(String)
    interview_date = Column(DateTime)
    interviewer = Column(String)
    
    status = Column(String, default="SCHEDULED")  # SCHEDULED, IN_PROGRESS, COMPLETED
    is_live = Column(Boolean, default=False)
    
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    call_duration = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InterviewChunk(Base):
    __tablename__ = "interview_chunks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = Column(String, index=True)
    content = Column(Text)
    chunk_index = Column(Integer)
    speaker = Column(String, nullable=True)
    start_time = Column(Integer, nullable=True)  # seconds
    end_time = Column(Integer, nullable=True)
    
    vector_id = Column(String, nullable=True)  # Pinecone vector ID
    embedding_model = Column(String, default="groq")
    
    created_at = Column(DateTime, default=datetime.utcnow)

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = Column(String, index=True)
    role = Column(String)  # user, assistant
    content = Column(Text)
    retrieved_chunks = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class LiveEvent(Base):
    __tablename__ = "live_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = Column(String, index=True)
    event_type = Column(String)  # call_started, transcript_chunk, status_changed, etc
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

# Create tables
Base.metadata.create_all(bind=engine)
