Final Technical Specification: PULSE System v5.4 - Binary Logic Integration

### 1. OVERALL OBJECTIVE ###

This document specifies the final modifications to the SIGLA/PULSE survey form and analytics pipeline. The core task is to update the "Need for Action" component for all service indicators to a two-part format by adding a required binary question that controls the validation of the existing open-ended suggestion field. This change will propagate through the data storage schema, backend analysis algorithms, and the mock data generator.

### PART 1: SURVEY FORMS (PWA) - REQUIRED MODIFICATION ###

# 1.1. Action: Implement Two-Part "Need for Action" Logic for All Service Indicators

This change applies to every service indicator across all six service areas.

    Step 1: Add a New Binary Question.

        Placement: Insert a new question immediately before the existing open-ended "What are your specific comments or suggestions..." question.

        ID: [service_id]_nfa_binary (e.g., tanod_services_nfa_binary).

        Type: radio.

        Question Text (English): "Based on your experience, do you believe this service needs improvement from the barangay?"

        Options: ["Yes", "No"].

        Validation: This new binary question must be required: true.

    Step 2: Modify the Existing "Suggestion" Question's Validation Logic.

        Question Text: No change needed. The existing text ("What are your specific comments or suggestions...") remains the same.

        Conditional Validation (Situational Requirement): The required attribute of this existing text field must be made dynamic.

            It becomes required: true (the user cannot proceed without typing something) IF the answer to the new _nfa_binary question is "Yes."

            It remains required: false (optional, can be left blank) IF the answer to the new _nfa_binary question is "No."

### PART 2: BACKEND & DATA ARCHITECTURE - REQUIRED UPDATES ###

# 2.1. Update Data Storage Schema

    Action: The database and JSON objects must be updated to store both the binary answer and the text answer.

    Modification to survey_section Table (or section_data JSONB):

        For each service indicator, the data structure should now explicitly store both pieces of information.

        Structure:
        code JSON

            
        "tanod_services": {
          "satisfaction_rating": 4,
          "need_for_action_binary": "Yes", // Data from the new binary question
          "need_for_action_suggestion": "They need more training." // Data from the existing text question
        }

          

# 2.2. Update Backend Calculation Logic (Analytics API)

    Action: The backend algorithm that calculates the "Need for Action Rate %" must be updated.

    Logic: The calculation must now be a direct aggregation of the new need_for_action_binary field.

        Need for Action Rate % = (COUNT of records where 'need_for_action_binary' = 'Yes') / (TOTAL COUNT of records for that indicator) * 100

### PART 3: TESTING & DEVELOPMENT ENVIRONMENT - REQUIRED UPDATES ###

# 3.1. Update Mock Data Generator

    Action: The synthetic data generator must be updated to reflect the new conditional logic.

    New Generation Logic:

        First, randomly determine the value for need_for_action_binary ("Yes" or "No").

        Conditional Text Generation:

            If need_for_action_binary is "Yes": The generator MUST create a non-empty string for the need_for_action_suggestion field.

            If need_for_action_binary is "No": The generator should only populate the need_for_action_suggestion field occasionally (e.g., 10-15% of the time) with a neutral/positive comment or null.