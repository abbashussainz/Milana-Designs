const Razorpay = require('razorpay');
const key_id = process.env.KEY_ID;
const key_secret = process.env.KEY_SECRET;
const Order = require("../model/order");
const Cart = require("../model/cart");


// creating instance of razorpay 
var instance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
});


//creating for orders for razorpay
const razorpay = async (orderId, totalPrice) => {
    const options = {
        amount: totalPrice * 100,
        currency: "INR",
        receipt: orderId
    }
    return await instance.orders.create(options)
}

const dropcart = async (cartId) => {
    try {
        console.log(cartId)
        const a = await Cart.findOneAndDelete({ id: cartId })
    }
    catch (error) {
        console.log(error)
    }

}
const changestatus = async (orderId) => {
    try {
        const a = await Order.findByIdAndUpdate(orderId, { "$set": { status: "placed" } })
        console.log(a)
    }
    catch (error) {
        console.log(error)
    }

}



module.exports = { razorpay, changestatus, dropcart }