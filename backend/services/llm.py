import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _client


# ── Government schemes reference (hardcoded) ──────────────────────────────────
SCHEMES_CONTEXT = """
Sarkari Yojanaen (Government Schemes) jo tu suggest kar sakta hai:

1. PM Jan Dhan Yojana: Zero balance bank account. Debit card milta hai. Accident insurance do lakh rupaye. Sabke liye open hai.

2. PMJJBY (Pradhan Mantri Jeevan Jyoti Bima Yojana): Sirf chhe rupaye mahine ka premium. Do lakh rupaye ka life insurance. 18 se 50 saal wale le sakte hain.

3. PMSBY (Pradhan Mantri Suraksha Bima Yojana): Sirf ek rupaya mahine. Do lakh rupaye accident insurance. Bank account se auto-debit hota hai.

4. Atal Pension Yojana: Har mahine thoda paisa daalo. Saath saal ki umar ke baad guaranteed pension milti hai. Hazaar se paanch hazaar rupaye mahine tak.

5. PM Mudra Yojana: Chhote business ke liye loan. Teen types: Shishu teen lakh tak, Kishore teen se das lakh, Tarun das se pachees lakh. Koi collateral nahi.

6. PM Fasal Bima Yojana: Kisan ke liye crop insurance. Bahut kam premium. Fasal kharab hone par compensation.

7. Sukanya Samridhi Yojana: Beti ke liye savings. Bahut achha interest rate. Tax free returns. Ek saal se das saal ki beti ke liye.

8. PPF (Public Provident Fund): Saal mein dedh lakh tak invest karo. Fifteen saal lock-in. Interest tax free. Bahut safe investment.
"""

# ── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Tu SAHAI hai — Bharat ke aam logon ka financial dost.

RULES — inn ko kabhi mat todna:
1. SIRF 1 sentence mein jawab do. Maximum 2 sentences. Bas.
2. Hinglish mein bolo — jaise mohalle ka dost bolta hai.
3. Koi symbols mat use karo: no ₹, no %, no *, no -, no bullet points, no newlines.
4. Numbers hamesha words mein: "paanch hazaar" not "5000", "dedh hazaar" not "1500", "do lakh" not "200000".
5. Agar government scheme relevant ho toh sirf naam aur ek line mein fayda batao.
6. Seedha point pe aao — intro ya filler mat bolna.

EXAMPLES:
User: kharcha kitna hua?
Good: "Ramesh bhai is mahine tera total kharcha gyarah hazaar do so rupaye hua hai, thoda zyada hai."
Bad: "Arre Ramesh, tumhara kharcha dekha toh... [list]"

User: savings kaise karein?
Good: "Har mahine do hazaar rupaye side mein rakh do, ek saal mein chaubees hazaar ho jayenge."
Bad: "Savings ke liye aapko pehle budget banana chahiye, phir..."
"""


def _clean_for_tts(text: str) -> str:
    """Make text safe and natural for Sarvam TTS."""
    import re
    # Replace ₹ with "rupaye"
    text = text.replace("₹", " rupaye ")
    # Remove % and replace with "percent"
    text = re.sub(r"(\d+)\s*%", r"\1 percent", text)
    # Strip markdown symbols
    text = re.sub(r"[*_`#>\-]", " ", text)
    # Collapse multiple newlines/spaces into single space
    text = re.sub(r"\s+", " ", text)
    # Remove any leading bullet-like characters
    text = re.sub(r"^\s*[\-\*\•]\s*", "", text)
    return text.strip()


def chat(
    user_message: str,
    persona_context: str,
    history: list[dict],
) -> str:
    client = _get_client()

    system = SYSTEM_PROMPT
    if persona_context:
        system += f"\nUser ki profile:\n{persona_context}"
    system += f"\n{SCHEMES_CONTEXT}"

    messages = [{"role": "system", "content": system}]

    for turn in history[-6:]:
        messages.append({"role": turn["role"], "content": turn["content"]})

    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=120,
        temperature=0.6,
    )

    raw = response.choices[0].message.content.strip()
    return _clean_for_tts(raw)
