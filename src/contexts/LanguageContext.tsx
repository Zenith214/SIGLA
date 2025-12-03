"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'bisaya' | 'filipino' | 'english'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('bisaya')

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('survey-language')
    if (saved && ['bisaya', 'filipino', 'english'].includes(saved)) {
      setLanguage(saved as Language)
    }
  }, [])

  // Save language preference
  useEffect(() => {
    localStorage.setItem('survey-language', language)
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
