# 커피 주문 앱

## 1.1 프로젝트명
커피 주문 앱

## 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 간단한 풀스택 웹 앱

## 1.3 개발 범위
- 주문하기 화면(메뉴 선택 및 장바구니 기능)
- 관리자 화면(재고 관리 및 주문 상태 관리)
- 데이터를 생성/조회/수정/삭제할 수 있는 기능

## 2. 기술 스택
- 프런트엔드: HTML, CSS, 리액트, 자바스크립트
- 백엔드: Node.js, Express
- 데이터베이스: PostgreSQL

## 3. 기본 사용
- 프런트엔트와 백엔드를 따로 개발
- 기본적인 웹 기술만 사용
- 학습 목적이므로 사용자 인증이나 결제 기능은 제외
- 메뉴는 커피 메뉴만 있음

---

## 4. 주문하기 화면 PRD

### 4.1 화면 개요
사용자가 커피 메뉴를 선택하고, 옵션을 추가한 후 장바구니에 담아 주문을 진행할 수 있는 메인 화면입니다.

### 4.2 화면 구성 요소

#### 4.2.1 상단 내비게이션 바
- **위치**: 화면 최상단
- **구성 요소**:
  - 왼쪽: "COZY" 텍스트 로고
  - 오른쪽: 탭 형태의 내비게이션 버튼
    - "주문하기" 탭 (현재 활성화된 화면, 회색 배경으로 표시)
    - "관리자" 탭
- **기능**: 
  - "관리자" 탭 클릭 시 관리자 화면으로 이동

#### 4.2.2 상품 목록 섹션
- **위치**: 내비게이션 바 하단, 장바구니 섹션 상단
- **레이아웃**: 상품 카드들이 가로로 배열된 그리드 형태
- **상품 카드 구성 요소**:
  1. **상품 이미지**
     - 각 상품의 상단에 이미지 플레이스홀더 표시
     - 이미지가 없는 경우 X자 모양의 선이 그려진 직사각형 테두리로 표시
  2. **상품 정보**
     - 상품명 (예: "아메리카노(ICE)", "아메리카노(HOT)", "카페라떼")
     - 가격 (예: "4,000원", "5,000원")
     - 간단한 설명 텍스트 (예: "간단한 설명...")
  3. **옵션 선택**
     - 체크박스 형태의 옵션 제공
     - 옵션 종류:
       - "샷 추가 (+500원)"
       - "시럽 추가 (+0원)"
     - 각 옵션은 독립적으로 선택 가능
     - 옵션 선택 시 가격이 추가/변경됨
  4. **담기 버튼**
     - 각 상품 카드 하단에 위치
     - 회색 테두리의 버튼 형태
     - 클릭 시 선택된 옵션과 함께 장바구니에 추가

#### 4.2.3 장바구니 섹션
- **위치**: 상품 목록 섹션 하단
- **레이아웃**: 회색 테두리로 둘러싸인 박스 형태
- **구성 요소**:
  1. **섹션 제목**: "장바구니"
  2. **담긴 상품 목록**
     - 각 상품은 다음 정보를 표시:
       - 상품명 및 적용된 옵션 (예: "아메리카노(ICE) (샷 추가)")
       - 수량 (예: "X 1", "X 2")
       - 개별 가격 (예: "4,500원", "8,000원")
     - 상품 목록은 세로로 나열
  3. **총 금액**
     - 상품 목록 하단 오른쪽 정렬
     - "총 금액 **12,500원**" 형식으로 표시
     - 금액은 굵게 표시
  4. **주문하기 버튼**
     - 총 금액 하단에 위치
     - 회색 테두리의 버튼 형태
     - 클릭 시 주문 완료 처리

### 4.3 기능 요구사항

#### 4.3.1 상품 목록 표시
- **FR-001**: 서버에서 상품 목록을 조회하여 화면에 표시
- **FR-002**: 각 상품의 이미지, 이름, 가격, 설명을 표시
- **FR-003**: 상품 이미지가 없는 경우 플레이스홀더 표시

#### 4.3.2 옵션 선택
- **FR-004**: 각 상품에 대해 옵션을 선택할 수 있음
- **FR-005**: 옵션은 체크박스 형태로 제공되며, 여러 옵션을 동시에 선택 가능
- **FR-006**: 옵션 선택 시 추가 가격이 표시됨 (예: "+500원", "+0원")
- **FR-007**: 옵션 선택 상태는 각 상품 카드별로 독립적으로 관리됨

