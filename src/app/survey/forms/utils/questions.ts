import type { Question } from "../page"

export function getQuestionsForSection(sectionId: string): Question[] {
  switch (sectionId) {
    case "financial":
      return [
        {
          id: "financialTransparencyGroup",
          type: "grouped",
          question: "1. Posting of Financial Documents / Pagpapaskil ng mga Dokumentong Pampinansyal",
          mainQuestion:
            "Did the Barangay Treasurer quarterly post CY 2024 financial documents on the Barangay Full Disclosure Policy Board? / Ipinaskil ba ng Ingat-Yaman ng Barangay kada quarter ang mga dokumentong pampinansyal para sa CY 2024 sa Barangay Full Disclosure Policy Board?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "transparencySatisfaction",
              question:
                "How satisfied are you with the transparency of financial information? / Gaano ka nasiyahan sa pagiging bukas ng impormasyon tungkol sa pananalapi?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in financial transparency? / Sa tingin mo ba kailangang pagbutihin ang pagiging bukas ng pinansyal na impormasyon?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed? / Kung oo, anong tiyak na aksyon ang kinakailangan?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "constructionProjectsGroup",
          type: "grouped",
          question: "2. Allocation for Construction Projects / Paglalaan para sa mga Proyektong Konstruksiyon",
          mainQuestion:
            "Did the Barangay allocate funds and construct the following infrastructure projects in CY 2024? / Naglaan ba ng pondo at nagsagawa ng mga proyektong pang-imprastruktura ang Barangay para sa CY 2024?",
          mainOptions: [],
          followUpQuestions: [
            {
              id: "projectSatisfaction",
              question:
                "How satisfied are you with the implementation of these construction projects? / Gaano ka nasiyahan sa pagpapatupad ng mga proyektong ito?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in infrastructure planning or execution? / Sa tingin mo ba kailangang pagbutihin ang pagpaplano o pagpapatupad ng mga imprastruktura?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed? / Kung oo, anong tiyak na aksyon ang kinakailangan?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "drrmCenterGroup",
          type: "grouped",
          question: "3. DRRM Center",
          mainQuestion:
            "Did your Barangay establish a local Disaster Risk Reduction and Management (DRRM) Center? / Itinatag ba ng inyong Barangay ang isang lokal na Disaster Risk Reduction and Management (DRRM) Center?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "preparednesssatisfaction",
              question:
                "How satisfied are you with your Barangay's disaster preparedness efforts? / Gaano ka nasiyahan sa mga paghahanda ng inyong Barangay laban sa sakuna?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should disaster preparedness efforts be improved? / Sa tingin mo ba kailangan pang pagbutihin ang mga paghahanda sa sakuna?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "improvements",
              question:
                "If yes, what improvements do you suggest? / Kung oo, anong mga pagbabago ang iminumungkahi mo?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "vulnerableSectorsGroup",
          type: "grouped",
          question: "4. Trainings for Vulnerable Sectors / Pagsasanay para sa Mahihinang Sektor",
          mainQuestion:
            "Were there seminars or training programs held for women, solo parents, PWDs, or other vulnerable groups? / Nagsagawa ba ng mga seminar o pagsasanay para sa kababaihan, solong magulang, PWDs, o iba pang mahihinang sektor?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "trainingSatisfaction",
              question:
                "How satisfied are you with the support and training provided to these sectors? / Gaano ka nasiyahan sa suporta at mga pagsasanay para sa mga sektor na ito?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "moreTrainingNeeded",
              question:
                "Should there be more inclusive or targeted training sessions? / Sa tingin mo ba kailangan pa ng mas maraming angkop na pagsasanay?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "trainingSuggestions",
              question:
                "If yes, what kind of trainings do you suggest? / Kung oo, anong klaseng pagsasanay ang iminumungkahi mo?",
              type: "text",
              dependsOn: "moreTrainingNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "seniorPwdAssistanceGroup",
          type: "grouped",
          question: "5. Pension/Assistance to Senior Citizens and PWDs / Pensyon/Tulong sa mga Senior Citizens at PWDs",
          mainQuestion:
            "Did your Barangay provide local financial aid or support for Senior Citizens and PWDs? / Nagbigay ba ang Barangay ng lokal na tulong pinansyal o suporta sa mga Senior Citizens at PWDs?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "assistanceSatisfaction",
              question:
                "How satisfied are you with how this assistance was delivered? / Gaano ka nasiyahan sa pagbibigay ng tulong na ito?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "expandSupport",
              question:
                "Should this kind of support be expanded or improved? / Sa tingin mo ba dapat pa itong palawakin o pagbutihin?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "howToImprove",
              question: "If yes, how? / Kung oo, paano?",
              type: "text",
              dependsOn: "expandSupport",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "childDevelopmentGroup",
          type: "grouped",
          question: "6. Support for Child Development Center / Suporta sa Child Development Center",
          mainQuestion:
            "Did the Barangay support the local Child Development Center (Daycare)? / Nagbigay ba ng suporta ang Barangay sa lokal na Child Development Center (Daycare)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "daycareSatisfaction",
              question:
                "How satisfied are you with the services and support given to the Daycare? / Gaano ka nasiyahan sa mga serbisyo at suportang ibinigay sa Daycare?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improveDaycare",
              question:
                "Should Daycare support be improved? / Sa tingin mo ba kailangang pagbutihin ang suporta sa Daycare?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "daycareSuggestions",
              question: "If yes, what suggestions do you have? / Kung oo, anong mungkahi ang maaari mong ibigay?",
              type: "text",
              dependsOn: "improveDaycare",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "skActivitiesGroup",
          type: "grouped",
          question: "7. Activities for Sangguniang Kabataan (SK) / Mga Aktibidad para sa SK",
          mainQuestion:
            "Did SK and Barangay officials conduct youth programs like assemblies or sports events? / Nagsagawa ba ng mga programa para sa kabataan gaya ng asembleya o paligsahan ang SK at mga opisyal ng Barangay?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "skSatisfaction",
              question:
                "How satisfied are you with the SK's activities and initiatives? / Gaano ka nasiyahan sa mga aktibidad at inisyatibo ng SK?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "moreYouthActivities",
              question:
                "Should there be more youth-oriented activities in the community? / Sa tingin mo ba kailangan pa ng mas maraming aktibidad para sa kabataan?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "youthActivitySuggestions",
              question: "If yes, what activities do you suggest? / Kung oo, anong aktibidad ang iminumungkahi mo?",
              type: "text",
              dependsOn: "moreYouthActivities",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "citizensCharterGroup",
          type: "grouped",
          question: "8. Posting of Citizens' Charter / Pagpapaskil ng Citizens' Charter",
          mainQuestion:
            "Is the Barangay's Citizens' Charter clearly posted in a public place? / Ipinaskil ba nang malinaw ang Citizens' Charter ng Barangay sa isang pampublikong lugar?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "charterSatisfaction",
              question:
                "How satisfied are you with the visibility and clarity of the Citizens' Charter? / Gaano ka nasiyahan sa pagiging malinaw at lantad ng Citizens' Charter?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improveCharter",
              question:
                "Should the Charter be made more visible or updated? / Sa tingin mo ba dapat itong gawing mas lantad o baguhin?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "charterImprovements",
              question: "If yes, how? / Kung oo, paano?",
              type: "text",
              dependsOn: "improveCharter",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "barangayAssembliesGroup",
          type: "grouped",
          question: "9. Barangay Assemblies for CY 2024 / Mga Barangay Assembly para sa CY 2024",
          mainQuestion:
            "Were Barangay Assemblies held this year with community participation? / Nagsagawa ba ng Barangay Assemblies ngayong taon na may partisipasyon mula sa mga mamamayan?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "assemblySatisfaction",
              question:
                "How satisfied are you with the conduct of these assemblies? / Gaano ka nasiyahan sa pagsasagawa ng mga asembleya?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improveAssemblies",
              question:
                "Should assemblies be held more often or improved? / Sa tingin mo ba dapat gawing mas madalas o mas epektibo ang mga asembleya?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "assemblyChanges",
              question: "If yes, what changes do you suggest? / Kung oo, anong pagbabago ang iminumungkahi mo?",
              type: "text",
              dependsOn: "improveAssemblies",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "appropriationOrdinanceGroup",
          type: "grouped",
          question: "10. Barangay Appropriation Ordinance / Barangay Appropriation Ordinance",
          mainQuestion:
            "Was the Barangay Appropriation Ordinance approved on or before December 31, 2022? / Naaprubahan ba ang Barangay Appropriation Ordinance noong o bago ang Disyembre 31, 2022?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "budgetSatisfaction",
              question:
                "How satisfied are you with how the Barangay plans and manages its budget? / Gaano ka nasiyahan sa pagpaplano at pamamahala ng badyet ng Barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "participatoryBudget",
              question:
                "Should budget planning be more participatory or transparent? / Sa tingin mo ba dapat gawing mas bukas at may partisipasyon ang pagbabadyet?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "budgetImprovements",
              question: "If yes, how can it be improved? / Kung oo, paano ito mapapabuti?",
              type: "text",
              dependsOn: "participatoryBudget",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
      ]

    case "disaster":
      return [
        {
          id: "bdrrm-plan-group",
          type: "grouped",
          question: "1. Approved BDRRM Plan / Aprubadong BDRRM Plan",
          mainQuestion:
            "Is there an approved Barangay Disaster Risk Reduction and Management (BDRRM) Plan covering CY 2023, adopted by the Sangguniang Barangay? / Mayroon bang aprubadong Barangay Disaster Risk Reduction and Management (BDRRM) Plan para sa CY 2023 na inaprubahan ng Sangguniang Barangay?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "planSatisfaction",
              question:
                "How satisfied are you with the existence and approval of the BDRRM Plan? / Gaano ka nasisiyahan sa pagkakaroon at pag-apruba ng BDRRM Plan?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in disaster planning and approval processes? / Kailangan ba ng pagpapabuti sa pagpaplano at pag-apruba ng plano para sa sakuna?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bdrrm-fund-group",
          type: "grouped",
          question: "2. Allocation of BDRRM Fund / Paglalaan ng BDRRM Fund",
          mainQuestion:
            "Did the Barangay allocate at least 5% of the estimated revenue from regular sources as BDRRM Fund? / Naglaan ba ang Barangay ng hindi bababa sa 5% ng tinatayang kita mula sa regular na pinagkukunan bilang BDRRM Fund?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "budgetSatisfaction",
              question:
                "How satisfied are you with the budget allocation for disaster preparedness? / Gaano ka nasisiyahan sa alokasyon ng pondo para sa kahandaan sa sakuna?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in fund allocation? / Kailangan ba ng pagpapabuti sa paglalaan ng pondo?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "risk-assessment-group",
          type: "grouped",
          question: "3. Conduct of Risk Assessment Activity / Pagsasagawa ng Risk Assessment",
          mainQuestion:
            "Did the Barangay conduct an activity related to Risk Assessment not earlier than CY 2020? / Nagsagawa ba ang Barangay ng aktibidad kaugnay sa Risk Assessment simula CY 2020 o mas bago?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "assessmentSatisfaction",
              question:
                "How satisfied are you with the barangay's risk assessment efforts? / Gaano ka nasisiyahan sa mga aktibidad ng Barangay kaugnay sa Risk Assessment?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in conducting risk assessments? / Kailangan ba ng pagpapabuti sa pagsasagawa ng risk assessment?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "hazard-map-group",
          type: "grouped",
          question: "4. Risk/Hazard Map / Risk/Hazard Map",
          mainQuestion:
            "Does the Barangay have a Risk/Hazard Map indicating possible natural or man-made risks (e.g., flood-prone, landslide-prone areas)? / Mayroon bang Risk/Hazard Map ang Barangay na nagpapakita ng mga posibleng panganib na natural o gawa ng tao (hal. binabahang lugar, landslide-prone)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "mapSatisfaction",
              question:
                "How satisfied are you with the availability and accuracy of the risk/hazard map? / Gaano ka nasisiyahan sa pagkakaroon at kawastuhan ng risk/hazard map?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in mapping hazards and risks? / Kailangan ba ng pagpapabuti sa paggawa ng mapa para sa mga panganib?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "early-warning-group",
          type: "grouped",
          question: "5. Early Warning System (EWS) / Early Warning System",
          mainQuestion:
            "Does the Barangay have an established Early Warning System (EWS) for the top two (2) hazards present in the barangay? / Mayroong ba ang Barangay na nakatalagang Early Warning System (EWS) para sa dalawang pangunahing panganib sa kanilang lugar?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "ewsSatisfaction",
              question:
                "How satisfied are you with the functionality of the Early Warning System? / Gaano ka nasisiyahan sa kakayahan ng Early Warning System ng Barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in the EWS? / Kailangan ba ng pagpapabuti sa Early Warning System?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "evacuation-center-group",
          type: "grouped",
          question: "6. Evacuation Center / Evacuation Center",
          mainQuestion:
            "Does the Barangay have a permanent or temporary evacuation center? / Mayroon bang permanente o pansamantalang evacuation center ang Barangay?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "centerSatisfaction",
              question:
                "How satisfied are you with the accessibility and condition of the evacuation center? / Gaano ka nasisiyahan sa pagiging accessible at kondisyon ng evacuation center?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in evacuation infrastructure? / Kailangan ba ng pagpapabuti sa evacuation center?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "disaster-supplies-group",
          type: "grouped",
          question: "7. Availability of Disaster Supplies/Equipment / Pagkakaroon ng mga Gamit para sa Sakuna",
          mainQuestion:
            "Does the Barangay have the following disaster-related supplies and equipment? / Mayroon ba ang Barangay ng mga sumusunod na kagamitan para sa sakuna?",
          mainOptions: [],
          followUpQuestions: [
            {
              id: "suppliesSatisfaction",
              question:
                "How satisfied are you with the availability and condition of disaster supplies and equipment? / Gaano ka nasisiyahan sa pagkakaroon at kondisyon ng mga gamit para sa sakuna?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need for improvement in disaster preparedness supplies? / Kailangan ba ng pagpapabuti sa mga gamit para sa kahandaan sa sakuna?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what specific actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
      ]

    case "safety":
      return [
        {
          id: "rehabilitation-desk-group",
          type: "grouped",
          question: "1. Barangay Rehabilitation Referral Desk",
          mainQuestion:
            "Is there an established Barangay Rehabilitation Referral Desk with a designated Barangay Duty Officer? / May nakatalagang Barangay Rehabilitation Referral Desk ba na may Barangay Duty Officer?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "rehabilitationSatisfaction",
              question:
                "How satisfied are you with the barangay's drug rehabilitation efforts? / Gaano ka nasiyahan sa mga hakbang ng barangay ukol sa rehabilitasyon laban sa droga?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to improve drug rehabilitation programs? / Kailangan ba ng pagbutihin ang mga programang rehabilitasyon laban sa droga?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "house-cluster-group",
          type: "grouped",
          question: "2. House Cluster Organization",
          mainQuestion:
            "Has the Barangay organized House Clusters with designated House Cluster Leaders (HCLs)? / Nakabuo ba ang Barangay ng House Clusters na may itinalagang mga House Cluster Leaders (HCLs)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "organizationSatisfaction",
              question:
                "How satisfied are you with the community organization structure? / Gaano ka nasiyahan sa organisasyong pamayanan ng barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the organization of House Clusters be improved? / Kailangan bang pagbutihin ang organisasyon ng House Clusters?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "badac-auxiliary-group",
          type: "grouped",
          question: "3. BADAC Auxiliary Team",
          mainQuestion:
            "Has the Barangay organized a BADAC Auxiliary Team (BAT)? / Nakabuo ba ang Barangay ng BADAC Auxiliary Team (BAT)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "auxiliarySatisfaction",
              question:
                "How satisfied are you with the barangay's support team for anti-illegal drugs? / Gaano ka nasiyahan sa suporta ng barangay laban sa ilegal na droga?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is improvement in auxiliary team operations needed? / Kailangan ba ng pagbuti sa operasyon ng auxiliary team?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "badac-plan-group",
          type: "grouped",
          question: "4. BADAC Plan of Action",
          mainQuestion:
            "Has the Barangay formulated a BADAC Plan of Action (BADPA) covering CY 2023? / Mayroon bang BADAC Plan of Action (BADPA) ang Barangay para sa taong 2023?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "planningSatisfaction",
              question:
                "How satisfied are you with the barangay's anti-drug planning? / Gaano ka nasiyahan sa plano ng barangay laban sa droga?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question: "Does the plan need improvement? / Kailangan bang pagbutihin ang planong ito?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "anti-drug-funding-group",
          type: "grouped",
          question: "5. Funding for Anti-Illegal Drugs Initiatives",
          mainQuestion:
            "Did the Barangay allocate a substantial amount for anti-illegal drugs initiatives? / Naglaan ba ang Barangay ng sapat na pondo para sa mga programa laban sa ilegal na droga?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "fundingSatisfaction",
              question:
                "Are you satisfied with the budget allocation for these programs? / Nasiyahan ka ba sa inilaan na pondo para sa mga programang ito?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question: "Should funding be improved? / Kailangan bang dagdagan o ayusin ang pondo?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "advocacy-campaigns-group",
          type: "grouped",
          question: "6. Drug Abuse Prevention Advocacy Campaigns",
          mainQuestion:
            "Did the Barangay organize at least one IEC activity during CY 2023? / Nagsagawa ba ang Barangay ng kahit isang IEC activity noong 2023?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "awarenessSatisfaction",
              question:
                "How satisfied are you with public awareness efforts? / Gaano ka nasiyahan sa mga hakbang pangkaalaman ukol sa droga?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Do you think advocacy campaigns need strengthening? / Kailangan ba ng mas pinaigting na kampanya ukol dito?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "drug-clearing-group",
          type: "grouped",
          question: "7. Drug-Clearing Operations",
          mainQuestion:
            "Did the Barangay submit a Consolidated Information Report (CIR) to the CADAC/MADAC and local PNP unit as part of its drug-clearing operations? / Nagsumite ba ang Barangay ng Consolidated Information Report (CIR) sa CADAC/MADAC at lokal na PNP bilang bahagi ng mga operasyon kontra droga?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "clearingSatisfaction",
              question:
                "How satisfied are you with the drug-clearing efforts of the Barangay? / Gaano ka nasiyahan sa mga hakbang ng Barangay laban sa droga?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should drug-clearing operations be enhanced? / Kailangan bang paigtingin ang mga operasyon kontra droga?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "pwud-intervention-group",
          type: "grouped",
          question: "8. Community-Based Intervention for PWUDs",
          mainQuestion:
            "Is there a referral system for the community-based intervention of Persons Who Used Drugs (PWUDs)? / May referral system ba ang Barangay para sa community-based intervention ng mga dating gumamit ng ipinagbabawal na gamot (PWUDs)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "referralSatisfaction",
              question:
                "How satisfied are you with the referral and rehabilitation support provided? / Gaano ka nasiyahan sa suporta ng Barangay sa pagbabagong-buhay ng mga PWUDs?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question: "Should the referral system be improved? / Kailangan bang pagbutihin ang referral system?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bpops-plan-group",
          type: "grouped",
          question: "9. BPOPS Plan",
          mainQuestion:
            "Has the Barangay formulated a Barangay Peace and Order and Public Safety (BPOPS) Plan in accordance with DILG MC 2017-142, covering CY 2023? / May BPOPS Plan ba ang Barangay alinsunod sa DILG MC 2017-142 para sa taong 2023?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "safetyPlanningSatisfaction",
              question:
                "How satisfied are you with the barangay's safety and peace planning? / Gaano ka nasiyahan sa plano ng Barangay ukol sa kapayapaan at kaayusan?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the BPOPS Plan be improved or updated? / Kailangan bang pagbutihin o i-update ang BPOPS Plan?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "lupong-tagapamayapa-group",
          type: "grouped",
          question: "10. Organization of Lupong Tagapamayapa",
          mainQuestion:
            "Has the Barangay organized a Lupong Tagapamayapa? / Naorganisa na ba ng Barangay ang Lupong Tagapamayapa?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "conflictResolutionSatisfaction",
              question:
                "How satisfied are you with the barangay's conflict resolution mechanisms? / Gaano ka nasiyahan sa mekanismo ng barangay sa paglutas ng alitan?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Does the barangay need to strengthen its Lupong Tagapamayapa? / Kailangan bang palakasin ang Lupong Tagapamayapa?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "kp-meetings-group",
          type: "grouped",
          question: "11. Katarungang Pambarangay Meetings",
          mainQuestion:
            "Did the Barangay conduct monthly meetings for the administration of the Katarungang Pambarangay? / Isinagawa ba ng Barangay ang buwanang pagpupulong para sa Katarungang Pambarangay?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "meetingsSatisfaction",
              question:
                "How satisfied are you with the frequency and quality of these meetings? / Gaano ka nasiyahan sa regularidad at kalidad ng mga pagpupulong ukol sa Katarungang Pambarangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should meeting practices be improved? / Kailangan bang pagbutihin ang pagsasagawa ng mga pagpupulong?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "kp-training-group",
          type: "grouped",
          question: "12. KP Training for Lupong Tagapamayapa Members",
          mainQuestion:
            "Did the members of the Lupong Tagapamayapa attend a KP training or seminar not earlier than CY 2020? / Dumalo ba sa training o seminar ukol sa Katarungang Pambarangay ang mga miyembro ng Lupong Tagapamayapa mula CY 2020 pataas?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "trainingSatisfaction",
              question:
                "How satisfied are you with the training received by these members? / Gaano ka nasiyahan sa training ng mga miyembro ng Lupong Tagapamayapa?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question: "Is further training necessary? / Kailangan pa ba ng karagdagang pagsasanay?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "tanod-training-group",
          type: "grouped",
          question: "13. Training for Barangay Tanods",
          mainQuestion:
            "Did the barangay tanods attend necessary training not earlier than CY 2020? / Dumaan ba sa kinakailangang training ang mga barangay tanod mula CY 2020 pataas?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "tanodSatisfaction",
              question:
                "How satisfied are you with the preparedness of barangay tanods? / Gaano ka nasiyahan sa kahandaan ng mga barangay tanod?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should more training for tanods be conducted? / Kailangan bang dagdagan ang pagsasanay ng mga tanod?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "barco-meetings-group",
          type: "grouped",
          question: "14. Conduct of BaRCO Meetings",
          mainQuestion:
            "Did the Barangay conduct BaRCO (Barangay Council) meetings monthly during CY 2023? / Isinagawa ba ng Barangay ang buwanang pagpupulong ng BaRCO (Barangay Council) noong 2023?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "barcoSatisfaction",
              question:
                "How satisfied are you with the conduct and results of BaRCO meetings? / Gaano ka nasiyahan sa pagsasagawa at resulta ng mga pagpupulong ng BaRCO?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the conduct of BaRCO meetings be improved? / Kailangan bang pagbutihin ang pagpupulong ng BaRCO?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
      ]

    case "social":
      return [
        {
          id: "vaw-desk-group",
          type: "grouped",
          question: "1. Barangay VAW Desk",
          mainQuestion:
            "Is there an established Barangay VAW Desk with a designated VAW Desk Officer? / Mayroon bang itinatag na Barangay VAW Desk na may nakatalagang VAW Desk Officer?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "vawSatisfaction",
              question:
                "How satisfied are you with the services provided by the Barangay VAW Desk? / Gaano ka nasiyahan sa mga serbisyong ibinibigay ng Barangay VAW Desk?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to improve the VAW Desk services? / Kailangan ba ng pagbutihin ang mga serbisyo ng VAW Desk?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "gad-plan-group",
          type: "grouped",
          question: "2. GAD Plan and Budget",
          mainQuestion:
            "Is there an approved CY 2023 Barangay Gender and Development (GAD) Plan and Budget? / Mayroon bang aprubadong Barangay Gender and Development (GAD) Plan at Budget para sa CY 2023?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "gadSatisfaction",
              question:
                "How satisfied are you with the barangay's gender and development efforts? / Gaano ka nasiyahan sa mga hakbang ng barangay ukol sa gender and development?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to improve gender and development initiatives? / Kailangan ba ng pagbutihin ang mga inisyatiba ng gender and development?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "referral-flowchart-group",
          type: "grouped",
          question: "3.1. Referral System Flow Chart",
          mainQuestion:
            "Is there a Referral System Flow Chart in the Barangay? / Mayroon bang Flow Chart ng Referral System sa Barangay?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "referralSatisfaction",
              question:
                "How satisfied are you with the referral process in the barangay? / Gaano ka nasiyahan sa proseso ng referral sa barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to improve the referral system? / Kailangan ba ng pagbutihin ang referral system?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "support-directory-group",
          type: "grouped",
          question: "3.2. Directory of Agencies/Individuals",
          mainQuestion:
            "Is there a Directory of agencies/individuals providing services to victim-survivors? / Mayroon bang Talaan ng mga ahensya/indibidwal na nagbibigay serbisyo sa mga biktima?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "supportSatisfaction",
              question:
                "How satisfied are you with the support network for victim-survivors? / Gaano ka nasiyahan sa support system para sa mga biktima?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to expand or improve the support directory? / Kailangan bang palawakin o pagbutihin ang talaan ng mga serbisyong suporta?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "health-station-group",
          type: "grouped",
          question: "4.1. Barangay Health Station/Center",
          mainQuestion: "Is there a Barangay Health Station/Center? / Mayroon bang Barangay Health Station/Center?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "healthStationSatisfaction",
              question:
                "How satisfied are you with the availability of health services in the barangay? / Gaano ka nasiyahan sa pagkakaroon ng serbisyong pangkalusugan sa barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to improve health service availability? / Kailangan bang pagbutihin ang pagkakaroon ng serbisyong pangkalusugan?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bhw-group",
          type: "grouped",
          question: "4.2a. Accredited Barangay Health Worker (BHW)",
          mainQuestion:
            "Is there an Accredited Barangay Health Worker (BHW)? / Mayroon bang naitalagang Barangay Health Worker (BHW)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "bhwSatisfaction",
              question:
                "How satisfied are you with the performance of the Barangay Health Worker? / Gaano ka nasiyahan sa serbisyo ng Barangay Health Worker?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question: "Is there a need to improve BHW services? / Kailangan bang pagbutihin ang serbisyo ng BHW?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bho-group",
          type: "grouped",
          question: "4.2b. Barangay Health Officer (BHO) or Assistant",
          mainQuestion:
            "Is there a Barangay Health Officer (BHO) or Barangay Health Assistant (BHAsst)? / Mayroon bang Barangay Health Officer (BHO) o Barangay Health Assistant (BHAsst)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "bhoSatisfaction",
              question:
                "How satisfied are you with the health officer or assistant's services? / Gaano ka nasiyahan sa serbisyo ng Barangay Health Officer o Assistant?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to enhance the role of the BHO/BHAsst? / Kailangan bang paigtingin ang tungkulin ng BHO/BHAsst?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bns-group",
          type: "grouped",
          question: "4.3. Barangay Nutrition Scholar (BNS)",
          mainQuestion:
            "Is there an appointed Barangay Nutrition Scholar (BNS)? / Mayroon bang naitalagang Barangay Nutrition Scholar (BNS)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "nutritionSatisfaction",
              question:
                "How satisfied are you with the barangay's nutrition programs? / Gaano ka nasiyahan sa mga programang pang-nutrisyon ng barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the nutrition programs be improved or expanded? / Kailangan bang pagbutihin o palawakin ang mga programang pang-nutrisyon?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "health-services-group",
          type: "grouped",
          question: "4.4. Health Services at BHS/C",
          mainQuestion:
            "Are the following health services available at the Barangay Health Station/Center (BHS/C)? / Makukuha ba ang mga sumusunod na serbisyong pangkalusugan sa Barangay Health Station/Center (BHS/C)?",
          mainOptions: [],
          followUpQuestions: [
            {
              id: "servicesSatisfaction",
              question:
                "How satisfied are you with the overall health services at the BHS/C? / Gaano ka nasiyahan sa kabuuang serbisyong pangkalusugan sa BHS/C?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should health services be improved or expanded? / Kailangan bang pagbutihin o palawakin ang mga serbisyong pangkalusugan?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bdc-group",
          type: "grouped",
          question: "5.1. Barangay Development Council (BDC)",
          mainQuestion:
            "Is there an organized BDC with composition compliant to Section 107 of RA 7160? / Mayroon bang organisadong Barangay Development Council (BDC) na sumusunod sa Seksyon 107 ng RA 7160?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "developmentSatisfaction",
              question:
                "How satisfied are you with the barangay's development planning? / Gaano ka nasiyahan sa pagpaplano ng barangay para sa kaunlaran?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Does the barangay need to improve its development council or planning process? / Kailangan bang pagbutihin ng barangay ang konseho o proseso ng pagpaplano?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "public-consultation-group",
          type: "grouped",
          question: "5.2. Public Consultation",
          mainQuestion:
            "Did the Barangay conduct meetings, public hearings, and/or assemblies for public consultation? / Nagsagawa ba ang Barangay ng mga pagpupulong, pampublikong pagdinig, at/o asembliya para sa konsultasyon sa mamamayan?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "participationSatisfaction",
              question:
                "How satisfied are you with opportunities for community participation in decision-making? / Gaano ka nasiyahan sa pagkakataong makilahok ang komunidad sa mga desisyon ng barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should public consultation processes be strengthened? / Kailangan bang paigtingin ang mga konsultasyong pampubliko?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "kasambahay-desk-group",
          type: "grouped",
          question: "6. Kasambahay Desk",
          mainQuestion:
            "Is there a Kasambahay Desk with a designated Kasambahay Desk Officer (KDO)? / Mayroon bang Kasambahay Desk na may nakatalagang Kasambahay Desk Officer (KDO)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "kasambahayProtectionSatisfaction",
              question:
                "How satisfied are you with the protection and support services for household workers (kasambahay)? / Gaano ka nasiyahan sa proteksyon at suportang ibinibigay sa mga kasambahay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the services for kasambahay be improved? / Kailangan bang pagbutihin ang mga serbisyo para sa kasambahay?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bcpc-group",
          type: "grouped",
          question: "7.1. Barangay Council for the Protection of Children (BCPC)",
          mainQuestion:
            "Is there an organized BCPC with its composition compliant to DILG MC No. 2021-039? / Mayroon bang organisadong BCPC na sumusunod sa DILG MC Blg. 2021-039?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "childProtectionSatisfaction",
              question:
                "How satisfied are you with child protection efforts in your barangay? / Gaano ka nasiyahan sa mga hakbang ng barangay ukol sa proteksyon ng mga bata?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the BCPC be improved or strengthened? / Kailangan bang palakasin o pagbutihin ang BCPC?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bcpc-training-group",
          type: "grouped",
          question: "7.2. BCPC Trainings",
          mainQuestion:
            "Did BCPC members attend a training or orientation related to their functions, not earlier than CY 2020? / Dumalo ba ang mga miyembro ng BCPC sa pagsasanay o oryentasyon kaugnay ng kanilang tungkulin simula CY 2020?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "bcpcTrainingSatisfaction",
              question:
                "How satisfied are you with the preparedness of BCPC members? / Gaano ka nasiyahan sa kahandaan ng mga miyembro ng BCPC?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should more training for BCPC members be conducted? / Kailangan bang maglunsad pa ng mga pagsasanay para sa mga miyembro ng BCPC?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "child-referral-flowchart-group",
          type: "grouped",
          question: "7.3a. Updated Localized Flow Chart (Referral System)",
          mainQuestion:
            "Is there an updated Localized Flow Chart of the Referral System not earlier than CY 2020? / Mayroon bang na-update na Lokal na Flow Chart ng Referral System simula CY 2020?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "childReferralSatisfaction",
              question:
                "How satisfied are you with the referral system for children? / Gaano ka nasiyahan sa referral system para sa mga bata?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question: "Should the referral system be improved? / Kailangan bang pagbutihin ang referral system?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "juvenile-intervention-group",
          type: "grouped",
          question: "7.3b. Juvenile Intervention/Diversion Program",
          mainQuestion:
            "Is there a Comprehensive Barangay Juvenile Intervention Program/Diversion Program? / Mayroon bang Komprehensibong Barangay Juvenile Intervention o Diversion Program?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "youthInterventionSatisfaction",
              question:
                "How satisfied are you with youth intervention or diversion efforts? / Gaano ka nasiyahan sa mga hakbang para sa mga kabataang may paglabag sa batas?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should youth intervention programs be improved? / Kailangan bang pagbutihin ang mga programa para sa mga kabataan?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "car-cicl-registry-group",
          type: "grouped",
          question: "7.3c. Registry of CAR and CICL",
          mainQuestion:
            "Is there a registry of Children at Risk (CAR) and Children in Conflict with the Law (CICL)? / Mayroon bang talaan ng mga Batang Nanganganib (CAR) at Batang Lumabag sa Batas (CICL)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "registrySatisfaction",
              question:
                "How satisfied are you with the identification and tracking of CAR and CICL? / Gaano ka nasiyahan sa paraan ng pagtukoy at pagtatala ng CAR at CICL?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should registry and tracking mechanisms be improved? / Kailangan bang pagbutihin ang sistema ng pagtatala at pagsubaybay?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "gad-focal-point-group",
          type: "grouped",
          question: "8. Barangay GAD Focal Point System",
          mainQuestion:
            "Is there an organized Barangay GAD Focal Point System? / Mayroon bang organisadong Barangay GAD Focal Point System?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "genderResponsivenessSatisfaction",
              question:
                "How satisfied are you with the gender responsiveness of barangay programs? / Gaano ka nasiyahan sa pagiging gender responsive ng mga programa ng barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the GAD Focal Point System be improved or activated? / Kailangan bang pagbutihin o aktibahin ang GAD Focal Point System?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "rbi-group",
          type: "grouped",
          question: "9. Registry of Barangay Inhabitants (RBI)",
          mainQuestion:
            "Is there a Barangay-level Registry of Barangay Inhabitants (RBI) updated for the first semester of CY 2024? / Mayroon bang Barangay-level Registry of Barangay Inhabitants (RBI) na na-update para sa unang semestre ng CY 2024?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "rbiSatisfaction",
              question:
                "How satisfied are you with the accuracy and completeness of the barangay registry? / Gaano ka nasiyahan sa katumpakan at kabuuan ng talaan ng mga naninirahan?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the RBI be updated or improved further? / Kailangan bang i-update o pagbutihin pa ang RBI?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "community-garden-group",
          type: "grouped",
          question: "10.1. Barangay Community Garden (BCG)",
          mainQuestion:
            "Is there an established Barangay Community Garden (BCG)? / Mayroon bang naitayong Barangay Community Garden (BCG)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "gardenSatisfaction",
              question:
                "How satisfied are you with the existence and impact of the community garden? / Gaano ka nasiyahan sa pagkakaroon at epekto ng community garden?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the community garden program be expanded or improved? / Kailangan bang palawakin o pagbutihin ang community garden program?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "bcg-ordinance-group",
          type: "grouped",
          question: "10.2. BCG Ordinance",
          mainQuestion:
            "Has the Barangay enacted an ordinance for the establishment of the BCG? / Nagpatibay ba ang Barangay ng ordinansa para sa pagtatayo ng BCG?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "ordinanceSatisfaction",
              question:
                "How satisfied are you with the support and policies for the community garden? / Gaano ka nasiyahan sa mga patakaran at suporta para sa community garden?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should legal/policy support for the BCG be improved? / Kailangan bang palakasin ang suporta ng ordinansa para sa BCG?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "sbm-bcg-group",
          type: "grouped",
          question: "10.3. Designated SBM for BCG",
          mainQuestion:
            "Is there a designated Sangguniang Barangay Member to manage the BCG? / Mayroon bang nakatalagang SBM para pamahalaan ang BCG?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "managementSatisfaction",
              question:
                "How satisfied are you with the management of the community garden? / Gaano ka nasiyahan sa pamamahala ng community garden?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question: "Should management of the BCG be improved? / Kailangan bang pagbutihin ang pamamahala sa BCG?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "gardening-advocacy-group",
          type: "grouped",
          question: "10.4. Advocacy Campaign on Gardening",
          mainQuestion:
            "Did the Barangay conduct at least one advocacy campaign or awareness activity on community household gardening? / Nagsagawa ba ang Barangay ng kampanya o aktibidad para sa community household gardening?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "advocacySatisfaction",
              question:
                "How satisfied are you with community gardening awareness activities? / Gaano ka nasiyahan sa mga aktibidad ukol sa community gardening?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should gardening campaigns be expanded or improved? / Kailangan bang palakasin ang mga kampanya sa community gardening?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "volunteer-group-garden-group",
          type: "grouped",
          question: "10.5. Volunteer Group for Community Garden",
          mainQuestion:
            "Is there an organized group of volunteers for the implementation of the Community Garden? / Mayroon bang organisadong grupo ng mga boluntaryo para sa pagpapatupad ng Community Garden?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "volunteerSatisfaction",
              question:
                "How satisfied are you with community volunteer participation in the garden? / Gaano ka nasiyahan sa partisipasyon ng mga boluntaryo sa community garden?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should volunteer involvement be increased or supported more? / Kailangan bang dagdagan o suportahan pa ang partisipasyon ng mga boluntaryo?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
      ]

    case "business":
      return [
        {
          id: "barangay-tax-ordinance-group",
          type: "grouped",
          question: "1. Barangay Tax Ordinance",
          mainQuestion:
            "Has the Barangay enacted a Barangay Tax Ordinance pursuant to Section 129 of the Local Government Code (LGC)? / Nagpatibay ba ang Barangay ng Barangay Tax Ordinance alinsunod sa Seksyon 129 ng Local Government Code (LGC)?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "taxPolicySatisfaction",
              question:
                "How satisfied are you with the implementation and clarity of the barangay's tax policies? / Gaano ka nasiyahan sa pagpapatupad at linaw ng mga patakaran sa buwis ng barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to improve the barangay's tax ordinance or its implementation? / Kailangan bang pagbutihin ang barangay tax ordinance o ang pagpapatupad nito?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "clearance-fees-ordinance-group",
          type: "grouped",
          question: "2. Ordinance on Barangay Clearance Fees",
          mainQuestion:
            "Has the Barangay enacted an ordinance related to Barangay Clearance fees on business permits and locational clearances for building permits, in accordance with DILG Memorandum Circular No. 2019-177? / Nagpatibay ba ang Barangay ng ordinansa kaugnay ng Barangay Clearance fees para sa business permits at locational clearances para sa building permits, alinsunod sa DILG Memorandum Circular Blg. 2019-177?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "clearanceFeeSatisfaction",
              question:
                "How satisfied are you with the transparency and fairness of clearance-related fees? / Gaano ka nasiyahan sa pagiging malinaw at makatarungan ng mga bayarin para sa barangay clearance?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the policies on clearance fees be reviewed or improved? / Kailangan bang repasuhin o pagbutihin ang mga patakaran sa clearance fees?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "citizens-charter-clearance-group",
          type: "grouped",
          question: "3. Citizens' Charter on Barangay Clearance",
          mainQuestion:
            "Is there a Citizens' Charter on the issuance of Barangay Clearance that is posted in the Barangay Hall? / Mayroon bang Citizens' Charter hinggil sa pag-isyu ng Barangay Clearance na naka-post sa Barangay Hall?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "charterClearanceSatisfaction",
              question:
                "How satisfied are you with the clarity and accessibility of the Citizens' Charter on Barangay Clearance? / Gaano ka nasiyahan sa kalinawan at pagiging accessible ng Citizens' Charter ukol sa Barangay Clearance?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to improve or update the Citizens' Charter? / Kailangan bang pagbutihin o i-update ang Citizens' Charter?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
      ]

    case "environmental":
      return [
        {
          id: "beswmc-organization-group",
          type: "grouped",
          question: "1. Organization of BESWMC",
          mainQuestion:
            "Is there an organized Barangay Ecological Solid Waste Management Committee (BESWMC) with composition compliant to DILG Memorandum Circular No. 2018-112? / Mayroong bang maayos na Barangay Ecological Solid Waste Management Committee (BESWMC) na alinsunod sa DILG Memorandum Circular Blg. 2018-112?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "wasteCommitteeSatisfaction",
              question:
                "How satisfied are you with the barangay's waste management committee and its efforts? / Gaano ka nasiyahan sa komite ng barangay sa pamamahala ng basura at mga hakbang nito?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to strengthen or improve the BESWMC? / Kailangan bang palakasin o pagbutihin ang BESWMC?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "solid-waste-management-plan-group",
          type: "grouped",
          question: "2. Solid Waste Management Plan",
          mainQuestion:
            "Does the Barangay have an approved Solid Waste Management Program/Plan with a corresponding fund allocation? / May aprubadong Programang/Plano sa Pamamahala ng Basura ang Barangay na may kaukulang pondo?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "wastePlanSatisfaction",
              question:
                "How satisfied are you with the planning and funding of the solid waste management program? / Gaano ka nasiyahan sa pagpaplano at pondo ng programang pamamahala ng basura?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Should the plan or its implementation be improved? / Kailangan bang pagbutihin ang plano o ang pagpapatupad nito?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "materials-recovery-facility-group",
          type: "grouped",
          question: "3. Materials Recovery Facility/System (MRF/MRS)",
          mainQuestion:
            "Is there a Materials Recovery Facility (MRF) or Materials Recovery System (MRS) in the Barangay? / Mayroong bang Materials Recovery Facility (MRF) o Materials Recovery System (MRS) sa Barangay?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "mrfType",
              question:
                "If Yes, specify type (check all that apply): / Kung Oo, tukuyin ang uri (lagyan ng tsek ang lahat ng naaangkop):",
              type: "checkbox",
              options: [
                "Established MRF operated by the Barangay / Naitatag na MRF na pinapaandar ng Barangay",
                "MRS / MRS",
                "Clustered MRF / Pinagsama-samang MRF",
              ],
              dependsOn: "main",
              dependsOnValue: "Yes",
            },
            {
              id: "recoveryFacilitySatisfaction",
              question:
                "How satisfied are you with the availability and operation of waste recovery facilities in your barangay? / Gaano ka nasiyahan sa pagkakaroon at operasyon ng mga pasilidad para sa pag-recover ng basura sa inyong barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Is there a need to enhance or expand the MRF/MRS system? / Kailangan bang palawakin o pagbutihin ang MRF/MRS system?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
        {
          id: "waste-segregation-ordinance-group",
          type: "grouped",
          question: "4. Waste Segregation Ordinance",
          mainQuestion:
            "Has the Barangay enacted an ordinance or similar issuance mandating the segregation of wastes at source? / Nagpatibay ba ang Barangay ng ordinansa o kaparehong kautusan na nag-uutos ng segregation ng basura sa pinanggagalingan nito?",
          mainOptions: ["Yes", "No"],
          followUpQuestions: [
            {
              id: "segregationSatisfaction",
              question:
                "How satisfied are you with the implementation of waste segregation in your barangay? / Gaano ka nasiyahan sa pagpapatupad ng segregation ng basura sa inyong barangay?",
              type: "radio",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "improvementNeeded",
              question:
                "Does the waste segregation policy need improvement or stricter enforcement? / Kailangan bang pagbutihin o higpitan pa ang polisiya sa segregation ng basura?",
              type: "radio",
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "specificActions",
              question: "If yes, what actions are needed?",
              type: "text",
              dependsOn: "improvementNeeded",
              dependsOnValue: "Yes",
            },
          ],
          required: true,
        },
      ]

    default:
      return [
        {
          id: "defaultQuestion",
          type: "text",
          question: "Please provide any additional information:",
          required: false,
        },
      ]
  }
}
