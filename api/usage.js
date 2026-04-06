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
    const usage = db.collection('usage');
    const tools = db.collection('tools');
    const users = db.collection('users');

    if (req.method === 'GET') {
      const allUsage = await usage.aggregate([
        {
          $lookup: {
            from: 'tools',
            localField: 'tool_id',
            foreignField: '_id',
            as: 'tool'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $addFields: {
            tool_name: { $arrayElemAt: ['$tool.name', 0] },
            user_name: { $arrayElemAt: ['$user.name', 0] }
          }
        },
        { $sort: { borrow_date: -1 } }
      ]).toArray();
      return res.status(200).json(allUsage);
    }

    if (req.method === 'POST') {
      const action = req.query.action;
      
      if (action === 'borrow') {
        const { user_id, tool_id, borrow_date, expected_return_date } = req.body;
        
        const result = await usage.insertOne({
          user_id: user_id,
          tool_id: tool_id,
          borrow_date: new Date(borrow_date),
          expected_return_date: new Date(expected_return_date),
          status: 'borrowed',
          created_at: new Date()
        });

        // Update tool quantity
        await tools.updateOne(
          { _id: tool_id },
          { $inc: { quantity_available: -1 } }
        );

        return res.status(201).json({
          _id: result.insertedId,
          message: 'Tool borrowed successfully'
        });
      }

      if (action === 'return') {
        const { usage_id, return_date, rating, review } = req.body;
        
        const usageRecord = await usage.findOne({ _id: usage_id });
        if (!usageRecord) {
          return res.status(404).json({ error: 'Usage record not found' });
        }

        await usage.updateOne(
          { _id: usage_id },
          {
            $set: {
              return_date: new Date(return_date),
              status: 'returned',
              rating,
              review
            }
          }
        );

        // Update tool quantity
        await tools.updateOne(
          { _id: usageRecord.tool_id },
          { $inc: { quantity_available: 1 } }
        );

        return res.status(200).json({ message: 'Tool returned successfully' });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
