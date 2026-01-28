# 커피 주문 앱 (Coffee Order App)

커피 메뉴 주문 및 관리를 위한 풀스택 웹 애플리케이션입니다.

## 📋 프로젝트 개요

이 프로젝트는 사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리하고 재고를 관리할 수 있는 웹 애플리케이션입니다.

### 주요 기능

- **주문하기**: 메뉴 선택, 옵션 추가, 장바구니 관리
- **관리자 화면**: 주문 상태 관리, 재고 관리, 통계 확인
- **실시간 동기화**: 여러 단말기에서 실시간 재고 및 주문 상태 동기화

## 🛠 기술 스택

### 프론트엔드
- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구 및 개발 서버
- **JavaScript (ES Modules)**: 프로그래밍 언어

### 백엔드
- **Node.js**: 런타임 환경
- **Express.js**: 웹 프레임워크
- **PostgreSQL**: 데이터베이스

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd order-app
```

### 2. 백엔드 설정

```bash
cd server
npm install

# .env 파일 생성 및 설정
cp .env.example .env
# .env 파일에 데이터베이스 정보 입력

# 데이터베이스 생성 및 초기화
npm run create-db
npm run init-db

# 개발 서버 실행
npm run dev
```

백엔드 서버는 `http://localhost:3001`에서 실행됩니다.

### 3. 프론트엔드 설정

```bash
cd ui
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 개발 서버는 `http://localhost:3000`에서 실행됩니다.

## 📁 프로젝트 구조

```
order-app/
├── docs/                  # 프로젝트 문서
│   └── PRD.md            # 제품 요구사항 문서
├── server/               # 백엔드 서버
│   ├── src/
│   │   ├── index.js      # 서버 진입점
│   │   ├── config/       # 설정 파일
│   │   ├── routes/       # API 라우트
│   │   └── scripts/      # 유틸리티 스크립트
│   ├── database/         # 데이터베이스 스키마 및 시드
│   └── .env              # 환경 변수 설정
├── ui/                   # 프론트엔드
│   ├── src/
│   │   ├── App.jsx       # 메인 앱 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── components/   # 재사용 컴포넌트
│   │   ├── utils/        # 유틸리티 함수
│   │   └── api.js        # API 클라이언트
│   └── public/           # 정적 파일
└── README.md            # 프로젝트 메인 문서
```

## 📚 주요 문서

- [PRD 문서](./docs/PRD.md): 제품 요구사항 상세 문서
- [서버 README](./server/README.md): 백엔드 서버 상세 문서
- [프론트엔드 README](./ui/README.md): 프론트엔드 상세 문서
- [데이터베이스 설정](./server/DATABASE_SETUP.md): 데이터베이스 설정 가이드

## 🔧 개발 가이드

### 환경 변수 설정

#### 서버 (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

### API 엔드포인트

#### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/:menuId` - 메뉴 상세 조회
- `PATCH /api/menus/:menuId/stock` - 재고 수량 변경
- `POST /api/menus/reset-stock` - 모든 재고 초기화

#### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:orderId` - 주문 상세 조회
- `PATCH /api/orders/:orderId` - 주문 상태 변경

#### 인증 관련
- `POST /api/auth/admin` - 관리자 비밀번호 인증

#### 설정 관련
- `PATCH /api/settings/admin-password` - 관리자 비밀번호 변경

## 🧪 테스트

### 데이터베이스 연결 테스트

```bash
cd server
npm run test-db
```

## 📦 빌드

### 프론트엔드 빌드

```bash
cd ui
npm run build
```

빌드된 파일은 `ui/dist` 폴더에 생성됩니다.

### 프로덕션 실행

```bash
# 서버
cd server
npm start

# 프론트엔드 (빌드 후)
cd ui
npm run preview
```

## 🔒 보안

- 환경 변수는 `.env` 파일에 저장되며 `.gitignore`에 포함되어 있습니다.
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요.

## 📝 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

## 🤝 기여

이 프로젝트는 학습 목적의 프로젝트입니다.
