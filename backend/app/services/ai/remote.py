import httpx
import logging
from fastapi import HTTPException, status
from app.core.config import settings
from app.services.ai.base import BaseAIService

logger = logging.getLogger(__name__)

class RemoteAIService(BaseAIService):
    """Remote AI Service communicating with HTTP open-weight model endpoints (OpenAI-compatible)."""

    def __init__(self, base_url: str = None, api_key: str = None, model: str = None):
        self._base_url = base_url
        self._api_key = api_key
        self._model = model

    @property
    def base_url(self) -> str:
        return self._base_url or settings.REMOTE_AI_BASE_URL

    @property
    def api_key(self) -> str:
        return self._api_key or settings.REMOTE_AI_API_KEY

    @property
    def model(self) -> str:
        return self._model or settings.REMOTE_AI_MODEL

    async def generate_response(self, prompt: str, format: str = None) -> str:
        """Sends an async generation request to remote OpenAI-compatible /chat/completions endpoint."""
        if not self.api_key:
            logger.error("REMOTE_AI_API_KEY is not configured for remote AI provider.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Remote AI provider error: REMOTE_AI_API_KEY environment variable is not configured."
            )

        endpoint = self.base_url.rstrip('/')
        if not endpoint.endswith("/chat/completions"):
            url = f"{endpoint}/chat/completions"
        else:
            url = endpoint

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7
        }

        if format == "json":
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Remote AI service returned empty choices array."
                    )
                message_content = choices[0].get("message", {}).get("content", "")
                return message_content
            except httpx.TimeoutException as exc:
                err_msg = str(exc) or repr(exc) or "Request timed out after 120 seconds"
                logger.error(f"Timeout communicating with Remote AI at {url}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail=f"Timeout communicating with remote AI service at {self.base_url}: {err_msg}"
                )
            except httpx.ConnectError as exc:
                err_msg = str(exc) or repr(exc) or "Connection refused"
                logger.error(f"Failed to connect to Remote AI at {url}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Remote AI service is unavailable at {self.base_url}: {err_msg}."
                )
            except httpx.HTTPStatusError as exc:
                err_msg = exc.response.text or str(exc) or repr(exc)
                logger.error(f"Remote AI returned HTTP error status {exc.response.status_code}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Remote AI error ({exc.response.status_code}): {err_msg}"
                )
            except httpx.RequestError as exc:
                err_msg = str(exc) or repr(exc)
                logger.error(f"HTTP request error communicating with Remote AI: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Error communicating with remote AI service at {self.base_url}: {err_msg}"
                )
            except HTTPException:
                raise
            except Exception as exc:
                err_msg = str(exc) or repr(exc) or type(exc).__name__
                logger.error(f"Unexpected error communicating with Remote AI: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"An error occurred while communicating with remote AI service: {err_msg}"
                )

remote_ai_service = RemoteAIService()
