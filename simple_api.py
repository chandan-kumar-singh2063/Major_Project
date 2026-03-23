#!/usr/bin/env python3
"""
E-Commerce Image Search API
Calls Hugging Face Inference API for ViT model predictions
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from typing import Optional

app = FastAPI(
    title="E-Commerce Image Search API",
    description="Image search using Hugging Face ViT model inference",
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
HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = "nigamyadav72/vit-ecommerce-classifier"
# Official HF Inference API endpoint
HF_INFERENCE_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

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
        "model": HF_MODEL,
        "has_token": bool(HF_TOKEN)
    }

@app.post("/search-image/")
async def search_image(
    file: UploadFile = File(...),
    top_k: int = Query(10, ge=1, le=50, description="Number of results"),
    threshold: float = Query(0.3, ge=0.0, le=1.0, description="Minimum similarity")
):
    """
    Search for similar products using image via Hugging Face Inference API
    """
    try:
        # Read image
        image_data = await file.read()
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")

        # Call Hugging Face Inference API
        response = requests.post(
            HF_INFERENCE_URL,
            headers=headers,
            files={"file": image_data},
            timeout=60
        )

        if response.status_code == 401:
            raise HTTPException(
                status_code=401,
                detail="Invalid HF_TOKEN. Please set HF_TOKEN environment variable with a valid token from https://huggingface.co/settings/tokens"
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Model inference failed: {response.text}"
            )

        # Parse HF response - it returns a list of classification results
        hf_result = response.json()

        # Extract top predictions from HF response
        # HF returns something like: [{"score": 0.95, "label": "category_name"}, ...]
        results = []
        if isinstance(hf_result, list):
            for i, item in enumerate(hf_result[:top_k]):
                if item.get("score", 0) >= threshold:
                    results.append({
                        "sku": f"SKU-{item.get('label', 'unknown').upper()}-{i+1:03d}",
                        "label": item.get("label", "unknown"),
                        "similarity": item.get("score", 0),
                        "confidence": "high" if item.get("score", 0) > 0.8 else "medium" if item.get("score", 0) > 0.5 else "low"
                    })

        return {
            "results": results,
            "total": len(results),
            "model": HF_MODEL,
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
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")