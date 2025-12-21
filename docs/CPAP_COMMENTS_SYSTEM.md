# CPAP Comments System Implementation

## Overview
Added a real-time comments system for CPAP collaboration between admins and officers. The system features a collapsible sidebar that allows both parties to communicate about progress, delays, and updates.

## Features

### 1. Collapsible Sidebar
- **Position**: Fixed on the right side of the screen
- **Toggle Button**: Floating button with "Comments" label and unread count badge
- **Width**: 400px when open
- **Overlay**: Semi-transparent backdrop when open
- **Animation**: Smooth slide-in/slide-out transition

### 2. Real-Time Comments
- **Fetch on Open**: Comments load when sidebar is opened
- **Auto-scroll**: Automatically scrolls to latest comment
- **Timestamp**: Relative time display (e.g., "5m ago", "2h ago", "3d ago")
- **User Info**: Shows commenter's name and role (Admin/Officer)

### 3. Message Styling
- **Own Messages**: Blue background, right-aligned
- **Other Messages**: Gray background, left-aligned
- **Role Badges**: Color-coded badges (Admin = default blue, Officer = secondary gray)
- **Responsive**: Messages wrap and adapt to content

### 4. Input Features
- **Textarea**: Multi-line input with 3 rows
- **Send Button**: Icon button with loading state
- **Keyboard Shortcuts**:
  - `Enter`: Send message
  - `Shift+Enter`: New line
- **Validation**: Cannot send empty messages

## Database Schema

### Table: `cpap_comments`
```sql
CREATE TABLE cpap_comments (
  id SERIAL PRIMARY KEY,
  cpap_id INTEGER NOT NULL REFERENCES cpaps(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Indexes
- `idx_cpap_comments_cpap_id` - Fast lookup by CPAP
- `idx_cpap_comments_user_id` - Fast lookup by user
- `idx_cpap_comments_created_at` - Chronological ordering

## API Endpoints

### GET `/api/cpap/[id]/comments`
Fetch all comments for a specific CPAP.

**Response:**
```json
{
  "comments": [
    {
      "id": 1,
      "cpap_id": 5,
      "user_id": 10,
      "comment_text": "Updated progress on item 3",
      "created_at": "2025-12-21T10:30:00Z",
      "updated_at": "2025-12-21T10:30:00Z",
      "user": {
        "id": 10,
        "firstName": "John",
        "lastName": "Doe",
        "role": "officer"
      }
    }
  ]
}
```

### POST `/api/cpap/[id]/comments`
Add a new comment to a CPAP.

**Request Body:**
```json
{
  "comment_text": "Item 5 is delayed due to budget constraints"
}
```

**Response:**
```json
{
  "comment": {
    "id": 2,
    "cpap_id": 5,
    "user_id": 10,
    "comment_text": "Item 5 is delayed due to budget constraints",
    "created_at": "2025-12-21T11:00:00Z",
    "updated_at": "2025-12-21T11:00:00Z",
    "user": {
      "id": 10,
      "firstName": "John",
      "lastName": "Doe",
      "role": "officer"
    }
  }
}
```

## Integration Points

### Officer CPAP Page (`/cpap`)
- Sidebar available on all CPAP statuses
- Officers can explain delays, ask questions, provide updates
- Visible when viewing or editing CPAP

### Admin Review Page (`/admin/cpap/review/[id]`)
- Sidebar available during review process
- Admins can request clarifications, provide feedback
- Visible when reviewing submitted CPAPs

## Component Structure

### CPAPCommentsSidebar
**Props:**
- `cpapId: number` - The CPAP being discussed
- `currentUserId: number` - ID of the logged-in user
- `currentUserRole: string` - Role of the logged-in user (admin/officer)

**State:**
- `isOpen: boolean` - Sidebar visibility
- `comments: CPAPComment[]` - List of comments
- `newComment: string` - Input field value
- `isLoading: boolean` - Loading state for fetching
- `isSending: boolean` - Loading state for sending
- `unreadCount: number` - Number of unread comments

## Use Cases

### 1. Officer Explains Delay
**Scenario**: An item is marked as "Delayed" in the Progress column

**Action**: Officer opens comments sidebar and writes:
> "Item 3 is delayed because the contractor hasn't delivered the materials yet. Expected completion by end of month."

**Result**: Admin sees the explanation and can provide guidance or adjust expectations

### 2. Admin Requests Clarification
**Scenario**: Admin reviewing a submitted CPAP has questions

**Action**: Admin opens comments sidebar and writes:
> "Can you provide more details on the budget allocation for Item 5? The amount seems higher than expected."

**Result**: Officer receives the question and can respond with clarification

### 3. Progress Update Communication
**Scenario**: Officer completes a milestone

**Action**: Officer writes:
> "Great news! Item 2 is now completed. All documentation has been submitted to the municipal office."

**Result**: Admin is informed of progress without needing a formal status update

### 4. Collaborative Problem Solving
**Scenario**: An item faces unexpected challenges

**Officer**: "Item 7 requires additional permits that weren't anticipated. This will delay completion by 2 weeks."

**Admin**: "Understood. Can you expedite the permit process? I can connect you with the municipal planning office."

**Officer**: "That would be helpful! Please send their contact information."

## Styling

### Colors
- **Sidebar Background**: White (`#FFFFFF`)
- **Header**: Slate 800 (`#1e293b`)
- **Own Messages**: Blue 600 (`#2563eb`)
- **Other Messages**: Gray 100 (`#f3f4f6`)
- **Overlay**: Black with 20% opacity

