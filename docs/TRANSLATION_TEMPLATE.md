# Translation Template - Quick Reference

## Instructions
1. Open `SURVEY-QUESTIONS-2-ELECTRIC-BOOGALOO.docx`
2. Find each question in Bisaya
3. Copy and paste into the corresponding section below
4. Then copy the entire section into `src/app/survey/forms/utils/translations.ts`

---

## DISASTER PREPAREDNESS SECTION

```typescript
disaster: {
  // Part A: Disaster Information and Early Warning
  awarenessDisasterInfo: {
    bisaya: "PASTE BISAYA Q1 HERE",
    filipino: "Are you aware that the barangay has plans and systems to inform residents about potential risks (like flood-prone areas) and to give warnings before a disaster strikes?",
    english: "Are you aware that the barangay has plans and systems to inform residents about potential risks (like flood-prone areas) and to give warnings before a disaster strikes?"
  },
  availmentDisasterInfo: {
    bisaya: "PASTE BISAYA Q2 HERE",
    filipino: "Have you personally received any disaster-related information (like a pamphlet or text), seen a hazard map for our area, or heard an early warning (e.g., from a siren, megaphone, or barangay official) from the barangay?",
    english: "Have you personally received any disaster-related information (like a pamphlet or text), seen a hazard map for our area, or heard an early warning (e.g., from a siren, megaphone, or barangay official) from the barangay?"
  },
  satisfactionDisasterInfo: {
    bisaya: "PASTE BISAYA Q3 HERE",
    filipino: "How satisfied are you with the clarity, timeliness, and effectiveness of the disaster warnings and information provided by the barangay?",
    english: "How satisfied are you with the clarity, timeliness, and effectiveness of the disaster warnings and information provided by the barangay?"
  },
  nfaBinaryDisasterInfo: {
    bisaya: "PASTE BISAYA Q4 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsDisasterInfo: {
    bisaya: "PASTE BISAYA Q5 HERE",
    filipino: "How could the barangay improve the way it informs and warns residents about disasters?",
    english: "How could the barangay improve the way it informs and warns residents about disasters?"
  },
  
  // Part B: Evacuation and Emergency Response
  awarenessEvacuation: {
    bisaya: "PASTE BISAYA Q5 HERE",
    filipino: "Are you aware that the barangay has a designated evacuation center and should have emergency equipment and a response team ready for disasters?",
    english: "Are you aware that the barangay has a designated evacuation center and should have emergency equipment and a response team ready for disasters?"
  },
  locationEvacuation: {
    bisaya: "PASTE BISAYA Q6 HERE",
    filipino: "Do you know the location of the main designated evacuation center for your specific area or purok?",
    english: "Do you know the location of the main designated evacuation center for your specific area or purok?"
  },
  satisfactionEvacuation: {
    bisaya: "PASTE BISAYA Q7 HERE",
    filipino: "Based on what you know or have seen, how confident and satisfied are you with the readiness of our barangay's evacuation facilities and emergency response capabilities (e.g., rescue team, equipment)?",
    english: "Based on what you know or have seen, how confident and satisfied are you with the readiness of our barangay's evacuation facilities and emergency response capabilities (e.g., rescue team, equipment)?"
  },
  nfaBinaryEvacuation: {
    bisaya: "PASTE BISAYA Q8 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsEvacuation: {
    bisaya: "PASTE BISAYA Q9 HERE",
    filipino: "What are your suggestions for improving our evacuation centers or the barangay's ability to respond during an emergency?",
    english: "What are your suggestions for improving our evacuation centers or the barangay's ability to respond during an emergency?"
  },
},
```

---

## SAFETY & PEACE ORDER SECTION

