/**
 * Question Label Mapping
 * Converts technical field names to human-readable labels
 */

export interface QuestionMetadata {
  label: string
  section: string
  type: 'awareness' | 'availment' | 'satisfaction' | 'nfa' | 'suggestion' | 'other'
  description?: string
}

export const questionLabels: Record<string, QuestionMetadata> = {
  // FINANCIAL ADMINISTRATION
  'financial_awarenessProjects': {
    label: 'Awareness: Barangay Projects & Programs',
    section: 'Financial Administration',
    type: 'awareness',
    description: 'Are you aware of barangay projects and programs?'
  },
  'financial_benefitedProjects': {
    label: 'Availment: Benefited from Projects',
    section: 'Financial Administration',
    type: 'availment',
    description: 'Have you benefited from barangay projects?'
  },
  'financial_satisfactionProjects': {
    label: 'Satisfaction: Projects & Programs',
    section: 'Financial Administration',
    type: 'satisfaction',
    description: 'How satisfied are you with barangay projects?'
  },
  'financial_nfaBinaryProjects': {
    label: 'Need for Action: Projects',
    section: 'Financial Administration',
    type: 'nfa',
    description: 'Do barangay projects need action/improvement?'
  },
  'financial_suggestionsProjects': {
    label: 'Suggestions: Projects',
    section: 'Financial Administration',
    type: 'suggestion'
  },

  'financial_awarenessFinancial': {
    label: 'Awareness: Financial Information',
    section: 'Financial Administration',
    type: 'awareness',
    description: 'Are you aware of barangay financial information?'
  },
  'financial_usedFinancialInfo': {
    label: 'Availment: Used Financial Information',
    section: 'Financial Administration',
    type: 'availment',
    description: 'Have you accessed barangay financial information?'
  },
  'financial_satisfactionFinancial': {
    label: 'Satisfaction: Financial Transparency',
    section: 'Financial Administration',
    type: 'satisfaction'
  },
  'financial_nfaBinaryFinancial': {
    label: 'Need for Action: Financial Transparency',
    section: 'Financial Administration',
    type: 'nfa'
  },
  'financial_suggestionsFinancial': {
    label: 'Suggestions: Financial Transparency',
    section: 'Financial Administration',
    type: 'suggestion'
  },

  'financial_awarenessSocialPrograms': {
    label: 'Awareness: Social Programs',
    section: 'Financial Administration',
    type: 'awareness',
    description: 'Are you aware of social assistance programs?'
  },
  'financial_benefitedSocialPrograms': {
    label: 'Availment: Benefited from Social Programs',
    section: 'Financial Administration',
    type: 'availment'
  },
  'financial_satisfactionSocialPrograms': {
    label: 'Satisfaction: Social Programs',
    section: 'Financial Administration',
    type: 'satisfaction'
  },
  'financial_nfaBinarySocialPrograms': {
    label: 'Need for Action: Social Programs',
    section: 'Financial Administration',
    type: 'nfa'
  },
  'financial_suggestionsSocialPrograms': {
    label: 'Suggestions: Social Programs',
    section: 'Financial Administration',
    type: 'suggestion'
  },

  'financial_awarenessCorruption': {
    label: 'Awareness: Anti-Corruption Measures',
    section: 'Financial Administration',
    type: 'awareness'
  },
  'financial_reportedCorruption': {
    label: 'Availment: Reported Corruption',
    section: 'Financial Administration',
    type: 'availment'
  },
  'financial_satisfactionCorruption': {
    label: 'Satisfaction: Anti-Corruption Response',
    section: 'Financial Administration',
    type: 'satisfaction'
  },
  'financial_nfaBinaryCorruption': {
    label: 'Need for Action: Anti-Corruption',
    section: 'Financial Administration',
    type: 'nfa'
  },
  'financial_suggestionsCorruption': {
    label: 'Suggestions: Anti-Corruption',
    section: 'Financial Administration',
    type: 'suggestion'
  },

  // DISASTER PREPAREDNESS
  'disaster_awarenessDisasterInfo': {
    label: 'Awareness: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'awareness',
    description: 'Are you aware of disaster preparedness information?'
  },
  'disaster_receivedDisasterInfo': {
    label: 'Availment: Received Disaster Information',
    section: 'Disaster Preparedness',
    type: 'availment'
  },
  'disaster_satisfactionDisasterInfo': {
    label: 'Satisfaction: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'satisfaction'
  },
  'disaster_nfaBinaryDisasterInfo': {
    label: 'Need for Action: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'nfa'
  },
  'disaster_suggestionsDisasterInfo': {
    label: 'Suggestions: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'suggestion'
  },

  'disaster_awarenessEvacuation': {
    label: 'Awareness: Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'awareness'
  },
  'disaster_usedEvacuation': {
    label: 'Availment: Used Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'availment'
  },
  'disaster_satisfactionEvacuation': {
    label: 'Satisfaction: Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'satisfaction'
  },
  'disaster_nfaBinaryEvacuation': {
    label: 'Need for Action: Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'nfa'
  },
  'disaster_suggestionsEvacuation': {
    label: 'Suggestions: Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'suggestion'
  },

  // SAFETY & PEACE ORDER
  'safety_awarenessTanods': {
    label: 'Awareness: Barangay Tanods',
    section: 'Safety & Peace Order',
    type: 'awareness',
    description: 'Are you aware of barangay tanod services?'
  },
  'safety_experiencedTanods': {
    label: 'Availment: Experienced Tanod Services',
    section: 'Safety & Peace Order',
    type: 'availment'
  },
  'safety_satisfactionTanods': {
    label: 'Satisfaction: Tanod Services',
    section: 'Safety & Peace Order',
    type: 'satisfaction'
  },
  'safety_nfaBinaryTanods': {
    label: 'Need for Action: Tanod Services',
    section: 'Safety & Peace Order',
    type: 'nfa'
  },
  'safety_suggestionsTanods': {
    label: 'Suggestions: Tanod Services',
    section: 'Safety & Peace Order',
    type: 'suggestion'
  },

  'safety_awarenessLupon': {
    label: 'Awareness: Lupon Tagapamayapa',
    section: 'Safety & Peace Order',
    type: 'awareness'
  },
  'safety_usedLupon': {
    label: 'Availment: Used Lupon Services',
    section: 'Safety & Peace Order',
    type: 'availment'
  },
  'safety_satisfactionLupon': {
    label: 'Satisfaction: Lupon Services',
    section: 'Safety & Peace Order',
    type: 'satisfaction'
  },
  'safety_nfaBinaryLupon': {
    label: 'Need for Action: Lupon Services',
    section: 'Safety & Peace Order',
    type: 'nfa'
  },
  'safety_suggestionsLupon': {
    label: 'Suggestions: Lupon Services',
    section: 'Safety & Peace Order',
    type: 'suggestion'
  },

  'safety_awarenessAntiDrug': {
    label: 'Awareness: Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'awareness'
  },
  'safety_participatedAntiDrug': {
    label: 'Availment: Participated in Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'availment'
  },
  'safety_satisfactionAntiDrug': {
    label: 'Satisfaction: Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'satisfaction'
  },
  'safety_nfaBinaryAntiDrug': {
    label: 'Need for Action: Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'nfa'
  },
  'safety_suggestionsAntiDrug': {
    label: 'Suggestions: Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'suggestion'
  },

  // SOCIAL PROTECTION
  'social_awarenessHealthServices': {
    label: 'Awareness: Health Services',
    section: 'Social Protection',
    type: 'awareness',
    description: 'Are you aware of barangay health services?'
  },
  'social_usedHealthServices': {
    label: 'Availment: Used Health Services',
    section: 'Social Protection',
    type: 'availment'
  },
  'social_satisfactionHealthServices': {
    label: 'Satisfaction: Health Services',
    section: 'Social Protection',
    type: 'satisfaction'
  },
  'social_nfaBinaryHealthServices': {
    label: 'Need for Action: Health Services',
    section: 'Social Protection',
    type: 'nfa'
  },
  'social_suggestionsHealthServices': {
    label: 'Suggestions: Health Services',
    section: 'Social Protection',
    type: 'suggestion'
  },

  'social_awarenessWomenChildrenProtection': {
    label: 'Awareness: Women & Children Protection',
    section: 'Social Protection',
    type: 'awareness'
  },
  'social_accessedWomenChildrenProtection': {
    label: 'Availment: Accessed Protection Services',
    section: 'Social Protection',
    type: 'availment'
  },
  'social_satisfactionWomenChildrenProtection': {
    label: 'Satisfaction: Protection Services',
    section: 'Social Protection',
    type: 'satisfaction'
  },
  'social_nfaBinaryWomenChildrenProtection': {
    label: 'Need for Action: Protection Services',
    section: 'Social Protection',
    type: 'nfa'
  },
  'social_suggestionsWomenChildrenProtection': {
    label: 'Suggestions: Protection Services',
    section: 'Social Protection',
    type: 'suggestion'
  },

  'social_awarenessCommunityParticipation': {
    label: 'Awareness: Community Participation',
    section: 'Social Protection',
    type: 'awareness'
  },
  'social_participatedCommunity': {
    label: 'Availment: Participated in Community Activities',
    section: 'Social Protection',
    type: 'availment'
  },
  'social_satisfactionCommunityParticipation': {
    label: 'Satisfaction: Community Participation',
    section: 'Social Protection',
    type: 'satisfaction'
  },
  'social_nfaBinaryCommunityParticipation': {
    label: 'Need for Action: Community Participation',
    section: 'Social Protection',
    type: 'nfa'
  },
  'social_suggestionsCommunityParticipation': {
    label: 'Suggestions: Community Participation',
    section: 'Social Protection',
    type: 'suggestion'
  },

  // BUSINESS FRIENDLINESS
  'business_awarenessBusinessClearance': {
    label: 'Awareness: Business Clearance Process',
    section: 'Business Friendliness',
    type: 'awareness',
    description: 'Are you aware of the business clearance process?'
  },
  'business_obtainedBusinessClearance': {
    label: 'Availment: Obtained Business Clearance',
    section: 'Business Friendliness',
    type: 'availment'
  },
  'business_satisfactionBusinessClearance': {
    label: 'Satisfaction: Business Clearance Process',
    section: 'Business Friendliness',
    type: 'satisfaction'
  },
  'business_nfaBinaryBusinessClearance': {
    label: 'Need for Action: Business Clearance',
    section: 'Business Friendliness',
    type: 'nfa'
  },
  'business_suggestionsBusinessClearance': {
    label: 'Suggestions: Business Clearance',
    section: 'Business Friendliness',
    type: 'suggestion'
  },

  'business_awarenessBusinessSupport': {
    label: 'Awareness: Business Support Programs',
    section: 'Business Friendliness',
    type: 'awareness',
    description: 'Are you aware of business support programs?'
  },
  'business_receivedBusinessSupport': {
    label: 'Availment: Received Business Support',
    section: 'Business Friendliness',
    type: 'availment',
    description: 'Have you received business support from the barangay?'
  },
  'business_satisfactionBusinessSupport': {
    label: 'Satisfaction: Business Support Programs',
    section: 'Business Friendliness',
    type: 'satisfaction'
  },
  'business_nfaBinaryBusinessSupport': {
    label: 'Need for Action: Business Support',
    section: 'Business Friendliness',
    type: 'nfa'
  },
  'business_suggestionsBusinessSupport': {
    label: 'Suggestions: Business Support',
    section: 'Business Friendliness',
    type: 'suggestion'
  },

  // ENVIRONMENTAL MANAGEMENT
  'environmental_awarenessWasteManagement': {
    label: 'Awareness: Waste Management',
    section: 'Environmental Management',
    type: 'awareness',
    description: 'Are you aware of waste management services?'
  },
  'environmental_usedWasteManagement': {
    label: 'Availment: Used Waste Management Services',
    section: 'Environmental Management',
    type: 'availment'
  },
  'environmental_satisfactionWasteManagement': {
    label: 'Satisfaction: Waste Management',
    section: 'Environmental Management',
    type: 'satisfaction'
  },
  'environmental_nfaBinaryWasteManagement': {
    label: 'Need for Action: Waste Management',
    section: 'Environmental Management',
    type: 'nfa'
  },
  'environmental_suggestionsWasteManagement': {
    label: 'Suggestions: Waste Management',
    section: 'Environmental Management',
    type: 'suggestion'
  },

  'environmental_awarenessEnvironmentalPrograms': {
    label: 'Awareness: Environmental Programs',
    section: 'Environmental Management',
    type: 'awareness'
  },
  'environmental_participatedEnvironmentalPrograms': {
    label: 'Availment: Participated in Environmental Programs',
    section: 'Environmental Management',
    type: 'availment'
  },
  'environmental_satisfactionEnvironmentalPrograms': {
    label: 'Satisfaction: Environmental Programs',
    section: 'Environmental Management',
    type: 'satisfaction'
  },
  'environmental_nfaBinaryEnvironmentalPrograms': {
    label: 'Need for Action: Environmental Programs',
    section: 'Environmental Management',
    type: 'nfa'
  },
  'environmental_suggestionsEnvironmentalPrograms': {
    label: 'Suggestions: Environmental Programs',
    section: 'Environmental Management',
    type: 'suggestion'
  },

  // OVERALL SECTION
  'overall_overallSatisfaction': {
    label: 'Overall Satisfaction',
    section: 'Overall Evaluation',
    type: 'satisfaction',
    description: 'Overall satisfaction with barangay services'
  },
  'overall_overallNeedForAction': {
    label: 'Overall Need for Action',
    section: 'Overall Evaluation',
    type: 'nfa',
    description: 'Does the barangay need overall improvement?'
  }
}

