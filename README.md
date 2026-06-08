# SAHAI — Voice-First Financial AI Companion for Bharat

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.111-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-18-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**SAHAI** is a voice-first financial AI companion designed for everyday Indians. Using natural voice interaction in Hinglish, SAHAI provides personalized financial guidance, government scheme recommendations, and budgeting nudges via WhatsApp.

## 🎯 Overview

SAHAI bridges the financial literacy gap in India by offering:
- **Voice-first interface** — speak naturally in Hindi/Hinglish
- **Intelligent LLM** — Groq's Llama 3.3 70B for contextual financial advice
- **Government schemes** — hardcoded knowledge of PM Mudra, Atal Pension, Sukanya Samridhi, etc.
- **Multi-channel** — web app + WhatsApp Sandbox integration
- **Demo personas** — 3 realistic Indian personas with different income profiles

## ✨ Key Features

| Feature | Details |
|---------|---------|
| **Voice Chat** | STT (Sarvam AI saarika:v2.5) → LLM → TTS (Sarvam bulbul:v3) |
| **WhatsApp Integration** | Twilio Sandbox for nudges & incoming messages |
| **Hinglish Responses** | Natural Hindi-English mix, no formal jargon |
| **Chat Memory** | SQLite-backed conversation history per persona |
| **Mobile-Optimized UI** | Dark theme, 390px max-width, Tailwind CSS |
| **Real-time Streaming** | FastAPI async handlers for responsive UX |

## 🏗️ Architecture

```
SAHAI/
├── backend/                    # FastAPI server (Python 3.10+)
│   ├── main.py                # App initialization & CORS setup
│   ├── db.py                  # SQLite database layer
│   ├── personas.py            # Demo persona data
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── chat.py            # POST /chat — voice + text input
│   │   ├── whatsapp.py        # POST /whatsapp — Twilio webhook
│   │   └── nudge.py           # GET /nudge/{persona} — WhatsApp nudge
│   └── services/
│       ├── stt.py             # Speech-to-text (Sarvam REST)
│       ├── tts.py             # Text-to-speech (Sarvam REST)
│       ├── llm.py             # LLM + prompt engineering (Groq)
│       └── memory.py          # Chat history management
│
├── frontend/                   # React + Vite (Node 18+)
│   ├── src/
│   │   ├── App.jsx            # Main layout & persona selector
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Tailwind + custom animations
│   │   └── components/
│   │       ├── ChatBubble.jsx  # Message display + audio playback
│   │       ├── VoiceButton.jsx # Mic input with recording timer
│   │       └── NudgePanel.jsx  # WhatsApp nudge sender
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .env                        # API keys (not in repo)
├── CLAUDE.md                   # Development notes
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/YourUsername/sahai.git
cd sahai
```

**2. Backend Setup:**
```bash
# Create a Python virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

**3. Frontend Setup:**
```bash
cd frontend
npm install
```

**4. Environment Configuration:**
Create a `.env` file in the root directory:
```env
# Sarvam AI (Speech APIs)
SARVAM_API_KEY=sk_your_sarvam_key_here

# Groq (LLM)
GROQ_API_KEY=gsk_your_groq_key_here

# Twilio WhatsApp Sandbox
TWILIO_ACCOUNT_SID=AC_your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+917009820991
TEST_RECIPIENT=whatsapp:+917009820991
```

### Running the Application

**Terminal 1 — Start Backend:**
```bash
cd D:\SAHAI
uvicorn backend.main:app --reload --port 8000
```
🟢 Backend runs at `http://127.0.0.1:8000`

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm run dev
```
🟢 Frontend runs at `http://localhost:5173`

**Open in browser:** Navigate to **http://localhost:5173**

## 📖 Usage

### Web App Flow

1. **Select a Persona** — Choose Ramesh (auto driver), Priya (ASHA worker), or Suresh (shopkeeper)
2. **Ask a Question** — Click the microphone 🎤 and speak in Hindi/Hinglish
3. **Get Answer** — AI responds in text + voice (auto-plays)
4. **Send Nudge** — Click "Bhejo" to send a WhatsApp reminder

### Example Queries
- "Mera 15000 rupaye income hai, loan kaise le sakta hoon?" (My income is ₹15k, how do I get a loan?)
- "Mujhe bachat kaise karni chahiye?" (How should I save?)
- "Government schemes ke baare mein batao" (Tell me about government schemes)

### WhatsApp Integration

Once you've joined the Twilio sandbox (send "join <keyword>" to +1 415 523 8886):