#### 4.3.3 장바구니 기능
- **FR-008**: "담기" 버튼 클릭 시 선택된 옵션과 함께 상품이 장바구니에 추가됨
- **FR-009**: 장바구니에 담긴 상품은 상품명, 적용된 옵션, 수량, 가격을 표시
- **FR-010**: 동일한 상품과 옵션 조합이 장바구니에 이미 있는 경우, 수량이 증가함
- **FR-011**: 장바구니에 담긴 모든 상품의 총 금액을 실시간으로 계산하여 표시
- **FR-012**: 장바구니가 비어있을 경우 적절한 안내 메시지 표시 (선택 사항)

#### 4.3.4 주문 처리
- **FR-013**: "주문하기" 버튼 클릭 시 장바구니의 모든 상품이 주문으로 전송됨
- **FR-014**: 주문 완료 후 장바구니가 비워짐
- **FR-015**: 주문 완료 시 사용자에게 확인 메시지 표시 (선택 사항)

#### 4.3.5 내비게이션
- **FR-016**: "관리자" 탭 클릭 시 관리자 화면으로 이동
- **FR-017**: 현재 활성화된 탭은 시각적으로 구분됨 (회색 배경)

### 4.4 UI/UX 요구사항

#### 4.4.1 레이아웃
- **UX-001**: 상품 카드는 반응형 그리드 레이아웃으로 배치
- **UX-002**: 모바일 환경에서는 상품 카드가 세로로 스크롤 가능하도록 배치
- **UX-003**: 장바구니 섹션은 화면 하단에 고정되거나 스크롤 가능한 형태로 배치

#### 4.4.2 시각적 피드백
- **UX-004**: 버튼 클릭 시 시각적 피드백 제공 (호버 효과, 클릭 효과)
- **UX-005**: 옵션 선택 시 체크박스 상태가 명확하게 표시됨
- **UX-006**: 장바구니에 상품이 추가될 때 시각적 피드백 제공 (선택 사항: 애니메이션)

#### 4.4.3 가격 표시
- **UX-007**: 모든 가격은 천 단위 구분 기호(쉼표)를 사용하여 표시 (예: "4,000원")
- **UX-008**: 총 금액은 다른 가격보다 크고 굵게 표시하여 강조
- **UX-009**: 옵션 추가 가격은 명확하게 표시 (예: "+500원")

#### 4.4.4 사용성
- **UX-010**: 상품 카드 내의 모든 요소가 명확하게 구분되어 보임
- **UX-011**: 버튼과 체크박스는 충분한 크기로 제공되어 클릭하기 쉬움
- **UX-012**: 장바구니가 비어있지 않을 때만 "주문하기" 버튼이 활성화됨

### 4.5 상호작용 플로우

#### 4.5.1 상품 주문 플로우
1. 사용자가 화면에 진입하면 상품 목록이 표시됨
2. 사용자가 원하는 상품 카드에서 옵션을 선택 (선택 사항)
3. 사용자가 "담기" 버튼을 클릭
4. 선택된 옵션과 함께 상품이 장바구니에 추가됨
5. 장바구니의 총 금액이 업데이트됨
6. 사용자가 추가 상품을 담거나 "주문하기" 버튼을 클릭
7. "주문하기" 버튼 클릭 시 주문이 완료되고 장바구니가 비워짐

#### 4.5.2 화면 이동 플로우
1. 사용자가 상단 내비게이션의 "관리자" 탭을 클릭
2. 관리자 화면으로 이동

### 4.6 데이터 구조 (참고)

#### 4.6.1 상품 데이터
```javascript
{
  id: number,
  name: string,
  price: number,
  description: string,
  imageUrl: string | null,
  options: [
    {
      id: number,
      name: string,
      additionalPrice: number
    }
  ]
}
```

#### 4.6.2 장바구니 아이템 데이터
```javascript
{
  productId: number,
  productName: string,
  basePrice: number,
  selectedOptions: [
    {
      optionId: number,
      optionName: string,
      additionalPrice: number
    }
  ],
  quantity: number,
  totalPrice: number
}
```

#### 4.6.3 주문 데이터
```javascript
{
  items: [
    {
      productId: number,
      productName: string,
      selectedOptions: [...],
      quantity: number,
      price: number
    }
  ],
  totalAmount: number,
  orderDate: timestamp
}
```

---

## 5. 관리자 화면 PRD

### 5.1 화면 개요
관리자가 주문 현황을 확인하고, 재고를 관리하며, 주문 상태를 변경할 수 있는 관리자 대시보드 화면입니다.

### 5.2 화면 구성 요소

