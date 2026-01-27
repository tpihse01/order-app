# 커피 주문 앱 - 프론트엔드

이 프로젝트는 Vite와 React를 사용하여 구축된 커피 주문 앱의 프론트엔드입니다.

## 시작하기

### 필수 요구사항
- Node.js (v18 이상 권장)
- npm 또는 yarn

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
├── public/          # 정적 파일
├── src/
│   ├── App.jsx      # 메인 앱 컴포넌트
│   ├── App.css      # 앱 스타일
│   ├── main.jsx     # 진입점
│   └── index.css    # 전역 스타일
├── index.html       # HTML 템플릿
├── vite.config.js   # Vite 설정
└── package.json     # 프로젝트 의존성
```

## 기술 스택

- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구 및 개발 서버
- **JavaScript**: 프로그래밍 언어
