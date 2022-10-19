const mongoose = require('mongoose');

const CouponSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    offer: {
        type: Number,
        required: true
    }
})

const Coupon = mongoose.model('Coupon', CouponSchema);
module.exports = Coupon;