#### 5.2.1 상단 내비게이션 바
- **위치**: 화면 최상단
- **구성 요소**:
  - 왼쪽: "COZY" 텍스트 로고
  - 오른쪽: 탭 형태의 내비게이션 버튼
    - "주문하기" 탭
    - "관리자" 탭 (현재 활성화된 화면, 테두리로 강조 표시)
- **기능**: 
  - "주문하기" 탭 클릭 시 주문하기 화면으로 이동

#### 5.2.2 관리자 대시보드 섹션
- **위치**: 내비게이션 바 하단
- **섹션 제목**: "관리자 대시보드"
- **구성 요소**:
  - 주문 현황 요약 정보
    - 형식: "총 주문 X / 주문 접수 Y / 제조 중 Z / 제조 완료 W"
    - 각 항목의 의미:
      - **총 주문**: 전체 주문 건수
      - **주문 접수**: 접수된 주문 건수
      - **제조 중**: 현재 제조 중인 주문 건수
      - **제조 완료**: 제조가 완료된 주문 건수
  - 실시간으로 업데이트되는 통계 정보

#### 5.2.3 재고 현황 섹션
- **위치**: 관리자 대시보드 섹션 하단
- **섹션 제목**: "재고 현황"
- **레이아웃**: 각 메뉴별로 카드 형태로 나열
- **재고 카드 구성 요소**:
  1. **메뉴명**
     - 각 메뉴의 이름 표시 (예: "아메리카노 (ICE)", "아메리카노 (HOT)", "카페라떼")
  2. **재고 수량**
     - 현재 재고 수량 표시 (예: "10개")
  3. **재고 조절 버튼**
     - "+" 버튼: 재고 증가
     - "-" 버튼: 재고 감소
     - 버튼 클릭 시 즉시 재고 수량이 업데이트됨

#### 5.2.4 주문 현황 섹션
- **위치**: 재고 현황 섹션 하단
- **섹션 제목**: "주문 현황"
- **레이아웃**: 주문 목록을 세로로 나열
- **주문 카드 구성 요소**:
  1. **주문 시간**
     - 주문이 접수된 시간 표시 (예: "7월 31일 13:00")
     - 형식: "월 일 시:분"
  2. **주문 상세 정보**
     - 메뉴명 및 수량 (예: "아메리카노(ICE) x 1")
     - 주문 가격 (예: "4,000원")
     - 옵션 정보가 있는 경우 함께 표시
  3. **주문 상태 액션 버튼**
     - "주문 접수" 버튼: 주문을 접수 상태로 변경
     - 주문 상태에 따라 버튼 텍스트가 변경될 수 있음 (예: "제조 중", "제조 완료")

### 5.3 기능 요구사항

#### 5.3.1 관리자 대시보드
- **FR-018**: 서버에서 주문 통계를 조회하여 대시보드에 표시
- **FR-019**: 총 주문 수, 주문 접수 수, 제조 중 수, 제조 완료 수를 실시간으로 표시
- **FR-020**: 주문 상태가 변경될 때마다 대시보드 통계가 자동으로 업데이트됨

#### 5.3.2 재고 관리
- **FR-021**: 서버에서 모든 메뉴의 재고 정보를 조회하여 표시
- **FR-022**: 각 메뉴별로 현재 재고 수량을 표시
- **FR-023**: "+" 버튼 클릭 시 해당 메뉴의 재고가 1 증가
- **FR-024**: "-" 버튼 클릭 시 해당 메뉴의 재고가 1 감소
- **FR-025**: 재고 수량 변경 시 서버에 즉시 반영됨
- **FR-026**: 재고 수량은 0 이상의 값만 허용 (음수 불가)

#### 5.3.3 주문 현황 관리
- **FR-027**: 서버에서 대기 중인 주문 목록을 조회하여 표시
- **FR-028**: 각 주문은 주문 시간, 메뉴 정보, 수량, 가격을 표시
- **FR-029**: 주문 목록은 최신 주문이 상단에 표시되도록 정렬
- **FR-030**: "주문 접수" 버튼 클릭 시 해당 주문의 상태가 "주문 접수"로 변경됨
- **FR-031**: 주문 상태 변경 시 관리자 대시보드의 통계가 자동으로 업데이트됨
- **FR-032**: 주문 상태 변경 후 주문 목록에서 해당 주문의 상태가 업데이트되어 표시됨
- **FR-033**: 주문이 완료되거나 취소된 경우 목록에서 제거되거나 별도로 표시됨 (선택 사항)

#### 5.3.4 내비게이션
- **FR-034**: "주문하기" 탭 클릭 시 주문하기 화면으로 이동
- **FR-035**: 현재 활성화된 탭은 시각적으로 구분됨 (테두리 강조)

