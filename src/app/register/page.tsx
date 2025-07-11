"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SiglaRegister() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    organization: "",
    jobTitle: "",
  })
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    organization: "",
    jobTitle: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [registerStatus, setRegisterStatus] = useState<"idle" | "success" | "error">("idle")
  const [apiError, setApiError] = useState("")
  const router = useRouter()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      organization: "",
      jobTitle: "",
    }
    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    if (!formData.email) newErrors.email = "Email address is required"
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    setErrors(newErrors)
    return !Object.values(newErrors).some((err) => err)
  }

  const validateStep2 = () => {
    const newErrors = {
      phone: "",
      organization: "",
      jobTitle: "",
    }
    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (!formData.organization) newErrors.organization = "Organization/Company Name is required"
    if (!formData.jobTitle) newErrors.jobTitle = "Job Title/Role is required"
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return !Object.values(newErrors).some((err) => err)
  }

  const validateAll = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      organization: "",
      jobTitle: "",
    }
    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    if (!formData.email) newErrors.email = "Email address is required"
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (!formData.organization) newErrors.organization = "Organization/Company Name is required"
    if (!formData.jobTitle) newErrors.jobTitle = "Job Title/Role is required"
    setErrors(newErrors)
    return !Object.values(newErrors).some((err) => err)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    setIsLoading(true)
    setRegisterStatus("idle")
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          organization: formData.organization,
          jobTitle: formData.jobTitle,
        }),
        credentials: "include",
      })
      if (res.ok) {
        setRegisterStatus("success")
        setApiError("")
        // Automatically log in after registration
        try {
          const loginRes = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
            credentials: "include",
          });
          if (loginRes.ok) {
            router.push("/dashboard");
          } else {
            setApiError("Registration succeeded but automatic login failed. Please log in manually.");
          }
        } catch (e) {
          setApiError("Registration succeeded but automatic login failed. Please log in manually.");
        }
      } else {
        setRegisterStatus("error")
        setApiError("Failed to register. Please try again.")
      }
    } catch (error) {
      setRegisterStatus("error")
      setApiError("Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ backgroundColor: "#dbeafe" }}>
      {/* Background Emblem */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.5 }}>
        <img
          src="/globe.svg"
          alt="SIGLA Government Emblem"
          className="max-w-md max-h-md object-contain"
        />
      </div>
      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12 relative z-10 w-full">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold" style={{ color: "#333333" }}>
                Register Account
              </CardTitle>
              <CardDescription style={{ color: "#333333" }}>
                Create your account to access the SIGLA system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Status Messages */}
              {registerStatus === "success" && (
                <Alert className="mb-4 border-0" style={{ backgroundColor: "#228B22", color: "white" }}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Registration successful! You can now log in.</AlertDescription>
                </Alert>
              )}
              {registerStatus === "error" && (
                <Alert className="mb-4 border-0" style={{ backgroundColor: "#C8102E", color: "white" }}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Registration failed. {apiError ? `Error: ${apiError}` : "Please try again."}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column */}
                  <div className="flex-1 space-y-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium" style={{ color: "#333333" }}>
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={`transition-colors ${errors.firstName ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"}`}
                        style={{
                          borderColor: errors.firstName ? "#C8102E" : "#CCCCCC",
                          ...(errors.firstName ? {} : ({ "--tw-ring-color": "#0072CE" } as React.CSSProperties)),
                        }}
                        placeholder="Enter your first name"
                        disabled={isLoading}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        required
                      />
                      {errors.firstName && (
                        <p
                          id="firstName-error"
                          className="text-sm flex items-center gap-1"
                          style={{ color: "#C8102E" }}
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium" style={{ color: "#333333" }}>
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={`transition-colors ${errors.lastName ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"}`}
                        style={{
                          borderColor: errors.lastName ? "#C8102E" : "#CCCCCC",
                          ...(errors.lastName ? {} : ({ "--tw-ring-color": "#0072CE" } as React.CSSProperties)),
                        }}
                        placeholder="Enter your last name"
                        disabled={isLoading}
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        required
                      />
                      {errors.lastName && (
                        <p
                          id="lastName-error"
                          className="text-sm flex items-center gap-1"
                          style={{ color: "#C8102E" }}
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
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
                        className={`transition-colors ${errors.email ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"}`}
                        style={{
                          borderColor: errors.email ? "#C8102E" : "#CCCCCC",
                          ...(errors.email ? {} : ({ "--tw-ring-color": "#0072CE" } as React.CSSProperties)),
                        }}
                        placeholder="Enter your email address"
                        disabled={isLoading}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        required
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
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
                          className={`pr-10 transition-colors ${errors.password ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"}`}
                          style={{
                            borderColor: errors.password ? "#C8102E" : "#CCCCCC",
                            ...(errors.password ? {} : ({ "--tw-ring-color": "#0072CE" } as React.CSSProperties)),
                          }}
                          placeholder="Enter your password"
                          disabled={isLoading}
                          aria-describedby={errors.password ? "password-error" : undefined}
                          required
                          minLength={8}
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
                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: "#333333" }}>
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className={`pr-10 transition-colors ${errors.confirmPassword ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"}`}
                          style={{
                            borderColor: errors.confirmPassword ? "#C8102E" : "#CCCCCC",
                            ...(errors.confirmPassword ? {} : ({ "--tw-ring-color": "#0072CE" } as React.CSSProperties)),
                          }}
                          placeholder="Confirm your password"
                          disabled={isLoading}
                          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded"
                          style={{ "--tw-ring-color": "#0072CE" } as React.CSSProperties}
                          disabled={isLoading}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p
                          id="confirmPassword-error"
                          className="text-sm flex items-center gap-1"
                          style={{ color: "#C8102E" }}
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="flex-1 space-y-6">
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium" style={{ color: "#333333" }}>
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          // Only allow digits and max 11 characters
                          const value = e.target.value.replace(/\D/g, "").slice(0, 11)
                          handleInputChange("phone", value)
                        }}
                        className={`transition-colors ${errors.phone ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"}`}
                        style={{ borderColor: errors.phone ? "#C8102E" : "#CCCCCC", "--tw-ring-color": "#0072CE" } as React.CSSProperties }
                        placeholder="Enter your phone number"
                        disabled={isLoading}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        required
                        maxLength={11}
                      />
                      {errors.phone && (
                        <p
                          id="phone-error"
                          className="text-sm flex items-center gap-1"
                          style={{ color: "#C8102E" }}
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    {/* Organization/Company Name */}
                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-sm font-medium" style={{ color: "#333333" }}>
                        Organization/Company Name
                      </Label>
                      <Input
                        id="organization"
                        type="text"
                        value={formData.organization}
                        onChange={(e) => handleInputChange("organization", e.target.value)}
                        className={`transition-colors ${errors.organization ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"}`}
                        style={{ borderColor: errors.organization ? "#C8102E" : "#CCCCCC", "--tw-ring-color": "#0072CE" } as React.CSSProperties }
                        placeholder="Enter your organization or company name"
                        disabled={isLoading}
                        aria-describedby={errors.organization ? "organization-error" : undefined}
                        required
                      />
                      {errors.organization && (
                        <p
                          id="organization-error"
                          className="text-sm flex items-center gap-1"
                          style={{ color: "#C8102E" }}
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.organization}
                        </p>
                      )}
                    </div>
                    {/* Job Title/Role */}
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-sm font-medium" style={{ color: "#333333" }}>
                        Job Title/Role
                      </Label>
                      <Input
                        id="jobTitle"
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                        className={`transition-colors ${errors.jobTitle ? "border-2 focus:ring-0" : "border focus:ring-2 focus:ring-opacity-50"}`}
                        style={{ borderColor: errors.jobTitle ? "#C8102E" : "#CCCCCC", "--tw-ring-color": "#0072CE" } as React.CSSProperties }
                        placeholder="Enter your job title or role"
                        disabled={isLoading}
                        aria-describedby={errors.jobTitle ? "jobTitle-error" : undefined}
                        required
                      />
                      {errors.jobTitle && (
                        <p
                          id="jobTitle-error"
                          className="text-sm flex items-center gap-1"
                          style={{ color: "#C8102E" }}
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.jobTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Register Button */}
                <div className="w-full flex justify-end mt-6">
                  <Button
                    type="submit"
                    className="font-medium transition-colors focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: "#0072CE",
                      color: "white",
                      "--tw-ring-color": "#0072CE",
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#005FA3"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#0072CE"
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                </div>
              </form>
              {/* Login Link */}
              <div className="mt-4 text-center">
                <span className="text-sm" style={{ color: "#333333" }}>Already have an account?</span>
                <a
                  href="/"
                  className="ml-2 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded px-1"
                  style={{ color: "#0072CE", "--tw-ring-color": "#0072CE" } as React.CSSProperties}
                >
                  Login
                </a>
              </div>
            </CardContent>
          </Card>
          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm" style={{ color: "#333333" }}>
              Need help? Contact{" "}
              <a
                href="#"
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded px-1"
                style={{ color: "#0072CE", "--tw-ring-color": "#0072CE" } as React.CSSProperties}
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