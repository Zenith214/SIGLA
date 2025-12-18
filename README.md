# PULSE - Public Understanding and Local Service Evaluation

A comprehensive web application for measuring citizen satisfaction with local government services and evaluating barangay-level governance performance in the Philippines.

## 🏛️ Overview

PULSE (Public Understanding and Local Service Evaluation) is a digital platform designed to help Municipal Local Governance Resource Centers (MLGRC) systematically collect citizen feedback, evaluate service delivery effectiveness, and improve barangay-level governance performance. The system provides interactive dashboards, ML-powered analytics, detailed reporting, and data-driven insights to support evidence-based decision-making in local governance.

## ✨ Key Features

### 🗺️ Interactive Dashboard
- **Interactive SVG Map**: Click and explore barangays with real-time data visualization
- **Satisfaction Index Overview**: Visual representation of barangay performance metrics
- **Side Panel Details**: Real-time barangay information with survey progress tracking
- **Cycle-Aware Data**: Historical data comparison across survey cycles
- **Award System**: Visual indicators for SGLGB awardee barangays

### 📊 Analytics & Reporting
- **Dashboard Summary**: KPIs, leaderboards, and trend analysis
- **Service Area Deep Dive**: Detailed performance metrics by service category
- **Demographics Analytics**: Population-based insights and patterns
- **Detailed Response View**: Individual survey response exploration
- **ML-Powered Analysis**: Automated satisfaction scoring and need-for-action metrics
- **CSV Export**: Data export for external analysis tools

### 🔐 Authentication & Security
- **Route Protection**: Secure access to dashboard and administrative features
- **Role-Based Access**: Different access levels for administrators and interviewers
- **Session Management**: Secure token-based authentication
- **Automatic Redirects**: Seamless login flow with return-to-intended-page functionality

### 📱 Survey Management
- **Digital Survey Forms**: Multi-section comprehensive data collection
- **Kish Grid Selection**: Statistical respondent selection methodology
- **Geotagging Integration**: Location-based data collection with Leaflet maps
- **Progress Tracking**: Real-time survey completion monitoring
- **Multi-language Support**: English and Filipino language options
- **Offline Capability**: Continue surveys without internet connection

### ⚙️ Administrative Tools
- **User Management**: Role assignment and access control (Admin, Interviewer, Developer, FS)
- **Barangay Management**: Territory and demographic data administration
- **Survey Cycle Management**: Campaign planning and execution with cycle-specific data
- **Award Management**: SGLGB awardee tracking per cycle
- **Supervisor Assignments**: Interviewer-supervisor relationship management
- **Data Seeding**: Automated test data generation for development

## 🛠️ Tech Stack

### **Core Framework**
- **Next.js** - React framework for server-side rendering, routing, and API routes
- **TypeScript** - Type safety and improved developer experience
- **React** - Component-based UI library

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - Reusable UI components built on Radix UI and styled with Tailwind CSS
- **Lucide React** - Beautiful and customizable SVG icons
- **Embla Carousel** - Responsive and touch-friendly carousels

### **Database & Backend**
- **Prisma** - Next-generation ORM for Node.js and TypeScript
- **PostgreSQL** - Relational database for data storage (Railway deployment)
- **MySQL** - Alternative database support for local development
- **Next.js API Routes** - Serverless API endpoints
- **Python ML Service** - Machine learning analysis for satisfaction scoring

### **Authentication & Security**
- **JSON Web Tokens (JWT)** - Session management
- **bcryptjs** - Secure password hashing
- **js-cookie** - Client-side cookie management

### **Maps & Location**
- **Leaflet.js** - Interactive map rendering (dynamically loaded)
- **Custom SVG Maps** - Territory visualization with click interactions
- **Nominatim API** - Geocoding and reverse geocoding services
- **Custom Geotagging Service** - Location-based data collection utilities

