const express = require('express');
const path = require('path');
const morgan = require('morgan'); 
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser'); // 쿠키
const session = require('express-session'); // 세션 
// const passport = require('./config/passport'); // 패스포트 

const app = express();

app.set('port', 8081); 

// view 설정 
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

const boardRouter = require('./routes/board');
const userRouter = require('./routes/user');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');

// 각 url에 대한 라우터들...  
app.get('/', (req, res) => {
    res.redirect('/board');
});
app.use('/board', boardRouter);
app.use('/user', userRouter); 
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

// 유효하지 않은 url 
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