const mongoose = require('mongoose');
const { url } = require('../middleware/upload');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image1: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    image2: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    image3: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    image4: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    collections: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },
    offerPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    totalPrice: {
        type: Number
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 500
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    sold: {
        type: Number,
        default: 0
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})


productSchema.pre('save', function (next) {
    this.totalPrice = this.price - ((this.offerPercentage * this.price) / 100)
    next();
});

productSchema.index({ '$**': 'text' });


const Product = mongoose.model('Product', productSchema);
module.exports = Product
