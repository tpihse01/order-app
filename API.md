# API 문서

커피 주문 앱의 RESTful API 문서입니다.

## 기본 정보

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **인증**: 관리자 기능은 비밀번호 인증 필요

## 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 메뉴 API

### GET /api/menus
메뉴 목록을 조회합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "price": 4000,
      "description": "간단한 설명...",
      "image_url": "/americano-ice.jpg",
      "stock": 10,
      "options": [
        {
          "id": 1,
          "name": "샷 추가",
          "additional_price": 500
        },
        {
          "id": 2,
          "name": "시럽 추가",
          "additional_price": 0
        }
      ]
    }
  ]
}
```

### GET /api/menus/:menuId
특정 메뉴의 상세 정보를 조회합니다.

**파라미터:**
- `menuId` (number): 메뉴 ID

**응답:** 메뉴 객체 (위와 동일한 형식)

### PATCH /api/menus/:menuId/stock
메뉴의 재고 수량을 변경합니다.

**파라미터:**
- `menuId` (number): 메뉴 ID

**요청 Body:**
```json
{
  "change": 5  // 재고 변경량 (증가/감소)
}
```
또는
```json
{
  "stock": 10  // 직접 재고 값 설정
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "stock": 15
  }
}
```

### POST /api/menus/reset-stock
모든 메뉴의 재고를 0으로 초기화합니다.

**응답:**
```json
{
  "success": true,
  "message": "모든 재고가 0으로 초기화되었습니다.",
  "data": {
    "updatedCount": 6,
    "menus": [...]
  }
}
```

## 주문 API

### POST /api/orders
새 주문을 생성합니다. 주문 생성 시 자동으로 재고가 차감됩니다.

**요청 Body:**
```json
{
  "items": [
    {
      "menu_id": 1,
      "quantity": 2,
      "option_ids": [1],
      "item_price": 9000
    }
  ],
  "total_amount": 9000
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_time": "2026-01-28T16:30:00.000Z",
    "status": "pending",
    "total_amount": 9000
  }
}
```

**에러:**
- 재고 부족 시: `400 Bad Request` - "재고가 부족합니다: {메뉴명} (재고: X개, 주문: Y개)"

### GET /api/orders
주문 목록을 조회합니다.

**Query 파라미터:**
- `status` (string, optional): 주문 상태 필터 (`pending`, `in_progress`, `completed`)
- `tab` (string, optional): 탭 필터 (`in-progress`, `completed`)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_time": "2026-01-28T16:30:00.000Z",
      "completed_time": null,
      "status": "pending",
      "total_amount": 9000,
      "items": [
        {
          "id": 1,
          "menu_id": 1,
          "menu_name": "아메리카노(ICE)",
          "quantity": 2,
          "item_price": 9000,
          "options": [
            {
              "id": 1,
              "name": "샷 추가",
              "additional_price": 500
            }
          ]
        }
      ]
    }
  ]
}
```

### GET /api/orders/:orderId
특정 주문의 상세 정보를 조회합니다.

**파라미터:**
- `orderId` (number): 주문 ID

**응답:** 주문 객체 (위와 동일한 형식)

### PATCH /api/orders/:orderId
주문 상태를 변경합니다.

**파라미터:**
- `orderId` (number): 주문 ID

**요청 Body:**
```json
{
  "status": "in_progress"  // "pending" | "in_progress" | "completed"
}
```

**상태 전환 규칙:**
- `pending` → `in_progress`만 가능
- `in_progress` → `completed`만 가능
- `completed`는 변경 불가

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "in_progress",
    "completed_time": null
  }
}
```

## 인증 API

### POST /api/auth/admin
관리자 비밀번호를 인증합니다.

**요청 Body:**
```json
{
  "password": "000000"
}
```

**응답:**
```json
{
  "success": true,
  "message": "인증 성공"
}
```

**에러:**
- 비밀번호 불일치: `401 Unauthorized` - "비밀번호가 일치하지 않습니다."

## 설정 API

### PATCH /api/settings/admin-password
관리자 비밀번호를 변경합니다.

**요청 Body:**
```json
{
  "old_password": "000000",
  "new_password": "123456"
}
```

**응답:**
```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}
```

**에러:**
- 기존 비밀번호 불일치: `401 Unauthorized`
- 새 비밀번호 길이 부족: `400 Bad Request`

## HTTP 상태 코드

- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

## 에러 처리

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 주의사항

1. 주문 생성 시 재고가 자동으로 차감됩니다.
2. 재고가 부족한 경우 주문 생성이 실패합니다.
3. 주문 상태는 순차적으로만 변경 가능합니다 (pending → in_progress → completed).
4. 모든 재고 초기화는 되돌릴 수 없습니다.
