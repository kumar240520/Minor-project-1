const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');

// 1. Daily Login Reward Endpoint
// Expects: { userId: Int } in req.body or auth token
router.post('/daily-login', rewardController.claimDailyLogin);

// 2. Resource Purchase / Download Endpoint
// Expects: { userId: Int } 
// Used when a student buys notes via the marketplace
router.post('/download/:resourceId', rewardController.purchaseResource);

// 3. Doubt Solving Reward Endpoint
// Expects: { doubtId: Int, answerId: Int, authorId: Int }
// Hit when a question owner marks an answer as 'accepted'
router.post('/accept-answer', rewardController.acceptAnswerReward);

// 4. Event Attendance Reward Endpoint
// Expects: { eventId: Int, studentId: Int, eventCoins: Int }
// Hit by an Admin to reward a student for showing up
router.post('/attend-event', rewardController.rewardEventAttendance);

// 5. Fiat Purchase (Webhook Endpoint)
// Expects Payload from Razorpay/Stripe, simplified here
router.post('/fiat-webhook', rewardController.handleFiatPurchase);

// 6. View User Wallet Ledger
// Gets the transaction history and total balance for the dashboard
router.get('/wallet/:userId', rewardController.getUserWallet);

module.exports = router;
