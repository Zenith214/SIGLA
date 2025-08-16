# Machine Learning Algorithm Selection for SIGLA Survey Data Processing

## Introduction

The SIGLA (Satisfaction Index for Governance and Local Administration) system is a comprehensive governance satisfaction measurement platform with the following architecture:

**System Components:**
- **Frontend:** Next.js React application with role-based access (Admin, Interviewer, Viewer)
- **Backend:** MySQL database with Prisma ORM
- **Survey Structure:** 6 main sections (Financial Admin, Disaster Prep, Safety & Peace Order, Social Protection, Business Friendliness, Environmental Management)
- **Data Flow:** Individual responses → Barangay aggregation → Municipal analysis → Action Grid classification
- **Geographic Scope:** 25 barangays with demographic and historical data
- **Question Types:** Radio buttons, checkboxes, text areas, 5-point Likert scales, conditional skip logic

**Updated Data Model:**
- Survey responses stored in `survey_response` table with geolocation data
- Section-wise data in `survey_section` with JSON storage
- Individual answers in `survey_answer` with multiple data types
- **Section Rotation System:** Respondents complete only 3-4 out of 6 sections per survey
- **Pilot vs Production Mode:** Full 6-section coverage for pilot testing, rotation scheme for production
- Barangay metadata including population, households, historical performance
- User assignments and progress tracking

This specification defines the requirements for selecting and implementing the optimal ML algorithm to process this complex, multi-dimensional survey data and generate actionable governance insights.

## Requirements

### Requirement 1: Primary Algorithm Selection with Section Rotation Support

**User Story:** As a data analyst, I want to use an effective machine learning algorithm that can handle the SIGLA survey's section rotation system (3-4 sections per respondent) and sparse data patterns, so that I can generate accurate satisfaction predictions despite incomplete section coverage per individual.

#### Acceptance Criteria

1. WHEN processing survey data THEN the algorithm SHALL handle mixed data types (radio: categorical, checkbox: multi-select, textarea: text, rating: 1-5 Likert scale)
2. WHEN analyzing section rotation patterns THEN the algorithm SHALL properly handle systematic missing data where respondents complete only 3-4 out of 6 sections
3. WHEN processing sparse feature matrices THEN the algorithm SHALL maintain prediction accuracy with 50% missing section data per respondent
4. WHEN aggregating barangay-level insights THEN the algorithm SHALL combine partial responses across multiple respondents to generate complete service area coverage
5. WHEN switching between pilot and production modes THEN the algorithm SHALL handle both full 6-section responses (pilot) and 3-4 section responses (production)
6. WHEN dealing with geographic data THEN the algorithm SHALL incorporate location coordinates (lat/lng) and administrative boundaries
7. WHEN analyzing time-series data THEN the algorithm SHALL process historical barangay performance data from 2021-2024
8. IF individual responses are systematically incomplete THEN the algorithm SHALL use ensemble methods to compensate for missing section data

### Requirement 2: Action Grid Classification with Sparse Data Handling

**User Story:** As a governance official, I want to predict which barangay services will fall into each Action Grid quadrant despite having incomplete section coverage per respondent, so that I can make informed resource allocation decisions with limited but representative data.

#### Acceptance Criteria

1. WHEN analyzing satisfaction scores from rotation scheme THEN the algorithm SHALL classify services into 4 Action Grid categories using aggregated data from multiple respondents
2. WHEN predicting barangay performance with sparse data THEN the algorithm SHALL achieve ≥80% accuracy (adjusted from 85% due to missing data challenges)
3. WHEN processing section rotation patterns THEN the algorithm SHALL ensure each service area receives adequate representation across the respondent pool
4. WHEN handling missing sections THEN the algorithm SHALL use matrix completion techniques to estimate missing funnel scores
5. WHEN comparing pilot (full) vs production (rotation) data THEN the algorithm SHALL validate that rotation scheme maintains prediction quality
6. WHEN generating predictions with incomplete individual responses THEN the algorithm SHALL provide confidence intervals that reflect data sparsity
7. WHEN aggregating across respondents THEN the algorithm SHALL weight responses based on section coverage completeness
8. IF section representation is unbalanced THEN the algorithm SHALL flag areas needing additional data collection

### Requirement 3: Funnel-Based Scoring with Section Rotation Adaptation

**User Story:** As a local government unit head, I want to understand the service delivery funnel for each barangay service despite section rotation limitations, so that I can identify bottlenecks and prioritize interventions with available data.

#### Acceptance Criteria

1. WHEN calculating service scores with rotation scheme THEN the algorithm SHALL implement adapted SIGLA funnel methodology:
   - Awareness Score = (No. Aware / Section Sample Size) × 100% (where Section Sample Size varies by rotation)
   - Availment Score = (No. Availed / No. Aware) × 100%
   - Satisfaction Score = (No. Satisfied / No. Availed) × 100%
   - Need for Action Score = (No. Said "Need for Action" / No. Availed) × 100%

