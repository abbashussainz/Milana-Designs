const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            qty: {
                type: Number,
                default: 1,
            },
            _id: false
        },
    ]
});

const Cart = mongoose.model('cart', cartSchema)
module.exports = Cart