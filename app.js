const express = require('express');
const path = require('path');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session'); // 세션 쿠키파셔 
const passport = require('./config/passport'); // 패스포트 
const boardRouter = require('./routes/board');
const userRouter = require('./routes/user');

const app = express();

app.set('port', 8081); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({extended: false})); // querystring
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

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    // 
}); 

// 각 url에 대한 라우터들...  
app.get('/', (req, res) => {
    res.redirect('/board');
});
app.use('/board', boardRouter);
app.use('/user', userRouter); 


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