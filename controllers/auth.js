const user = require("../model/users")
const util = require("../util/auth")
const userUtil = require("../util/userUtil")
const jwt = require("jsonwebtoken")


// user sign get method
const sign_get = (req, res) => {
    res.render("users/sign", { errors: false });
}

// user sign post method
const sign_post = async (req, res) => {
    const { name, email, mobile, password } = req.body

    //:- setting up temp user data
    util.tempUserdata(req.body);
    try {
        //checking id the user already exist
        let email_exist = await util.emailExist(email, mobile);
        let mobile_exist = await util.mobileExist(mobile);
        util.sendOtp(mobile).then((otp) => {
            res.render("users/otp", { mobile })
        })

    }
    catch (err) {
        const errors = util.errorMessage(err)
        console.log(errors)
        res.render("users/sign", { errors });
    }



}

//SENDING OTP 


const otp_verify = async (req, res) => {
    const { code } = req.body;
    const { name, email, mobile, password } = util.getUserdata();
    util.verifyOtp(mobile, code).then((data) => {
        if (data.status == "approved") {
            user.create({ name, email, mobile, password }).then(async () => {
                const users = await user.find({ email })
                let id = ""
                users.forEach(x => { id = x.id });
                const token = util.createToken(id)
                res.cookie('jwt', token, { httpOnly: true, maxAge: 3000 * 1000 });
                res.redirect("/")
                util.tempUserdata(data = false);
            })
        }
        else {
            console.log("not defined")
        }

    })




}



const login_get = (req, res) => {
    res.render("users/login", { errors: false });
}


const login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const User = await user.login(email, password)
        const token = util.createToken(User.id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3000 * 1000 });
        res.redirect("/")

    } catch (err) {
        const errors = util.errorMessage(err)
        console.log(errors)
        res.render("users/login", { errors: errors });
    }
}


const logout_put = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}



module.exports = { otp_verify, sign_get, sign_post, login_get, login_post, logout_put }