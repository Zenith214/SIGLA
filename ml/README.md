# SIGLA Machine Learning Module

This module implements Random Forest algorithms for analyzing SIGLA survey data, generating predictions, and classifying services into the Action Grid framework.

## Overview

The SIGLA ML module provides functionality for:

1. **Data Extraction**: Extract and normalize survey data from the SIGLA database
2. **Feature Engineering**: Transform raw survey data into ML-ready features
3. **Random Forest Implementation**: Train and evaluate models for prediction and classification
4. **API Integration**: Connect ML functionality with the Next.js application
5. **Model Optimization**: Optimize hyperparameters for improved performance

## Installation

```bash
cd ml
pip install -e .
```

Or install dependencies directly:

```bash
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the `ml` directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: The ML module uses Supabase as the database backend. Ensure your Supabase project has the required tables:
- `survey_response`: Survey response records
- `survey_section`: Survey sections
- `survey_answer`: Individual question answers
- `survey_question`: Question definitions
- `barangays`: Barangay information
- `municipalities`: Municipality data
- `provinces`: Province data
- `historical_performance`: Historical performance data (optional)

## Usage

### Training a Model

```python
from sigla_ml.api import SiglaMLAPI

# Initialize API
api = SiglaMLAPI()

# Train model
metrics = api.train_model(
    target_type='satisfaction',  # 'satisfaction', 'awareness', or 'availment'
    optimize=True  # Enable hyperparameter optimization
)

# Print metrics
print(metrics)
```

### Making Predictions

```python
from sigla_ml.api import SiglaMLAPI

# Initialize API with pre-trained model
api = SiglaMLAPI(model_path='models/optimized_satisfaction_model.joblib')

# Make prediction
prediction = api.predict({
    'population': 5000,
    'households': 1200,
    'area_sqkm': 3.5,
    'urban_rural': 1,
    'health_aware': 1,
    'health_availed': 1
})

print(prediction)
```

### Analyzing a Barangay

```python
from sigla_ml.api import SiglaMLAPI

# Initialize API
api = SiglaMLAPI()

# Analyze barangay
analysis = api.analyze_barangay(barangay_id=10)

print(analysis)
```

### Optimizing a Model

Run the optimization script:

```bash
python optimize.py --target satisfaction --iterations 50 --cv 5
```

## API Integration

The ML module integrates with the Next.js application through API routes:

- `/api/ml/predict`: Make predictions using the trained model
- `/api/ml/analyze`: Analyze survey data for a specific barangay
- `/api/ml/train`: Train a new model with specified parameters

## Model Evaluation

The Random Forest models are evaluated using appropriate metrics:

- **Regression Models**: MSE, RMSE, R² score
- **Classification Models**: Accuracy, Precision, Recall, F1 score

## Action Grid Classification

Services are classified into the Action Grid quadrants based on satisfaction and need for action scores:

- **Maintain**: High satisfaction, low need for action
- **Opportunities**: High satisfaction, high need for action
- **Monitor**: Low satisfaction, low need for action
- **Fix Now**: Low satisfaction, high need for action
## Fa
stAPI Server

The ML module now includes a FastAPI server for real-time API access:

### Starting the Server

```bash
# Option 1: Using the start script
python start_server.py

# Option 2: Direct uvicorn command
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### API Endpoints

#### Community Voice Analysis
Analyze survey comments to extract community insights and themes:

```bash
POST /analyze-community-voice
{
  "comments": ["Great service!", "Needs improvement", "Very helpful staff"],
  "barangay_id": 1  // optional
}
```

Response includes:
- Theme analysis (service quality, accessibility, process, etc.)
- Sentiment categorization (positive, negative, neutral)
- Actionable insights with priority levels
- Sample representative comments

#### Service Performance Prediction
```bash
POST /predict-service-performance
{
  "barangay_id": 1,
  "service_data": {...}
}
```

#### Model Metrics
```bash
GET /model-metrics
```

#### Feature Importance
```bash
GET /feature-importance
```

## Community Voice Analysis

The ML module includes advanced text analysis capabilities for survey comments:

### Features
- **Theme Extraction**: Identifies key themes like service quality, accessibility, process efficiency
- **Sentiment Analysis**: Categorizes feedback as positive, negative, or neutral
- **Insight Generation**: Provides actionable insights with priority levels
- **Multi-language Support**: Basic text cleaning and preprocessing

### Usage Example

```python
from sigla_ml.api import SiglaMLAPI

# Initialize the API
ml_api = SiglaMLAPI()

# Analyze community comments
comments = [
    "The service quality is excellent and staff are helpful",
    "It's too far from our location and hard to access",
    "The process is complicated and takes too long"
]

analysis = ml_api.analyze_community_voice(
    comments=comments,
    barangay_id=1
)

print(f"Themes: {analysis['themes']['top_themes']}")
print(f"Sentiment: {analysis['categories']['percentages']}")
print(f"Insights: {len(analysis['insights'])} generated")
```

## Testing

Test the community voice analysis functionality:

```bash
python test_community_voice.py
```

## Integration with Next.js Frontend

The ML service integrates with the SIGLA frontend through:

1. **Community Voice API**: `/api/community-voice` endpoint
2. **Real-time Analysis**: Frontend calls Next.js API, which communicates with FastAPI ML service
3. **Tools Interface**: Available in the Tools page for testing and analysis

### Frontend Integration Flow
```
Frontend (Tools Page) → Next.js API (/api/community-voice) → FastAPI ML Service (port 8000) → Analysis Results
```