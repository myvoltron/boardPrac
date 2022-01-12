const express = require('express');
const router = express.Router();
const path = require('path'); 

const multer = require('multer'); 
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'public/uploads/');
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },  
}); 

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: "111111",
    database: "board",
    dateStrings: 'date', // date 정보를 보기 좋게 받아올 수 있다. 
});

// 글 목록보기 
router.get('/', (req, res) => { // 로그인이 되어있지 않더라도 글 목록은 볼 수 있다. 
    // 페이지네이션 
    // parseInt로 정수로 만들고
    // Math.max로 양수를 보장한다. 
    let page = Math.max(1, parseInt(req.query.page)); 
    let limit = Math.max(1, parseInt(req.query.limit)); 
    page = isNaN(page) ? 1 : page; // 숫자가 아니면 1로 보정 
    limit = isNaN(limit) ? 10 : limit; 
    
    const skip = (page - 1) * limit; 
    connection.query('select count(id) from board', (err, result) => { // 게시글의 수를 가져온다. 
        if (err) throw err; 

        const count = result[0]['count(id)'];
        console.log(count);

        const maxPage = Math.ceil(count / limit);
        // const sql = "SELECT board.id AS id, board.title AS title, board.created_at AS created_at, user.id AS userID FROM board JOIN user ON board.writer_id = user.id";
        const sql = `SELECT * FROM board ORDER BY created_at DESC LIMIT ${skip}, ${limit}`;
        connection.query(sql, (err, post) => {
            if (err) throw err;
            // console.log(post);
            res.render('board/index', { 
                post: post, 
                currentPage: page, 
                maxPage: maxPage,
                limit: limit, 
            });
        }); 
    });
});

router.post('/search', (req, res) => {
    let searchType = req.body.searchType;
    const keyWord = req.body.keyWord;

    if (searchType === '제목') {
        searchType = 'title';
    } else if (searchType === '내용') {
        searchType = 'content';
    } else if (searchType === '작성자') {
        searchType = 'writer_id'; 
    }

    const sql = `SELECT * FROM board WHERE ${searchType} LIKE '%${keyWord}%'`;
    connection.query(sql, (err, post) => {
        if (err) throw err;

        // console.log(post); 
        res.locals.searched = true; 
        res.render('board/searched', { post }); 
    }); 
});

// 글 쓰기 창
router.get('/new', (req, res) => {
    if (req.user) {
        res.render('board/new');
    } else {
        console.log('로그인이 필요한 작업');
        res.redirect('/auth/login');
    }
});

// 글 쓰기 
router.post('/', upload.single('file'), (req, res) => {
    // console.log(req.body, req.user);
    console.log(req.file); 

    if (req.user) { // 로그인 된 상태라면 글을 쓸 수 있다! 
        const writer_id = req.user.googleID ? req.user.name : req.user.id;
        const title = req.body.title;
        const content = req.body.content;
        const fileName = req.file ? req.file.filename : ''; 

        const sql = "insert into board(title, content, writer_id, fileName) values(?, ?, ?, ?)";

        connection.query(sql, [title, content, writer_id, fileName], (err, result) => {
            if (err) throw err;
            res.redirect('/board'+res.locals.getPostQueryString(false, {page:1}));
        });
    } else { // 로그인이 안되어 있으면 로그인 창으로 리다이렉트 
        console.log('로그인이 필요한 작업');
        res.redirect('/auth/login');
    }
});

// 게시판 글 상세 보기 : 이것 또한 로그인이 없어도 접근 가능
router.get('/:id', (req, res) => { 
    const id = req.params.id; // 이거 body로 쓰면 안됨
    console.log('id는 ', id);
    connection.query(`SELECT * FROM board WHERE id = ${id}`, (err, result) => {
        if (err) throw err;

        connection.query(`UPDATE board SET views=views+1 WHERE id=${id}`, (err, result) => { // 글 상세보기 시 조회수 1 증가
            if (err) throw err;
        }); 

        connection.query(`SELECT * FROM reply WHERE postID=${id} ORDER BY created_at`, (err, comments) => {
            if (err) throw err;

            // console.log('댓글들 :' + comments); // 이상하다... 로그인하고 댓글을 써야만 댓글들이 보인다... 해결...
            /*

            로그인하고 댓글을 POST하고나서 리다이렉트될 때 다른 글 주소로 가게 되네... 

            */

            res.render('board/show', { result: result[0], comments });
        }); 
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
                res.redirect('/board'+res.locals.getPostQueryString()); 
            }
        } else { // 로그인하지 않은 경우 
            console.log('로그인이 필요한 작업');
            res.redirect('/auth/login'); 
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
                    res.redirect("/board/" + id + '/edit' + res.locals.getPostQueryString());
                });
            } else {
                req.logout(); 
                res.redirect('/board'+res.locals.getPostQueryString()); 
            }
        } else {
            console.log('로그인이 필요한 작업');
            res.redirect('/auth/login'); 
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
                    res.redirect('/board'+res.locals.getPostQueryString());
                });
            } else {
                res.redirect('/board'+res.locals.getPostQueryString()); 
            }
        } else {
            console.log('로그인이 필요한 작업');
            res.redirect('/auth/login'); 
        }
    });
});

module.exports = router;