#### 5.3.5 실시간 업데이트
- **FR-036**: 주문이 새로 접수되면 주문 현황 목록에 자동으로 추가됨 (선택 사항: 폴링 또는 웹소켓)
- **FR-037**: 주문 상태 변경 시 관련 통계가 자동으로 업데이트됨

### 5.4 UI/UX 요구사항

#### 5.4.1 레이아웃
- **UX-013**: 각 섹션은 명확하게 구분되어 표시됨
- **UX-014**: 재고 카드와 주문 카드는 카드 형태로 배치되어 가독성이 좋음
- **UX-015**: 모바일 환경에서는 각 카드가 세로로 스크롤 가능하도록 배치

#### 5.4.2 시각적 피드백
- **UX-016**: 버튼 클릭 시 시각적 피드백 제공 (호버 효과, 클릭 효과)
- **UX-017**: 재고 수량 변경 시 즉시 반영되어 표시됨
- **UX-018**: 주문 상태 변경 시 해당 주문 카드의 시각적 상태가 변경됨 (선택 사항: 색상 변경)

#### 5.4.3 통계 표시
- **UX-019**: 관리자 대시보드의 통계는 한눈에 파악하기 쉬운 형태로 표시
- **UX-020**: 각 통계 항목은 명확하게 구분되어 표시

#### 5.4.4 사용성
- **UX-021**: 재고 조절 버튼은 충분한 크기로 제공되어 클릭하기 쉬움
- **UX-022**: 주문 목록이 많을 경우 스크롤 가능하도록 배치
- **UX-023**: 주문 카드의 정보가 명확하게 구분되어 보임
- **UX-024**: 재고가 0에 가까울 경우 경고 표시 (선택 사항: 색상 변경)

### 5.5 상호작용 플로우

#### 5.5.1 재고 관리 플로우
1. 관리자가 화면에 진입하면 현재 재고 현황이 표시됨
2. 관리자가 특정 메뉴의 "+" 또는 "-" 버튼을 클릭
3. 재고 수량이 즉시 업데이트되어 표시됨
4. 변경 사항이 서버에 저장됨

#### 5.5.2 주문 처리 플로우
1. 관리자가 화면에 진입하면 대기 중인 주문 목록이 표시됨
2. 관리자가 특정 주문의 "주문 접수" 버튼을 클릭
3. 해당 주문의 상태가 "주문 접수"로 변경됨
4. 관리자 대시보드의 "주문 접수" 통계가 업데이트됨
5. 주문 카드의 버튼이 다음 상태로 변경될 수 있음 (예: "제조 중")

#### 5.5.3 화면 이동 플로우
1. 관리자가 상단 내비게이션의 "주문하기" 탭을 클릭
2. 주문하기 화면으로 이동

### 5.6 데이터 구조 (참고)

#### 5.6.1 주문 통계 데이터
```javascript
{
  totalOrders: number,
  receivedOrders: number,
  inProgressOrders: number,
  completedOrders: number
}
```

#### 5.6.2 재고 데이터
```javascript
{
  productId: number,
  productName: string,
  stock: number
}
```

#### 5.6.3 주문 상세 데이터
```javascript
{
  orderId: number,
  orderTime: timestamp, // "7월 31일 13:00" 형식으로 포맷
  items: [
    {
      productId: number,
      productName: string,
      selectedOptions: [
        {
          optionId: number,
          optionName: string
        }
      ],
      quantity: number,
      price: number
    }
  ],
  totalAmount: number,
  status: 'pending' | 'received' | 'in_progress' | 'completed' | 'cancelled'
}
```

#### 5.6.4 주문 상태 변경 요청 데이터
```javascript
{
  orderId: number,
  newStatus: 'received' | 'in_progress' | 'completed' | 'cancelled'
}
```

### 5.7 주문 상태 관리

#### 5.7.1 주문 상태 정의
- **pending**: 주문 대기 (주문 접수 전)
- **received**: 주문 접수 (관리자가 주문을 확인함)
- **in_progress**: 제조 중 (현재 제조 진행 중)
- **completed**: 제조 완료 (제조가 완료되어 고객에게 전달 가능)
- **cancelled**: 주문 취소 (선택 사항)

#### 5.7.2 주문 상태 전환
- 주문 접수: pending → received
- 제조 시작: received → in_progress (선택 사항: 별도 버튼 또는 자동 전환)
- 제조 완료: in_progress → completed (선택 사항: 별도 버튼)
- 주문 취소: 모든 상태 → cancelled (선택 사항)

---

## 6. 백엔드 개발 PRD

