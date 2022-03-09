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

// 댓글 추가
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

// 댓글 수정
router.post('/:id', util.isLoggedin, checkPermission, checkPostId, (req, res) => {
    const post = res.locals.post; 
    const text = req.body.text; 

    connection.query(`UPDATE reply SET text=? WHERE id=${req.params.id}`, text, (err, result) => {
        if (err) throw err; 

        return res.redirect('/board/' + post.id + res.locals.getPostQueryString()); 
    });
});

// 댓글 삭제 
router.post('/:id/delete', util.isLoggedin, checkPermission, checkPostId, (req, res) => {
    const post = res.locals.post; 

    connection.query(`UPDATE reply SET isDeleted=1 WHERE id=${req.params.id}`, (err, result) => {
        if (err) throw err; 

        return res.redirect('/board/' + post.id + res.locals.getPostQueryString());
    });
})

module.exports = router; 

function checkPostId(req, res, next) {
    connection.query(`select * from board where id='${req.query.postId}'`, (err, posts) => { // url query에 있는 postId 값으로 본문을 갖고 옴
        if (err) throw err; 

        res.locals.post = posts[0]; 
        next(); 
    });
}

function checkPermission(req, res, next) {
    connection.query(`select * from reply where id=${req.params.id}`, (err, comments) => {
        if (err) throw err; 
        
        const comment = comments[0]; 

        // 댓글의 userID와 로그인하고 있는 유저의 id 값이 같아야 함 
        if (comment.userID === req.user.id) {
            next(); // 같으면 다음 미들웨어로 넘어감 
        } else {
            return util.noPermission(req, res); 
        }
    });
}