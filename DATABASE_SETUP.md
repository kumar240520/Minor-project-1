# PostgreSQL Database Setup for EduSure

## Quick Setup Guide

### Option 1: Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name edusure-db -e POSTGRES_PASSWORD=your_password_here -e POSTGRES_DB=edusure -e POSTGRES_USER=postgres -p 5432:5432 postgres:14-alpine

# Connect to database
docker exec -it edusure-db psql -U postgres -d edusure
```

### Option 2: Install PostgreSQL Locally
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

### Option 3: Update .env with Correct Connection
```env
# Make sure these match your PostgreSQL setup
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edusure
DB_USER=postgres
DB_PASSWORD=your_actual_password

# If using Docker
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edusure
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### Option 4: Test Connection
```javascript
// Update server.js to test connection
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Test query
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected successfully!');
    }
});
```

## Next Steps

1. Choose one of the setup options above
2. Update your `.env` file with correct credentials
3. Start the Node.js server
4. Test the daily reward claim

## Database Tables Needed

Make sure these tables exist in your PostgreSQL database:
- `users` (with columns: id, name, email, coins, last_login_reward)
- `transactions` (with columns: id, user_id, reference_type, transaction_type, amount, description, created_at)

The server code should work once the database connection is established!
