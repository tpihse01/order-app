import pool from '../config/database.js';

async function updateCaramelMacchiatoImage() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 카라멜마키아토 이미지 업데이트
    const result = await client.query(
      `UPDATE menus SET image_url = '/caramel-macchiato.jpg' WHERE name = '카라멜마키아토'`
    );
    console.log(`카라멜마키아토 업데이트: ${result.rowCount}개 행 수정됨`);
    
    await client.query('COMMIT');
    console.log('\n✅ 카라멜마키아토 이미지가 성공적으로 업데이트되었습니다!');
    
    // 업데이트 결과 확인
    const checkResult = await client.query(
      `SELECT name, image_url FROM menus WHERE name = '카라멜마키아토'`
    );
    console.log('\n📋 업데이트된 메뉴 정보:');
    if (checkResult.rows.length > 0) {
      console.log(`  - ${checkResult.rows[0].name}: ${checkResult.rows[0].image_url}`);
    } else {
      console.log('  ⚠️ 메뉴를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateCaramelMacchiatoImage()
  .then(() => {
    console.log('\n✨ 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
