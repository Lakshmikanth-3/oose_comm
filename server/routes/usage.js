const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

// Get all usage records
router.get('/', async (req, res) => {
  try {
    const rows = await all(`
      SELECT u.*, t.name as tool_name, us.name as user_name 
      FROM usage u
      JOIN tools t ON u.tool_id = t.tool_id
      JOIN users us ON u.user_id = us.user_id
      ORDER BY u.borrow_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrow tool
router.post('/borrow', async (req, res) => {
  const { user_id, tool_id, borrow_date, expected_return_date } = req.body;
  try {
    const result = await run(`
      INSERT INTO usage (user_id, tool_id, borrow_date, expected_return_date, status) 
      VALUES (?, ?, ?, ?, 'borrowed')
    `, [user_id, tool_id, borrow_date, expected_return_date]);
    
    // Update tool quantity
    await run('UPDATE tools SET quantity_available = quantity_available - 1 WHERE tool_id = ?', [tool_id]);
    
    res.status(201).json({ usage_id: result.lastID, message: 'Tool borrowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return tool
router.put('/return/:usage_id', async (req, res) => {
  const { return_date, rating, review } = req.body;
  try {
    // Get usage record to find tool_id
    const usage = await get('SELECT * FROM usage WHERE usage_id = ?', [req.params.usage_id]);
    
    if (!usage) {
      return res.status(404).json({ error: 'Usage record not found' });
    }
    
    const tool_id = usage.tool_id;
    
    // Update usage record
    await run(`
      UPDATE usage SET return_date = ?, status = 'returned', rating = ?, review = ? WHERE usage_id = ?
    `, [return_date, rating, review, req.params.usage_id]);
    
    // Update tool quantity
    await run('UPDATE tools SET quantity_available = quantity_available + 1 WHERE tool_id = ?', [tool_id]);
    
    res.json({ message: 'Tool returned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get usage history for a user
router.get('/user/:user_id', async (req, res) => {
  try {
    const rows = await all(`
      SELECT u.*, t.name as tool_name 
      FROM usage u
      JOIN tools t ON u.tool_id = t.tool_id
      WHERE u.user_id = ?
      ORDER BY u.borrow_date DESC
    `, [req.params.user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tool ratings
router.get('/tool/:tool_id/ratings', async (req, res) => {
  try {
    const rows = await all(`
      SELECT u.rating, u.review, us.name as user_name, u.return_date
      FROM usage u
      JOIN users us ON u.user_id = us.user_id
      WHERE u.tool_id = ? AND u.rating IS NOT NULL
      ORDER BY u.return_date DESC
    `, [req.params.tool_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
