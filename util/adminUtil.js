const Product = require("../model/products");
const Order = require("../model/order");
const User = require("../model/users");
const jwt = require("jsonwebtoken")
const AdminToken = process.env.ADMIN_JWT;

const { order } = require("paypal-rest-sdk");

//admin login

const createAdminToken = (id) => {
    const maxAge = 72000;
    return jwt.sign({ id }, AdminToken, {
        expiresIn: maxAge
    });
};




const userCount = async () => await User.find({}).count()
const orderCount = async () => await Order.find({}).count()
const totalamount = async () => {
    let revenue = 0
    const amount = await Order.find({}).select("totalPrice -_id")
    amount.forEach(x => {
        revenue = revenue + x.totalPrice
    })
    return revenue;
}
const productCount = async () => Product.find({}).count();


const productlist = async () => {
    let prolist = [];
    await (await Product.find({}).select("name -_id")).forEach(
        x => prolist.push(x.name)
    )
    return prolist;
}

const productsold = async () => {
    let prosold = [];
    await (await Product.find({}).select("sold -_id")).forEach(
        x => prosold.push(x.sold)
    )
    return prosold;
}




module.exports = { userCount, orderCount, totalamount, productCount, productlist, productsold, createAdminToken }