# Authentication & User Management Guide

This guide covers the comprehensive authentication and user management system implemented in this Next.js admin dashboard using Supabase.

## 🚀 Features Implemented

### ✅ Authentication System
- **Email-based authentication** with proper validation
- **OAuth integration** (Google, Apple)
- **Session management** with automatic token refresh
- **Password reset** functionality
- **Protected routes** with middleware
- **Role-based access control**

### ✅ User Management System
- **User profile management** with CRUD operations
- **Role management** (admin, moderator, user)
- **User search** functionality
- **Profile editing** with validation
- **User status management**

### ✅ Blocked Users Feature
- **Block/unblock users** with reason tracking
- **Blocked users table** with filtering and pagination
- **Role-based permissions** for blocking actions
- **Search and block** interface for admins/moderators

### ✅ Security & Error Handling
- **Form validation** with comprehensive error messages
- **Error boundaries** for graceful error handling
- **Loading states** and skeleton components
- **Input sanitization** and XSS prevention
- **Authentication guards** and permission checks

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── blocked-users/page.tsx    # Blocked users management
│   │   └── profile/page.tsx          # User profile page
│   ├── api/auth/
│   │   ├── session/route.ts          # Session management API
│   │   ├── signout/route.ts          # Logout API
│   │   └── user/route.ts             # User data API
│   └── (full-width-pages)/(auth)/    # Auth pages
├── components/
│   ├── auth/
│   │   ├── SignInForm.tsx            # Enhanced sign-in form
│   │   ├── SignUpForm.tsx            # Enhanced sign-up form
│   │   └── AuthGuard.tsx             # Authentication guard
│   ├── BlockedTable/
│   │   ├── BlockedTable.tsx          # Enhanced blocked users table
│   │   ├── BlockedTableActions.tsx   # Action buttons for table
│   │   └── columnsConfig.ts          # Table column configuration
│   ├── user-management/
│   │   └── UserSearchAndBlock.tsx    # Search and block interface
│   └── common/
│       ├── ErrorBoundary.tsx         # Error boundary component
│       └── LoadingSpinner.tsx        # Loading components
├── hooks/
│   ├── useAuth.ts                    # Authentication hook
│   ├── useUserManagement.ts          # User management hook
│   ├── useBlockedUsers.ts            # Blocked users hook
│   └── useSupabase.ts                # Supabase client hook
├── utils/
│   ├── validation.ts                 # Form validation utilities
│   ├── errorHandling.ts              # Error handling utilities
│   └── cn.ts                         # Class name utility
└── types/
    ├── index.ts                      # Application types
    └── supabase.ts                   # Database types
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Schema
The application expects the following Supabase database structure:

#### Tables
1. **profiles** - User profiles
2. **user_blocks** - User blocking relationships

#### Views
1. **UserBlocksWithProfiles** - Combined view of blocks with user profiles

#### Functions
1. **get_blocked_users** - Retrieve blocked users
2. **get_user_profile** - Get user profile data

## 🎯 Usage Examples

### Authentication
```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, signOut, hasRole } = useAuth();
  
  if (!user) return <div>Please sign in</div>;
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      {hasRole("admin") && <AdminPanel />}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### User Management
```tsx
import { useUserManagement } from "@/hooks/useUserManagement";

function UserProfile() {
  const { getCurrentUserProfile, updateCurrentUserProfile } = useUserManagement();
  
  const handleUpdate = async (data) => {
    const success = await updateCurrentUserProfile(data);
    if (success) {
      // Handle success
    }
  };
}
```

### Protected Routes
```tsx
import { AuthGuard } from "@/components/auth/AuthGuard";

function AdminPage() {
  return (
    <AuthGuard requiredRoles={["admin"]}>
      <AdminContent />
    </AuthGuard>
  );
}
```

### Role-based Components
```tsx
import { RoleGuard } from "@/components/auth/AuthGuard";

function MyComponent() {
  return (
    <div>
      <RoleGuard allowedRoles={["admin", "moderator"]}>
        <AdminOnlyFeature />
      </RoleGuard>
    </div>
  );
}
```

## 🔒 Security Features

### Form Validation
- Email format validation
- Password strength requirements
- Input sanitization
- XSS prevention

### Authentication Security
- PKCE flow for OAuth
- HTTP-only cookies for session storage
- Automatic token refresh
- Session timeout handling

### Authorization
- Role-based access control
- Route-level protection
- Component-level permission checks
- API endpoint protection

## 🎨 UI/UX Features

### Loading States
- Skeleton components for tables and cards
- Loading spinners with customizable sizes
- Full-screen loading overlays

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Development error details
- Graceful fallbacks

### Responsive Design
- Mobile-friendly forms
- Responsive tables with horizontal scroll
- Dark mode support
- Accessible components

## 🧪 Testing

The application includes comprehensive error handling and validation, but you should add tests for:

1. **Authentication flows**
   - Sign in/sign up
   - Password reset
   - Session management

2. **User management**
   - Profile updates
   - Role changes
   - User blocking/unblocking

3. **Form validation**
   - Input validation
   - Error handling
   - Success flows

## 📝 Best Practices

### Code Organization
- Separate concerns with custom hooks
- Reusable components with proper props
- Type safety with TypeScript
- Consistent error handling

### Performance
- Debounced search queries
- Pagination for large datasets
- Optimistic updates where appropriate
- Proper loading states

### Security
- Input validation on both client and server
- Proper error messages without sensitive data
- Role-based access control
- Secure session management

## 🚀 Deployment

1. Set up your Supabase project
2. Configure environment variables
3. Set up database schema and RLS policies
4. Deploy to your preferred platform
5. Configure OAuth providers if needed

## 📞 Support

For issues or questions:
1. Check the error boundaries for detailed error information
2. Review the browser console for client-side errors
3. Check server logs for API errors
4. Ensure database schema matches expectations
