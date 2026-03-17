-- Run this script to initialize the PostgreSQL database schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    coins INT DEFAULT 50 CHECK (coins >= 0),
    last_login_reward DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resources Marketplace
CREATE TABLE IF NOT EXISTS Resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    uploader_id UUID NOT NULL REFERENCES Users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    price INT DEFAULT 10 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Resource_Purchases (
    user_id UUID NOT NULL REFERENCES Users(id),
    resource_id INT NOT NULL REFERENCES Resources(id),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, resource_id)
);

-- 3. Q&A / Doubt Solving
CREATE TABLE IF NOT EXISTS Doubts (
    id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES Users(id),
    question TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Answers (
    id SERIAL PRIMARY KEY,
    doubt_id INT NOT NULL REFERENCES Doubts(id),
    author_id UUID NOT NULL REFERENCES Users(id),
    answer_text TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drop index if exists to avoid errors on re-run, then create
DROP INDEX IF EXISTS one_accepted_answer_per_doubt;
CREATE UNIQUE INDEX one_accepted_answer_per_doubt 
ON Answers (doubt_id) WHERE is_accepted = TRUE;

-- 4. Events & Attendance
CREATE TABLE IF NOT EXISTS Events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    reward_coins INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Event_Attendance (
    event_id INT NOT NULL REFERENCES Events(id),
    student_id UUID NOT NULL REFERENCES Users(id),
    attended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, student_id)
);

-- 5. Payments (Razorpay etc.)
CREATE TABLE IF NOT EXISTS Fiat_Purchases (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES Users(id),
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    coins_credited INT NOT NULL,
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. The Universal Master Ledger (Audit Trail)
CREATE TABLE IF NOT EXISTS Transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES Users(id),
    reference_id INT,
    reference_type VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('EARN', 'SPEND')),
    amount INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OPTIONAL: Insert a dummy user to test with if the table is empty
INSERT INTO Users (id, name, email, coins) 
SELECT gen_random_uuid(), 'Test Student', 'test@student.com', 100
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'test@student.com');
