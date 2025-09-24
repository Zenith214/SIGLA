# PULSE - Public Understanding and Local Service Evaluation

A comprehensive web application for measuring citizen satisfaction with local government services and evaluating barangay-level governance performance in the Philippines.

## 🏛️ Overview

PULSE (Public Understanding and Local Service Evaluation) is a digital platform designed to help Municipal Local Governance Resource Centers (MLGRC) systematically collect citizen feedback, evaluate service delivery effectiveness, and improve barangay-level governance performance. The system provides interactive dashboards, detailed reporting, and data-driven insights to support evidence-based decision-making in local governance.

## ✨ Key Features

### 🗺️ Interactive Dashboard
- **Interactive SVG Map**: Click and explore barangays with real-time data visualization
- **Satisfaction Index Overview**: Visual representation of barangay performance metrics
- **Dynamic Data Cards**: Real-time updates of barangay details and SGLGB history
- **Action Grid Analysis**: Categorized service areas (Maintain, Opportunities, Monitor, Fix Now)

### 📊 Performance Reporting
- **Comprehensive Report Cards**: Detailed barangay performance analysis
- **AI-Generated Insights**: Automated summary and recommendations
- **Service Area Breakdown**: Tabular analysis of satisfaction and action priorities
- **Citizen Voice Integration**: Real citizen quotes and feedback
- **PDF Export**: Professional reports ready for printing and sharing

### 🔐 Authentication & Security
- **Route Protection**: Secure access to dashboard and administrative features
- **Role-Based Access**: Different access levels for administrators and interviewers
- **Session Management**: Secure token-based authentication
- **Automatic Redirects**: Seamless login flow with return-to-intended-page functionality

### 📱 Survey Management
- **Digital Survey Forms**: Comprehensive data collection tools
- **Kish Grid Selection**: Statistical respondent selection methodology
- **Geotagging Integration**: Location-based data collection
- **Progress Tracking**: Real-time survey completion monitoring

### ⚙️ Administrative Tools
- **User Management**: Role assignment and access control
- **Barangay Management**: Territory and demographic data administration
- **Survey Cycle Management**: Campaign planning and execution
- **Data Export/Import**: Backup and restore functionality

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
- **MySQL** - Relational database for data storage
- **Next.js API Routes** - Serverless API endpoints

### **Authentication & Security**
- **JSON Web Tokens (JWT)** - Session management
- **bcryptjs** - Secure password hashing
- **js-cookie** - Client-side cookie management

### **Maps & Location**
- **Leaflet.js** - Interactive map rendering (dynamically loaded)
- **Custom Geotagging Service** - Location-based data collection utilities

### **Development Tools**
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- MySQL database

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
│   │   ├── dashboard/          # Main dashboard interface
│   │   ├── reportcard/         # Performance report generation
│   │   ├── settings/           # Administrative settings
│   │   ├── survey/             # Survey management and forms
│   │   ├── login/              # Authentication pages
│   │   └── register/           # User registration
│   ├── components/             # Reusable React components
│   │   ├── auth/               # Authentication components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── reportcard/         # Report card components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utility functions and configurations
│   ├── data/                   # Static data and mock data
│   └── assets/                 # Static assets (images, SVGs)
├── public/                     # Public static files
├── prisma/                     # Database schema and migrations
└── docs/                       # Documentation
```

## 🎯 Key Components

### Dashboard Components
- **`InteractiveSVGMap`** - Main map interface with barangay selection
- **`BarangaySatisfactionIndex`** - Detailed modal with action grid analysis
- **`MapCard`** - Container for the interactive map with year selection
- **`BarangayDetailsCard`** - Dynamic barangay information display
- **`SGLGBHistoryCard`** - Historical performance tracking

### Report Card System
- **`ReportHeader`** - Professional header with logos and branding
- **`PerformanceSnapshot`** - Donut charts for key metrics
- **`ServiceAreaTable`** - Comprehensive data table with responsive design
- **`KeyFindingsSection`** - AI insights with citizen voice integration
- **`DonutChart`** - Reusable animated chart component

### Authentication System
- **`AuthProvider`** - Global authentication state management
- **`ProtectedRoute`** - Route-level access control
- **`UserDropdown`** - User menu with logout functionality

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="mysql://username:password@localhost:3306/pulse"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Schema
The application uses Prisma with MySQL for data persistence. Key entities include:
- Users and authentication
- Barangays and territorial data
- Survey cycles and responses
- Performance metrics and historical data

## 📊 Features in Detail

### Interactive Map Dashboard
- **SVG-based map** of municipal territories
- **Color-coded visualization** based on performance metrics
- **Click-to-explore** functionality with detailed modals
- **Real-time data updates** and filtering options

### Performance Analysis
- **Action Grid Framework**: Four-quadrant analysis (Maintain, Opportunities, Monitor, Fix Now)
- **Satisfaction Scoring**: Color-coded performance indicators
- **Historical Tracking**: Multi-year performance comparison
- **Citizen Feedback Integration**: Direct quotes and community voice

### Report Generation
- **Professional PDF Reports**: Print-ready performance summaries
- **Dynamic Data Integration**: Real-time data from dashboard selections
- **Comprehensive Analysis**: AI-generated insights and recommendations
- **Stakeholder-Ready Format**: Suitable for official presentations and documentation

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

## 🏛️ Government Partnership

Developed in collaboration with Municipal Local Governance Resource Centers (MLGRC) to support evidence-based local governance improvement initiatives in the Philippines.

## 📞 Support

For technical support or questions about the PULSE system, please contact the development team or create an issue in this repository.

---

**Built with ❤️ for better local governance in the Philippines**
