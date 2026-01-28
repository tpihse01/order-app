# Coffee Order App - Backend Server

커피 주문 앱의 백엔드 서버입니다.

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Language**: JavaScript (ES Modules)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일에 필요한 환경 변수를 설정하세요. 데이터베이스 연결 정보를 입력해야 합니다.

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 `.env` 파일에 연결 정보를 입력하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

### 5. 프로덕션 서버 실행

```bash
npm start
```

## 프로젝트 구조

```
server/
├── src/
│   ├── index.js          # 서버 진입점
│   ├── config/           # 설정 파일
│   ├── routes/           # API 라우트
│   ├── controllers/      # 컨트롤러
│   ├── models/           # 데이터 모델
│   ├── middleware/        # 미들웨어
│   └── utils/            # 유틸리티 함수
├── .env                  # 환경 변수 설정 파일
├── .gitignore
├── package.json
└── README.md
```

## API 엔드포인트

자세한 API 문서는 `docs/PRD.md`를 참고하세요.

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/:menuId` - 메뉴 상세 조회
- `PATCH /api/menus/:menuId/stock` - 재고 수량 변경

### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:orderId` - 주문 상세 조회
- `PATCH /api/orders/:orderId` - 주문 상태 변경

### 인증 관련
- `POST /api/auth/admin` - 관리자 비밀번호 인증

### 설정 관련
- `PATCH /api/settings/admin-password` - 관리자 비밀번호 변경

## 개발 가이드

- 코드 스타일: ESLint 사용
- 포맷팅: Prettier (선택 사항)
- 데이터베이스 마이그레이션: 추후 추가 예정
