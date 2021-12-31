// 회원가입 및 로그인 처리
const express = require('express');
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

// user 목록
router.get('/', (req, res) => {
    const sql = "select id, name from user order by name asc";
    connection.query(sql, (err, result) => {
        if (err) throw err; 

        console.log('user 목록 가져오기 성공'); 
        // console.log(result);
        res.render('user/index', { result, isLogin: req.login }); 
    }); 
}); 

// new user form 
router.get('/new', (req, res) => {
    console.log('회원가입 창을 불러옵니다...'); 
    res.render('user/new', { isLogin: req.login }); 
});

// new user : 회원가입
router.post('/', (req, res, next) => {
    const id = req.body.id;
    const password1 = req.body.password1;
    const password2 = req.body.password2; 
    const username = req.body.username;
    const email = req.body.email; 
    const sql = "insert into user(id, password, name, email) values(?, ?, ?, ?)"; 

    if (password1 === password2) {// 한 번더 체크 
        bcrypt.hash(password1, saltRounds, (err, hashed) => {
            connection.query(sql, [id, hashed, username, email], (err, result) => {
                if (err) {
                    console.log('모종의 이유로 회원가입 실패...');
                    next(err); 
                } else {
                    console.log('회원가입 성공!'); 
                    res.redirect('/board'); 
                }
            });
        });
    } else {
        console.log('비밀번호가 동일하지 않음'); 
        res.redirect('/user/new'); 
    }
});

// show user
router.get('/:id', (req, res) => {
    const id = req.params.id; 
    const sql = `select * from user where id=?`; 

    connection.query(sql, id, (err, result) => {
        if (err) throw err; 
        console.log('user 상세보기'); 
        res.render('user/show', { result: result[0], isLogin: req.login }); 
    });
});

// update user form 
router.get('/:id/edit', (req, res) => {
    const id = req.params.id; 
    const sql = "select * from user where id=?";

    connection.query(sql, id, (err, result) => {
        if (err) throw err; 
        console.log('user 편집하기 창'); 
        res.render('user/edit', { result: result[0], isLogin: req.login }); 
    });
}); 

// update user 
router.post('/:id', (req, res) => {
    const id = req.params.id;
    const password = req.body.password; 
    const username = req.body.username;
    const email = req.body.email;
    const sql = "update user set password=?, name=?, email=? where id=?";

    connection.query(sql, [password, username, email, id], (err, result) => {
        if (err) throw err; 
        console.log('user 편집 완료'); 
        res.redirect('/user/' + id); 
    });
});

// delete user 
router.post('/:id/delete', (req, res) => {
    const id = req.body.id; 
    const sql = "delete from user where id=?";

    connection.query(sql, id, (err, result) => {
        if (err) throw err;
        console.log('user 삭제 완료');
        res.redirect('/user'); 
    })
}); 

module.exports = router; 