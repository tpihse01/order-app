/**
 * 인증 관련 API 라우트
 * 
 * 관리자 인증 등의 엔드포인트를 제공합니다.
 * 
 * @module routes/auth
 */

import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * POST /api/auth/admin
 * 관리자 비밀번호 인증
 * 
 * 관리자 비밀번호를 확인합니다.
 * 
 * @route POST /api/auth/admin
 * @param {object} body - 요청 본문
 * @param {string} body.password - 관리자 비밀번호
 * @returns {object} 200 - 인증 성공 { success: true, message: string }
 * @returns {object} 400 - 잘못된 요청 { success: false, error: string }
 * @returns {object} 401 - 인증 실패 { success: false, error: string }
 * @returns {object} 500 - 서버 오류 { success: false, error: string }
 */
router.post('/admin', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: '비밀번호가 필요합니다.'
      });
    }

    // 가장 최근에 변경된 비밀번호 조회
    const passwordQuery = `
      SELECT value 
      FROM settings 
      WHERE key = 'admin_password' 
      ORDER BY changed_at DESC 
      LIMIT 1
    `;

    const result = await pool.query(passwordQuery);

    if (result.rows.length === 0) {
      return res.status(500).json({
        success: false,
        error: '관리자 비밀번호가 설정되지 않았습니다.'
      });
    }

    const storedPassword = result.rows[0].value;

    // 비밀번호 비교 (현재는 평문 비교, 추후 해시 비교로 변경 권장)
    if (password === storedPassword) {
      res.json({
        success: true,
        message: '인증 성공'
      });
    } else {
      res.status(401).json({
        success: false,
        error: '비밀번호가 일치하지 않습니다.'
      });
    }
  } catch (error) {
    console.error('Error authenticating admin:', error);
    res.status(500).json({
      success: false,
      error: '인증 중 오류가 발생했습니다.'
    });
  }
});

export default router;
