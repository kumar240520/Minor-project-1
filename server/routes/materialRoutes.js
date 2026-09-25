const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search materials
router.get('/search', searchController.search);

// Direct file download/stream with auto-increment
router.get('/:id/download', searchController.downloadFile);

// Record download metric and get download url
router.post('/:id/download', searchController.recordDownload);

// Get single material by ID
router.get('/:id', searchController.getMaterialById);

module.exports = router;
