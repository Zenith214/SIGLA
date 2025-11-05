# How to Access Demographics Analytics

## Quick Guide

### Step 1: Navigate to Analytics Dashboard
1. Open your PULSE application
2. Click on **"Analytics"** in the main navigation
3. You'll see the "Analytics & Trends Dashboard"

### Step 2: Click Demographics Tab
Look for the tabs at the top:
```
📊 Historical Cycles | 🔄 Barangay Comparison | 🎯 Service Deep Dive | 🌐 Overall Analytics | 👥 Demographics | 🏆 Award Leaderboard
```

Click on **👥 Demographics**

### Step 3: View the Data
You'll see:
- **Total Respondents** count
- **Gender Distribution** (Purple bars)
- **Age Groups** (Blue bars)
- **Educational Attainment** (Green bars)
- **Monthly Household Income** (Yellow bars)
- **Purok/Sitio Distribution** (Indigo bars)
- **Key Insights** section at the bottom

## What You'll See

### Header
```
┌─────────────────────────────────────────────────┐
│ Respondent Demographics Profile                 │
│ Comprehensive analysis of survey participant... │
│                                    150          │
│                                    Total        │
└─────────────────────────────────────────────────┘
```

### Distribution Cards
Each card shows:
- Category name with icon
- List of items with counts and percentages
- Visual progress bars
- Color-coded for easy identification

### Key Insights
- Most represented gender
- Largest age group
- Most common education level

## Features

### Automatic Updates
- Data updates automatically when new surveys are submitted
- Shows data for the active survey cycle
- Can be filtered by barangay (future enhancement)

### Responsive Design
- Works on desktop, tablet, and mobile
- Cards stack vertically on smaller screens
- Touch-friendly interface

### Data Accuracy
- Real-time data from database
- Automatic percentage calculations
- Handles missing data gracefully

## Use Cases

### For Administrators
- Monitor survey participation demographics
- Identify underrepresented groups
- Plan targeted outreach

### For Analysts
- Understand respondent characteristics
- Correlate demographics with satisfaction
- Track demographic trends

### For Decision Makers
- Evidence-based planning
- Equity assessment
- Resource allocation

## Troubleshooting

### "No data available"
- Check if surveys have been submitted
- Verify active cycle is set
- Ensure database connection is working

### Loading forever
- Check network connection
- Verify API endpoint is accessible
- Check browser console for errors

### Missing purok data
- Purok field is optional
- Shows as "Not specified" if not filled
- Older surveys won't have purok data

## Technical Details

### API Endpoint
```
GET /api/analytics/demographics
```

### Query Parameters
- `barangayId` (optional) - Filter by barangay
- `cycleId` (optional) - Filter by cycle

### Response Format
```json
{
  "totalRespondents": 150,
  "demographics": {
    "gender": [...],
    "ageGroups": [...],
    "education": [...],
    "income": [...],
    "purok": [...]
  }
}
```

## Next Steps

1. ✅ Access the Demographics tab
2. ✅ Review the data
3. ✅ Use insights for planning
4. ✅ Export data if needed (future feature)
5. ✅ Compare across barangays (future feature)

---

**Need Help?** Contact your system administrator or refer to the full documentation.
