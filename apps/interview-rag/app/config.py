from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Server
    app_name: str = "Interview RAG Assistant"
    debug: bool = False
    port: int = 8000
    host: str = "0.0.0.0"
    
    # Database
    database_url: str
    
    # Pinecone
    pinecone_api_key: str
    pinecone_index_name: str = "interview-rag"
    pinecone_environment: str = "us-east-1"
    
    # LLM - Groq (Primary)
    groq_api_key: Optional[str] = None
    
    # LLM - Anthropic (Fallback)
    anthropic_api_key: Optional[str] = None
    
    # Azure (optional)
    azure_openai_api_key: Optional[str] = None
    azure_openai_endpoint: Optional[str] = None
    
    # Redis for caching
    redis_url: str = "redis://localhost:6379"
    
    # Meeting service integration
    meeting_service_url: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
