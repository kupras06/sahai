import os
import httpx
from dotenv import load_dotenv

load_dotenv()

STT_URL = "https://api.sarvam.ai/speech-to-text"


async def transcribe(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY not set")

    # Infer MIME from filename extension
    ext = filename.rsplit(".", 1)[-1].lower()
    mime_map = {
        "webm": "audio/webm",
        "ogg": "audio/ogg",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "m4a": "audio/mp4",
    }
    mime = mime_map.get(ext, "audio/webm")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            STT_URL,
            headers={"api-subscription-key": api_key},
            files={"file": (filename, audio_bytes, mime)},
            data={"language_code": "hi-IN", "model": "saarika:v2.5"},
        )
        response.raise_for_status()
        return response.json().get("transcript", "")
