import base64
import logging
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional

from backend.personas import get_persona, get_spending_summary
from backend.services import llm, stt, tts, memory

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/chat")
async def chat_endpoint(
    persona: str = Form(...),
    message: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
):
    persona_key = persona.lower()
    persona_data = get_persona(persona_key)
    if not persona_data:
        return JSONResponse({"error": "Unknown persona"}, status_code=400)

    # --- resolve user text ---
    if audio is not None:
        audio_bytes = await audio.read()
        user_text = await stt.transcribe(audio_bytes, filename=audio.filename or "audio.webm")
    elif message:
        user_text = message
    else:
        return JSONResponse({"error": "Provide message or audio"}, status_code=400)

    # --- memory ---
    user_data = memory.get_user(persona_key)
    history = user_data["chat_history"]

    # --- build persona context ---
    context = (
        f"Naam: {persona_data['name']}\n"
        f"Kaam: {persona_data['occupation']}, {persona_data['location']}\n"
        f"Income: {persona_data['income_label']}\n"
        f"{get_spending_summary(persona_key)}\n"
        f"Savings goal: {persona_data['savings_goal']}"
    )

    # --- LLM ---
    response_text = llm.chat(user_text, context, history)

    # --- update history ---
    history.append({"role": "user", "content": user_text})
    history.append({"role": "assistant", "content": response_text})
    memory.update_user(persona_key, history)

    # --- TTS ---
    try:
        audio_bytes_out = await tts.synthesize(response_text)
        audio_b64 = base64.b64encode(audio_bytes_out).decode()
    except Exception as e:
        logger.error("TTS failed: %s", e)
        # Return text response without audio rather than crashing
        return {
            "user_text": user_text,
            "response_text": response_text,
            "audio_base64": None,
        }

    return {
        "user_text": user_text,
        "response_text": response_text,
        "audio_base64": audio_b64,
    }