/**
 * Get human-readable label for a question key
 */
export function getQuestionLabel(questionKey: string): string {
  const metadata = questionLabels[questionKey]
  return metadata ? metadata.label : questionKey
}

/**
 * Get question metadata
 */
export function getQuestionMetadata(questionKey: string): QuestionMetadata | null {
  return questionLabels[questionKey] || null
}

/**
 * Get all questions for a section
 */
export function getQuestionsBySection(sectionKey: string): Record<string, QuestionMetadata> {
  const result: Record<string, QuestionMetadata> = {}
  
  Object.entries(questionLabels).forEach(([key, metadata]) => {
    if (key.startsWith(sectionKey + '_')) {
      result[key] = metadata
    }
  })
  
  return result
}

/**
 * Get questions by type
 */
export function getQuestionsByType(type: QuestionMetadata['type']): Record<string, QuestionMetadata> {
  const result: Record<string, QuestionMetadata> = {}
  
  Object.entries(questionLabels).forEach(([key, metadata]) => {
    if (metadata.type === type) {
      result[key] = metadata
    }
  })
  
  return result
}

/**
 * Format question key for display (fallback if not in mapping)
 */
export function formatQuestionKey(questionKey: string): string {
  // If we have a mapping, use it
  if (questionLabels[questionKey]) {
    return questionLabels[questionKey].label
  }
  
  // Otherwise, try to make it readable
  const parts = questionKey.split('_')
  if (parts.length < 2) return questionKey
  
  const section = parts[0]
  const question = parts.slice(1).join(' ')
  
  // Capitalize and add spaces
  const formatted = question
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
  
  return `${section}: ${formatted}`
}
