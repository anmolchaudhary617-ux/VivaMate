import io
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from pydantic import BaseModel, Field
import pypdf

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit

class DocumentUploadResponse(BaseModel):
    filename: str = Field(..., description="Original name of uploaded document", example="computer_networks.pdf")
    text: str = Field(..., description="Extracted plain text content")
    character_count: int = Field(..., description="Total character count of extracted text", example=12345)

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Extract plain text from uploaded PDF or TXT study material."""
    filename = file.filename or "uploaded_file"
    filename_lower = filename.lower()

    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF (.pdf) and plain text (.txt) files are supported."
        )

    # Read binary content into memory
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded document is empty (0 bytes)."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 10 MB."
        )

    extracted_text = ""

    if filename_lower.endswith(".txt"):
        try:
            extracted_text = content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                extracted_text = content.decode("utf-8-sig")
            except UnicodeDecodeError:
                extracted_text = content.decode("latin-1")
    elif filename_lower.endswith(".pdf"):
        try:
            pdf_stream = io.BytesIO(content)
            reader = pypdf.PdfReader(pdf_stream)
            extracted_pages = []
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    extracted_pages.append(page_text)
            extracted_text = "\n\n".join(extracted_pages)
        except Exception as exc:
            logger.error(f"Failed to extract text from PDF '{filename}': {exc}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to extract text from PDF document: {str(exc)}"
            )

    extracted_text_stripped = extracted_text.strip()
    if not extracted_text_stripped:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded document contains no extractable text."
        )

    return DocumentUploadResponse(
        filename=filename,
        text=extracted_text,
        character_count=len(extracted_text)
    )
