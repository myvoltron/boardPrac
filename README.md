# boardPrac

node.js를 활용한 CRUD 게시판 예제입니다. 

사용한 패키지는 다음과 같습니다. 

- express
- path
- express-ejs-layouts

REST api 설계는 다음과 같습니다. 

- GET /board           ; 글 목록보기
- GET /board/new       ; 글 생성창보기
- POST /board          ; 글 생성하기 
- GET /board/:id       ; 글 상세보기 
- GET /board/:id/edit  ; 글 수정창보기
- POST /board/:id      ; 글 수정하기 
- POST /delete         ; 글 삭제하기

따라서 다음과 같은 router를 만들 수 있었습니다. 

- /board에 대응하는 router
- /delete에 대응하는 router

템플릿 엔진으로 ejs를 사용했고 layout을 위해 express-ejs-layouts를 설치했습니다. 

미들웨어 흐름은 다음과 같습니다. 
<pre><code>
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({extended: false})); // querystring

// 각 url에 대한 라우터들...  
app.get('/', (req, res) => {
    res.redirect('/board');
});
app.use('/board', boardRouter);
app.use('/delete', deleteRouter);

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
</code></pre>

1. 먼저 css 파일을 적용하기 위해 정적파일을 제공하기 위한 미들웨어를 적용했습니다.
2. ejs layout을 사용하기 위한 미들웨어
3. 요청이 왔을 때 같이 온 데이터를(있다면) 해석해서 req.body에 추가시켜주는 미들웨어들 
4. 각 url에 대한 미들웨어들 
5. 유효하지 않은 url을 잡아내는 미들웨어 
6. error 처리를 해주어서 서버가 멈추지 않게 해주는 미들웨어 


이제 회원가입 시스템은 만들 수 있었다. 
그리고 비밀번호 또한 bcrypt 모듈을 사용해서 암호화를 해서 DB에 넣었다. 

하지만, 이를 이용한 로그인/로그아웃은 구현이 어려운것같다. 우선 쿠키와 세션에 대해서 공부를 하고 거기에 passport를 적용시키는 방향으로 진행하는게 좋을거같다. 

쿠키와 express-session 참고 : https://victorydntmd.tistory.com/35  
                           : https://m.blog.naver.com/pjok1122/221555161680

passport 참고 : https://www.passportjs.org/docs/authenticate/ 

위의 passport로 로그인 인증을 할 수 있었고 session을 통해 로그인 상태를 계속 유지할 수 있었다. 
그 로그인 상태를 이용해 접근제한을 할 수도 있고 이용자에 따라 동적으로 다른 view를 보여줄 수 있다.
이를 모든 res.render() 함수에서 로그인 상태 정보를 전달하는 식으로 구현했는데, 찾아보니 한번에 처리할 수 있는
방법이 있더라 

res.locals에 담겨진 변수는 ejs에서 바로 사용이 가능하다고 한다. 여기에 로그인 상태 정보를 넣어서
ejs에서 따로 처리를 하면 될거같다. 

페이지네이션
- mysql의 OFFSET기반 LIMIT으로 구현가능
- 무한스크롤은? 

검색기능 
- mysql의 LIKE로 검색할 수 있다고 한다.

CSS flex - https://studiomeal.com/archives/197
CSS table - https://www.codingfactory.net/10510#i-5