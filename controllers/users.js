const product = require("../model/products");
const cart = require("../model/cart");
const Product = require("../model/products");
const Order = require("../model/order");
const userUtil = require("../util/userUtil");
var mongoose = require('mongoose');

const paypal = require('paypal-rest-sdk');
const client_secret = process.env.PAYPAL_SECRET
const Coupon = require("../model/coupon");
const { remove, updateMany } = require("../model/users");
const User = require("../model/users");

const Address = require("../model/address")


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AbEAs3X_JHSekQYVpp7U22-bp7fTxsFLxxpgKtuie4Jj7dH96yYenyLnViYhDQFMpLGLpwG9-48ZGlO8',
    'client_secret': client_secret
});



const products_get = async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories }
    }
    const data = await Product.find(filter).populate('category');
    res.locals.products = data;
    res.render("users/products")
}

const searchProduct = async (req, res) => {
    const { searchString } = req.body
    const products = await Product.find({ $text: { $search: searchString } })
    res.locals.products = products;
    res.render("users/products")
}


const productview = async (req, res) => {
    const id = req.params.id
    const data = await product.findById(id);
    res.locals.product = data;
    res.render("users/productview")
}


const addtocart = async (req, res) => {
    const userID = res.locals.user.id
    const { proID } = req.body
    const Cart = await cart.findOne({ user: userID })
    console.log(Cart);
    if (Cart) {
        const product_exist = Cart.items.findIndex(product => product.productId.toString() == proID);
        if (product_exist != -1) {
            await cart.updateOne({ "items.productId": proID }, { $inc: { 'items.$.qty': 1 } })
            res.send({ status: true })
        }
        else {
            await cart.findOneAndUpdate({ user: userID }, { $push: { items: { productId: proID } } })
            res.send({ status: true })
        }
    }
    else {
        await cart.create({ user: userID, items: [{ productId: proID }] });
        res.send({ status: true })
    }
}


const getcart = async (req, res) => {
    let total_price = 0;
    const userID = res.locals.user._id
    const Cart = await cart.findOne({ user: userID }).populate('items.productId').select("items -_id");
    if (Cart) {
        var product = Cart.items;
        product.map((x) => {
            total_price = total_price + (x.productId.totalPrice * x.qty)
        });
    }
    else {
        product = null;
    }
    res.render("users/cart", { product, total_price })


}

const change_cart = async (req, res) => {
    const { user, product, count } = req.body
    const countint = parseInt(count)
    await cart.updateOne({ "user": user, "items.productId": product }, { $inc: { 'items.$.qty': countint } })
    res.send({ change: true })
}

const cart_count = async (req, res) => {
    let count = 0;
    userId = res.locals.user.id
    let Cart = await cart.findOne({ user: id })

    if (Cart) {

        Cart.items.forEach((val) => {
            count += val.qty
        })
    }

    res.locals.count = count
}

const cart_remove = async (req, res) => {
    const { user, product } = req.body
    await cart.updateOne({ user: user }, { "$pull": { "items": { "productId": product } } }).then(() => res.send({ change: true }))
}

const checkout = async (req, res) => {
    const userID = res.locals.user.id
    const items = await cart.findOne({ user: userID }).select("items -_id");
    if (items) {
        const { totalprice } = req.body
        res.render("users/order", { totalprice })
    }
    else {
        res.redirect("/cart");
    }
}

const placeOrder = async (req, res) => {
    try {
        const userID = res.locals.user.id
        const items = await cart.findOne({ user: userID }).select("items -_id");
        // cartitems = []
        // items.items.map(x => cartitems.push(x))
        const { name, pincode, address, city, phone, paymentMethod, totalprice, couponcode } = req.body
        let finalprice = totalprice;
        const offerPrice = await Coupon.findOne({ code: couponcode })
        if (offerPrice) {
            finalprice = totalprice - offerPrice.offer
        }
        let status = paymentMethod === 'COD' ? 'placed' : 'pending';
        const orders = await Order.create({
            userId: userID,
            paymentMethod: paymentMethod,
            items: items.items,
            status: status,
            deliveryDetails: {
                name: name,
                pincode: pincode,
                address: address,
                city: city,
                phone: phone
            },
            totalPrice: finalprice
        })
        const orderId = orders.id


        if (paymentMethod == "COD") {
            res.send({ payment: true })
        }
        else if (paymentMethod == "razorpay") {
            userUtil.razorpay(orders.id, finalprice).then((order) => res.json({ order, razorpay: true }))
        }
        else {
            res.json({ finalprice, paypal: true, orderId })
        }
        // REDUCING STOCKS
        const order = await Order.findOne({ id: orderId }).select("items -_id");
        order.items.map(async x => {
            const order = await product.findByIdAndUpdate(x.productId, { $inc: { countInStock: -x.qty, sold: x.qty } }, { new: true })
        })
        //  DROP CART
        await userUtil.dropcart(items.id)
    }
    catch (error) {
        console.log(error)
    }

}


