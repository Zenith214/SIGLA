/**
 * Answer Value Formatter
 * Converts technical answer values to human-readable format
 */

/**
 * Format answer values for display
 */
export function formatAnswerValue(value: any): string {
  if (value === null || value === undefined) {
    return 'No answer'
  }

  // Convert to string for processing
  const strValue = String(value)

  // Handle empty strings
  if (strValue.trim() === '') {
    return 'No answer'
  }

  // Handle skip reasons
  if (strValue === 'conditional_skip') {
    return 'Skipped (conditional logic)'
  }
  if (strValue === 'incident_reported') {
    return 'Skipped (incident reported)'
  }
  if (strValue === 'not_applicable') {
    return 'Not applicable'
  }

  // Handle common Yes/No variations
  if (strValue.toLowerCase() === 'yes') {
    return 'Yes'
  }
  if (strValue.toLowerCase() === 'no') {
    return 'No'
  }

  // Handle Filipino Yes/No
  if (strValue === 'Oo' || strValue === 'Oo (Yes)') {
    return 'Yes (Oo)'
  }
  if (strValue === 'Hindi' || strValue === 'Hindi (No)') {
    return 'No (Hindi)'
  }

  // Handle satisfaction ratings
  if (strValue.includes('Very Satisfied') || strValue.includes('Lubos na Nasiyahan')) {
    return '5 - Very Satisfied'
  }
  if (strValue.includes('Satisfied') || strValue.includes('Nasiyahan')) {
    return '4 - Satisfied'
  }
  if (strValue.includes('Neutral')) {
    return '3 - Neutral'
  }
  if (strValue.includes('Dissatisfied') || strValue.includes('Hindi Nasiyahan')) {
    return '2 - Dissatisfied'
  }
  if (strValue.includes('Very Dissatisfied') || strValue.includes('Lubos na Hindi Nasiyahan')) {
    return '1 - Very Dissatisfied'
  }

  // Handle arrays (multiple selections)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'No selections'
    }
    return value.map(v => formatAnswerValue(v)).join(', ')
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    // If it's an object with specific properties, try to format it
    if ('reason' in value) {
      return formatAnswerValue(value.reason)
    }
    if ('value' in value) {
      return formatAnswerValue(value.value)
    }
    
    // Handle unawareness/non-availment reason objects with main and followUp
    if ('main' in value || 'followUp' in value) {
      const parts: string[] = []
      if (value.main) {
        parts.push(formatAnswerValue(value.main))
      }
      if (value.followUp) {
        parts.push(`Follow-up: ${formatAnswerValue(value.followUp)}`)
      }
      return parts.join(' | ')
    }
    
    // For other objects, try to stringify nicely
    try {
      const keys = Object.keys(value)
      if (keys.length === 0) {
        return 'No data'
      }
      // If it has a few keys, show them formatted
      if (keys.length <= 3) {
        return keys.map(k => {
          const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')
          return `${label}: ${formatAnswerValue(value[k])}`
        }).join(' | ')
      }
      return `Object with ${keys.length} properties`
    } catch {
      return '[Complex Object]'
    }
  }

  // Handle boolean
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  // Handle numbers
  if (typeof value === 'number') {
    return strValue
  }

  // Return as-is for other values (including text responses)
  return strValue
}

/**
 * Format skip reason specifically
 */
export function formatSkipReason(value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'Not skipped'
  }

  const strValue = String(value)

  switch (strValue.toLowerCase()) {
    case 'conditional_skip':
      return 'Skipped due to conditional logic'
    case 'incident_reported':
      return 'Skipped because incident was reported'
    case 'not_applicable':
      return 'Not applicable to respondent'
    case 'no_awareness':
      return 'Respondent not aware of service'
    case 'no_availment':
      return 'Respondent did not avail service'
    default:
      return strValue
  }
}

/**
 * Check if a field is a skip reason field
 */
export function isSkipReasonField(key: string): boolean {
  return key.includes('_skipReason') || key.includes('skipReason')
}

/**
 * Check if a field is an unawareness/non-availment reason field
 */
export function isConditionalReasonField(key: string): boolean {
  return key.includes('unawareness_reason') || 
         key.includes('non_availment_reason') ||
         key.includes('_reason')
}
