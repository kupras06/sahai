import os
import requests
from fastapi import APIRouter, Request, Form
from fastapi.responses import PlainTextResponse, JSONResponse
from dotenv import load_dotenv
from twilio.rest import Client

from backend.personas import get_persona, get_spending_summary
from backend.services import llm, stt, memory

load_dotenv()

router = APIRouter()

_twilio_client = None


def _get_twilio_client() -> Client:
    global _twilio_client
    if _twilio_client is None:
        sid = os.getenv("TWILIO_ACCOUNT_SID")
        token = os.getenv("TWILIO_AUTH_TOKEN")
        _twilio_client = Client(sid, token)
    return _twilio_client


def send_whatsapp_message(to: str, body: str) -> bool:
    """Send a WhatsApp message via Twilio. Returns True on success."""
    client = _get_twilio_client()
    from_ = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
    try:
        client.messages.create(body=body, from_=from_, to=to)
        return True
    except Exception as e:
        print(f"Twilio send error: {e}")
        return False


@router.get("/whatsapp")
async def whatsapp_health():
    return PlainTextResponse("ok")


@router.post("/whatsapp")
async def receive_message(
    Body: str = Form(default=""),
    MediaUrl0: str = Form(default=None),
    From: str = Form(default=""),
):
    persona_key = "ramesh"  # default demo persona
    persona_data = get_persona(persona_key)

    # --- resolve user text ---
    if MediaUrl0:
        sid = os.getenv("TWILIO_ACCOUNT_SID")
        token = os.getenv("TWILIO_AUTH_TOKEN")
        resp = requests.get(MediaUrl0, auth=(sid, token), timeout=20)
        resp.raise_for_status()
        user_text = await stt.transcribe(resp.content, "audio.ogg")
    else:
        user_text = Body.strip()

    if not user_text:
        return PlainTextResponse("", status_code=200)

    # --- LLM ---
    user_data = memory.get_user(persona_key)
    history = user_data["chat_history"]
    context = (
        f"Naam: {persona_data['name']}\n"
        f"Kaam: {persona_data['occupation']}, {persona_data['location']}\n"
        f"Income: {persona_data['income_label']}\n"
        f"{get_spending_summary(persona_key)}"
    )
    response_text = llm.chat(user_text, context, history)
    history.append({"role": "user", "content": user_text})
    history.append({"role": "assistant", "content": response_text})
    memory.update_user(persona_key, history)

    # --- send reply ---
    send_whatsapp_message(From, response_text)

    return PlainTextResponse("", status_code=200)
