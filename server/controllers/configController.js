const Config = require('../models/Config');

// @desc    Get Site Config
// @route   GET /api/config
// @access  Public
const getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({ banners: [] });
    }
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error Fetching Config' });
  }
};

// @desc    Update Site Config
// @route   PUT /api/config
// @access  Private/Admin
const updateConfig = async (req, res) => {
  try {
    const { banners, upiId, upiPayeeName } = req.body;
    const update = {};
    if (banners !== undefined) update.banners = banners;
    if (upiId !== undefined) update.upiId = upiId;
    if (upiPayeeName !== undefined) update.upiPayeeName = upiPayeeName;

    // Use findOneAndUpdate with $set to FORCE replace the banners array
    // upsert: true creates the document if it doesn't exist
    const updatedConfig = await Config.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    );

    res.json(updatedConfig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error Updating Config' });
  }
};

module.exports = { getConfig, updateConfig };