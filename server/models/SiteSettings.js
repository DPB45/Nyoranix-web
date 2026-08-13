const mongoose = require('mongoose');

const siteSettingsSchema = mongoose.Schema({
  banner: {
    image: { type: String, required: true, default: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
    title: { type: String, required: true, default: 'Innovate with Precision' },
    subtitle: { type: String, required: true, default: 'Your one-stop shop for premium electronics, IoT components, and industrial automation solutions.' },
  }
}, { timestamps: true });

// We typically only have ONE settings document, so we don't need complex IDs
const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
module.exports = SiteSettings;