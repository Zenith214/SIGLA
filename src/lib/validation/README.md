# NFA Validation Utilities

This module provides validation functions for the binary Need for Action (NFA) feature in the PULSE survey system.

## Quick Start

```typescript
import {
  validateSuggestionField,
  validateBinaryAnswer,
  validateNFAData,
  isSuggestionRequired,
} from '@/lib/validation';

// Validate a suggestion field based on binary answer
const result = validateSuggestionField('Yes', suggestionText);
if (!result.valid) {
  console.error(result.error);
}

// Check if suggestion is required
const isRequired = isSuggestionRequired(binaryAnswer);

// Validate complete NFA data
const nfaResult = validateNFAData(binaryAnswer, suggestionText);
```

## Functions

### `validateSuggestionField(binaryAnswer, suggestionText)`

Validates the suggestion field based on the binary answer.

**Rules:**
- When binary is "Yes" or "Oo": suggestion must be non-empty and not whitespace-only
- When binary is "No" or "Hindi": suggestion is optional

**Parameters:**
- `binaryAnswer`: 'Yes' | 'No' | 'Oo' | 'Hindi' | null | undefined
- `suggestionText`: string | null | undefined

**Returns:** `ValidationResult`
```typescript
{
  valid: boolean;
  error?: string;
}
```

**Example:**
```typescript
// Valid: Yes with suggestion
validateSuggestionField('Yes', 'Need more training');
// { valid: true }

// Invalid: Yes without suggestion
validateSuggestionField('Yes', '');
// { valid: false, error: 'Please provide specific comments...' }

// Valid: No without suggestion
validateSuggestionField('No', '');
// { valid: true }
```

### `validateBinaryAnswer(answer)`

Validates that a binary answer is provided and is valid.

**Rules:**
- Answer must not be null, undefined, or empty
- Answer must be exactly "Yes", "No", "Oo", or "Hindi" (case-sensitive)

**Parameters:**
- `answer`: string | null | undefined

**Returns:** `ValidationResult`

**Example:**
```typescript
validateBinaryAnswer('Yes'); // { valid: true }
validateBinaryAnswer('');    // { valid: false, error: '...' }
validateBinaryAnswer('yes'); // { valid: false, error: 'Invalid binary value' }
```

### `validateNFAData(binaryAnswer, suggestionText)`

Validates complete NFA data (both binary and suggestion).

**Rules:**
- Binary answer is always required
- Suggestion validation depends on binary answer

**Parameters:**
- `binaryAnswer`: 'Yes' | 'No' | 'Oo' | 'Hindi' | null | undefined
- `suggestionText`: string | null | undefined

**Returns:** `ValidationResult`

**Example:**
```typescript
// Valid complete data
validateNFAData('Yes', 'Need improvements');
// { valid: true }

// Invalid: missing binary
validateNFAData(null, 'Some text');
// { valid: false, error: 'Please indicate whether...' }

// Invalid: Yes without suggestion
validateNFAData('Yes', '');
// { valid: false, error: 'Please provide specific comments...' }
```

### `isSuggestionRequired(binaryAnswer)`

Checks if the suggestion field is required based on the binary answer.

**Parameters:**
- `binaryAnswer`: 'Yes' | 'No' | 'Oo' | 'Hindi' | null | undefined

**Returns:** `boolean`

**Example:**
```typescript
isSuggestionRequired('Yes');   // true
isSuggestionRequired('Oo');    // true
isSuggestionRequired('No');    // false
isSuggestionRequired('Hindi'); // false
isSuggestionRequired(null);    // false
```

### `getSuggestionRequiredStatus(formData, binaryFieldId)`

Gets the required status for a suggestion field from form data.

**Parameters:**
- `formData`: Record<string, any>
- `binaryFieldId`: string

**Returns:** `boolean`

**Example:**
```typescript
const formData = {
  projects_nfa_binary: 'Yes',
  financial_nfa_binary: 'No',
};

getSuggestionRequiredStatus(formData, 'projects_nfa_binary');  // true
getSuggestionRequiredStatus(formData, 'financial_nfa_binary'); // false
```

### `isBinaryYes(answer)` / `isBinaryNo(answer)`

Helper functions to check binary answer values.

**Parameters:**
- `answer`: string | null | undefined

**Returns:** `boolean`

**Example:**
```typescript
isBinaryYes('Yes');   // true
isBinaryYes('Oo');    // true
isBinaryYes('No');    // false

isBinaryNo('No');     // true
isBinaryNo('Hindi');  // true
isBinaryNo('Yes');    // false
```

## Language Support

All functions support both English and Tagalog:
- English: "Yes" / "No"
- Tagalog: "Oo" / "Hindi"

**Important:** Values are case-sensitive. "yes" or "YES" will not be recognized as valid.

## Whitespace Handling

When binary answer is "Yes" or "Oo", the validation rejects:
- Empty strings: `""`
- Spaces: `"   "`
- Tabs: `"\t\t"`
- Newlines: `"\n\n"`
- Mixed whitespace: `" \t\n "`

Text with leading/trailing whitespace is accepted: `"  Valid text  "`

## Usage in Forms

### React Hook Form Example

```typescript
import { validateSuggestionField, isSuggestionRequired } from '@/lib/validation';

const { register, watch } = useForm();
const binaryAnswer = watch('projects_nfa_binary');

<textarea
  {...register('projects_nfa_suggestion', {
    validate: (value) => {
      const result = validateSuggestionField(binaryAnswer, value);
      return result.valid || result.error;
    }
  })}
  required={isSuggestionRequired(binaryAnswer)}
/>
```

### Dynamic Validation Example

```typescript
import { getSuggestionRequiredStatus } from '@/lib/validation';

function SurveyForm() {
  const [formData, setFormData] = useState({});
  
  const handleBinaryChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };
  
  const isRequired = getSuggestionRequiredStatus(
    formData,
    'projects_nfa_binary'
  );
  
  return (
    <div>
      <input
        type="radio"
        onChange={(e) => handleBinaryChange('projects_nfa_binary', e.target.value)}
      />
      <textarea required={isRequired} />
    </div>
  );
}
```

## Testing

Run tests with:
```bash
npm test -- src/lib/validation/__tests__/nfa-validation.test.ts
```

The test suite includes 77 tests covering:
- All validation functions
- Both English and Tagalog
- Edge cases and error conditions
- Whitespace handling
- Dynamic required logic

## Requirements Coverage

This module implements the following requirements:
- **1.3**: Binary question is always required
- **1.4**: Suggestion required when binary is "Yes"
- **1.5**: Suggestion optional when binary is "No"
- **6.4**: Validation checks current state of binary answer
- **6.5**: Whitespace-only suggestions invalid when binary is "Yes"
