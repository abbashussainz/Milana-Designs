require('dotenv').config()
const express = require("express");
const { connect } = require('http2');
const mongoose = require("mongoose");
const path = require('path');
const cookieParser = require('cookie-parser');
const { checkUser, adminAuth } = require("./middleware/middleware");
const expressLayouts = require("express-ejs-layouts");
const fileupload = require("express-fileupload")


const adminrouter = require("./routes/admin");
const userrouter = require("./routes/users");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

app.use(fileupload({
    useTempFiles: true
}));;

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts)


// connecting mongodb
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })
    .then((result) => { app.listen("3000") })
    .catch((err) => console.log(err))


app.use("/", checkUser);
// setting up routes 



app.use('/', userrouter)
app.use("/admin", adminrouter)
app.use((req, res, next) => {
    res.render("users/404")
})

