from abc import ABC, abstractmethod

class BaseAIService(ABC):
    """Abstract Base Class for AI Services to allow modular substitution."""

    @abstractmethod
    async def generate_response(self, prompt: str, format: str = None) -> str:
        """Generate response from prompt asynchronously."""
        pass
