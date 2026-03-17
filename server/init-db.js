require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function initDB() {
    try {
        console.log('Reading init.sql...');
        const sqlPath = path.join(__dirname, 'models', 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Executing SQL statements on the database...');
        await db.query(sql);
        
        console.log('✅ Database initialization complete! All tables have been created.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        process.exit(1);
    }
}

initDB();
