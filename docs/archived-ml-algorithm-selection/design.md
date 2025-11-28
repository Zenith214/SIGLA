# SIGLA Machine Learning Implementation Architecture Design

## Overview

This design document outlines the implementation architecture for integrating Random Forest machine learning algorithms into the SIGLA (Satisfaction Index for Governance and Local Administration) system. The architecture focuses on processing complex survey data, generating satisfaction predictions, and providing actionable governance insights through the Action Grid framework.

## Architecture

### System Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIGLA Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Survey Forms  │  Analytics  │  Action Grid      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)              │
├─────────────────────────────────────────────────────────────────┤
│  /api/ml/predict  │  /api/ml/train  │  /api/ml/analyze         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ML Processing Engine                         │
├─────────────────────────────────────────────────────────────────┤
│  Data Extraction  │  Feature Engineering  │  Model Training    │
│  Prediction       │  Action Grid Logic    │  Performance Eval  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Layer (MySQL + Prisma)             │
├─────────────────────────────────────────────────────────────────┤
│  survey_response  │  survey_section  │  survey_answer          │
│  barangay        │  ml_models       │  ml_predictions         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
Survey Data Collection → Feature Engineering → Model Training → Prediction → Action Grid Classification

1. Raw Survey Data (JSON in survey_section.data)
   ↓
2. Feature Extraction & Normalization
   ↓
3. Random Forest Training/Prediction
   ↓
4. Satisfaction Score Generation
   ↓
5. Action Grid Quadrant Assignment
   ↓
6. Dashboard Visualization & Recommendations
```

## SIGLA Funnel Scoring Implementation with Section Rotation

### Core Scoring Algorithm with Rotation Support

The SIGLA system uses a funnel-based approach where each service is evaluated through 4 sequential metrics. **Key Update:** Due to survey fatigue concerns, respondents complete only 3-4 out of 6 sections, requiring adapted scoring methodology:

```typescript
class SIGLAScoreCalculator {
  calculateServiceScores(
    responses: SurveyResponse[], 
    sectionName: string,
    rotationMode: 'pilot' | 'production' = 'production'
  ): ServiceScores {
    // Step 1: Filter responses that include this specific section
    const sectionResponses = responses.filter(r => 
      r.completedSections.includes(sectionName)
    );
    
    // Step 2: Calculate actual sample size for this section (not fixed 150)
    const actualSampleSize = sectionResponses.length;
    
    // Step 3: Count responses at each funnel stage
    const awareCount = this.countAwareResponses(sectionResponses);
    const availedCount = this.countAvailedResponses(sectionResponses);
    const satisfiedCount = this.countSatisfiedResponses(sectionResponses);
    const needActionCount = this.countNeedActionResponses(sectionResponses);
    
    // Step 4: Apply adapted SIGLA funnel formulas with rotation adjustment
    return {
      awarenessScore: actualSampleSize > 0 ? (awareCount / actualSampleSize) * 100 : null,
      availmentScore: awareCount > 0 ? (availedCount / awareCount) * 100 : null,
      satisfactionScore: availedCount > 0 ? (satisfiedCount / availedCount) * 100 : null,
      needForActionScore: availedCount > 0 ? (needActionCount / availedCount) * 100 : null,
      sampleSize: actualSampleSize,
      confidenceLevel: this.calculateConfidence(actualSampleSize)
    };
  }
  
  private countAwareResponses(responses: SurveyResponse[]): number {
    // Count responses where awareness question = "Oo" or "Yes"
    return responses.filter(r => 
      r.awarenessAnswer === "Oo" || r.awarenessAnswer === "Yes"
    ).length;
  }
  
  private countAvailedResponses(responses: SurveyResponse[]): number {
    // Count responses where availment/experience question = "Oo" or "Yes"
    return responses.filter(r => 
      r.availmentAnswer === "Oo" || r.availmentAnswer === "Yes"
    ).length;
  }
  
  private countSatisfiedResponses(responses: SurveyResponse[]): number {
    // Count responses where satisfaction rating >= 4 (satisfied/very satisfied)
    return responses.filter(r => 
      r.satisfactionRating >= 4
    ).length;
  }
  
