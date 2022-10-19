const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    paymentMethod: {
        type: String,
        required: true

    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            qty: {
                type: Number,
            },
            _id: false
        },

    ],
    time: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true
    },
    deliveryDetails: {
        name: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        }
    },
    totalPrice: {
        type: Number,
        required: true
    }

})


// categorySchema.virtual('id').get(function () {
//     return this._id.toHexString();
// });

// categorySchema.set('toJSON', {
//     virtuals: true,
// });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
