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
    if (banners !== undefined) {
      if (!Array.isArray(banners)) return res.status(400).json({ message: 'Banners must be a list' });
      update.banners = banners;
    }
    if (upiId !== undefined) {
      // Stored exactly as the customer's UPI app needs it: no spaces, name@bank shape (or empty to switch UPI off)
      const id = typeof upiId === 'string' ? upiId.trim() : null;
      if (id === null || (id !== '' && !/^[\w.\-]{2,}@[a-zA-Z][a-zA-Z0-9]{1,}$/.test(id))) {
        return res.status(400).json({ message: 'UPI ID looks wrong. It should look like name@bank' });
      }
      update.upiId = id;
    }
    if (upiPayeeName !== undefined) {
      if (typeof upiPayeeName !== 'string') return res.status(400).json({ message: 'Payee name must be text' });
      update.upiPayeeName = upiPayeeName.trim().slice(0, 60);
    }

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