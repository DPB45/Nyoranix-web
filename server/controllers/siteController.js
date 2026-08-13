const SiteSettings = require('../models/SiteSettings');

// @desc    Get Site Settings (Banner)
// @route   GET /api/config
// @access  Public
const getSiteSettings = async (req, res) => {
  try {
    // Find the first settings doc, or create one if it doesn't exist
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Site Settings
// @route   PUT /api/config
// @access  Private/Admin
const updateSiteSettings = async (req, res) => {
  const { image, title, subtitle } = req.body;
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    settings.banner.image = image || settings.banner.image;
    settings.banner.title = title || settings.banner.title;
    settings.banner.subtitle = subtitle || settings.banner.subtitle;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Update Failed' });
  }
};

module.exports = { getSiteSettings, updateSiteSettings };