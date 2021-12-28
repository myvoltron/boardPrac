const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: "111111",
    database: "board",
});

connection.connect();

// 게시판 목록보기 
router.get('/', (req, res, next) => {
    connection.query("SELECT id, title, created_at FROM board", (err, result, fields) => {
        if (err) throw err; 
        console.log(result);

        res.render('board/index', { result }); 
    });
});

// 글 쓰기 창
router.get('/new', (req, res) => {
    res.render('board/new');
});

// 글 쓰기 
router.post('/', (req, res) => {
    console.log(req.body);
    const title = req.body.title;
    const content = req.body.content;
    const sql = "insert into board(title, content) values(?, ?)";

    connection.query(sql, [title, content], (err, result) => {
        if (err) throw err;
        res.redirect('/board'); 
    });
}); 

// 게시판 글 상세 보기 
router.get('/:id', (req, res) => {
    const id = req.params.id; // 이거 body로 쓰면 안되는거구나...
    console.log(id); 
    connection.query(`SELECT id, title, content FROM board WHERE id = ${id}`, (err, result, fields) => {
        if (err) throw err;
        // console.log(result);

        res.render('board/show', { result: result[0] }); 
    });
}); 

// 수정 창 
router.get('/:id/edit', (req, res) => {
    const id = req.params.id; 
    console.log(id);
    const sql = "select id, title, content from board where id=?";
    connection.query(sql, [id], (err, result) => {
        if (err) throw err; 
        // console.log(result); 

        res.render('board/edit', { result: result[0] });
    });
});

// 수정하기 
router.post('/:id', (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const content = req.body.content;
    const sql = `update board set title=?, content=? where id=${id}`;
    connection.query(sql, [title, content], (err, result) => {
        if (err) throw err; 
        res.redirect("/board/" + id); 
    }); 
}); 

// 삭제하기 
router.post('/:id/delete', (req, res) => {
    const id = req.body.id;
    const sql = `delete from board where id=${id}`; 
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(`${id} 삭제됨`);
        res.redirect('/board'); 
    }); 
}); 

module.exports = router;