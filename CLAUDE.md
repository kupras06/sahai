# SAHAI — Voice-First Financial AI Companion for Bharat

## Project Goal
Build a working MVP demo. NOT a production app. Focus on demo quality.

## What we're building
- FastAPI backend (Python)
- React frontend (Vite) — mobile-style UI, max-width 390px
- WhatsApp bot via TWILIO SANDBOX (NOT Meta Cloud API)
- Voice: Sarvam AI for STT + TTS (Hinglish)
- LLM: Groq (Llama 3.3 70B)
- Memory: SQLite (file-based, no setup needed)

## APIs (from .env only — never hardcode)
- SARVAM_API_KEY → Sarvam STT + TTS
- GROQ_API_KEY → Groq LLM
- TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN → Twilio client
- TWILIO_WHATSAPP_FROM → whatsapp:+14155238886 (sandbox sender)
- TWILIO_WHATSAPP_TO → whatsapp:+917009820991 (test recipient)

## WhatsApp Integration — TWILIO ONLY
- Use twilio Python SDK exclusively
- Incoming webhook: POST /whatsapp (Twilio posts here)
- Outgoing: twilio_client.messages.create(from_, to, body)
- Voice notes: download from MediaUrl0 using Twilio auth, send to Sarvam STT
- Webhook URL set in Twilio Console Sandbox settings
- NO Meta Cloud API code anywhere in the project

## Core user flow
1. User speaks or types → STT (Sarvam saaras:v2) → text
2. text + user memory → Groq (llama-3.3-70b-versatile) → Hinglish response
3. response → TTS (Sarvam bulbul:v1, speaker: meera) → audio played back
4. Same flow on WhatsApp: message/voice note in → text reply out

## Language
Always Hinglish — natural Hindi + English mix. Never formal.
Like a trusted friend who knows finance.

## Demo personas (hardcoded in personas.py)
- Ramesh Kumar — auto driver, ₹18k/month, has EMI, Delhi
- Priya Devi — ASHA worker, ₹12k/month, no loan, UP
- Suresh Yadav — kirana shop owner, ₹35k/month, business loan query

## Sarvam API
- STT: POST https://api.sarvam.ai/speech-to-text
  - header: api-subscription-key
  - body: file (wav), language_code: hi-IN, model: saaras:v2
- TTS: POST https://api.sarvam.ai/text-to-speech
  - body: text, target_language_code: hi-IN, speaker: meera, model: bulbul:v1
  - returns: base64 audio in response.json()["audios"][0]

## Groq API
- SDK: groq (pip install groq)
- Model: llama-3.3-70b-versatile
- Max tokens: 150

## Twilio WhatsApp
- SDK: twilio (pip install twilio)
- Sandbox number: +14155238886
- Incoming webhook at POST /whatsapp — NO verification handshake needed (unlike Meta)
- Form fields: Body, MediaUrl0, From
- Download voice note: requests.get(MediaUrl0, auth=(SID, TOKEN))
- NO Meta Cloud API code anywhere in the project

## SAHAI System Prompt
You are SAHAI — a financial companion for Bharat.
User profile injected from memory each call.
Always reply in Hinglish. Max 2-3 sentences.
Give ONE clear actionable advice.
Format: "Aap [action] kar sakte ho. Isse [benefit] hoga."

## What to FAKE for demo
- Bank balance (hardcode per persona)
- Spending history (hardcode ₹ amounts)
- SMS nudges (show in UI as sent)

## What NOT to build
- Auth/login
- Real bank integration
- User registration
- Payment processing

## Code style
- python-dotenv, load_dotenv() at top of main.py
- All secrets from os.getenv() only
- FastAPI + uvicorn
- React + Vite + Tailwind CSS
- CORS enabled for localhost:5173