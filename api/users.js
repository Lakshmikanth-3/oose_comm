const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to environment variables');
}

let cachedClient;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000
  });
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('community_tools');
    const users = db.collection('users');

    if (req.method === 'GET') {
      const allUsers = await users.find({}).toArray();
      const normalizedUsers = allUsers.map((user) => ({
        ...user,
        user_id: user._id.toString()
      }));
      return res.status(200).json(normalizedUsers);
    }

    if (req.method === 'POST') {
      const { name, email, phone } = req.body;
      const result = await users.insertOne({
        name,
        email,
        phone,
        created_at: new Date()
      });
      return res.status(201).json({
        _id: result.insertedId,
        user_id: result.insertedId.toString(),
        name,
        email,
        phone
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
