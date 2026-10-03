# pyrefly: ignore [missing-import]
import httpx
import logging
from fastapi import HTTPException, status
from app.core.config import settings
from app.services.ai.base import BaseAIService

logger = logging.getLogger(__name__)

class OllamaService(BaseAIService):
    """Ollama AI service implementation communicating with local Ollama REST API."""

    def __init__(self, base_url: str = None, model: str = None):
        self._base_url = base_url
        self._model = model

    @property
    def base_url(self) -> str:
        return self._base_url or settings.OLLAMA_BASE_URL

    @property
    def model(self) -> str:
        return self._model or settings.OLLAMA_MODEL

    async def generate_response(self, prompt: str, format: str = None) -> str:
        """Sends a generation request to the Ollama /api/generate endpoint."""
        url = f"{self.base_url.rstrip('/')}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        if format:
            payload["format"] = format

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
            except httpx.TimeoutException as exc:
                err_msg = str(exc) or repr(exc) or "Request timed out after 120 seconds"
                logger.error(f"Timeout communicating with Ollama at {self.base_url}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail=f"Timeout communicating with Ollama service at {self.base_url}: {err_msg}"
                )
            except httpx.ConnectError as exc:
                err_msg = str(exc) or repr(exc) or "Connection refused"
                logger.error(f"Failed to connect to Ollama at {self.base_url}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Ollama service is unavailable at {self.base_url}: {err_msg}. Please ensure Ollama server is running."
                )
            except httpx.HTTPStatusError as exc:
                err_msg = exc.response.text or str(exc) or repr(exc)
                logger.error(f"Ollama returned HTTP error status {exc.response.status_code}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Ollama error ({exc.response.status_code}): {err_msg}"
                )
            except httpx.RequestError as exc:
                err_msg = str(exc) or repr(exc)
                logger.error(f"HTTP request error communicating with Ollama: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Error communicating with Ollama service at {self.base_url}: {err_msg}"
                )
            except Exception as exc:
                err_msg = str(exc) or repr(exc) or type(exc).__name__
                logger.error(f"Unexpected error communicating with Ollama: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"An error occurred while communicating with AI service: {err_msg}"
                )

# Default instance for dependency injection / imports
ollama_service = OllamaService()
