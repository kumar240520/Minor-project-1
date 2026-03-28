# Login Issues Fix for Vercel Deployment

## Problems Identified

### 1. OTP Login "Failed to Fetch"
**Root Cause**: Trying to call backend API (`http://localhost:5000/api/auth/send-otp`) which doesn't exist on Vercel
**Solution**: Use Supabase built-in OTP functionality

### 2. Password Login "Invalid User Credentials"  
**Root Cause**: Users registered via OTP don't have passwords set
**Solution**: Better error handling and user guidance

## Fixes Applied

### OTP Login Fixed
- `handleSendOTP()`: Now uses `supabase.auth.signInWithOtp()` directly
- `handleVerifyOTP()`: Now uses `supabase.auth.verifyOtp()` directly  
- `handleResendOTP()`: Now uses Supabase resend functionality
- Removed all backend API dependencies

### Password Login Improvements
- Added better error messages for passwordless users
- Enhanced error handling for various auth scenarios
- Maintained existing profile creation logic

## How It Works Now

### OTP Flow
1. User enters email → `supabase.auth.signInWithOtp()` sends OTP
2. User enters OTP → `supabase.auth.verifyOtp()` verifies and creates session
3. User redirected to dashboard

### Password Flow  
1. User enters email/password → `supabase.auth.signInWithPassword()`
2. If user exists with password → login successful
3. If user exists but no password → shows helpful error message

## Testing Instructions

1. **OTP Login**: 
   - Enter institutional email
   - Check email for OTP (6-digit code from Supabase)
   - Enter OTP and verify

2. **Password Login**:
   - For existing users with passwords: normal login
   - For OTP-only users: will show "Invalid credentials" - guide them to use OTP

## Deployment Notes

- No backend server required for Vercel
- All authentication handled by Supabase
- Email sending handled by Supabase/Resend integration
- Works seamlessly in production

## Error Messages

- "Invalid login credentials" → User exists but wrong password or no password
- "User not found" → Email not registered
- "Too many requests" → Rate limiting from Supabase
- Network errors → Supabase connectivity issues
