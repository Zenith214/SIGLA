import type { Question } from "@/types/survey"
import { 
  createUnawarenessReasonQuestion, 
  createNonAvailmentReasonQuestion,
  detectLanguage 
} from "./conditionalQuestions"
import { getQuestionsWithConditionals } from "./questionsWithConditionals"

export function getQuestionsForSection(sectionId: string): Question[] {
  // For now, use the original questions with conditional modules integrated
  // The getQuestionsWithConditionals is incomplete, so we'll use the working version
  return getOriginalQuestionsForSection(sectionId);
}

function getOriginalQuestionsForSection(sectionId: string): Question[] {
  // Define a generic placeholder question
  const placeholderQuestion: Question = {
    id: "placeholderQuestion",
    type: "text",
    question: "This section's questions are temporarily reset. Please enter any text here.",
    required: false,
  };

  // Helper to format question text with italicized English and extract part header
  const formatQuestionText = (text: string): { question: string; partHeader?: string } => {
    let partHeader: string | undefined;
    let questionContent = text;

    // Attempt to find a part header (e.g., "A. Part Title:") followed by a newline
    const firstNewlineIndex = text.indexOf('\n');
    if (firstNewlineIndex !== -1) {
      const potentialHeaderLine = text.substring(0, firstNewlineIndex);
      // Check if this line looks like a part header (e.g., "A. Some Title")
      const headerPattern = /^([A-Z]\.\s[^:]+)(:)?\s*$/; // Matches "A. Title" or "A. Title:"
      const headerMatch = potentialHeaderLine.match(headerPattern);

      if (headerMatch) {
        partHeader = `<strong>${headerMatch[1]}</strong>`; // Capture "A. Part Title"
        questionContent = text.substring(firstNewlineIndex + 1); // The rest is the question content
      }
    }

    // Format English part with italics for the question content
    const parts = questionContent.split(' / ');
    let formattedQuestion = parts[0];
    if (parts.length > 1) {
      formattedQuestion += ` / <em>${parts.slice(1).join(' / ')}</em>`;
    }

    return { question: formattedQuestion, partHeader };
  };

  switch (sectionId) {
    case "financial":
      return [
        // Part A: Mga Proyekto ng Barangay (Kalsada, Barangay Hall, Health Station, atbp.)
        {
          id: "awarenessProjects",
          type: "radio",
          ...formatQuestionText("A. Mga Proyekto ng Barangay (Kalsada, Barangay Hall, Health Station, atbp.)\n1. KAALAMAN:\nAlam mo ba na ginamit ng barangay ang pondo nito para sa mga proyektong konstruksyon ngayong taon, tulad ng pagpapaganda ng mga kalsada o pagtatayo ng mga pasilidad? / Are you aware that the barangay has used its funds for construction projects this year, like improving roads or building facilities?"),
          options: ["Oo", "Hindi"],
          required: true,
          conditionalNext: [
            { value: "Hindi", skipToId: "projects_unawareness_reason" } // Skip to unawareness module
          ]
        },
        // Unawareness Reason Module for Projects
        createUnawarenessReasonQuestion("projects", "awarenessProjects", "filipino", undefined, "financial"),
        {
          id: "benefitedProjects",
          type: "radio",
          ...formatQuestionText("2. PAGGAMIT / PAGBENEPISYO:\nIkaw ba ay personal na nakakita, gumamit, o nakinabang sa alinman sa mga proyektong ito? / Have you personally seen, used, or benefited from any of these new projects?"),
          options: ["Oo", "Hindi"],
          required: true,
          dependsOn: "awarenessProjects",
          dependsOnValue: "Oo",
          conditionalNext: [
            { value: "Hindi", skipToId: "projects_non_availment_reason" } // Skip to non-availment module
          ]
        },
        // Non-Availment Reason Module for Projects
        createNonAvailmentReasonQuestion("projects", "awarenessProjects", "benefitedProjects", "filipino", "financial"),
        {
          id: "satisfactionProjects",
          type: "radio",
          ...formatQuestionText("3. KASIYAHAN:\nNasisiyahan ka ba sa kalidad at pakinabang ng mga bagong proyekto ng barangay? / Are you satisfied with the quality and usefulness of these new barangay projects?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "benefitedProjects",
          dependsOnValue: "Oo",
        },
        {
          id: "nfaBinaryProjects",
          type: "radio",
          ...formatQuestionText("4. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Oo", "Hindi"],
          required: true,
          dependsOn: "benefitedProjects",
          dependsOnValue: "Oo",
        },
        {
          id: "suggestionsProjects",
          type: "textarea",
          ...formatQuestionText("5. MUNGKAHI:\nAno ang iyong mga partikular na komento o mungkahi tungkol sa mga proyektong konstruksyon ng barangay? (hal., lokasyon, kalidad, ano pa ang dapat itayo?) / What are your specific comments or suggestions about the barangay's construction projects? (e.g., location, quality, what should be built next?)"),
          required: false,
          dependsOn: "nfaBinaryProjects",
          dependsOnValue: "Oo",
        },

        // Part B: Pananalaping Kaalaman at Transparency (Mga Paskil at Asembleya)
        {
          id: "awarenessFinancial",
          type: "radio",
          ...formatQuestionText("B. Pananalaping Kaalaman at Transparency (Mga Paskil at Asembleya):\n5. KAALAMAN:\nAlam mo ba na ang barangay ay kailangang magpaskil ng badyet at gastusin nito sa isang pampublikong bulletin board (Full Disclosure Board) at talakayin ito sa mga Barangay Assembly? / Are you aware that the barangay is supposed to post its budget and expenses on a public bulletin board (Full Disclosure Board) and discuss them during Barangay Assemblies?"),
          options: ["Oo", "Hindi"],
          required: true,
          conditionalNext: [
            { value: "Hindi", skipToId: "financial_unawareness_reason" } // Skip to unawareness module
          ]
        },
        // Unawareness Reason Module for Financial Transparency
        createUnawarenessReasonQuestion("financial", "awarenessFinancial", "filipino", undefined, "financial"),
        {
          id: "usedFinancialInfo",
          type: "radio",
          ...formatQuestionText("6. PAGGAMIT / PAGDALO:\nIkaw ba ay personal na nagsikap hanapin ang impormasyong ito o dumalo sa isang Barangay Assembly kung saan tinalakay ang badyet? / Have you personally tried to look for this information or attended a Barangay Assembly where the budget was discussed?"),
          options: ["Oo", "Hindi"],
          required: true,
          dependsOn: "awarenessFinancial",
          dependsOnValue: "Oo",
          conditionalNext: [
            { value: "Hindi", skipToId: "financial_non_availment_reason" } // Skip to non-availment module
          ]
        },
        // Non-Availment Reason Module for Financial Transparency
        createNonAvailmentReasonQuestion("financial", "awarenessFinancial", "usedFinancialInfo", "filipino", "financial"),
        {
          id: "satisfactionFinancial",
          type: "radio",
          ...formatQuestionText("7. KASIYAHAN:\nNasisiyahan ka ba sa kalinawan at kadaling makuha ng impormasyong pinansyal ng barangay? / Are you satisfied with the clarity and accessibility of the barangay's financial information?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "usedFinancialInfo",
          dependsOnValue: "Oo",
        },
        {
          id: "nfaBinaryFinancial",
          type: "radio",
          ...formatQuestionText("8. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Oo", "Hindi"],
          required: true,
          dependsOn: "usedFinancialInfo",
          dependsOnValue: "Oo",
        },
        {
          id: "suggestionsFinancial",
          type: "textarea",
          ...formatQuestionText("9. MUNGKAHI:\nAno ang maaaring gawin ng barangay upang mas madaling maunawaan at makuha ng mga residente ang badyet at gastusin nito? / What can the barangay do to make its budget and spending easier for residents to understand and access?"),
          required: false,
          dependsOn: "nfaBinaryFinancial",
          dependsOnValue: "Oo",
        },

        // Part C: Mga Programang Panlipunan (Tulong sa Seniors/PWDs, Aktibidad para sa Kabataan, atbp.)
        {
          id: "awarenessSocialPrograms",
          type: "radio",
          ...formatQuestionText("C. Mga Programang Panlipunan (Tulong sa Seniors/PWDs, Aktibidad para sa Kabataan, atbp.):\n9. KAALAMAN:\nAlam mo ba na ang barangay ay naglalaan ng pondo para sa mga programang panlipunan, tulad ng tulong pinansyal para sa mga Senior Citizen at PWDs, o mga aktibidad para sa kabataan (SK)? / Are you aware that the barangay allocates funds for social programs, such as financial assistance for Senior Citizens and PWDs, or activities for the youth (SK)?"),
          options: ["Oo", "Hindi"],
          required: true,
          conditionalNext: [
            { value: "Hindi", skipToId: "socialPrograms_unawareness_reason" } // Skip to unawareness module
          ]
        },
        // Unawareness Reason Module for Social Programs
        createUnawarenessReasonQuestion("socialPrograms", "awarenessSocialPrograms", "filipino", undefined, "financial"),
        {
          id: "participatedSocialPrograms",
          type: "radio",
          ...formatQuestionText("10. PAGGAMIT / PAGLAHOK:\nIkaw ba, isang kapamilya, o malapit na kapitbahay ay nagtangkang makinabang o lumahok sa alinman sa mga programang ito? / Have you, a family member, or a close neighbor tried to avail of or participate in any of these programs?"),
          options: ["Oo", "Hindi"],
          required: true,
          dependsOn: "awarenessSocialPrograms",
          dependsOnValue: "Oo",
          conditionalNext: [
            { value: "Hindi", skipToId: "socialPrograms_non_availment_reason" } // Skip to non-availment module
          ]
        },
        // Non-Availment Reason Module for Social Programs
        createNonAvailmentReasonQuestion("socialPrograms", "awarenessSocialPrograms", "participatedSocialPrograms", "filipino", "financial"),
        {
          id: "satisfactionSocialPrograms",
          type: "radio",
          ...formatQuestionText("11. KASIYAHAN:\nBatay sa iyong karanasan o obserbasyon, nasisiyahan ka ba sa paghahatid at epekto ng mga programang panlipunan ng barangay? / Based on your experience or observation, are you satisfied with the delivery and impact of these social programs?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "participatedSocialPrograms",
          dependsOnValue: "Oo",
        },
        {
          id: "nfaBinarySocialPrograms",
          type: "radio",
          ...formatQuestionText("12. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Oo", "Hindi"],
          required: true,
          dependsOn: "participatedSocialPrograms",
          dependsOnValue: "Oo",
        },
        {
          id: "suggestionsSocialPrograms",
          type: "textarea",
          ...formatQuestionText("13. MUNGKAHI:\nAno ang iyong mungkahi para mapabuti ang mga programang panlipunan ng barangay? Mayroon pa bang ibang uri ng tulong na kailangan? / What are your suggestions for improving the barangay's social programs? Are there other types of assistance that are needed?"),
          required: false,
          dependsOn: "nfaBinarySocialPrograms",
          dependsOnValue: "Oo",
        },

        // Part D: Perception of Corruption
        // SPECIAL CASE: This section uses custom skip logic, NOT the standard conditional modules
        {
          id: "awarenessCorruption",
          type: "radio",
          ...formatQuestionText("D. Perception of Corruption:\n13. KAALAMAN:\nAlam ba ninyo kung may mga patakaran at proseso laban sa korapsyon sa ating barangay o bayan, at na ang mga opisyal ay dapat maglingkod nang tapat? / Are you aware that our barangay or municipality is expected to follow rules and processes to prevent corruption, and that officials should serve with integrity?"),
          options: ["Oo (Yes)", "Hindi (No)"],
          required: true,
          // No skip - always proceed to Q14
        },
        {
          id: "experiencedCorruption",
          type: "radio",
          ...formatQuestionText("14. KARANASAN:\nSa nakalipas na 12 buwan, kayo ba (o sinumang miyembro ng inyong pamilya) ay nakaranas o nakasaksi ng anumang gawain ng opisyal o kawani ng barangay o bayan na maituturing ninyong uri ng korapsyon? / In the past 12 months, did you (or any of your household members) experience or witness any action by a barangay or municipal official/staff that you consider a form of corruption?"),
          options: ["Oo (Yes)", "Hindi (No)"],
          required: true,
          // No dependsOn - always shown after Q13
          conditionalNext: [
            { value: "Hindi (No)", skipToId: "suggestionsCorruption" } // Skip Q15-18, go directly to Q19
          ]
        },
        {
          id: "detailsCorruption",
          type: "textarea",
          ...formatQuestionText("15. MGA DETALYE NG KARANASAN:\nAno ang partikular na gawain na inyong naranasan o nasaksihan? (Pakilagay ang partikular na serbisyo o sitwasyon. Tiyakin na ito ay unang karanasan mula sa inyo o miyembro ng inyong pamilya.) / What specific action or practice did you experience or witness? (Please specify the service or situation. This must be a first-hand experience from you or a household member.)"),
          required: true,
          dependsOn: "experiencedCorruption",
          dependsOnValue: "Oo (Yes)",
        },
        {
          id: "reportedCorruption",
          type: "radio",
          ...formatQuestionText("16. PAG-UULAT:\nIdinulog ba ninyo ang inyong naranasan o nasaksihan sa alinmang awtoridad sa pamahalaan? / Did you report your experience to any government authority?"),
          options: ["Oo (Yes)", "Hindi (No)"],
          required: true,
          dependsOn: "experiencedCorruption",
          dependsOnValue: "Oo (Yes)",
          // No conditionalNext - let the dependsOn logic handle Q17/Q18
        },
        {
          id: "reasonsNotReporting",
          type: "checkbox",
          ...formatQuestionText("17. MGA DAHILAN NG HINDI PAG-UULAT:\nAno ang pangunahing dahilan kung bakit hindi ninyo iniulat? / What was the main reason you did not report the incident?"),
          options: [
            "Ginagawa rin ito ng iba o ng karamihan. (Everyone is doing it)", 
            "Normal o SOP na itong gawain. (This has become a normal practice)", 
            "Natakot akong magsumbong. (I feared for my safety)", 
            "Nakapagbilis ito ng transaksyon. (It made the process faster/easier)", 
            "Walang mangyayari kung i-uulat. (Reporting would not solve the problem)", 
            "Wala namang dahilan. (No reason)", 
            "Iba pa (Other)"
          ],
          required: false,
          dependsOn: "reportedCorruption",
          dependsOnValue: "Hindi (No)",
          followUpQuestions: [
            {
              id: "reasonsNotReporting_other",
              type: "textarea",
              question: "Please specify:",
              required: (formData: any) => {
                const mainAnswer = formData["reasonsNotReporting"];
                // Check if "Other" is selected in the checkbox array
                return Array.isArray(mainAnswer) && (
                  mainAnswer.includes("Iba pa (Other)") ||
                  mainAnswer.includes("Laing rason (Other)") ||
                  mainAnswer.includes("Other")
                );
              },
              dependsOn: "reasonsNotReporting",
              dependsOnValue: "Iba pa (Other)" // This will be checked differently for checkbox
            }
          ]
        },
        {
          id: "satisfactionReportResponse",
          type: "radio",
          ...formatQuestionText("18. KASIYAHAN SA TUGON:\nKung iniulat ninyo, tumugon ba ang mga awtoridad sa inyong reklamo at nasiyahan ba kayo sa naging tugon? / If you reported it, did the authorities respond to your complaint, and how satisfied were you with their action?"),
          options: ["5 - Lubos na Nasiyahan (Very Satisfied)", "4 - Nasiyahan (Satisfied)", "3 - Neutral (Neutral)", "2 - Hindi Nasiyahan (Dissatisfied)", "1 - Lubos na Hindi Nasiyahan (Very Dissatisfied)"],
          required: true,
          dependsOn: "reportedCorruption",
          dependsOnValue: "Oo (Yes)",
        },
        {
          id: "suggestionsCorruption",
          type: "textarea",
          ...formatQuestionText("19. MUNGKAHI:\nAno ang inyong mungkahi para mas maiwasan o masugpo ang korapsyon sa ating barangay o bayan? / What are your suggestions to better prevent or address corruption in our barangay or municipality?"),
          required: false,
          // No dependsOn - always shown to everyone who reaches this point
        },
      ];

    case "disaster":
      return [
        // Part A: Disaster Information and Early Warning
        {
          id: "awarenessDisasterInfo",
          type: "radio",
          ...formatQuestionText("A. Disaster Information and Early Warning:\n1. AWARENESS:\nAre you aware that the barangay has plans and systems to inform residents about potential risks (like flood-prone areas) and to give warnings before a disaster strikes? / Are you aware that the barangay has plans and systems to inform residents about potential risks (like flood-prone areas) and to give warnings before a disaster strikes?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "disasterInfo_unawareness_reason" } // Skip to unawareness module
          ]
        },
        // Unawareness Reason Module for Disaster Information
        createUnawarenessReasonQuestion("disasterInfo", "awarenessDisasterInfo", "english", undefined, "disaster"),
        {
          id: "availmentDisasterInfo",
          type: "radio",
          ...formatQuestionText("2. AVAILMENT / EXPERIENCE:\nHave you personally received any disaster-related information (like a pamphlet or text), seen a hazard map for our area, or heard an early warning (e.g., from a siren, megaphone, or barangay official) from the barangay? / Have you personally received any disaster-related information (like a pamphlet or text), seen a hazard map for our area, or heard an early warning (e.g., from a siren, megaphone, or barangay official) from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessDisasterInfo",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "disasterInfo_non_availment_reason" } // Skip to non-availment module
          ]
        },
        // Non-Availment Reason Module for Disaster Information
        createNonAvailmentReasonQuestion("disasterInfo", "awarenessDisasterInfo", "availmentDisasterInfo", "english", "disaster"),
        {
          id: "satisfactionDisasterInfo",
          type: "radio",
          ...formatQuestionText("3. SATISFACTION:\nAre you satisfied with the clarity, timeliness, and effectiveness of the disaster warnings and information provided by the barangay? / Nasisiyahan ka ba sa kalinawan, pagiging napapanahon, at bisa ng mga babala at impormasyon tungkol sa sakuna mula sa barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentDisasterInfo",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryDisasterInfo",
          type: "radio",
          ...formatQuestionText("4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentDisasterInfo",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsDisasterInfo",
          type: "textarea",
          ...formatQuestionText("5. SUGGESTION:\nHow could the barangay improve the way it informs and warns residents about disasters? / How could the barangay improve the way it informs and warns residents about disasters?"),
          required: false,
          dependsOn: "nfaBinaryDisasterInfo",
          dependsOnValue: "Yes",
        },

        // Part B: Evacuation and Emergency Response Resources
        {
          id: "awarenessEvacuation",
          type: "radio",
          ...formatQuestionText("B. Evacuation and Emergency Response Resources:\n5. AWARENESS:\nAre you aware that the barangay has a designated evacuation center and should have emergency equipment and a response team ready for disasters? / Are you aware that the barangay has a designated evacuation center and should have emergency equipment and a response team ready for disasters?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "evacuation_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("evacuation", "awarenessEvacuation", "english", undefined, "disaster"),
        {
          id: "locationEvacuation",
          type: "radio",
          ...formatQuestionText("6. AVAILMENT / EXPERIENCE:\nDo you know the location of the main designated evacuation center for your specific area or purok? / Do you know the location of the main designated evacuation center for your specific area or purok?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessEvacuation",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "evacuation_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("evacuation", "awarenessEvacuation", "locationEvacuation", "english", "disaster"),
        {
          id: "satisfactionEvacuation",
          type: "radio",
          ...formatQuestionText("7. SATISFACTION:\nBased on what you know or have seen, are you confident and satisfied with the readiness of our barangay's evacuation facilities and emergency response capabilities (e.g., rescue team, equipment)? / Batay sa iyong nalalaman o nakita, nagtitiwala at nasisiyahan ka ba sa paghahanda ng ating barangay sa mga pasilidad ng ebakwasyon at kakayahan sa pagtugon sa emerhensya?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "locationEvacuation",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryEvacuation",
          type: "radio",
          ...formatQuestionText("8. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "locationEvacuation",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsEvacuation",
          type: "textarea",
          ...formatQuestionText("9. SUGGESTION:\nWhat are your suggestions for improving our evacuation centers or the barangay's ability to respond during an emergency? / What are your suggestions for improving our evacuation centers or the barangay's ability to respond during an emergency?"),
          required: false,
          dependsOn: "nfaBinaryEvacuation",
          dependsOnValue: "Yes",
        },
      ];

    case "safety":
      return [
        // Part A: General Safety and Barangay Tanod (Peacekeeper) Services
        {
          id: "awarenessTanods",
          type: "radio",
          ...formatQuestionText("A. General Safety and Barangay Tanod (Peacekeeper) Services\n1. AWARENESS:\nAre you aware that the barangay has Tanods (peacekeepers) responsible for patrolling the community and responding to safety concerns? / Are you aware that the barangay has Tanods (peacekeepers) responsible for patrolling the community and responding to safety concerns?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "tanods_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("tanods", "awarenessTanods", "english", undefined, "safety"),
        {
          id: "experienceTanods",
          type: "radio",
          ...formatQuestionText("2. AVAILMENT / EXPERIENCE:\nHave you personally seen the Tanods on patrol in your area or had to interact with them for a peace and order concern? / Have you personally seen the Tanods on patrol in your area or had to interact with them for a peace and order concern?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessTanods",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "tanods_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("tanods", "awarenessTanods", "experienceTanods", "english", "safety"),
        {
          id: "satisfactionTanods",
          type: "radio",
          ...formatQuestionText("3. SATISFACTION:\nAre you satisfied with the visibility, responsiveness, and effectiveness of our Barangay Tanods in keeping the community safe? / Nasisiyahan ka ba sa pagkakatanaw, pagtugon, at bisa ng ating mga Barangay Tanod sa pagpapanatiling ligtas ng komunidad?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "experienceTanods",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryTanods",
          type: "radio",
          ...formatQuestionText("4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "experienceTanods",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsTanods",
          type: "textarea",
          ...formatQuestionText("5. SUGGESTION:\nWhat are your suggestions for improving the overall safety in our barangay or the performance of our Tanods? / What are your suggestions for improving the overall safety in our barangay or the performance of our Tanods?"),
          required: false,
          dependsOn: "nfaBinaryTanods",
          dependsOnValue: "Yes",
        },

        // Part B: Community Dispute Resolution (Lupon)
        {
          id: "awarenessLupon",
          type: "radio",
          ...formatQuestionText("B. Community Dispute Resolution (Lupon)\n5. AWARENESS:\nAre you aware that the barangay has a mediation service (Lupong Tagapamayapa) to help settle disputes between residents, like disagreements with neighbors? / Are you aware that the barangay has a mediation service (Lupong Tagapamayapa) to help settle disputes between residents, like disagreements with neighbors?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "lupon_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("lupon", "awarenessLupon", "english", undefined, "safety"),
        {
          id: "experienceLupon",
          type: "radio",
          ...formatQuestionText("6. AVAILMENT / EXPERIENCE:\nHave you, a family member, or someone you know ever used this service to help settle a dispute? / Have you, a family member, or someone you know ever used this service to help settle a dispute?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessLupon",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "lupon_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("lupon", "awarenessLupon", "experienceLupon", "english", "safety"),
        {
          id: "satisfactionLupon",
          type: "radio",
          ...formatQuestionText("7. SATISFACTION:\nBased on your experience or what you've heard, are you satisfied with the fairness and effectiveness of the barangay's dispute settlement process? / Batay sa iyong karanasan o narinig, nasisiyahan ka ba sa katarungan at bisa ng proseso ng paglutas ng alitan ng barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "experienceLupon",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryLupon",
          type: "radio",
          ...formatQuestionText("8. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "experienceLupon",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsLupon",
          type: "textarea",
          ...formatQuestionText("9. SUGGESTION:\nDo you have any suggestions on how the barangay can better help residents resolve conflicts peacefully? / Do you have any suggestions on how the barangay can better help residents resolve conflicts peacefully?"),
          required: false,
          dependsOn: "nfaBinaryLupon",
          dependsOnValue: "Yes",
        },

        // Part C: Anti-Illegal Drug Programs
        {
          id: "awarenessAntiDrug",
          type: "radio",
          ...formatQuestionText("C. Anti-Illegal Drug Programs\n9. AWARENESS:\nAre you aware that the barangay is involved in programs to combat illegal drugs, including information campaigns and referral systems for rehabilitation? / Are you aware that the barangay is involved in programs to combat illegal drugs, including information campaigns and referral systems for rehabilitation?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "antiDrug_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("antiDrug", "awarenessAntiDrug", "english", undefined, "safety"),
        {
          id: "experienceAntiDrug",
          type: "radio",
          ...formatQuestionText("10. AVAILMENT / EXPERIENCE:\nHave you personally seen or received any information (like a poster, leaflet, or talk) from the barangay's anti-drug campaign? / Have you personally seen or received any information (like a poster, leaflet, or talk) from the barangay's anti-drug campaign?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessAntiDrug",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "antiDrug_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("antiDrug", "awarenessAntiDrug", "experienceAntiDrug", "english", "safety"),
        {
          id: "satisfactionAntiDrug",
          type: "radio",
          ...formatQuestionText("11. SATISFACTION:\nAre you satisfied with the barangay's overall efforts to address the issue of illegal drugs within our community? / Nasisiyahan ka ba sa pangkalahatang pagsisikap ng barangay na tugunan ang isyu ng ilegal na droga sa ating komunidad?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "experienceAntiDrug",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryAntiDrug",
          type: "radio",
          ...formatQuestionText("12. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "experienceAntiDrug",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsAntiDrug",
          type: "textarea",
          ...formatQuestionText("13. SUGGESTION:\nWhat are your specific comments or suggestions regarding the barangay's anti-drug programs and initiatives? / What are your specific comments or suggestions regarding the barangay's anti-drug programs and initiatives?"),
          required: false,
          dependsOn: "nfaBinaryAntiDrug",
          dependsOnValue: "Yes",
        },
      ];
    case "social":
      return [
        // Part A: Barangay Health Services
        {
          id: "awarenessHealthServices",
          type: "radio",
          ...formatQuestionText("A. Barangay Health Services\n1. AWARENESS:\nAre you aware that the barangay has a Health Station/Center with personnel like Barangay Health Workers (BHWs) who provide services such as check-ups and immunization? / Are you aware that the barangay has a Health Station/Center with personnel like Barangay Health Workers (BHWs) who provide services such as check-ups and immunization?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "healthServices_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("healthServices", "awarenessHealthServices", "english", undefined, "social"),
        {
          id: "availmentHealthServices",
          type: "radio",
          ...formatQuestionText("2. AVAILMENT / EXPERIENCE:\nHave you or a member of your family ever visited the Barangay Health Station or received a service from a BHW? / Have you or a member of your family ever visited the Barangay Health Station or received a service from a BHW?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessHealthServices",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "healthServices_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("healthServices", "awarenessHealthServices", "availmentHealthServices", "english", "social"),
        {
          id: "satisfactionHealthServices",
          type: "radio",
          ...formatQuestionText("3. SATISFACTION:\nAre you satisfied with the quality, availability, and staff service at our Barangay Health Station? / Nasisiyahan ka ba sa kalidad, pagkakaroon, at serbisyo ng kawani sa ating Barangay Health Station?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentHealthServices",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryHealthServices",
          type: "radio",
          ...formatQuestionText("4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentHealthServices",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsHealthServices",
          type: "textarea",
          ...formatQuestionText("5. SUGGESTION:\nWhat are your suggestions for improving the health services in our barangay? (e.g., more services, better hours, staff training) / What are your suggestions for improving the health services in our barangay? (e.g., more services, better hours, staff training)"),
          required: false,
          dependsOn: "nfaBinaryHealthServices",
          dependsOnValue: "Yes",
        },

        // Part B: Protection Services for Women and Children
        {
          id: "awarenessWomenChildrenProtection",
          type: "radio",
          ...formatQuestionText("B. Protection Services for Women and Children\n5. AWARENESS:\nAre you aware that the barangay has special programs and a dedicated desk (like the VAW Desk) to provide assistance and protection for women and children in distress? / Are you aware that the barangay has special programs and a dedicated desk (like the VAW Desk) to provide assistance and protection for women and children in distress?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "womenChildrenProtection_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("womenChildrenProtection", "awarenessWomenChildrenProtection", "english", undefined, "social"),
        {
          id: "availmentWomenChildrenProtection",
          type: "radio",
          ...formatQuestionText("6. AVAILMENT / EXPERIENCE:\nDo you know where or how someone in the community could get help from these services if they needed to? / Do you know where or how someone in the community could get help from these services if they needed to?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessWomenChildrenProtection",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "womenChildrenProtection_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("womenChildrenProtection", "awarenessWomenChildrenProtection", "availmentWomenChildrenProtection", "english", "social"),
        {
          id: "satisfactionWomenChildrenProtection",
          type: "radio",
          ...formatQuestionText("7. SATISFACTION:\nAre you confident and satisfied in the barangay's ability to provide a safe, confidential, and effective response to protect women and children? / Nagtitiwala at nasisiyahan ka ba sa kakayahan ng barangay na magbigay ng ligtas, kumpidensyal, at epektibong tugon upang protektahan ang mga kababaihan at bata?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentWomenChildrenProtection",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryWomenChildrenProtection",
          type: "radio",
          ...formatQuestionText("8. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentWomenChildrenProtection",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsWomenChildrenProtection",
          type: "textarea",
          ...formatQuestionText("9. SUGGESTION:\nWhat more can the barangay do to ensure the safety and well-being of women and children in our community? / What more can the barangay do to ensure the safety and well-being of women and children in our community?"),
          required: false,
          dependsOn: "nfaBinaryWomenChildrenProtection",
          dependsOnValue: "Yes",
        },

        // Part C: Community Participation and Development
        {
          id: "awarenessCommunityParticipation",
          type: "radio",
          ...formatQuestionText("C. Community Participation and Development\n9. AWARENESS:\nAre you aware that the barangay has programs for residents to get involved in the community, like a Kasambahay Desk for domestic helpers, or a Barangay Community Garden? / Are you aware that the barangay has programs for residents to get involved in the community, like a Kasambahay Desk for domestic helpers, or a Barangay Community Garden?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "communityParticipation_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("communityParticipation", "awarenessCommunityParticipation", "english", undefined, "social"),
        {
          id: "availmentCommunityParticipation",
          type: "radio",
          ...formatQuestionText("10. AVAILMENT / EXPERIENCE:\nHave you personally participated in, or seen other residents participating in, any of these community activities or services? / Have you personally participated in, or seen other residents participating in, any of these community activities or services?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessCommunityParticipation",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "communityParticipation_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("communityParticipation", "awarenessCommunityParticipation", "availmentCommunityParticipation", "english", "social"),
        {
          id: "satisfactionCommunityParticipation",
          type: "radio",
          ...formatQuestionText("11. SATISFACTION:\nAre you satisfied with the opportunities the barangay provides for residents to get involved in community life and development? / Nasisiyahan ka ba sa mga pagkakataong ibinibigay ng barangay para sa mga residente na makilahok sa buhay at pag-unlad ng komunidad?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentCommunityParticipation",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryCommunityParticipation",
          type: "radio",
          ...formatQuestionText("12. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentCommunityParticipation",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsCommunityParticipation",
          type: "textarea",
          ...formatQuestionText("13. MUNGKAHI:\nWhat kind of community programs or activities would you like the barangay to start or improve? / What kind of community programs or activities would you like the barangay to start or improve?"),
          required: false,
          dependsOn: "nfaBinaryCommunityParticipation",
          dependsOnValue: "Yes",
        },
      ];
    case "business":
      return [
        // Part A: Issuance of Barangay Clearance for Business
        {
          id: "awarenessBusinessClearance",
          type: "radio",
          ...formatQuestionText("A. Issuance of Barangay Clearance for Business\n1. AWARENESS:\nAre you aware that residents need to secure a Barangay Clearance from the barangay hall when starting a business or applying for certain permits (like building permits)? / Are you aware that residents need to secure a Barangay Clearance from the barangay hall when starting a business or applying for certain permits (like building permits)?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "businessClearance_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("businessClearance", "awarenessBusinessClearance", "english", undefined, "business"),
        {
          id: "availmentBusinessClearance",
          type: "radio",
          ...formatQuestionText("2. AVAILMENT / EXPERIENCE:\nHave you or a member of your household ever applied for a Barangay Business Clearance or a similar permit from our barangay? / Have you or a member of your household ever applied for a Barangay Business Clearance or a similar permit from our barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessBusinessClearance",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "businessClearance_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("businessClearance", "awarenessBusinessClearance", "availmentBusinessClearance", "english", "business"),
        {
          id: "satisfactionBusinessClearance",
          type: "radio",
          ...formatQuestionText("3. SATISFACTION:\nAre you satisfied with the overall process of getting the clearance, considering the speed of service, the fees, and the helpfulness of the staff? / Nasisiyahan ka ba sa pangkalahatang proseso ng pagkuha ng clearance, isinasaalang-alang ang bilis ng serbisyo, mga bayad, at pagiging matulungin ng kawani?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentBusinessClearance",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryBusinessClearance",
          type: "radio",
          ...formatQuestionText("4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentBusinessClearance",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsBusinessClearance",
          type: "textarea",
          ...formatQuestionText("5. SUGGESTION:\nWhat are your specific suggestions for making the process of getting business clearances or other permits from the barangay faster and easier? / What are your specific suggestions for making the process of getting business clearances or other permits from the barangay faster and easier?"),
          required: false,
          dependsOn: "nfaBinaryBusinessClearance",
          dependsOnValue: "Yes",
        },
      ];
    case "environmental":
      return [
        // Part A: Solid Waste Management (Garbage Collection & Segregation)
        {
          id: "awarenessWasteManagement",
          type: "radio",
          ...formatQuestionText("A. Solid Waste Management (Garbage Collection & Segregation)\n1. AWARENESS:\nAre you aware that the barangay has a solid waste management program, which includes rules for segregating your trash (e.g., biodegradable vs. non-biodegradable) and a system for garbage collection? / Are you aware that the barangay has a solid waste management program, which includes rules for segregating your trash (e.g., biodegradable vs. non-biodegradable) and a system for garbage collection?"),
          options: ["Yes", "No"],
          required: true,
          conditionalNext: [
            { value: "No", skipToId: "wasteManagement_unawareness_reason" }
          ]
        },
        createUnawarenessReasonQuestion("wasteManagement", "awarenessWasteManagement", "english", undefined, "environmental"),
        {
          id: "availmentWasteManagement",
          type: "radio",
          ...formatQuestionText("2. AVAILMENT / EXPERIENCE:\nDo you and your household actively follow the barangay's waste segregation rules and participate in the garbage collection system? / Do you and your household actively follow the barangay's waste segregation rules and participate in the garbage collection system?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "awarenessWasteManagement",
          dependsOnValue: "Yes",
          conditionalNext: [
            { value: "No", skipToId: "wasteManagement_non_availment_reason" }
          ]
        },
        createNonAvailmentReasonQuestion("wasteManagement", "awarenessWasteManagement", "availmentWasteManagement", "english", "environmental"),
        {
          id: "satisfactionWasteManagement",
          type: "radio",
          ...formatQuestionText("3. SATISFACTION:\nAre you satisfied with the barangay's overall solid waste management, considering the reliability of the collection schedule, the effectiveness of the segregation policy, and the general cleanliness of the community? / Nasisiyahan ka ba sa pangkalahatang pamamahala ng basura ng barangay, isinasaalang-alang ang pagiging maaasahan ng iskedyul ng koleksyon, bisa ng patakaran sa paghihiwalay, at pangkalahatang kalinisan ng komunidad?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentWasteManagement",
          dependsOnValue: "Yes",
        },
        {
          id: "nfaBinaryWasteManagement",
          type: "radio",
          ...formatQuestionText("4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay? / Based on your experience, do you believe this service needs improvement from the barangay?"),
          options: ["Yes", "No"],
          required: true,
          dependsOn: "availmentWasteManagement",
          dependsOnValue: "Yes",
        },
        {
          id: "suggestionsWasteManagement",
          type: "textarea",
          ...formatQuestionText("5. SUGGESTION:\nWhat are your specific comments or suggestions for improving garbage collection, recycling, or the overall cleanliness of our barangay? / What are your specific comments or suggestions for improving garbage collection, recycling, or the overall cleanliness of our barangay?"),
          required: false,
          dependsOn: "nfaBinaryWasteManagement",
          dependsOnValue: "Yes",
        },
      ];

    case "overall":
      return [
        {
          id: "overallSatisfaction",
          type: "radio",
          ...formatQuestionText("PART X: PANGKALAHATANG KATAGBAWAN (OVERALL SATISFACTION)\nM1: Overall Satisfaction\nSa pangkalahatan, kung iisipin ang lahat ng serbisyong ibinigay ng barangay sa nakalipas na 12 buwan, nasisiyahan ka ba? / Overall, thinking about all the services provided by the barangay in the past 12 months, are you satisfied?"),
          options: ["Yes", "No"],
          required: true,
        },
        {
          id: "overallNeedForAction",
          type: "radio",
          ...formatQuestionText("M2: Overall Need for Action\nSa iyong pangkalahatang pananaw, sa kabuuan, kailangan bang gumawa ng aksyon ang barangay para mapabuti ang mga serbisyo nito? / On the whole, would you say that the barangay's services, in general, need action for improvement?"),
          options: ["Yes", "No"],
          required: true,
        },
      ];

    default:
      return [{ id: "placeholderDefault", type: "text", question: "This section's questions are temporarily reset. Please enter any text here.", required: false }];
  }
}