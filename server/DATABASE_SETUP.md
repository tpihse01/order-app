# 데이터베이스 설정 가이드

## 방법 1: Node.js 스크립트 사용 (권장)

### 1단계: 패키지 설치
```bash
cd server
npm install
```

### 2단계: .env 파일 설정
`.env` 파일을 열고 실제 PostgreSQL 비밀번호를 입력하세요:
```env
DB_PASSWORD=실제_비밀번호
```

### 3단계: 데이터베이스 생성
```bash
npm run create-db
```

### 4단계: 데이터베이스 연결 테스트
```bash
npm run test-db
```

### 5단계: 스키마 생성 및 초기 데이터 삽입
```bash
npm run init-db
```

## 방법 2: psql 명령줄 사용

PostgreSQL이 PATH에 설정되어 있는 경우:

### 1단계: 데이터베이스 생성
```bash
psql -U postgres -c "CREATE DATABASE order_app;"
```

또는 psql에 접속하여:
```sql
CREATE DATABASE order_app;
```

### 2단계: 스키마 생성
```bash
psql -U postgres -d order_app -f database/schema.sql
```

### 3단계: 초기 데이터 삽입
```bash
psql -U postgres -d order_app -f database/seed.sql
```

## 방법 3: pgAdmin 사용

1. pgAdmin을 실행합니다.
2. 서버에 연결합니다.
3. "Databases"를 우클릭하고 "Create" > "Database..."를 선택합니다.
4. Database 이름에 `order_app`을 입력하고 저장합니다.
5. 생성된 데이터베이스를 선택하고 Query Tool을 엽니다.
6. `database/schema.sql` 파일의 내용을 복사하여 실행합니다.
7. `database/seed.sql` 파일의 내용을 복사하여 실행합니다.

## 문제 해결

### PostgreSQL이 PATH에 없는 경우

Windows에서 PostgreSQL의 기본 설치 경로:
- `C:\Program Files\PostgreSQL\<version>\bin`

전체 경로를 사용하여 실행:
```bash
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE order_app;"
```

또는 환경 변수 PATH에 PostgreSQL bin 디렉토리를 추가하세요.

### 비밀번호 입력이 필요한 경우

psql을 사용할 때 비밀번호를 입력하라는 프롬프트가 나타날 수 있습니다.
Node.js 스크립트를 사용하면 `.env` 파일의 비밀번호를 자동으로 사용합니다.
