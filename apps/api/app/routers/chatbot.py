from fastapi import APIRouter, Depends, HTTPException, Request, Body
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
import openai
import os
import json
import logging
from datetime import datetime
from pydantic import BaseModel, Field

from app.database import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
from app.auth import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/chatbot",
    tags=["chatbot"],
    responses={404: {"description": "Not found"}},
)

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "gpt-4"
    temperature: float = 0.7
    max_tokens: int = 1000

class ChatResponse(BaseModel):
    message: ChatMessage
    created_at: datetime = Field(default_factory=datetime.now)

# System prompt for crypto research
CRYPTO_SYSTEM_PROMPT = """
You are CryptoAnalyst, an AI assistant specialized in cryptocurrency research and analysis.
Your role is to provide accurate, educational information about cryptocurrencies, blockchain technology, 
market trends, and trading concepts.

Guidelines:
1. Provide factual, educational information about cryptocurrencies, blockchain technology, and market analysis.
2. You can explain technical concepts, market trends, and historical data.
3. You can discuss general trading concepts and strategies in educational terms.
4. You MUST NOT provide specific investment advice or price predictions.
5. You MUST NOT recommend specific trades, entry/exit points, or portfolio allocations.
6. Always include appropriate disclaimers when discussing market-related topics.
7. If asked for specific investment advice, politely explain that you cannot provide personalized financial advice.
8. Focus on education rather than speculation.

Disclaimer to include when discussing market-related topics:
"This information is for educational purposes only and should not be considered financial advice. 
Cryptocurrency markets are highly volatile and risky. Always do your own research and consider consulting 
with a financial professional before making investment decisions."
"""

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Process a chat request and return a response from the AI.
    """
    try:
        # Get OpenAI API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Create OpenAI client
        client = openai.OpenAI(api_key=api_key)
        
        # Prepare messages with system prompt
        messages = [
            {"role": "system", "content": CRYPTO_SYSTEM_PROMPT}
        ]
        
        # Add user messages
        for msg in request.messages:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=request.model,
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        # Extract the assistant's message
        assistant_message = response.choices[0].message.content
        
        # Log the interaction (excluding the system prompt)
        logger.info(f"User {current_user.id} chatbot interaction: {request.messages[-1].content[:50]}...")
        
        # Return the response
        return ChatResponse(
            message=ChatMessage(role="assistant", content=assistant_message),
            created_at=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error in chatbot: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Get chat history for the current user.
    """
    # This would typically query a database for chat history
    # For now, return an empty list as we haven't implemented history storage yet
    return []

@router.post("/feedback")
async def submit_feedback(
    feedback: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Submit feedback about a chatbot response.
    """
    try:
        # Log the feedback
        logger.info(f"User {current_user.id} submitted feedback: {feedback}")
        
        # Here you would typically store the feedback in a database
        # For now, just return a success response
        return JSONResponse(content={"status": "success", "message": "Feedback received"})
        
    except Exception as e:
        logger.error(f"Error processing feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing feedback: {str(e)}")
