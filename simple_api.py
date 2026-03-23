#!/usr/bin/env python3
"""
Simple Image Search API using Hugging Face Inference API
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from typing import Optional

app = FastAPI(
    title="E-Commerce Image Search API",
    description="Image search using Hugging Face ViT model",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
HF_TOKEN = os.getenv("HF_TOKEN")  # Will be set in DO environment
HF_MODEL = "nigamyadav72/vit-ecommerce-classifier"
HF_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

@app.get("/")
async def root():
    return {
        "message": "E-Commerce Image Search API",
        "version": "1.0",
        "model": HF_MODEL,
        "endpoints": ["/search-image/", "/health"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model": HF_MODEL
    }

@app.post("/search-image/")
async def search_image(
    file: UploadFile = File(...),
    top_k: int = Query(10, ge=1, le=50, description="Number of results"),
    threshold: float = Query(0.3, ge=0.0, le=1.0, description="Minimum similarity")
):
    """
    Search for similar products using image via Hugging Face API
    """
    try:
        # Read image
        image_data = await file.read()
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")

        # Call Hugging Face API
        response = requests.post(
            HF_URL,
            headers=HEADERS,
            files={"file": image_data},
            timeout=60
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Model inference failed: {response.text}"
            )

        # Parse HF response
        hf_result = response.json()

        # For now, return mock results since we don't have the actual product database
        # In production, you'd map the HF predictions to your product catalog
        mock_results = [
            {
                "sku": f"MOCK-{i+1:03d}",
                "similarity": 0.85 - (i * 0.05),  # Decreasing similarity
                "confidence": "high" if i < 3 else "medium"
            }
            for i in range(min(top_k, 10))
        ]

        return {
            "results": mock_results,
            "total": len(mock_results),
            "hf_prediction": hf_result,  # Include raw HF result for debugging
            "parameters": {
                "top_k": top_k,
                "threshold": threshold
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")