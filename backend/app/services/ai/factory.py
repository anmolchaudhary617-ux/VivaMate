from app.core.config import settings
from app.services.ai.base import BaseAIService
from app.services.ai.ollama import ollama_service
from app.services.ai.remote import remote_ai_service
from app.services.ai.huggingface import huggingface_service

def get_ai_service() -> BaseAIService:
    """Returns configured AI service based on AI_PROVIDER environment variable."""
    provider = settings.AI_PROVIDER.lower().strip()
    if provider in ("huggingface", "hf"):
        return huggingface_service
    if provider in ("remote", "open_weight_remote", "groq", "openrouter", "together", "deepinfra"):
        return remote_ai_service
    return ollama_service
