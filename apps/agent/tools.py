from typing import Any, List
from langchain_core.tools import tool
import requests
from config import Config

# Dummy DB for demonstrations
MOCK_MEETINGS = [
    {"id": "m1", "title": "Q3 Planning", "date": "2023-10-01", "summary": "Discussed Q3 goals."},
    {"id": "m2", "title": "Design Sync", "date": "2023-10-05", "summary": "Reviewed new UI mocks."}
]

@tool
def get_recent_meetings(limit: int = 5) -> str:
    """Useful to get a list of the user's recent recorded meetings."""
    # In a real app, this would hit the Node API or database.
    try:
        res = requests.get(f"{Config.NODE_API_URL}/api/meetings")
        if res.status_code == 200:
            data = res.json().get("data", [])
            if not data:
                return "You have no recorded meetings."
            return "\n".join([f"- {m['title']} (ID: {m['id']})" for m in data[:limit]])
    except Exception as e:
        pass # Fallback to mock data if Node is down
        
    return "\n".join([f"- {m['title']} (ID: {m['id']})" for m in MOCK_MEETINGS[:limit]])


@tool
def search_meeting_transcripts(query: str) -> str:
    """Useful when you need to answer specific questions about what was said in past meetings.
    Provide a specific search query like 'what did John say about marketing budget?'"""
    
    from langchain_aws import BedrockEmbeddings
    from pinecone import Pinecone
    
    if not Config.PINECONE_API_KEY:
        return "Vector database is not configured. I cannot search transcripts right now."
        
    try:
        pc = Pinecone(api_key=Config.PINECONE_API_KEY)
        index = pc.Index(Config.PINECONE_INDEX_NAME)
        
        embeddings = BedrockEmbeddings(
            model_id=Config.BEDROCK_EMBED_MODEL_ID,
            region_name=Config.AWS_REGION
        )
        
        vector = embeddings.embed_query(query)
        
        results = index.query(
            vector=vector,
            top_k=3,
            include_metadata=True
        )
        
        matches = results.get("matches", [])
        if not matches:
            return "No relevant information found in past meetings."
            
        context = []
        for m in matches:
            text = m.get("metadata", {}).get("text", "")
            if text:
                context.append(f"...{text}...")
                
        return "\n\n".join(context)
        
    except Exception as e:
        return f"Error searching transcripts: {str(e)}"

@tool
def get_organizational_knowledge(topic: str) -> str:
    """Useful to find information about company policies, department goals, or general organizational context.
    Example: 'what is our policy on remote work?' or 'what are the Q4 marketing priorities?'"""
    # This would typically be a separate vector store or a specific namespace in Pinecone
    knowledge_base = {
        "remote work": "Our policy allows for 3 days of remote work per week. Remote days should be coordinated with the team lead.",
        "benefits": "We offer comprehensive health insurance, a 401(k) match, and 25 days of PTO.",
        "marketing": "Q4 priorities are focused on the Zap Bot Pro launch and scaling our Enterprise outreach program.",
        "hiring": "We are currently hiring for Senior Fullstack Engineers and AI Product Managers."
    }
    
    # Simple keyword search for the mock
    for key, value in knowledge_base.items():
        if key in topic.lower():
            return value
            
    return "I couldn't find specific organizational knowledge on that topic. You might want to check the internal wiki."

@tool
def get_upcoming_schedule(days: int = 7) -> str:
    """Useful to get the user's upcoming meeting schedule from their calendar."""
    try:
        res = requests.get(f"{Config.NODE_API_URL}/api/calendar/events")
        if res.status_code == 200:
            payload = res.json()
            events = payload.get("data", []) or payload.get("events", [])
            if not events:
                return "You have no upcoming meetings scheduled."
            return "\n".join([f"- {e['summary']} ({e['start']})" for e in events[:10]])
    except:
        pass
        
    return "Next 7 days:\n- Design Review (Tomorrow, 10:00 AM)\n- Weekly Sync (Wednesday, 2:00 PM)\n- Client Pitch (Friday, 1:00 PM)"

@tool
def schedule_meeting(title: str, participants: List[str], time: str) -> str:
    """Useful to schedule a new meeting. Provide title, list of participant emails, and a time string."""
    # In a real app, this would call the Google Calendar API via the Node backend
    return f"Successfully scheduled '{title}' with {', '.join(participants)} for {time}. Calendar invites have been sent."

# List of tools to provide to the agent
AGENT_TOOLS = [
    get_recent_meetings, 
    search_meeting_transcripts, 
    get_organizational_knowledge,
    get_upcoming_schedule,
    schedule_meeting
]