### **Development Tools**
- **ESLint** - Code linting and quality assurance
- **TypeScript** - Static type checking
- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Chart.js** - Data visualization and charting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- PostgreSQL or MySQL database
- Python 3.8+ (for ML service)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PULSE
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your database connection and other environment variables.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
PULSE/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── analytics/      # Analytics endpoints
│   │   │   ├── ml/             # ML service integration
│   │   │   └── ...             # Other API routes
│   │   ├── dashboard/          # Main dashboard interface
│   │   ├── analytics/          # Analytics dashboard
│   │   ├── reportcard/         # Performance report generation
│   │   ├── settings/           # Administrative settings
│   │   ├── survey/             # Survey management and forms
│   │   ├── login/              # Authentication pages
│   │   └── register/           # User registration
│   ├── components/             # Reusable React components
│   │   ├── analytics/          # Analytics components
│   │   ├── auth/               # Authentication components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── survey-cycle/       # Survey cycle management
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions and configurations
│   ├── utils/                  # Helper utilities
│   ├── data/                   # Static data and configurations
│   └── types/                  # TypeScript type definitions
├── public/                     # Public static files
├── prisma/                     # Database schema and migrations
├── ml/                         # Python ML service
├── scripts/                    # Utility scripts
├── tests/                      # Test files
└── docs/                       # Documentation
```

## 🎯 Key Components

### Dashboard Components
- **`InteractiveSVGMap`** - Main map interface with barangay selection and cycle-aware data
- **`BarangaySatisfactionIndex`** - Detailed modal with ML-powered insights
- **`MapCard`** - Container for the interactive map with cycle selection
- **`BarangayDetailsCard`** - Side panel with real-time barangay information and survey progress
- **`SGLGBHistoryCard`** - Historical performance tracking across cycles
- **`MapView`** - Responsive layout manager for map and detail cards

### Analytics Components
- **`DashboardSummaryView`** - KPIs, leaderboards, and trend visualization
- **`ServiceAreaDeepDive`** - Detailed service area performance analysis
- **`DemographicsAnalytics`** - Population-based insights
- **`DetailedResponsesView`** - Individual survey response explorer

### Survey Cycle Management
- **`CycleSelector`** - Active cycle display and selection
- **`HistoricalCycleSelector`** - Historical data comparison tool
- **`useSurveyCycle`** - Custom hook for cycle state management

### Authentication System
- **`AuthProvider`** - Global authentication state management
- **`ProtectedRoute`** - Route-level access control with role-based permissions
- **`UserDropdown`** - User menu with logout functionality

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pulse"

# Authentication
JWT_SECRET="your-secret-key"
COOKIE_NAME="pulse_token"

# ML Service
ML_SERVICE_URL="http://localhost:8000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Schema
The application uses Prisma with PostgreSQL/MySQL for data persistence. Key entities include:
- **Users**: Authentication and role management
- **Barangays**: Territorial data and demographics
- **Survey Cycles**: Campaign management and cycle-specific data
- **Survey Responses**: Individual survey submissions
- **Survey Sections**: Structured survey data by section
- **Survey Targets**: Target response counts per barangay
- **Awards**: SGLGB awardee tracking per cycle
- **Supervisor Assignments**: Interviewer-supervisor relationships

## 📊 Features in Detail

### Interactive Map Dashboard
- **SVG-based map** of municipal territories with custom barangay paths
- **Cycle-aware visualization** with award indicators for SGLGB awardees
- **Click-to-explore** functionality with pin markers and detail modals
- **Side panel details** with real-time survey progress tracking
- **Historical data comparison** across multiple survey cycles

### ML-Powered Analytics
- **Automated Satisfaction Scoring**: Machine learning analysis of survey responses
- **Need for Action Metrics**: Priority identification for service improvements
- **Service Area Analysis**: Detailed breakdown by financial, disaster, safety, social, business, and environmental categories
- **Trend Analysis**: Historical performance tracking and visualization
- **Demographic Insights**: Population-based patterns and correlations

### Survey Management
- **Multi-section Forms**: Comprehensive data collection across 6 service areas
- **Kish Grid Selection**: Statistical respondent selection for household surveys
- **Progress Tracking**: Real-time completion monitoring per barangay
- **Offline Support**: Continue surveys without internet connectivity
- **Multi-language**: English and Filipino language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the coding standards outlined in `AI_RULES.md`
- Use TypeScript for all new components
- Implement responsive design with Tailwind CSS
- Write comprehensive tests for new features
- Maintain component modularity and reusability

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

### Railway Deployment
The application is configured for deployment on Railway with:
- PostgreSQL database
- Automatic migrations on deploy
- Environment variable management
- Python ML service integration

See `railway.json` and `nixpacks.toml` for deployment configuration.

### Docker Support
Docker configuration available for containerized deployment.

## 🏛️ Government Partnership

Developed in collaboration with the Department of the Interior and Local Government (DILG) and Municipal Local Governance Resource Centers (MLGRC) to support evidence-based local governance improvement initiatives in the Philippines.

## 📞 Support

For technical support or questions about the PULSE system, please contact the development team or create an issue in this repository.

---

**Built with ❤️ for better local governance in the Philippines**
