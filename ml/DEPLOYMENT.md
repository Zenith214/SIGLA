# Python ML Service Deployment Guide

## Deploy to Railway

### Step 1: Create New Service

1. Go to your Railway project
2. Click **"New Service"** or **"+ New"**
3. Select **"GitHub Repo"**
4. Choose your repository
5. Set **Root Directory** to `ml/`

### Step 2: Configure Environment Variables

Add these variables in Railway:

```
DATABASE_URL=postgresql://...  (same as your Next.js service)
PORT=8000  (Railway sets this automatically)
PYTHON_VERSION=3.11
```

### Step 3: Deploy

Railway will automatically:
- Detect Python
- Install dependencies from `requirements.txt`
- Run the FastAPI server

### Step 4: Get the URL

1. Go to Settings → Networking
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://ml-service.up.railway.app`)

### Step 5: Update Next.js App

Add the ML service URL to your Next.js environment variables:

```
ML_API_URL=https://ml-service.up.railway.app
```

## Test the API

Once deployed, test it:

```bash
# Health check
curl https://your-ml-service.up.railway.app/health

# Prediction
curl -X POST https://your-ml-service.up.railway.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{"barangay_id": 1}'
```

## Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `POST /api/predict` - Make predictions
- `POST /api/analyze` - Analyze barangay data
- `GET /api/funnel-analysis` - Funnel analysis

## Troubleshooting

**Build fails:**
- Check Railway logs
- Verify `requirements.txt` is correct
- Ensure Python 3.11 is specified

**Service won't start:**
- Check if PORT environment variable is set
- Verify FastAPI and uvicorn are installed
- Check logs for import errors

**Can't connect from Next.js:**
- Verify ML_API_URL is set correctly
- Check CORS settings in `app.py`
- Ensure service is running (check Railway dashboard)
