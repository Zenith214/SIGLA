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
    "https://via.placeholder.com/1200x675/4299E1/FFFFFF?text=Dashboard+Overview",
    "https://via.placeholder.com/1200x675/38A169/FFFFFF?text=Analytics+Report",
    "https://via.placeholder.com/1200x675/63B3ED/FFFFFF?text=Data+Management",
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
              SIGLA System
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-200">
            Empowering Governance Through Technology: Centralizing Operations for Data-Driven Decisions.
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About the System</h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto mb-12">
            The SIGLA System is an internal government platform designed to centralize and streamline various operational processes. By integrating key functions and providing robust data analytics, it aims to enhance efficiency, foster transparency, and support informed decision-making across all levels of local governance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-800">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Operations</h3>
              <p className="text-gray-600">Ensuring the integrity and confidentiality of all government data and processes.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-1000">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Data-Driven Insights</h3>
              <p className="text-gray-600">Transforming raw data into actionable intelligence for strategic planning.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-1200">
              <LinkIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
              <p className="text-gray-600">Connecting various government departments and functions for unified workflow.</p>
            </div>
          </div>
        </section>

        {/* System Preview Section */}
        <section className="w-full mb-16 animate-fade-in animation-delay-1400">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">System Overview</h2>
          <ImageCarousel images={dashboardImages} aspectRatio="video" autoplay={true} loop={true} />
          <p className="text-center text-lg text-gray-700 mt-6 max-w-3xl mx-auto">
            A glimpse into the intuitive interface and comprehensive dashboards that empower government officials with real-time information and control.
          </p>
        </section>

        {/* Benefits Section */}
        <section className="w-full text-center mb-16 animate-fade-in animation-delay-1600">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-1800">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enhanced Efficiency</h3>
              <p className="text-gray-600">Automate routine tasks and streamline workflows to save time and resources.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-2000">
              <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Increased Transparency</h3>
              <p className="text-gray-600">Provide clear visibility into operations and financial administration.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-slide-up animation-delay-2200">
              <CheckCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Accurate Data</h3>
              <p className="text-gray-600">Ensure reliable and precise data for robust reporting and analysis.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl text-center py-6 text-gray-600 text-sm border-t border-gray-300 mt-8 bg-white">
        <p className="mb-1">For Official Use Only</p>
        <p className="mb-1">Internal Contact: support@sigla.gov (placeholder)</p>
        <p>System Version: 1.0.0 (placeholder)</p>
        <p className="mt-2">© 2024 SIGLA System. All rights reserved.</p>
      </footer>
    </div>
  );
}