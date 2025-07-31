# Setup Guide - Supabase Authentication Integration

This guide will help you set up the enhanced authentication and user management system in your Next.js admin dashboard.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase account and project
- Basic understanding of Next.js and React

### 2. Environment Setup

Create or update your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Install Dependencies

The following dependencies are already included:
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering support
- `@tanstack/react-table` - Advanced table functionality
- `react-hot-toast` - Toast notifications
- `zustand` - State management
- `tailwind-merge` - CSS class merging
- `clsx` - Conditional class names

### 4. Database Schema Setup

Run these SQL commands in your Supabase SQL editor:

#### Create Tables
```sql
-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User blocks table
CREATE TABLE user_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
```

#### Create Views
```sql
-- Combined view for blocked users with profile information
CREATE VIEW UserBlocksWithProfiles AS
SELECT 
  ub.id,
  ub.created_at,
  ub.reason,
  json_build_object(
    'id', blocker.id,
    'full_name', blocker.full_name,
    'email', blocker.email
  ) as blocker,
  json_build_object(
    'id', blocked.id,
    'full_name', blocked.full_name,
    'email', blocked.email
  ) as blocked
FROM user_blocks ub
JOIN profiles blocker ON ub.blocker_id = blocker.id
JOIN profiles blocked ON ub.blocked_id = blocked.id;
```

#### Set up Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User blocks policies
CREATE POLICY "Users can view relevant blocks" ON user_blocks FOR SELECT USING (
  auth.uid() = blocker_id OR auth.uid() = blocked_id
);
CREATE POLICY "Users can create blocks" ON user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete own blocks" ON user_blocks FOR DELETE USING (auth.uid() = blocker_id);
```

#### Create Functions (Optional)
```sql
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Authentication Configuration

#### Enable Email Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Enable "Enable email confirmations" if desired
3. Configure email templates as needed

#### Set up OAuth (Optional)
1. Go to Authentication > Providers
2. Enable Google and/or Apple providers
3. Add your OAuth app credentials
4. Set redirect URLs to include your domain

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and you should see the enhanced authentication system.

## 🔧 Configuration Options

### User Roles
The system supports three default roles:
- `admin` - Full access to all features
- `moderator` - Can manage users and blocked users
- `user` - Basic access, can manage own profile

You can modify roles in `src/types/supabase.ts` and update the validation accordingly.

### Permissions
Permissions are handled through:
- Route-level protection (middleware)
- Component-level guards (AuthGuard, RoleGuard)
- Hook-based checks (usePermissions)

### Customization
- **Validation rules**: Modify `src/utils/validation.ts`
- **Error messages**: Update `src/utils/errorHandling.ts`
- **UI components**: Customize components in `src/components/`
- **Database types**: Update `src/types/supabase.ts`

## 🧪 Testing the Setup

### 1. Authentication Flow
1. Visit `/signup` to create a new account
2. Check that the profile is created in the database
3. Sign in with the new account
4. Verify that the user is redirected to `/admin`

### 2. User Management
1. Sign in as an admin user
2. Visit `/admin/profile` to edit your profile
3. Test the form validation and updates

### 3. Blocked Users
1. Create multiple user accounts
2. Sign in as an admin/moderator
3. Visit `/admin/blocked-users`
4. Test searching and blocking users
5. Verify the blocked users appear in the table

## 🚨 Troubleshooting

### Common Issues

**1. "User not found" errors**
- Ensure the profiles table has the correct RLS policies
- Check that the trigger for creating profiles is working

**2. "Permission denied" errors**
- Verify RLS policies are correctly set up
- Check that users have the correct roles assigned

**3. OAuth not working**
- Verify OAuth provider configuration
- Check redirect URLs match your domain
- Ensure environment variables are correct

**4. Session not persisting**
- Check that cookies are being set correctly
- Verify the session API route is working
- Ensure middleware is properly configured

### Debug Mode
Set `NODE_ENV=development` to see detailed error information in the ErrorBoundary components.

## 📚 Next Steps

1. **Customize the UI** to match your brand
2. **Add more user fields** to the profiles table
3. **Implement additional roles** and permissions
4. **Add email notifications** for user actions
5. **Set up monitoring** and error tracking
6. **Add comprehensive tests** for your specific use cases

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Review the Supabase logs in your dashboard
3. Verify your database schema matches the setup
4. Ensure all environment variables are set correctly

For additional help, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