const ordersuccess = (req, res) => {
    res.render("users/orderplaced")
}

const vieworder = async (req, res) => {
    const userID = res.locals.user.id
    let order = await Order.find({ user: userID })
    res.render("users/vieworders", { order })
};

const verifyrazorpay = (req, res) => {
    const details = req.body
    const crypto = require('crypto')
    let hmac = crypto.createHmac('sha256', 'oXWOJ8zqwWIcf5yUjwFGL5ft')
    hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
    hmac = hmac.digest('hex')
    if (hmac == details['payment[razorpay_signature]']) {
        userUtil.changestatus(req.body['order[receipt]']);
        res.json({ status: true })
    }
    else {
        res.json({ status: false })
    }
}

const Paypal = (req, res) => {
    let totalPrice = req.body.totalPrice;
    let orderId = req.body.orderId
    let userId = res.locals.user.id
    console.log("the paypal is started to worki")
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/paypal-payment/success/" + totalPrice,
            "cancel_url": "http://localhost:3000/paypal-payment/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "dress",
                    "sku": "dress",
                    "price": totalPrice,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": totalPrice
            },
            "description": "Hat for the best team ever"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {

        if (error) {
            throw error;
        } else {
            payment.orderId = orderId
            console.log(payment)

            {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.json({ forwardLink: payment.links[i].href });


                    }
                }
            }
        }

    });
}

const paypal_success = (req, res) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const totalPrice = req.params.price;
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "" + totalPrice
            }
        }]
    };
    console.log("hey i am here")
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("this payment final")
            res.redirect("/orderSuccess")


        }

    });

};

const viewOrderDetails = async (req, res) => {
    const id = req.params.id
    const order = await Order.findById(id).populate('items.productId').select("items -_id");
    const a = await Order.findById(id).populate('items.productId')
    address = a.deliveryDetails
    products = order.items
    res.render("users/orderDetails", { product, address });
}

const verifyCoupon = async (req, res) => {
    const { code } = req.body
    const offer = await Coupon.findOne({ code: code })
    console.log(offer);
    if (offer) {
        const price = offer.offer
        res.send({ status: true, price: price })
    }
    else {
        res.send({ status: false })
    }
}

const addAdress = (req, res) => {
    res.render("users/address")
}

const addAdress_post = async (req, res) => {
    const { name, pincode, address, city, phone } = req.body
    const userId = res.locals.user.id
    const address_Db = await Address.findOne({ UserId: userId })
    if (address_Db) {
        console.log("hello");
        await Address.findOneAndUpdate({
            userId: userId
        }, {
            name: name,
            pincode: pincode,
            address: address,
            city: city,
            phone: phone
        })
    }
    else {
        const add = await Address.create({
            userId: userId,
            name: name,
            pincode: pincode,
            address: address,
            city: city,
            phone: phone

        })
    }

    res.redirect("/account")
}

const accountDetails = async (req, res) => {
    const userId = res.locals.user.id
    const address = await Address.findOne({ UserId: userId })
    const account = await User.findById(userId).select("-password -_id")
    res.render("users/account", { account, address })
}

module.exports = { productview, products_get, searchProduct, addtocart, getcart, change_cart, cart_count, cart_remove, checkout, placeOrder, verifyCoupon, vieworder, ordersuccess, verifyrazorpay, Paypal, paypal_success, viewOrderDetails, addAdress, accountDetails, addAdress_post }