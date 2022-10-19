const express = require("express");
const router = express.Router();
const admincontoller = require("../controllers/admin");
const cloudinary = require("../middleware/upload")
const { adminAuth, adminloged } = require("../middleware/middleware");

router.get("/login", adminloged, admincontoller.adminLogin_get);
router.post("/login", adminloged, admincontoller.adminLogin_post);
router.get("/logout", admincontoller.logout)


router.get("/home", adminAuth, admincontoller.adminhome_get)


router.get("/users", adminAuth, admincontoller.userdata_get)

router.get("/blockuser/:id", adminAuth, admincontoller.blockuser)
router.get("/activeuser/:id", adminAuth, admincontoller.activeuser)



router.get("/products", adminAuth, admincontoller.products_get)
router.get("/productview/:id", adminAuth, admincontoller.productview_get)

router.get("/addproduct", adminAuth, admincontoller.addproduct_get)
router.post("/addproduct", adminAuth, admincontoller.addproduct_post)


router.get("/editproduct/:id", adminAuth, admincontoller.editproduct_get)
router.post("/editproduct", adminAuth, admincontoller.editproduct_post)

router.post("/deleteProduct", adminAuth, admincontoller.delete_post)


router.get("/offer", adminAuth, admincontoller.offer_product)
router.post("/offer", adminAuth, admincontoller.offer_apply)
router.get("/removeoffer/:id", adminAuth, admincontoller.offer_remove)

router.get("/coupon", adminAuth, admincontoller.coupon)
router.post("/addcoupon", adminAuth, admincontoller.coupon_add)


router.post("/featureProduct", adminAuth, admincontoller.featureProduct)


router.get("/category", adminAuth, admincontoller.category_get)
router.post("/category", adminAuth, admincontoller.category_post)
router.get("/removecategory/:id", adminAuth, admincontoller.category_remove)


router.get("/salesReport", adminAuth, admincontoller.SalesReport)

router.get("/orders", adminAuth, admincontoller.orders)
router.post("/orderstatus", adminAuth, admincontoller.orderstatus);
router.get("/orderDetails/:id", adminAuth, admincontoller.viewOrderDetails);








module.exports = router;