"""Configuration management for Meeting Assistant"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # App
    app_name: str = "Meeting Assistant"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000

    # Groq
    groq_api_key: str
    groq_model_llm: str = "mixtral-8x7b-32768"
    groq_model_embedding: str = "nomic-embed-text-1.5"

    # Pinecone
    pinecone_api_key: str
    pinecone_index_name: str = "meeting-assistant"
    pinecone_namespace: str = ""
    pinecone_environment: str = "us-east-1"

    # Database (PostgreSQL)
    database_url: str = "postgresql://user:password@localhost:5432/meeting_assistant"

    # LangChain
    langchain_tracing_v2: bool = False
    langchain_api_key: str = ""

    # Settings
    chunk_size: int = 1000
    chunk_overlap: int = 200
    max_context_length: int = 4000
    retrieval_top_k: int = 5

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get settings instance"""
    return Settings()
