// Custom OTP Service - generates and manages numeric OTP codes

export const generateOTPCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPCode = async (email, otpCode) => {
    // Store OTP in database via API
    const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            otp: otpCode,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to send OTP');
    }

    return await response.json();
};

export const verifyOTPCode = async (email, otpCode) => {
    const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            otp: otpCode,
        }),
    });

    if (!response.ok) {
        throw new Error('Invalid OTP');
    }

    return await response.json();
};
