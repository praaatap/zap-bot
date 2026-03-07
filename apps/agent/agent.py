from langchain_aws import ChatBedrock
from langchain.agents import create_agent
from tools import AGENT_TOOLS
from config import Config

def setup_agent():
    # Model
    model = ChatBedrock(
        model_id=Config.BEDROCK_MODEL_ID,
        region_name=Config.AWS_REGION,
        model_kwargs={"temperature": 0.2, "max_tokens": 1000}
    )

    # System Prompt
    system_prompt = """You are Zap Bot, an advanced AI executive assistant.
You help the user manage their meetings, recall information from past discussions, and organize their schedule.

You have access to tools that can search through meeting transcripts and fetch meeting schedules.
Always be professional, concise, and helpful. If you don't know the answer, use a tool to find it.

When using tools, explain what you found in a human-readable way. Use Markdown for formatting."""

    # Create Agent using the local custom factory
    agent_executor = create_agent(
        model=model,
        tools=AGENT_TOOLS,
        system_prompt=system_prompt
    )
    
    return agent_executor
