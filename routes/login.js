// 회원가입 및 로그인 처리
const express = require('express');
const session = require('express-session'); // 세션 
const bcrypt = require('bcrypt'); 
const saltRounds = 10; 
const router = express.Router();

const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: "111111",
    database: "board",
});

// 로그인 form 
router.get('/', (req, res) => {
    const sessionValue = req.session;  
    res.render('login', {
        session: sessionValue
    }); 
}); 

// try 로그ㅇ인 
router.post('/', (req, res) => {
    const id = req.body.id;
    const password = req.body.password; 
    const sql = "select name, password from user where id=?";

    // DB에 저장되어 있는 hash된 비밀번호를 가지고 온다. 
    connection.query(sql, id, (err, result) => {
        if (err) throw err; 

        const name = result[0].name; 
        const hash = result[0].password; 
        // console.log(hash);
        bcrypt.compare(password, hash, (err, result) => { // 비밀번호 비교 
            if (err) throw err; 

            if (result) {
                console.log('로그인 성공'); 
                req.session.name = name; 
                res.redirect('/user'); 
            } else {
                console.log('아이디나 비밀번호를 다시 확인하시오'); 
                res.redirect('/login'); 
            }
        });

    }); 
}); 

module.exports = router; 