const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'community_tools.db');

console.log('Starting database setup...\n');

try {
    // Delete existing database if it exists
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('✓ Removed existing database');
    }

    // Create new database
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    console.log('✓ Created new SQLite database\n');

    // Create tables
    const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tools (
            tool_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            quantity_available INTEGER DEFAULT 1,
            location TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS usage (
            usage_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tool_id INTEGER NOT NULL,
            borrow_date DATE NOT NULL,
            expected_return_date DATE,
            return_date DATE,
            status TEXT DEFAULT 'borrowed',
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            review TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (tool_id) REFERENCES tools(tool_id) ON DELETE CASCADE
        );
    `;

    const statements = createTablesSQL.split(';').filter(s => s.trim());
    for (const stmt of statements) {
        db.exec(stmt);
    }

    console.log('✓ Created tables: users, tools, usage\n');

    // Insert sample data
    db.prepare('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)').run('John Doe', 'john@example.com', '555-0001');
    db.prepare('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)').run('Jane Smith', 'jane@example.com', '555-0002');
    db.prepare('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)').run('Bob Johnson', 'bob@example.com', '555-0003');

    console.log('✓ Added 3 sample users');

    db.prepare('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)').run('Drill', 'Electric power drill', 'Power Tools', 3, 'Storage A');
    db.prepare('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)').run('Hammer', 'Claw hammer', 'Hand Tools', 5, 'Storage A');
    db.prepare('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)').run('Saw', 'Hand saw', 'Hand Tools', 2, 'Storage B');
    db.prepare('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)').run('Ladder', 'Aluminum ladder', 'Access Equipment', 1, 'Storage C');
    db.prepare('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)').run('Screwdriver Set', 'Multi-bit screwdriver set', 'Hand Tools', 4, 'Storage A');

    console.log('✓ Added 5 sample tools\n');

    db.close();

    console.log('✅ Database setup completed successfully!');
    console.log(`📁 Database file: ${dbPath}\n`);
    console.log('Ready to start the server:');
    console.log('   npm start\n');

} catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
}
