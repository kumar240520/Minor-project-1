const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search across all materials and PYQs
router.get('/', searchController.search);

// Search suggestions and popular resources
router.get('/suggestions', searchController.getSuggestions);

module.exports = router;
