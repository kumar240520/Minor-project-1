const db = require('../config/db');

// 1. Daily Login Reward (+2 Coins)
exports.claimDailyLogin = async (req, res) => {
    const { userId } = req.body;
    
    // Validate input
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // Get current date in UTC to avoid timezone issues
        const today = new Date().toISOString().split('T')[0];
        
        // Lock row and verify eligibility
        const checkResult = await client.query(`
            SELECT id, coins, last_login_reward FROM Users 
            WHERE id = $1 AND (last_login_reward IS NULL OR last_login_reward < $2)
            FOR UPDATE
        `, [userId, today]);

        if (checkResult.rows.length === 0) {
            console.log('⚠️ Daily reward already claimed for user:', userId);
            await client.query('COMMIT');
            return res.status(200).json({ 
                success: false,
                message: 'Daily reward already claimed today.',
                alreadyClaimed: true
            });
        }

        const currentCoins = checkResult.rows[0].coins || 0;
        const newCoins = currentCoins + 2;

        // Grant reward
        await client.query(`
            UPDATE Users SET coins = $1, last_login_reward = $2 WHERE id = $3
        `, [newCoins, today, userId]);

        // Audit Trail
        await client.query(`
            INSERT INTO Transactions (user_id, reference_type, transaction_type, amount, description, created_at) 
            VALUES ($1, 'DAILY_LOGIN', 'EARN', 2, 'Daily login bonus', NOW())
        `, [userId]);

        await client.query('COMMIT');
        
        console.log('✅ Daily reward claimed successfully for user:', userId);
        
        res.status(200).json({ 
            success: true,
            message: 'Successfully claimed 2 Edu Coins for logging in today!',
            coins: newCoins,
            rewardAmount: 2
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Daily login reward error:', err.message);
        res.status(500).json({ 
            error: 'Failed to claim daily reward',
            details: err.message 
        });
    } finally {
        client.release();
    }
};

// 2. Resource Purchase (Marketplace)
exports.purchaseResource = async (req, res) => {
    const resourceId = parseInt(req.params.resourceId);
    const downloaderId = parseInt(req.body.userId);
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check availability
        const resResult = await client.query('SELECT * FROM Resources WHERE id = $1 FOR UPDATE', [resourceId]);
        const resource = resResult.rows[0];
        if (!resource || resource.status !== 'approved') throw new Error('Resource not available for download');

        // Allow free download for original author
        if (resource.uploader_id === downloaderId) {
            await client.query('COMMIT');
            return res.status(200).json({ fileUrl: resource.file_url, message: 'Uploader access granted.' });
        }

        // Try inserting into Purchases (Fails automatically on duplicate via Primary Key Idempotency)
        try {
            await client.query('INSERT INTO Resource_Purchases (user_id, resource_id) VALUES ($1, $2)', [downloaderId, resourceId]);
        } catch (e) {
            if (e.code === '23505') { // Postgres Unique Violation
                await client.query('COMMIT');
                return res.status(200).json({ fileUrl: resource.file_url, message: 'Already purchased. Access granted.' });
            }
            throw e;
        }

        // Check Balance and Deduct
        const userResult = await client.query('SELECT coins FROM Users WHERE id = $1 FOR UPDATE', [downloaderId]);
        const price = resource.price;
        if (userResult.rows[0].coins < price) throw new Error('Insufficient coins');
        
        await client.query('UPDATE Users SET coins = coins - $1 WHERE id = $2', [price, downloaderId]);

        // Reward Uploader (80%)
        const uploaderShare = Math.floor(price * 0.8);
        await client.query('UPDATE Users SET coins = coins + $1 WHERE id = $2', [uploaderShare, resource.uploader_id]);

        // Logs
        await client.query(`INSERT INTO Transactions (user_id, reference_id, reference_type, transaction_type, amount, description) VALUES ($1, $2, 'RESOURCE_DOWNLOAD', 'SPEND', $3, 'Bought study notes')`, [downloaderId, resourceId, price]);
        await client.query(`INSERT INTO Transactions (user_id, reference_id, reference_type, transaction_type, amount, description) VALUES ($1, $2, 'RESOURCE_DOWNLOAD', 'EARN', $3, 'Earnings from notes')`, [resource.uploader_id, resourceId, uploaderShare]);

        await client.query('COMMIT');
        res.status(200).json({ fileUrl: resource.file_url, message: 'Purchase successful!' });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
};

// 3. Doubt Solving Reward
exports.acceptAnswerReward = async (req, res) => {
    const { doubtId, answerId, authorId } = req.body;
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // Mark answer as true (Will fail via UNIQUE index if another answer is already true)
        const updateAns = await client.query('UPDATE Answers SET is_accepted = TRUE WHERE id = $1 AND doubt_id = $2 RETURNING id', [answerId, doubtId]);
        if (updateAns.rowCount === 0) throw new Error("Could not accept answer. Possibly another answer already accepted.");

        await client.query('UPDATE Doubts SET is_resolved = TRUE WHERE id = $1', [doubtId]);
        await client.query('UPDATE Users SET coins = coins + 5 WHERE id = $1', [authorId]);

        await client.query(`INSERT INTO Transactions (user_id, reference_id, reference_type, transaction_type, amount, description) VALUES ($1, $2, 'DOUBT_SOLVED', 'EARN', 5, 'Best answer award')`, [authorId, doubtId]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Answer marked as accepted and 5 coins awarded to author!' });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
};

// 4. Event Attendance Reward
exports.rewardEventAttendance = async (req, res) => {
    const { eventId, studentId, eventCoins } = req.body;
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // Insert Attendance (Fails if already attended via composite PK)
        await client.query('INSERT INTO Event_Attendance (event_id, student_id) VALUES ($1, $2)', [eventId, studentId]);
        
        // Reward
        await client.query('UPDATE Users SET coins = coins + $1 WHERE id = $2', [eventCoins, studentId]);

        await client.query(`INSERT INTO Transactions (user_id, reference_id, reference_type, transaction_type, amount, description) VALUES ($1, $2, 'EVENT', 'EARN', $3, 'Attended official event')`, [studentId, eventId, eventCoins]);

        await client.query('COMMIT');
        res.status(200).json({ message: `Successfully rewarded ${eventCoins} coins to student for attendance.` });

    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Student has already been rewarded for this event.' });
        }
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
};

// 5. Fiat Purchases (Razorpay webhook mockup)
exports.handleFiatPurchase = async (req, res) => {
    // In production, you verify the webhook signature here
    const { userId, paymentId, amountPaid, coinsCredited } = req.body;
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // Record payment. UNIQUE constraint on paymentId prevents replays.
        await client.query(`INSERT INTO Fiat_Purchases (user_id, payment_id, amount_paid, coins_credited) VALUES ($1, $2, $3, $4)`, [userId, paymentId, amountPaid, coinsCredited]);

        await client.query('UPDATE Users SET coins = coins + $1 WHERE id = $2', [coinsCredited, userId]);

        await client.query(`INSERT INTO Transactions (user_id, reference_type, transaction_type, amount, description) VALUES ($1, 'FIAT_PURCHASE', 'EARN', $2, 'Purchased via Payment Gateway')`, [userId, coinsCredited]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Payment successfully mapped and coins credited.' });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
};

// 6. Get User Wallet
exports.getUserWallet = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await db.query('SELECT coins FROM Users WHERE id = $1', [userId]);
        const history = await db.query('SELECT * FROM Transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]);

        res.status(200).json({
            balance: user.rows[0]?.coins || 0,
            recentTransactions: history.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
