// 회원가입 및 로그인 처리
const express = require('express');
const router = express.Router();

// 로그아웃
router.get('/', (req, res) => {
    console.log('로그아웃 합니다'); 
    req.logout(); // passport log out
    res.redirect('/login'); 
});

module.exports = router; 