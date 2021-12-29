// config/passport.js 
const passport = require('passport'); 
const local = require('passport-local').Strategy; 
const bcrypt = require('bcrypt'); 
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: "111111",
    database: "board",
});

connection.connect();

passport.serializeUser((user, done) => {
    done(null, user.id);
});



module.exports = passport; 