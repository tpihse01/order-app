# 프론트엔드 배포 가이드 (Render.com Static Site)

커피 주문 앱의 프론트엔드를 Render.com에 Static Site로 배포하는 상세 가이드입니다.

## 사전 준비사항

1. ✅ 백엔드 서버가 배포되어 있어야 합니다
2. ✅ 백엔드 서비스 URL을 알고 있어야 합니다 (예: `https://order-app-server.onrender.com`)
3. ✅ GitHub 저장소에 코드가 푸시되어 있어야 합니다

## 단계별 배포 과정

### 1단계: 코드 확인 및 수정

#### 1.1 API URL 설정 확인

`ui/src/api.js` 파일이 환경 변수를 사용하도록 설정되어 있는지 확인:

```javascript
// API 기본 URL
// 환경 변수에서 가져오거나 기본값 사용 (개발 환경)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
```

✅ 이미 수정되어 있습니다.

#### 1.2 빌드 설정 확인

`ui/package.json`의 빌드 스크립트 확인:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

✅ 정상입니다. `npm run build` 실행 시 `dist` 폴더에 빌드 결과물이 생성됩니다.

#### 1.3 Vite 설정 확인

`ui/vite.config.mjs` 파일 확인 (필요시):

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

✅ 기본 설정으로 충분합니다.

### 2단계: Render 대시보드에서 Static Site 생성

#### 2.1 새 서비스 생성

1. **Render 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인

2. **Static Site 생성**
   - 상단의 "New +" 버튼 클릭
   - 드롭다운 메뉴에서 **"Static Site"** 선택

#### 2.2 GitHub 저장소 연결

1. **저장소 선택**
   - "Connect a repository" 섹션에서 GitHub 계정 연결 (처음이면)
   - 저장소 목록에서 `order-app` 저장소 선택
   - 또는 저장소 URL 직접 입력: `https://github.com/your-username/order-app`

2. **브랜치 선택**
   - Branch: `main` (또는 기본 브랜치)
   - Auto-Deploy: `Yes` (GitHub push 시 자동 배포)

### 3단계: 서비스 설정

#### 3.1 기본 설정

다음 정보를 입력합니다:

- **Name**: `order-app-ui` (원하는 이름, URL에 사용됨)
- **Region**: 백엔드 서버와 동일한 지역 선택 (예: Singapore)
- **Branch**: `main` (또는 기본 브랜치)
- **Root Directory**: `ui` ⚠️ **중요**: 프론트엔드 폴더명

#### 3.2 빌드 설정

- **Build Command**: 
  ```
  npm install && npm run build
  ```
  또는
  ```
  cd ui && npm install && npm run build
  ```
  (Root Directory를 `ui`로 설정했다면 첫 번째 명령어 사용)

- **Publish Directory**: 
  ```
  dist
  ```
  또는
  ```
  ui/dist
  ```
  (Root Directory를 `ui`로 설정했다면 첫 번째 경로 사용)

#### 3.3 환경 변수 설정

"Environment" 섹션에서 환경 변수 추가:

1. **"Add Environment Variable"** 클릭
2. 다음 변수 추가:

   ```
   Key: VITE_API_BASE_URL
   Value: https://order-app-server.onrender.com/api
   ```

   ⚠️ **중요 사항**:
   - Vite 환경 변수는 반드시 `VITE_` 접두사가 필요합니다
   - 백엔드 서비스 URL을 정확히 입력하세요 (끝에 `/api` 포함)
   - `http://`가 아닌 `https://`를 사용하세요

#### 3.4 고급 설정 (선택사항)

"Advanced" 섹션에서:

- **Auto-Deploy**: `Yes` (기본값)
- **Pull Request Previews**: `Yes` (PR 생성 시 미리보기 배포, 선택사항)

### 4단계: 서비스 생성 및 배포

#### 4.1 서비스 생성

1. 모든 설정을 확인한 후
2. 하단의 **"Create Static Site"** 버튼 클릭
3. 배포가 시작됩니다 (약 2-3분 소요)

#### 4.2 배포 진행 상황 확인

배포 중에는 다음을 확인할 수 있습니다:

- **"Logs"** 탭: 빌드 로그 실시간 확인
- **"Events"** 탭: 배포 이벤트 확인
- **"Settings"** 탭: 설정 수정

#### 4.3 배포 완료 확인

배포가 완료되면:

- ✅ "Live" 상태로 변경됨
- ✅ 서비스 URL이 표시됨 (예: `https://order-app-ui.onrender.com`)
- ✅ "Visit Site" 버튼으로 사이트 접속 가능

### 5단계: 배포 확인 및 테스트

#### 5.1 기본 확인

1. **사이트 접속**
   - Static Site URL로 접속
   - 정상적으로 로드되는지 확인

