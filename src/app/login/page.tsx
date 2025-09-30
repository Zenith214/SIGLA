"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton, SkeletonForm } from "@/components/ui/skeleton"
import { Eye, EyeOff, AlertCircle, CheckCircle2, Lock } from "lucide-react"

function PulseLoginContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">("idle")
  const [pageLoading, setPageLoading] = useState(true)
  const [redirectMessage, setRedirectMessage] = useState("")

  const searchParams = useSearchParams()
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth()

  // Add page loading effect and check if user is already authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    
    // Removed the already authenticated user detection as requested
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, authLoading]);





  // Check for redirect messages
  useEffect(() => {
    const redirected = searchParams.get('redirected');
    const reason = searchParams.get('reason');
    const attemptedPath = searchParams.get('attempted_path');

    if (redirected === '1') {
      let message = "";
      switch (reason) {
        case 'no_token':
          message = "Please log in to access the requested page.";
          break;
        case 'invalid_token':
          message = "Your session has expired. Please log in again.";
          break;
        case 'insufficient_permissions':
          if (attemptedPath) {
            message = `You don't have permission to access ${attemptedPath}. Please log in with appropriate credentials.`;
          } else {
            message = "You don't have permission to access that page. Please log in with appropriate credentials.";
          }
          break;
        case 'logout':
          message = "You have been successfully logged out.";
          break;
        default:
          message = "Please log in to continue.";
      }
      setRedirectMessage(message);
    }
  }, [searchParams]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Clear redirect message when user starts typing
    if (redirectMessage) {
      setRedirectMessage("");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors = {
      email: "",
      password: "",
    }

    if (!formData.email) {
      newErrors.email = "Email address is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    setErrors(newErrors)

    if (newErrors.email || newErrors.password) {
      return
    }

    setIsSubmitting(true)
    setLoginStatus("idle")
    setRedirectMessage("") // Clear any redirect messages

    try {
      // Use the auth context login function
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        setLoginStatus("success");

        // Force refresh the auth state immediately
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for cookie to be set

        // Get redirect URL from search params
        const redirectUrl = searchParams.get('redirect') || '/dashboard';

        // Validate the redirect URL to prevent open redirect vulnerabilities
        const isValidRedirect = redirectUrl.startsWith('/') && 
                               !redirectUrl.startsWith('//') && 
                               !redirectUrl.includes(':');

        // Redirect based on role immediately
        if (result.role === 'interviewer') {
          window.location.href = "/survey";
        } else {
          // Use the redirect URL if valid, otherwise default to dashboard
          window.location.href = isValidRedirect ? redirectUrl : '/dashboard';
        }
      } else {
        setLoginStatus("error");
        setErrors(prev => ({ ...prev, password: result.error || 'Login failed' }));
      }
    } catch (error) {
      setLoginStatus("error");
      setErrors(prev => ({ ...prev, password: 'Network error occurred' }));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ backgroundColor: "#dbeafe" }}>
        {/* Main Content */}
        <main className="flex items-center justify-center px-4 py-12 relative z-10 w-full">
          <div className="w-full max-w-md">
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center pb-6">
                <Skeleton className="h-8 w-48 mx-auto mb-2" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </CardHeader>
              <CardContent>
                <SkeletonForm />
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Logos Section Below Login Form */}
        <div className="flex flex-col items-center mt-8 mb-8">
          {/* Logos Row */}
          <div className="flex items-center justify-center gap-8 mb-4">
            {/* DILG Logo - Circular */}
            <div className="flex flex-col items-center">
              <img
                src="/dilg.png"
                alt="DILG Logo"
                className="w-16 h-16 object-contain"
              />
            </div>

            {/* MLGRC Logo - Rectangular */}
            <div className="flex flex-col items-center">
              <img
                src="/mlgrc.png"
                alt="MLGRC Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          {/* Text Below Logos */}
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">
              Department of the Interior and Local Government
            </p>
            <p className="text-sm text-gray-600">
              (Partnership)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              © 2024 PULSE System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ backgroundColor: "#dbeafe" }}>
      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12 relative z-10 w-full">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold" style={{ color: "#333333" }}>
                System Login
              </CardTitle>
              <CardDescription style={{ color: "#333333" }}>
                Enter your credentials to access the PULSE system
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Redirect Messages */}
                {redirectMessage && (
                  <Alert className={`mb-4 border-0 ${redirectMessage.includes('successfully') ? 'bg-green-50 text-green-800 border-green-200' : ''}`} 
                         style={{ backgroundColor: redirectMessage.includes('successfully') ? "#228B22" : "#0072CE", color: "white" }}>
                    {redirectMessage.includes('successfully') ? (
                      <CheckCircle2 className="h-4 w-4" style={{ color: "white" }} />
                    ) : (
                      <Lock className="h-4 w-4" style={{ color: "white" }} />
                    )}
                    <AlertDescription style={{ color: 'white', fontWeight: 600, fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                      {redirectMessage}
                    </AlertDescription>
                  </Alert>
                )}

              {/* Status Messages */}
              {loginStatus === "success" && (
                <Alert className="mb-4 border-0" style={{ backgroundColor: "#228B22", color: "#f8fafc", fontWeight: 600, fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>Login successful! Redirecting to dashboard...</AlertDescription>
                </Alert>
              )}

              {loginStatus === "error" && (
                <Alert className="mb-4 border-0" style={{ backgroundColor: "#C8102E", color: "white" }}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription style={{ color: 'white', fontWeight: 600, fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>Invalid credentials. Please check your email and password.</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: "#333333" }}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`transition-colors ${errors.email ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"
                      }`}
                    style={{
                      borderColor: errors.email ? "#C8102E" : "#CCCCCC",
                      ...(errors.email
                        ? {}
                        : ({
                          "--tw-ring-color": "#0072CE",
                        } as React.CSSProperties)),
                    }}
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium" style={{ color: "#333333" }}>
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`transition-colors pr-10 ${errors.password ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"
                        }`}
                      style={{
                        borderColor: errors.password ? "#C8102E" : "#CCCCCC",
                        ...(errors.password
                          ? {}
                          : ({
                            "--tw-ring-color": "#0072CE",
                          } as React.CSSProperties)),
                      }}
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: "#0072CE",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 114, 206, 0.2), 0 2px 4px -1px rgba(0, 114, 206, 0.1)",
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              </form>

            </CardContent>
          </Card>
        </div>
      </main>

      {/* Logos Section Below Login Form */}
      <div className="flex flex-col items-center mt-8 mb-8">
        {/* Logos Row */}
        <div className="flex items-center justify-center gap-8 mb-4">
          {/* DILG Logo - Circular */}
          <div className="flex flex-col items-center">
            <img
              src="/dilg.png"
              alt="DILG Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* MLGRC Logo - Rectangular */}
          <div className="flex flex-col items-center">
            <img
              src="/mlgrc.png"
              alt="MLGRC Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        {/* Text Below Logos */}
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">
            Department of the Interior and Local Government
          </p>
          <p className="text-sm text-gray-600">
            (Partnership)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            © 2024 PULSE System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PulseLogin() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PulseLoginContent />
    </Suspense>
  );
}