  private countNeedActionResponses(responses: SurveyResponse[]): number {
    // Count responses where suggestion/need for action field is not empty
    return responses.filter(r => 
      r.suggestionText && r.suggestionText.trim().length > 0
    ).length;
  }
}
```

### Conditional Skip Logic Handling

```typescript
interface ConditionalLogicProcessor {
  processSkipPatterns(responses: SurveyResponse[]): ProcessedResponses {
    return responses.map(response => {
      // If awareness = "Hindi/No", subsequent questions are skipped
      if (response.awarenessAnswer === "Hindi" || response.awarenessAnswer === "No") {
        return {
          ...response,
          availmentAnswer: null,
          satisfactionRating: null,
          suggestionText: null,
          skipReason: "NO_AWARENESS"
        };
      }
      
      // If availment = "Hindi/No", satisfaction questions are skipped
      if (response.availmentAnswer === "Hindi" || response.availmentAnswer === "No") {
        return {
          ...response,
          satisfactionRating: null,
          suggestionText: null,
          skipReason: "NO_AVAILMENT"
        };
      }
      
      return response;
    });
  }
}
```

## Components and Interfaces

### 1. Data Extraction Component

**Purpose:** Extract and normalize survey data from the existing SIGLA database structure.

**Interface:**
```typescript
interface DataExtractor {
  extractSurveyData(barangayId?: number, dateRange?: DateRange): Promise<SurveyDataset>
  extractHistoricalData(barangayId: number): Promise<HistoricalDataset>
  extractDemographicData(): Promise<BarangayDemographics[]>
}

interface SurveyDataset {
  responses: SurveyResponse[]
  sections: SectionData[]
  demographics: BarangayDemographics[]
  geospatial: LocationData[]
}
```

**Implementation Details:**
- Connects to MySQL database via Prisma ORM
- Parses JSON data from `survey_section.data` field
- Handles conditional skip logic by identifying missing data patterns
- Extracts geographic coordinates and administrative boundaries
- Processes historical performance data from barangay table

### 2. Feature Engineering Component

**Purpose:** Transform raw survey data into SIGLA's funnel-based scoring system and machine learning-ready features.

**Interface:**
```typescript
interface FeatureEngineer {
  calculateServiceScores(responses: SurveyResponse[], sampleSize: number): ServiceScores
  computeFunnelMetrics(serviceScores: ServiceScores[]): FunnelMetrics
  handleConditionalSkipLogic(responses: SurveyResponse[]): ProcessedResponses
  extractTextFeatures(textResponses: TextResponse[]): TextFeatures
  createGeospatialFeatures(locations: LocationData[]): GeospatialFeatures
  generateDerivedFeatures(serviceScores: ServiceScores[]): DerivedFeatures
}

interface ServiceScoreCalculator {
  // Core SIGLA scoring functions
  calculateAwarenessScore(responses: SurveyResponse[], sampleSize: number): number
  calculateAvailmentScore(awareCount: number, availedCount: number): number
  calculateSatisfactionScore(availedCount: number, satisfiedCount: number): number
  calculateNeedForActionScore(availedCount: number, needActionCount: number): number
}

interface ProcessedDataset {
  serviceScores: ServiceScores[]     // 24 funnel-based scores (6 sections × 4 metrics)
  derivedFeatures: DerivedFeatures   // Computed ratios and efficiency metrics
  demographicFeatures: number[]      // Population, households, area
  geospatialFeatures: number[]       // Lat/lng, administrative boundaries
  historicalFeatures: number[]       // Previous years' performance
  metadata: DatasetMetadata
}
```

**SIGLA-Specific Feature Categories:**
1. **Funnel Scores (Primary):** 24 percentage scores based on SIGLA methodology
   - Awareness: (Aware Count / Sample Size) × 100%
   - Availment: (Availed Count / Aware Count) × 100%
   - Satisfaction: (Satisfied Count / Availed Count) × 100%
   - Need for Action: (Need Action Count / Availed Count) × 100%

2. **Funnel Efficiency Metrics (Derived):** Conversion rates between funnel stages
   - Awareness-to-Availment conversion rate
   - Availment-to-Satisfaction conversion rate
   - Satisfaction vs Need-for-Action gap analysis

3. **Conditional Logic Handling:** Process skip patterns where "Hindi/No" responses bypass subsequent questions

4. **Demographic Features:** Population, households, area (normalized to 0-1 scale)

5. **Geographic Features:** Lat/lng coordinates, administrative boundaries

6. **Historical Features:** Previous year funnel scores, trend indicators

7. **Text Features:** TF-IDF vectors from suggestion/comment fields

### 3. Random Forest Model Component

**Purpose:** Core machine learning engine for predictions and classifications.

**Interface:**
```typescript
interface RandomForestEngine {
  trainClassifier(dataset: ProcessedDataset, config: ModelConfig): ClassificationModel
  trainRegressor(dataset: ProcessedDataset, config: ModelConfig): RegressionModel
  predict(model: MLModel, features: FeatureVector): Prediction
  getFeatureImportance(model: MLModel): FeatureImportance[]
  evaluateModel(model: MLModel, testData: ProcessedDataset): ModelMetrics
}

