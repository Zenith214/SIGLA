# SIGLA Survey Questions - Complete List for Interviewer Validation

## Survey Structure Overview

The SIGLA survey consists of 6 main sections with conditional skip logic. Each section follows the funnel methodology:
- **Awareness** → **Availment/Experience** → **Satisfaction** → **Need for Action/Suggestions**

---

## Section 1: Financial Administration and Sustainability

### Part A: Mga Proyekto ng Barangay (Barangay Projects)

**Q1. AWARENESS (awarenessProjects)**
- **Filipino:** Alam mo ba na ginamit ng barangay ang pondo nito para sa mga proyektong konstruksyon ngayong taon, tulad ng pagpapaganda ng mga kalsada o pagtatayo ng mga pasilidad?
- **English:** Are you aware that the barangay has used its funds for construction projects this year, like improving roads or building facilities?
- **Type:** Radio (Oo, Hindi)
- **Skip Logic:** If "Hindi" → Skip to Q5 (Part B)

**Q2. AVAILMENT/EXPERIENCE (benefitedProjects)**
- **Filipino:** Ikaw ba ay personal na nakakita, gumamit, o nakinabang sa alinman sa mga proyektong ito?
- **English:** Have you personally seen, used, or benefited from any of these new projects?
- **Type:** Radio (Oo, Hindi)
- **Dependency:** Only if Q1 = "Oo"
- **Skip Logic:** If "Hindi" → Skip to Q5 (Part B)

**Q3. SATISFACTION (satisfactionProjects)**
- **Filipino:** Gaano ka nasisiyahan sa kalidad at pakinabang ng mga bagong proyekto ng barangay? Pakigamit ang sumusunod na sukat: (5 - Lubos na Nasiyahan, 4 - Nasiyahan, 3 - Neutral, 2 - Hindi Nasiyahan, 1 - Lubos na Hindi Nasiyahan)
- **English:** How satisfied are you with the quality and usefulness of these new barangay projects? Please use this scale:
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q2 = "Oo"

**Q4. NEED FOR ACTION/SUGGESTIONS (suggestionsProjects)**
- **Filipino:** Ano ang iyong mga partikular na komento o mungkahi tungkol sa mga proyektong konstruksyon ng barangay? (hal., lokasyon, kalidad, ano pa ang dapat itayo?)
- **English:** What are your specific comments or suggestions about the barangay's construction projects? (e.g., location, quality, what should be built next?)
- **Type:** Textarea
- **Dependency:** Only if Q2 = "Oo"

### Part B: Pananalaping Kaalaman at Transparency (Financial Transparency)

**Q5. AWARENESS (awarenessFinancial)**
- **Filipino:** Alam mo ba na ang barangay ay kailangang magpaskil ng badyet at gastusin nito sa isang pampublikong bulletin board (Full Disclosure Board) at talakayin ito sa mga Barangay Assembly?
- **English:** Are you aware that the barangay is supposed to post its budget and expenses on a public bulletin board (Full Disclosure Board) and discuss them during Barangay Assemblies?
- **Type:** Radio (Oo, Hindi)
- **Skip Logic:** If "Hindi" → Skip to Q9 (Part C)

**Q6. AVAILMENT/EXPERIENCE (usedFinancialInfo)**
- **Filipino:** Ikaw ba ay personal na nagsikap hanapin ang impormasyong ito o dumalo sa isang Barangay Assembly kung saan tinalakay ang badyet?
- **English:** Have you personally tried to look for this information or attended a Barangay Assembly where the budget was discussed?
- **Type:** Radio (Oo, Hindi)
- **Dependency:** Only if Q5 = "Oo"
- **Skip Logic:** If "Hindi" → Skip to Q9 (Part C)

**Q7. SATISFACTION (satisfactionFinancial)**
- **Filipino:** Gaano ka nasisiyahan sa kalinawan at kadaling makuha ng impormasyong pinansyal ng barangay?
- **English:** How satisfied are you with the clarity and accessibility of the barangay's financial information?
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q6 = "Oo"

