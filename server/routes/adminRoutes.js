const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Bulk email endpoints
router.post('/bulk-email', adminController.sendBulkEmail);
router.post('/send-test-email', adminController.sendTestEmail);
router.get('/email-campaigns', adminController.getEmailCampaigns);
router.get('/email-analytics', adminController.getEmailAnalytics);
router.get('/users-list', adminController.getUsersList);

// Authentication & Registration policy endpoints
router.get('/auth-settings', adminController.getAuthSettings);
router.put('/auth-settings', adminController.updateAuthSettings);

module.exports = router;
