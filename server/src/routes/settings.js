/**
 * 설정 관련 API 라우트
 * 
 * 앱 설정 관리 엔드포인트를 제공합니다.
 * 
 * @module routes/settings
 */

import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * PATCH /api/settings/admin-password
 * 관리자 비밀번호 변경
 * 
 * 관리자 비밀번호를 변경합니다. 새 비밀번호는 6자리여야 합니다.
 * 
 * @route PATCH /api/settings/admin-password
 * @param {object} body - 요청 본문
 * @param {string} body.old_password - 기존 비밀번호
 * @param {string} body.new_password - 새 비밀번호 (6자리)
 * @returns {object} 200 - 변경 성공 { success: true, message: string, data: object }
 * @returns {object} 400 - 잘못된 요청 { success: false, error: string }
 * @returns {object} 401 - 인증 실패 { success: false, error: string }
 * @returns {object} 500 - 서버 오류 { success: false, error: string }
 */
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

    // 새 비밀번호 저장 (기존 레코드 업데이트)
    // UNIQUE 제약조건 때문에 INSERT 대신 UPDATE 사용
    const updateQuery = `
      UPDATE settings 
      SET value = $1, changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'admin_password'
      RETURNING changed_at
    `;

    const updateResult = await pool.query(updateQuery, [new_password]);
    
    // 업데이트된 행이 없으면 새로 생성 (초기 설정 시)
    if (updateResult.rowCount === 0) {
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
      return;
    }

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
      data: {
        changed_at: updateResult.rows[0].changed_at
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
