from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SaaS Boilerplate API",
    description="Modern SaaS application backend with FastAPI",
    version="1.0.0"
)

# Configure CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "SaaS Boilerplate API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}