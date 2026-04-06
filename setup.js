const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'community_tools.db');

async function setupDatabase() {
    console.log('Starting database setup...\n');

    try {
    // Create new database
    const db = new sqlite3.Database(dbPath);
    db.run('PRAGMA foreign_keys = ON');

    console.log('✓ Opened SQLite database\n');

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

    const run = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function callback(error) {
            if (error) {
                reject(error);
                return;
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });

    const exec = sql => new Promise((resolve, reject) => {
        db.exec(sql, error => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });

    const get = sql => new Promise((resolve, reject) => {
        db.get(sql, (error, row) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(row);
        });
    });

    const statements = createTablesSQL.split(';').filter(s => s.trim());
    for (const stmt of statements) {
        await exec(stmt);
    }

    console.log('✓ Ensured tables: users, tools, usage\n');

    // Insert sample data only when tables are empty
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
        await run('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', ['John Doe', 'john@example.com', '555-0001']);
        await run('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', ['Jane Smith', 'jane@example.com', '555-0002']);
        await run('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', ['Bob Johnson', 'bob@example.com', '555-0003']);
        console.log('✓ Added 3 sample users');
    } else {
        console.log('✓ Users already exist, skipped sample users');
    }

    const toolCount = await get('SELECT COUNT(*) as count FROM tools');
    if (toolCount.count === 0) {
        await run('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)', ['Drill', 'Electric power drill', 'Power Tools', 3, 'Storage A']);
        await run('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)', ['Hammer', 'Claw hammer', 'Hand Tools', 5, 'Storage A']);
        await run('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)', ['Saw', 'Hand saw', 'Hand Tools', 2, 'Storage B']);
        await run('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)', ['Ladder', 'Aluminum ladder', 'Access Equipment', 1, 'Storage C']);
        await run('INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)', ['Screwdriver Set', 'Multi-bit screwdriver set', 'Hand Tools', 4, 'Storage A']);
        console.log('✓ Added 5 sample tools\n');
    } else {
        console.log('✓ Tools already exist, skipped sample tools\n');
    }

    const columns = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(tools)', (error, rows) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(rows);
        });
    });

    if (!columns.some(column => column.name === 'deleted_at')) {
        await exec('ALTER TABLE tools ADD COLUMN deleted_at TEXT');
    }

    console.log('✓ Added sample data where needed\n');

    db.close();

    console.log('✅ Database setup completed successfully!');
    console.log(`📁 Database file: ${dbPath}\n`);
    console.log('Ready to start the server:');
    console.log('   npm start\n');

    } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
    }
}

setupDatabase();