- **Incoming messages** — Send text or voice note to Twilio → SAHAI replies
- **Nudges** — Backend sends proactive financial reminders

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/chat` | Voice/text input → LLM response + audio |
| POST | `/whatsapp` | Twilio webhook for incoming messages |
| GET | `/nudge/{persona}` | Send WhatsApp nudge for persona |

### Request/Response Examples

**POST /chat** — Voice input
```json
{
  "audio_file": "<webm audio bytes>",
  "filename": "recording.webm"
}
```

**Response**
```json
{
  "user_text": "Mera kitna paisa spend hua?",
  "response_text": "Aap kal ₹500 kharche kar chuke ho...",
  "audio_base64": "//NExAAiQAP..."
}
```

**GET /nudge/ramesh** — Send nudge

**Response**
```json
{
  "status": "sent",
  "persona": "Ramesh Kumar",
  "message": "Ramesh bhai, aaj chaar so rupaye se zyada mat kharchna..."
}
```

## 👥 Demo Personas

| Persona | Occupation | Income | Location | Profile |
|---------|-----------|--------|----------|---------|
| **Ramesh Kumar** | Auto driver | ₹18k/month | Delhi | Has EMI, needs budgeting help |
| **Priya Devi** | ASHA worker | ₹12k/month | Uttar Pradesh | No loans, wants to save |
| **Suresh Yadav** | Kirana shop owner | ₹35k/month | Maharashtra | Business loan queries |

Each persona has hardcoded spending patterns and financial profiles for demo authenticity.

## 🛠️ Technology Stack

**Backend:**
- **Framework** — FastAPI 0.111.0
- **LLM** — Groq (llama-3.3-70b-versatile)
- **Speech** — Sarvam AI (STT saarika:v2.5, TTS bulbul:v3)
- **Messaging** — Twilio WhatsApp SDK
- **Database** — SQLite (file-based)
- **Async** — uvicorn + httpx

**Frontend:**
- **Framework** — React 18 + Vite
- **Styling** — Tailwind CSS + custom CSS
- **Voice** — Browser MediaRecorder API
- **UI Components** — Custom React components

## 🎨 UI/UX Highlights

- **Dark Theme** — Saffron (#FF6B00) accent for Indian heritage
- **Glassmorphism** — Backdrop blur effects, mesh gradients
- **Mobile-First** — 390px max-width, touch-optimized
- **Animations** — Wave effects for audio playback, pulse rings on recording
- **Fonts** — Sora (headings), DM Sans (body)

## 🔐 Security & Privacy

- **API Keys** — All secrets in `.env` (excluded from git via `.gitignore`)
- **No Real Data** — Demo personas use hardcoded spending data
- **No User Auth** — Demo purposes only; not production-ready
- **WhatsApp Sandbox** — Test environment (not real messages)

## 📊 Government Schemes (Hardcoded)

SAHAI knows about these Indian financial programs:
- **PM Mudra Yojana** — Business loans up to ₹10 lakh
- **Atal Pension Yojana** — Retirement security for informal sector
- **PM-JAY** — Health insurance for BPL families
- **Sukanya Samridhi** — Girls' education savings scheme
- **Pradhan Mantri Jan Dhan Yojana** — Basic banking access
- **Fasal Bima Yojana** — Crop insurance
- **PMSBY** — Accident insurance (₹12/year)
- **PMJJBY** — Life insurance (₹330/year)

## 🚧 What's NOT Included

This is an **MVP demo**, not production software:
- ❌ User authentication / login
- ❌ Real bank integration
- ❌ Payment processing
- ❌ Actual financial advice (for demo only)
- ❌ Multi-language beyond Hinglish

## 📈 Future Improvements

- [ ] Switch to 70B LLM for smarter recommendations
- [ ] Incoming WhatsApp bot (reply to user messages)
- [ ] Browser storage for chat persistence across reloads
- [ ] Hindi error messages ("Dobara bolein" instead of raw errors)
- [ ] Spending visualization with charts
- [ ] PWA install support (mobile app-like experience)
- [ ] Production deployment (Render, Railway, AWS)

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Microphone not working | Check browser permissions, use Chrome/Edge |
| TTS audio quality poor | Ensure `bulbul:v3` model in `backend/services/tts.py` |
| WhatsApp nudge not sending | Verify `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN` in `.env` |
| Backend 500 error | Check Sarvam/Groq API keys; review backend logs |
| Frontend won't load | Ensure backend is running on port 8000, check CORS |

## 📝 Development Notes

See `CLAUDE.md` for:
- Detailed system prompts
- API specifications
- Architecture decisions
- Known limitations

## 👨‍💻 Author

**Harmanpreet Singh**  
Built with assistance from Claude Sonnet 4.6

## 📄 License

This project is open-source under the MIT License. See `LICENSE` file for details.

## 🤝 Contributing

This is a capstone/portfolio project. For improvements, feel free to fork and submit PRs.

---

**Ready to demo?** Run the quick start commands above and show your mentor a voice-first financial app designed for India. 🚀

For questions or issues, refer to the architecture section or check the code comments in `backend/services/llm.py`.