### 6.1 데이터 모델

#### 6.1.1 Menus (메뉴)
메뉴 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key, Auto Increment): 메뉴 고유 ID
- `name` (VARCHAR, NOT NULL): 메뉴 이름 (예: "아메리카노(ICE)", "카페라떼")
- `price` (INTEGER, NOT NULL): 기본 가격 (원 단위)
- `description` (TEXT): 메뉴 설명
- `image_url` (VARCHAR, NULLABLE): 이미지 URL 경로
- `stock` (INTEGER, NOT NULL, DEFAULT 0): 재고 수량
- `created_at` (TIMESTAMP, NOT NULL): 생성 일시 (UTC)
- `updated_at` (TIMESTAMP, NOT NULL): 수정 일시 (UTC)

**제약 조건:**
- `price`는 0 이상의 값만 허용
- `stock`은 0 이상의 값만 허용

#### 6.1.2 Options (옵션)
메뉴 옵션 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key, Auto Increment): 옵션 고유 ID
- `name` (VARCHAR, NOT NULL): 옵션 이름 (예: "샷 추가", "시럽 추가")
- `additional_price` (INTEGER, NOT NULL, DEFAULT 0): 추가 가격 (원 단위)
- `menu_id` (INTEGER, NOT NULL, Foreign Key → Menus.id): 연결된 메뉴 ID
- `created_at` (TIMESTAMP, NOT NULL): 생성 일시 (UTC)
- `updated_at` (TIMESTAMP, NOT NULL): 수정 일시 (UTC)

**제약 조건:**
- `additional_price`는 0 이상의 값만 허용
- `menu_id`는 Menus 테이블에 존재하는 ID여야 함

#### 6.1.3 Orders (주문)
주문 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key, Auto Increment): 주문 고유 ID
- `order_time` (TIMESTAMP, NOT NULL): 주문 접수 일시 (UTC)
- `status` (VARCHAR, NOT NULL, DEFAULT 'pending'): 주문 상태
  - 가능한 값: 'pending' (주문 접수), 'in_progress' (제조 중), 'completed' (제조 완료)
- `completed_time` (TIMESTAMP, NULLABLE): 제조 완료 일시 (UTC)
- `total_amount` (INTEGER, NOT NULL): 주문 총 금액 (원 단위)
- `created_at` (TIMESTAMP, NOT NULL): 생성 일시 (UTC)
- `updated_at` (TIMESTAMP, NOT NULL): 수정 일시 (UTC)

**제약 조건:**
- `status`는 'pending', 'in_progress', 'completed' 중 하나여야 함
- `total_amount`는 0 이상의 값만 허용
- `completed_time`은 `status`가 'completed'일 때만 값이 있어야 함

#### 6.1.4 OrderItems (주문 상세)
주문에 포함된 메뉴와 옵션 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key, Auto Increment): 주문 상세 고유 ID
- `order_id` (INTEGER, NOT NULL, Foreign Key → Orders.id): 주문 ID
- `menu_id` (INTEGER, NOT NULL, Foreign Key → Menus.id): 메뉴 ID
- `quantity` (INTEGER, NOT NULL): 수량
- `item_price` (INTEGER, NOT NULL): 해당 아이템의 총 가격 (메뉴 가격 + 옵션 가격) × 수량
- `created_at` (TIMESTAMP, NOT NULL): 생성 일시 (UTC)

**제약 조건:**
- `quantity`는 1 이상의 값만 허용
- `item_price`는 0 이상의 값만 허용

#### 6.1.5 OrderItemOptions (주문 상세 옵션)
주문 상세에 포함된 옵션 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key, Auto Increment): 주문 상세 옵션 고유 ID
- `order_item_id` (INTEGER, NOT NULL, Foreign Key → OrderItems.id): 주문 상세 ID
- `option_id` (INTEGER, NOT NULL, Foreign Key → Options.id): 옵션 ID
- `created_at` (TIMESTAMP, NOT NULL): 생성 일시 (UTC)

#### 6.1.6 Settings (설정)
시스템 설정 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key, Auto Increment): 설정 고유 ID
- `key` (VARCHAR, NOT NULL, UNIQUE): 설정 키 (예: 'admin_password')
- `value` (TEXT, NOT NULL): 설정 값 (비밀번호의 경우 해시된 값)
- `changed_at` (TIMESTAMP, NOT NULL): 변경 일시 (UTC)
- `created_at` (TIMESTAMP, NOT NULL): 생성 일시 (UTC)
- `updated_at` (TIMESTAMP, NOT NULL): 수정 일시 (UTC)

