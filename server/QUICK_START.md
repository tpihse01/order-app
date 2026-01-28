# 빠른 시작 가이드

## 1. .env 파일 수정

`.env` 파일을 열고 `DB_PASSWORD`를 실제 PostgreSQL 비밀번호로 변경하세요:

```env
DB_PASSWORD=실제_비밀번호_입력
```

예시:
```env
DB_PASSWORD=postgres123
```

또는 PostgreSQL 설치 시 설정한 비밀번호를 입력하세요.

## 2. 데이터베이스 생성

```bash
npm run create-db
```

성공 메시지:
```
✅ 데이터베이스 "order_app"가 생성되었습니다.
```

## 3. 데이터베이스 연결 테스트

```bash
npm run test-db
```

## 4. 스키마 생성 및 초기 데이터 삽입

```bash
npm run init-db
```

## 5. 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

## PostgreSQL 비밀번호를 모르는 경우

### Windows에서 PostgreSQL 비밀번호 확인/변경:

1. **서비스 관리자에서 확인**:
   - Windows 키 + R
   - `services.msc` 입력
   - PostgreSQL 서비스 확인

2. **pg_hba.conf 파일 수정** (임시로 인증 비활성화):
   - 위치: `C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf`
   - `md5` 또는 `scram-sha-256`를 `trust`로 변경 (개발 환경에서만)
   - PostgreSQL 서비스 재시작

3. **비밀번호 재설정**:
   ```sql
   ALTER USER postgres WITH PASSWORD '새비밀번호';
   ```
