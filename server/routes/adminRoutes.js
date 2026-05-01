const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Bulk email endpoints
router.post('/bulk-email', adminController.sendBulkEmail);
router.get('/email-campaigns', adminController.getEmailCampaigns);
router.get('/email-analytics', adminController.getEmailAnalytics);
router.get('/users-list', adminController.getUsersList);

module.exports = router;