**초기 데이터:**
- `key`: 'admin_password'
- `value`: '000000' (평문 저장 또는 해시)
- `changed_at`: 초기 생성 시각

**비밀번호 변경 이력:**
- 비밀번호가 변경될 때마다 새로운 레코드가 추가됨 (누적 저장)
- 가장 최근 `changed_at` 값을 가진 레코드가 현재 비밀번호

### 6.2 데이터 스키마를 위한 사용자 흐름

#### 6.2.1 메뉴 목록 조회 및 표시
1. 사용자가 "시작하기" 또는 "주문하기" 버튼 클릭
2. 프론트엔드에서 `GET /api/menus` API 호출
3. 백엔드에서 Menus 테이블에서 모든 메뉴 조회
4. 각 메뉴에 연결된 Options를 조회하여 함께 반환
5. 프론트엔드에서 메뉴 목록을 화면에 표시
6. 재고 수량(`stock`)은 관리자 화면에만 표시
7. 주문하기 화면에서는 재고 수량에 따라:
   - 재고가 0인 경우: "품절" 버튼 표시 및 비활성화
   - 재고가 10 이하인 경우: "재고가 N개 남았습니다." 메시지 표시

#### 6.2.2 장바구니에 메뉴 추가
1. 사용자가 메뉴 카드에서 옵션 선택 (선택 사항)
2. 사용자가 "담기" 버튼 클릭
3. 프론트엔드에서 선택된 메뉴와 옵션 정보를 장바구니 상태에 추가
4. 장바구니에 동일한 메뉴+옵션 조합이 있으면 수량 증가
5. 장바구니 UI에 선택 정보 표시

#### 6.2.3 주문 생성
1. 사용자가 장바구니에서 "주문하기" 버튼 클릭
2. 프론트엔드에서 `POST /api/orders` API 호출
3. 요청 데이터:
   ```json
   {
     "items": [
       {
         "menu_id": 1,
         "quantity": 2,
         "option_ids": [1, 2],
         "item_price": 9000
       }
     ],
     "total_amount": 9000
   }
   ```
4. 백엔드에서:
   - Orders 테이블에 주문 레코드 생성 (`order_time` = 현재 UTC 시각, `status` = 'pending')
   - 각 아이템에 대해 OrderItems 레코드 생성
   - 각 옵션에 대해 OrderItemOptions 레코드 생성
   - 각 메뉴의 재고 수량 차감 (Menus 테이블의 `stock` 필드 업데이트)
   - 재고 부족 시 오류 반환
5. 생성된 주문 ID 반환
6. 프론트엔드에서 장바구니 초기화 및 주문 완료 메시지 표시

#### 6.2.4 주문 현황 조회 및 상태 변경
1. 관리자가 관리자 화면 진입
2. 프론트엔드에서 `GET /api/orders` API 호출
3. 백엔드에서 Orders 테이블 조회:
   - "진행 중" 탭: `status`가 'pending' 또는 'in_progress'인 주문
   - "완료" 탭: `status`가 'completed'인 주문
4. 각 주문의 OrderItems와 OrderItemOptions 조회하여 함께 반환
5. 프론트엔드에서 주문 목록 표시
6. 관리자가 "제조 시작" 버튼 클릭:
   - 프론트엔드에서 `PATCH /api/orders/:orderId` API 호출
   - 요청 데이터: `{ "status": "in_progress" }`
   - 백엔드에서 Orders 테이블의 `status` 필드 업데이트
7. 관리자가 "제조 완료" 버튼 클릭:
   - 프론트엔드에서 `PATCH /api/orders/:orderId` API 호출
   - 요청 데이터: `{ "status": "completed" }`
   - 백엔드에서 Orders 테이블의 `status`를 'completed'로, `completed_time`을 현재 UTC 시각으로 업데이트
8. 주문 목록 자동 갱신

#### 6.2.5 재고 관리
1. 관리자가 재고 현황 섹션에서 "+" 또는 "-" 버튼 클릭
2. 프론트엔드에서 `PATCH /api/menus/:menuId/stock` API 호출
3. 요청 데이터: `{ "change": 1 }` 또는 `{ "change": -1 }`
4. 백엔드에서 Menus 테이블의 `stock` 필드 업데이트
5. 업데이트된 재고 수량 반환
6. 프론트엔드에서 재고 현황 UI 업데이트

