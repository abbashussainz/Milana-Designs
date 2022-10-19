const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    }
});

adminSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


adminSchema.statics.login = async function (email, password) {
    const admin = await this.findOne({ email });
    if (admin) {
        const auth = await bcrypt.compare(password, admin.password);
        if (auth) {
            return admin;
        }
        throw Error('auth failed');
    }
    throw Error("auth failed")
};

const Admin = mongoose.model('Admin', adminSchema)
module.exports = Admin