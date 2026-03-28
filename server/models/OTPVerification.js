const mongoose = require('mongoose');

const OTPVerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp_hash: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        index: { expires: 300 } // TTL index: auto-delete after 5 minutes (300 seconds)
    }
}, {
    collection: 'otp_verifications'
});

// Primary TTL should be on expires_at, but mongoose doesn't support dynamic TTL well.
// So we use a fixed TTL on created_at for cleanup, or ideally just check expiry in logic.
// For production, the logic will handle verification, and we can use a TTL on created_at.

module.exports = mongoose.model('OTPVerification', OTPVerificationSchema);