#### 6.2.6 관리자 비밀번호 인증
1. 관리자가 "관리자" 버튼 클릭
2. 프론트엔드에서 비밀번호 입력 모달 표시
3. 사용자가 비밀번호 입력 후 확인 버튼 클릭
4. 프론트엔드에서 `POST /api/auth/admin` API 호출
5. 요청 데이터: `{ "password": "000000" }`
6. 백엔드에서:
   - Settings 테이블에서 `key`가 'admin_password'인 레코드 조회
   - `changed_at`이 가장 최근인 레코드의 `value`와 비교
   - 일치하면 인증 성공, 불일치하면 오류 반환
7. 프론트엔드에서 인증 성공 시 관리자 화면 표시, 실패 시 오류 메시지 표시

#### 6.2.7 관리자 비밀번호 변경
1. 관리자가 관리자 화면에서 설정 아이콘 클릭
2. 프론트엔드에서 비밀번호 변경 화면 표시
3. 사용자가 이전 비밀번호, 새 비밀번호, 새 비밀번호 확인 입력
4. 프론트엔드에서 `PATCH /api/settings/admin-password` API 호출
5. 요청 데이터:
   ```json
   {
     "old_password": "000000",
     "new_password": "123456"
   }
   ```
6. 백엔드에서:
   - Settings 테이블에서 가장 최근 `changed_at`을 가진 'admin_password' 레코드 조회
   - 이전 비밀번호 일치 확인
   - 새 비밀번호를 Settings 테이블에 새 레코드로 추가 (`changed_at` = 현재 UTC 시각)
7. 변경 완료 메시지 반환

### 6.3 API 설계

#### 6.3.1 메뉴 관련 API

##### GET /api/menus
메뉴 목록을 조회합니다.

**요청:**
- Method: GET
- Headers: 없음
- Body: 없음

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "price": 4000,
      "description": "간단한 설명...",
      "image_url": "https://images.unsplash.com/...",
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

**에러 응답:**
```json
{
  "success": false,
  "error": "메뉴 조회 중 오류가 발생했습니다."
}
```

##### GET /api/menus/:menuId
특정 메뉴의 상세 정보를 조회합니다.

**요청:**
- Method: GET
- Path Parameters:
  - `menuId` (INTEGER): 메뉴 ID

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "아메리카노(ICE)",
    "price": 4000,
    "description": "간단한 설명...",
    "image_url": "https://images.unsplash.com/...",
    "stock": 10,
    "options": [...]
  }
}
```

##### PATCH /api/menus/:menuId/stock
메뉴의 재고 수량을 변경합니다.

**요청:**
- Method: PATCH
- Path Parameters:
  - `menuId` (INTEGER): 메뉴 ID
- Body:
  ```json
  {
    "change": 1
  }
  ```
  - `change` (INTEGER): 재고 변경량 (양수: 증가, 음수: 감소)

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "stock": 11
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": "재고는 0 이상이어야 합니다."
}
```

#### 6.3.2 주문 관련 API

##### POST /api/orders
새 주문을 생성합니다.

**요청:**
- Method: POST
- Body:
  ```json
  {
    "items": [
      {
        "menu_id": 1,
        "quantity": 2,
        "option_ids": [1, 2],
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
    "order_time": "2026-01-26T13:30:45.123Z",
    "status": "pending",
    "total_amount": 9000
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": "재고가 부족합니다: 아메리카노(ICE) (재고: 1개, 주문: 2개)"
}
```

**비즈니스 로직:**
1. 각 아이템의 메뉴 재고 확인
2. 재고 부족 시 오류 반환
3. Orders 테이블에 주문 레코드 생성 (`order_time` = 현재 UTC 시각)
4. OrderItems 테이블에 주문 상세 레코드 생성
5. OrderItemOptions 테이블에 옵션 레코드 생성
6. Menus 테이블의 재고 수량 차감

##### GET /api/orders
주문 목록을 조회합니다.

**요청:**
- Method: GET
- Query Parameters (선택):
  - `status` (STRING): 주문 상태 필터 ('pending', 'in_progress', 'completed')
  - `tab` (STRING): 탭 구분 ('in-progress', 'completed')

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_time": "2026-01-26T13:30:45.123Z",
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

**정렬:**
- "진행 중" 탭: `order_time` 오름차순
- "완료" 탭: `completed_time` 내림차순 (없으면 `order_time` 내림차순)

##### GET /api/orders/:orderId
특정 주문의 상세 정보를 조회합니다.

