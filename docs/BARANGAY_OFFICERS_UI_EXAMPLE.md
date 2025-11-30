# Barangay Officers Display - UI Examples

## Table View

### Officers Column Display

```
┌─────────────────────┬────────────┬────────────┬──────────────────────────┬──────────────┐
│ Barangay Name       │ Households │ Population │ Officers                 │ Award Status │
├─────────────────────┼────────────┼────────────┼──────────────────────────┼──────────────┤
│ Barangay A          │ 150        │ 600        │ -                        │ Awardee      │
│ Barangay B          │ 200        │ 800        │ John Doe                 │ Non-Awardee  │
│ Barangay C          │ 180        │ 720        │ Jane Smith and 1 more    │ Awardee      │
│ Barangay D          │ 220        │ 880        │ Mike Johnson and 3 more  │ Non-Awardee  │
└─────────────────────┴────────────┴────────────┴──────────────────────────┴──────────────┘
```

### Display Rules

- **No officers**: Shows "-"
- **1 officer**: Shows full name (e.g., "John Doe")
- **2+ officers**: Shows first officer + count (e.g., "John Doe and 2 more")
  - Text is blue and underlined on hover
  - Clickable to show popup

## Popup Modal (Hover/Click)

When clicking on "John Doe and 3 more":

```
┌────────────────────────────────────────────────────┐
│ 👥 Officers Designated to Barangay D               │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──┐  Mike Johnson                               │
│  │MJ│  mike.johnson@example.com                   │
│  └──┘                                              │
│                                                    │
│  ┌──┐  Sarah Williams                             │
│  │SW│  sarah.williams@example.com                 │
│  └──┘                                              │
│                                                    │
│  ┌──┐  Robert Brown                               │
│  │RB│  robert.brown@example.com                   │
│  └──┘                                              │
│                                                    │
│  ┌──┐  Emily Davis                                │
│  │ED│  emily.davis@example.com                    │
│  └──┘                                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Popup Features

1. **Header**: Shows barangay name with Users icon
2. **Officer Cards**: Each officer displayed with:
   - Circular avatar with initials
   - Full name (bold)
   - Email address (smaller, gray text)
3. **Scrollable**: Max height of 240px with scroll for many officers
4. **Styling**: 
   - Light gray background for each card
   - Blue accent colors
   - Rounded corners
   - Proper spacing

## Edit Dialog

When editing a barangay, the form shows:

```
┌────────────────────────────────────┐
│ Edit Barangay                      │
├────────────────────────────────────┤
│                                    │
│ Name                               │
│ ┌────────────────────────────────┐ │
│ │ Barangay D                     │ │
│ └────────────────────────────────┘ │
│                                    │
│ Households                         │
│ ┌────────────────────────────────┐ │
│ │ 220                            │ │
│ └────────────────────────────────┘ │
│                                    │
│ Population                         │
│ ┌────────────────────────────────┐ │
│ │ 880                            │ │
│ └────────────────────────────────┘ │
│                                    │
│ Officer                            │
│ ┌────────────────────────────────┐ │
│ │ Captain Name                   │ │
│ └────────────────────────────────┘ │
│                                    │
│         [Cancel]  [Save]           │
└────────────────────────────────────┘
```

Note: The label changed from "Captain" to "Officer" but the field still stores in the `captain` database column for backward compatibility.

## Interaction Flow

1. **User views table**: Sees officer counts for each barangay
2. **User hovers/clicks**: On barangays with 2+ officers
3. **Popup appears**: Shows complete list of designated officers
4. **User can scroll**: If there are many officers
5. **Click outside**: Popup closes

## Responsive Behavior

- **Desktop**: Popup appears next to the trigger
- **Mobile**: Popup adjusts position to stay on screen
- **Touch devices**: Tap to open, tap outside to close
