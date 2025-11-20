"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/ImageCarousel";
import {
  BarChart3,
  Users,
  Shield,
  Clock,
  CheckCircle,
  Building2,
  MapPin,
  TrendingUp,
  FileText,
  Lock,
  Database,
  Activity,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Screenshot images for hero carousel
  const heroImages = [
    "/Screenshot 2025-10-30 at 08-06-47 PULSE - Public Understanding and Local Service Evaluation.png",
    "/Screenshot 2025-10-30 at 08-09-11 PULSE - Public Understanding and Local Service Evaluation.png",
    "/Screenshot 2025-10-30 at 08-09-54 PULSE - Public Understanding and Local Service Evaluation.png",
    "/Screenshot 2025-10-30 at 08-25-51 PULSE - Public Understanding and Local Service Evaluation.png",
    "/Screenshot 2025-10-30 at 08-28-15 PULSE - Public Understanding and Local Service Evaluation.png",
  ];

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
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#007fff' }}>
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PULSE</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <style jsx>{`
                .nav-link:hover {
                  color: #007fff;
                }
              `}</style>
              <button onClick={() => scrollToSection('home')} className="text-gray-700 transition-colors nav-link">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 transition-colors nav-link">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 transition-colors nav-link">
                How It Works
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 transition-colors nav-link">
                About
              </button>
              <Link href="/login">
                <Button className="text-white hover:opacity-90" style={{ backgroundColor: '#007fff' }}>
                  Login
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden py-4 border-t border-gray-200 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection('home')} className="text-left text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="text-left text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left text-gray-700 hover:text-blue-600 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('about')} className="text-left text-gray-700 hover:text-blue-600 transition-colors">
                About
              </button>
              <Link href="/login">
                <Button className="w-full text-white hover:opacity-90" style={{ backgroundColor: '#007fff' }}>
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24" style={{ background: 'linear-gradient(to bottom, #e6f3ff, white)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Streamline your survey operations with{" "}
                  <span style={{ color: '#007fff' }}>PULSE</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600">
                  Efficient survey management for local governance. Measure public satisfaction and service evaluation with real-time analytics.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="text-white hover:opacity-90 w-full sm:w-auto" style={{ backgroundColor: '#007fff' }}>
                    Access System
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto border-2"
                  style={{ borderColor: '#007fff', color: '#007fff' }}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Content - Hero Carousel */}
            <div className="relative">
              <ImageCarousel 
                images={heroImages} 
                aspectRatio="video" 
                autoplay={true} 
                loop={true} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold" style={{ color: '#007fff' }}>Ready</div>
              <div className="text-sm md:text-base text-gray-600 mt-2">For Deployment</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold" style={{ color: '#008000' }}>Modern</div>
              <div className="text-sm md:text-base text-gray-600 mt-2">Technology Stack</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold" style={{ color: '#ff0000' }}>Secure</div>
              <div className="text-sm md:text-base text-gray-600 mt-2">Data Protection</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold" style={{ color: '#ffa500' }}>24/7</div>
              <div className="text-sm md:text-base text-gray-600 mt-2">System Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Efficient Survey Management
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to conduct, manage, and analyze surveys for better governance decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#e6f3ff' }}>
                <FileText className="h-6 w-6" style={{ color: '#007fff' }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Survey Management</h3>
              <p className="text-gray-600">
                Create and manage survey cycles with ease. Organize data collection across multiple barangays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#e6ffe6' }}>
                <Users className="h-6 w-6" style={{ color: '#008000' }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Assignment Tracking</h3>
              <p className="text-gray-600">
                Monitor interviewer assignments and track progress in real-time across all locations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#fff5e6' }}>
                <BarChart3 className="h-6 w-6" style={{ color: '#ffa500' }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">
                View completion rates, satisfaction scores, and insights with interactive dashboards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#ffe6e6' }}>
                <Shield className="h-6 w-6" style={{ color: '#ff0000' }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Security</h3>
              <p className="text-gray-600">
                Government-grade security with role-based access control and encrypted data storage.
              </p>
            </div>
          </div>
        </div>
      </section>
     
 {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-white">
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
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2" style={{ backgroundColor: '#b3d9ff', zIndex: 0 }}></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative" style={{ zIndex: 1 }}>
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg" style={{ backgroundColor: '#007fff' }}>
                  1
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2" style={{ color: '#007fff' }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Create Cycle</h3>
                  <p className="text-sm text-gray-600">Admin sets up survey cycle and targets</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg" style={{ backgroundColor: '#008000' }}>
                  2
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2" style={{ color: '#008000' }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Assign</h3>
                  <p className="text-sm text-gray-600">Interviewers assigned to barangays</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg" style={{ backgroundColor: '#ffa500' }}>
                  3
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2" style={{ color: '#ffa500' }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Survey</h3>
                  <p className="text-sm text-gray-600">Conduct surveys and collect data</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg" style={{ backgroundColor: '#007fff' }}>
                  4
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2" style={{ color: '#007fff' }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Track</h3>
                  <p className="text-sm text-gray-600">Monitor progress in real-time</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg" style={{ backgroundColor: '#008000' }}>
                  5
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" style={{ color: '#008000' }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Report</h3>
                  <p className="text-sm text-gray-600">Generate insights and reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PULSE?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built specifically for government survey operations with features that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e6ffe6' }}>
                <Database className="h-8 w-8" style={{ color: '#008000' }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Centralized Management</h3>
              <p className="text-gray-600">All survey data in one secure, accessible location</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e6f3ff' }}>
                <CheckCircle className="h-8 w-8" style={{ color: '#007fff' }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Improved Accountability</h3>
              <p className="text-gray-600">Track every assignment and survey completion</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fff5e6' }}>
                <Clock className="h-8 w-8" style={{ color: '#ffa500' }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Faster Collection</h3>
              <p className="text-gray-600">Streamlined process reduces survey time</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ffe6e6' }}>
                <TrendingUp className="h-8 w-8" style={{ color: '#ff0000' }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Better Decisions</h3>
              <p className="text-gray-600">Data-driven insights for policy making</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Privacy and Security First
              </h2>
              <p className="text-lg text-gray-600">
                Built with government-grade security standards to protect sensitive survey data and ensure compliance with data protection regulations.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#e6ffe6' }}>
                    <CheckCircle className="h-4 w-4" style={{ color: '#008000' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Role-Based Access Control</h4>
                    <p className="text-gray-600">Granular permissions for admins, interviewers, and viewers</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#e6ffe6' }}>
                    <CheckCircle className="h-4 w-4" style={{ color: '#008000' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Encrypted Data Storage</h4>
                    <p className="text-gray-600">All survey responses encrypted at rest and in transit</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#e6ffe6' }}>
                    <CheckCircle className="h-4 w-4" style={{ color: '#008000' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Activity Monitoring</h4>
                    <p className="text-gray-600">Track user actions and system operations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#e6ffe6' }}>
                    <CheckCircle className="h-4 w-4" style={{ color: '#008000' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Data Protection</h4>
                    <p className="text-gray-600">Cloud infrastructure with automatic backups</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Security Image */}
            <div className="relative">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <Image
                  src="https://placehold.co/600x400/dc2626/ffffff?text=Security+%26+Privacy"
                  alt="Security and Privacy"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About PULSE
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              PULSE (Public Understanding and Local Service Evaluation) is a comprehensive survey management system designed specifically for local government units. Our platform enables efficient data collection, real-time monitoring, and actionable insights to improve public service delivery.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Built with modern technology and government-grade security, PULSE streamlines the entire survey lifecycle from planning to reporting, helping administrators make evidence-based decisions that benefit their communities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <MapPin className="h-10 w-10 mx-auto mb-4" style={{ color: '#007fff' }} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Focus</h3>
                <p className="text-gray-600">Designed for barangay-level survey operations</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <Activity className="h-10 w-10 mx-auto mb-4" style={{ color: '#008000' }} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time</h3>
                <p className="text-gray-600">Live progress tracking and instant updates</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <Lock className="h-10 w-10 mx-auto mb-4" style={{ color: '#ff0000' }} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure</h3>
                <p className="text-gray-600">Government-grade data protection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#007fff' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#e6f3ff' }}>
            Access the PULSE system and start managing your surveys efficiently.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: '#007fff' }}>
              Access System
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About Column */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#007fff' }}>
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">PULSE</span>
              </div>
              <p className="text-gray-400 mb-4">
                Public Understanding and Local Service Evaluation system for efficient government survey management.
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#007fff' }}></div>
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
                  <Link href="/analytics" className="hover:text-white transition-colors">
                    Analytics
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
