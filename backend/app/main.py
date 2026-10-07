from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1 import search, graph, entities, documents, review, ingestion, analytics

app = FastAPI(title="The Eye — Intelligence & Data Fusion Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(graph.router, prefix="/api/v1/graph", tags=["graph"])
app.include_router(entities.router, prefix="/api/v1/entities", tags=["entities"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(review.router, prefix="/api/v1/review", tags=["review"])
app.include_router(ingestion.router, prefix="/api/v1/ingestion", tags=["ingestion"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "app": "The Eye", "version": "1.0.0"}
