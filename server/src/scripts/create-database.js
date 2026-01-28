import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function createDatabase() {
  // postgres 데이터베이스에 연결 (기본 데이터베이스)
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // 기본 데이터베이스
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await adminClient.connect();
    console.log('PostgreSQL에 연결되었습니다.');

    const dbName = process.env.DB_NAME || 'order_app';

    // 데이터베이스 존재 여부 확인
    const checkQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const checkResult = await adminClient.query(checkQuery, [dbName]);

    if (checkResult.rows.length > 0) {
      console.log(`데이터베이스 "${dbName}"가 이미 존재합니다.`);
      await adminClient.end();
      return;
    }

    // 데이터베이스 생성
    const createQuery = `CREATE DATABASE ${dbName}`;
    await adminClient.query(createQuery);
    console.log(`✅ 데이터베이스 "${dbName}"가 생성되었습니다.`);

    await adminClient.end();
  } catch (error) {
    console.error('❌ 데이터베이스 생성 실패:');
    console.error('에러 메시지:', error.message);
    console.error('\n확인 사항:');
    console.error('1. PostgreSQL이 실행 중인지 확인하세요.');
    console.error('2. .env 파일의 DB_USER와 DB_PASSWORD가 올바른지 확인하세요.');
    console.error('3. 사용자에게 데이터베이스 생성 권한이 있는지 확인하세요.');
    await adminClient.end();
    process.exit(1);
  }
}

createDatabase();
