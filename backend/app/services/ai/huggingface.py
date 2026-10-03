import httpx
import logging
from fastapi import HTTPException, status
from app.core.config import settings
from app.services.ai.base import BaseAIService

logger = logging.getLogger(__name__)

class HuggingFaceService(BaseAIService):
    """Hugging Face AI Service communicating with Hugging Face OpenAI-compatible inference router."""

    def __init__(self, base_url: str = None, token: str = None, model: str = None):
        self._base_url = base_url
        self._token = token
        self._model = model

    @property
    def base_url(self) -> str:
        return self._base_url or settings.HF_BASE_URL

    @property
    def token(self) -> str:
        return self._token or settings.HF_TOKEN or settings.REMOTE_AI_API_KEY

    @property
    def model(self) -> str:
        return self._model or settings.HF_MODEL or settings.REMOTE_AI_MODEL

    async def generate_response(self, prompt: str, format: str = None) -> str:
        """Sends an async generation request to Hugging Face OpenAI-compatible /chat/completions endpoint."""
        if not self.token:
            logger.error("HF_TOKEN is not configured for Hugging Face AI provider.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Hugging Face AI provider error: HF_TOKEN environment variable is not configured."
            )

        endpoint = self.base_url.rstrip('/')
        if not endpoint.endswith("/chat/completions"):
            url = f"{endpoint}/chat/completions"
        else:
            url = endpoint

        headers = {
            "Authorization": f"Bearer {self.token}",
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
                        detail="Hugging Face AI service returned empty choices array."
                    )
                message_content = choices[0].get("message", {}).get("content", "")
                return message_content
            except httpx.TimeoutException as exc:
                err_msg = str(exc) or repr(exc) or "Request timed out after 120 seconds"
                logger.error(f"Timeout communicating with Hugging Face AI at {url}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail=f"Timeout communicating with Hugging Face AI service at {self.base_url}: {err_msg}"
                )
            except httpx.ConnectError as exc:
                err_msg = str(exc) or repr(exc) or "Connection refused"
                logger.error(f"Failed to connect to Hugging Face AI at {url}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Hugging Face AI service is unavailable at {self.base_url}: {err_msg}."
                )
            except httpx.HTTPStatusError as exc:
                err_msg = exc.response.text or str(exc) or repr(exc)
                logger.error(f"Hugging Face AI returned HTTP error status {exc.response.status_code}: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Hugging Face AI error ({exc.response.status_code}): {err_msg}"
                )
            except httpx.RequestError as exc:
                err_msg = str(exc) or repr(exc)
                logger.error(f"HTTP request error communicating with Hugging Face AI: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Error communicating with Hugging Face AI service at {self.base_url}: {err_msg}"
                )
            except HTTPException:
                raise
            except Exception as exc:
                err_msg = str(exc) or repr(exc) or type(exc).__name__
                logger.error(f"Unexpected error communicating with Hugging Face AI: {err_msg}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"An error occurred while communicating with Hugging Face AI service: {err_msg}"
                )

huggingface_service = HuggingFaceService()
