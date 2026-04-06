const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

async function ensureDeletedAtColumn() {
  const columns = await all('PRAGMA table_info(tools)');
  const hasDeletedAt = columns.some(column => column.name === 'deleted_at');

  if (!hasDeletedAt) {
    await run('ALTER TABLE tools ADD COLUMN deleted_at TEXT');
  }
}

// Get all tools
router.get('/', async (req, res) => {
  try {
    await ensureDeletedAtColumn();
    const rows = await all('SELECT * FROM tools WHERE deleted_at IS NULL OR deleted_at = ""');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tool by ID
router.get('/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM tools WHERE tool_id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create tool
router.post('/', async (req, res) => {
  const { name, description, category, quantity_available, location } = req.body;
  try {
    const result = await run(
      'INSERT INTO tools (name, description, category, quantity_available, location) VALUES (?, ?, ?, ?, ?)',
      [name, description, category, quantity_available, location]
    );
    
    res.status(201).json({ tool_id: result.lastID, name, description, category, quantity_available, location });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tool
router.put('/:id', async (req, res) => {
  const { name, description, category, quantity_available, location } = req.body;
  try {
    await run(
      'UPDATE tools SET name = ?, description = ?, category = ?, quantity_available = ?, location = ? WHERE tool_id = ?'
      , [name, description, category, quantity_available, location, req.params.id]
    );
    
    res.json({ message: 'Tool updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Soft delete tool
router.delete('/:id', async (req, res) => {
  try {
    await ensureDeletedAtColumn();
    const result = await run(
      'UPDATE tools SET deleted_at = CURRENT_TIMESTAMP WHERE tool_id = ? AND (deleted_at IS NULL OR deleted_at = "")',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    res.json({ message: 'Tool removed from inventory' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tool availability
router.get('/:id/availability', async (req, res) => {
  try {
    const tool = await get('SELECT * FROM tools WHERE tool_id = ?', [req.params.id]);
    const usages = await all('SELECT * FROM usage WHERE tool_id = ? ORDER BY borrow_date DESC', [req.params.id]);
    
    res.json({ tool, usage_history: usages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
