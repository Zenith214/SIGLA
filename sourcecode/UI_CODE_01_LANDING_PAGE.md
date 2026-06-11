# Landing Page - Source Code

**File:** `src/app/page.tsx`

```tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Shield,
  CheckCircle,
  Building2,
  MapPin,
  TrendingUp,
  FileText,
  Database,
  Activity,
  ArrowRight,
  Menu,
  X,
  Presentation,
  Target,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Intersection Observer for fade-in animations - wait for DOM to be ready
    const setupObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in-up');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      // Observe all elements with fade-in class
      const elements = document.querySelectorAll('.fade-in-on-scroll');
      elements.forEach((el) => observer.observe(el));

      return observer;
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const observer = setupObserver();
      return () => observer?.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image 
                src="/headerlogo4k.png" 
                alt="PULSE" 
                width={120}
                height={43}
                className="h-8 sm:h-10 w-auto drop-shadow-lg brightness-110"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-white hover:text-blue-300 transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="text-white hover:text-blue-300 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-white hover:text-blue-300 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('about')} className="text-white hover:text-blue-300 transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('download')} className="text-white hover:text-blue-300 transition-colors">
                Download
              </button>
              <Link href="/login">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Login
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-700 text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mounted && (
          <div className={`md:hidden py-4 border-t border-slate-700 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection('home')} className="text-left text-white hover:text-blue-300 transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="text-left text-white hover:text-blue-300 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left text-white hover:text-blue-300 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('about')} className="text-left text-white hover:text-blue-300 transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('download')} className="text-left text-white hover:text-blue-300 transition-colors">
                Download
              </button>
              <Link href="/login">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Login
                </Button>
              </Link>
            </div>
          </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden min-h-screen">
        {/* Background with animated blobs */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-blue-100 to-green-100">
            {/* Animated Blobs */}
            <div className="absolute top-10 left-0 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-6000"></div>
          </div>
        </div>
        
        <style jsx global>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes rotate3d {
            0% {
              transform: perspective(1000px) rotateY(0deg);
            }
            100% {
              transform: perspective(1000px) rotateY(360deg);
            }
          }
          .animate-blob {
            animation: blob 20s infinite;
          }
          .animate-rotate {
            animation: rotate 20s linear infinite;
          }
          .animate-rotate-3d {
            animation: rotate3d 8s linear infinite;
            transform-style: preserve-3d;
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          .fade-in-on-scroll {
            opacity: 0;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animation-delay-6000 {
            animation-delay: 6s;
          }
          .stagger-1 {
            animation-delay: 0.1s;
          }
          .stagger-2 {
            animation-delay: 0.2s;
          }
          .stagger-3 {
            animation-delay: 0.3s;
          }
          .stagger-4 {
            animation-delay: 0.4s;
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Content */}
            <div className="space-y-6 animate-fade-in">
              {/* Radial glow behind card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-radial from-blue-200/40 via-transparent to-transparent blur-3xl -z-10"></div>
                <div className="space-y-5 bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                    Understand<br/>
                    Citizen<br/>
                    Perception<br/>
                    <span className="text-blue-600">with PULSE</span>
                  </h1>
                  <p className="text-base md:text-lg text-gray-700 leading-loose">
                    Efficient survey management for local governance. Measure public satisfaction and service evaluation with real-time analytics.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 w-full sm:w-auto shadow-xl transition-all duration-300 text-lg py-6 px-8 group"
                  >
                    Access System
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto border-2 border-gray-700 text-gray-700 hover:bg-gray-100 text-lg py-6 px-8"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Content - Image with more space */}
            <div className="relative flex items-center justify-center lg:justify-end lg:pr-8">
              <div className="relative w-full max-w-4xl mx-auto">
                {/* Soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-pink-100/20 to-blue-100/20 rounded-2xl -z-10"></div>
                <Image 
                  src="/test2.png" 
                  alt="PULSE Interface" 
                  width={900}
                  height={900}
                  className="w-full h-auto drop-shadow-2xl animate-fade-in opacity-90"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="inline-block px-6 py-3 rounded-full text-3xl md:text-4xl font-bold text-blue-600 bg-blue-50">
                Ready
              </div>
              <div className="text-sm md:text-base text-gray-600 mt-3">For Deployment</div>
            </div>
            <div>
              <div className="inline-block px-6 py-3 rounded-full text-3xl md:text-4xl font-bold text-blue-600 bg-blue-50">
                Modern
              </div>
              <div className="text-sm md:text-base text-gray-600 mt-3">Technology Stack</div>
            </div>
            <div>
              <div className="inline-block px-6 py-3 rounded-full text-3xl md:text-4xl font-bold text-blue-600 bg-blue-50">
                Secure
              </div>
              <div className="text-sm md:text-base text-gray-600 mt-3">Data Protection</div>
            </div>
            <div>
              <div className="inline-block px-6 py-3 rounded-full text-3xl md:text-4xl font-bold text-blue-600 bg-blue-50">
                24/7
              </div>
              <div className="text-sm md:text-base text-gray-600 mt-3">System Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Simplified */}
      <section id="features" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to conduct, manage, and analyze surveys for better governance decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow fade-in-on-scroll stagger-1">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Survey Management</h3>
              <p className="text-gray-600">
                Create and manage survey cycles across multiple barangays with ease.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow fade-in-on-scroll stagger-2">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Assignment Tracking</h3>
              <p className="text-gray-600">
                Monitor interviewer assignments and track progress in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow fade-in-on-scroll stagger-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">
                View completion rates and satisfaction scores with interactive dashboards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow fade-in-on-scroll stagger-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Security</h3>
              <p className="text-gray-600">
                Government-grade security with role-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How PULSE Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A streamlined workflow from survey creation to actionable insights.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-blue-100"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center fade-in-on-scroll stagger-1">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg relative z-10">
                  1
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Create Cycle</h3>
                  <p className="text-sm text-gray-600">Set up survey cycle and targets</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center fade-in-on-scroll stagger-2">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg relative z-10">
                  2
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Assign</h3>
                  <p className="text-sm text-gray-600">Assign interviewers to barangays</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center fade-in-on-scroll stagger-3">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg relative z-10">
                  3
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Survey</h3>
                  <p className="text-sm text-gray-600">Conduct surveys and collect data</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center fade-in-on-scroll stagger-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg relative z-10">
                  4
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Track</h3>
                  <p className="text-sm text-gray-600">Monitor progress in real-time</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center fade-in-on-scroll stagger-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg relative z-10">
                  5
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Report</h3>
                  <p className="text-sm text-gray-600">Generate insights and reports</p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex flex-col items-center text-center fade-in-on-scroll stagger-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg relative z-10">
                  6
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Presentation className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Utilize</h3>
                  <p className="text-sm text-gray-600">Present findings and facilitate workshop with BLGU officials</p>
                </div>
              </div>

              {/* Step 7 */}
              <div className="flex flex-col items-center text-center fade-in-on-scroll stagger-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg relative z-10">
                  7
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Act</h3>
                  <p className="text-sm text-gray-600">Formulate and monitor the Citizen Priority Action Plan (CPAP)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About Column */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Image 
                  src="/headerlogo4k.png" 
                  alt="PULSE" 
                  width={140}
                  height={50}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-4">
                Public Understanding and Local Service Evaluation system for efficient government survey management.
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span>For Official Government Use Only</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/survey" className="hover:text-white transition-colors">
                    Survey
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>Support: support@pulse.gov</li>
                <li>Admin: admin@pulse.gov</li>
                <li>System Version: 1.0.0</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 PULSE System. All rights reserved. | For Official Government Use Only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---

**Note:** This is the complete landing page with navigation, hero section with animated blobs, features, 7-step workflow, and footer. The page includes smooth scrolling, mobile menu, and responsive design.
