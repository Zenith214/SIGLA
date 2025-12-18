# CPAP AI Suggestions Feature Guide

## Overview

The AI Suggestions feature analyzes your barangay's survey results and generates data-driven action recommendations to help you create your Citizen Priority Action Plan (CPAP). This guide explains how the feature works and how to use it effectively.

## Table of Contents

1. [How It Works](#how-it-works)
2. [Using AI Suggestions](#using-ai-suggestions)
3. [Understanding Recommendations](#understanding-recommendations)
4. [Best Practices](#best-practices)
5. [Limitations](#limitations)
6. [Technical Details](#technical-details)

---

## How It Works

### Data Analysis Process

The AI Suggestions feature:

1. **Analyzes Survey Results**: Reviews all survey responses for your barangay and cycle
2. **Identifies Patterns**: Detects service areas with low satisfaction or high complaint rates
3. **Generates Recommendations**: Creates actionable suggestions based on the analysis
4. **Prioritizes Actions**: Groups recommendations by timeline (short, medium, long-term)

### What Data Is Used

The AI analyzes:
- Service satisfaction ratings
- Awareness and availment rates
- Funnel analysis (awareness → availment → satisfaction)
- Specific feedback and complaints
- Comparative data with other barangays
- Historical trends (if available)

### Machine Learning Model

The system uses:
- **Funnel Analysis API**: Identifies service delivery gaps
- **Pattern Recognition**: Detects common issues across responses
- **Recommendation Engine**: Generates context-appropriate actions
- **Priority Scoring**: Ranks recommendations by impact potential

---

## Using AI Suggestions

### Step-by-Step Guide

#### 1. Access the Feature

- Navigate to your CPAP editor (must be in **Draft** status)
- Click the **"AI Suggestions"** button in the toolbar
- Wait for the analysis to complete (usually 2-5 seconds)

#### 2. Review Suggestions

A modal will appear with three sections:

**Short-Term Actions (0-3 months)**
- Quick wins and immediate improvements
- Low-cost, high-impact interventions
- Awareness campaigns and information drives

**Medium-Term Actions (6-12 months)**
- Moderate complexity projects
- Service improvements requiring planning
- Infrastructure enhancements

**Long-Term Actions (1+ years)**
- Major infrastructure projects
- Systemic improvements
- Capacity building initiatives

#### 3. Evaluate Each Suggestion

For each recommendation, review:
- **Priority Area**: Which service area it addresses
- **Target Output**: What the AI recommends doing
- **Success Indicator**: How to measure success
- **Timeline**: Recommended implementation period
- **Source**: Which survey data informed this suggestion

#### 4. Choose Your Approach

You have three options:

**Option A: Use All Suggestions**
```
1. Click "Use These Suggestions"
2. All recommendations are added as CPAP items (unsaved)
3. Review and edit each item
4. Add responsible persons
5. Adjust timelines
6. Save your CPAP
```

**Option B: Selective Use**
```
1. Review suggestions in the modal
2. Close the modal
3. Manually create items based on selected suggestions
4. Customize completely to your context
```

**Option C: Ignore Suggestions**
```
1. Close the modal
2. Create your CPAP entirely manually
3. Use your own judgment and local knowledge
```

---

## Understanding Recommendations

### Recommendation Structure

Each AI suggestion includes:

```javascript
{
  priority_area: "Health Services",
  target_output: "Establish mobile health clinic with weekly visits",
  success_indicator: "50 residents served per month",
  timeline_months: "0-3 months",
  source: "Health Services (Low Satisfaction: 45%)"
}
```

### How to Interpret

**Priority Area**
- Derived from survey service categories
- Focuses on areas with identified issues
- May combine related services

**Target Output**
- Specific, actionable recommendation
- Based on common solutions to identified problems
- Generic - needs local customization

**Success Indicator**
- Measurable outcome metric
- Based on typical benchmarks
- Should be adjusted to your capacity

**Timeline**
- Estimated implementation period
- Based on action complexity
- Consider your local constraints

**Source**
- Shows which data informed the suggestion
- Includes relevant metrics (satisfaction %, complaint count)
- Helps you understand the rationale

### Example Interpretations

#### Example 1: Low Satisfaction

```
Source: "Water Supply (Satisfaction: 35%)"
Interpretation: Only 35% of residents are satisfied with water supply
Action: Focus on improving water service quality and availability
```

#### Example 2: Low Awareness

```
Source: "Social Services (Awareness: 20%)"
Interpretation: 80% of residents don't know about available social services
Action: Prioritize information campaigns and outreach
```

#### Example 3: Funnel Drop-off

```
Source: "Health Services (Awareness: 80%, Availment: 30%)"
Interpretation: People know about services but aren't using them
Action: Address barriers to access (location, hours, requirements)
```

---

## Best Practices

### ✅ DO

**Review Critically**
- Don't blindly accept all suggestions
- Evaluate feasibility for your barangay
- Consider your budget and capacity
- Consult with relevant department heads

**Customize Thoroughly**
- Add specific responsible persons
- Adjust timelines to your reality
- Modify outputs to match local context
- Add local details and nuances

**Combine with Local Knowledge**
- Use AI suggestions as a starting point
- Add items based on community feedback
- Include issues AI might have missed
- Prioritize based on local urgency

**Verify Against Survey Data**
- Check the source information
- Review actual survey results
- Confirm the AI interpretation is accurate
- Look for additional insights in the data

### ❌ DON'T

**Don't Use Blindly**
- AI doesn't understand local politics
- AI doesn't know your budget constraints
- AI doesn't account for ongoing projects
- AI can't assess community readiness

**Don't Skip Customization**
- Generic suggestions need personalization
- Responsible persons must be named
- Timelines must be realistic
- Success indicators should match capacity

**Don't Ignore Manual Items**
- AI may miss important issues
- Some priorities aren't in survey data
- Local knowledge is invaluable
- Community input matters

**Don't Rely Solely on AI**
- AI is a tool, not a decision-maker
- Your judgment is essential
- Community consultation is critical
- Political and social context matters

---

## Limitations

### What AI Can Do

✅ Identify patterns in survey data  
✅ Suggest common solutions to identified problems  
✅ Prioritize based on data severity  
✅ Group recommendations by timeline  
✅ Provide measurable success indicators  

### What AI Cannot Do

❌ Understand local political context  
❌ Know your budget constraints  
❌ Account for ongoing projects  
❌ Assess community readiness  
❌ Consider inter-barangay dynamics  
❌ Understand cultural sensitivities  
❌ Know staff capacity and skills  
❌ Predict future changes  

### Known Limitations

**Data Dependency**
- Quality depends on survey response quality
- Limited by survey question coverage
- May miss issues not captured in surveys

**Generic Recommendations**
- Suggestions are template-based
- May not fit unique local situations
- Require significant customization

**No Budget Awareness**
- Doesn't consider cost constraints
- May suggest expensive interventions
- Doesn't prioritize by cost-effectiveness

**No Context Awareness**
- Doesn't know about existing programs
- Can't account for political factors
- Unaware of inter-agency coordination

**Timeline Estimates**
- Based on typical implementation periods
- Doesn't account for local capacity
- May be overly optimistic

---

## Technical Details

### API Endpoint

```
GET /api/cpap/ai-suggestions?barangay_id={id}&cycle_id={id}
```

### Data Sources

1. **Survey Responses**: Individual survey submissions
2. **Funnel Analysis**: Awareness → Availment → Satisfaction metrics
3. **Service Rankings**: Comparative performance across services
4. **Historical Data**: Trends over time (if available)

### Analysis Algorithm

```
1. Calculate satisfaction scores per service area
2. Identify services below 60% satisfaction threshold
3. Analyze funnel stages to identify specific gaps
4. Generate recommendations based on gap type:
   - Low awareness → Information campaigns
   - Low availment → Access improvements
   - Low satisfaction → Quality enhancements
5. Prioritize by impact potential (affected population × severity)
6. Group by estimated implementation timeline
7. Format as CPAP-compatible items
```

### Recommendation Templates

The system uses predefined templates for common issues:

**Low Awareness Template:**
```
Priority Area: [Service Name]
Target Output: "Conduct information campaign on [service] availability"
Success Indicator: "Increase awareness to 80% in next survey"
Timeline: Short-term (0-3 months)
```

**Low Availment Template:**
```
Priority Area: [Service Name]
Target Output: "Improve access to [service] through [method]"
Success Indicator: "Increase utilization by 50%"
Timeline: Medium-term (6-12 months)
```

**Low Satisfaction Template:**
```
Priority Area: [Service Name]
Target Output: "Enhance [service] quality through [improvement]"
Success Indicator: "Achieve 75% satisfaction rating"
Timeline: Medium to Long-term (6-18 months)
```

### Performance

- **Analysis Time**: 2-5 seconds typical
- **Data Volume**: Processes all survey responses for barangay/cycle
- **Caching**: Results cached for 24 hours
- **Timeout**: 30 seconds maximum

### Error Handling

**No Survey Data:**
```
Message: "No survey data available for this barangay and cycle"
Action: Create CPAP manually
```

**Insufficient Data:**
```
Message: "Limited survey responses. Suggestions may be incomplete."
Action: Use suggestions cautiously, rely more on local knowledge
```

**API Error:**
```
Message: "Unable to generate suggestions. Please try again."
Action: Refresh page or create CPAP manually
```

---

## Frequently Asked Questions

### Q: Are AI suggestions mandatory?

**A:** No. AI suggestions are completely optional. You can create your entire CPAP manually if you prefer.

### Q: How accurate are the suggestions?

**A:** Suggestions are data-driven but generic. They identify real issues from survey data but need local customization to be truly accurate and actionable.

### Q: Can I edit AI-generated items?

**A:** Yes. You should always edit AI-generated items to add local context, specific responsible persons, and realistic timelines.

### Q: What if AI suggests something impossible?

**A:** Delete that suggestion and create your own item. AI doesn't know your constraints.

### Q: How often are suggestions updated?

**A:** Suggestions are generated fresh each time you click the button, based on current survey data.

### Q: Can I regenerate suggestions?

**A:** Yes. Click the "AI Suggestions" button again to regenerate. Note that results should be consistent unless survey data has changed.

### Q: What if there are no suggestions?

**A:** This means either there's insufficient survey data or all service areas are performing well. Create your CPAP manually based on other priorities.

### Q: Do DILG reviewers know which items are AI-generated?

**A:** No. Once you save items, there's no distinction between AI-generated and manually created items. All items are treated equally.

---

## Examples

### Example 1: Using AI Suggestions Effectively

**Scenario:** Barangay with low health service satisfaction

**AI Suggestion:**
```
Priority Area: Health Services
Target Output: Establish mobile health clinic
Success Indicator: 50 residents served per month
Timeline: 0-3 months
Source: Health Services (Satisfaction: 45%)
```

**After Customization:**
```
Priority Area: Health Services - Primary Care
Target Output: Partner with Rural Health Unit to conduct weekly mobile clinic every Saturday at Barangay Hall
Success Indicator: Serve minimum 30 residents per week (120/month)
Responsible Person: Dr. Maria Santos, RHU Chief
Timeline Start: 2025-02-01
Timeline End: 2025-04-30
```

### Example 2: Combining AI and Manual Items

**AI Suggestions Used:**
1. Health service mobile clinic (customized)
2. Water supply information campaign (customized)

**Manual Items Added:**
3. Repair of barangay hall roof (not in survey but urgent)
4. Street lighting improvement (community request)
5. Youth sports program (barangay priority)

**Result:** Comprehensive CPAP combining data-driven and community-driven priorities

### Example 3: Rejecting Inappropriate Suggestions

**AI Suggestion:**
```
Priority Area: Transportation
Target Output: Establish new jeepney route
Timeline: 6-12 months
```

**Why Rejected:**
- Beyond barangay authority (municipal/provincial jurisdiction)
- Requires franchise from LTFRB
- Not feasible at barangay level

**Alternative Manual Item:**
```
Priority Area: Transportation
Target Output: Coordinate with municipal government to request additional jeepney trips during peak hours
Responsible Person: Barangay Captain
Timeline: 0-3 months
```

---

## Conclusion

AI Suggestions are a powerful tool to help you create data-driven action plans, but they're just one input in your decision-making process. Use them wisely, customize thoroughly, and always apply your local knowledge and judgment.

**Remember:**
- AI identifies issues, you create solutions
- Data informs, you decide
- Suggestions start, you finish
- Technology assists, you lead

---

**Version:** 1.0  
**Last Updated:** November 2025  
**For Technical Support:** Contact PULSE system administrators
