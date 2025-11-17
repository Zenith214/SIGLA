Technical Specification: SIGLA System Upgrade to CSIS Digital Methodology (v4.0)

### 1. OVERALL OBJECTIVE ###

This document outlines the precise technical modifications required to upgrade the SIGLA Survey System to fully implement the methodology of the DILG's Citizen Satisfaction Index System (CSIS). The upgrade involves replacing custom logic with the official CSIS algorithms for survey flow and respondent selection, and repurposing existing features for quality control. This specification presumes the successful implementation of the Field Supervisor role, Spot-Based Workflow, and Multi-Visit/Callback features.

### 2. CORE LOGIC & ALGORITHM REPLACEMENT ###

This section details the critical code-level changes. All old logic must be deprecated and replaced with the following.

# 2.1. Algorithm A: Service Area Order Randomization (MAJOR OVERHAUL)

    File to Modify: src/app/survey/forms/utils/sectionAssignment.ts

    Action: The existing getServiceAreaOrder function, which returns only three sections, must be completely rewritten.

    New Logic:

        Data Structure: A hardcoded Map or Object must be created to serve as the master randomization key. It will map every integer from 1 to 150 to a starting section key. This data must replicate the official CSIS Annex I table.
        code TypeScript

            
        // Example structure for the randomization map
        const randomizationMap: Record<number, string> = {
          1: 'financial',
          2: 'disaster',
          3: 'social',
          // ... all 150 entries must be present
          87: 'safety',
          150: 'environmental'
        };

          

        Function Signature: function getSectionOrder(questionnaireNumber: number): string[]

        Implementation Steps:

            Define a constant array with the canonical order of all six section keys:
            const allSections = ["financial", "disaster", "social", "safety", "business", "environmental"];

            Look up the startingSectionKey from the randomizationMap using the questionnaireNumber.

            Find the index of the startingSectionKey within the allSections array.

            Create a new ordered array by slicing the allSections array from the startingSectionKey's index to the end, and concatenating it with a slice from the beginning of the array up to that index. This performs the "wrap-around" logic.

            Return the newly ordered array of all six section keys.

# 2.2. Algorithm B: CSIS Kish Grid Selection (MAJOR OVERHAUL)

    File to Modify: src/app/survey/forms/sections/respondent-selection.tsx (and any related utility files).

    Action: The current respondent selection logic using the modulo operator (%) must be completely removed.

    New Logic:

        Data Structure: A hardcoded 2D array (12 rows, 10 columns) representing the official CSIS Kish Grid table must be created in a utility file.
        code TypeScript

            
        // Kish Grid Matrix (12x10)
        const kishGridTable: number[][] = [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 2, 1, 1, 2, 2, 1, 1, 2, 2],
          // ... all 12 rows must be present
          [1, 3, 7, 5, 6, 4, 8, 10, 12, 9]
        ];

          

        Function Signature: function selectRespondent(questionnaireNumber: number, eligibleMembers: Member[]): Member

        Implementation Steps:

            Determine lookupColumn:

                let col = questionnaireNumber % 10;

                if (col === 0) { col = 10; }

            Determine lookupRow:

                let row = eligibleMembers.length;

                if (row > 12) { row = 12; } // The grid does not exceed 12 rows.

                If row === 0, throw an error or handle the "No Qualified Respondent" case.

            Perform Lookup:

                Retrieve the selectedIndexValue from the matrix: const selectedIndexValue = kishGridTable[row - 1][col - 1];

            Return Selected Member:

                Return the member from the eligibleMembers array at index selectedIndexValue - 1.

### 3. FRONTEND & WORKFLOW MODIFICATIONS ###

# 3.1. Questionnaire Type Deprecation (REFACTOR)

    Action: The concept of questionnaireType: 'odd' | 'even' is now redundant.

    Files to Modify:

        src/app/survey/forms/page.tsx: Remove questionnaireType from the SurveyData state interface.

        IndexedDB Structure: Remove the questionnaireType field from the stored surveyData object.

        respondent-selection.tsx: The logic for determining the required gender should not rely on a stored questionnaireType. It must perform the check on the fly:
        code TypeScript

            
        const isOdd = questionnaireNumber % 2 !== 0;
        const requiredGender = isOdd ? "Male" : "Female";

          

        API Endpoint POST /api/questionnaire-number: This endpoint should no longer return the type field.

# 3.2. Question Flow Component Update (REFACTOR)

    File to Modify: src/app/survey/forms/sections/question-flow.tsx and the main orchestrator page.tsx.

    Action: This component must now be able to handle navigating through all six service sections, not just three.

    Implementation:

        When the Question Flow component mounts, it should receive the fully reordered list of six section keys from the parent page.tsx (which would have called getSectionOrder).

        The progress tracking UI (QuestionProgressBar.tsx) must be updated to reflect the total number of sections (i.e., 6).

        The navigation logic (QuestionFlowNavigation.tsx) must correctly proceed from the end of one section to the beginning of the next in the randomized sequence, until all six are complete.

# 3.3. Geotagging Feature Repurposing (LOGIC CHANGE)

    Action: The purpose of GPS capture is shifted from initialization to verification.

    Files to Modify: src/app/survey/forms/sections/survey-initialization.tsx (and related components).

    New Workflow:

        The Survey Initialization step is now solely for generating the questionnaireNumber and creating the initial record in IndexedDB. The GPS capture should be removed from this initial step.

        The GPS capture logic (useGeotagging hook) should be triggered at a later point: when the FI confirms they are at the household and are about to start the Kish Grid process.

        The captured location data (lat, lng, timestamp, accuracy) must be saved as part of the main survey_response record.

    Backend/Supervisor Dashboard Enhancement:

        A new feature should be developed in the Supervisor Dashboard to support this. When viewing a submitted interview on the map, the dashboard should display two pins:

            Pin 1 (Blue): The pre-assigned Spot location.

            Pin 2 (Green): The actual GPS location captured during the interview.

        The system should automatically calculate and display the distance in meters between these two points. If the distance exceeds a configurable threshold (e.g., 200 meters), the entry should be automatically flagged for supervisor review.