```typescript
safety: {
  // Part A: Barangay Tanod Services
  awarenessTanods: {
    bisaya: "PASTE BISAYA Q1 HERE",
    filipino: "Are you aware that the barangay has Tanods (peacekeepers) responsible for patrolling the community and responding to safety concerns?",
    english: "Are you aware that the barangay has Tanods (peacekeepers) responsible for patrolling the community and responding to safety concerns?"
  },
  experienceTanods: {
    bisaya: "PASTE BISAYA Q2 HERE",
    filipino: "Have you personally seen the Tanods on patrol in your area or had to interact with them for a peace and order concern?",
    english: "Have you personally seen the Tanods on patrol in your area or had to interact with them for a peace and order concern?"
  },
  satisfactionTanods: {
    bisaya: "PASTE BISAYA Q3 HERE",
    filipino: "How satisfied are you with the visibility, responsiveness, and effectiveness of our Barangay Tanods in keeping the community safe?",
    english: "How satisfied are you with the visibility, responsiveness, and effectiveness of our Barangay Tanods in keeping the community safe?"
  },
  nfaBinaryTanods: {
    bisaya: "PASTE BISAYA Q4 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsTanods: {
    bisaya: "PASTE BISAYA Q5 HERE",
    filipino: "What are your suggestions for improving the overall safety in our barangay or the performance of our Tanods?",
    english: "What are your suggestions for improving the overall safety in our barangay or the performance of our Tanods?"
  },
  
  // Part B: Lupon (Dispute Resolution)
  awarenessLupon: {
    bisaya: "PASTE BISAYA Q5 HERE",
    filipino: "Are you aware that the barangay has a mediation service (Lupong Tagapamayapa) to help settle disputes between residents, like disagreements with neighbors?",
    english: "Are you aware that the barangay has a mediation service (Lupong Tagapamayapa) to help settle disputes between residents, like disagreements with neighbors?"
  },
  experienceLupon: {
    bisaya: "PASTE BISAYA Q6 HERE",
    filipino: "Have you, a family member, or someone you know ever used this service to help settle a dispute?",
    english: "Have you, a family member, or someone you know ever used this service to help settle a dispute?"
  },
  satisfactionLupon: {
    bisaya: "PASTE BISAYA Q7 HERE",
    filipino: "Based on your experience or what you've heard, how satisfied are you with the fairness and effectiveness of the barangay's dispute settlement process?",
    english: "Based on your experience or what you've heard, how satisfied are you with the fairness and effectiveness of the barangay's dispute settlement process?"
  },
  nfaBinaryLupon: {
    bisaya: "PASTE BISAYA Q8 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsLupon: {
    bisaya: "PASTE BISAYA Q9 HERE",
    filipino: "Do you have any suggestions on how the barangay can better help residents resolve conflicts peacefully?",
    english: "Do you have any suggestions on how the barangay can better help residents resolve conflicts peacefully?"
  },
  
  // Part C: Anti-Drug Programs
  awarenessAntiDrug: {
    bisaya: "PASTE BISAYA Q9 HERE",
    filipino: "Are you aware that the barangay is involved in programs to combat illegal drugs, including information campaigns and referral systems for rehabilitation?",
    english: "Are you aware that the barangay is involved in programs to combat illegal drugs, including information campaigns and referral systems for rehabilitation?"
  },
  experienceAntiDrug: {
    bisaya: "PASTE BISAYA Q10 HERE",
    filipino: "Have you personally seen or received any information (like a poster, leaflet, or talk) from the barangay's anti-drug campaign?",
    english: "Have you personally seen or received any information (like a poster, leaflet, or talk) from the barangay's anti-drug campaign?"
  },
  satisfactionAntiDrug: {
    bisaya: "PASTE BISAYA Q11 HERE",
    filipino: "How satisfied are you with the barangay's overall efforts to address the issue of illegal drugs within our community?",
    english: "How satisfied are you with the barangay's overall efforts to address the issue of illegal drugs within our community?"
  },
  nfaBinaryAntiDrug: {
    bisaya: "PASTE BISAYA Q12 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsAntiDrug: {
    bisaya: "PASTE BISAYA Q13 HERE",
    filipino: "What are your specific comments or suggestions regarding the barangay's anti-drug programs and initiatives?",
    english: "What are your specific comments or suggestions regarding the barangay's anti-drug programs and initiatives?"
  },
},
```

---

## SOCIAL PROTECTION SECTION

