const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: "111111",
    database: "board",
});

// 글 목록보기 
router.get('/', (req, res) => { // 로그인이 되어있지 않더라도 글 목록은 볼 수 있다. 
    const sql = "SELECT board.id AS id, board.title AS title, board.created_at AS created_at, user.id AS userID FROM board JOIN user ON board.writer_id = user.id";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.render('board/index', { result });
    });
});

// 글 쓰기 창
router.get('/new', (req, res) => {
    if (req.user) {
        res.render('board/new');
    } else {
        console.log('로그인이 필요한 작업');
        res.redirect('/login');
    }
});

// 글 쓰기 
router.post('/', (req, res) => {
    console.log(req.body, req.user);
    if (req.user) { // 로그인 된 상태라면 글을 쓸 수 있다! 
        const writer_id = req.user.id;
        const title = req.body.title;
        const content = req.body.content;
        const sql = "insert into board(title, content, writer_id) values(?, ?, ?)";

        connection.query(sql, [title, content, writer_id], (err, result) => {
            if (err) throw err;
            res.redirect('/board');
        });
    } else { // 로그인이 안되어 있으면 로그인 창으로 리다이렉트 
        console.log('로그인이 필요한 작업');
        res.redirect('/login');
    }
});

// 게시판 글 상세 보기 : 이것 또한 로그인이 없어도 접근 가능
router.get('/:id', (req, res) => { 
    const id = req.params.id; // 이거 body로 쓰면 안됨
    console.log(id);
    connection.query(`SELECT id, title, content FROM board WHERE id = ${id}`, (err, result, fields) => {
        if (err) throw err;

        res.render('board/show', { result: result[0] });
    });
});

// 수정 창 : 접근하고자 하는 user의 id와 글을 쓴 사람 id가 같아야 접근가능
router.get('/:id/edit', (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const sql = "select id, title, content, writer_id from board where id=?";
    connection.query(sql, [id], (err, results) => {
        if (err) throw err;
        // console.log(result); 

        const result = results[0];

        if (req.user) { // 로그인한 경우 
            if (result.writer_id === req.user.id) { // id까지 같은 경우 
                res.render('board/edit', { result });
            } else {
                req.logout(); 
                res.redirect('/board'); 
            }
        } else { // 로그인하지 않은 경우 
            console.log('로그인이 필요한 작업');
            res.redirect('/login'); 
        }
    });
});

// 수정하기 
router.post('/:id', (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const content = req.body.content;
    const sql = `update board set title=?, content=? where id=${id}`;

    connection.query("select writer_id from board where id=?", [id], (err, result) => {
        if (err) throw err; 

        const writerId = result[0].writer_id;
        if (req.user) {
            if (writerId === req.user.id) {
                connection.query(sql, [title, content], (err, result) => {
                    if (err) throw err;
                    res.redirect("/board/" + id);
                });
            } else {
                req.logout(); 
                res.redirect('/board'); 
            }
        } else {
            console.log('로그인이 필요한 작업');
            res.redirect('/login'); 
        }
    }); 
    
});

// 삭제하기 
router.post('/:id/delete', (req, res) => {
    const id = req.body.id;

    connection.query(`select writer_id from board where id=${id}`, (err, result) => {
        console.log(result);
        const writerId = result[0].writer_id;
        
        if (req.user) {
            if (writerId === req.user.id) {
                const sql = `delete from board where id=${id}`;
                connection.query(sql, (err, result) => {
                    if (err) throw err;
                    console.log(`${id} 삭제됨`);
                    res.redirect('/board');
                });
            } else {
                req.logout(); 
                res.redirect('/board'); 
            }
        } else {
            console.log('로그인이 필요한 작업');
            res.redirect('/login'); 
        }
    });
    
});

module.exports = router;