interface ModelConfig {
  nEstimators: number        // Default: 100
  maxDepth: number          // Default: 10
  minSamplesLeaf: number    // Default: 5
  randomState: number       // For reproducibility
  classWeight: 'balanced' | null  // Handle class imbalance
}
```

**Model Types (Updated for SIGLA Funnel Methodology):**
1. **Funnel Score Regressors:** Predict the 4 funnel metrics for each service
   - Awareness Score Predictor (0-100%)
   - Availment Score Predictor (0-100%)
   - Satisfaction Score Predictor (0-100%)
   - Need for Action Score Predictor (0-100%)

2. **Action Grid Classifier:** Classifies services into 4 quadrants using funnel-calculated satisfaction and need-for-action scores

3. **Awardee Status Classifier:** Predicts binary awardee/non-awardee status based on overall funnel performance

4. **Bottleneck Identifier:** Identifies where the biggest drop-offs occur in the awareness→availment→satisfaction funnel

5. **Overall Barangay Score Predictor:** Aggregates individual service funnel scores into overall barangay satisfaction index

### 4. Action Grid Logic Component

**Purpose:** Implement the 4-quadrant classification system using SIGLA's funnel-based scoring methodology.

**Interface:**
```typescript
interface ActionGridEngine {
  classifyService(serviceScores: ServiceScores): ActionGridQuadrant
  classifyAllServices(barangayScores: BarangayServiceScores): ActionGridClassification
  generateRecommendations(classification: ActionGridClassification): ServiceRecommendations
  prioritizeActions(recommendations: ServiceRecommendations[]): PrioritizedActionPlan
}

interface ServiceScores {
  awarenessScore: number      // (No. Aware / 150) × 100%
  availmentScore: number      // (No. Availed / No. Aware) × 100%
  satisfactionScore: number   // (No. Satisfied / No. Availed) × 100%
  needForActionScore: number  // (No. Need Action / No. Availed) × 100%
}

enum ActionGridQuadrant {
  MAINTAIN = 'maintain',           // High satisfaction, Low need for action
  OPPORTUNITIES = 'opportunities', // High satisfaction, High need for action  
  MONITOR = 'monitor',            // Low satisfaction, Low need for action
  FIX_NOW = 'fix_now'            // Low satisfaction, High need for action
}
```

**SIGLA Action Grid Classification Logic:**
```typescript
function classifyService(serviceScores: ServiceScores): ActionGridQuadrant {
  const SATISFACTION_THRESHOLD = 58; // 58% satisfaction threshold (from SIGLA methodology)
  const ACTION_THRESHOLD = 50;       // 50% need for action threshold
  
  // Use the funnel-calculated satisfaction and need-for-action scores
  const satisfaction = serviceScores.satisfactionScore;
  const needForAction = serviceScores.needForActionScore;
  
  if (satisfaction >= SATISFACTION_THRESHOLD) {
    return needForAction >= ACTION_THRESHOLD ? 'OPPORTUNITIES' : 'MAINTAIN';
  } else {
    return needForAction >= ACTION_THRESHOLD ? 'FIX_NOW' : 'MONITOR';
  }
}

// Enhanced classification with funnel context
function classifyServiceWithContext(serviceScores: ServiceScores): EnhancedClassification {
  const quadrant = classifyService(serviceScores);
  
  return {
    quadrant,
    awarenessLevel: categorizeScore(serviceScores.awarenessScore),
    availmentEfficiency: categorizeScore(serviceScores.availmentScore),
    satisfactionLevel: categorizeScore(serviceScores.satisfactionScore),
    actionUrgency: categorizeScore(serviceScores.needForActionScore),
    funnelBottleneck: identifyBottleneck(serviceScores) // Where the biggest drop-off occurs
  };
}

