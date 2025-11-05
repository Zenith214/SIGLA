# SIGLA System Overview

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Components](#core-components)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Workflows and Interactions](#workflows-and-interactions)
5. [Usage Instructions by Role](#usage-instructions-by-role)
6. [Key Features](#key-features)
7. [Access Controls](#access-controls)
8. [Operational Procedures](#operational-procedures)
9. [Machine Learning Module](#machine-learning-module)
10. [API Documentation](#api-documentation)

## System Architecture

SIGLA (Survey Information and Governance Local Analytics) is a comprehensive web-based platform built with modern technologies:

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes with serverless functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom authentication with bcrypt
- **Machine Learning**: Python with scikit-learn, Random Forest algorithms
- **Deployment**: Vercel-ready with local development support

### Architecture Layers
1. **Presentation Layer**: React components, UI/UX interfaces
2. **Application Layer**: Next.js API routes, business logic
3. **Data Layer**: Supabase PostgreSQL database
4. **ML Layer**: Python-based analytics and prediction engine

## Core Components

### 1. Authentication System
- Secure login/logout functionality
- Role-based access control
- Session management
- Password encryption with bcrypt

### 2. Survey Management
- Dynamic survey creation and configuration
- Multi-section survey structure
- Question types: multiple choice, text, numeric
- Conditional logic and skip patterns

### 3. Data Collection
- Real-time survey response capture
- Interviewer assignment system
- Barangay-specific data collection
- Response validation and quality control

### 4. Analytics Dashboard
- Real-time data visualization
- Service delivery performance metrics
- Barangay-level insights
- Trend analysis and reporting

### 5. Report Generation
- Automated report cards
- Performance scorecards
- Export capabilities (PDF, Excel)
- Custom report templates

### 6. Machine Learning Engine
- Random Forest algorithms
- Predictive analytics
- Service classification (Action Grid)
- Performance optimization

## User Roles and Permissions

### 1. System Administrator
**Permissions:**
- Full system access and configuration
- User management (create, edit, delete users)
- System settings and maintenance
- Database management
- ML model training and optimization
- Security and backup management

**Responsibilities:**
- System maintenance and updates
- User account management
- Data backup and recovery
- Performance monitoring
- Security compliance

### 2. Survey Manager
**Permissions:**
- Survey design and configuration
- Question management
- Survey deployment and scheduling
- Interviewer assignment
- Data quality monitoring
- Report generation

**Responsibilities:**
- Survey planning and design
- Quality assurance
- Interviewer coordination
- Data validation
- Report distribution

### 3. Data Analyst
**Permissions:**
- Analytics dashboard access
- Report generation
- Data export capabilities
- ML model insights
- Performance metrics viewing

**Responsibilities:**
- Data analysis and interpretation
- Report preparation
- Trend identification
- Stakeholder communication
- Recommendation development

### 4. Interviewer
**Permissions:**
- Survey data collection
- Assigned barangay access
- Response submission
- Basic reporting

**Responsibilities:**
- Conduct surveys
- Data collection
- Response quality
- Field coordination

### 5. Barangay Official
**Permissions:**
- View barangay-specific data
- Access performance reports
- Download report cards
- View analytics dashboard (limited)

**Responsibilities:**
- Review performance data
- Action planning
- Community engagement
- Service improvement

## Workflows and Interactions

### 1. Survey Lifecycle Workflow
```
1. Survey Design (Manager) → 
2. Question Configuration (Manager) → 
3. Interviewer Assignment (Manager) → 
4. Data Collection (Interviewer) → 
5. Data Validation (System) → 
6. Analysis Processing (ML Engine) → 
7. Report Generation (System) → 
8. Distribution (Manager/Analyst)
```

### 2. Data Processing Workflow
```
1. Raw Data Capture → 
2. Data Validation → 
3. Feature Engineering → 
4. ML Processing → 
5. Classification (Action Grid) → 
6. Insight Generation → 
7. Report Creation → 
8. Stakeholder Notification
```

### 3. User Authentication Workflow
```
1. Login Request → 
2. Credential Validation → 
3. Role Verification → 
4. Session Creation → 
5. Permission Assignment → 
6. Dashboard Redirect
```

## Usage Instructions by Role

### System Administrator

#### Initial Setup
1. **Environment Configuration**
   ```bash
   # Clone repository
   git clone [repository-url]
   cd SIGLA-2
   
   # Install dependencies
   npm install
   
   # Setup environment variables
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   
   # Setup ML environment
   cd ml
   pip install -r requirements.txt
   ```

2. **Database Setup**
   - Configure Supabase project
   - Run database migrations
   - Seed initial data
   - Verify table structure

3. **User Management**
   - Access `/settings` page
   - Create user accounts
   - Assign roles and permissions
   - Configure access levels

#### Daily Operations
1. **System Monitoring**
   - Check system health
   - Monitor database performance
   - Review error logs
   - Verify backup status

2. **User Support**
   - Reset user passwords
   - Troubleshoot access issues
   - Manage user permissions
   - Handle technical support

### Survey Manager

#### Survey Creation
1. **Access Survey Management**
   - Login with manager credentials
   - Navigate to survey section
   - Click "Create New Survey"

2. **Survey Configuration**
   - Set survey title and description
   - Configure survey sections
   - Add questions with appropriate types
   - Set validation rules
   - Configure skip logic

3. **Deployment**
   - Assign interviewers
   - Set collection periods
   - Define target barangays
   - Launch survey

#### Data Quality Management
1. **Monitor Collection**
   - Track response rates
   - Review data quality metrics
   - Identify incomplete responses
   - Flag anomalies

2. **Quality Assurance**
   - Validate response completeness
   - Check data consistency
   - Review interviewer performance
   - Implement corrections

### Data Analyst

#### Analytics Access
1. **Dashboard Navigation**
   - Login with analyst credentials
   - Access `/analytics` page
   - Select analysis parameters
   - Choose visualization types

2. **Report Generation**
   - Navigate to `/reportcard`
   - Select barangay or region
   - Choose report template
   - Generate and download reports

#### Data Analysis
1. **Performance Metrics**
   - Review service delivery scores
   - Analyze satisfaction levels
   - Identify improvement areas
   - Track performance trends

2. **ML Insights**
   - Access prediction models
   - Review classification results
   - Analyze feature importance
   - Generate recommendations

### Interviewer

#### Survey Conduct
1. **Assignment Access**
   - Login with interviewer credentials
   - View assigned surveys
   - Check barangay assignments
   - Download survey forms

2. **Data Collection**
   - Navigate to `/survey`
   - Select assigned survey
   - Complete respondent information
   - Fill survey responses
   - Submit completed surveys

#### Quality Control
1. **Response Validation**
   - Review completed responses
   - Check for completeness
   - Verify data accuracy
   - Resubmit if necessary

### Barangay Official

#### Performance Review
1. **Dashboard Access**
   - Login with official credentials
   - Access barangay dashboard
   - Review performance metrics
   - View service delivery scores

2. **Report Access**
   - Download performance reports
   - Access historical data
   - View comparison metrics
   - Export data for planning

## Key Features

### 1. Dynamic Survey System
- **Multi-section surveys**: Organize questions into logical sections
- **Question types**: Support for various input types (text, number, choice)
- **Conditional logic**: Skip patterns based on responses
- **Validation rules**: Ensure data quality and completeness

### 2. Real-time Analytics
- **Live dashboards**: Real-time data visualization
- **Performance metrics**: Service delivery indicators
- **Trend analysis**: Historical performance tracking
- **Comparative analysis**: Barangay-to-barangay comparisons

### 3. Machine Learning Integration
- **Predictive models**: Random Forest algorithms
- **Service classification**: Action Grid framework
- **Performance optimization**: Automated hyperparameter tuning
- **Insight generation**: Automated recommendations

### 4. Report Generation
- **Automated reports**: Scheduled report generation
- **Custom templates**: Flexible report formats
- **Export options**: PDF, Excel, CSV formats
- **Distribution**: Automated stakeholder notification

### 5. Mobile-Responsive Design
- **Cross-platform**: Works on desktop, tablet, mobile
- **Offline capability**: Limited offline functionality
- **Touch-friendly**: Optimized for touch interfaces
- **Progressive Web App**: App-like experience

## Access Controls

### Authentication Mechanisms
1. **Username/Password**: Primary authentication method
2. **Session Management**: Secure session handling
3. **Role-based Access**: Permission-based feature access
4. **Password Security**: Bcrypt encryption

### Permission Matrix

| Feature | Admin | Manager | Analyst | Interviewer | Official |
|---------|-------|---------|---------|-------------|----------|
| User Management | ✓ | ✗ | ✗ | ✗ | ✗ |
| Survey Design | ✓ | ✓ | ✗ | ✗ | ✗ |
| Data Collection | ✓ | ✓ | ✗ | ✓ | ✗ |
| Analytics | ✓ | ✓ | ✓ | ✗ | Limited |
| Reports | ✓ | ✓ | ✓ | ✗ | Limited |
| ML Training | ✓ | ✗ | ✗ | ✗ | ✗ |
| System Settings | ✓ | ✗ | ✗ | ✗ | ✗ |

### Data Security
1. **Encryption**: Data encryption at rest and in transit
2. **Access Logging**: Comprehensive audit trails
3. **Input Validation**: Prevent injection attacks
4. **Session Security**: Secure session management

## Operational Procedures

### Daily Operations

#### System Health Check
1. **Database Status**
   ```bash
   cd ml
   python verify_database.py
   ```

2. **Application Status**
   - Check application responsiveness
   - Verify API endpoints
   - Monitor error rates
   - Review performance metrics

#### Data Backup
1. **Automated Backups**
   - Daily database snapshots
   - Configuration backups
   - User data preservation
   - Recovery point objectives

2. **Manual Backups**
   - Critical data exports
   - Configuration snapshots
   - ML model preservation
   - Documentation updates

### Weekly Operations

#### Performance Review
1. **System Performance**
   - Response time analysis
   - Resource utilization
   - Error rate trends
   - User activity patterns

2. **Data Quality Assessment**
   - Response completeness
   - Data consistency checks
   - Anomaly detection
   - Quality metrics review

#### ML Model Maintenance
1. **Model Performance**
   ```bash
   cd ml
   python test_ml.py
   ```

2. **Model Retraining**
   ```bash
   python optimize.py --target satisfaction --iterations 50
   ```

### Monthly Operations

#### Comprehensive Review
1. **System Audit**
   - Security assessment
   - Performance evaluation
   - User feedback analysis
   - Feature usage statistics

2. **Capacity Planning**
   - Resource utilization trends
   - Growth projections
   - Infrastructure needs
   - Budget planning

## Machine Learning Module

### Overview
The ML module provides advanced analytics capabilities using Random Forest algorithms for:
- Service delivery prediction
- Performance classification
- Trend analysis
- Recommendation generation

### Components

#### 1. Data Extraction (`data_extraction.py`)
- **Purpose**: Extract and normalize survey data
- **Functions**:
  - `extract_survey_responses()`: Get survey response data
  - `extract_demographic_data()`: Get barangay demographics
  - `extract_historical_performance()`: Get historical data

#### 2. Feature Engineering (`feature_engineering.py`)
- **Purpose**: Transform raw data into ML features
- **Functions**:
  - `calculate_service_scores()`: Compute service metrics
  - `prepare_features()`: Create feature vectors
  - Handle missing values and categorical encoding

#### 3. Model Training (`model_training.py`)
- **Purpose**: Train and evaluate ML models
- **Functions**:
  - `train_model()`: Train Random Forest models
  - `evaluate_model()`: Assess model performance
  - `save_model()`: Persist trained models

#### 4. ML Pipeline (`ml_pipeline.py`)
- **Purpose**: Orchestrate ML workflows
- **Functions**:
  - `run_full_pipeline()`: Complete ML workflow
  - `generate_insights()`: Create recommendations
  - `classify_services()`: Action Grid classification

### Usage Examples

#### Training a Model
```python
from sigla_ml.ml_pipeline import BarangayMLPipeline

# Initialize pipeline
pipeline = BarangayMLPipeline()

# Train model
metrics = pipeline.train_model(
    target_type='satisfaction',
    test_size=0.2,
    random_state=42
)

print(f"Model R² Score: {metrics['r2_score']:.3f}")
```

#### Making Predictions
```python
# Load trained model
pipeline = BarangayMLPipeline()
pipeline.load_model('models/satisfaction_model.joblib')

# Make prediction
features = {
    'population': 5000,
    'households': 1200,
    'area': 3.5,
    'health_awareness_score': 0.8,
    'health_satisfaction_score': 0.7
}

prediction = pipeline.predict(features)
print(f"Predicted satisfaction: {prediction:.2f}")
```

#### Analyzing Barangay Performance
```python
# Generate comprehensive analysis
analysis = pipeline.analyze_barangay(barangay_id=10)

print("Service Classifications:")
for service, classification in analysis['classifications'].items():
    print(f"  {service}: {classification}")

print("\nRecommendations:")
for rec in analysis['recommendations']:
    print(f"  - {rec}")
```

### Action Grid Classification

Services are classified into four quadrants based on satisfaction and need for action:

1. **Maintain** (High Satisfaction, Low Need)
   - Continue current practices
   - Monitor for changes
   - Share best practices

2. **Opportunities** (High Satisfaction, High Need)
   - Expand successful programs
   - Increase resource allocation
   - Scale effective interventions

3. **Monitor** (Low Satisfaction, Low Need)
   - Regular assessment
   - Identify root causes
   - Prepare improvement plans

4. **Fix Now** (Low Satisfaction, High Need)
   - Immediate intervention required
   - Priority resource allocation
   - Urgent action planning

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
**Purpose**: User authentication

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "role": "string"
  }
}
```

### Survey Endpoints

#### GET `/api/surveys`
**Purpose**: Retrieve available surveys

**Response**:
```json
{
  "surveys": [
    {
      "id": "number",
      "title": "string",
      "description": "string",
      "status": "string"
    }
  ]
}
```

#### POST `/api/surveys/submit`
**Purpose**: Submit survey response

**Request Body**:
```json
{
  "survey_id": "number",
  "barangay_id": "number",
  "responses": {
    "question_id": "answer_value"
  }
}
```

### Analytics Endpoints

#### GET `/api/analytics/barangay/{id}`
**Purpose**: Get barangay analytics

**Response**:
```json
{
  "barangay": {
    "id": "number",
    "name": "string",
    "population": "number"
  },
  "metrics": {
    "satisfaction_score": "number",
    "awareness_score": "number",
    "availment_score": "number"
  },
  "services": [
    {
      "name": "string",
      "classification": "string",
      "score": "number"
    }
  ]
}
```

### ML Endpoints

#### POST `/api/ml/predict`
**Purpose**: Make ML predictions

**Request Body**:
```json
{
  "features": {
    "population": "number",
    "households": "number",
    "area": "number"
  },
  "model_type": "string"
}
```

#### POST `/api/ml/train`
**Purpose**: Train ML model

**Request Body**:
```json
{
  "target_type": "string",
  "parameters": {
    "test_size": "number",
    "random_state": "number"
  }
}
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
1. **Symptoms**: Connection timeouts, authentication errors
2. **Solutions**:
   - Verify Supabase credentials
   - Check network connectivity
   - Validate environment variables
   - Test database connection

#### ML Model Training Failures
1. **Symptoms**: Training errors, poor performance
2. **Solutions**:
   - Check data quality
   - Verify feature engineering
   - Adjust hyperparameters
   - Increase training data

#### Authentication Problems
1. **Symptoms**: Login failures, session issues
2. **Solutions**:
   - Reset user passwords
   - Clear browser cache
   - Check user permissions
   - Verify session configuration

### Support Contacts

- **Technical Support**: [technical-support@sigla.gov]
- **System Administration**: [admin@sigla.gov]
- **User Training**: [training@sigla.gov]
- **Data Analysis**: [analytics@sigla.gov]

## Conclusion

The SIGLA system provides a comprehensive platform for survey-based governance analytics with advanced ML capabilities. This documentation serves as a complete guide for all user roles and operational procedures. Regular updates and training ensure optimal system utilization and continuous improvement in local governance analytics.

For additional support or advanced configurations, please contact the system administration team or refer to the technical documentation in the respective module directories.