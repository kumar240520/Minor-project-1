require('dotenv').config({ 
    path: require('path').resolve(__dirname, '../.env'),
    silent: true 
});

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'EduSure Backend API is running!' });
});

// Health Check Endpoint
app.get('/health', async (req, res) => {
    try {
        const db = require('./config/db');
        const client = await db.getClient();
        await client.query('SELECT 1 as test');
        client.release();
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message 
        });
    }
});

// Import Routes (To be created)
const rewardRoutes = require('./routes/rewardRoutes');
if (process.env.ENABLE_LEGACY_REWARDS_API === 'true') {
    app.use('/api/rewards', rewardRoutes);
}

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
