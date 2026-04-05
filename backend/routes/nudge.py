import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from backend.personas import get_persona
from backend.routes.whatsapp import send_whatsapp_message

load_dotenv()

router = APIRouter()

NUDGE_MESSAGES = {
    "ramesh": "Ramesh bhai, aaj chaar so rupaye se zyada mat kharchna. Mahine ke paanch din bache hain.",
    "priya": "Priya didi, aaj do so rupaye side mein rakh do. Bachat zaroori hai!",
    "suresh": "Suresh bhai, aaj business ka hisaab check karo. SAHAI yaad dila raha hai.",
}


@router.get("/nudge/{persona_name}")
async def send_nudge(persona_name: str):
    key = persona_name.lower()
    persona = get_persona(key)
    if not persona:
        return JSONResponse({"error": "Unknown persona"}, status_code=404)

    nudge_text = NUDGE_MESSAGES.get(key, "SAHAI ki taraf se: Aaj kuch bachat karo!")
    recipient = os.getenv("TEST_RECIPIENT", "")

    if not recipient:
        return JSONResponse({
            "status": "no_recipient",
            "reason": "TEST_RECIPIENT not set in .env",
            "persona": persona["name"],
            "message": nudge_text,
        })

    success = send_whatsapp_message(recipient, nudge_text)

    if success:
        return JSONResponse({
            "status": "sent",
            "persona": persona["name"],
            "message": nudge_text,
        })
    else:
        return JSONResponse({
            "status": "error",
            "persona": persona["name"],
            "message": nudge_text,
            "reason": "Twilio send failed — check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env",
        })
