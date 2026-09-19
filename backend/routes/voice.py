import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas import TranscribeResponse, VoiceExtractRequest, VoiceExtractResponse
from services.voice_service import transcribe_audio_file, extract_product_details
from services.image_service import UPLOAD_DIR

router = APIRouter(tags=["Voice AI"])

@router.post("/voice/transcribe", response_model=TranscribeResponse)
async def transcribe_voice(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".wav"
    if ext not in [".mp3", ".wav", ".m4a", ".mp4", ".ogg", ".webm"]:
        ext = ".wav"

    filename = f"voice_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = transcribe_audio_file(filepath)
    return TranscribeResponse(
        text=result.get("text", ""),
        translated_text=result.get("translated_text", ""),
        translated_hindi=result.get("translated_hindi", ""),
        language=result.get("language", "en"),
        confidence=result.get("confidence", 0.95)
    )

@router.post("/voice/extract-details", response_model=VoiceExtractResponse)
@router.post("/voice/extract", response_model=VoiceExtractResponse)
def extract_details(data: VoiceExtractRequest):
    transcription = (data.transcription or data.text or "").strip()
    details = extract_product_details(transcription)
    return VoiceExtractResponse(**details)
