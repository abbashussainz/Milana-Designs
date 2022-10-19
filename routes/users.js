const express = require("express");
const router = express.Router();
const authcontroller = require("../controllers/auth")
const homecontroller = require("../controllers/home")
const { alreadyLogged, cartCount, } = require("../middleware/middleware")
const Usercontroller = require("../controllers/users");
const user = require("../middleware/middleware");

const Product = require("../model/products");


router.get("/signup", alreadyLogged, cartCount, authcontroller.sign_get)
router.post("/signup", alreadyLogged, authcontroller.sign_post)

router.get("/login", alreadyLogged, cartCount, authcontroller.login_get)
router.post("/login", alreadyLogged, authcontroller.login_post)
router.post("/logout", authcontroller.logout_put);
router.post("/otp", alreadyLogged, authcontroller.otp_verify)



router.get("/", cartCount, homecontroller.home_get)


router.get("/products", cartCount, Usercontroller.products_get);
router.post("/search", cartCount, Usercontroller.searchProduct)
router.get("/productview/:id", cartCount, Usercontroller.productview);


router.post("/addtocart", user.requireAuthajax, user.checkUser, Usercontroller.addtocart);
router.get("/cart", user.requireAuth, user.checkUser, cartCount, Usercontroller.getcart)
router.post("/change-pro-quantity", user.requireAuth, user.checkUser, Usercontroller.change_cart)
router.post("/cart-remove", user.requireAuth, user.checkUser, Usercontroller.cart_remove)


router.post("/checkout", user.requireAuth, user.checkUser, cartCount, Usercontroller.checkout)
router.post("/place-order", user.requireAuth, user.checkUser, cartCount, Usercontroller.placeOrder)
router.get("/ordersuccess", user.requireAuth, user.checkUser, cartCount, Usercontroller.ordersuccess)
router.get("/orders", user.requireAuth, user.checkUser, cartCount, Usercontroller.vieworder)
router.get("/orderDetails/:id", user.requireAuth, user.checkUser, cartCount, Usercontroller.viewOrderDetails)


router.post("/razo-verify-payment", user.requireAuth, user.checkUser, cartCount, Usercontroller.verifyrazorpay)
router.post("/paypal-payment", user.requireAuth, user.checkUser, cartCount, Usercontroller.Paypal)
router.get("/paypal-payment/success/:price", user.requireAuth, user.checkUser, cartCount, Usercontroller.paypal_success)

router.post("/verifyCoupon", Usercontroller.verifyCoupon)


router.get("/addAddress", user.requireAuth, user.checkUser, cartCount, Usercontroller.addAdress)
router.post("/saveAddress", user.requireAuth, user.checkUser, cartCount, Usercontroller.addAdress_post)
router.get("/account", user.requireAuth, user.checkUser, cartCount, Usercontroller.accountDetails)

module.exports = router;


