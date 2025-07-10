"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SiglaLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">("idle")

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

    setIsLoading(true)
    setLoginStatus("idle")

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success/failure
      if (formData.email === "admin@sigla.gov" && formData.password === "password123") {
        setLoginStatus("success")
      } else {
        setLoginStatus("error")
      }
    } catch (error) {
      setLoginStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ backgroundColor: "#dbeafe" }}>
      {/* Background Emblem */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.5 }}>
        <img
          src="/placeholder.svg?height=400&width=400&text=Government+Emblem"
          alt="SIGLA Government Emblem"
          className="max-w-md max-h-md object-contain"
        />
      </div>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12 relative z-10 w-full">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold" style={{ color: "#333333" }}>
                System Login
              </CardTitle>
              <CardDescription style={{ color: "#333333" }}>
                Enter your credentials to access the SIGLA system
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Status Messages */}
              {loginStatus === "success" && (
                <Alert className="mb-4 border-0" style={{ backgroundColor: "#228B22", color: "white" }}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Login successful! Redirecting to dashboard...</AlertDescription>
                </Alert>
              )}

              {loginStatus === "error" && (
                <Alert className="mb-4 border-0" style={{ backgroundColor: "#C8102E", color: "white" }}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Invalid credentials. Please check your email and password.</AlertDescription>
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
                    className={`transition-colors ${
                      errors.email ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"
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
                    disabled={isLoading}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-sm flex items-center gap-1"
                      style={{ color: "#C8102E" }}
                      role="alert"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
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
                      className={`pr-10 transition-colors ${
                        errors.password ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"
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
                      disabled={isLoading}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded"
                      style={{ "--tw-ring-color": "#0072CE" } as React.CSSProperties}
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-sm flex items-center gap-1"
                      style={{ color: "#C8102E" }}
                      role="alert"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 focus:ring-2 focus:ring-opacity-50"
                      style={{ "--tw-ring-color": "#0072CE" } as React.CSSProperties}
                      disabled={isLoading}
            />
                    <span className="text-sm" style={{ color: "#333333" }}>
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded px-1"
                    style={
                      {
                        color: "#0072CE",
                        "--tw-ring-color": "#0072CE",
                      } as React.CSSProperties
                    }
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full font-medium transition-colors focus:ring-2 focus:ring-opacity-50"
                  style={
                    {
                      backgroundColor: "#0072CE",
                      color: "white",
                      "--tw-ring-color": "#0072CE",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#005FA3"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#0072CE"
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm" style={{ color: "#333333" }}>
              Need help? Contact{" "}
              <a
                href="#"
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded px-1"
                style={
                  {
                    color: "#0072CE",
                    "--tw-ring-color": "#0072CE",
                  } as React.CSSProperties
                }
              >
                system administrator
              </a>
            </p>
            <p className="text-xs mt-2" style={{ color: "#333333" }}>
              © 2024 SIGLA System. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