2. **콘솔 확인**
   - 브라우저 개발자 도구 (F12) 열기
   - Console 탭에서 에러 확인
   - Network 탭에서 API 호출 확인

#### 5.2 기능 테스트

1. **주문하기 화면**
   - 메뉴 목록이 표시되는지 확인
   - 장바구니 기능 작동 확인
   - 주문 제출 기능 확인

2. **관리자 화면**
   - 비밀번호 입력 후 접속 확인
   - 주문 현황 확인
   - 재고 관리 기능 확인

#### 5.3 API 연결 확인

브라우저 콘솔에서:

```javascript
// API URL 확인
console.log(import.meta.env.VITE_API_BASE_URL);
```

또는 Network 탭에서:
- API 요청이 올바른 URL로 전송되는지 확인
- CORS 오류가 없는지 확인

### 6단계: 문제 해결

#### 문제 1: 빌드 실패

**증상**: 배포가 실패하고 빌드 에러 발생

**해결 방법**:
1. Logs 탭에서 에러 메시지 확인
2. 로컬에서 빌드 테스트:
   ```bash
   cd ui
   npm install
   npm run build
   ```
3. 에러 수정 후 다시 커밋 및 푸시

#### 문제 2: API 호출 실패 (CORS 오류)

**증상**: 브라우저 콘솔에 CORS 에러 표시

**해결 방법**:
1. 백엔드 서버의 CORS 설정 확인
2. `server/src/index.js`에서 프론트엔드 도메인 허용:
   ```javascript
   app.use(cors({
     origin: ['https://order-app-ui.onrender.com', 'http://localhost:3000']
   }));
   ```
3. 백엔드 서버 재배포

#### 문제 3: 환경 변수가 적용되지 않음

**증상**: API 호출이 여전히 `localhost`로 전송됨

**해결 방법**:
1. Render 대시보드에서 환경 변수 확인:
   - Key가 `VITE_API_BASE_URL`인지 확인
   - Value가 올바른지 확인
2. 환경 변수 수정 후 재배포:
   - Settings → Environment → 환경 변수 수정
   - "Manual Deploy" → "Deploy latest commit" 클릭

#### 문제 4: 빈 화면 또는 404 에러

**증상**: 사이트는 로드되지만 빈 화면 또는 404

**해결 방법**:
1. Publish Directory 확인:
   - `dist` 또는 `ui/dist`가 올바른지 확인
2. `dist` 폴더 구조 확인:
   ```bash
   cd ui
   npm run build
   ls -la dist
   ```
3. `index.html`이 `dist` 폴더에 있는지 확인

#### 문제 5: 이미지가 표시되지 않음

**증상**: 메뉴 이미지가 표시되지 않음

**해결 방법**:
1. 이미지 파일이 `ui/public` 폴더에 있는지 확인
2. 이미지 경로가 올바른지 확인 (`/americano-ice.jpg` 형식)
3. 빌드 후 `dist` 폴더에 이미지가 복사되었는지 확인

## 환경 변수 체크리스트

배포 전 확인사항:

- [ ] `VITE_API_BASE_URL` 환경 변수가 설정되었는가?
- [ ] 백엔드 서비스 URL이 올바른가? (끝에 `/api` 포함)
- [ ] `https://` 프로토콜을 사용하는가?
- [ ] 환경 변수 이름에 `VITE_` 접두사가 있는가?

## 배포 후 확인사항

- [ ] 사이트가 정상적으로 로드되는가?
- [ ] API 호출이 성공하는가? (Network 탭 확인)
- [ ] 콘솔에 에러가 없는가?
- [ ] 모든 기능이 정상 작동하는가?

## 자동 배포 설정

GitHub에 코드를 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

푸시 후:
1. Render 대시보드의 "Events" 탭에서 배포 진행 상황 확인
2. 배포 완료까지 약 2-3분 소요
3. 배포 완료 시 자동으로 새 버전이 라이브에 반영됨

## 무료 플랜 제한사항

- **서비스 중지**: 15분간 요청이 없으면 서비스가 중지됩니다
- **첫 요청 지연**: 중지된 서비스는 첫 요청 시 약 30초 정도 소요됩니다
- **빌드 시간**: 무료 플랜은 빌드 시간 제한이 있을 수 있습니다

## 추가 최적화

### 1. 빌드 최적화

`vite.config.mjs`에 빌드 최적화 설정 추가:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화
    minify: 'terser', // 코드 압축
  }
})
```

### 2. 환경별 설정

개발/프로덕션 환경 분리:

```javascript
// ui/src/api.js
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:3001/api';
```

## 참고 자료

- [Render Static Sites 문서](https://render.com/docs/static-sites)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [환경 변수 사용법](https://vitejs.dev/guide/env-and-mode.html)
