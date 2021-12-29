// 회원가입 및 로그인 처리
const express = require('express');
const session = require('express-session'); // 세션 
const router = express.Router();

// 로그아웃
router.get('/', (req, res) => {
    console.log('로그아웃 합니다'); 
    req.session.destroy(); 
    res.redirect('/login'); 
});

module.exports = router; 