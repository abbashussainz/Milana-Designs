const { resolve } = require("path");
const { send } = require("process");
const user = require("../model/users")
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const jwt = require("jsonwebtoken")
const secret_jwt = process.env.JWT



// this function check whether the given email is unique //////////////////////////////////
emailExist = async (email) => {
    const user_email = await (await user.find({ email })).toString();
    if (!user_email) {
        return user_email;
    }
    throw Error("This email id already exist")
}
//--------------//



// this function check whether the given mobile is unique ////////
mobileExist = async (mobile) => {
    const user_mobile = await (await user.find({ mobile })).toString();
    if (!user_mobile) {
        return user_mobile;
    }
    throw Error("This mobile number already exist")
}
//--------------//


// handle errors and send message as a object///////////////////
errorMessage = (err) => {
    let errors = { name: "", email: "", mobile: "", password: "", status: "" }

    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
    }

    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
    }

    if (err.message == "This email id already exist") {
        errors.email = "This email id already exist"
    }

    if (err.message == "This mobile number already exist") {
        errors.mobile = "This mobile number already exist"
    }

    if (err.message == "your account have been temporarily blocked") {
        errors.status = "your account have been temporarily blocked"
    }
    return errors;
}
//--------------//


/// send otp ///////////////////
const sendOtp = (mobile) => {
    return new Promise((resolve, reject) => {
        client.verify.v2.services('VA76dd576e7093ab31b5afa7a225bb76ef')
            .verifications
            .create({ to: "+91" + mobile, channel: 'sms' })
            .then(resolve(otp = true))
            .catch((err) => (console.log(err)))
    })
}
//--------------//

const verifyOtp = (mobile, code) => {
    return new Promise((resolve, reject) => {
        if (!code == "") {
            client.verify.v2.services('VA76dd576e7093ab31b5afa7a225bb76ef')
                .verificationChecks
                .create({ to: '+91' + mobile, code: '' + code })
                .then((data) => resolve(data))
        }
        else {
            reject()
        }
    })
}



// storing temp user data ////////////////
const tempuser = { name: "", email: "", mobile: "", password: "" }
const tempUserdata = (data) => {
    if (data) {
        tempuser.name = data.name
        tempuser.email = data.email
        tempuser.mobile = data.mobile
        tempuser.password = data.password
    }
    else {
        tempuser.name = null
        tempuser.email = null
        tempuser.mobile = null
        tempuser.password = null
    }
}
const getUserdata = () => {
    return tempuser
}
//--------------//

// jwt token creation //
const createToken = (id) => {
    const maxAge = 3 * 24 * 60 * 60;
    return jwt.sign({ id }, secret_jwt, {
        expiresIn: maxAge
    });
};





module.exports = { mobileExist, emailExist, errorMessage, sendOtp, tempUserdata, getUserdata, verifyOtp, createToken }