```typescript
social: {
  // Part A: Health Services
  awarenessHealthServices: {
    bisaya: "PASTE BISAYA Q1 HERE",
    filipino: "Are you aware that the barangay has a Health Station/Center with personnel like Barangay Health Workers (BHWs) who provide services such as check-ups and immunization?",
    english: "Are you aware that the barangay has a Health Station/Center with personnel like Barangay Health Workers (BHWs) who provide services such as check-ups and immunization?"
  },
  availmentHealthServices: {
    bisaya: "PASTE BISAYA Q2 HERE",
    filipino: "Have you or a member of your family ever visited the Barangay Health Station or received a service from a BHW?",
    english: "Have you or a member of your family ever visited the Barangay Health Station or received a service from a BHW?"
  },
  satisfactionHealthServices: {
    bisaya: "PASTE BISAYA Q3 HERE",
    filipino: "How satisfied are you with the quality, availability, and staff service at our Barangay Health Station?",
    english: "How satisfied are you with the quality, availability, and staff service at our Barangay Health Station?"
  },
  nfaBinaryHealthServices: {
    bisaya: "PASTE BISAYA Q4 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsHealthServices: {
    bisaya: "PASTE BISAYA Q5 HERE",
    filipino: "What are your suggestions for improving the health services in our barangay? (e.g., more services, better hours, staff training)",
    english: "What are your suggestions for improving the health services in our barangay? (e.g., more services, better hours, staff training)"
  },
  
  // Part B: Women and Children Protection
  awarenessWomenChildrenProtection: {
    bisaya: "PASTE BISAYA Q5 HERE",
    filipino: "Are you aware that the barangay has special programs and a dedicated desk (like the VAW Desk) to provide assistance and protection for women and children in distress?",
    english: "Are you aware that the barangay has special programs and a dedicated desk (like the VAW Desk) to provide assistance and protection for women and children in distress?"
  },
  availmentWomenChildrenProtection: {
    bisaya: "PASTE BISAYA Q6 HERE",
    filipino: "Do you know where or how someone in the community could get help from these services if they needed to?",
    english: "Do you know where or how someone in the community could get help from these services if they needed to?"
  },
  satisfactionWomenChildrenProtection: {
    bisaya: "PASTE BISAYA Q7 HERE",
    filipino: "How confident and satisfied are you in the barangay's ability to provide a safe, confidential, and effective response to protect women and children?",
    english: "How confident and satisfied are you in the barangay's ability to provide a safe, confidential, and effective response to protect women and children?"
  },
  nfaBinaryWomenChildrenProtection: {
    bisaya: "PASTE BISAYA Q8 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsWomenChildrenProtection: {
    bisaya: "PASTE BISAYA Q9 HERE",
    filipino: "What more can the barangay do to ensure the safety and well-being of women and children in our community?",
    english: "What more can the barangay do to ensure the safety and well-being of women and children in our community?"
  },
  
  // Part C: Community Participation
  awarenessCommunityParticipation: {
    bisaya: "PASTE BISAYA Q9 HERE",
    filipino: "Are you aware that the barangay has programs for residents to get involved in the community, like a Kasambahay Desk for domestic helpers, or a Barangay Community Garden?",
    english: "Are you aware that the barangay has programs for residents to get involved in the community, like a Kasambahay Desk for domestic helpers, or a Barangay Community Garden?"
  },
  availmentCommunityParticipation: {
    bisaya: "PASTE BISAYA Q10 HERE",
    filipino: "Have you personally participated in, or seen other residents participating in, any of these community activities or services?",
    english: "Have you personally participated in, or seen other residents participating in, any of these community activities or services?"
  },
  satisfactionCommunityParticipation: {
    bisaya: "PASTE BISAYA Q11 HERE",
    filipino: "How satisfied are you with the opportunities the barangay provides for residents to get involved in community life and development?",
    english: "How satisfied are you with the opportunities the barangay provides for residents to get involved in community life and development?"
  },
  nfaBinaryCommunityParticipation: {
    bisaya: "PASTE BISAYA Q12 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsCommunityParticipation: {
    bisaya: "PASTE BISAYA Q13 HERE",
    filipino: "What kind of community programs or activities would you like the barangay to start or improve?",
    english: "What kind of community programs or activities would you like the barangay to start or improve?"
  },
},
```

