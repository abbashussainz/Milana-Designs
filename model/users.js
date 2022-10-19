const mongoose = require('mongoose');
const bcrypt = require("bcrypt")
const { isEmail } = require("validator")

userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [isEmail]

    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    status: {
        type: Boolean,
    }
})

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });

    if (user) {
        if (user.status) {
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                return user;
            }
            throw Error('incorrect password');
        }
        throw Error('your account have been temporarily blocked');
    }
    throw Error('incorrect email');
};

const User = mongoose.model('user', userSchema);

module.exports = User;