**요청:**
- Method: GET
- Path Parameters:
  - `orderId` (INTEGER): 주문 ID

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_time": "2026-01-26T13:30:45.123Z",
    "completed_time": "2026-01-26T13:35:20.456Z",
    "status": "completed",
    "total_amount": 9000,
    "items": [...]
  }
}
```

##### PATCH /api/orders/:orderId
주문 상태를 변경합니다.

**요청:**
- Method: PATCH
- Path Parameters:
  - `orderId` (INTEGER): 주문 ID
- Body:
  ```json
  {
    "status": "in_progress"
  }
  ```
  또는
  ```json
  {
    "status": "completed"
  }
  ```

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

**비즈니스 로직:**
- `status`가 'completed'로 변경될 때 `completed_time`을 현재 UTC 시각으로 설정
- 상태 변경은 다음 순서만 허용:
  - 'pending' → 'in_progress'
  - 'in_progress' → 'completed'

#### 6.3.3 인증 관련 API

##### POST /api/auth/admin
관리자 비밀번호 인증을 수행합니다.

**요청:**
- Method: POST
- Body:
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

**에러 응답:**
```json
{
  "success": false,
  "error": "비밀번호가 일치하지 않습니다."
}
```

**비즈니스 로직:**
1. Settings 테이블에서 `key` = 'admin_password'인 레코드 조회
2. `changed_at`이 가장 최근인 레코드 선택
3. 입력된 비밀번호와 `value` 비교
4. 일치하면 성공, 불일치하면 오류

#### 6.3.4 설정 관련 API

##### PATCH /api/settings/admin-password
관리자 비밀번호를 변경합니다.

**요청:**
- Method: PATCH
- Body:
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
  "message": "비밀번호가 변경되었습니다.",
  "data": {
    "changed_at": "2026-01-26T14:00:00.000Z"
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": "이전 비밀번호가 일치하지 않습니다."
}
```

또는

```json
{
  "success": false,
  "error": "새 비밀번호는 6자리여야 합니다."
}
```

**비즈니스 로직:**
1. Settings 테이블에서 가장 최근 `changed_at`을 가진 'admin_password' 레코드 조회
2. 이전 비밀번호 일치 확인
3. 새 비밀번호 유효성 검사 (6자리)
4. 새 비밀번호를 Settings 테이블에 새 레코드로 추가 (`changed_at` = 현재 UTC 시각)
5. 기존 레코드는 삭제하지 않고 유지 (이력 관리)

### 6.4 시간대 처리

#### 6.4.1 데이터베이스 저장
- 모든 일시(`order_time`, `completed_time`, `changed_at` 등)는 **UTC (그리니치 천문대 시각)** 기준으로 저장
- PostgreSQL의 `TIMESTAMP` 타입 사용 (또는 `TIMESTAMPTZ` 사용 권장)

#### 6.4.2 프론트엔드 표시
- API 응답에서 받은 UTC 시각을 클라이언트의 로컬 시간대로 변환하여 표시
- JavaScript의 `Date` 객체를 사용하여 자동 변환
- 표시 형식: "월 일 시:분:초" (예: "1월 26일 13:30:45")

#### 6.4.3 예시
- 데이터베이스 저장: `2026-01-26T04:30:45.123Z` (UTC)
- 한국 시간대 표시: `2026-01-26T13:30:45` (UTC+9)
- 화면 표시: "1월 26일 13:30:45"

### 6.5 에러 처리

#### 6.5.1 공통 에러 응답 형식
```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE" // 선택 사항
}
```

#### 6.5.2 HTTP 상태 코드
- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청 (유효성 검사 실패)
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

#### 6.5.3 주요 에러 케이스
1. **재고 부족**: 주문 시 재고가 부족한 경우
2. **존재하지 않는 메뉴**: 잘못된 메뉴 ID로 요청한 경우
3. **존재하지 않는 주문**: 잘못된 주문 ID로 요청한 경우
4. **비밀번호 불일치**: 관리자 인증 실패
5. **유효하지 않은 상태 변경**: 허용되지 않은 주문 상태 전환

### 6.6 데이터베이스 초기화

#### 6.6.1 초기 데이터
다음 데이터를 데이터베이스에 미리 삽입해야 합니다:

**Menus:**
- 아메리카노(ICE): 가격 4000원, 재고 10개
- 아메리카노(HOT): 가격 4000원, 재고 15개
- 카페라떼: 가격 5000원, 재고 8개
- 카푸치노: 가격 5500원, 재고 3개
- 바닐라라떼: 가격 6000원, 재고 0개
- 카라멜마키아토: 가격 6500원, 재고 12개

**Options:**
- 각 메뉴에 "샷 추가" 옵션 (추가 가격 500원)
- 각 메뉴에 "시럽 추가" 옵션 (추가 가격 0원)

**Settings:**
- `key`: 'admin_password'
- `value`: '000000'
- `changed_at`: 초기 생성 시각