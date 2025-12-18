"use client"

import { useLanguage, Language } from '@/contexts/LanguageContext'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="mb-6">
      <Tabs value={language} onValueChange={(value) => setLanguage(value as Language)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bisaya">Bisaya</TabsTrigger>
          <TabsTrigger value="filipino">Filipino</TabsTrigger>
          <TabsTrigger value="english">English</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
