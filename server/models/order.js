const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Can be null for guest checkout
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            // Not stored for new orders: a base64 photo copied into every order line made
            // one order megabytes big. Screens look the picture up by product id instead.
            image: { type: String, default: '' },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            // set once this line's stock has been returned after a cancellation
            restocked: { type: Boolean, default: false },
        }
    ],
    shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, default: 'India' },
        postalCode: { type: String, required: true },
        mobile: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true, default: 'Cash on Delivery' },
    // Customer-entered UPI transaction ID / UTR number, used to manually
    // verify a QR payment until a real payment gateway (Razorpay etc.) is wired up
    paymentReference: { type: String },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    // true = prices already include GST, so taxPrice is the GST portion INSIDE
    // itemsPrice and is not added again. Orders placed before this fix
    // (field missing) had tax added on top - invoices handle both.
    taxIncluded: { type: Boolean, default: false },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    // Cancelled orders have their stock returned (see cancelAndRestock)
    isCancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
}, { timestamps: true });

// One UPI transaction ID can pay for only one live order. The controller checks
// this first (friendly message); this index closes the race where two requests
// with the same UTR pass that check at the same moment. Cancelled orders drop out
// of the index (isCancelled becomes true) so their UTR can be reused. If your
// database already contains duplicate UTRs the index cannot be built: the error
// is logged below and the controller check still applies.
orderSchema.index(
  { paymentReference: 1 },
  { unique: true, partialFilterExpression: { paymentReference: { $type: 'string' }, isCancelled: false } }
);

const Order = mongoose.model('Order', orderSchema);
Order.on('index', (err) => {
  if (err) console.error('Order paymentReference unique index not created:', err.message);
});

module.exports = Order;