function identifyBottleneck(scores: ServiceScores): FunnelStage {
  const awarenessToAvailment = scores.availmentScore;
  const availmentToSatisfaction = (scores.satisfactionScore / 100) * scores.availmentScore;
  
  if (awarenessToAvailment < 30) return 'AWARENESS_TO_AVAILMENT';
  if (availmentToSatisfaction < 50) return 'AVAILMENT_TO_SATISFACTION';
  return 'NO_MAJOR_BOTTLENECK';
}
```

### 5. AI Insight Generation Component

**Purpose:** Generate narrative insights and explanations from ML analysis results using AI language models.

**Interface:**
```typescript
interface AIInsightEngine {
  generateBarangayInsights(mlResults: MLAnalysisResults): BarangayInsights
  generateActionGridExplanations(classifications: ActionGridClassification[]): ActionGridInsights
  generateFunnelAnalysis(funnelScores: ServiceScores[]): FunnelInsights
  generateRecommendations(analysisResults: ComprehensiveAnalysis): AIRecommendations
  generateComparativeAnalysis(barangayComparison: BarangayComparison): ComparativeInsights
  generateTrendAnalysis(historicalData: HistoricalAnalysis): TrendInsights
}

interface BarangayInsights {
  executiveSummary: string
  keyFindings: string[]
  performanceHighlights: string[]
  areasOfConcern: string[]
  recommendedActions: PrioritizedRecommendation[]
  confidenceLevel: number
}

interface AIRecommendations {
  immediateActions: ActionRecommendation[]
  mediumTermStrategies: StrategyRecommendation[]
  longTermGoals: GoalRecommendation[]
  resourceRequirements: ResourceEstimate[]
  expectedImpact: ImpactProjection[]
}
```

**AI Insight Categories:**
1. **Performance Summaries:** Plain-language explanations of overall barangay performance
2. **Bottleneck Analysis:** Detailed explanations of where and why service delivery breaks down
3. **Comparative Insights:** Analysis of what high-performing barangays do differently
4. **Trend Predictions:** Forward-looking insights based on historical patterns
5. **Action Prioritization:** Ranked recommendations with impact and feasibility assessments
6. **Resource Optimization:** Suggestions for efficient resource allocation across services

### 6. Prediction API Component

**Purpose:** Expose ML capabilities through REST API endpoints.

**API Endpoints:**
```typescript
// Train new models
POST /api/ml/train
{
  modelType: 'satisfaction' | 'actionGrid' | 'awardee',
  barangayIds?: number[],
  dateRange?: { start: Date, end: Date }
}

// Generate predictions
POST /api/ml/predict
{
  modelType: string,
  features: FeatureVector,
  barangayId?: number
}

// Generate AI insights from ML results
POST /api/ai/generate-insights
{
  barangayId: number,
  analysisType: 'comprehensive' | 'actionGrid' | 'funnel' | 'comparative',
  mlResults: MLAnalysisResults
}

// Get AI-generated recommendations
POST /api/ai/recommendations
{
  barangayId: number,
  focusAreas?: string[],
  resourceConstraints?: ResourceConstraints
}

// Get model performance metrics
GET /api/ml/models/{modelId}/metrics

// Get feature importance
GET /api/ml/models/{modelId}/importance

// Batch prediction for dashboard
POST /api/ml/predict/batch
{
  barangayIds: number[],
  predictionTypes: string[]
}

// Batch insight generation
POST /api/ai/insights/batch
{
  barangayIds: number[],
  insightTypes: string[]
}
```

## Data Models

### Database Schema Extensions

```sql
-- ML Models table
CREATE TABLE ml_models (
  model_id INT PRIMARY KEY AUTO_INCREMENT,
  model_name VARCHAR(100) NOT NULL,
  model_type ENUM('classifier', 'regressor') NOT NULL,
  algorithm VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  model_data LONGBLOB NOT NULL,
  feature_names JSON NOT NULL,
  performance_metrics JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ML Predictions table
CREATE TABLE ml_predictions (
  prediction_id INT PRIMARY KEY AUTO_INCREMENT,
  model_id INT NOT NULL,
  barangay_id INT NOT NULL,
  prediction_type VARCHAR(50) NOT NULL,
  predicted_value DECIMAL(5,2),
  predicted_class VARCHAR(50),
  confidence_score DECIMAL(5,4),
  feature_importance JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES ml_models(model_id),
  FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id)
);

-- Action Grid Classifications table
CREATE TABLE action_grid_classifications (
  classification_id INT PRIMARY KEY AUTO_INCREMENT,
  barangay_id INT NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  satisfaction_score DECIMAL(5,2) NOT NULL,
  need_for_action_score DECIMAL(5,2) NOT NULL,
  quadrant ENUM('MAINTAIN', 'OPPORTUNITIES', 'MONITOR', 'FIX_NOW') NOT NULL,
  recommendations JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id)
);

