from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import settings
from .routes import router
from .websocket_manager import get_connection_manager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)

# Get connection manager
ws_manager = get_connection_manager()

# ============= WebSocket Routes =============

@app.websocket("/ws/{interview_id}")
async def websocket_endpoint(websocket: WebSocket, interview_id: str):
    """WebSocket endpoint for live interview updates"""
    try:
        await ws_manager.connect(interview_id, websocket)
        logger.info(f"WebSocket connected for interview {interview_id}")
        
        while True:
            # Keep connection alive and receive any messages
            data = await websocket.receive_text()
            logger.debug(f"Received message for {interview_id}: {data}")
            
    except WebSocketDisconnect:
        await ws_manager.disconnect(interview_id, websocket)
        logger.info(f"WebSocket disconnected for interview {interview_id}")
    except Exception as e:
        logger.error(f"WebSocket error for {interview_id}: {e}")
        await ws_manager.disconnect(interview_id, websocket)

# ============= Startup/Shutdown =============

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.app_name}")
    logger.info(f"Database: {settings.database_url}")
    logger.info(f"Pinecone Index: {settings.pinecone_index_name}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.app_name}")

# ============= Root Routes =============

@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
