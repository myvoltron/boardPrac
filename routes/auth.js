// 회원가입 및 로그인 처리
const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// 로그인 form 
router.get('/login', (req, res) => {
    const user = req.user;
    console.log(user);
    res.render('login', { user });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login',
}), (req, res) => {
    res.redirect('/board');
});

// 로그아웃
router.get('/logout', (req, res) => {
    console.log('로그아웃 합니다');
    req.logout(); // passport log out
    res.redirect('/auth/login');
});

module.exports = router; 