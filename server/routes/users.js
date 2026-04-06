const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM users WHERE user_id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const result = await run(
      'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    
    res.status(201).json({ user_id: result.lastID, name, email, phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    await run(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE user_id = ?',
      [name, email, phone, req.params.id]
    );
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
