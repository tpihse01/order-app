import pool from '../config/database.js';

async function testConnection() {
  try {
    console.log('데이터베이스 연결 테스트 중...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ 데이터베이스 연결 성공!');
    console.log('현재 시간 (UTC):', result.rows[0].current_time);
    console.log('PostgreSQL 버전:', result.rows[0].pg_version.split(',')[0]);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:');
    console.error('에러 메시지:', error.message);
    console.error('\n확인 사항:');
    console.error('1. PostgreSQL이 실행 중인지 확인하세요.');
    console.error('2. .env 파일의 데이터베이스 연결 정보가 올바른지 확인하세요.');
    console.error('3. 데이터베이스 "order_app"가 생성되었는지 확인하세요.');
    await pool.end();
    process.exit(1);
  }
}

testConnection();
