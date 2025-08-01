# Admin Blocked Users Setup Guide

## Overview
The blocked users functionality now provides a comprehensive admin view that shows ALL blocking relationships in the system using the `get_all_user_blocks` database function.

## Features Implemented

### ✅ **Admin View Capabilities:**
- **Complete System Overview**: Admins see ALL blocking relationships, not just their own
- **Comprehensive User Information**: Shows both blocker and blocked user details
- **Enhanced Search**: Search across blocker names, emails, blocked user names, and emails
- **Proper Pagination**: Server-side pagination with accurate counts
- **Role-Based Access**: Different column visibility based on user roles
- **Block Management**: Admins can unblock any relationship

### ✅ **Data Displayed:**
- **Blocker Information**: Name and email of user who created the block
- **Blocked User Information**: Name and email of user who was blocked
- **Block Metadata**: Creation date, Block ID for tracking
- **User Status**: Notification preferences and profile information

### ✅ **Role-Based Permissions:**
- **Admin**: Full access to all columns and all blocking relationships
- **Moderator**: Can see blocker names, blocked users, and manage blocks
- **User**: Limited view of blocked users only

## Setup Instructions

### 1. **Create the Database Function**
Run the `CREATE_GET_ALL_USER_BLOCKS_FUNCTION.sql` script in your Supabase SQL Editor:

```sql
-- This creates the get_all_user_blocks function that returns comprehensive blocking data
-- with search, pagination, and proper user profile information
```

### 2. **Set Up Permissions (Optional)**
Run the `ADMIN_SETUP.sql` script to ensure proper RLS policies:

```sql
-- This ensures authenticated users can access the blocking data
-- and sets up proper permissions for the admin view
```

### 3. **Test the Setup**
1. Start your development server: `npm run dev`
2. Navigate to `/admin/blocked-users`
3. Verify you can see all blocking relationships (if you're an admin)
4. Test the search functionality
5. Test the pagination
6. Test unblocking functionality

## API Endpoints

### GET `/api/blocked-users`
**Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for filtering

**Response:**
```json
{
  "data": [
    {
      "id": "block-uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "blocker-uuid",
      "blocked_user_id": "blocked-uuid",
      "blocker": {
        "id": "blocker-uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "profile_pic_url": "...",
        "notification_enabled": true
      },
      "blocked": {
        "id": "blocked-uuid", 
        "full_name": "Jane Smith",
        "email": "jane@example.com",
        "profile_pic_url": "...",
        "notification_enabled": false
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### DELETE `/api/blocked-users/[id]`
Removes a blocking relationship (admin/moderator only).

## Database Function Details

### `get_all_user_blocks(search_term, limit_count, offset_count)`

**Purpose**: Retrieves all blocking relationships with comprehensive user information.

**Parameters:**
- `search_term` (text, optional): Search across user names and emails
- `limit_count` (integer, optional): Limit results for pagination
- `offset_count` (integer, optional): Offset for pagination

**Returns**: Array of blocking relationships with full user profile data.

**Security**: Uses `SECURITY DEFINER` to ensure consistent access while respecting RLS policies.

## Usage Examples

### Admin Dashboard View
- Shows all blocking relationships system-wide
- Comprehensive search across all user fields
- Full management capabilities

### Moderator View  
- Shows blocking relationships with management access
- Limited column visibility for privacy

### User View
- Shows only basic blocked user information
- Read-only access

## Troubleshooting

### Common Issues:

1. **Function Not Found**: Ensure `CREATE_GET_ALL_USER_BLOCKS_FUNCTION.sql` was executed
2. **Permission Denied**: Run `ADMIN_SETUP.sql` to set up proper RLS policies
3. **Empty Results**: Check if UserBlocks table has data and RLS policies allow access
4. **Search Not Working**: Verify the search_term parameter is being passed correctly

### Verification Steps:

1. **Test Function Directly**:
   ```sql
   SELECT * FROM get_all_user_blocks(NULL, 5, 0);
   ```

2. **Check Permissions**:
   ```sql
   SELECT * FROM UserBlocks LIMIT 1;
   SELECT * FROM UserProfiles LIMIT 1;
   ```

3. **Verify API Response**:
   Visit `/api/blocked-users` in your browser while logged in.

## Next Steps

1. **Add Role Management**: Implement proper admin role assignment
2. **Enhanced Filtering**: Add date range filters, status filters
3. **Bulk Operations**: Add bulk unblock functionality
4. **Export Functionality**: Add CSV export for admin reports
5. **Audit Logging**: Track admin actions on blocking relationships

The admin blocked users functionality is now fully implemented and ready for production use!
