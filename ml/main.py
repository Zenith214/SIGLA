from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import logging
from sigla_ml.api import SiglaMLAPI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SIGLA ML API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML API
ml_api = SiglaMLAPI()

class CommunityVoiceRequest(BaseModel):
    comments: List[str]
    barangay_id: Optional[int] = None

class PredictionRequest(BaseModel):
    barangay_id: int
    service_data: Dict

@app.get("/")
async def root():
    return {"message": "SIGLA ML API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SIGLA ML API"}

@app.post("/analyze-community-voice")
async def analyze_community_voice(request: CommunityVoiceRequest):
    """Analyze survey comments to extract community voice insights."""
    try:
        if not request.comments:
            raise HTTPException(status_code=400, detail="No comments provided")
        
        result = ml_api.analyze_community_voice(
            comments=request.comments,
            barangay_id=request.barangay_id
        )
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Error in community voice analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-service-performance")
async def predict_service_performance(request: PredictionRequest):
    """Predict service performance for a barangay."""
    try:
        result = ml_api.predict_service_performance(
            barangay_id=request.barangay_id,
            service_data=request.service_data
        )
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Error in service performance prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-metrics")
async def get_model_metrics():
    """Get current model performance metrics."""
    try:
        result = ml_api.get_model_metrics()
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting model metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/feature-importance")
async def get_feature_importance():
    """Get feature importance from the trained model."""
    try:
        result = ml_api.get_feature_importance()
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting feature importance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)