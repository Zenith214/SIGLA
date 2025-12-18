import type { Language } from '@/contexts/LanguageContext'

export interface QuestionTranslation {
  bisaya: string
  filipino: string
  english: string
}

export interface SectionTranslations {
  [questionId: string]: QuestionTranslation
}

// NOTE: Please fill in the Bisaya translations from SURVEY-QUESTIONS-2-ELECTRIC-BOOGALOO.docx
// The Filipino and English translations are already in the current questions.ts file

export const translations: Record<string, SectionTranslations> = {
  financial: {
    // Part A: Barangay Projects
    awarenessProjects: {
      bisaya: "A. Mga Proyekto sa Barangay (Dalan, Barangay Hall, Health Station, ug uban pa)\n1. KAHIBALO:\nNahibalo ka ba nga gigamit sa barangay ang iyang pondo alang sa mga proyekto sa konstruksyon karong tuiga, sama sa pagpaayo sa mga dalan o pagtukod og mga pasilidad?",
      filipino: "A. Mga Proyekto ng Barangay (Kalsada, Barangay Hall, Health Station, atbp.)\n1. KAALAMAN:\nAlam mo ba na ginamit ng barangay ang pondo nito para sa mga proyektong konstruksyon ngayong taon, tulad ng pagpapaganda ng mga kalsada o pagtatayo ng mga pasilidad?",
      english: "A. Barangay Projects (Roads, Barangay Hall, Health Station, etc.)\n1. AWARENESS:\nAre you aware that the barangay has used its funds for construction projects this year, like improving roads or building facilities?"
    },
    benefitedProjects: {
      bisaya: "2. PAGGAMIT / PAGPAHIMULOS:\nIkaw ba personal nga nakakita, migamit, o nakabenepisyo sa bisan asa niining mga bag-ong proyekto?",
      filipino: "2. PAGGAMIT / PAGBENEPISYO:\nIkaw ba ay personal na nakakita, gumamit, o nakinabang sa alinman sa mga proyektong ito?",
      english: "2. AVAILMENT / EXPERIENCE:\nHave you personally seen, used, or benefited from any of these new projects?"
    },
    satisfactionProjects: {
      bisaya: "3. KATAGBAWAN:\nUnsa ka tagbaw sa kalidad ug kaayohan sa mga bag-ong proyekto sa barangay? Palihug gamita kini nga sukod:\n(5 - Hilabihan ka Tagbaw, 4 - Tagbaw, 3 - Neutral, 2 - Dili Tagbaw, 1 - Hilabihan ka Dili Tagbaw)",
      filipino: "3. KASIYAHAN:\nGaano ka nasisiyahan sa kalidad at pakinabang ng mga bagong proyekto ng barangay? Pakigamit ang sumusunod na sukat:\n(5 - Lubos na Nasiyahan, 4 - Nasiyahan, 3 - Neutral, 2 - Hindi Nasiyahan, 1 - Lubos na Hindi Nasiyahan)",
      english: "3. SATISFACTION:\nHow satisfied are you with the quality and usefulness of these new barangay projects? Please use this scale:\n(5 - Very Satisfied, 4 - Satisfied, 3 - Neutral, 2 - Dissatisfied, 1 - Very Dissatisfied)"
    },
    nfaBinaryProjects: {
      bisaya: "4. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "4. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsProjects: {
      bisaya: "5. SUGYOT:\nUnsa ang imong mga partikular nga komentaryo o sugyot mahitungod sa mga proyekto sa konstruksyon sa barangay? (pananglitan, lokasyon, kalidad, unsa pa ang kinahanglan tukuron?)",
      filipino: "5. MUNGKAHI:\nAno ang iyong mga partikular na komento o mungkahi tungkol sa mga proyektong konstruksyon ng barangay? (hal., lokasyon, kalidad, ano pa ang dapat itayo?)",
      english: "5. SUGGESTION:\nWhat are your specific comments or suggestions about the barangay's construction projects? (e.g., location, quality, what should be built next?)"
    },
    
    // Conditional: Unawareness Reason for Projects
    projects_unawareness_reason: {
      bisaya: "<strong>RASON SA KAKULANG SA KAHIBALO:</strong><br/>Adunay daghang rason nganong ang usa ka residente dili makadungog bahin sa usa ka serbisyo. Gikan niining listahan, unsa sa imong hunahuna ang nag-unang rason nga wala ka makahibalo niini?",
      filipino: "<strong>DAHILAN NG KAWALAN NG KAALAMAN:</strong><br/>Maraming dahilan kung bakit hindi nababalitaan ng isang residente ang isang serbisyo. Mula sa listahang ito, ano sa tingin mo ang pangunahing dahilan kung bakit hindi mo ito nalaman?",
      english: "<strong>REASON FOR UNAWARENESS:</strong><br/>There are many reasons why a resident might not hear about a service. From this list, what do you think is the main reason you were not aware of this one?"
    },
    
    // Conditional: Non-Availment Reason for Projects
    projects_non_availment_reason: {
      bisaya: "<strong>RASON SA DILI PAGGAMIT:</strong><br/>Imong gihisgotan nga nahibal-an nimo kini nga serbisyo apan wala nimo kini gigamit. Gikan niining listahan, unsa ang nag-unang rason nga wala nimo o sa imong panimalay kini gipahimuslan?",
      filipino: "<strong>DAHILAN NG HINDI PAGGAMIT:</strong><br/>Nabanggit ninyo na alam ninyo ang tungkol sa serbisyong ito ngunit hindi ninyo ito ginamit. Mula sa listahang ito, ano ang pangunahing dahilan kung bakit hindi ninyo o ng inyong sambahayan ito ginamit?",
      english: "<strong>REASON FOR NON-AVAILMENT:</strong><br/>You mentioned you were aware of this service but didn't use it. From this list, what was the main reason you or your household did not avail of it?"
    },
    
    // Part B: Financial Transparency
    awarenessFinancial: {
      bisaya: "B. Pinansyal nga Kahibalo ug Transparency (Mga Paskil ug Asembleya):\n5. KAHIBALO:\nNahibalo ka ba nga ang barangay kinahanglan magpaskil sa iyang badyet ug gasto sa usa ka pampublikong bulletin board (Full Disclosure Board) ug hisgutan kini sa mga Barangay Assembly?",
      filipino: "B. Pananalaping Kaalaman at Transparency (Mga Paskil at Asembleya):\n5. KAALAMAN:\nAlam mo ba na ang barangay ay kailangang magpaskil ng badyet at gastusin nito sa isang pampublikong bulletin board (Full Disclosure Board) at talakayin ito sa mga Barangay Assembly?",
      english: "B. Financial Knowledge and Transparency (Postings and Assemblies):\n5. AWARENESS:\nAre you aware that the barangay is supposed to post its budget and expenses on a public bulletin board (Full Disclosure Board) and discuss them during Barangay Assemblies?"
    },
    usedFinancialInfo: {
      bisaya: "6. PAGGAMIT / PAGTAMBONG:\nIkaw ba personal nga naningkamot sa pagpangita niini nga impormasyon o mitambong sa usa ka Barangay Assembly diin gihisgutan ang badyet?",
      filipino: "6. PAGGAMIT / PAGDALO:\nIkaw ba ay personal na nagsikap hanapin ang impormasyong ito o dumalo sa isang Barangay Assembly kung saan tinalakay ang badyet?",
      english: "6. AVAILMENT / ATTENDANCE:\nHave you personally tried to look for this information or attended a Barangay Assembly where the budget was discussed?"
    },
    satisfactionFinancial: {
      bisaya: "7. KATAGBAWAN:\nUnsa ka tagbaw sa katin-aw ug kadali sa pagkuha sa pinansyal nga impormasyon sa barangay?",
      filipino: "7. KASIYAHAN:\nGaano ka nasisiyahan sa kalinawan at kadaling makuha ng impormasyong pinansyal ng barangay?",
      english: "7. SATISFACTION:\nHow satisfied are you with the clarity and accessibility of the barangay's financial information?"
    },
    nfaBinaryFinancial: {
      bisaya: "8. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "8. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "8. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsFinancial: {
      bisaya: "9. SUGYOT:\nUnsa ang mahimo sa barangay aron mas sayon masabtan ug makuha sa mga residente ang badyet ug gasto niini?",
      filipino: "9. MUNGKAHI:\nAno ang maaaring gawin ng barangay upang mas madaling maunawaan at makuha ng mga residente ang badyet at gastusin nito?",
      english: "9. SUGGESTION:\nWhat can the barangay do to make its budget and spending easier for residents to understand and access?"
    },
    
    // Conditional: Unawareness Reason for Financial
    financial_unawareness_reason: {
      bisaya: "<strong>RASON SA KAKULANG SA KAHIBALO:</strong><br/>Adunay daghang rason nganong ang usa ka residente dili makadungog bahin sa usa ka serbisyo. Gikan niining listahan, unsa sa imong hunahuna ang nag-unang rason nga wala ka makahibalo niini?",
      filipino: "<strong>DAHILAN NG KAWALAN NG KAALAMAN:</strong><br/>Maraming dahilan kung bakit hindi nababalitaan ng isang residente ang isang serbisyo. Mula sa listahang ito, ano sa tingin mo ang pangunahing dahilan kung bakit hindi mo ito nalaman?",
      english: "<strong>REASON FOR UNAWARENESS:</strong><br/>There are many reasons why a resident might not hear about a service. From this list, what do you think is the main reason you were not aware of this one?"
    },
    
    // Conditional: Non-Availment Reason for Financial
    financial_non_availment_reason: {
      bisaya: "<strong>RASON SA DILI PAGGAMIT:</strong><br/>Imong gihisgotan nga nahibal-an nimo kini nga serbisyo apan wala nimo kini gigamit. Gikan niining listahan, unsa ang nag-unang rason nga wala nimo o sa imong panimalay kini gipahimuslan?",
      filipino: "<strong>DAHILAN NG HINDI PAGGAMIT:</strong><br/>Nabanggit ninyo na alam ninyo ang tungkol sa serbisyong ito ngunit hindi ninyo ito ginamit. Mula sa listahang ito, ano ang pangunahing dahilan kung bakit hindi ninyo o ng inyong sambahayan ito ginamit?",
      english: "<strong>REASON FOR NON-AVAILMENT:</strong><br/>You mentioned you were aware of this service but didn't use it. From this list, what was the main reason you or your household did not avail of it?"
    },
    
    // Part C: Social Programs
    awarenessSocialPrograms: {
      bisaya: "C. Mga Programa sa Katilingban (Tabang sa Seniors/PWDs, Kalihokan alang sa Kabatan-onan, ug uban pa):\n9. KAHIBALO:\nNahibalo ka ba nga ang barangay naggahin og pondo alang sa mga programa sa katilingban, sama sa pinansyal nga tabang alang sa mga Senior Citizen ug PWDs, o mga kalihokan alang sa kabatan-onan (SK)?",
      filipino: "C. Mga Programang Panlipunan (Tulong sa Seniors/PWDs, Aktibidad para sa Kabataan, atbp.):\n9. KAALAMAN:\nAlam mo ba na ang barangay ay naglalaan ng pondo para sa mga programang panlipunan, tulad ng tulong pinansyal para sa mga Senior Citizen at PWDs, o mga aktibidad para sa kabataan (SK)?",
      english: "C. Social Programs (Assistance for Seniors/PWDs, Youth Activities, etc.):\n9. AWARENESS:\nAre you aware that the barangay allocates funds for social programs, such as financial assistance for Senior Citizens and PWDs, or activities for the youth (SK)?"
    },
    participatedSocialPrograms: {
      bisaya: "10. PAGGAMIT / PAKI-APIL:\nIkaw ba, usa ka sakop sa pamilya, o suod nga silingan naningkamot sa pagpahimulos o pag-apil sa bisan asa niining mga programa?",
      filipino: "10. PAGGAMIT / PAGLAHOK:\nIkaw ba, isang kapamilya, o malapit na kapitbahay ay nagtangkang makinabang o lumahok sa alinman sa mga programang ito?",
      english: "10. AVAILMENT / PARTICIPATION:\nHave you, a family member, or a close neighbor tried to avail of or participate in any of these programs?"
    },
    satisfactionSocialPrograms: {
      bisaya: "11. KATAGBAWAN:\nBase sa imong kasinatian o obserbasyon, unsa ka tagbaw sa paghatag ug epekto sa mga programa sa katilingban sa barangay?",
      filipino: "11. KASIYAHAN:\nBatay sa iyong karanasan o obserbasyon, gaano ka nasisiyahan sa paghahatid at epekto ng mga programang panlipunan ng barangay?",
      english: "11. SATISFACTION:\nBased on your experience or observation, how satisfied are you with the delivery and impact of these social programs?"
    },
    nfaBinarySocialPrograms: {
      bisaya: "12. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "12. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "12. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsSocialPrograms: {
      bisaya: "13. SUGYOT:\nUnsa ang imong sugyot aron mapauswag ang mga programa sa katilingban sa barangay? Aduna pa bay lain nga matang sa tabang nga gikinahanglan?",
      filipino: "13. MUNGKAHI:\nAno ang iyong mungkahi para mapabuti ang mga programang panlipunan ng barangay? Mayroon pa bang ibang uri ng tulong na kailangan?",
      english: "13. SUGGESTION:\nWhat are your suggestions for improving the barangay's social programs? Are there other types of assistance that are needed?"
    },
    
    // Conditional: Unawareness Reason for Social Programs
    socialPrograms_unawareness_reason: {
      bisaya: "<strong>RASON SA KAKULANG SA KAHIBALO:</strong><br/>Adunay daghang rason nganong ang usa ka residente dili makadungog bahin sa usa ka serbisyo. Gikan niining listahan, unsa sa imong hunahuna ang nag-unang rason nga wala ka makahibalo niini?",
      filipino: "<strong>DAHILAN NG KAWALAN NG KAALAMAN:</strong><br/>Maraming dahilan kung bakit hindi nababalitaan ng isang residente ang isang serbisyo. Mula sa listahang ito, ano sa tingin mo ang pangunahing dahilan kung bakit hindi mo ito nalaman?",
      english: "<strong>REASON FOR UNAWARENESS:</strong><br/>There are many reasons why a resident might not hear about a service. From this list, what do you think is the main reason you were not aware of this one?"
    },
    
    // Conditional: Non-Availment Reason for Social Programs
    socialPrograms_non_availment_reason: {
      bisaya: "<strong>RASON SA DILI PAGGAMIT:</strong><br/>Imong gihisgotan nga nahibal-an nimo kini nga serbisyo apan wala nimo kini gigamit. Gikan niining listahan, unsa ang nag-unang rason nga wala nimo o sa imong panimalay kini gipahimuslan?",
      filipino: "<strong>DAHILAN NG HINDI PAGGAMIT:</strong><br/>Nabanggit ninyo na alam ninyo ang tungkol sa serbisyong ito ngunit hindi ninyo ito ginamit. Mula sa listahang ito, ano ang pangunahing dahilan kung bakit hindi ninyo o ng inyong sambahayan ito ginamit?",
      english: "<strong>REASON FOR NON-AVAILMENT:</strong><br/>You mentioned you were aware of this service but didn't use it. From this list, what was the main reason you or your household did not avail of it?"
    },
    
    // Part D: Corruption (Custom Skip Logic - NOT using standard conditional modules)
    awarenessCorruption: {
      bisaya: "D. Panglantaw sa Korapsyon:\n13. KAHIBALO:\nNahibalo ba kamo kung adunay mga lagda ug proseso batok sa korapsyon sa atong barangay o lungsod, ug nga ang mga opisyal kinahanglan mag-alagad nga matinud-anon?",
      filipino: "D. Perception of Corruption:\n13. KAALAMAN:\nAlam ba ninyo kung may mga patakaran at proseso laban sa korapsyon sa ating barangay o bayan, at na ang mga opisyal ay dapat maglingkod nang tapat?",
      english: "D. Perception of Corruption:\n13. AWARENESS:\nAre you aware that our barangay or municipality is expected to follow rules and processes to prevent corruption, and that officials should serve with integrity?"
    },
    experiencedCorruption: {
      bisaya: "14. KASINATIAN:\nSa miaging 12 ka bulan, kamo ba (o bisan kinsa nga miyembro sa inyong panimalay) nakasinati o nakasaksi sa bisan unsang buhat sa opisyal o kawani sa barangay o lungsod nga inyong giisip nga matang sa korapsyon?",
      filipino: "14. KARANASAN:\nSa nakalipas na 12 buwan, kayo ba (o sinumang miyembro ng inyong pamilya) ay nakaranas o nakasaksi ng anumang gawain ng opisyal o kawani ng barangay o bayan na maituturing ninyong uri ng korapsyon?",
      english: "14. EXPERIENCE:\nIn the past 12 months, did you (or any of your household members) experience or witness any action by a barangay or municipal official/staff that you consider a form of corruption?"
    },
    detailsCorruption: {
      bisaya: "15. MGA DETALYE SA KASINATIAN:\nUnsa ang partikular nga buhat nga inyong nasinati o nasaksihan? (Palihug ibutang ang partikular nga serbisyo o sitwasyon. Siguruha nga kini unang kasinatian gikan kaninyo o miyembro sa inyong panimalay.)",
      filipino: "15. MGA DETALYE NG KARANASAN:\nAno ang partikular na gawain na inyong naranasan o nasaksihan? (Pakilagay ang partikular na serbisyo o sitwasyon. Tiyakin na ito ay unang karanasan mula sa inyo o miyembro ng inyong pamilya.)",
      english: "15. DETAILS OF EXPERIENCE:\nWhat specific action or practice did you experience or witness? (Please specify the service or situation. This must be a first-hand experience from you or a household member.)"
    },
    reportedCorruption: {
      bisaya: "16. PAGREPORT:\nGireport ba ninyo ang inyong nasinati o nasaksihan sa bisan unsang awtoridad sa gobyerno?",
      filipino: "16. PAG-UULAT:\nIdinulog ba ninyo ang inyong naranasan o nasaksihan sa alinmang awtoridad sa pamahalaan?",
      english: "16. REPORTING:\nDid you report your experience to any government authority?"
    },
    reasonsNotReporting: {
      bisaya: "17. MGA HINUNGDAN SA DILI PAGREPORT:\nUnsa ang nag-unang hinungdan ngano wala ninyo kini gireport?",
      filipino: "17. MGA DAHILAN NG HINDI PAG-UULAT:\nAno ang pangunahing dahilan kung bakit hindi ninyo iniulat?",
      english: "17. REASONS FOR NOT REPORTING:\nWhat was the main reason you did not report the incident?"
    },
    satisfactionReportResponse: {
      bisaya: "18. KATAGBAWAN SA TUBAG:\nKung gireport ninyo, mitubag ba ang mga awtoridad sa inyong reklamo ug unsa ka tagbaw kamo sa ilang aksyon?",
      filipino: "18. KASIYAHAN SA TUGON:\nKung iniulat ninyo, tumugon ba ang mga awtoridad sa inyong reklamo at nasiyahan ba kayo sa naging tugon?",
      english: "18. SATISFACTION WITH RESPONSE:\nIf you reported it, did the authorities respond to your complaint, and how satisfied were you with their action?"
    },
    suggestionsCorruption: {
      bisaya: "19. SUGYOT:\nUnsa ang inyong sugyot aron mas malikayan o masugpo ang korapsyon sa atong barangay o lungsod?",
      filipino: "19. MUNGKAHI:\nAno ang inyong mungkahi para mas maiwasan o masugpo ang korapsyon sa ating barangay o bayan?",
      english: "19. SUGGESTION:\nWhat are your suggestions to better prevent or address corruption in our barangay or municipality?"
    },
  },
  
  // Add other sections here following the same pattern
  // For now, I'll add placeholders that you can fill in from the Word document
  disaster: {
    // Part A: Disaster Information and Early Warning
    awarenessDisasterInfo: {
      bisaya: "A. Impormasyon ug Sayo nga Pahimangno Bahin sa Kalamidad\n1. KAHIBALO:\nNakahibalo ba ka nga ang barangay adunay mga plano ug sistema aron ipahibalo ang mga residente bahin sa mga posibleng katalagman (sama sa mga lugar nga dali bahaon) ug maghatag ug pahimangno sa dili pa mahitabo ang usa ka kalamidad?",
      filipino: "A. Impormasyon at Maagang Babala Tungkol sa Sakuna\n1. KAALAMAN:\nAlam mo ba na ang barangay ay may mga plano at sistema upang ipaalam sa mga residente ang mga posibleng panganib (tulad ng mga lugar na madaling bahain) at magbigay ng babala bago mangyari ang isang sakuna?",
      english: "A. Disaster Information and Early Warning\n1. AWARENESS:\nAre you aware that the barangay has plans and systems to inform residents about potential risks (like flood-prone areas) and to give warnings before a disaster strikes?"
    },
    availmentDisasterInfo: {
      bisaya: "2. PAGGAMIT / KASINATIAN:\nIkaw ba mismo nakadawat ug impormasyon bahin sa kalamidad (sama sa polyeto o text), nakakita ug hazard map para sa atong lugar, o nakadungog ug pahimangno (pananglitan, gikan sa sirena, megaphone, o opisyal sa barangay)?",
      filipino: "2. PAGGAMIT / KARANASAN:\nIkaw ba mismo ay nakatanggap ng anumang impormasyon na may kinalaman sa sakuna (tulad ng polyeto o text), nakakita ng hazard map para sa ating lugar, o nakarinig ng maagang babala (halimbawa, mula sa sirena, megaphone, o opisyal ng barangay) mula sa barangay?",
      english: "2. AVAILMENT / EXPERIENCE:\nHave you personally received any disaster-related information (like a pamphlet or text), seen a hazard map for our area, or heard an early warning (e.g., from a siren, megaphone, or barangay official) from the barangay?"
    },
    satisfactionDisasterInfo: {
      bisaya: "3. KASIYAHAN:\nUnsa ka kontento sa kasayuran, pagka-igo sa oras, ug kaepektibo sa mga pahimangno ug impormasyon bahin sa kalamidad nga gihatag sa barangay?",
      filipino: "3. KASIYAHAN:\nGaano ka nasisiyahan sa kalinawan, pagiging napapanahon, at bisa ng mga babala at impormasyong ibinibigay ng barangay tungkol sa sakuna?",
      english: "3. SATISFACTION:\nHow satisfied are you with the clarity, timeliness, and effectiveness of the disaster warnings and information provided by the barangay?"
    },
    nfaBinaryDisasterInfo: {
      bisaya: "4. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "4. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsDisasterInfo: {
      bisaya: "5. SUGYOT:\nUnsaon pagpaayo sa barangay sa paagi sa pagpahibalo ug pagpahimangno sa mga residente bahin sa mga kalamidad?",
      filipino: "5. MUNGKAHI:\nPaano mapapabuti ng barangay ang paraan ng pagbibigay ng impormasyon at babala sa mga residente tungkol sa mga sakuna?",
      english: "5. SUGGESTION:\nHow could the barangay improve the way it informs and warns residents about disasters?"
    },
    
    // Part B: Evacuation and Emergency Response
    awarenessEvacuation: {
      bisaya: "B. Ebakwasyon ug Mga Kapanguhaan sa Emerhensiya\n5. KAHIBALO:\nNakahibalo ba ka nga ang barangay adunay gitalaga nga evacuation center ug kinahanglan adunay mga gamit pang-emerhensiya ug usa ka response team nga andam sa panahon sa kalamidad?",
      filipino: "B. Ebakwasyon at Mga Kagamitang Pang-emerhensiya\n5. KAALAMAN:\nAlam mo ba na ang barangay ay may itinalagang evacuation center at dapat may nakahandang kagamitang pang-emerhensiya at response team para sa mga sakuna?",
      english: "B. Evacuation and Emergency Response Resources\n5. AWARENESS:\nAre you aware that the barangay has a designated evacuation center and should have emergency equipment and a response team ready for disasters?"
    },
    locationEvacuation: {
      bisaya: "6. PAGGAMIT / KASINATIAN:\nNakahibalo ba ka sa lokasyon sa gitalaga nga evacuation center para sa imong lugar o purok?",
      filipino: "6. PAGGAMIT / KARANASAN:\nAlam mo ba ang lokasyon ng pangunahing itinalagang evacuation center para sa inyong partikular na lugar o purok?",
      english: "6. AVAILMENT / EXPERIENCE:\nDo you know the location of the main designated evacuation center for your specific area or purok?"
    },
    satisfactionEvacuation: {
      bisaya: "7. KASIYAHAN:\nBase sa imong nahibal-an o nakit-an, unsa ka kumpiyansa ug kontento sa kahandam sa mga pasilidad sa evacuation ug kakayahan sa barangay sa pagtubag sa emerhensiya (pananglitan, rescue team, kagamitan)?",
      filipino: "7. KASIYAHAN:\nBatay sa iyong kaalaman o nakita, gaano ka katiwala at nasisiyahan sa kahandaan ng mga pasilidad ng evacuation at kakayahan ng barangay sa pagtugon sa emerhensiya (halimbawa, rescue team, kagamitan)?",
      english: "7. SATISFACTION:\nBased on what you know or have seen, how confident and satisfied are you with the readiness of our barangay's evacuation facilities and emergency response capabilities (e.g., rescue team, equipment)?"
    },
    nfaBinaryEvacuation: {
      bisaya: "8. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "8. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "8. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsEvacuation: {
      bisaya: "9. SUGYOT:\nUnsa ang imong mga suhestiyon aron mapauswag ang atong mga evacuation center o ang kakayahan sa barangay sa pagtubag panahon sa emerhensiya?",
      filipino: "9. MUNGKAHI:\nAno ang iyong mga mungkahi para mapabuti ang ating mga evacuation center o ang kakayahan ng barangay na tumugon sa panahon ng emerhensiya?",
      english: "9. SUGGESTION:\nWhat are your suggestions for improving our evacuation centers or the barangay's ability to respond during an emergency?"
    },
  },
  safety: {
    // Part A: Barangay Tanod Services
    awarenessTanods: {
      bisaya: "A. Kinatibuk-ang Kaluwasan ug Serbisyo sa Barangay Tanod (Peacekeeper)\n1. KAHIBALO:\nNakahibalo ba ka nga ang barangay adunay mga Tanod (peacekeepers) nga responsable sa pagpanglakat sa komunidad ug pagtubag sa mga isyu sa kaluwasan?",
      filipino: "A. Pangkalahatang Kaligtasan at Serbisyo ng Barangay Tanod (Peacekeeper)\n1. KAALAMAN:\nAlam mo ba na ang barangay ay may mga Tanod (peacekeepers) na responsable sa pagpapatrolya sa komunidad at pagtugon sa mga usapin ng kaligtasan?",
      english: "A. General Safety and Barangay Tanod (Peacekeeper) Services\n1. AWARENESS:\nAre you aware that the barangay has Tanods (peacekeepers) responsible for patrolling the community and responding to safety concerns?"
    },
    experienceTanods: {
      bisaya: "2. PAGGAMIT / KASINATIAN:\nIkaw ba mismo nakakita sa mga Tanod nga nagpapatrolya sa inyong lugar o nakaistorya nila tungod sa usa ka isyu sa kalinaw ug kahusay?",
      filipino: "2. PAGGAMIT / KARANASAN:\nIkaw ba mismo ay nakakita ng mga Tanod na nagpapatrolya sa inyong lugar o nakipag-ugnayan sa kanila tungkol sa isang usapin ng kapayapaan at kaayusan?",
      english: "2. AVAILMENT / EXPERIENCE:\nHave you personally seen the Tanods on patrol in your area or had to interact with them for a peace and order concern?"
    },
    satisfactionTanods: {
      bisaya: "3. KASIYAHAN:\nUnsa ka kontento sa kapakita, kadasig sa pagtubag, ug kaepektibo sa atong mga Barangay Tanod sa pagpanalipod sa komunidad?",
      filipino: "3. KASIYAHAN:\nGaano ka nasisiyahan sa kanilang presensya, bilis ng pagtugon, at bisa ng ating mga Barangay Tanod sa pagpapanatiling ligtas ng komunidad?",
      english: "3. SATISFACTION:\nHow satisfied are you with the visibility, responsiveness, and effectiveness of our Barangay Tanods in keeping the community safe?"
    },
    nfaBinaryTanods: {
      bisaya: "4. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "4. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsTanods: {
      bisaya: "5. SUGYOT:\nUnsa ang imong mga suhestiyon aron mapauswag ang kinatibuk-ang seguridad sa atong barangay o ang pagtrabaho sa atong mga Tanod?",
      filipino: "5. MUNGKAHI:\nAno ang iyong mga mungkahi para mapabuti ang pangkalahatang kaligtasan sa ating barangay o ang pagganap ng ating mga Tanod?",
      english: "5. SUGGESTION:\nWhat are your suggestions for improving the overall safety in our barangay or the performance of our Tanods?"
    },
    
    // Part B: Lupon (Dispute Resolution)
    awarenessLupon: {
      bisaya: "B. Pagsulbad sa Panagbangi sa Komunidad (Lupon)\n5. KAHIBALO:\nNakahibalo ba ka nga ang barangay adunay serbisyo sa mediation (Lupong Tagapamayapa) aron tabangan nga masulbad ang panagbangi sa mga residente, sama sa panaglalis sa mga silingan?",
      filipino: "B. Pag-aayos ng Alitan sa Komunidad (Lupon)\n5. KAALAMAN:\nAlam mo ba na ang barangay ay may serbisyo ng pagpapagitna (Lupong Tagapamayapa) upang tumulong sa pag-aayos ng alitan sa pagitan ng mga residente, tulad ng hindi pagkakaunawaan ng mga magkakapitbahay?",
      english: "B. Community Dispute Resolution (Lupon)\n5. AWARENESS:\nAre you aware that the barangay has a mediation service (Lupong Tagapamayapa) to help settle disputes between residents, like disagreements with neighbors?"
    },
    experienceLupon: {
      bisaya: "6. PAGGAMIT / KASINATIAN:\nIkaw ba, usa ka miyembro sa pamilya, o usa ka nahibal-an nakagamit na ba niini nga serbisyo aron matabangan sa pagsulbad og panagbangi?",
      filipino: "6. PAGGAMIT / KARANASAN:\nIkaw ba, isang kapamilya, o isang kakilala ay gumamit na ng serbisyong ito upang makatulong sa pag-aayos ng isang alitan?",
      english: "6. AVAILMENT / EXPERIENCE:\nHave you, a family member, or someone you know ever used this service to help settle a dispute?"
    },
    satisfactionLupon: {
      bisaya: "7. KASIYAHAN:\nBase sa imong kasinatian o nadungog, unsa ka kontento sa pagkatarong ug kaepektibo sa proseso sa barangay sa pagsulbad og panagbangi?",
      filipino: "7. KASIYAHAN:\nBatay sa iyong karanasan o iyong narinig, gaano ka nasisiyahan sa pagiging makatarungan at bisa ng proseso ng barangay sa pag-aayos ng alitan?",
      english: "7. SATISFACTION:\nBased on your experience or what you've heard, how satisfied are you with the fairness and effectiveness of the barangay's dispute settlement process?"
    },
    nfaBinaryLupon: {
      bisaya: "8. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "8. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "8. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsLupon: {
      bisaya: "9. SUGYOT:\nAduna ka bay suhestiyon kung unsaon pa pagpaayo sa barangay aron mas matabangan ang mga residente sa pagsulbad og panagbangi nga malinawon?",
      filipino: "9. MUNGKAHI:\nMayroon ka bang mungkahi kung paano mas matutulungan ng barangay ang mga residente na maresolba ang mga alitan nang mapayapa?",
      english: "9. SUGGESTION:\nDo you have any suggestions on how the barangay can better help residents resolve conflicts peacefully?"
    },
    
    // Part C: Anti-Drug Programs
    awarenessAntiDrug: {
      bisaya: "C. Mga Programa Batok sa Ilegal nga Droga\n9. KAHIBALO:\nNakahibalo ba ka nga ang barangay apil sa mga programa batok sa ilegal nga droga, lakip na ang mga kampanya sa impormasyon ug referral system para sa rehabilitasyon?",
      filipino: "C. Mga Programang Laban sa Ilegal na Droga\n9. KAALAMAN:\nAlam mo ba na ang barangay ay kasali sa mga programa laban sa ilegal na droga, kabilang ang mga kampanyang pang-impormasyon at referral system para sa rehabilitasyon?",
      english: "C. Anti-Illegal Drug Programs\n9. AWARENESS:\nAre you aware that the barangay is involved in programs to combat illegal drugs, including information campaigns and referral systems for rehabilitation?"
    },
    experienceAntiDrug: {
      bisaya: "10. PAGGAMIT / KASINATIAN:\nIkaw ba mismo nakakita o nakadawat ug impormasyon (sama sa poster, polyeto, o panagsulti) gikan sa kampanya sa barangay batok sa droga?",
      filipino: "10. PAGGAMIT / KARANASAN:\nIkaw ba mismo ay nakakita o nakatanggap ng anumang impormasyon (tulad ng poster, polyeto, o talakayan) mula sa kampanya ng barangay laban sa droga?",
      english: "10. AVAILMENT / EXPERIENCE:\nHave you personally seen or received any information (like a poster, leaflet, or talk) from the barangay's anti-drug campaign?"
    },
    satisfactionAntiDrug: {
      bisaya: "11. KASIYAHAN:\nUnsa ka kontento sa kinatibuk-ang paningkamot sa barangay sa pag-atubang sa isyu sa ilegal nga droga sulod sa atong komunidad?",
      filipino: "11. KASIYAHAN:\nGaano ka nasisiyahan sa pangkalahatang pagsisikap ng barangay na tugunan ang isyu ng ilegal na droga sa ating komunidad?",
      english: "11. SATISFACTION:\nHow satisfied are you with the barangay's overall efforts to address the issue of illegal drugs within our community?"
    },
    nfaBinaryAntiDrug: {
      bisaya: "12. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "12. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "12. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsAntiDrug: {
      bisaya: "13. SUGYOT:\nUnsa ang imong espesipikong mga komento o suhestiyon bahin sa mga programa ug inisyatibo sa barangay batok sa droga?",
      filipino: "13. MUNGKAHI:\nAno ang iyong mga partikular na komento o mungkahi tungkol sa mga programa at inisyatiba ng barangay laban sa droga?",
      english: "13. SUGGESTION:\nWhat are your specific comments or suggestions regarding the barangay's anti-drug programs and initiatives?"
    },
  },
  social: {
    // Part A: Health Services
    awarenessHealthServices: {
      bisaya: "A. Mga Serbisyo sa Panglawas sa Barangay\n1. KAHIBALO:\nNakahibalo ba ka nga ang barangay adunay Health Station/Center nga adunay mga personnel sama sa Barangay Health Workers (BHWs) nga naghatag ug mga serbisyo sama sa check-up ug pagpabakuna?",
      filipino: "A. Mga Serbisyong Pangkalusugan ng Barangay\n1. KAALAMAN:\nAlam mo ba na ang barangay ay may Health Station/Center na may mga tauhan tulad ng Barangay Health Workers (BHWs) na nagbibigay ng mga serbisyo gaya ng check-up at bakuna?",
      english: "A. Barangay Health Services\n1. AWARENESS:\nAre you aware that the barangay has a Health Station/Center with personnel like Barangay Health Workers (BHWs) who provide services such as check-ups and immunization?"
    },
    availmentHealthServices: {
      bisaya: "2. PAGGAMIT / KASINATIAN:\nIkaw ba o usa ka miyembro sa imong pamilya nakabisita na ba sa Barangay Health Station o nakadawat ug serbisyo gikan sa usa ka BHW?",
      filipino: "2. PAGGAMIT / KARANASAN:\nIkaw ba o isang miyembro ng iyong pamilya ay nakapunta na sa Barangay Health Station o nakatanggap ng serbisyo mula sa isang BHW (Barangay Health Worker)?",
      english: "2. AVAILMENT / EXPERIENCE:\nHave you or a member of your family ever visited the Barangay Health Station or received service from a BHW?"
    },
    satisfactionHealthServices: {
      bisaya: "3. KASIYAHAN:\nUnsa ka kontento sa kalidad, pagkaanaa, ug serbisyo sa mga kawani sa atong Barangay Health Station?",
      filipino: "3. KASIYAHAN:\nGaano ka nasisiyahan sa kalidad, pagkakaroon, at serbisyo ng mga tauhan sa ating Barangay Health Station?",
      english: "3. SATISFACTION:\nHow satisfied are you with the quality, availability, and staff service at our Barangay Health Station?"
    },
    nfaBinaryHealthServices: {
      bisaya: "4. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "4. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsHealthServices: {
      bisaya: "5. SUGYOT:\nUnsa ang imong mga suhestiyon aron mapauswag ang mga serbisyo sa panglawas sa atong barangay? (pananglitan, dugang nga serbisyo, mas maayo nga oras, pagbansay sa kawani)",
      filipino: "5. MUNGKAHI:\nAno ang iyong mga mungkahi para mapabuti ang mga serbisyong pangkalusugan sa ating barangay? (halimbawa, dagdag na serbisyo, mas maayos na oras, pagsasanay ng mga tauhan)",
      english: "5. SUGGESTION:\nWhat are your suggestions for improving the health services in our barangay? (e.g., more services, better hours, staff training)"
    },
    
    // Part B: Women and Children Protection
    awarenessWomenChildrenProtection: {
      bisaya: "B. Mga Serbisyo sa Proteksyon para sa mga Kababayen-an ug Kabataan\n5. KAHIBALO:\nNakahibalo ba ka nga ang barangay adunay espesyal nga mga programa ug nakalaang desk (sama sa VAW Desk) aron maghatag ug tabang ug proteksyon para sa mga kababayen-an ug kabataan nga nagkinahanglan?",
      filipino: "B. Mga Serbisyo ng Proteksyon para sa mga Kababaihan at Bata\n5. KAALAMAN:\nAlam mo ba na ang barangay ay may mga espesyal na programa at nakalaang desk (tulad ng VAW Desk) upang magbigay ng tulong at proteksyon para sa mga kababaihan at bata na nasa panganib?",
      english: "B. Protection Services for Women and Children\n5. AWARENESS:\nAre you aware that the barangay has special programs and a dedicated desk (like the VAW Desk) to provide assistance and protection for women and children in distress?"
    },
    availmentWomenChildrenProtection: {
      bisaya: "6. PAGGAMIT / KASINATIAN:\nNakahibalo ba ka kung asa o unsaon makakuha ug tabang gikan sa mga serbisyong ini ang usa ka tawo sa komunidad kung kinahanglan nila?",
      filipino: "6. PAGGAMIT / KARANASAN:\nAlam mo ba kung saan o paano makakakuha ng tulong mula sa mga serbisyong ito ang isang tao sa komunidad kung kakailanganin nila?",
      english: "6. AVAILMENT / EXPERIENCE:\nDo you know where or how someone in the community could get help from these services if they needed to?"
    },
    satisfactionWomenChildrenProtection: {
      bisaya: "7. KASIYAHAN:\nUnsa ka kumpiyansa ug kontento sa kakayahan sa barangay nga maghatag ug luwas, kumpidensyal, ug epektibong tubag aron maprotektahan ang mga kababayen-an ug kabataan?",
      filipino: "7. KASIYAHAN:\nGaano ka katiwala at nasisiyahan sa kakayahan ng barangay na magbigay ng ligtas, kumpidensyal, at epektibong tugon upang maprotektahan ang mga kababaihan at bata?",
      english: "7. SATISFACTION:\nHow confident and satisfied are you in the barangay's ability to provide a safe, confidential, and effective response to protect women and children?"
    },
    nfaBinaryWomenChildrenProtection: {
      bisaya: "8. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "8. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "8. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsWomenChildrenProtection: {
      bisaya: "9. SUGYOT:\nUnsa pa ang mahimo sa barangay aron masiguro ang kaluwasan ug kaayohan sa mga kababayen-an ug kabataan sa atong komunidad?",
      filipino: "9. MUNGKAHI:\nAno pa ang maaaring gawin ng barangay upang matiyak ang kaligtasan at kapakanan ng mga kababaihan at bata sa ating komunidad?",
      english: "9. SUGGESTION:\nWhat more can the barangay do to ensure the safety and well-being of women and children in our community?"
    },
    
    // Part C: Community Participation
    awarenessCommunityParticipation: {
      bisaya: "C. Partisipasyon ug Kalamboan sa Komunidad\n9. KAHIBALO:\nNakahibalo ba ka nga ang barangay adunay mga programa para sa mga residente aron makapakita sa partisipasyon sa komunidad, sama sa Kasambahay Desk para sa mga kasambahay, o Barangay Community Garden?",
      filipino: "C. Pakikilahok at Pag-unlad ng Komunidad\n9. KAALAMAN:\nAlam mo ba na ang barangay ay may mga programa para sa mga residente upang makibahagi sa komunidad, tulad ng Kasambahay Desk para sa mga kasambahay, o Barangay Community Garden?",
      english: "C. Community Participation and Development\n9. AWARENESS:\nAre you aware that the barangay has programs for residents to get involved in the community, like a Kasambahay Desk for domestic helpers, or a Barangay Community Garden?"
    },
    availmentCommunityParticipation: {
      bisaya: "10. PAGGAMIT / KASINATIAN:\nIkaw ba mismo nakilahok, o nakakita sa uban nga residente nga nag-apil, sa bisan asa niini nga mga kalihokan o serbisyo sa komunidad?",
      filipino: "10. PAGGAMIT / KARANASAN:\nIkaw ba mismo ay nakilahok, o nakakita ng ibang mga residente na nakikilahok, sa alinman sa mga gawaing pangkomunidad o serbisyo na ito?",
      english: "10. AVAILMENT / EXPERIENCE:\nHave you personally participated in, or seen other residents participating in, any of these community activities or services?"
    },
    satisfactionCommunityParticipation: {
      bisaya: "11. KASIYAHAN:\nUnsa ka kontento sa mga oportunidad nga gihatag sa barangay aron makapakita ang mga residente sa kinabuhi ug kalamboan sa komunidad?",
      filipino: "11. KASIYAHAN:\nGaano ka nasisiyahan sa mga pagkakataong ibinibigay ng barangay para makibahagi ang mga residente sa buhay at pag-unlad ng komunidad?",
      english: "11. SATISFACTION:\nHow satisfied are you with the opportunities the barangay provides for residents to get involved in community life and development?"
    },
    nfaBinaryCommunityParticipation: {
      bisaya: "12. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "12. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "12. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsCommunityParticipation: {
      bisaya: "13. SUGYOT:\nUnsa nga klase sa mga programa o kalihokan sa komunidad ang gusto nimo nga sugdan o mapauswag sa barangay?",
      filipino: "13. MUNGKAHI:\nAnong uri ng mga programang pangkomunidad o aktibidad ang nais mong simulan o pagandahin pa ng barangay?",
      english: "13. SUGGESTION:\nWhat community programs or activities would you like the barangay to start or improve?"
    },
  },
  business: {
    // Part A: Barangay Clearance for Business
    awarenessBusinessClearance: {
      bisaya: "A. Pag-isyu sa Barangay Clearance para sa Negosyo\n1. KAHIBALO:\nKabalo ba ka nga kinahanglan mangayo ang mga residente og Barangay Clearance sa barangay hall kung magsugod og negosyo o mo-apply para sa ubang permit (sama sa building permit)?",
      filipino: "A. Pag-isyu ng Barangay Clearance para sa Negosyo\n1. KAALAMAN:\nAlam mo ba na ang mga residente ay kailangang kumuha ng Barangay Clearance mula sa barangay hall kapag magsisimula ng negosyo o mag-aapply para sa ilang permit (tulad ng building permit)?",
      english: "A. Issuance of Barangay Clearance for Business\n1. AWARENESS:\nAre you aware that residents need to secure a Barangay Clearance from the barangay hall when starting a business or applying for certain permits (like building permits)?"
    },
    availmentBusinessClearance: {
      bisaya: "2. PAGGAMIT / KASINATIAN:\nIkaw ba o usa ka miyembro sa imong panimalay nakapadawat o naka-apply na ba og Barangay Business Clearance o susamang permit gikan sa atong barangay?",
      filipino: "2. PAGGAMIT / KARANASAN:\nIkaw ba o isang miyembro ng iyong sambahayan ay nakapag-apply na ng Barangay Business Clearance o katulad na permit mula sa ating barangay?",
      english: "2. AVAILMENT / EXPERIENCE:\nHave you or a member of your household ever applied for a Barangay Business Clearance or a similar permit from our barangay?"
    },
    satisfactionBusinessClearance: {
      bisaya: "3. KASIYAHAN:\nUnsa ka kontento ka sa tibuok proseso sa pagkuha sa clearance, apil na ang kadali sa serbisyo, bayronon, ug kaabtik sa mga kawani?",
      filipino: "3. KASIYAHAN:\nGaano ka nasiyahan sa kabuuang proseso ng pagkuha ng clearance, isinasaalang-alang ang bilis ng serbisyo, mga bayarin, at pagiging matulungin ng mga kawani?",
      english: "3. SATISFACTION:\nHow satisfied were you with the overall process of getting the clearance, considering the speed of service, the fees, and the helpfulness of the staff?"
    },
    nfaBinaryBusinessClearance: {
      bisaya: "4. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "4. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsBusinessClearance: {
      bisaya: "5. SUGYOT:\nUnsa man ang imong mga espesipikong sugyot aron mahimong mas paspas ug mas sayon ang proseso sa pagkuha sa business clearances o ubang permit gikan sa barangay?",
      filipino: "5. MUNGKAHI:\nAno ang iyong mga partikular na mungkahi upang maging mas mabilis at mas madali ang proseso ng pagkuha ng business clearances o iba pang permit mula sa barangay?",
      english: "5. SUGGESTION:\nWhat are your specific suggestions for making the process of getting business clearances or other permits from the barangay faster and easier?"
    },
  },
  environmental: {
    // Part A: Solid Waste Management
    awarenessWasteManagement: {
      bisaya: "A. Pagdumala sa Solid Waste (Pagkolekta ug Pagbulag sa Basura)\n1. KAHIBALO:\nKabalo ba ka nga ang barangay adunay programa para sa solid waste management, nga naglakip sa mga lagda sa pagbulag sa basura (sama sa biodegradable ug non-biodegradable) ug sistema sa pagkuha sa basura?",
      filipino: "A. Pamamahala ng Solid Waste (Pangongolekta at Paghihiwalay ng Basura)\n1. KAALAMAN:\nAlam mo ba na ang barangay ay may programa para sa solid waste management, na kinabibilangan ng mga patakaran sa paghihiwalay ng basura (halimbawa, nabubulok at di-nabubulok) at isang sistema para sa pangongolekta ng basura?",
      english: "A. Solid Waste Management (Garbage Collection & Segregation)\n1. AWARENESS:\nAre you aware that the barangay has a solid waste management program, which includes rules for segregating your trash (e.g., biodegradable vs. non-biodegradable) and a system for garbage collection?"
    },
    availmentWasteManagement: {
      bisaya: "2. PAGGAMIT / KASINATIAN:\nIkaw ug ang imong panimalay ba aktibong mosunod sa mga lagda sa barangay sa pagbulag sa basura ug moapil sa sistema sa koleksyon sa basura?",
      filipino: "2. PAGGAMIT / KARANASAN:\nIkaw ba at ang iyong sambahayan ay aktibong sumusunod sa mga patakaran ng barangay sa paghihiwalay ng basura at nakikilahok sa sistema ng pangongolekta ng basura?",
      english: "2. AVAILMENT / EXPERIENCE:\nDo you and your household actively follow the barangay's waste segregation rules and participate in the garbage collection system?"
    },
    satisfactionWasteManagement: {
      bisaya: "3. KASIYAHAN:\nUnsa ka kontento ka sa kinatibuk-ang solid waste management sa barangay, apil na ang kasaligan sa iskedyul sa koleksyon, kaepektibo sa lagda sa pagbulag sa basura, ug kinatibuk-ang kahinlo sa komunidad?",
      filipino: "3. KASIYAHAN:\nGaano ka nasisiyahan sa pangkalahatang solid waste management ng barangay, isinasaalang-alang ang pagiging maaasahan ng iskedyul ng koleksyon, bisa ng patakaran sa paghihiwalay ng basura, at pangkalahatang kalinisan ng komunidad?",
      english: "3. SATISFACTION:\nHow satisfied are you with the barangay's overall solid waste management, considering the reliability of the collection schedule, the effectiveness of the segregation policy, and the general cleanliness of the community?"
    },
    nfaBinaryWasteManagement: {
      bisaya: "4. PANGINAHANGLAN ALANG SA AKSYON:\nBase sa imong kasinatian, sa imong hunahuna ba kinahanglan og pagpauswag kini nga serbisyo gikan sa barangay?",
      filipino: "4. PANGANGAILANGAN PARA SA AKSYON:\nBatay sa iyong karanasan, sa tingin mo ba kailangan ng pagpapabuti ang serbisyong ito mula sa barangay?",
      english: "4. NEED FOR ACTION:\nBased on your experience, do you believe this service needs improvement from the barangay?"
    },
    suggestionsWasteManagement: {
      bisaya: "5. SUGYOT:\nUnsa man ang imong mga espesipikong komento o sugyot aron mapalambo ang koleksyon sa basura, pag-recycle, o ang kinatibuk-ang kahinlo sa atong barangay?",
      filipino: "5. MUNGKAHI:\nAno ang iyong mga partikular na komento o mungkahi para mapabuti ang pangongolekta ng basura, pagre-recycle, o ang pangkalahatang kalinisan ng ating barangay?",
      english: "5. SUGGESTION:\nWhat are your specific comments or suggestions for improving garbage collection, recycling, or the overall cleanliness of our barangay?"
    },
  },
  overall: {
    overallSatisfaction: {
      bisaya: "BAHIN X: KINATIBUK-ANG EBALWASYON (OVERALL EVALUATION)\nM1: Kinatibuk-ang Katagbawan\nSa kinatibuk-an, kung hunahunaon ang tanan nga serbisyo nga gihatag sa barangay sa miaging 12 ka bulan, unsa ka tagbaw?",
      filipino: "PART X: PANGKALAHATANG EBALWASYON (OVERALL EVALUATION)\nM1: Overall Satisfaction\nSa pangkalahatan, kung iisipin ang lahat ng serbisyong ibinigay ng barangay sa nakalipas na 12 buwan, gaano ka nasisiyahan?",
      english: "PART X: OVERALL EVALUATION\nM1: Overall Satisfaction\nOverall, thinking about all the services provided by the barangay in the past 12 months, how satisfied are you?"
    },
    overallNeedForAction: {
      bisaya: "M2: Kinatibuk-ang Panginahanglan alang sa Aksyon\nSa imong kinatibuk-ang panglantaw, sa kinatibuk-an, kinahanglan ba nga mohimo og aksyon ang barangay aron mapauswag ang iyang mga serbisyo?",
      filipino: "M2: Overall Need for Action\nSa iyong pangkalahatang pananaw, sa kabuuan, kailangan bang gumawa ng aksyon ang barangay para mapabuti ang mga serbisyo nito?",
      english: "M2: Overall Need for Action\nOn the whole, would you say that the barangay's services, in general, need action for improvement?"
    },
  },
}

// Helper function to get translated question text
export function getTranslatedQuestion(
  sectionId: string,
  questionId: string,
  language: Language
): string {
  const sectionTranslations = translations[sectionId]
  if (!sectionTranslations) {
    console.warn(`No translations found for section: ${sectionId}`)
    return questionId
  }

  const questionTranslation = sectionTranslations[questionId]
  if (!questionTranslation) {
    console.warn(`No translation found for question: ${questionId} in section: ${sectionId}`)
    return questionId
  }

  return questionTranslation[language]
}

// Helper function to get translated options
export function getTranslatedOptions(
  options: string[],
  language: Language
): string[] {
  // Common option translations
  const optionTranslations: Record<string, QuestionTranslation> = {
    'Yes': {
      bisaya: 'Oo',
      filipino: 'Oo',
      english: 'Yes'
    },
    'No': {
      bisaya: 'Dili',
      filipino: 'Hindi',
      english: 'No'
    },
    'Oo': {
      bisaya: 'Oo',
      filipino: 'Oo',
      english: 'Yes'
    },
    'Hindi': {
      bisaya: 'Dili',
      filipino: 'Hindi',
      english: 'No'
    },
    'Oo (Yes)': {
      bisaya: 'Oo',
      filipino: 'Oo',
      english: 'Yes'
    },
    'Hindi (No)': {
      bisaya: 'Dili',
      filipino: 'Hindi',
      english: 'No'
    },
    'Yes / Oo': {
      bisaya: 'Oo',
      filipino: 'Oo',
      english: 'Yes'
    },
    'No / Hindi': {
      bisaya: 'Dili',
      filipino: 'Hindi',
      english: 'No'
    },
    '5': {
      bisaya: '5 - Hilabihan ka Tagbaw',
      filipino: '5 - Lubos na Nasiyahan',
      english: '5 - Very Satisfied'
    },
    '4': {
      bisaya: '4 - Tagbaw',
      filipino: '4 - Nasiyahan',
      english: '4 - Satisfied'
    },
    '3': {
      bisaya: '3 - Neutral',
      filipino: '3 - Neutral',
      english: '3 - Neutral'
    },
    '2': {
      bisaya: '2 - Dili Tagbaw',
      filipino: '2 - Hindi Nasiyahan',
      english: '2 - Dissatisfied'
    },
    '1': {
      bisaya: '1 - Hilabihan ka Dili Tagbaw',
      filipino: '1 - Lubos na Hindi Nasiyahan',
      english: '1 - Very Dissatisfied'
    },
    // Unawareness reason options
    'I get my info from other sources (e.g., neighbors, social media), not directly from the barangay.': {
      bisaya: 'Gakuha ko sa akong impormasyon gikan sa laing mga tinubdan (sama sa mga silingan, social media), dili direkta gikan sa barangay.',
      filipino: 'Nakukuha ko ang aking impormasyon mula sa ibang paraan (hal., mga kapitbahay, social media), hindi direkta mula sa barangay.',
      english: 'I get my info from other sources (e.g., neighbors, social media), not directly from the barangay.'
    },
    "The barangay doesn't do enough to announce or promote their programs.": {
      bisaya: "Kulang ang gihimo sa barangay aron ipahibalo o i-promote ang ilang mga programa.",
      filipino: "Kulang ang ginagawa ng barangay para i-anunsyo o i-promote ang kanilang mga programa.",
      english: "The barangay doesn't do enough to announce or promote their programs."
    },
    "It's not a service I was actively looking for, so I might have missed the information.": {
      bisaya: "Dili kini serbisyo nga aktibo nakong gipangita, mao nga tingali wala nako makita ang impormasyon.",
      filipino: "Hindi ito serbisyong aktibo kong hinahanap, kaya maaaring nalampasan ko ang impormasyon.",
      english: "It's not a service I was actively looking for, so I might have missed the information."
    },
    "Even if information is posted, it's hard to find or understand.": {
      bisaya: "Bisan kung gipaskil ang impormasyon, lisud kini pangitaon o sabton.",
      filipino: "Kahit na naka-paskil ang impormasyon, mahirap itong hanapin o intindihin.",
      english: "Even if information is posted, it's hard to find or understand."
    },
    'Other Reason': {
      bisaya: 'Laing rason',
      filipino: 'Iba pang dahilan',
      english: 'Other Reason'
    },
    'Please specify:': {
      bisaya: 'Palihug isulti:',
      filipino: 'Pakisabi:',
      english: 'Please specify:'
    },
    // Non-availment reason options
    'I/We did not need the service during that time.': {
      bisaya: 'Wala nako/namo kinahanglana ang serbisyo niadtong panahona.',
      filipino: 'Hindi ko/namin kailangan ang serbisyo sa mga panahong iyon.',
      english: 'I/We did not need the service during that time.'
    },
    'The process seemed too difficult, complicated, or took too much time.': {
      bisaya: 'Ang proseso morag lisud kaayo, komplikado, o dugay kaayo.',
      filipino: 'Ang proseso ay tila napakahirap, kumplikado, o masyadong matagal.',
      english: 'The process seemed too difficult, complicated, or took too much time.'
    },
    'The location was too far, hard to get to, or the service hours were inconvenient.': {
      bisaya: 'Layo kaayo ang lokasyon, lisud adtoon, o dili kombenyente ang oras sa serbisyo.',
      filipino: 'Masyadong malayo ang lokasyon, mahirap puntahan, o hindi angkop ang oras ng serbisyo.',
      english: 'The location was too far, hard to get to, or the service hours were inconvenient.'
    },
    'I was concerned about the cost, fees, or other expenses involved.': {
      bisaya: 'Nabalaka ko sa gasto, bayronon, o uban pang mga galastuhan.',
      filipino: 'Nag-aalala ako sa gastos, bayarin, o iba pang gastusin na kasama dito.',
      english: 'I was concerned about the cost, fees, or other expenses involved.'
    },
    'I was not confident in the quality of the service or the staff providing it.': {
      bisaya: 'Wala koy pagsalig sa kalidad sa serbisyo o sa mga kawani nga naghatag niini.',
      filipino: 'Wala akong tiwala sa kalidad ng serbisyo o sa mga tauhan na nagbibigay nito.',
      english: 'I was not confident in the quality of the service or the staff providing it.'
    },
    'I thought I was not qualified, or I was told I was not eligible.': {
      bisaya: 'Abi nako dili ko kwalipikado, o giingnan ko nga dili ko pwede.',
      filipino: 'Inakala kong hindi ako kwalipikado, o sinabihan akong hindi ako pwede.',
      english: 'I thought I was not qualified, or I was told I was not eligible.'
    },
    // Corruption reporting reasons - keys match the Filipino options in questions.ts
    'Ginagawa rin ito ng iba o ng karamihan. (Everyone is doing it)': {
      bisaya: 'Gibuhat usab kini sa uban o sa kadaghanan.',
      filipino: 'Ginagawa rin ito ng iba o ng karamihan.',
      english: 'Everyone is doing it'
    },
    'Normal o SOP na itong gawain. (This has become a normal practice)': {
      bisaya: 'Normal o SOP na kini nga gawi.',
      filipino: 'Normal o SOP na itong gawain.',
      english: 'This has become a normal practice'
    },
    'Natakot akong magsumbong. (I feared for my safety)': {
      bisaya: 'Nahadlok ko nga mosumbong.',
      filipino: 'Natakot akong magsumbong.',
      english: 'I feared for my safety'
    },
    'Nakapagbilis ito ng transaksyon. (It made the process faster/easier)': {
      bisaya: 'Nakapapaspas kini sa transaksyon.',
      filipino: 'Nakapagbilis ito ng transaksyon.',
      english: 'It made the process faster/easier'
    },
    'Walang mangyayari kung i-uulat. (Reporting would not solve the problem)': {
      bisaya: 'Walay mahitabo kung i-report.',
      filipino: 'Walang mangyayari kung i-uulat.',
      english: 'Reporting would not solve the problem'
    },
    'Wala namang dahilan. (No reason)': {
      bisaya: 'Wala namay hinungdan.',
      filipino: 'Wala namang dahilan.',
      english: 'No reason'
    },
    'Iba pa (Other)': {
      bisaya: 'Laing rason',
      filipino: 'Iba pa',
      english: 'Other'
    },
    // Corruption satisfaction scale - keys match the Filipino options in questions.ts
    '5 - Lubos na Nasiyahan (Very Satisfied)': {
      bisaya: '5 - Hilabihan ka Tagbaw',
      filipino: '5 - Lubos na Nasiyahan',
      english: '5 - Very Satisfied'
    },
    '4 - Nasiyahan (Satisfied)': {
      bisaya: '4 - Tagbaw',
      filipino: '4 - Nasiyahan',
      english: '4 - Satisfied'
    },
    '3 - Neutral (Neutral)': {
      bisaya: '3 - Neutral',
      filipino: '3 - Neutral',
      english: '3 - Neutral'
    },
    '2 - Hindi Nasiyahan (Dissatisfied)': {
      bisaya: '2 - Dili Tagbaw',
      filipino: '2 - Hindi Nasiyahan',
      english: '2 - Dissatisfied'
    },
    '1 - Lubos na Hindi Nasiyahan (Very Dissatisfied)': {
      bisaya: '1 - Hilabihan ka Dili Tagbaw',
      filipino: '1 - Lubos na Hindi Nasiyahan',
      english: '1 - Very Dissatisfied'
    },
  }

  return options.map(option => {
    const translation = optionTranslations[option]
    if (translation) {
      return translation[language]
    }
    return option
  })
}
