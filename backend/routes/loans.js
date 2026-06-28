const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ success: true, data: [], total: 0 }));
router.post('/', (req, res) => res.json({ success: true, data: req.body }));
router.put('/:id', (req, res) => res.json({ success: true, data: req.body }));
router.delete('/:id', (req, res) => res.json({ success: true, message: 'Deleted' }));

module.exports = router;
