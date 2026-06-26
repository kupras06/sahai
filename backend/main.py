import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.db import init_db
from backend.routes import chat, whatsapp, nudge

app = FastAPI(title="SAHAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(whatsapp.router, prefix="/api")
app.include_router(nudge.router, prefix="/api")


@app.on_event("startup")
async def startup():
    init_db()


@app.get("/api/health")
async def health():
    return {"message": "SAHAI API is running"}


# Serve frontend static assets in production
frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))

if os.path.exists(frontend_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="static")

    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        index_path = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "r") as f:
                return HTMLResponse(content=f.read(), status_code=200)