2. WHEN processing section rotation data THEN the algorithm SHALL adjust sample sizes based on actual section coverage per service area

3. WHEN handling sparse section coverage THEN the algorithm SHALL use statistical imputation to estimate missing funnel stages

4. WHEN aggregating across rotation groups THEN the algorithm SHALL ensure representative sampling for each service area

5. WHEN comparing pilot vs production funnel scores THEN the algorithm SHALL validate that rotation scheme maintains funnel accuracy

6. WHEN predicting with incomplete feature sets THEN the algorithm SHALL use available funnel scores and impute missing sections

7. WHEN generating confidence intervals THEN the algorithm SHALL reflect uncertainty from reduced sample sizes per section

8. IF section coverage falls below minimum thresholds THEN the algorithm SHALL flag unreliable funnel calculations

### Requirement 4: Interpretability and Explainability

**User Story:** As a local government unit head, I want to understand which funnel stages and service factors most influence overall barangay satisfaction, so that I can prioritize resource allocation and policy interventions effectively.

#### Acceptance Criteria

1. WHEN analyzing results THEN the algorithm SHALL provide feature importance scores for all 24 funnel metrics (6 sections × 4 scores each)
2. WHEN identifying low satisfaction areas THEN the algorithm SHALL pinpoint which funnel stage (awareness, availment, satisfaction, need for action) is the primary bottleneck
3. WHEN comparing barangays THEN the algorithm SHALL highlight key differentiating factors in funnel performance across services
4. IF satisfaction drops THEN the algorithm SHALL identify whether the issue is in awareness, service delivery, or unmet needs
5. WHEN generating reports THEN the algorithm SHALL provide actionable recommendations based on funnel analysis (e.g., "Increase awareness campaigns" vs "Improve service quality")
6. WHEN explaining predictions THEN the algorithm SHALL show how each of the 4 funnel scores contributes to the final Action Grid classification
7. IF Action Grid classification changes THEN the algorithm SHALL explain which funnel metrics drove the reclassification

### Requirement 5: Scalability and Performance

**User Story:** As a system administrator, I want the ML algorithm to process SIGLA's funnel calculations and predictions efficiently across all 25 barangays, so that real-time dashboards and reports can be generated without performance issues.

#### Acceptance Criteria

1. WHEN processing 150 survey responses per barangay (3,750 total) THEN the algorithm SHALL complete funnel score calculations within 2 minutes
2. WHEN calculating all 24 funnel metrics per barangay THEN the algorithm SHALL return results within 500 milliseconds
3. WHEN training models on historical data (2021-2024) THEN the algorithm SHALL complete training within 5 minutes
4. WHEN making Action Grid predictions THEN the algorithm SHALL return classifications within 100 milliseconds
5. WHEN updating models with new survey data THEN the algorithm SHALL support incremental learning without full retraining
6. IF processing multiple barangays simultaneously THEN the algorithm SHALL maintain performance with concurrent requests
7. WHEN scaling to additional municipalities THEN the algorithm SHALL handle 10,000+ responses efficiently

### Requirement 6: Multi-objective Optimization and Action Prioritization

**User Story:** As a policy researcher, I want to optimize interventions across multiple service areas using funnel analysis, so that limited resources can be allocated to achieve maximum satisfaction improvement.

#### Acceptance Criteria

1. WHEN analyzing funnel bottlenecks THEN the algorithm SHALL prioritize interventions based on potential impact and resource requirements
2. WHEN multiple services need attention THEN the algorithm SHALL recommend optimal resource allocation across the 6 service areas
3. WHEN funnel stages conflict (high awareness but low availment) THEN the algorithm SHALL provide targeted intervention strategies
4. IF budget limitations apply THEN the algorithm SHALL prioritize high-impact, low-cost funnel improvements
5. WHEN evaluating intervention options THEN the algorithm SHALL predict multi-dimensional impact on all 4 funnel metrics
6. WHEN services fall in different Action Grid quadrants THEN the algorithm SHALL balance MAINTAIN vs FIX NOW priorities
7. IF historical data shows recurring patterns THEN the algorithm SHALL recommend preventive measures to avoid future funnel breakdowns

### Requirement 7: AI-Powered Insight Generation

**User Story:** As a local government official, I want AI-generated narrative insights and explanations based on ML analysis results, so that I can understand complex patterns and receive actionable recommendations in plain language without needing technical expertise.

#### Acceptance Criteria

