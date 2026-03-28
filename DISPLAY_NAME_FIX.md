# Display Name Fix Guide

## Problem
Student panel was showing email address instead of the real name entered during registration.

## Root Cause Analysis
The issue occurred because:

1. **During Registration**: Users provide their real name which gets stored in the `users` table
2. **During OTP Login**: The system was creating new user profiles without checking if a profile already existed
3. **Profile Creation Logic**: When creating profiles during OTP login, no real name was available, so it fell back to `email.split('@')[0]`
4. **Dashboard Display**: The dashboard showed this fallback name instead of the original registration name

## Solution Implemented

### 1. Fixed OTP Login Profile Handling (Login.jsx)
**Before**: Always created new profiles with email fallback during OTP login
```javascript
const { role } = await getAuthenticatedUserWithRole({ initializeStudentProfile: true });
```

**After**: Check for existing profiles first, only create if missing
```javascript
const { role, profile } = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });

// Only create profile if it doesn't exist and preserve existing name
if (!profile) {
    console.log("Profile not found, creating new one with email fallback...");
    try {
        await ensureStudentProfile({
            id: data.user.id,
            email: data.user.email,
            fullName: null // Will use email fallback since we don't have the real name
        });
    } catch (profileError) {
        console.error('Profile creation error:', profileError);
    }
} else {
    console.log("Existing profile found with name:", profile.name);
}
```

### 2. Enhanced Dashboard Profile Handling (Dashboard.jsx)
**Before**: Basic profile creation without logging
```javascript
const newProfile = await initializeStudentProfileForUser(user);
profileData = newProfile;
```

**After**: Added logging and better error handling
```javascript
const newProfile = await initializeStudentProfileForUser(user);
profileData = newProfile;
console.log("Created new profile:", newProfile);
```

And added logging for existing profiles:
```javascript
} else {
    console.log("Found existing profile with name:", profileData.name);
}
```

## How It Works Now

### Registration Flow
1. User fills registration form with name, email, password
2. User receives and verifies OTP
3. User profile is created with real name: `ensureStudentProfile({ fullName: name })`
4. Real name is stored in `users` table

### OTP Login Flow
1. User enters email and receives OTP
2. User verifies OTP
3. System checks if profile already exists: `getAuthenticatedUserWithRole({ initializeStudentProfile: false })`
4. **If profile exists**: Uses existing profile with real name
5. **If profile doesn't exist**: Creates new profile with email fallback (for new users who never registered)

### Dashboard Display
1. Dashboard fetches user profile from `users` table
2. Uses `getDisplayName()` utility to get the name
3. Shows real name if available, falls back to email prefix if not

## Files Modified
- `client/src/pages/Login.jsx`: Fixed profile handling during OTP login
- `client/src/pages/Dashboard.jsx`: Enhanced logging and profile handling

## Testing
1. Register a new user with a real name
2. Logout and login with OTP
3. Verify that the real name from registration is displayed in dashboard
4. Test with existing users who have profiles
5. Test with new users who login directly with OTP (should show email fallback)

## Expected Behavior
- **Registered users**: Show real name from registration in dashboard
- **New OTP-only users**: Show email fallback (since no name was provided)
- **Consistent display**: Name remains consistent across login sessions

## Notes
- The fix preserves existing user profiles with real names
- New users who skip registration and use OTP directly will see email-based names
- Console logging helps debug profile creation and retrieval
- The `initializeStudentProfile: false` flag prevents automatic profile creation during role detection
