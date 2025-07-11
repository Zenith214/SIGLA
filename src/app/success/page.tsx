"use client"

import { useSearchParams } from "next/navigation"

export default function SuccessPage() {
  const params = useSearchParams()
  const type = params.get("type")
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: "#228B22" }}>
          {type === "register"
            ? "Registration Successful!"
            : type === "login"
            ? "Login Successful!"
            : "Success!"}
        </h1>
        <p className="mb-6">
          {type === "register"
            ? "Your account has been created. You can now log in."
            : type === "login"
            ? "You are now logged in. Welcome to SIGLA!"
            : "Operation completed successfully."}
        </p>
        <a
          href={type === "register" ? "/" : "/dashboard"}
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {type === "register" ? "Go to Login" : "Go to Dashboard"}
        </a>
      </div>
    </div>
  )
} 