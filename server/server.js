const path = require('path');
const fs = require('fs');

const initialSmtpUser = process.env.SMTP_USER || null;
const initialEmailUser = process.env.EMAIL_USER || null;

require('dotenv').config({ 
    path: path.resolve(__dirname, '../.env'),
    silent: true 
});

require('dotenv').config({ 
    path: path.resolve(__dirname, './.env'),
    silent: true 
});

const afterDotenvSmtpUser = process.env.SMTP_USER || null;
const serverEnvExists = fs.existsSync(path.resolve(__dirname, './.env'));
const rootEnvExists = fs.existsSync(path.resolve(__dirname, '../.env'));

const express = require('express');
const cors = require('cors');
const { getSupabaseConfigError, isSupabaseConfigured } = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 5000;

// trust proxy - needed for express-rate-limit if behind a proxy (like Vercel, Heroku, etc)
app.set('trust proxy', 1);

// Global request logger for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'UP', 
        time: new Date().toISOString(),
        version: 'v3-debug',
        env: process.env.NODE_ENV,
        diagnostics: {
            initialSmtpUser,
            afterDotenvSmtpUser,
            serverEnvExists,
            rootEnvExists,
            currentSmtpUser: process.env.SMTP_USER || null,
            smtpPassPrefix: process.env.SMTP_PASS ? process.env.SMTP_PASS.substring(0, 3) : null,
            currentEmailUser: process.env.EMAIL_USER || null
        },
        config: {
            supabase: isSupabaseConfigured(),
            smtp: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
            smtpUser: process.env.SMTP_USER || null,
            emailUser: process.env.EMAIL_USER || null,
            supabaseMessage: getSupabaseConfigError()
        }
    });
});

// Test Admin Endpoint
app.get('/api/admin/test', (req, res) => {
    console.log('Test endpoint hit!');
    res.json({ 
        message: 'Admin test endpoint working',
        time: new Date().toISOString()
    });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Process-wide handlers to catch silent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Export app for Vercel serverless usage
module.exports = app;

// Only start listening when run directly (not imported as a module by Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}
