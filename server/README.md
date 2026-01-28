# Coffee Order App - Backend Server

커피 주문 앱의 백엔드 서버입니다.

## 기술 스택

- **Runtime**: Node.js (v18 이상 권장)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Language**: JavaScript (ES Modules)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

### 3. 데이터베이스 설정

#### 데이터베이스 생성
```bash
npm run create-db
```

#### 데이터베이스 초기화 (스키마 생성 및 시드 데이터 삽입)
```bash
npm run init-db
```

#### 데이터베이스 연결 테스트
```bash
npm run test-db
```

자세한 내용은 [DATABASE_SETUP.md](./DATABASE_SETUP.md)를 참고하세요.

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
│   ├── index.js              # 서버 진입점 (Express 앱 설정)
│   ├── config/
│   │   └── database.js       # PostgreSQL 연결 설정
│   ├── routes/               # API 라우트
│   │   ├── menus.js          # 메뉴 관련 API
│   │   ├── orders.js         # 주문 관련 API
│   │   ├── auth.js           # 인증 관련 API
│   │   └── settings.js       # 설정 관련 API
│   └── scripts/              # 유틸리티 스크립트
│       ├── create-database.js    # 데이터베이스 생성
│       ├── init-database.js      # 스키마 및 시드 데이터 초기화
│       ├── test-db-connection.js # 연결 테스트
│       └── update-menu-images.js # 메뉴 이미지 업데이트
├── database/
│   ├── schema.sql            # 데이터베이스 스키마
│   ├── seed.sql              # 초기 데이터 (시드)
│   └── README.md             # 데이터베이스 문서
├── .env                      # 환경 변수 설정 파일 (gitignore)
├── .gitignore               # Git 무시 파일 목록
├── package.json             # 프로젝트 의존성
└── README.md                # 서버 문서
```

## API 엔드포인트

자세한 API 문서는 `docs/PRD.md`를 참고하세요.

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회 (옵션 포함)
- `GET /api/menus/:menuId` - 메뉴 상세 조회
- `PATCH /api/menus/:menuId/stock` - 재고 수량 변경
  - Body: `{ change: number }` 또는 `{ stock: number }`
- `POST /api/menus/reset-stock` - 모든 재고를 0으로 초기화

### 주문 관련
- `POST /api/orders` - 주문 생성
  - Body: `{ items: Array, total_amount: number }`
  - 자동으로 재고 차감 처리
- `GET /api/orders` - 주문 목록 조회
  - Query: `?status=pending&tab=in-progress`
- `GET /api/orders/:orderId` - 주문 상세 조회
- `PATCH /api/orders/:orderId` - 주문 상태 변경
  - Body: `{ status: 'pending' | 'in_progress' | 'completed' }`
  - 상태 전환 검증 포함

### 인증 관련
- `POST /api/auth/admin` - 관리자 비밀번호 인증
  - Body: `{ password: string }`

### 설정 관련
- `PATCH /api/settings/admin-password` - 관리자 비밀번호 변경
  - Body: `{ old_password: string, new_password: string }`

## 데이터베이스 스키마

### 주요 테이블
- `menus`: 메뉴 정보 (이름, 가격, 재고, 이미지 URL)
- `options`: 메뉴 옵션 (샷 추가, 시럽 추가 등)
- `orders`: 주문 정보 (주문 시간, 상태, 총 금액)
- `order_items`: 주문 상세 항목
- `order_item_options`: 주문 항목의 선택된 옵션
- `settings`: 앱 설정 (관리자 비밀번호 등)

## 에러 처리

모든 API는 다음 형식으로 응답합니다:

**성공 응답:**
```json
{
  "success": true,
  "data": { ... }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 보안

- 환경 변수는 `.env` 파일에 저장되며 Git에 커밋되지 않습니다.
- SQL 인젝션 방지를 위해 파라미터화된 쿼리 사용
- 입력값 검증 및 타입 체크

## 개발 가이드

- 코드 스타일: ESLint 사용
- 데이터베이스 트랜잭션: 주문 생성 시 트랜잭션 사용
- 에러 로깅: 콘솔에 에러 로그 출력

## 스크립트

- `npm run dev`: 개발 서버 실행 (nodemon 사용)
- `npm start`: 프로덕션 서버 실행
- `npm run create-db`: 데이터베이스 생성
- `npm run init-db`: 스키마 및 시드 데이터 초기화
- `npm run test-db`: 데이터베이스 연결 테스트
