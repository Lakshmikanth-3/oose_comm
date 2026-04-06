const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM users').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM users WHERE user_id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)'
    ).run(name, email, phone);
    
    res.status(201).json({ user_id: result.lastInsertRowid, name, email, phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', (req, res) => {
  const { name, email, phone } = req.body;
  try {
    db.prepare(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE user_id = ?'
    ).run(name, email, phone, req.params.id);
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