### Typography
- **Header**: Font semibold, 16px
- **Message Text**: Font normal, 14px
- **Timestamp**: Font normal, 12px, muted color
- **User Name**: Font semibold, 12px

### Spacing
- **Sidebar Width**: 400px
- **Padding**: 16px (1rem)
- **Message Gap**: 16px between messages
- **Input Height**: 3 rows (auto-resize)

## Future Enhancements

### Potential Features
1. **Unread Indicators**: Track which comments user hasn't seen yet
2. **Notifications**: Push notifications when new comments arrive
3. **Mentions**: @mention specific users to notify them
4. **Attachments**: Allow uploading images or documents
5. **Edit/Delete**: Allow users to edit or delete their own comments
6. **Reactions**: Add emoji reactions to comments
7. **Threading**: Reply to specific comments
8. **Search**: Search through comment history
9. **Export**: Export comment thread as PDF

## Files Created/Modified

### New Files
- ✅ `database/add-cpap-comments.sql` - Database migration
- ✅ `src/components/cpap/CPAPCommentsSidebar.tsx` - Sidebar component
- ✅ `src/app/api/cpap/[id]/comments/route.ts` - API endpoints

### Modified Files
- ✅ `prisma/schema.prisma` - Added CPAPComment model
- ✅ `src/types/cpap.ts` - Added CPAPComment interface
- ✅ `src/app/cpap/page.tsx` - Integrated sidebar
- ✅ `src/app/admin/cpap/review/[id]/page.tsx` - Integrated sidebar

## Deployment Steps

### 1. Run Database Migration
```sql
-- Execute in Supabase SQL Editor
-- File: database/add-cpap-comments.sql
```

### 2. Update Prisma Client
```bash
npx prisma generate
```

### 3. Test the Feature
1. Open a CPAP as an officer
2. Click the "Comments" button on the right
3. Type a message and press Enter
4. Verify message appears with your name and role
5. Open the same CPAP as an admin
6. Verify you can see the officer's message
7. Reply to the message
8. Verify both messages display correctly

## Security Considerations

### Authentication
- All API endpoints require valid session
- Users can only comment on CPAPs they have access to

### Authorization
- Officers can only access CPAPs for their assigned barangay
- Admins can access all CPAPs
- Users can only see comments for CPAPs they can view

### Data Validation
- Comment text is required and trimmed
- CPAP existence is verified before allowing comments
- User ID is taken from session (not client input)

## Performance

### Optimizations
- Comments load only when sidebar is opened
- Indexes on cpap_id and created_at for fast queries
- Auto-scroll uses smooth behavior for better UX
- Relative timestamps reduce server load

### Scalability
- Pagination can be added if comment count grows large
- Consider caching frequently accessed comment threads
- WebSocket integration for real-time updates (future)

---

**Implementation Date**: December 21, 2025  
**Status**: ✅ Complete - Ready for Database Migration  
**Next Action**: Run `database/add-cpap-comments.sql` in Supabase SQL Editor