1. WHEN ML analysis completes THEN the AI SHALL generate narrative summaries explaining key findings in non-technical language
2. WHEN Action Grid classifications are made THEN the AI SHALL provide contextual explanations for why services fall into specific quadrants
3. WHEN funnel bottlenecks are identified THEN the AI SHALL generate specific recommendations for addressing each bottleneck stage
4. WHEN comparing barangay performance THEN the AI SHALL highlight key differentiating factors and suggest best practices from high-performing areas
5. WHEN historical trends are analyzed THEN the AI SHALL provide predictive insights about future performance and early warning indicators
6. WHEN anomalies are detected THEN the AI SHALL explain potential causes and suggest investigation priorities
7. WHEN resource allocation decisions are needed THEN the AI SHALL generate prioritized action plans with impact estimates and resource requirements
8. IF multiple intervention options exist THEN the AI SHALL compare alternatives and recommend optimal strategies based on cost-benefit analysis

### Requirement 8: Anomaly Detection and Quality Assurance

**User Story:** As a data quality manager, I want to automatically detect anomalous survey responses and funnel calculation errors, so that the integrity of SIGLA satisfaction measurements is maintained.

#### Acceptance Criteria

1. WHEN processing responses THEN the algorithm SHALL identify potentially fraudulent surveys (e.g., all maximum ratings, impossible response patterns)
2. WHEN calculating funnel scores THEN the algorithm SHALL detect mathematical inconsistencies (e.g., more satisfied than availed)
3. WHEN analyzing response patterns THEN the algorithm SHALL identify interviewer bias or systematic errors in conditional skip logic
4. IF funnel calculations produce impossible values THEN the algorithm SHALL flag and correct data quality issues
5. WHEN validating geographic data THEN the algorithm SHALL ensure responses match claimed barangay locations
6. WHEN detecting outliers THEN the algorithm SHALL distinguish between genuine exceptional performance and data errors
7. IF sample sizes are insufficient THEN the algorithm SHALL adjust confidence intervals and flag unreliable funnel scores

## Recommended Algorithm: Random Forest

### Justification for SIGLA System

**Random Forest** is the optimal primary algorithm for SIGLA because it directly addresses the system's specific challenges:

1. **Mixed Data Type Handling:** Seamlessly processes SIGLA's diverse question types:
   - Categorical: Radio button responses ("Oo/Hindi", "Yes/No")
   - Multi-categorical: Checkbox selections with multiple options
   - Numerical: 5-point Likert scales (1-5 satisfaction ratings)
   - Text: Processed suggestion/comment fields via feature extraction

2. **Conditional Logic Compatibility:** Handles SIGLA's skip logic patterns where "Hindi/No" responses create systematic missing data in subsequent questions

3. **JSON Data Processing:** Can work with the nested JSON structure stored in `survey_section.data` field through feature flattening

4. **Geographic Feature Integration:** Incorporates location data (lat/lng coordinates, administrative boundaries) as additional predictive features

5. **Hierarchical Data Support:** Processes individual responses while maintaining barangay-level aggregation capabilities for the 25-barangay system

6. **Historical Pattern Recognition:** Leverages 4-year historical data (2021-2024) to identify performance trends and predict awardee status

7. **Action Grid Classification:** Naturally supports the 4-quadrant classification system through multi-class prediction capabilities

8. **Database Integration:** Compatible with MySQL/Prisma data extraction and can process the existing table structure efficiently

### Implementation Architecture

**Primary Algorithm:** Random Forest Classifier/Regressor
- **Classification Tasks:** Action Grid quadrant assignment, Awardee/Non-Awardee prediction
- **Regression Tasks:** Overall satisfaction score prediction (0-100%), section-wise scoring

**Supporting Algorithms:**
- **XGBoost:** For high-stakes predictions requiring maximum accuracy
- **K-Means Clustering:** For barangay segmentation based on demographics and performance
- **Time Series Analysis (ARIMA/Prophet):** For trend analysis using historical satisfaction data
- **Natural Language Processing (TF-IDF + Sentiment Analysis):** For processing textarea responses and suggestions

## Success Metrics

1. **Funnel Score Accuracy:** ≥90% accuracy in predicting the 4 funnel metrics for each service
2. **Action Grid Classification:** ≥85% accuracy in classifying services into correct quadrants (MAINTAIN, OPPORTUNITIES, MONITOR, FIX NOW)
3. **Bottleneck Identification:** ≥80% accuracy in identifying the primary funnel stage causing performance issues
4. **Processing Speed:** <2 minutes for calculating all funnel scores across 25 barangays
5. **Prediction Latency:** <500ms for real-time Action Grid classifications
6. **Feature Importance Stability:** Consistent top funnel factors across different barangay samples
7. **Interpretability Score:** ≥90% of funnel-based recommendations understood by non-technical government officials
8. **AI Insight Quality:** ≥85% of AI-generated insights rated as "helpful" or "very helpful" by government officials
9. **Insight Generation Speed:** <30 seconds for generating comprehensive narrative insights from ML results
10. **Recommendation Accuracy:** ≥80% of AI-generated recommendations validated as actionable by domain experts
11. **Anomaly Detection Rate:** ≥95% accuracy in identifying problematic survey responses and funnel calculation errors
12. **Historical Trend Accuracy:** ≥80% accuracy in predicting next year's awardee status based on current funnel performance