---

## BUSINESS FRIENDLINESS SECTION

```typescript
business: {
  awarenessBusinessClearance: {
    bisaya: "PASTE BISAYA Q1 HERE",
    filipino: "Are you aware that residents need to secure a Barangay Clearance from the barangay hall when starting a business or applying for certain permits (like building permits)?",
    english: "Are you aware that residents need to secure a Barangay Clearance from the barangay hall when starting a business or applying for certain permits (like building permits)?"
  },
  availmentBusinessClearance: {
    bisaya: "PASTE BISAYA Q2 HERE",
    filipino: "Have you or a member of your household ever applied for a Barangay Business Clearance or a similar permit from our barangay?",
    english: "Have you or a member of your household ever applied for a Barangay Business Clearance or a similar permit from our barangay?"
  },
  satisfactionBusinessClearance: {
    bisaya: "PASTE BISAYA Q3 HERE",
    filipino: "How satisfied were you with the overall process of getting the clearance, considering the speed of service, the fees, and the helpfulness of the staff?",
    english: "How satisfied were you with the overall process of getting the clearance, considering the speed of service, the fees, and the helpfulness of the staff?"
  },
  nfaBinaryBusinessClearance: {
    bisaya: "PASTE BISAYA Q4 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsBusinessClearance: {
    bisaya: "PASTE BISAYA Q5 HERE",
    filipino: "What are your specific suggestions for making the process of getting business clearances or other permits from the barangay faster and easier?",
    english: "What are your specific suggestions for making the process of getting business clearances or other permits from the barangay faster and easier?"
  },
},
```

---

## ENVIRONMENTAL MANAGEMENT SECTION

```typescript
environmental: {
  awarenessWasteManagement: {
    bisaya: "PASTE BISAYA Q1 HERE",
    filipino: "Are you aware that the barangay has a solid waste management program, which includes rules for segregating your trash (e.g., biodegradable vs. non-biodegradable) and a system for garbage collection?",
    english: "Are you aware that the barangay has a solid waste management program, which includes rules for segregating your trash (e.g., biodegradable vs. non-biodegradable) and a system for garbage collection?"
  },
  availmentWasteManagement: {
    bisaya: "PASTE BISAYA Q2 HERE",
    filipino: "Do you and your household actively follow the barangay's waste segregation rules and participate in the garbage collection system?",
    english: "Do you and your household actively follow the barangay's waste segregation rules and participate in the garbage collection system?"
  },
  satisfactionWasteManagement: {
    bisaya: "PASTE BISAYA Q3 HERE",
    filipino: "How satisfied are you with the barangay's overall solid waste management, considering the reliability of the collection schedule, the effectiveness of the segregation policy, and the general cleanliness of the community?",
    english: "How satisfied are you with the barangay's overall solid waste management, considering the reliability of the collection schedule, the effectiveness of the segregation policy, and the general cleanliness of the community?"
  },
  nfaBinaryWasteManagement: {
    bisaya: "PASTE BISAYA Q4 HERE",
    filipino: "Based on your experience, do you believe this service needs improvement from the barangay?",
    english: "Based on your experience, do you believe this service needs improvement from the barangay?"
  },
  suggestionsWasteManagement: {
    bisaya: "PASTE BISAYA Q5 HERE",
    filipino: "What are your specific comments or suggestions for improving garbage collection, recycling, or the overall cleanliness of our barangay?",
    english: "What are your specific comments or suggestions for improving garbage collection, recycling, or the overall cleanliness of our barangay?"
  },
},
```

---

## After Filling In

1. Copy each completed section
2. Paste into `src/app/survey/forms/utils/translations.ts`
3. Replace the empty objects (`disaster: {}`, etc.)
4. Save the file
5. Test in the browser

## Testing Checklist

- [ ] All sections have Bisaya translations
- [ ] Questions display correctly in all 3 languages
- [ ] Tab switching works smoothly
- [ ] Answers save regardless of language
- [ ] No console errors or warnings
- [ ] Mobile responsive design works
