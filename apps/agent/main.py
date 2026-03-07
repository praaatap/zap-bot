from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
from agent import setup_agent
from config import Config
from langchain_core.messages import HumanMessage, AIMessage

app = FastAPI(title="Zap Bot Advanced Agent API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agent
agent_executor = setup_agent()

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str
    
class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "zap-bot-agent"}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        print(f"Received message: {req.message}")
        
        # Format history for LangChain
        formatted_history = []
        for msg in req.history:
            if msg.role == "user":
                formatted_history.append(HumanMessage(content=msg.content))
            else:
                formatted_history.append(AIMessage(content=msg.content))
                
        # Run agent
        response = agent_executor.invoke({
            "messages": formatted_history + [HumanMessage(content=req.message)]
        })
        
        # Get the last message which should be the assistant's response
        final_messages = response.get("messages", [])
        agent_response = final_messages[-1].content if final_messages else "No response generated."

        return {
            "success": True, 
            "response": agent_response
        }
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return {"success": False, "error": str(e), "response": f"Error: {str(e)}"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
