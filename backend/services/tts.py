import os
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

TTS_URL = "https://api.sarvam.ai/text-to-speech"


async def synthesize(text: str) -> bytes:
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY not set")

    text = text[:500]

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            TTS_URL,
            headers={
                "api-subscription-key": api_key,
                "Content-Type": "application/json",
            },
            json={
                "inputs": [text],
                "target_language_code": "hi-IN",
                "speaker": "simran",
                "model": "bulbul:v3",
                "pace": 1.0,
                "speech_sample_rate": 22050,
                "enable_preprocessing": True,
            },
        )
        response.raise_for_status()
        data = response.json()
        audio_b64 = data["audios"][0]
        return base64.b64decode(audio_b64)
