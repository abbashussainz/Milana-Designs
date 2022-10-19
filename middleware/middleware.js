jwt = require("jsonwebtoken")
const User = require("../model/users")
const secret_jwt = process.env.JWT
const adminjwt = process.env.ADMIN_JWT;
const cart = require("../model/cart");


const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, secret_jwt, (err, decodedToken) => {
            if (err) {
                res.redirect('/login');

            } else {
                next();
            }
        });
    } else {
        res.redirect('/login')

    }
};

const requireAuthajax = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, secret_jwt, (err, decodedToken) => {
            if (err) {
                res.send({ auth: false });

            } else {
                next();
            }
        });
    } else {
        res.send({ auth: false });

    }
};



const alreadyLogged = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, secret_jwt, (err, decodedToken) => {
            if (err) {
                next();
            } else {
                res.redirect("/")
            }
        });
    } else {
        next();
    }
};


const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, secret_jwt, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }

}


const cartCount = async (req, res, next) => {
    let count = 0;
    user = res.locals.user
    if (user) {
        const userId = user.id
        let Cart = await cart.findOne({ user: userId })

        if (Cart) {

            Cart.items.forEach((val) => {
                count += val.qty
            })
        }

    }
    res.locals.count = count
    next()
}

const adminAuth = (req, res, next) => {
    const token = req.cookies.adminjwt;
    if (token) {
        jwt.verify(token, adminjwt, (err, decodedToken) => {
            if (err) {
                res.redirect('/admin/login');

            } else {
                next();
            }
        });
    } else {
        res.redirect('/admin/login')

    }
};

const adminloged = (req, res, next) => {
    const token = req.cookies.adminjwt;
    if (token) {
        jwt.verify(token, adminjwt, (err, decodedToken) => {
            if (err) {
                next();
            } else {
                res.redirect('/admin/home');
            }
        });
    } else {
        next();
    }
};

module.exports = { checkUser, alreadyLogged, requireAuth, cartCount, adminAuth, adminloged, requireAuthajax }