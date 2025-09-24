"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/ImageCarousel";
import {
  Shield,
  BarChart3,
  Link as LinkIcon,
  Zap,
  Eye,
  CheckCircle,
  Building2,
  Handshake,
  Database,
} from "lucide-react";

export default function LandingPage() {
  const dashboardImages = [
    "/carousel1.png",
    "/sdashboard.gif",
    "/spotmap.gif",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#dbeafe] text-gray-900">
      {/* Hero Section */}
      <header className="w-full py-16 md:py-24 text-center bg-gradient-to-b from-[#dbeafe] to-white animate-fade-in">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center mb-6 animate-slide-up">
            {/* Placeholder for Government Logo */}
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
              <Building2 className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
              PULSE System
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-200">
            Public Understanding and Local Service Evaluation: Measuring Community Satisfaction for Better Governance.
          </p>
          <Link href="/login" className="animate-slide-up animation-delay-400">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-4 rounded-lg shadow-xl transition-all duration-300 hover:scale-105">
              Proceed to Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-7xl px-4 py-12 md:py-16">
        {/* About Section */}
        <section className="w-full text-center mb-16 animate-fade-in animation-delay-600">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About PULSE</h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto mb-12">
            PULSE (Public Understanding and Local Service Evaluation) is a comprehensive survey platform that measures citizen satisfaction with local government services. Through systematic data collection and advanced analytics, PULSE empowers local administrators to make evidence-based decisions that improve community well-being and governance effectiveness.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-800">
              <Database className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comprehensive Surveys</h3>
              <p className="text-gray-600">Systematic collection of citizen feedback across all barangays and service areas.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-1000">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">Transform survey data into actionable insights for improved service delivery.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-1200">
              <Handshake className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Engagement</h3>
              <p className="text-gray-600">Bridge the gap between citizens and local government through structured feedback.</p>
            </div>
          </div>
        </section>

        {/* System Preview Section */}
        <section className="w-full mb-16 animate-fade-in animation-delay-1400">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">System Overview</h2>
          <ImageCarousel images={dashboardImages} aspectRatio="video" autoplay={true} loop={true} />
          <p className="text-center text-lg text-gray-700 mt-6 max-w-3xl mx-auto">
            Explore the intuitive survey interface and powerful analytics dashboards that help local governments understand and respond to citizen needs.
          </p>
        </section>

        {/* Benefits Section */}
        <section className="w-full text-center mb-16 animate-fade-in animation-delay-1600">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-1800">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Improved Service Delivery</h3>
              <p className="text-gray-600">Identify service gaps and prioritize improvements based on citizen feedback.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-2000">
              <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Evidence-Based Decisions</h3>
              <p className="text-gray-600">Make informed policy decisions backed by comprehensive citizen satisfaction data.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-2200">
              <CheckCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Accountability & Trust</h3>
              <p className="text-gray-600">Build stronger community trust through transparent performance measurement.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl text-center py-6 text-gray-600 text-sm border-t border-gray-300 mt-8 bg-white">
        <p className="mb-1">For Official Use Only</p>
        <p className="mb-1">Internal Contact: support@pulse.gov (placeholder)</p>
        <p>System Version: 1.0.0 (placeholder)</p>
        <p className="mt-2">© 2024 PULSE System. All rights reserved.</p>
      </footer>
    </div>
  );
}