const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Strategy는 꼭 붙여두자
const bcrypt = require('bcrypt'); // 암호화
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: "111111",
    database: "board",
});

// passport 전략 
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password', 
},
function (username, password, done) {
    const sql = "select * from user where id=?"; 
    connection.query(sql, username, (err, users) => {
        if (err) { done(err); }
        if (!users) {
            return done(null, false, { message: 'Incorrect id or password.' }); 
        }
        
        const user = users[0]; 
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) { return done(err); }
            if (result === false) {
                return done(null, false, { message: 'Incorrect id or password.' }); 
            }

            return done(null, user); 
        });
    });
})); 

passport.serializeUser((user, done) => {
    done(null, user.id); 
});

passport.deserializeUser((id, done) => {
    const sql = "select * from user where id=?";
    connection.query(sql, id, (err, users) => {
        const user = users[0];
        done(err, user); 
    });
});

module.exports = passport; 