**Q8. NEED FOR ACTION/SUGGESTIONS (suggestionsFinancial)**
- **Filipino:** Ano ang maaaring gawin ng barangay upang mas madaling maunawaan at makuha ng mga residente ang badyet at gastusin nito?
- **English:** What can the barangay do to make its budget and spending easier for residents to understand and access?
- **Type:** Textarea
- **Dependency:** Only if Q6 = "Oo"

### Part C: Mga Programang Panlipunan (Social Programs)

**Q9. AWARENESS (awarenessSocialPrograms)**
- **Filipino:** Alam mo ba na ang barangay ay naglalaan ng pondo para sa mga programang panlipunan, tulad ng tulong pinansyal para sa mga Senior Citizen at PWDs, o mga aktibidad para sa kabataan (SK)?
- **English:** Are you aware that the barangay allocates funds for social programs, such as financial assistance for Senior Citizens and PWDs, or activities for the youth (SK)?
- **Type:** Radio (Oo, Hindi)
- **Skip Logic:** If "Hindi" → Skip to Q13 (Part D)

**Q10. AVAILMENT/EXPERIENCE (participatedSocialPrograms)**
- **Filipino:** Ikaw ba, isang kapamilya, o malapit na kapitbahay ay nagtangkang makinabang o lumahok sa alinman sa mga programang ito?
- **English:** Have you, a family member, or a close neighbor tried to avail of or participate in any of these programs?
- **Type:** Radio (Oo, Hindi)
- **Dependency:** Only if Q9 = "Oo"
- **Skip Logic:** If "Hindi" → Skip to Q13 (Part D)

**Q11. SATISFACTION (satisfactionSocialPrograms)**
- **Filipino:** Batay sa iyong karanasan o obserbasyon, gaano ka nasisiyahan sa paghahatid at epekto ng mga programang panlipunan ng barangay?
- **English:** Based on your experience or observation, how satisfied are you with the delivery and impact of these social programs?
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q10 = "Oo"

**Q12. NEED FOR ACTION/SUGGESTIONS (suggestionsSocialPrograms)**
- **Filipino:** Ano ang iyong mungkahi para mapabuti ang mga programang panlipunan ng barangay? Mayroon pa bang ibang uri ng tulong na kailangan?
- **English:** What are your suggestions for improving the barangay's social programs? Are there other types of assistance that are needed?
- **Type:** Textarea
- **Dependency:** Only if Q10 = "Oo"

### Part D: Perception of Corruption

**Q13. AWARENESS (awarenessCorruption)**
- **Filipino:** Alam ba ninyo kung may mga patakaran at proseso laban sa korapsyon sa ating barangay o bayan, at na ang mga opisyal ay dapat maglingkod nang tapat?
- **English:** Are you aware that our barangay or municipality is expected to follow rules and processes to prevent corruption, and that officials should serve with integrity?
- **Type:** Radio (Oo (Yes), Hindi (No))
- **Skip Logic:** If "Hindi (No)" → End Section

**Q14. EXPERIENCE (experiencedCorruption)**
- **Filipino:** Sa nakalipas na 12 buwan, kayo ba (o sinumang miyembro ng inyong pamilya) ay nakaranas o nakasaksi ng anumang gawain ng opisyal o kawani ng barangay o bayan na maituturing ninyong uri ng korapsyon?
- **English:** In the past 12 months, did you (or any of your household members) experience or witness any action by a barangay or municipal official/staff that you consider a form of corruption?
- **Type:** Radio (Oo (Yes), Hindi (No))
- **Dependency:** Only if Q13 = "Oo (Yes)"
- **Skip Logic:** If "Hindi (No)" → End Section

