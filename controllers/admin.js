const moongose = require("mongoose").isValidObjectId();
const { render } = require("ejs");
const user = require("../model/users")
ADMIN_MAIL = process.env.ADMIN_MAIL;
ADMIN_PASS = process.env.ADMIN_PASS;
const auth = require("../util/auth")
const category = require("../model/category")
const product = require("../model/products")
const cloudinary = require("../middleware/upload")
const Product = require("../model/products");
const Coupon = require("../model/coupon");
const Order = require("../model/order")
const adminUtil = require("../util/adminUtil")
const admin = require("../model/admin")
const excelJs = require("exceljs");



const adminLogin_get = (req, res) => {
    res.render("admin/adminlogin", { auth: true })
}

// login_in admin 
const adminLogin_post = async (req, res) => {
    const { email, password } = req.body
    try {
        const Admin = await admin.login(email, password)
        const admin_token = adminUtil.createAdminToken(Admin.id);
        res.cookie('adminjwt', admin_token, { httpOnly: true, maxAge: 720000 })
        res.redirect("/admin/home")
    } catch (error) {
        res.render("admin/adminlogin", { auth: false })
    }
}

//----///

const adminhome_get = async (req, res) => {
    const userCount = await adminUtil.userCount()
    const orderCount = await adminUtil.orderCount()
    const totalAmount = await adminUtil.totalamount()
    const productCount = await adminUtil.productCount()
    const productlist = await adminUtil.productlist()
    const productsold = await adminUtil.productsold()
    res.render("admin/adminhome", { userCount, orderCount, totalAmount, productCount, productlist, productsold, layout: "../views/admin/layouts/adminlayout" })
}

//----///


const userdata_get = async (req, res) => {

    try {
        const user_data = await user.find({})
        res.locals.user = user_data
        res.render("admin/userdata", { layout: "../views/admin/layouts/adminlayout" })

    } catch (error) {
        console.log(error);
    }

}

//--//

const blockuser = async (req, res) => {
    try {
        const id = req.params.id;
        const User = await user.findByIdAndUpdate(id, { status: false }, { new: true });
        res.redirect("/admin/users")
    } catch (error) {
        console.log(error)
    }

}

const activeuser = async (req, res) => {
    try {
        const id = req.params.id;
        const User = await user.findByIdAndUpdate(id, { status: true }, { new: true });
        res.redirect("/admin/users")
    } catch (error) {
        console.log(error)
    }
}

///////////////////////

const addproduct_get = async (req, res) => {
    const Category = await category.find({})
    res.locals.category = Category
    res.render("admin/addproducts", { layout: "../views/admin/layouts/adminlayout" });
}

const addproduct_post = async (req, res) => {
    const { name, description, collections, price, category, countInStock } = req.body
    const { image1, image2, image3, image4 } = req.files
    try {
        const img1 = await cloudinary.uploader.upload(image1.tempFilePath)
        const img2 = await cloudinary.uploader.upload(image2.tempFilePath)
        const img3 = await cloudinary.uploader.upload(image3.tempFilePath)
        const img4 = await cloudinary.uploader.upload(image4.tempFilePath)
        await product.create({
            name,
            description,
            collections,
            price,
            category,
            countInStock,
            image1: {
                public_id: img1.public_id,
                url: img1.url
            },
            image2: {
                public_id: img2.public_id,
                url: img2.url
            },
            image3: {
                public_id: img3.public_id,
                url: img3.url
            },
            image4: {
                public_id: img4.public_id,
                url: img4.url
            },
        })
        res.redirect("/admin/products");
    }
    catch (err) {
        console.log(err);
    }
}

///////////
const editproduct_get = async (req, res) => {
    const proId = req.params.id;
    const product = await Product.findById(proId)
    const Category = await category.find({})
    res.locals.category = Category
    res.render("admin/editproducts", { product, layout: "../views/admin/layouts/adminlayout" })
}

const editproduct_post = async (req, res) => {

    const { name, description, collections, price, category, countInStock, proId } = req.body
    const { image1, image2, image3, image4 } = req.files
    try {
        const product = await Product.findById(proId)
        const imageid = [product.image1.public_id, product.image2.public_id, product.image3.public_id, product.image4.public_id]
        await cloudinary.api.delete_resources(imageid, { invalidate: true, resource_type: "image" });
    } catch (error) {
        console.log(error);
    }
    try {

        const img1 = await cloudinary.uploader.upload(image1.tempFilePath)
        const img2 = await cloudinary.uploader.upload(image2.tempFilePath)
        const img3 = await cloudinary.uploader.upload(image3.tempFilePath)
        const img4 = await cloudinary.uploader.upload(image4.tempFilePath)

        await Product.findByIdAndUpdate(proId, {
            $set: {
                name,
                description,
                collections,
                price,
                category,
                countInStock,
                image1: {
                    public_id: img1.public_id,
                    url: img1.url
                },
                image2: {
                    public_id: img2.public_id,
                    url: img2.url
                },
                image3: {
                    public_id: img3.public_id,
                    url: img3.url
                },
                image4: {
                    public_id: img4.public_id,
                    url: img4.url
                },
            }
        })
        res.redirect(`./productview/${proId}`);
    }
    catch (err) {
        console.log(err);
    }
}

const delete_post = async (req, res) => {
    const { proID } = req.body
    const product = await Product.findByIdAndDelete(proID)
    const imageid = [product.image1.public_id, product.image2.public_id, product.image3.public_id, product.image4.public_id]
    await cloudinary.api.delete_resources(imageid, { invalidate: true, resource_type: "image" });
    res.send({ status: true })
}
///////////////

