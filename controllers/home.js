const Product = require("../model/products");
var month = require('month');


const home_get = async (req, res) => {
    const products = await Product.find({}).sort({ sold: -1 }).limit(8)
    const Featuredproducts = await Product.find({ isfeatured: true }).limit(8)
    const Navarantra = await Product.aggregate([
        { $match: { collections: 'navarantra' } }])
    res.render("users/home", { products, Featuredproducts, Navarantra });
}




module.exports = { home_get }