**Q15. DETAILS (detailsCorruption)**
- **Filipino:** Ano ang partikular na gawain na inyong naranasan o nasaksihan? (Pakilagay ang partikular na serbisyo o sitwasyon. Tiyakin na ito ay unang karanasan mula sa inyo o miyembro ng inyong pamilya.)
- **English:** What specific action or practice did you experience or witness? (Please specify the service or situation. This must be a first-hand experience from you or a household member.)
- **Type:** Textarea
- **Dependency:** Only if Q14 = "Oo (Yes)"

**Q16. REPORTING (reportedCorruption)**
- **Filipino:** Idinulog ba ninyo ang inyong naranasan o nasaksihan sa alinmang awtoridad sa pamahalaan?
- **English:** Did you report your experience to any government authority?
- **Type:** Radio (Oo (Yes), Hindi (No))
- **Dependency:** Only if Q14 = "Oo (Yes)"
- **Skip Logic:** 
  - If "Hindi (No)" → Go to Q17
  - If "Oo (Yes)" → Go to Q18

**Q17. REASONS FOR NOT REPORTING (reasonsNotReporting)**
- **Filipino:** Ano ang pangunahing dahilan kung bakit hindi ninyo iniulat?
- **English:** What was the main reason you did not report the incident?
- **Type:** Checkbox (Multiple selection allowed)
- **Options:**
  - Ginagawa rin ito ng iba o ng karamihan. (Everyone is doing it)
  - Normal o SOP na itong gawain. (This has become a normal practice)
  - Natakot akong magsumbong. (I feared for my safety)
  - Nakapagbilis ito ng transaksyon. (It made the process faster/easier)
  - Walang mangyayari kung i-uulat. (Reporting would not solve the problem)
  - Wala namang dahilan. (No reason)
  - Iba pa: ________________________ (Other)
- **Dependency:** Only if Q16 = "Hindi (No)"

**Q18. SATISFACTION WITH RESPONSE (satisfactionReportResponse)**
- **Filipino:** Kung iniulat ninyo, tumugon ba ang mga awtoridad sa inyong reklamo at nasiyahan ba kayo sa naging tugon?
- **English:** If you reported it, did the authorities respond to your complaint, and how satisfied were you with their action?
- **Type:** Radio
- **Options:**
  - 5 - Lubos na Nasiyahan (Very Satisfied)
  - 4 - Nasiyahan (Satisfied)
  - 3 - Neutral (Neutral)
  - 2 - Hindi Nasiyahan (Dissatisfied)
  - 1 - Lubos na Hindi Nasiyahan (Very Dissatisfied)
- **Dependency:** Only if Q16 = "Oo (Yes)"

**Q19. SUGGESTIONS (suggestionsCorruption)**
- **Filipino:** Ano ang inyong mungkahi para mas maiwasan o masugpo ang korapsyon sa ating barangay o bayan?
- **English:** What are your suggestions to better prevent or address corruption in our barangay or municipality?
- **Type:** Textarea
- **Dependency:** Only if Q14 = "Oo (Yes)"

---

## Section 2: Disaster Preparedness

### Part A: Disaster Information and Early Warning

**Q1. AWARENESS (awarenessDisasterInfo)**
- **English:** Are you aware that the barangay has plans and systems to inform residents about potential risks (like flood-prone areas) and to give warnings before a disaster strikes?
- **Type:** Radio (Yes, No)
- **Skip Logic:** If "No" → Skip to Q5 (Part B)

**Q2. AVAILMENT/EXPERIENCE (availmentDisasterInfo)**
- **English:** Have you personally received any disaster-related information (like a pamphlet or text), seen a hazard map for our area, or heard an early warning (e.g., from a siren, megaphone, or barangay official) from the barangay?
- **Type:** Radio (Yes, No)
- **Dependency:** Only if Q1 = "Yes"
- **Skip Logic:** If "No" → Skip to Q5 (Part B)

**Q3. SATISFACTION (satisfactionDisasterInfo)**
- **English:** How satisfied are you with the clarity, timeliness, and effectiveness of the disaster warnings and information provided by the barangay?
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q2 = "Yes"