const category_get = async (req, res) => {
    const Category = await category.find({})
    res.locals.category = Category
    res.render("admin/category", { layout: "../views/admin/layouts/adminlayout" })
}

const category_post = (req, res) => {
    const { name } = req.body;
    category.create({ name }).then(() => {
        res.redirect("/admin/category")
    })
}

const category_remove = async (req, res) => {
    const id = req.params.id
    const remove = await category.findByIdAndRemove(id)
    res.redirect("/admin/category")

}

//////////////////////////

const products_get = async (req, res) => {
    const products = await Product.find({});
    res.render("admin/adminproducts", { products, layout: "../views/admin/layouts/adminlayout" })
}

///////////////////

const productview_get = async (req, res) => {
    const id = req.params.id
    const data = await Product.findById(id);
    res.locals.product = data;
    res.render("admin/adminproductview", { layout: "../views/admin/layouts/adminlayout" })
}

//////////

const featureProduct = async (req, res) => {
    const { proID } = req.body
    const product = await Product.findOne({ _id: proID })
    if (product.isFeatured) {
        await Product.findOneAndUpdate({ _id: proID }, { $set: { 'isFeatured': false } })
    }
    else {
        await Product.findOneAndUpdate({ _id: proID }, { $set: { 'isFeatured': true } })
    }
    res.send({ response: true })


}


////////////////
const offer_product = async (req, res) => {
    const products = await Product.find({})
    const offer = await Product.find().where('offerPercentage').gt(0);
    res.render("admin/offer", { products, offer, layout: "../views/admin/layouts/adminlayout" })
}

const offer_apply = async (req, res) => {
    const { proId, offer } = req.body
    id = "" + proId
    const pro = await Product.findByIdAndUpdate(id, { $set: { offerPercentage: offer } }, { new: true })
    const price = Math.round(pro.price - ((pro.offerPercentage * pro.price) / 100))
    const pro_price = await Product.findByIdAndUpdate(proId, { $set: { totalPrice: price } }, { new: true })
    res.redirect("/admin/offer")
}


const offer_remove = async (req, res) => {
    const id = req.params.id;
    const pro = await Product.findByIdAndUpdate(id, { $set: { offerPercentage: 0 } }, { new: true })
    const price = Math.round(pro.price - ((pro.offerPercentage * pro.price) / 100))
    const pro_price = await Product.findByIdAndUpdate(id, { $set: { totalPrice: price } }, { new: true })
    res.redirect("/admin/offer")
}

//////////////////////////

const coupon = async (req, res) => {
    const coupon = await Coupon.find({})
    res.render("admin/coupon", { coupon, layout: "../views/admin/layouts/adminlayout" })
}

const coupon_add = async (req, res) => {
    const { name, code, offer } = req.body;
    const coupon = await Coupon.create({
        name,
        code,
        offer
    })

}

/////////////////// ORDER MANAGEMT ////////////

const orders = async (req, res) => {
    const order = await Order.find({}).populate("userId")
    res.render("admin/orders", { order, layout: "../views/admin/layouts/adminlayout" })
}

const orderstatus = async (req, res) => {
    const { orderID, status } = req.body
    const changeStatus = await Order.findByIdAndUpdate(orderID, { $set: { status: status } })
    res.send({ status: true })
}

const logout = (req, res) => {
    res.cookie('adminjwt', '', { maxAge: 1 });
    res.redirect('/admin/login');
}

const viewOrderDetails = async (req, res) => {
    const id = req.params.id
    const order = await Order.findById(id).populate('items.productId').select("items -_id");
    const a = await Order.findById(id).populate('items.productId')
    address = a.deliveryDetails
    products = order.items
    res.render("admin/orderDetails", { product, address, layout: "../views/admin/layouts/adminlayout" });
}

//sales report download csv file

const SalesReport = async (req, res) => {
    let SalesReport = await Order.find({}).populate("userId items.productId")
    try {
        const workbook = new excelJs.Workbook();

        const worksheet = workbook.addWorksheet("Sales Report");

        worksheet.columns = [
            { header: "S no.", key: "s_no" },
            { header: "OrderID", key: "_id" },
            { header: "User", key: "name" },
            { header: "Products", key: "products" },
            { header: "Method", key: "paymentMethod" },
            { header: "status", key: "status" },
            { header: "Amount", key: "totalPrice" },
        ];
        let counter = 1;
        SalesReport.forEach((report) => {
            report.s_no = counter;
            report.products = "";
            report.name = report.deliveryDetails.name;
            report.items.forEach((eachProduct) => {
                report.products += eachProduct.productId.name + ",";
            });
            worksheet.addRow(report);
            counter++;
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        res.header(
            "Content-Type",
            "application/vnd.oppenxmlformats-officedocument.spreadsheatml.sheet"
        );
        res.header("Content-Disposition", "attachment; filename=report.xlsx");

        workbook.xlsx.write(res);
    } catch (err) {
        console.log(err.message);
    }
};


module.exports = { adminLogin_get, adminLogin_post, adminhome_get, userdata_get, blockuser, activeuser, addproduct_get, addproduct_post, category_get, category_post, category_remove, products_get, productview_get, featureProduct, editproduct_get, editproduct_post, delete_post, offer_product, offer_apply, offer_remove, coupon, coupon_add, orders, orderstatus, logout, SalesReport, viewOrderDetails }