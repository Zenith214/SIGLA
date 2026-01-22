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
  'financial_participatedSocialPrograms': {
    label: 'Availment: Participated in Social Programs',
    section: 'Financial Administration',
    type: 'availment'
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
  'financial_experiencedCorruption': {
    label: 'Experience: Witnessed Corruption',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_detailsCorruption': {
    label: 'Details: Corruption Experience',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_reportedCorruption': {
    label: 'Reported: Corruption Incident',
    section: 'Financial Administration',
    type: 'availment'
  },
  'financial_reasonsNotReporting': {
    label: 'Reasons: Why Not Reported',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_satisfactionReportResponse': {
    label: 'Satisfaction: Report Response',
    section: 'Financial Administration',
    type: 'satisfaction'
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

  // Conditional Module Fields - Financial
  'financial_unawareness_reason': {
    label: 'Unawareness Reason: Financial Services',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_non_availment_reason': {
    label: 'Non-Availment Reason: Financial Services',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_projects_unawareness_reason': {
    label: 'Unawareness Reason: Projects',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_projects_non_availment_reason': {
    label: 'Non-Availment Reason: Projects',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_financial_unawareness_reason': {
    label: 'Unawareness Reason: Financial Transparency',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_financial_non_availment_reason': {
    label: 'Non-Availment Reason: Financial Transparency',
    section: 'Financial Administration',
    type: 'other'
  },
  'socialPrograms_unawareness_reason': {
    label: 'Unawareness Reason: Social Programs',
    section: 'Financial Administration',
    type: 'other'
  },
  'socialPrograms_non_availment_reason': {
    label: 'Non-Availment Reason: Social Programs',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_socialPrograms_unawareness_reason': {
    label: 'Unawareness Reason: Social Programs',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_socialPrograms_non_availment_reason': {
    label: 'Non-Availment Reason: Social Programs',
    section: 'Financial Administration',
    type: 'other'
  },
  
  // Skip reasons for conditional modules - Financial
  'financial_projects_unawareness_reason_skipReason': {
    label: 'Skip Reason: Projects Unawareness',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_projects_non_availment_reason_skipReason': {
    label: 'Skip Reason: Projects Non-Availment',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_financial_unawareness_reason_skipReason': {
    label: 'Skip Reason: Financial Transparency Unawareness',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_financial_non_availment_reason_skipReason': {
    label: 'Skip Reason: Financial Transparency Non-Availment',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_socialPrograms_unawareness_reason_skipReason': {
    label: 'Skip Reason: Social Programs Unawareness',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_socialPrograms_non_availment_reason_skipReason': {
    label: 'Skip Reason: Social Programs Non-Availment',
    section: 'Financial Administration',
    type: 'other'
  },

  // DISASTER PREPAREDNESS
  'disaster_awarenessDisasterInfo': {
    label: 'Awareness: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'awareness',
    description: 'Are you aware of disaster preparedness information?'
  },
  'disaster_availmentDisasterInfo': {
    label: 'Availment: Received Disaster Information',
    section: 'Disaster Preparedness',
    type: 'availment'
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
  'disaster_locationEvacuation': {
    label: 'Availment: Know Evacuation Location',
    section: 'Disaster Preparedness',
    type: 'availment'
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

  // Conditional Module Fields - Disaster
  'disasterInfo_unawareness_reason': {
    label: 'Unawareness Reason: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disasterInfo_non_availment_reason': {
    label: 'Non-Availment Reason: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_disasterInfo_unawareness_reason': {
    label: 'Unawareness Reason: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_disasterInfo_non_availment_reason': {
    label: 'Non-Availment Reason: Disaster Information',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'evacuation_unawareness_reason': {
    label: 'Unawareness Reason: Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'evacuation_non_availment_reason': {
    label: 'Non-Availment Reason: Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_evacuation_unawareness_reason': {
    label: 'Unawareness Reason: Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_evacuation_non_availment_reason': {
    label: 'Non-Availment Reason: Evacuation Centers',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  
  // Skip reasons for conditional modules - Disaster
  'disaster_disasterInfo_unawareness_reason_skipReason': {
    label: 'Skip Reason: Disaster Info Unawareness',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_disasterInfo_non_availment_reason_skipReason': {
    label: 'Skip Reason: Disaster Info Non-Availment',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_evacuation_unawareness_reason_skipReason': {
    label: 'Skip Reason: Evacuation Unawareness',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_evacuation_non_availment_reason_skipReason': {
    label: 'Skip Reason: Evacuation Non-Availment',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disasterInfo_unawareness_reason_skipReason': {
    label: 'Skip Reason: Disaster Info Unawareness',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disasterInfo_non_availment_reason_skipReason': {
    label: 'Skip Reason: Disaster Info Non-Availment',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'evacuation_unawareness_reason_skipReason': {
    label: 'Skip Reason: Evacuation Unawareness',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'evacuation_non_availment_reason_skipReason': {
    label: 'Skip Reason: Evacuation Non-Availment',
    section: 'Disaster Preparedness',
    type: 'other'
  },

  // SAFETY & PEACE ORDER
  'safety_awarenessTanods': {
    label: 'Awareness: Barangay Tanods',
    section: 'Safety & Peace Order',
    type: 'awareness',
    description: 'Are you aware of barangay tanod services?'
  },
  'safety_experienceTanods': {
    label: 'Availment: Experienced Tanod Services',
    section: 'Safety & Peace Order',
    type: 'availment'
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
  'safety_experienceLupon': {
    label: 'Availment: Used Lupon Services',
    section: 'Safety & Peace Order',
    type: 'availment'
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
  'safety_experienceAntiDrug': {
    label: 'Availment: Experienced Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'availment'
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

  // Conditional Module Fields - Safety
  'tanods_unawareness_reason': {
    label: 'Unawareness Reason: Tanod Services',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'tanods_non_availment_reason': {
    label: 'Non-Availment Reason: Tanod Services',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_tanods_unawareness_reason': {
    label: 'Unawareness Reason: Tanod Services',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_tanods_non_availment_reason': {
    label: 'Non-Availment Reason: Tanod Services',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'lupon_unawareness_reason': {
    label: 'Unawareness Reason: Lupon Services',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'lupon_non_availment_reason': {
    label: 'Non-Availment Reason: Lupon Services',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_lupon_unawareness_reason': {
    label: 'Unawareness Reason: Lupon Services',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_lupon_non_availment_reason': {
    label: 'Non-Availment Reason: Lupon Services',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'antiDrug_unawareness_reason': {
    label: 'Unawareness Reason: Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'antiDrug_non_availment_reason': {
    label: 'Non-Availment Reason: Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_antiDrug_unawareness_reason': {
    label: 'Unawareness Reason: Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_antiDrug_non_availment_reason': {
    label: 'Non-Availment Reason: Anti-Drug Programs',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  
  // Skip reasons for conditional modules - Safety
  'safety_tanods_unawareness_reason_skipReason': {
    label: 'Skip Reason: Tanods Unawareness',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_tanods_non_availment_reason_skipReason': {
    label: 'Skip Reason: Tanods Non-Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_lupon_unawareness_reason_skipReason': {
    label: 'Skip Reason: Lupon Unawareness',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_lupon_non_availment_reason_skipReason': {
    label: 'Skip Reason: Lupon Non-Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_antiDrug_unawareness_reason_skipReason': {
    label: 'Skip Reason: Anti-Drug Unawareness',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_antiDrug_non_availment_reason_skipReason': {
    label: 'Skip Reason: Anti-Drug Non-Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'tanods_unawareness_reason_skipReason': {
    label: 'Skip Reason: Tanods Unawareness',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'tanods_non_availment_reason_skipReason': {
    label: 'Skip Reason: Tanods Non-Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'lupon_unawareness_reason_skipReason': {
    label: 'Skip Reason: Lupon Unawareness',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'lupon_non_availment_reason_skipReason': {
    label: 'Skip Reason: Lupon Non-Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'antiDrug_unawareness_reason_skipReason': {
    label: 'Skip Reason: Anti-Drug Unawareness',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'antiDrug_non_availment_reason_skipReason': {
    label: 'Skip Reason: Anti-Drug Non-Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },

  // SOCIAL PROTECTION
  'social_awarenessHealthServices': {
    label: 'Awareness: Health Services',
    section: 'Social Protection',
    type: 'awareness',
    description: 'Are you aware of barangay health services?'
  },
  'social_availmentHealthServices': {
    label: 'Availment: Used Health Services',
    section: 'Social Protection',
    type: 'availment'
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
  'social_availmentWomenChildrenProtection': {
    label: 'Availment: Know How to Access Protection Services',
    section: 'Social Protection',
    type: 'availment'
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
  'social_availmentCommunityParticipation': {
    label: 'Availment: Participated in Community Activities',
    section: 'Social Protection',
    type: 'availment'
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

  // Conditional Module Fields - Social
  'healthServices_unawareness_reason': {
    label: 'Unawareness Reason: Health Services',
    section: 'Social Protection',
    type: 'other'
  },
  'healthServices_non_availment_reason': {
    label: 'Non-Availment Reason: Health Services',
    section: 'Social Protection',
    type: 'other'
  },
  'social_healthServices_unawareness_reason': {
    label: 'Unawareness Reason: Health Services',
    section: 'Social Protection',
    type: 'other'
  },
  'social_healthServices_non_availment_reason': {
    label: 'Non-Availment Reason: Health Services',
    section: 'Social Protection',
    type: 'other'
  },
  'womenChildrenProtection_unawareness_reason': {
    label: 'Unawareness Reason: Protection Services',
    section: 'Social Protection',
    type: 'other'
  },
  'womenChildrenProtection_non_availment_reason': {
    label: 'Non-Availment Reason: Protection Services',
    section: 'Social Protection',
    type: 'other'
  },
  'social_womenChildrenProtection_unawareness_reason': {
    label: 'Unawareness Reason: Protection Services',
    section: 'Social Protection',
    type: 'other'
  },
  'social_womenChildrenProtection_non_availment_reason': {
    label: 'Non-Availment Reason: Protection Services',
    section: 'Social Protection',
    type: 'other'
  },
  'communityParticipation_unawareness_reason': {
    label: 'Unawareness Reason: Community Participation',
    section: 'Social Protection',
    type: 'other'
  },
  'communityParticipation_non_availment_reason': {
    label: 'Non-Availment Reason: Community Participation',
    section: 'Social Protection',
    type: 'other'
  },
  'social_communityParticipation_unawareness_reason': {
    label: 'Unawareness Reason: Community Participation',
    section: 'Social Protection',
    type: 'other'
  },
  'social_communityParticipation_non_availment_reason': {
    label: 'Non-Availment Reason: Community Participation',
    section: 'Social Protection',
    type: 'other'
  },
  
  // Skip reasons for conditional modules - Social
  'social_healthServices_unawareness_reason_skipReason': {
    label: 'Skip Reason: Health Services Unawareness',
    section: 'Social Protection',
    type: 'other'
  },
  'social_healthServices_non_availment_reason_skipReason': {
    label: 'Skip Reason: Health Services Non-Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'social_womenChildrenProtection_unawareness_reason_skipReason': {
    label: 'Skip Reason: Protection Services Unawareness',
    section: 'Social Protection',
    type: 'other'
  },
  'social_womenChildrenProtection_non_availment_reason_skipReason': {
    label: 'Skip Reason: Protection Services Non-Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'social_communityParticipation_unawareness_reason_skipReason': {
    label: 'Skip Reason: Community Participation Unawareness',
    section: 'Social Protection',
    type: 'other'
  },
  'social_communityParticipation_non_availment_reason_skipReason': {
    label: 'Skip Reason: Community Participation Non-Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'healthServices_unawareness_reason_skipReason': {
    label: 'Skip Reason: Health Services Unawareness',
    section: 'Social Protection',
    type: 'other'
  },
  'healthServices_non_availment_reason_skipReason': {
    label: 'Skip Reason: Health Services Non-Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'womenChildrenProtection_unawareness_reason_skipReason': {
    label: 'Skip Reason: Protection Services Unawareness',
    section: 'Social Protection',
    type: 'other'
  },
  'womenChildrenProtection_non_availment_reason_skipReason': {
    label: 'Skip Reason: Protection Services Non-Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'communityParticipation_unawareness_reason_skipReason': {
    label: 'Skip Reason: Community Participation Unawareness',
    section: 'Social Protection',
    type: 'other'
  },
  'communityParticipation_non_availment_reason_skipReason': {
    label: 'Skip Reason: Community Participation Non-Availment',
    section: 'Social Protection',
    type: 'other'
  },

  // BUSINESS FRIENDLINESS
  'business_awarenessBusinessClearance': {
    label: 'Awareness: Business Clearance Process',
    section: 'Business Friendliness',
    type: 'awareness',
    description: 'Are you aware of the business clearance process?'
  },
  'business_availmentBusinessClearance': {
    label: 'Availment: Applied for Business Clearance',
    section: 'Business Friendliness',
    type: 'availment'
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

  // Conditional Module Fields - Business
  'businessClearance_unawareness_reason': {
    label: 'Unawareness Reason: Business Clearance',
    section: 'Business Friendliness',
    type: 'other'
  },
  'businessClearance_non_availment_reason': {
    label: 'Non-Availment Reason: Business Clearance',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_businessClearance_unawareness_reason': {
    label: 'Unawareness Reason: Business Clearance',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_businessClearance_non_availment_reason': {
    label: 'Non-Availment Reason: Business Clearance',
    section: 'Business Friendliness',
    type: 'other'
  },
  
  // Skip reasons for conditional modules - Business
  'business_businessClearance_unawareness_reason_skipReason': {
    label: 'Skip Reason: Business Clearance Unawareness',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_businessClearance_non_availment_reason_skipReason': {
    label: 'Skip Reason: Business Clearance Non-Availment',
    section: 'Business Friendliness',
    type: 'other'
  },
  'businessClearance_unawareness_reason_skipReason': {
    label: 'Skip Reason: Business Clearance Unawareness',
    section: 'Business Friendliness',
    type: 'other'
  },
  'businessClearance_non_availment_reason_skipReason': {
    label: 'Skip Reason: Business Clearance Non-Availment',
    section: 'Business Friendliness',
    type: 'other'
  },

  // ENVIRONMENTAL MANAGEMENT
  'environmental_awarenessWasteManagement': {
    label: 'Awareness: Waste Management',
    section: 'Environmental Management',
    type: 'awareness',
    description: 'Are you aware of waste management services?'
  },
  'environmental_availmentWasteManagement': {
    label: 'Availment: Follow Waste Management Rules',
    section: 'Environmental Management',
    type: 'availment'
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

  // Conditional Module Fields - Environmental
  'wasteManagement_unawareness_reason': {
    label: 'Unawareness Reason: Waste Management',
    section: 'Environmental Management',
    type: 'other'
  },
  'wasteManagement_non_availment_reason': {
    label: 'Non-Availment Reason: Waste Management',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_wasteManagement_unawareness_reason': {
    label: 'Unawareness Reason: Waste Management',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_wasteManagement_non_availment_reason': {
    label: 'Non-Availment Reason: Waste Management',
    section: 'Environmental Management',
    type: 'other'
  },
  
  // Skip reasons for conditional modules - Environmental
  'environmental_wasteManagement_unawareness_reason_skipReason': {
    label: 'Skip Reason: Waste Management Unawareness',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_wasteManagement_non_availment_reason_skipReason': {
    label: 'Skip Reason: Waste Management Non-Availment',
    section: 'Environmental Management',
    type: 'other'
  },
  'wasteManagement_unawareness_reason_skipReason': {
    label: 'Skip Reason: Waste Management Unawareness',
    section: 'Environmental Management',
    type: 'other'
  },
  'wasteManagement_non_availment_reason_skipReason': {
    label: 'Skip Reason: Waste Management Non-Availment',
    section: 'Environmental Management',
    type: 'other'
  },

  // OVERALL SECTION
  'overall_overallSatisfaction': {
    label: 'Overall Satisfaction',
    section: 'Overall Satisfaction',
    type: 'satisfaction',
    description: 'Overall satisfaction with barangay services'
  },
  'overall_overallNeedForAction': {
    label: 'Overall Need for Action',
    section: 'Overall Satisfaction',
    type: 'nfa',
    description: 'Does the barangay need overall improvement?'
  },

  // FINANCIAL ADMINISTRATION - Skip Reasons & New NFA Format
  'financial_benefitedProjects_skipReason': {
    label: 'Skip Reason: Projects Availment',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_satisfactionProjects_skipReason': {
    label: 'Skip Reason: Projects Satisfaction',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_nfaBinaryProjects_skipReason': {
    label: 'Skip Reason: Projects NFA',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_suggestionsProjects_skipReason': {
    label: 'Skip Reason: Projects Suggestions',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_need_for_action_binary_projects': {
    label: 'Need for Action: Projects (Yes/No)',
    section: 'Financial Administration',
    type: 'nfa'
  },
  'financial_need_for_action_suggestion_projects': {
    label: 'Need for Action: Projects Suggestions',
    section: 'Financial Administration',
    type: 'suggestion'
  },

  'financial_usedFinancialInfo_skipReason': {
    label: 'Skip Reason: Financial Info Availment',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_satisfactionFinancial_skipReason': {
    label: 'Skip Reason: Financial Satisfaction',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_nfaBinaryFinancial_skipReason': {
    label: 'Skip Reason: Financial NFA',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_suggestionsFinancial_skipReason': {
    label: 'Skip Reason: Financial Suggestions',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_need_for_action_binary_financial': {
    label: 'Need for Action: Financial Transparency (Yes/No)',
    section: 'Financial Administration',
    type: 'nfa'
  },
  'financial_need_for_action_suggestion_financial': {
    label: 'Need for Action: Financial Suggestions',
    section: 'Financial Administration',
    type: 'suggestion'
  },

  'financial_participatedSocialPrograms_skipReason': {
    label: 'Skip Reason: Social Programs Availment',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_satisfactionSocialPrograms_skipReason': {
    label: 'Skip Reason: Social Programs Satisfaction',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_nfaBinarySocialPrograms_skipReason': {
    label: 'Skip Reason: Social Programs NFA',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_suggestionsSocialPrograms_skipReason': {
    label: 'Skip Reason: Social Programs Suggestions',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_need_for_action_binary_social_programs': {
    label: 'Need for Action: Social Programs (Yes/No)',
    section: 'Financial Administration',
    type: 'nfa'
  },
  'financial_need_for_action_suggestion_social_programs': {
    label: 'Need for Action: Social Programs Suggestions',
    section: 'Financial Administration',
    type: 'suggestion'
  },

  'financial_detailsCorruption_skipReason': {
    label: 'Skip Reason: Corruption Details',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_reportedCorruption_skipReason': {
    label: 'Skip Reason: Corruption Reporting',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_reasonsNotReporting_skipReason': {
    label: 'Skip Reason: Not Reporting Reasons',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_satisfactionReportResponse_skipReason': {
    label: 'Skip Reason: Report Response Satisfaction',
    section: 'Financial Administration',
    type: 'other'
  },
  'financial_need_for_action_binary_corruption': {
    label: 'Need for Action: Anti-Corruption (Yes/No)',
    section: 'Financial Administration',
    type: 'nfa'
  },
  'financial_need_for_action_suggestion_corruption': {
    label: 'Need for Action: Anti-Corruption Suggestions',
    section: 'Financial Administration',
    type: 'suggestion'
  },

  // DISASTER PREPAREDNESS - Skip Reasons & New NFA Format
  'disaster_availmentDisasterInfo_skipReason': {
    label: 'Skip Reason: Disaster Info Availment',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_receivedDisasterInfo_skipReason': {
    label: 'Skip Reason: Disaster Info Availment',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_satisfactionDisasterInfo_skipReason': {
    label: 'Skip Reason: Disaster Info Satisfaction',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_nfaBinaryDisasterInfo_skipReason': {
    label: 'Skip Reason: Disaster Info NFA',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_suggestionsDisasterInfo_skipReason': {
    label: 'Skip Reason: Disaster Info Suggestions',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_need_for_action_binary_disaster_info': {
    label: 'Need for Action: Disaster Information (Yes/No)',
    section: 'Disaster Preparedness',
    type: 'nfa'
  },
  'disaster_need_for_action_suggestion_disaster_info': {
    label: 'Need for Action: Disaster Info Suggestions',
    section: 'Disaster Preparedness',
    type: 'suggestion'
  },

  'disaster_locationEvacuation_skipReason': {
    label: 'Skip Reason: Evacuation Location',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_usedEvacuation_skipReason': {
    label: 'Skip Reason: Evacuation Availment',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_satisfactionEvacuation_skipReason': {
    label: 'Skip Reason: Evacuation Satisfaction',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_nfaBinaryEvacuation_skipReason': {
    label: 'Skip Reason: Evacuation NFA',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_suggestionsEvacuation_skipReason': {
    label: 'Skip Reason: Evacuation Suggestions',
    section: 'Disaster Preparedness',
    type: 'other'
  },
  'disaster_need_for_action_binary_evacuation': {
    label: 'Need for Action: Evacuation Centers (Yes/No)',
    section: 'Disaster Preparedness',
    type: 'nfa'
  },
  'disaster_need_for_action_suggestion_evacuation': {
    label: 'Need for Action: Evacuation Suggestions',
    section: 'Disaster Preparedness',
    type: 'suggestion'
  },

  // SAFETY & PEACE ORDER - Skip Reasons & New NFA Format
  'safety_experienceTanods_skipReason': {
    label: 'Skip Reason: Tanods Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_experiencedTanods_skipReason': {
    label: 'Skip Reason: Tanods Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_satisfactionTanods_skipReason': {
    label: 'Skip Reason: Tanods Satisfaction',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_nfaBinaryTanods_skipReason': {
    label: 'Skip Reason: Tanods NFA',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_suggestionsTanods_skipReason': {
    label: 'Skip Reason: Tanods Suggestions',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_need_for_action_binary_tanods': {
    label: 'Need for Action: Tanod Services (Yes/No)',
    section: 'Safety & Peace Order',
    type: 'nfa'
  },
  'safety_need_for_action_suggestion_tanods': {
    label: 'Need for Action: Tanods Suggestions',
    section: 'Safety & Peace Order',
    type: 'suggestion'
  },

  'safety_experienceLupon_skipReason': {
    label: 'Skip Reason: Lupon Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_usedLupon_skipReason': {
    label: 'Skip Reason: Lupon Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_satisfactionLupon_skipReason': {
    label: 'Skip Reason: Lupon Satisfaction',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_nfaBinaryLupon_skipReason': {
    label: 'Skip Reason: Lupon NFA',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_suggestionsLupon_skipReason': {
    label: 'Skip Reason: Lupon Suggestions',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_need_for_action_binary_lupon': {
    label: 'Need for Action: Lupon Services (Yes/No)',
    section: 'Safety & Peace Order',
    type: 'nfa'
  },
  'safety_need_for_action_suggestion_lupon': {
    label: 'Need for Action: Lupon Suggestions',
    section: 'Safety & Peace Order',
    type: 'suggestion'
  },

  'safety_experienceAntiDrug_skipReason': {
    label: 'Skip Reason: Anti-Drug Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_participatedAntiDrug_skipReason': {
    label: 'Skip Reason: Anti-Drug Availment',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_satisfactionAntiDrug_skipReason': {
    label: 'Skip Reason: Anti-Drug Satisfaction',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_nfaBinaryAntiDrug_skipReason': {
    label: 'Skip Reason: Anti-Drug NFA',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_suggestionsAntiDrug_skipReason': {
    label: 'Skip Reason: Anti-Drug Suggestions',
    section: 'Safety & Peace Order',
    type: 'other'
  },
  'safety_need_for_action_binary_anti_drug': {
    label: 'Need for Action: Anti-Drug Programs (Yes/No)',
    section: 'Safety & Peace Order',
    type: 'nfa'
  },
  'safety_need_for_action_suggestion_anti_drug': {
    label: 'Need for Action: Anti-Drug Suggestions',
    section: 'Safety & Peace Order',
    type: 'suggestion'
  },

  // SOCIAL PROTECTION - Skip Reasons & New NFA Format
  'social_availmentHealthServices_skipReason': {
    label: 'Skip Reason: Health Services Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'social_usedHealthServices_skipReason': {
    label: 'Skip Reason: Health Services Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'social_satisfactionHealthServices_skipReason': {
    label: 'Skip Reason: Health Services Satisfaction',
    section: 'Social Protection',
    type: 'other'
  },
  'social_nfaBinaryHealthServices_skipReason': {
    label: 'Skip Reason: Health Services NFA',
    section: 'Social Protection',
    type: 'other'
  },
  'social_suggestionsHealthServices_skipReason': {
    label: 'Skip Reason: Health Services Suggestions',
    section: 'Social Protection',
    type: 'other'
  },
  'social_need_for_action_binary_health_services': {
    label: 'Need for Action: Health Services (Yes/No)',
    section: 'Social Protection',
    type: 'nfa'
  },
  'social_need_for_action_suggestion_health_services': {
    label: 'Need for Action: Health Services Suggestions',
    section: 'Social Protection',
    type: 'suggestion'
  },

  'social_availmentWomenChildrenProtection_skipReason': {
    label: 'Skip Reason: Protection Services Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'social_accessedWomenChildrenProtection_skipReason': {
    label: 'Skip Reason: Protection Services Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'social_satisfactionWomenChildrenProtection_skipReason': {
    label: 'Skip Reason: Protection Services Satisfaction',
    section: 'Social Protection',
    type: 'other'
  },
  'social_nfaBinaryWomenChildrenProtection_skipReason': {
    label: 'Skip Reason: Protection Services NFA',
    section: 'Social Protection',
    type: 'other'
  },
  'social_suggestionsWomenChildrenProtection_skipReason': {
    label: 'Skip Reason: Protection Services Suggestions',
    section: 'Social Protection',
    type: 'other'
  },
  'social_need_for_action_binary_women_children_protection': {
    label: 'Need for Action: Protection Services (Yes/No)',
    section: 'Social Protection',
    type: 'nfa'
  },
  'social_need_for_action_suggestion_women_children_protection': {
    label: 'Need for Action: Protection Services Suggestions',
    section: 'Social Protection',
    type: 'suggestion'
  },

  'social_availmentCommunityParticipation_skipReason': {
    label: 'Skip Reason: Community Participation Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'social_participatedCommunity_skipReason': {
    label: 'Skip Reason: Community Participation Availment',
    section: 'Social Protection',
    type: 'other'
  },
  'social_satisfactionCommunityParticipation_skipReason': {
    label: 'Skip Reason: Community Participation Satisfaction',
    section: 'Social Protection',
    type: 'other'
  },
  'social_nfaBinaryCommunityParticipation_skipReason': {
    label: 'Skip Reason: Community Participation NFA',
    section: 'Social Protection',
    type: 'other'
  },
  'social_suggestionsCommunityParticipation_skipReason': {
    label: 'Skip Reason: Community Participation Suggestions',
    section: 'Social Protection',
    type: 'other'
  },
  'social_need_for_action_binary_community_participation': {
    label: 'Need for Action: Community Participation (Yes/No)',
    section: 'Social Protection',
    type: 'nfa'
  },
  'social_need_for_action_suggestion_community_participation': {
    label: 'Need for Action: Community Participation Suggestions',
    section: 'Social Protection',
    type: 'suggestion'
  },

  // BUSINESS FRIENDLINESS - Skip Reasons & New NFA Format
  'business_availmentBusinessClearance_skipReason': {
    label: 'Skip Reason: Business Clearance Availment',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_obtainedBusinessClearance_skipReason': {
    label: 'Skip Reason: Business Clearance Availment',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_satisfactionBusinessClearance_skipReason': {
    label: 'Skip Reason: Business Clearance Satisfaction',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_nfaBinaryBusinessClearance_skipReason': {
    label: 'Skip Reason: Business Clearance NFA',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_suggestionsBusinessClearance_skipReason': {
    label: 'Skip Reason: Business Clearance Suggestions',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_need_for_action_binary_business_clearance': {
    label: 'Need for Action: Business Clearance (Yes/No)',
    section: 'Business Friendliness',
    type: 'nfa'
  },
  'business_need_for_action_suggestion_business_clearance': {
    label: 'Need for Action: Business Clearance Suggestions',
    section: 'Business Friendliness',
    type: 'suggestion'
  },

  'business_receivedBusinessSupport_skipReason': {
    label: 'Skip Reason: Business Support Availment',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_satisfactionBusinessSupport_skipReason': {
    label: 'Skip Reason: Business Support Satisfaction',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_nfaBinaryBusinessSupport_skipReason': {
    label: 'Skip Reason: Business Support NFA',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_suggestionsBusinessSupport_skipReason': {
    label: 'Skip Reason: Business Support Suggestions',
    section: 'Business Friendliness',
    type: 'other'
  },
  'business_need_for_action_binary_business_support': {
    label: 'Need for Action: Business Support (Yes/No)',
    section: 'Business Friendliness',
    type: 'nfa'
  },
  'business_need_for_action_suggestion_business_support': {
    label: 'Need for Action: Business Support Suggestions',
    section: 'Business Friendliness',
    type: 'suggestion'
  },

  // ENVIRONMENTAL MANAGEMENT - Skip Reasons & New NFA Format
  'environmental_availmentWasteManagement_skipReason': {
    label: 'Skip Reason: Waste Management Availment',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_usedWasteManagement_skipReason': {
    label: 'Skip Reason: Waste Management Availment',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_satisfactionWasteManagement_skipReason': {
    label: 'Skip Reason: Waste Management Satisfaction',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_nfaBinaryWasteManagement_skipReason': {
    label: 'Skip Reason: Waste Management NFA',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_suggestionsWasteManagement_skipReason': {
    label: 'Skip Reason: Waste Management Suggestions',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_need_for_action_binary_waste_management': {
    label: 'Need for Action: Waste Management (Yes/No)',
    section: 'Environmental Management',
    type: 'nfa'
  },
  'environmental_need_for_action_suggestion_waste_management': {
    label: 'Need for Action: Waste Management Suggestions',
    section: 'Environmental Management',
    type: 'suggestion'
  },

  'environmental_participatedEnvironmentalPrograms_skipReason': {
    label: 'Skip Reason: Environmental Programs Availment',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_satisfactionEnvironmentalPrograms_skipReason': {
    label: 'Skip Reason: Environmental Programs Satisfaction',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_nfaBinaryEnvironmentalPrograms_skipReason': {
    label: 'Skip Reason: Environmental Programs NFA',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_suggestionsEnvironmentalPrograms_skipReason': {
    label: 'Skip Reason: Environmental Programs Suggestions',
    section: 'Environmental Management',
    type: 'other'
  },
  'environmental_need_for_action_binary_environmental_programs': {
    label: 'Need for Action: Environmental Programs (Yes/No)',
    section: 'Environmental Management',
    type: 'nfa'
  },
  'environmental_need_for_action_suggestion_environmental_programs': {
    label: 'Need for Action: Environmental Programs Suggestions',
    section: 'Environmental Management',
    type: 'suggestion'
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
