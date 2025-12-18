# Analytics Dashboard - User Guide

## Quick Start

The Analytics Dashboard is your central hub for understanding survey data, barangay performance, and service area effectiveness.

**Access:** Navigate to `/analytics` from the main dashboard

## Dashboard Views

### 1. Dashboard Summary (Landing Page)

**Purpose:** Get a quick overview of system-wide performance

#### What You'll See:

**Top Row - Key Metrics:**
- **Overall Satisfaction:** Average satisfaction across all barangays and services
- **Need for Action:** Percentage of services requiring attention
- **Responses vs Target:** Progress toward survey completion goals
- **Barangays Covered:** How many barangays have completed surveys

**Barangay Leaderboard:**
- **Top 5:** Best performing barangays (green cards)
- **Bottom 5:** Barangays needing support (red cards)
- **Trend Arrows:** 
  - ↑ Improving
  - ↓ Declining
  - → Stable

**Charts:**
- **Trend Chart:** Shows how satisfaction has changed over time across survey cycles
- **Service Area Chart:** Compares performance across all 6 service areas

#### How to Use:
1. Check KPIs for overall system health
2. Identify top and bottom performers
3. Review trends to see if satisfaction is improving
4. Compare service areas to find strengths and weaknesses

---

### 2. Service Area Deep Dive

**Purpose:** Analyze specific service areas in detail and filter by demographics

#### Service Areas Available:
1. Financial Administration
2. Disaster Preparedness
3. Safety & Peace Order
4. Social Protection
5. Business Friendliness
6. Environmental Management

#### What You'll See:

**Service Area Selector:**
- Click any service area button to view its data

**Rankings Table:**
Shows all barangays ranked by satisfaction for the selected service area

**Columns Explained:**
- **Awareness %:** How many people know about the service
- **Availment %:** How many people actually used the service
- **Satisfaction %:** How satisfied users are with the service
- **Need for Action %:** How many people need improvements
- **Responses:** Number of survey responses
- **Trend:** Performance direction

**Color Coding:**
- 🟢 Green (70%+): Good performance
- 🟡 Yellow (50-69%): Moderate performance
- 🔴 Red (<50%): Needs improvement

**Action Grid:**
Visual map showing where each barangay falls:
- **Maintain (Top Right):** High satisfaction, low need - keep doing what works
- **Opportunities (Bottom Right):** High satisfaction but high need - room for growth
- **Monitor (Top Left):** Low satisfaction, low need - watch closely
- **Fix Now (Bottom Left):** Low satisfaction, high need - urgent attention required

#### How to Use:
1. Select a service area you want to analyze
2. Review the rankings table to see which barangays perform best/worst
3. Look at the Action Grid to prioritize interventions
4. Use demographic filters to dig deeper (see below)

---

### 3. Demographic Filtering

**Purpose:** Understand how different groups experience services

#### Available Filters:

**Age Group:**
- 18-24, 25-34, 35-44, 45-54, 55-64, 65+

**Gender:**
- Male, Female, LGBTQI+

**Household Income:**
- Below ₱10,000 through Above ₱100,000

**Educational Attainment:**
- No formal education through Post-graduate

#### How to Use Filters:

1. **Click "Show Filters"** button in Service Area Deep Dive
2. **Select demographic criteria** from dropdowns
3. **View filtered results** in the table and Action Grid
4. **Compare groups** by changing filters and noting differences
5. **Clear filters** to return to overall view

#### Example Use Cases:

**Identify Age-Based Gaps:**
- Filter by "18-24" to see youth satisfaction
- Compare with "65+" to see senior satisfaction
- Look for differences in awareness and availment

**Analyze Income Disparities:**
- Filter by "Below ₱10,000" to see low-income satisfaction
- Compare with "Above ₱100,000" to see high-income satisfaction
- Identify services that may be inaccessible to certain income groups

**Gender Equity Analysis:**
- Filter by each gender to compare experiences
- Look for services where one gender has lower satisfaction
- Identify potential barriers or inequities

**Education Impact:**
- Compare awareness rates across education levels
- See if education affects service availment
- Identify if certain services need better communication

---

### 4. Detailed Analytics

**Purpose:** Access raw data and export functionality

This is the original analytics view with:
- Summary statistics
- Detailed response listings
- Aggregated data
- CSV export capability

**When to Use:**
- Need raw data for external analysis
- Want to see individual survey responses
- Need to export data to Excel/other tools

---

## Tips for Effective Use

### For Administrators:

1. **Start with Dashboard Summary** to get the big picture
2. **Check leaderboard** to identify barangays needing support
3. **Review service area chart** to allocate resources effectively
4. **Use demographic filters** to ensure equity across groups

### For Barangay Officials:

1. **Find your barangay** in the rankings table
2. **Check your quadrant** in the Action Grid
3. **Compare with other barangays** to learn best practices
4. **Focus on services** in "Fix Now" quadrant first

### For Policy Makers:

1. **Use demographic filters** to identify underserved groups
2. **Compare across cycles** using the trend chart
3. **Prioritize service areas** with lowest satisfaction
4. **Track improvement** over time

### For Researchers:

1. **Export detailed data** for statistical analysis
2. **Use filters** to test hypotheses about demographic factors
3. **Compare service areas** to identify patterns
4. **Track trends** across multiple cycles

---

## Understanding the Metrics

### Awareness %
**What it means:** Percentage of respondents who know the service exists

**High awareness (70%+):** Good communication and visibility  
**Low awareness (<50%):** Need better information campaigns

### Availment %
**What it means:** Percentage of aware respondents who actually used the service

**High availment (70%+):** Service is accessible and relevant  
**Low availment (<50%):** Barriers to access or service not needed

### Satisfaction %
**What it means:** Average satisfaction rating from service users

**High satisfaction (70%+):** Service meets expectations  
**Low satisfaction (<50%):** Service quality issues

### Need for Action %
**What it means:** Percentage of respondents indicating improvements needed

**High need (70%+):** Urgent attention required  
**Low need (<30%):** Service is working well

---

## Troubleshooting

**Problem:** No data showing  
**Solution:** Check that an active survey cycle is set and surveys are completed

**Problem:** Filters not working  
**Solution:** Ensure demographic data was collected in surveys

**Problem:** Charts not loading  
**Solution:** Refresh the page or check your internet connection

**Problem:** Can't find a barangay  
**Solution:** Verify the barangay has completed surveys in the active cycle

---

## Keyboard Shortcuts

- **Tab:** Switch between dashboard views
- **Esc:** Close filter panel
- **Ctrl/Cmd + R:** Refresh data

---

## Getting Help

For technical support or questions:
- Contact your system administrator
- Refer to the full documentation: `ANALYTICS_DASHBOARD_DOCUMENTATION.md`
- Report issues through your organization's support channel

---

## Best Practices

1. **Regular Review:** Check the dashboard weekly to track progress
2. **Compare Cycles:** Look at trends over time, not just current data
3. **Use Filters Wisely:** Start broad, then narrow down with filters
4. **Share Insights:** Export and share findings with stakeholders
5. **Take Action:** Use the Action Grid to prioritize interventions
6. **Follow Up:** Track if interventions improve satisfaction in next cycle

---

**Last Updated:** December 2, 2025  
**Version:** 2.0
