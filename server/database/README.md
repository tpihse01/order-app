# 데이터베이스 설정 가이드

## PostgreSQL 설치 및 데이터베이스 생성

### 1. PostgreSQL 설치
PostgreSQL이 설치되어 있지 않은 경우, [PostgreSQL 공식 사이트](https://www.postgresql.org/download/)에서 다운로드하여 설치하세요.

### 2. 데이터베이스 생성

PostgreSQL에 접속하여 다음 명령을 실행하세요:

```sql
CREATE DATABASE order_app;
```

또는 psql 명령줄에서:

```bash
createdb order_app
```

### 3. 스키마 생성

데이터베이스에 접속하여 `schema.sql` 파일을 실행하세요:

```bash
psql -U postgres -d order_app -f database/schema.sql
```

또는 psql 내에서:

```sql
\i database/schema.sql
```

### 4. 초기 데이터 삽입

`seed.sql` 파일을 실행하여 초기 데이터를 삽입하세요:

```bash
psql -U postgres -d order_app -f database/seed.sql
```

또는 psql 내에서:

```sql
\i database/seed.sql
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=your_password
```

## 데이터베이스 구조

- **menus**: 메뉴 정보
- **options**: 메뉴 옵션
- **orders**: 주문 정보
- **order_items**: 주문 상세 (메뉴별)
- **order_item_options**: 주문 상세 옵션
- **settings**: 시스템 설정 (관리자 비밀번호 등)

## 주의사항

- 모든 시간은 UTC로 저장됩니다.
- 프론트엔드에서 클라이언트의 로컬 시간대로 변환하여 표시합니다.
- 관리자 비밀번호는 현재 평문으로 저장됩니다. 프로덕션 환경에서는 해시 처리 권장합니다.
