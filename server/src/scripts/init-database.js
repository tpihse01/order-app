import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('데이터베이스 초기화 시작...');
    
    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('스키마 생성 중...');
    await client.query(schemaSQL);
    console.log('✅ 스키마 생성 완료');
    
    // 시드 파일 읽기
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('초기 데이터 삽입 중...');
    await client.query(seedSQL);
    console.log('✅ 초기 데이터 삽입 완료');
    
    console.log('\n🎉 데이터베이스 초기화가 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:');
    console.error('에러 메시지:', error.message);
    console.error('\n확인 사항:');
    console.error('1. 데이터베이스 "order_app"가 생성되었는지 확인하세요.');
    console.error('2. .env 파일의 데이터베이스 연결 정보가 올바른지 확인하세요.');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
