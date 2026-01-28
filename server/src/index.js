import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  // Accept 헤더를 확인하여 JSON 요청인지 HTML 요청인지 판단
  const accepts = req.headers.accept || '';
  if (accepts.includes('application/json')) {
    res.json({
      message: 'Coffee Order App API Server',
      version: '1.0.0'
    });
  } else {
    // 브라우저 접속 시 HTML로 응답
    res.send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coffee Order App API Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
          }
          .container {
            background: white;
            padding: 2rem 3rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
          }
          h1 {
            margin: 0 0 1rem 0;
            color: #667eea;
            font-size: 2rem;
          }
          .info {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
          }
          .info-item {
            margin: 0.5rem 0;
            font-size: 1.1rem;
          }
          .label {
            font-weight: 600;
            color: #666;
          }
          .value {
            color: #333;
          }
          .endpoints {
            margin-top: 2rem;
            text-align: left;
          }
          .endpoints h2 {
            font-size: 1.2rem;
            color: #667eea;
            margin-bottom: 0.5rem;
          }
          .endpoint {
            padding: 0.5rem;
            margin: 0.25rem 0;
            background: #f9f9f9;
            border-left: 3px solid #667eea;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>☕ Coffee Order App</h1>
          <div class="info">
            <div class="info-item">
              <span class="label">서버 상태:</span>
              <span class="value">✅ 정상 작동 중</span>
            </div>
            <div class="info-item">
              <span class="label">버전:</span>
              <span class="value">1.0.0</span>
            </div>
            <div class="info-item">
              <span class="label">포트:</span>
              <span class="value">${PORT}</span>
            </div>
          </div>
          <div class="endpoints">
            <h2>📡 API 엔드포인트</h2>
            <div class="endpoint">GET /api/menus - 메뉴 목록</div>
            <div class="endpoint">GET /api/orders - 주문 목록</div>
            <div class="endpoint">POST /api/orders - 주문 생성</div>
            <div class="endpoint">POST /api/auth/login - 관리자 로그인</div>
            <div class="endpoint">GET /api/settings - 설정 조회</div>
            <div class="endpoint">GET /health - 서버 상태 확인</div>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API 라우트
import menusRoutes from './routes/menus.js';
import ordersRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';

app.use('/api/menus', menusRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || '서버 내부 오류가 발생했습니다.'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