**Q4. NEED FOR ACTION/SUGGESTIONS (suggestionsDisasterInfo)**
- **English:** How could the barangay improve the way it informs and warns residents about disasters?
- **Type:** Textarea
- **Note:** This question is for EVERYONE who answers Q3

### Part B: Evacuation and Emergency Response Resources

**Q5. AWARENESS (awarenessEvacuation)**
- **English:** Are you aware that the barangay has a designated evacuation center and should have emergency equipment and a response team ready for disasters?
- **Type:** Radio (Yes, No)
- **Skip Logic:** If "No" → End Section

**Q6. AVAILMENT/EXPERIENCE (locationEvacuation)**
- **English:** Do you know the location of the main designated evacuation center for your specific area or purok?
- **Type:** Radio (Yes, No)
- **Dependency:** Only if Q5 = "Yes"
- **Skip Logic:** If "No" → End Section

**Q7. SATISFACTION (satisfactionEvacuation)**
- **English:** Based on what you know or have seen, how confident and satisfied are you with the readiness of our barangay's evacuation facilities and emergency response capabilities (e.g., rescue team, equipment)?
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q6 = "Yes"

**Q8. NEED FOR ACTION/SUGGESTIONS (suggestionsEvacuation)**
- **English:** What are your suggestions for improving our evacuation centers or the barangay's ability to respond during an emergency?
- **Type:** Textarea
- **Note:** This question is for EVERYONE who answers Q7

---

## Section 3: Safety, Peace and Order

### Part A: General Safety and Barangay Tanod Services

**Q1. AWARENESS (awarenessTanods)**
- **English:** Are you aware that the barangay has Tanods (peacekeepers) responsible for patrolling the community and responding to safety concerns?
- **Type:** Radio (Yes, No)
- **Skip Logic:** If "No" → Skip to Q5 (Part B)

**Q2. AVAILMENT/EXPERIENCE (experienceTanods)**
- **English:** Have you personally seen the Tanods on patrol in your area or had to interact with them for a peace and order concern?
- **Type:** Radio (Yes, No)
- **Dependency:** Only if Q1 = "Yes"
- **Skip Logic:** If "No" → Skip to Q5 (Part B)

**Q3. SATISFACTION (satisfactionTanods)**
- **English:** How satisfied are you with the visibility, responsiveness, and effectiveness of our Barangay Tanods in keeping the community safe?
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q2 = "Yes"

**Q4. NEED FOR ACTION/SUGGESTIONS (suggestionsTanods)**
- **English:** What are your suggestions for improving the overall safety in our barangay or the performance of our Tanods?
- **Type:** Textarea

### Part B: Community Dispute Resolution (Lupon)

**Q5. AWARENESS (awarenessLupon)**
- **English:** Are you aware that the barangay has a mediation service (Lupong Tagapamayapa) to help settle disputes between residents, like disagreements with neighbors?
- **Type:** Radio (Yes, No)
- **Skip Logic:** If "No" → Skip to Q9 (Part C)

**Q6. AVAILMENT/EXPERIENCE (experienceLupon)**
- **English:** Have you, a family member, or someone you know ever used this service to help settle a dispute?
- **Type:** Radio (Yes, No)
- **Dependency:** Only if Q5 = "Yes"
- **Skip Logic:** If "No" → Skip to Q9 (Part C)

**Q7. SATISFACTION (satisfactionLupon)**
- **English:** Based on your experience or what you've heard, how satisfied are you with the fairness and effectiveness of the barangay's dispute settlement process?
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q6 = "Yes"

**Q8. NEED FOR ACTION/SUGGESTIONS (suggestionsLupon)**
- **English:** Do you have any suggestions on how the barangay can better help residents resolve conflicts peacefully?
- **Type:** Textarea

### Part C: Anti-Illegal Drug Programs

