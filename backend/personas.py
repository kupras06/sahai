PERSONAS = {
    "ramesh": {
        "name": "Ramesh Kumar",
        "persona_key": "ramesh",
        "occupation": "Auto Driver",
        "location": "Delhi",
        "income": 18000,
        "income_label": "₹18,000/month",
        "has_loan": True,
        "loan_detail": "EMI ₹3,200/month (vehicle loan)",
        "balance": 4750,
        "spending": {
            "fuel": 4200,
            "food": 3100,
            "emi": 3200,
            "misc": 1800,
        },
        "savings_goal": "Bachon ki padhai ke liye ₹50,000",
        "bio": "Delhi ka auto driver, ghar mein 4 log hain. EMI chal rahi hai gaadi ki.",
    },
    "priya": {
        "name": "Priya Devi",
        "persona_key": "priya",
        "occupation": "ASHA Worker",
        "location": "Uttar Pradesh",
        "income": 12000,
        "income_label": "₹12,000/month",
        "has_loan": False,
        "loan_detail": None,
        "balance": 2300,
        "spending": {
            "groceries": 3500,
            "transport": 800,
            "health": 600,
            "misc": 1200,
        },
        "savings_goal": "Ghar ki repair ke liye ₹20,000",
        "bio": "UP mein ASHA worker, akele kamati hai. Koi loan nahi hai abhi.",
    },
    "suresh": {
        "name": "Suresh Yadav",
        "persona_key": "suresh",
        "occupation": "Kirana Shop Owner",
        "location": "Jaipur",
        "income": 35000,
        "income_label": "₹35,000/month",
        "has_loan": True,
        "loan_detail": "Business loan ₹2,00,000 outstanding",
        "balance": 12400,
        "spending": {
            "stock_purchase": 18000,
            "rent": 5000,
            "staff": 4000,
            "misc": 2500,
        },
        "savings_goal": "Dukan expand karni hai, ₹1,50,000 chahiye",
        "bio": "Jaipur mein kirana shop hai, business loan le rakha hai expansion ke liye.",
    },
}


def get_persona(key: str) -> dict | None:
    return PERSONAS.get(key.lower())


def get_spending_summary(key: str) -> str:
    p = get_persona(key)
    if not p:
        return ""
    lines = [f"Is mahine ka kharcha:"]
    for category, amount in p["spending"].items():
        lines.append(f"  - {category.replace('_', ' ').title()}: ₹{amount:,}")
    lines.append(f"Bank balance: ₹{p['balance']:,}")
    if p["has_loan"]:
        lines.append(f"Loan: {p['loan_detail']}")
    return "\n".join(lines)
