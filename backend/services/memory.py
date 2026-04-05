import json
from backend.db import get_conn


def get_user(persona_name: str) -> dict:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE persona_name = ?", (persona_name,)
        ).fetchone()
        if row:
            return {
                "persona_name": row["persona_name"],
                "chat_history": json.loads(row["chat_history"]),
            }
        # auto-create on first access
        conn.execute(
            "INSERT INTO users (persona_name, chat_history) VALUES (?, ?)",
            (persona_name, "[]"),
        )
        conn.commit()
        return {"persona_name": persona_name, "chat_history": []}


def update_user(persona_name: str, chat_history: list) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO users (persona_name, chat_history)
            VALUES (?, ?)
            ON CONFLICT(persona_name) DO UPDATE SET
                chat_history = excluded.chat_history,
                updated_at = CURRENT_TIMESTAMP
            """,
            (persona_name, json.dumps(chat_history, ensure_ascii=False)),
        )
        conn.commit()
