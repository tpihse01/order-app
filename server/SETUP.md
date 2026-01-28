# 서버 설정 가이드

## 1. 패키지 설치

```bash
cd server
npm install
```

## 2. 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스를 생성하세요:

```bash
createdb order_app
```

또는 psql에서:

```sql
CREATE DATABASE order_app;
```

## 3. 환경 변수 설정

`.env` 파일을 열고 실제 데이터베이스 연결 정보를 입력하세요:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=실제_비밀번호

NODE_ENV=development
```

## 4. 데이터베이스 연결 테스트

```bash
npm run test-db
```

연결이 성공하면 다음 메시지가 표시됩니다:
```
✅ 데이터베이스 연결 성공!
```

## 5. 데이터베이스 초기화

스키마 생성 및 초기 데이터 삽입:

```bash
npm run init-db
```

다음 메시지가 표시되면 성공입니다:
```
✅ 스키마 생성 완료
✅ 초기 데이터 삽입 완료
🎉 데이터베이스 초기화가 완료되었습니다!
```

## 6. 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

## 문제 해결

### 데이터베이스 연결 실패 시

1. PostgreSQL이 실행 중인지 확인:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # 또는 서비스 관리자에서 확인
   ```

2. 데이터베이스가 생성되었는지 확인:
   ```bash
   psql -U postgres -l
   ```

3. .env 파일의 연결 정보 확인:
   - DB_HOST: localhost
   - DB_PORT: 5432 (기본값)
   - DB_NAME: order_app
   - DB_USER: postgres (또는 사용자 이름)
   - DB_PASSWORD: 실제 비밀번호

### 패키지 설치 실패 시

npm 캐시 문제가 있는 경우:

```bash
npm cache clean --force
npm install
```

또는:

```bash
npm install --no-cache
```
