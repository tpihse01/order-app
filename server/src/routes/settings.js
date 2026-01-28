import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// PATCH /api/settings/admin-password - 관리자 비밀번호 변경
router.patch('/admin-password', async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: '이전 비밀번호와 새 비밀번호가 필요합니다.'
      });
    }

    if (typeof new_password !== 'string' || new_password.length !== 6) {
      return res.status(400).json({
        success: false,
        error: '새 비밀번호는 6자리여야 합니다.'
      });
    }

    // 가장 최근에 변경된 비밀번호 조회
    const currentPasswordQuery = `
      SELECT value 
      FROM settings 
      WHERE key = 'admin_password' 
      ORDER BY changed_at DESC 
      LIMIT 1
    `;

    const currentResult = await pool.query(currentPasswordQuery);

    if (currentResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        error: '관리자 비밀번호가 설정되지 않았습니다.'
      });
    }

    const storedPassword = currentResult.rows[0].value;

    // 이전 비밀번호 확인
    if (old_password !== storedPassword) {
      return res.status(401).json({
        success: false,
        error: '이전 비밀번호가 일치하지 않습니다.'
      });
    }

    // 새 비밀번호가 이전 비밀번호와 같은지 확인
    if (new_password === old_password) {
      return res.status(400).json({
        success: false,
        error: '새 비밀번호는 이전 비밀번호와 달라야 합니다.'
      });
    }

    // 새 비밀번호 저장 (새 레코드로 추가하여 이력 관리)
    const insertQuery = `
      INSERT INTO settings (key, value, changed_at)
      VALUES ('admin_password', $1, CURRENT_TIMESTAMP)
      RETURNING changed_at
    `;

    const insertResult = await pool.query(insertQuery, [new_password]);

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
      data: {
        changed_at: insertResult.rows[0].changed_at
      }
    });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다.'
    });
  }
});

export default router;