**Q9. AWARENESS (awarenessAntiDrug)**
- **English:** Are you aware that the barangay is involved in programs to combat illegal drugs, including information campaigns and referral systems for rehabilitation?
- **Type:** Radio (Yes, No)
- **Skip Logic:** If "No" → End Section

**Q10. AVAILMENT/EXPERIENCE (experienceAntiDrug)**
- **English:** Have you personally seen or received any information (like a poster, leaflet, or talk) from the barangay's anti-drug campaign?
- **Type:** Radio (Yes, No)
- **Dependency:** Only if Q9 = "Yes"
- **Skip Logic:** If "No" → End Section

**Q11. SATISFACTION (satisfactionAntiDrug)**
- **English:** How satisfied are you with the barangay's overall efforts to address the issue of illegal drugs within our community?
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q10 = "Yes"

**Q12. NEED FOR ACTION/SUGGESTIONS (suggestionsAntiDrug)**
- **English:** What are your specific comments or suggestions regarding the barangay's anti-drug programs and initiatives?
- **Type:** Textarea

---

## Section 4: Social Protection and Security

### Part A: Barangay Health Services

**Q1. AWARENESS (awarenessHealthServices)**
- **English:** Are you aware that the barangay has a Health Station/Center with personnel like Barangay Health Workers (BHWs) who provide services such as check-ups and immunization?
- **Type:** Radio (Yes, No)
- **Skip Logic:** If "No" → Skip to Q5 (Part B)

**Q2. AVAILMENT/EXPERIENCE (availmentHealthServices)**
- **English:** Have you or a member of your family ever visited the Barangay Health Station or received a service from a BHW?
- **Type:** Radio (Yes, No)
- **Dependency:** Only if Q1 = "Yes"
- **Skip Logic:** If "No" → Skip to Q5 (Part B)

**Q3. SATISFACTION (satisfactionHealthServices)**
- **English:** How satisfied are you with the quality, availability, and staff service at our Barangay Health Station?
- **Type:** Radio (5, 4, 3, 2, 1)
- **Dependency:** Only if Q2 = "Yes"

**Q4. NEED FOR ACTION/SUGGESTIONS (suggestionsHealthServices)**
- **English:** What are your suggestions for improving the health services in our barangay? (e.g., more services, better hours, staff training)
- **Type:** Textarea

### Part B: Protection Services for Women and Children

**Q5. AWARENESS (awarenessWomenChildrenProtection)**
- **English:** Are you aware that the barangay has special programs and a dedicated desk (like the VAW Desk) to provide assistance and protection for women and children in distress?
- **Type:** Radio (Yes, No)
- **Note:** The questions file was truncated, but this follows the same pattern

---

## Section 5: Business Friendliness and Competitiveness

**Note:** Questions follow the same 4-stage funnel pattern (Awareness → Availment → Satisfaction → Need for Action) for business-related services.

---

## Section 6: Environmental Management

**Note:** Questions follow the same 4-stage funnel pattern (Awareness → Availment → Satisfaction → Need for Action) for environmental services.

---

## Funnel Scoring Methodology

For each service area, calculate:

1. **Awareness Score** = (No. Aware / 150 sample size) × 100%
2. **Availment Score** = (No. Availed / No. Aware) × 100%
3. **Satisfaction Score** = (No. Satisfied / No. Availed) × 100%
4. **Need for Action Score** = (No. Said "Need for Action" / No. Availed) × 100%

## Validation Notes for Interviewers

1. **Conditional Skip Logic:** Ensure "Hindi/No" responses properly skip subsequent questions
2. **Satisfaction Scale:** 5-point scale where 4-5 = Satisfied, 1-2 = Dissatisfied, 3 = Neutral
3. **Need for Action:** Any non-empty suggestion/comment counts as "Need for Action"
4. **Sample Size:** Target 150 completed surveys per barangay
5. **Language:** Use appropriate language (Filipino/English) based on respondent preference