const express = require('express');
const router = express.Router();
const { client, generateId } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { status = '', priority = '' } = req.query;
    let where = '1=1'; const args = [];
    if (status) { where += ' AND status=?'; args.push(status); }
    if (priority) { where += ' AND priority=?'; args.push(priority); }
    const r = await client.execute({ sql: `SELECT * FROM tasks WHERE ${where} ORDER BY created_at DESC`, args });
    const data = r.rows.map(t => ({ _id: t.id, title: t.title, description: t.description, dueDate: t.due_date, priority: t.priority, status: t.status, assignedTo: t.assigned_to, createdAt: t.created_at }));
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/all', async (req, res) => {
  try {
    await client.execute('DELETE FROM tasks');
    res.json({ success: true, message: 'All tasks deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    const id = generateId();
    await client.execute({ sql: 'INSERT INTO tasks (id,title,description,due_date,priority,status,assigned_to) VALUES (?,?,?,?,?,?,?)', args: [id, title, description || '', dueDate || null, priority || 'Medium', status || 'pending', assignedTo || 'Admin'] });
    res.status(201).json({ success: true, data: { _id: id, ...req.body } });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    await client.execute({ sql: 'UPDATE tasks SET title=?,description=?,due_date=?,priority=?,status=? WHERE id=?', args: [title, description, dueDate, priority, status, req.params.id] });
    res.json({ success: true, data: { _id: req.params.id, ...req.body } });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await client.execute({ sql: 'DELETE FROM tasks WHERE id=?', args: [req.params.id] });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
