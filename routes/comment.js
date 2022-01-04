const express = require('express');
const mysql = require('mysql'); 
const util = require('../util'); 

const router = express.Router(); 

const connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: "111111",
    database: "board",
    dateStrings: 'date', // date 정보를 보기 좋게 받아올 수 있다. 
}); 

router.post('/', util.isLoggedin, checkPostId, (req, res) => { // 댓글 추가WSUI 
    const post = res.locals.post; 

    req.body.author = req.user.id;
    req.body.postId = post.id; 

    const sql = 'INSERT INTO reply(postID, userID, text) VALUES(?, ?, ?)';
    connection.query(sql, [req.body.postId, req.body.author, req.body.comment], (err, result) => {
        if (err) throw err; 

        return res.redirect('/board/' + post.id + res.locals.getPostQueryString());
    });
}); 

module.exports = router; 

function checkPostId(req, res, next) {
    connection.query(`select * from board where id='${req.query.postId}'`, (err, post) => {
        if (err) throw err; 

        res.locals.post = post[0]; 
        next(); 
    });
}