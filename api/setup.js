const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to environment variables');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000
    });
    await client.connect();
    const db = client.db('community_tools');

    const users = db.collection('users');
    const tools = db.collection('tools');
    const usage = db.collection('usage');

    if (await users.estimatedDocumentCount() === 0) {
      await users.insertMany([
        { name: 'John Doe', email: 'john@example.com', phone: '555-0001', created_at: new Date() },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0002', created_at: new Date() },
        { name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0003', created_at: new Date() }
      ]);
    }

    if (await tools.estimatedDocumentCount() === 0) {
      await tools.insertMany([
        { name: 'Drill', description: 'Electric power drill', category: 'Power Tools', quantity_available: 3, location: 'Storage A', created_at: new Date() },
        { name: 'Hammer', description: 'Claw hammer', category: 'Hand Tools', quantity_available: 5, location: 'Storage A', created_at: new Date() },
        { name: 'Saw', description: 'Hand saw', category: 'Hand Tools', quantity_available: 2, location: 'Storage B', created_at: new Date() },
        { name: 'Ladder', description: 'Aluminum ladder', category: 'Access Equipment', quantity_available: 1, location: 'Storage C', created_at: new Date() },
        { name: 'Screwdriver Set', description: 'Multi-bit screwdriver set', category: 'Hand Tools', quantity_available: 4, location: 'Storage A', created_at: new Date() }
      ]);
    }

    if (await usage.estimatedDocumentCount() === 0) {
      await usage.createIndex({ user_id: 1, tool_id: 1, borrow_date: -1 });
    }

    await client.close();

    res.status(200).json({ 
      message: 'Database initialized successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Setup Error:', error);
    res.status(500).json({ error: error.message });
  }
}
