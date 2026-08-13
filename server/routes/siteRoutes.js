const express = require('express');
const router = express.Router();
const { getSiteSettings, updateSiteSettings } = require('../controllers/siteController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getSiteSettings).put(protect, admin, updateSiteSettings);

module.exports = router;