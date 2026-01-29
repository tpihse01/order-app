# Render.com 배포 가이드

커피 주문 앱을 Render.com에 배포하는 단계별 가이드입니다.

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. **Render 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인 또는 회원가입

2. **PostgreSQL 데이터베이스 생성**
   - "New +" 버튼 클릭
   - "PostgreSQL" 선택
   - 설정:
     - **Name**: `order-app-db` (원하는 이름)
     - **Database**: `order_app` (또는 원하는 DB 이름)
     - **User**: 자동 생성됨
     - **Region**: 가장 가까운 지역 선택 (예: Singapore)
     - **PostgreSQL Version**: 최신 버전 선택
     - **Plan**: Free 플랜 선택 (또는 유료 플랜)
   - "Create Database" 클릭

3. **데이터베이스 정보 저장**
   - 생성 후 표시되는 정보를 안전한 곳에 저장:
     - **Internal Database URL**: 내부 연결용
     - **External Database URL**: 외부 연결용 (로컬에서 마이그레이션 시 사용)
     - **Host, Port, Database, User, Password** 정보

### 2단계: 백엔드 서버 배포

1. **GitHub 저장소 준비**
   ```bash
   # 프로젝트 루트에서
   git init
   git add .
   git commit -m "Initial commit"
   
   # GitHub에 새 저장소 생성 후
   git remote add origin https://github.com/your-username/order-app.git
   git push -u origin main
   ```

2. **Render에서 Web Service 생성**
   - Render 대시보드에서 "New +" 클릭
   - "Web Service" 선택
   - GitHub 저장소 연결

3. **서비스 설정**
   - **Name**: `order-app-server`
   - **Region**: 데이터베이스와 동일한 지역 선택
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `server` (백엔드 폴더)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free 플랜 선택

4. **환경 변수 설정**
   - "Environment" 섹션에서 다음 변수 추가:
   
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<데이터베이스 호스트>
   DB_PORT=5432
   DB_NAME=<데이터베이스 이름>
   DB_USER=<데이터베이스 사용자>
   DB_PASSWORD=<데이터베이스 비밀번호>
   ```
   
   **중요**: 데이터베이스 정보는 PostgreSQL 서비스의 "Connections" 탭에서 확인 가능합니다.
   - Internal Database URL을 사용하면 자동으로 파싱됩니다.
   - 또는 개별 변수로 설정할 수 있습니다.

5. **고급 설정 (선택사항)**
   - "Advanced" 섹션에서:
     - **Auto-Deploy**: `Yes` (GitHub push 시 자동 배포)
     - **Health Check Path**: `/health`

6. **서비스 생성 및 배포**
   - "Create Web Service" 클릭
   - 배포가 완료될 때까지 대기 (약 2-3분)

7. **데이터베이스 초기화**
   - 배포 완료 후 서비스 URL 확인 (예: `https://order-app-server.onrender.com`)
   - 로컬에서 데이터베이스 초기화 스크립트 실행:
   
   ```bash
   # .env 파일에 External Database URL 설정
   cd server
   # .env 파일 수정
   DB_HOST=<external-host>
   DB_PORT=5432
   DB_NAME=<database-name>
   DB_USER=<user>
   DB_PASSWORD=<password>
   
   # 데이터베이스 초기화
   npm run create-db  # 이미 생성되어 있으면 스킵
   npm run init-db    # 스키마 및 시드 데이터 생성
   ```
   
   또는 Render의 PostgreSQL 서비스에서 "Connect" 버튼을 통해 직접 연결하여 SQL 스크립트 실행 가능합니다.

### 3단계: 프론트엔드 배포

1. **Static Site 생성**
   - Render 대시보드에서 "New +" 클릭
   - "Static Site" 선택
   - GitHub 저장소 연결

2. **서비스 설정**
   - **Name**: `order-app-ui`
   - **Branch**: `main`
   - **Root Directory**: `ui` (프론트엔드 폴더)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free 플랜 선택

3. **환경 변수 설정**
   - "Environment" 섹션에서:
   
   ```
   VITE_API_BASE_URL=https://order-app-server.onrender.com/api
   ```
   
   **참고**: Vite 환경 변수는 `VITE_` 접두사가 필요합니다.

4. **API URL 수정**
   - `ui/src/api.js` 파일에서 API 기본 URL을 환경 변수로 변경:
   
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
   ```

5. **서비스 생성 및 배포**
   - "Create Static Site" 클릭
   - 배포 완료 대기

### 4단계: 설정 확인 및 테스트

1. **백엔드 확인**
   - 서비스 URL 접속: `https://order-app-server.onrender.com`
   - `/health` 엔드포인트 확인: `https://order-app-server.onrender.com/health`
   - API 엔드포인트 테스트: `https://order-app-server.onrender.com/api/menus`

2. **프론트엔드 확인**
   - Static Site URL 접속
   - 주문하기 기능 테스트
   - 관리자 화면 테스트

3. **CORS 설정 확인**
   - 백엔드에서 프론트엔드 도메인 허용 확인
   - 필요시 `server/src/index.js`의 CORS 설정 수정

## 환경 변수 체크리스트

### 백엔드 (Web Service)
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (또는 Render가 할당한 포트)
- [ ] `DB_HOST`
- [ ] `DB_PORT=5432`
- [ ] `DB_NAME`
- [ ] `DB_USER`
- [ ] `DB_PASSWORD`

### 프론트엔드 (Static Site)
- [ ] `VITE_API_BASE_URL` (백엔드 서비스 URL)

## 문제 해결

### 백엔드가 시작되지 않는 경우
1. 로그 확인: Render 대시보드의 "Logs" 탭 확인
2. 환경 변수 확인: 모든 필수 변수가 설정되었는지 확인
3. 포트 확인: `process.env.PORT` 사용 확인

### 데이터베이스 연결 실패
1. Internal Database URL 사용 확인
2. 방화벽 설정 확인 (Render는 자동으로 처리)
3. 데이터베이스가 실행 중인지 확인

### 프론트엔드에서 API 호출 실패
1. CORS 설정 확인
2. `VITE_API_BASE_URL` 환경 변수 확인
3. 브라우저 콘솔에서 네트워크 오류 확인

### 무료 플랜 제한사항
- **서비스 중지**: 15분간 요청이 없으면 서비스가 중지됩니다
- **첫 요청 지연**: 중지된 서비스는 첫 요청 시 약 30초 정도 소요됩니다
- **데이터베이스**: 무료 플랜은 90일 후 삭제될 수 있습니다

## 추가 최적화

1. **Health Check 설정**
   - Render의 Health Check Path를 `/health`로 설정
   - 서비스가 살아있는지 주기적으로 확인

2. **자동 배포**
   - GitHub에 push하면 자동으로 배포되도록 설정
   - Production 브랜치만 자동 배포하도록 제한

3. **환경별 설정**
   - 개발/스테이징/프로덕션 환경 분리
   - 환경별로 다른 데이터베이스 사용

## 참고 자료

- [Render 공식 문서](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Node.js 배포 가이드](https://render.com/docs/deploy-node-express-app)