-- AI Generated Insights table
CREATE TABLE ai_insights (
  insight_id INT PRIMARY KEY AUTO_INCREMENT,
  barangay_id INT NOT NULL,
  insight_type ENUM('performance_summary', 'bottleneck_analysis', 'recommendations', 'comparative_analysis', 'trend_prediction') NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  key_findings JSON,
  recommendations JSON,
  confidence_score DECIMAL(5,4),
  ml_analysis_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id),
  FOREIGN KEY (ml_analysis_id) REFERENCES ml_predictions(prediction_id)
);

-- AI Recommendations table
CREATE TABLE ai_recommendations (
  recommendation_id INT PRIMARY KEY AUTO_INCREMENT,
  insight_id INT NOT NULL,
  barangay_id INT NOT NULL,
  recommendation_type ENUM('immediate', 'medium_term', 'long_term') NOT NULL,
  priority_level ENUM('high', 'medium', 'low') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  expected_impact VARCHAR(500),
  resource_requirements JSON,
  implementation_timeline VARCHAR(100),
  success_metrics JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (insight_id) REFERENCES ai_insights(insight_id),
  FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id)
);
```

### SIGLA Scoring Methodology

**Critical Update:** SIGLA uses a funnel-based scoring system, not direct Likert scale averaging:

```typescript
interface ServiceScores {
  awarenessScore: number    // (No. Aware / 150 sample size) × 100%
  availmentScore: number    // (No. Availed / No. Aware) × 100%
  satisfactionScore: number // (No. Satisfied / No. Availed) × 100%
  needForActionScore: number // (No. Said "Need for Action" / No. Availed) × 100%
}

interface SectionScoring {
  calculateAwarenessScore(responses: SurveyResponse[]): number
  calculateAvailmentScore(awareResponses: SurveyResponse[], availedResponses: SurveyResponse[]): number
  calculateSatisfactionScore(availedResponses: SurveyResponse[], satisfiedResponses: SurveyResponse[]): number
  calculateNeedForActionScore(availedResponses: SurveyResponse[], needActionResponses: SurveyResponse[]): number
}
```

### Updated Feature Vector Structure

```typescript
interface FeatureVector {
  // Service-level scores (6 sections × 4 metrics each = 24 features)
  financial_awareness: number      // 0-100%
  financial_availment: number      // 0-100%
  financial_satisfaction: number   // 0-100%
  financial_need_action: number    // 0-100%
  
  disaster_awareness: number
  disaster_availment: number
  disaster_satisfaction: number
  disaster_need_action: number
  
  safety_awareness: number
  safety_availment: number
  safety_satisfaction: number
  safety_need_action: number
  
  social_awareness: number
  social_availment: number
  social_satisfaction: number
  social_need_action: number
  
  business_awareness: number
  business_availment: number
  business_satisfaction: number
  business_need_action: number
  
  environmental_awareness: number
  environmental_availment: number
  environmental_satisfaction: number
  environmental_need_action: number
  
  // Demographic features (normalized)
  population_normalized: number
  households_normalized: number
  area_normalized: number
  
  // Geographic features
  latitude: number
  longitude: number
  
  // Historical features
  previous_year_score: number
  trend_indicator: number
  
  // Funnel efficiency metrics (derived features)
  awareness_to_availment_ratio: number    // Overall conversion rate
  availment_to_satisfaction_ratio: number // Service quality indicator
  satisfaction_vs_need_action_gap: number // Service effectiveness gap
}
```

## Error Handling

### Data Quality Validation
```typescript
interface DataValidator {
  validateSurveyCompleteness(response: SurveyResponse): ValidationResult
  detectOutliers(dataset: ProcessedDataset): OutlierReport
  checkDataConsistency(responses: SurveyResponse[]): ConsistencyReport
  validateGeographicData(location: LocationData): LocationValidation
}
```

### Model Performance Monitoring
```typescript
interface ModelMonitor {
  trackPredictionAccuracy(predictions: Prediction[], actual: ActualResults): AccuracyMetrics
  detectModelDrift(currentPerformance: ModelMetrics, baselinePerformance: ModelMetrics): DriftAlert
  monitorFeatureImportance(model: MLModel): ImportanceShift[]
}
```

## Testing Strategy

### Unit Testing
- Feature engineering functions
- Action Grid classification logic
- Data extraction and validation
- Model training and prediction methods

### Integration Testing
- End-to-end prediction pipeline
- Database integration with ML components
- API endpoint functionality
- Real-time prediction accuracy

### Performance Testing
- Model training time with full dataset
- Prediction latency for dashboard updates
- Memory usage during batch processing
- Concurrent user prediction requests

This architecture provides a robust, scalable foundation for implementing machine learning capabilities in the SIGLA system while maintaining compatibility with the existing Next.js/MySQL infrastructure.