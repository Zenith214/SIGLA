import type { Question } from "../page"

export function getQuestionsForSection(sectionId: string): Question[] {
  switch (sectionId) {
    case "financial":
      return [
        {
          id: "budgetTransparency",
          type: "radio",
          question: "How would you rate the transparency of the barangay's budget process?",
          options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
          required: true,
        },
        {
          id: "revenueCollection",
          type: "checkbox",
          question: "Which revenue collection methods does your barangay utilize? (Select all that apply)",
          options: [
            "Property Tax",
            "Business Permits",
            "Market Fees",
            "Barangay Clearance",
            "Community Tax Certificate",
            "Other Local Fees",
          ],
        },
        {
          id: "financialReporting",
          type: "radio",
          question: "How often does the barangay provide financial reports to the community?",
          options: ["Monthly", "Quarterly", "Semi-annually", "Annually", "Never"],
          required: true,
        },
        {
          id: "auditCompliance",
          type: "radio",
          question: "Is the barangay compliant with external audit requirements?",
          options: ["Always compliant", "Usually compliant", "Sometimes compliant", "Rarely compliant", "Not sure"],
          required: true,
        },
        {
          id: "publicParticipation",
          type: "radio",
          question: "How would you describe community participation in budget planning?",
          options: ["Very Active", "Active", "Moderate", "Limited", "No Participation"],
          required: true,
        },
        {
          id: "additionalComments",
          type: "textarea",
          question: "Additional comments or suggestions regarding financial administration:",
        },
      ]

    case "disaster":
      return [
        {
          id: "emergencyPlan",
          type: "radio",
          question: "Does your barangay have a comprehensive disaster preparedness plan?",
          options: [
            "Yes, comprehensive and updated",
            "Yes, but needs updating",
            "Basic plan exists",
            "No formal plan",
            "Not sure",
          ],
          required: true,
        },
        {
          id: "evacuationCenters",
          type: "checkbox",
          question: "What types of evacuation centers are available in your barangay? (Select all that apply)",
          options: [
            "School Buildings",
            "Community Centers",
            "Churches/Religious Centers",
            "Government Buildings",
            "Sports Facilities",
            "Private Buildings",
          ],
        },
        {
          id: "warningSystem",
          type: "radio",
          question: "How effective is the early warning system in your barangay?",
          options: ["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No Warning System"],
          required: true,
        },
        {
          id: "communityTraining",
          type: "radio",
          question: "How often does the community receive disaster preparedness training?",
          options: ["Regularly (quarterly)", "Semi-annually", "Annually", "Rarely", "Never"],
          required: true,
        },
        {
          id: "equipmentAvailability",
          type: "radio",
          question: "How would you rate the availability of emergency equipment and supplies?",
          options: ["Fully Equipped", "Well Equipped", "Adequately Equipped", "Poorly Equipped", "No Equipment"],
          required: true,
        },
        {
          id: "riskAssessment",
          type: "textarea",
          question: "What are the main disaster risks in your barangay?",
        },
      ]

    case "safety":
      return [
        {
          id: "crimeRate",
          type: "radio",
          question: "How would you describe the crime rate in your barangay?",
          options: ["Very Low", "Low", "Moderate", "High", "Very High"],
          required: true,
        },
        {
          id: "policePresence",
          type: "radio",
          question: "How would you rate the police presence in your barangay?",
          options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
          required: true,
        },
        {
          id: "communityPatrol",
          type: "radio",
          question: "How effective are the barangay tanod and community patrol services?",
          options: ["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No Community Patrol"],
          required: true,
        },
        {
          id: "streetLighting",
          type: "radio",
          question: "How adequate is the street lighting in your barangay?",
          options: ["Excellent coverage", "Good coverage", "Fair coverage", "Poor coverage", "No street lighting"],
          required: true,
        },
        {
          id: "youthPrograms",
          type: "checkbox",
          question: "What youth programs are available to prevent juvenile delinquency? (Select all that apply)",
          options: [
            "Sports Programs",
            "Skills Training",
            "Educational Support",
            "Livelihood Programs",
            "Cultural Activities",
            "Leadership Development",
          ],
        },
        {
          id: "additionalComments",
          type: "textarea",
          question: "Additional comments or suggestions regarding safety, peace and order:",
        },
      ]

    case "social":
      return [
        {
          id: "healthServices",
          type: "radio",
          question: "How would you rate the accessibility of health services in your barangay?",
          options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
          required: true,
        },
        {
          id: "educationSupport",
          type: "checkbox",
          question: "What educational support programs are available in your barangay? (Select all that apply)",
          options: [
            "Scholarship Programs",
            "School Supplies Distribution",
            "Feeding Programs",
            "Tutorial Services",
            "Educational Facilities",
            "Transportation Assistance",
          ],
        },
        {
          id: "seniorCitizen",
          type: "radio",
          question: "How adequate are the services for senior citizens in your barangay?",
          options: ["Very Adequate", "Adequate", "Moderately Adequate", "Inadequate", "No Services Available"],
          required: true,
        },
        {
          id: "pwdServices",
          type: "radio",
          question: "How would you rate the services for Persons with Disabilities (PWD)?",
          options: ["Excellent", "Good", "Fair", "Poor", "No Services Available"],
          required: true,
        },
        {
          id: "nutritionPrograms",
          type: "radio",
          question: "How effective are the nutrition programs for children and pregnant women?",
          options: ["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No Programs Available"],
          required: true,
        },
        {
          id: "additionalComments",
          type: "textarea",
          question: "Additional comments or suggestions regarding social protection and security:",
        },
      ]

    case "business":
      return [
        {
          id: "permitProcessing",
          type: "radio",
          question: "How would you rate the efficiency of business permit processing in your barangay?",
          options: ["Very Efficient", "Efficient", "Moderately Efficient", "Inefficient", "Very Inefficient"],
          required: true,
        },
        {
          id: "businessSupport",
          type: "checkbox",
          question: "What business support services are available in your barangay? (Select all that apply)",
          options: [
            "Business Registration Assistance",
            "Loan Facilitation Programs",
            "Skills Training for Entrepreneurs",
            "Market Linkage Programs",
            "Business Development Services",
            "Cooperative Formation Support",
          ],
        },
        {
          id: "marketFacilities",
          type: "radio",
          question: "How adequate are the market facilities and commercial spaces in your barangay?",
          options: ["Very Adequate", "Adequate", "Moderately Adequate", "Inadequate", "No Facilities Available"],
          required: true,
        },
        {
          id: "investmentClimate",
          type: "radio",
          question: "How would you describe the overall investment climate in your barangay?",
          options: ["Very Favorable", "Favorable", "Neutral", "Unfavorable", "Very Unfavorable"],
          required: true,
        },
        {
          id: "businessIncentives",
          type: "checkbox",
          question: "What business incentives are offered by your barangay? (Select all that apply)",
          options: [
            "Tax Exemptions",
            "Reduced Permit Fees",
            "Priority Processing",
            "Infrastructure Support",
            "Marketing Assistance",
            "Training Subsidies",
          ],
        },
        {
          id: "additionalComments",
          type: "textarea",
          question: "Additional comments or suggestions regarding business friendliness and competitiveness:",
        },
      ]

    case "environmental":
      return [
        {
          id: "wasteManagement",
          type: "radio",
          question: "How effective is the waste management system in your barangay?",
          options: ["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No System in Place"],
          required: true,
        },
        {
          id: "waterQuality",
          type: "radio",
          question: "How would you rate the water quality in your barangay?",
          options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
          required: true,
        },
        {
          id: "airQuality",
          type: "radio",
          question: "How would you describe the air quality in your barangay?",
          options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
          required: true,
        },
        {
          id: "greenSpaces",
          type: "radio",
          question: "How adequate are the green spaces and parks in your barangay?",
          options: ["Very Adequate", "Adequate", "Moderately Adequate", "Inadequate", "No Green Spaces"],
          required: true,
        },
        {
          id: "environmentalPrograms",
          type: "checkbox",
          question: "What environmental programs are implemented in your barangay? (Select all that apply)",
          options: [
            "Tree Planting Programs",
            "Waste Segregation Campaigns",
            "Clean-up Drives",
            "Environmental Education",
            "Recycling Programs",
            "Urban Gardening Projects",
          ],
        },
        {
          id: "additionalComments",
          type: "textarea",
          question: "Additional comments or suggestions regarding environmental management:",
        },
      ]

    default:
      return []
  }
}
