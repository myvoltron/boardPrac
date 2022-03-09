# boardPrac

node.js를 활용한 CRUD 게시판 예제입니다. 

사용한 패키지는 다음과 같습니다. 

- express
- path
- express-ejs-layouts(템플릿 엔진으로 ejs를 사용했고 layout을 위해 express-ejs-layouts를 설치했음)
- express-session
- passport
- passport-local
- mysql
- bcrypt
- morgan

url 설계는 다음과 같습니다. 

- GET /about           ; about 화면
- GET /board           ; 글 목록보기
- GET /board/new       ; 글 생성창보기
- POST /board          ; 글 생성하기 
- GET /board/:id       ; 글 상세보기 
- GET /board/:id/edit  ; 글 수정창보기
- POST /board/:id      ; 글 수정하기 
- POST /board/:id/delete         ; 글 삭제하기
- POST /comment             ; 댓글 추가
- POST /comment/:id         ; 댓글 추가
- POST /comment/:id/delete  ; 댓글 삭제
- GET /user                 ; user 목록보기
- GET /user/new             ; 회원가입 화면
- GET /user/:id             ; user 상세보기
- POST /user/:id            ; user 수정하기
- GET /user/:id/edit            ; user 수정 화면
- POST /user/:id/delete          ; user 탈퇴
- GET /auth/login           ; 로그인 화면
- POST /auth/login          ; 로그인하기
- GET /auth/logout          ; 로그아웃


따라서 다음과 같은 router를 만들 수 있었습니다. 

- /board에 대응하는 boardRouter
- /user에 대응하는 userRouter
- /auth에 대응하는 authRouter
- /comment에 대응하는 commentRouter

## 주요 기능들 
1. 글 목록, 쓰기, 수정, 삭제 등 기본적인 CRUD(mysql 패키지를 통해서 mysql과 연결될 수 있었다.)
2. session, passport 같은 패키지를 통해서 인증과 상태유지를 할 수 있었다. (로그인, 로그아웃 등)
3. 페이징과 검색 기능
4. 파일 업로드
5. User에 대한 CRUD
6. 댓글



## 기타 느낀 점 및 배운 점
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

1월 3일 공부요소
- mysql과 연결할 때 date 값을 보기 좋게 받아올려면 dateString: 'date'를 추가하면 된다. 
- https://www.codingfactory.net/10510#i-5
- CSS flex - https://studiomeal.com/archives/197
- CSS table - https://www.codingfactory.net/10510#i-5

1월 4일 공부요소 
- mysql LIKE를 통해서 검색을 할 수 있었다. ``` const sql = `SELECT * FROM board WHERE ${searchType} LIKE '%${keyWord}%'`; ```
- 각 게시물 상세보기 화면, 쓰기 화면, 수정 화면에서 뒤로가기버튼 또는 목록가기 버튼을 눌렀을 때 pagination이 유지되도록 수정
- 조금은 비효율적으로 검색을 구현했다고 생각된다. 검색 화면을 따로 만들었는데 그냥 board/index 파일로도 구현할 수 있을 것 같다.
