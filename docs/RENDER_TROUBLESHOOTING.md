# Render 배포 후 "메뉴를 불러오는 중"만 나올 때

배포된 사이트에서 **시작하기**를 눌렀는데 메뉴가 안 나오고 "메뉴를 불러오는 중"만 계속 보일 때 확인할 것들입니다.

---

## 1. API 주소가 빌드에 들어갔는지 확인 (가장 흔한 원인)

프론트엔드는 **빌드할 때** `VITE_API_BASE_URL` 값을 코드에 박습니다.  
Render **Static Site**는 Render 쪽에서 빌드하므로, **Render 대시보드에 환경 변수를 꼭 넣어야** 합니다.

### 확인 방법

1. Render 대시보드 → **order-app-ui** (Static Site) 선택
2. **Environment** 탭 이동
3. 다음 변수가 있는지 확인:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://order-app-backend-dkkp.onrender.com/api`  
     (백엔드 서비스 주소 + `/api`, `https` 사용)

없으면 **Add Environment Variable**로 추가한 뒤 **Save Changes** 하고,  
**Manual Deploy** → **Deploy latest commit** 으로 **한 번 다시 배포**해야 합니다.  
(환경 변수만 바꿔도 반영하려면 재배포가 필요합니다.)

### 브라우저로 확인

배포된 사이트에서 F12 → **Console** 탭에서:

```javascript
// 이 값이 배포 주소여야 함 (localhost면 잘못된 것)
console.log(import.meta.env.VITE_API_BASE_URL);
```

- `undefined` 또는 `http://localhost:3001/api` → Render에 `VITE_API_BASE_URL`이 없었거나, 재배포 전에 빌드된 상태입니다.  
  → 위처럼 환경 변수 설정 후 **재배포**하세요.

---

## 2. 백엔드 콜드 스타트 (무료 플랜)

Render **무료 플랜**은 15분 동안 요청이 없으면 서버를 재운다가,  
첫 요청 시 서버를 다시 켜는 데 **보통 30초~1분** 걸립니다.

### 어떻게 하면 좋은지

- **시작하기** 클릭 후 **최대 1분** 정도 기다려 보세요.
- 그래도 안 되면:
  - 브라우저에서 백엔드 주소를 직접 열어 봅니다:  
    `https://order-app-backend-dkkp.onrender.com/health`
  - 한두 번 연 다음, 다시 앱에서 **시작하기**를 눌러 보세요.

코드에는 이미 **약 70초 타임아웃**이 들어가 있어서,  
그 시간 안에 서버가 켜지면 메뉴가 나오고,  
넘기면 "서버가 시작 중일 수 있습니다. 무료 플랜은 최대 1분 정도 걸릴 수 있으니 잠시 후 다시 시도해 주세요." 같은 메시지가 나옵니다.

---

## 3. 백엔드가 정상인지 확인

1. Render 대시보드 → **order-app-server** (Web Service) 선택
2. **Logs** 탭에서 에러가 없는지 확인
3. 브라우저에서 직접 열기:
   - `https://order-app-backend-dkkp.onrender.com/`  
   - `https://order-app-backend-dkkp.onrender.com/health`  
   - `https://order-app-backend-dkkp.onrender.com/api/menus`

`/api/menus`에서 JSON이 보이면 백엔드는 정상입니다.  
그때도 앱에서만 안 나오면 **1번(API 주소)** 을 다시 확인하세요.

---

## 4. CORS / 네트워크

백엔드 코드에는 `app.use(cors());` 로 모든 도메인을 허용하고 있어서,  
같은 Render 도메인 쓰는 한 CORS 문제는 거의 없습니다.

브라우저 F12 → **Network** 탭에서:

- **시작하기** 클릭 후 `/api/menus` 요청이 나가는지
- 요청 URL이 `https://order-app-backend-dkkp.onrender.com/api/menus` 인지
- 상태 코드가 200인지, 아니면 빨간색(실패)인지

확인해 보시면 원인 파악에 도움이 됩니다.

---

## 체크리스트

- [ ] Render Static Site에 `VITE_API_BASE_URL=https://order-app-backend-dkkp.onrender.com/api` 설정됨
- [ ] 환경 변수 추가/수정 후 **재배포** 함
- [ ] 백엔드 서비스가 **Suspended**가 아닌지 확인
- [ ] `/health`, `/api/menus` 를 브라우저에서 열어서 응답 확인
- [ ] 시작하기 클릭 후 **1분 정도** 기다려 봤는지

위를 다 해보셨는데도 같은 현상이면,  
브라우저 Console / Network 탭 화면(에러 메시지, 실패한 요청 URL)을 알려주시면 다음 원인까지 짚어볼 수 있습니다.
