const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all usage records
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.*, t.name as tool_name, us.name as user_name 
      FROM usage u
      JOIN tools t ON u.tool_id = t.tool_id
      JOIN users us ON u.user_id = us.user_id
      ORDER BY u.borrow_date DESC
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrow tool
router.post('/borrow', (req, res) => {
  const { user_id, tool_id, borrow_date, expected_return_date } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO usage (user_id, tool_id, borrow_date, expected_return_date, status) 
      VALUES (?, ?, ?, ?, 'borrowed')
    `).run(user_id, tool_id, borrow_date, expected_return_date);
    
    // Update tool quantity
    db.prepare('UPDATE tools SET quantity_available = quantity_available - 1 WHERE tool_id = ?')
      .run(tool_id);
    
    res.status(201).json({ usage_id: result.lastInsertRowid, message: 'Tool borrowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return tool
router.put('/return/:usage_id', (req, res) => {
  const { return_date, rating, review } = req.body;
  try {
    // Get usage record to find tool_id
    const usage = db.prepare('SELECT * FROM usage WHERE usage_id = ?').get(req.params.usage_id);
    
    if (!usage) {
      return res.status(404).json({ error: 'Usage record not found' });
    }
    
    const tool_id = usage.tool_id;
    
    // Update usage record
    db.prepare(`
      UPDATE usage SET return_date = ?, status = 'returned', rating = ?, review = ? WHERE usage_id = ?
    `).run(return_date, rating, review, req.params.usage_id);
    
    // Update tool quantity
    db.prepare('UPDATE tools SET quantity_available = quantity_available + 1 WHERE tool_id = ?')
      .run(tool_id);
    
    res.json({ message: 'Tool returned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get usage history for a user
router.get('/user/:user_id', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.*, t.name as tool_name 
      FROM usage u
      JOIN tools t ON u.tool_id = t.tool_id
      WHERE u.user_id = ?
      ORDER BY u.borrow_date DESC
    `).all(req.params.user_id);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tool ratings
router.get('/tool/:tool_id/ratings', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.rating, u.review, us.name as user_name, u.return_date
      FROM usage u
      JOIN users us ON u.user_id = us.user_id
      WHERE u.tool_id = ? AND u.rating IS NOT NULL
      ORDER BY u.return_date DESC
    `).all(req.params.tool_id);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
