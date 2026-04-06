import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to environment variables');
}

let cachedClient;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
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
    const tools = db.collection('tools');

    if (req.method === 'GET') {
      const allTools = await tools.find({}).toArray();
      return res.status(200).json(allTools);
    }

    if (req.method === 'POST') {
      const { name, description, category, quantity_available, location } = req.body;
      const result = await tools.insertOne({
        name,
        description,
        category,
        quantity_available,
        location,
        created_at: new Date()
      });
      return res.status(201).json({
        _id: result.insertedId,
        name,
        description,
        category,
        quantity_available,
        location
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
