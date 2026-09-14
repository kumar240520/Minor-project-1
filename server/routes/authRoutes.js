const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
    sendOTP, 
    verifyOTP, 
    getAuthPolicy, 
    sendRegistrationOTP, 
    verifyRegistrationOTP 
} = require('../controllers/authController');

// Rate limiting for OTP endpoints (development-friendly)
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000, // Development friendly
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again after 10 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const verifyLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute  
    max: 200, // limit each IP to 200 verification attempts per minute
    message: {
        success: false,
        message: 'Too many verification attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// @route   GET /api/auth/policy
router.get('/policy', getAuthPolicy);

// @route   POST /api/auth/send-registration-otp
router.post('/send-registration-otp', otpLimiter, sendRegistrationOTP);

// @route   POST /api/auth/verify-registration-otp
router.post('/verify-registration-otp', verifyLimiter, verifyRegistrationOTP);

// Legacy routes
// @route   POST /api/auth/send-otp
router.post('/send-otp', otpLimiter, sendOTP);

// @route   POST /api/auth/verify-otp
router.post('/verify-otp', verifyLimiter, verifyOTP);

module.exports = router;
