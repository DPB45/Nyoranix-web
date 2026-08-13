const mongoose = require('mongoose');

const configSchema = mongoose.Schema({
  banners: [
    {
      image: { type: String, required: true },
      title: { type: String },
      subtitle: { type: String }
    }
  ],
  // UPI QR payment settings - used until Razorpay/a payment gateway is wired up
  upiId: { type: String, default: '' },       // e.g. 'yourshop@okhdfcbank'
  upiPayeeName: { type: String, default: '' } // name shown in the paying customer's UPI app
}, {
  timestamps: true
});

const Config = mongoose.model('Config', configSchema);

module.exports = Config;