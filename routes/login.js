// 회원가입 및 로그인 처리
const express = require('express');
const passport = require('passport'); 
const router = express.Router();

// 로그인 form 
router.get('/', (req, res) => {
    const user = req.user; 
    console.log(user); 
    res.render('login', { user }); 
}); 

router.post('/', passport.authenticate('local', {
    failureRedirect: '/login', 
}), (req, res) => { 
    res.redirect('/board'); 
});

module.exports = router; 