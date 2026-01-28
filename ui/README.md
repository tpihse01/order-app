# 커피 주문 앱 - 프론트엔드

이 프로젝트는 Vite와 React를 사용하여 구축된 커피 주문 앱의 프론트엔드입니다.

## 시작하기

### 필수 요구사항
- Node.js (v18 이상 권장)
- npm 또는 yarn
- 백엔드 서버가 실행 중이어야 함 (`http://localhost:3001`)

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:3000`으로 접속할 수 있습니다.

### 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 미리보기

빌드된 앱을 미리보려면:

```bash
npm run preview
```

## 프로젝트 구조

```
ui/
├── public/              # 정적 파일 (이미지 등)
│   ├── *.png, *.jpg    # 메뉴 이미지
│   └── vite.svg
├── src/
│   ├── App.jsx          # 메인 앱 컴포넌트 (라우팅, 상태 관리)
│   ├── App.css          # 앱 스타일
│   ├── main.jsx         # React 진입점
│   ├── index.css        # 전역 스타일
│   ├── api.js           # API 클라이언트 (모든 API 호출)
│   ├── pages/           # 페이지 컴포넌트
│   │   ├── WelcomePage.jsx      # 환영 페이지
│   │   ├── OrderPage.jsx        # 주문하기 페이지
│   │   ├── AdminPage.jsx        # 관리자 페이지
│   │   └── ChangePasswordPage.jsx # 비밀번호 변경 페이지
│   ├── components/      # 재사용 컴포넌트
│   │   ├── NavigationBar.jsx    # 상단 네비게이션 바
│   │   ├── PasswordModal.jsx    # 비밀번호 입력 모달
│   │   ├── Notification.jsx      # 알림 컴포넌트
│   │   └── LoadingSpinner.jsx    # 로딩 스피너
│   └── utils/           # 유틸리티 함수
│       ├── logger.js            # 로깅 유틸리티
│       ├── formatters.js        # 포맷팅 함수 (가격, 날짜)
│       ├── errorHandler.js      # 에러 처리 유틸리티
│       ├── validators.js        # 타입 검증 유틸리티
│       ├── stockHelpers.js      # 재고 관련 헬퍼 함수
│       └── arrayHelpers.js      # 배열 관련 헬퍼 함수
├── index.html           # HTML 템플릿
├── vite.config.mjs     # Vite 설정
└── package.json        # 프로젝트 의존성
```

## 주요 기능

### 주문하기 페이지
- 메뉴 목록 표시
- 옵션 선택 (샷 추가, 시럽 추가 등)
- 장바구니 관리
- 실시간 재고 확인 (2초 간격 폴링)
- 주문 제출

### 관리자 페이지
- 주문 현황 대시보드 (총 주문, 주문 접수, 제조 중, 제조 완료)
- 재고 관리 (수량 조정, 초기화)
- 주문 상태 변경 (주문 접수 → 제조 중 → 제조 완료)
- 비밀번호 변경

## 기술 스택

- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구 및 개발 서버
- **JavaScript (ES Modules)**: 프로그래밍 언어

## 주요 컴포넌트 설명

### App.jsx
- 전역 상태 관리 (메뉴, 주문, 재고)
- 페이지 라우팅
- API 호출 및 데이터 동기화
- 폴링 메커니즘 (주문 페이지에서 재고 실시간 업데이트)

### OrderPage.jsx
- 메뉴 목록 표시 및 필터링
- 장바구니 관리
- 주문 제출 처리

### AdminPage.jsx
- 주문 통계 계산 및 표시
- 재고 관리 UI
- 주문 목록 표시 및 상태 변경

## API 통신

모든 API 호출은 `src/api.js`에서 중앙 관리됩니다.

### API 기본 URL
- 개발 환경: `http://localhost:3001/api`

### 주요 API 함수
- `menuAPI.getMenus()`: 메뉴 목록 조회
- `menuAPI.updateStock()`: 재고 수량 변경
- `orderAPI.createOrder()`: 주문 생성
- `orderAPI.getOrders()`: 주문 목록 조회
- `authAPI.adminLogin()`: 관리자 로그인

## 성능 최적화

- **메모이제이션**: `useMemo`, `useCallback`을 사용하여 불필요한 재계산 방지
- **폴링 최적화**: 주문 페이지에서만 2초 간격으로 재고 업데이트
- **코드 분할**: 유틸리티 함수 분리로 재사용성 향상

## 에러 처리

- 모든 API 오류는 `errorHandler.js`를 통해 사용자 친화적인 메시지로 변환
- 네트워크 오류, 타임아웃, HTTP 상태 코드별 처리
- 커스텀 알림 컴포넌트로 일관된 에러 표시

## 개발 팁

- 개발 환경에서만 콘솔 로그가 출력됩니다 (`logger.js`)
- 모든 포맷팅 함수는 `formatters.js`에서 관리됩니다
- 타입 검증은 `validators.js`에서 중앙 관리됩니다
