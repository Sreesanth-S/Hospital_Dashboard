# Supabase Integration Setup Guide

## Overview
Your Hospital Dashboard is now integrated with Supabase for real-time data synchronization. This guide walks you through the setup process.

## Step 1: Database Schema Setup

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire SQL from `src/lib/database.sql`
5. Paste it into the SQL editor
6. Click **Run** to create tables and set up RLS policies

### Option B: Using Supabase CLI (Advanced)

```bash
supabase db push
```

## Step 2: Update Your Components

Replace all imports of `useStore` with `useSupabaseStore`:

### Before:
```typescript
import { useStore } from "@/store";
```

### After:
```typescript
import { useStore } from "@/store/supabaseStore";
```

## Step 3: Initialize Data on App Start

Use the `useSupabaseInit` hook in your main App component:

```typescript
import { useSupabaseInit } from "@/hooks/useSupabase";

function App() {
  const { isLoading, error } = useSupabaseInit();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    // Your app components
  );
}
```

## Step 4: Environment Variables

Make sure your `.env.local` file contains:

```
VITE_SUPABASE_URL=https://aaxmbblydpxhicqnbqam.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Available Functions

### Patient Operations
- `fetchAllPatients()` - Get all patients
- `addPatient(input)` - Create new patient
- `updatePatient(id, input)` - Update patient details
- `updatePatientVitals(id, vitals)` - Update vital signs
- `updateDoctorNotes(id, notes)` - Update doctor notes
- `deletePatient(id)` - Delete patient

### Alerts
- `fetchAllAlerts()` - Get all alerts
- `resolveAlert(id)` - Mark alert as resolved

### Notifications
- `fetchAllNotifications()` - Get all notifications
- `addNotification(type, title, message, patientId?, action?)` - Create notification
- `markNotificationAsRead(id)` - Mark as read
- `dismissNotification(id)` - Delete notification
- `clearNotifications()` - Clear all notifications

### Initialization
- `initializeData()` - Fetch all data from Supabase

## Data Types

All data types are defined in `src/types/index.ts`:

- `Patient` - Patient medical record
- `Alert` - High-risk alerts
- `Notification` - User notifications
- `User` - User account information

## Real-Time Updates

The system supports real-time subscriptions. When data changes in Supabase, your app will automatically update. To enable real-time features:

1. Ensure Supabase Realtime is enabled in your project
2. Use the `useStore` hooks to automatically get updates

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` exists in your project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly

### "PGRST" errors
- These are PostgreSQL API errors
- Common: PGRST116 = "not found" errors (handled gracefully)
- Check RLS policies are properly configured

### Data not loading
1. Go to Supabase Dashboard > Authentication > Users to verify auth
2. Check SQL policies under Table Editor > RLS Policies
3. Verify table names match exactly (case-sensitive)

## Next Steps

1. Create your first patient record to test the integration
2. Set up authentication for secure access
3. Configure more advanced RLS policies based on user roles
4. Enable Email/2FA for production use

## Support

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/with-nextjs)
