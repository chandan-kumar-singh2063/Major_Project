"""
PRODUCTION-READY SEARCH API FOR E-COMMERCE
===========================================
Features:
- Background removal for better accuracy
- Fine-tuned model with L2 normalization
- Similarity thresholding
- Confidence scoring
- Error handling & logging
- Performance monitoring
- Caching for speed
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
import numpy as np
import pandas as pd
from timm import create_model
from torchvision import transforms
import torch
from sklearn.metrics.pairwise import cosine_similarity
import math
from functools import lru_cache
import logging
import time
from typing import Optional
import hashlib

# Background removal
try:
    from rembg import remove
    BACKGROUND_REMOVAL_AVAILABLE = True
except ImportError:
    BACKGROUND_REMOVAL_AVAILABLE = False
    logging.warning("rembg not installed. Background removal disabled.")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# LOAD DATA & MODEL
# ============================================================================

logger.info("Loading data and model...")

try:
    # Load features and SKUs
    features = np.load("vit_features.npy")
    sku_df = pd.read_csv("sku_mapping.csv")
    product_df = pd.read_csv("merged_products.csv")
    skus = sku_df['sku'].tolist()
    
    # L2 normalize features
    features = features / (np.linalg.norm(features, axis=1, keepdims=True) + 1e-8)
    
    # Load category mapping if available
    try:
        import pickle
        with open('label_encoder.pkl', 'rb') as f:
            label_encoder = pickle.load(f)
        CATEGORY_AWARE = True
    except:
        CATEGORY_AWARE = False
        logger.warning("Label encoder not found. Category-aware ranking disabled.")
    
    logger.info(f"✅ Loaded {len(skus)} products")
except Exception as e:
    logger.error(f"❌ Error loading data: {e}")
    raise

# Device setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Using device: {device}")

# Load model
try:
    from transformers import ViTForImageClassification, ViTImageProcessor
    
    # Try fine-tuned model first
    try:
        model = ViTForImageClassification.from_pretrained("./vit_fine_tuned_model")
        processor = ViTImageProcessor.from_pretrained("./vit_fine_tuned_model")
        logger.info("✅ Loaded fine-tuned model")
        USE_FINETUNED = True
    except:
        model = create_model('vit_base_patch16_224', pretrained=True, num_classes=0)
        processor = None
        logger.warning("⚠️ Using pretrained model")
        USE_FINETUNED = False
    
    model.to(device)
    model.eval()
except Exception as e:
    logger.error(f"❌ Error loading model: {e}")
    raise

# Transforms
if processor:
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=processor.image_mean, std=processor.image_std),
    ])
else:
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ])

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def preprocess_image(image_data: bytes, remove_bg: bool = True) -> Image.Image:
    """
    Preprocess image: background removal + conversions
    """
    try:
        # Remove background if available and requested
        if remove_bg and BACKGROUND_REMOVAL_AVAILABLE:
            clean_data = remove(image_data)
            image = Image.open(BytesIO(clean_data)).convert('RGB')
            logger.debug("Background removed")
        else:
            image = Image.open(BytesIO(image_data)).convert('RGB')
        
        return image
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise

def extract_features(image: Image.Image, use_tta: bool = False) -> np.ndarray:
    """
    Extract normalized features from image
    
    Args:
        image: PIL Image
        use_tta: Use test-time augmentation
    """
    try:
        if use_tta:
            # Multiple augmented views
            augmentations = [
                transform,
                transforms.Compose([
                    transforms.RandomHorizontalFlip(p=1.0),
                    transform
                ]),
            ]
            
            features_list = []
            for aug in augmentations:
                if callable(aug):
                    input_tensor = aug(image).unsqueeze(0).to(device)
                else:
                    input_tensor = aug(image).unsqueeze(0).to(device)
                
                with torch.no_grad():
                    if USE_FINETUNED:
                        feat = model.vit(input_tensor).last_hidden_state[:, 0, :]
                    else:
                        feat = model(input_tensor)
                features_list.append(feat.cpu().numpy().flatten())
            
            # Average features
            query_feat = np.mean(features_list, axis=0)
        else:
            input_tensor = transform(image).unsqueeze(0).to(device)
            with torch.no_grad():
                if USE_FINETUNED:
                    feat = model.vit(input_tensor).last_hidden_state[:, 0, :]
                else:
                    feat = model(input_tensor)
            query_feat = feat.cpu().numpy().flatten()
        
        # L2 normalize
        query_feat = query_feat / (np.linalg.norm(query_feat) + 1e-8)
        
        return query_feat
    except Exception as e:
        logger.error(f"Error extracting features: {e}")
        raise

def search_similar(
    query_feat: np.ndarray,
    database_features: np.ndarray,
    skus: list,
    top_k: int = 20,
    threshold: float = 0.3,
    category_filter: Optional[str] = None
) -> list:
    """
    Search with similarity threshold and optional category filtering
    """
    try:
        # Calculate similarities
        similarities = cosine_similarity([query_feat], database_features)[0]
        
        # Category filtering
        if category_filter and CATEGORY_AWARE:
            category_mask = product_df['category'] == category_filter
            valid_indices = np.where(category_mask.values)[0]
        else:
            valid_indices = np.arange(len(similarities))
        
        # Threshold filtering
        threshold_mask = similarities[valid_indices] >= threshold
        filtered_indices = valid_indices[threshold_mask]
        
        if len(filtered_indices) == 0:
            logger.warning("No results above threshold, lowering threshold")
            filtered_indices = valid_indices
        
        # Sort and get top-k
        filtered_similarities = similarities[filtered_indices]
        sorted_idx = filtered_similarities.argsort()[-top_k:][::-1]
        top_indices = filtered_indices[sorted_idx]
        
        results = []
        for idx in top_indices:
            if math.isfinite(similarities[idx]):
                results.append({
                    'sku': skus[idx],
                    'similarity': float(similarities[idx]),
                    'confidence': get_confidence_level(similarities[idx])
                })
        
        return results
    except Exception as e:
        logger.error(f"Error in search: {e}")
        return []

def get_confidence_level(similarity: float) -> str:
    """Map similarity to confidence level"""
    if similarity > 0.8:
        return "very_high"
    elif similarity > 0.7:
        return "high"
    elif similarity > 0.5:
        return "medium"
    elif similarity > 0.3:
        return "low"
    else:
        return "very_low"

# Simple cache for features (production: use Redis)
feature_cache = {}

def get_cached_features(image_hash: str):
    """Get cached features if available"""
    return feature_cache.get(image_hash)

def cache_features(image_hash: str, features: np.ndarray):
    """Cache features (limit cache size)"""
    if len(feature_cache) > 1000:
        # Remove oldest
        feature_cache.pop(next(iter(feature_cache)))
    feature_cache[image_hash] = features

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="E-Commerce Image Search API",
    description="Production-ready image search with background removal",
    version="3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "E-Commerce Image Search API",
        "version": "3.0",
        "features": {
            "background_removal": BACKGROUND_REMOVAL_AVAILABLE,
            "fine_tuned_model": USE_FINETUNED,
            "category_aware": CATEGORY_AWARE,
            "caching": True
        },
        "device": str(device),
        "total_products": len(skus)
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,
        "features_loaded": len(features) > 0,
        "background_removal": BACKGROUND_REMOVAL_AVAILABLE
    }

@app.get("/categories")
async def get_categories():
    """Get available product categories"""
    if CATEGORY_AWARE:
        categories = product_df['category'].unique().tolist()
        return {"categories": categories}
    return {"categories": []}

@app.post("/search-image/")
async def search_image(
    file: UploadFile = File(...),
    top_k: int = Query(10, ge=1, le=50, description="Number of results"),
    threshold: float = Query(0.3, ge=0.0, le=1.0, description="Minimum similarity"),
    remove_bg: bool = Query(True, description="Remove background"),
    use_tta: bool = Query(False, description="Use test-time augmentation"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Search for similar products using image
    
    - **file**: Image file (JPG, PNG, etc.)
    - **top_k**: Number of results to return (1-50)
    - **threshold**: Minimum similarity score (0.0-1.0)
    - **remove_bg**: Remove background for better accuracy
    - **use_tta**: Use test-time augmentation (slower but more accurate)
    - **category**: Optional category filter
    """
    start_time = time.time()
    logger.info(f"📸 Search request: {file.filename}")
    
    try:
        # Read image
        image_data = await file.read()
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        # Check cache
        image_hash = hashlib.md5(image_data).hexdigest()
        cached_features = get_cached_features(image_hash)
        
        if cached_features is not None:
            logger.info("Using cached features")
            query_feat = cached_features
        else:
            # Preprocess
            image = preprocess_image(image_data, remove_bg=remove_bg)
            logger.info(f"Image size: {image.size}")
            
            # Extract features
            query_feat = extract_features(image, use_tta=use_tta)
            
            # Validate
            if not np.isfinite(query_feat).all():
                raise HTTPException(status_code=500, detail="Feature extraction failed")
            
            # Cache
            cache_features(image_hash, query_feat)
        
        # Search
        results = search_similar(
            query_feat,
            features,
            skus,
            top_k=top_k,
            threshold=threshold,
            category_filter=category
        )
        
        search_time = time.time() - start_time
        logger.info(f"✅ Found {len(results)} results in {search_time:.3f}s")
        
        return {
            "results": results,
            "total": len(results),
            "search_time": round(search_time, 3),
            "parameters": {
                "top_k": top_k,
                "threshold": threshold,
                "remove_bg": remove_bg,
                "use_tta": use_tta,
                "category": category
            },
            "cached": cached_features is not None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get API statistics"""
    return {
        "total_products": len(skus),
        "cached_queries": len(feature_cache),
        "background_removal": BACKGROUND_REMOVAL_AVAILABLE,
        "categories": len(product_df['category'].unique()) if CATEGORY_AWARE else 0
    }

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    logger.info("="*60)
    logger.info("E-COMMERCE IMAGE SEARCH API")
    logger.info("="*60)
    logger.info(f"Background Removal: {BACKGROUND_REMOVAL_AVAILABLE}")
    logger.info(f"Fine-tuned Model: {USE_FINETUNED}")
    logger.info(f"Category Aware: {CATEGORY_AWARE}")
    logger.info(f"Device: {device}")
    logger.info("="*60)
    
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
