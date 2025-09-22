from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SaaS Boilerplate API",
    description="Modern SaaS application backend with FastAPI",
    version="1.0.0"
)

# Configure CORS - useful for production and other environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://yourdomain.com",  # Production frontend (update as needed)
    ],
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