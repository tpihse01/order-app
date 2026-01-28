import pool from '../config/database.js';

async function updateMenuImages() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 아메리카노(ICE) 이미지 업데이트
    const result1 = await client.query(
      `UPDATE menus SET image_url = '/americano-ice.jpg' WHERE name = '아메리카노(ICE)'`
    );
    console.log(`아메리카노(ICE) 업데이트: ${result1.rowCount}개 행 수정됨`);
    
    // 아메리카노(HOT) 이미지 업데이트
    const result2 = await client.query(
      `UPDATE menus SET image_url = '/americano-hot.jpg' WHERE name = '아메리카노(HOT)'`
    );
    console.log(`아메리카노(HOT) 업데이트: ${result2.rowCount}개 행 수정됨`);
    
    // 카페라떼 이미지 업데이트
    const result3 = await client.query(
      `UPDATE menus SET image_url = '/caffe-latte.jpg' WHERE name = '카페라떼'`
    );
    console.log(`카페라떼 업데이트: ${result3.rowCount}개 행 수정됨`);
    
    await client.query('COMMIT');
    console.log('\n✅ 모든 메뉴 이미지가 성공적으로 업데이트되었습니다!');
    
    // 업데이트 결과 확인
    const checkResult = await client.query(
      `SELECT name, image_url FROM menus WHERE name IN ('아메리카노(ICE)', '아메리카노(HOT)', '카페라떼') ORDER BY name`
    );
    console.log('\n📋 업데이트된 메뉴 목록:');
    checkResult.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.image_url}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateMenuImages()
  .then(() => {
    console.log('\n✨ 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
