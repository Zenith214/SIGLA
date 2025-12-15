# Quick Start Guide - Barangay Officers Display

## What's New?

The Barangay Management section now shows all officers designated to each barangay, replacing the single "Captain" field.

## How to Use

### Viewing Officers

1. **Navigate to Barangay Management**
   ```
   Settings → Barangay Management
   ```

2. **Check the Officers Column**
   - Look for the "Officers" column in the barangay table
   - You'll see different displays based on officer count:
     - No officers: `-`
     - One officer: `John Doe`
     - Multiple officers: `John Doe and 2 more` (clickable)

3. **View All Officers**
   - Click on the blue text showing officer count
   - A popup will appear with all officers
   - Each officer shows:
     - Initials in a circle
     - Full name
     - Email address

### Designating Officers to Barangays

Officers are designated through the Users & Roles section:

1. **Navigate to Users & Roles**
   ```
   Settings → Users & Roles
   ```

2. **Create or Edit an Officer**
   - Click "Add User" or edit existing officer
   - Set role to "officer"
   - Select barangay from "Barangay Designation" dropdown

3. **Save**
   - The officer will now appear in the barangay's officer list

### Editing Barangay Information

1. **Click Edit Button** on any barangay row
2. **Update Information** as needed
3. **Note**: The "Officer" field in the edit form is for legacy data
4. **Save Changes**

## Examples

### Example 1: Barangay with No Officers
```
Barangay Name: San Jose
Officers: -
```

### Example 2: Barangay with One Officer
```
Barangay Name: Santa Cruz
Officers: Maria Santos
```

### Example 3: Barangay with Multiple Officers
```
Barangay Name: San Miguel
Officers: Juan Dela Cruz and 3 more [click to view]
```

**Clicking shows popup:**
```
┌─────────────────────────────────────┐
│ 👥 Officers Designated to San Miguel│
├─────────────────────────────────────┤
│ JD  Juan Dela Cruz                  │
│     juan.delacruz@example.com       │
│                                     │
│ MS  Maria Santos                    │
│     maria.santos@example.com        │
│                                     │
│ PR  Pedro Reyes                     │
│     pedro.reyes@example.com         │
│                                     │
│ AL  Ana Lopez                       │
│     ana.lopez@example.com           │
└─────────────────────────────────────┘
```

## Tips

- **Hover over officer counts** to see the full list
- **Click outside the popup** to close it
- **Scroll within the popup** if there are many officers
- **Use the search bar** to find specific barangays

## Troubleshooting

### Officers not showing?
- Check if officers are designated in Users & Roles
- Verify officer status is "active"
- Ensure barangay designation is set

### Popup not appearing?
- Make sure there are 2+ officers
- Try clicking instead of hovering
- Check browser console for errors

### Wrong officers displayed?
- Verify officer designations in Users & Roles
- Check if officers are active
- Refresh the page

## Technical Details

### API Endpoint
```
GET /api/barangays/all
```

**Response includes:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Barangay Name",
      "officers": [
        {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "fullName": "John Doe"
        }
      ]
    }
  ]
}
```

### Test Script
```bash
node scripts/test-barangay-officers.js
```

## Support

For issues or questions:
1. Check the documentation in `docs/` folder
2. Review the implementation checklist
3. Contact the development team

## Related Features

- **Barangay Designation**: Assign officers to barangays
- **User Management**: Create and manage officer accounts
- **Award Management**: Track barangay awards and status
