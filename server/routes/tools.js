const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all tools
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM tools').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tool by ID
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM tools WHERE tool_id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create tool
router.post('/', (req, res) => {
  const { name, description, category, quantity_available, location } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)'
    ).run(name, description, category, quantity_available, location);
    
    res.status(201).json({ tool_id: result.lastInsertRowid, name, description, category, quantity_available, location });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tool
router.put('/:id', (req, res) => {
  const { name, description, category, quantity_available, location } = req.body;
  try {
    db.prepare(
      'UPDATE tools SET name = ?, description = ?, category = ?, quantity_available = ?, location = ? WHERE tool_id = ?'
    ).run(name, description, category, quantity_available, location, req.params.id);
    
    res.json({ message: 'Tool updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tool availability
router.get('/:id/availability', (req, res) => {
  try {
    const tool = db.prepare('SELECT * FROM tools WHERE tool_id = ?').get(req.params.id);
    const usages = db.prepare('SELECT * FROM usage WHERE tool_id = ? ORDER BY borrow_date DESC').all(req.params.id);
    
    res.json({ tool, usage_history: usages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
