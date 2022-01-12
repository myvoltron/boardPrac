const express = require('express');
const path = require('path');
const morgan = require('morgan'); 
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser'); // 쿠키
const session = require('express-session'); // 세션 
const passport = require('./passportConfig'); // passport
const passportGoogle = require('./passportGoogle'); 
const util = require('./util'); 

const app = express();

// 설정 
app.set('port', 8081); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// 미들웨어들 
app.use(morgan('dev')); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // querystring
app.use(expressLayouts);

// 세션 관련 미들웨어
app.use(cookieParser('session-secret-key'));
app.use(session({
    secret: 'session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, 
    }, 
})); 

// passport 관련 미들웨어
app.use(passport.initialize());
app.use(passport.session()); 
app.use((req, res, next) => { // res객체에 추가 정보
    /*
    res.locals에 담긴 변수는 ejs에서 사용가능하다는걸 기억해두자
    req.isAuthenticated()는 passport에 의해 추가된 메서드인데 로그인여부를 반환한다. 
    req.user 또한 passport에서 추가한 건데 로그인한 user 객체가 담겨있다. 
    */

    res.locals.isAuthenticated = req.isAuthenticated(); 
    res.locals.currentUser = req.user; 
    next();
}); 

// 라우터 
const boardRouter = require('./routes/board');
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const commentRouter = require('./routes/comment'); 

app.get('/', (req, res) => {
    res.render('home');
});
app.get('/about', (req, res) => {
    res.render('about');
});
app.use('/board', (req, res, next) => {
    res.locals.searched = false; 
    next();
}, util.getPostQueryString, boardRouter);
app.use('/user', userRouter); 
app.use('/auth', authRouter);
app.use('/comment', util.getPostQueryString, commentRouter); 

// 유효하지 않은 url || 404
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

// error 처리 미들웨어 
app.use((err, req, res, next) => {
     res.render('error', {
         message: err.message,
         error: err,
         status: err.status || 500,
     }); 
});

// 요청 대기
app.listen(app.get('port'), () => {
    console.log('포트 ' + app.get('port') + '에서 대기중');
}); 