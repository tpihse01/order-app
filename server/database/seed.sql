-- Coffee Order App Initial Data

-- 초기 메뉴 데이터 삽입
INSERT INTO menus (name, price, description, image_url, stock) VALUES
('아메리카노(ICE)', 4000, '간단한 설명...', 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=600&h=600&fit=crop&q=80&auto=format', 10),
('아메리카노(HOT)', 4000, '간단한 설명...', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop&q=80&auto=format', 15),
('카페라떼', 5000, '간단한 설명...', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=600&fit=crop&q=80&auto=format', 8),
('카푸치노', 5500, '간단한 설명...', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=600&fit=crop&q=80&auto=format', 3),
('바닐라라떼', 6000, '간단한 설명...', '/vanilla-latte.png', 0),
('카라멜마키아토', 6500, '간단한 설명...', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&q=80&auto=format', 12)
ON CONFLICT DO NOTHING;

-- 초기 옵션 데이터 삽입 (각 메뉴마다 "샷 추가"와 "시럽 추가" 옵션)
-- 메뉴 ID를 동적으로 가져와서 삽입
INSERT INTO options (name, additional_price, menu_id)
SELECT '샷 추가', 500, id FROM menus
ON CONFLICT DO NOTHING;

INSERT INTO options (name, additional_price, menu_id)
SELECT '시럽 추가', 0, id FROM menus
ON CONFLICT DO NOTHING;

-- 초기 관리자 비밀번호 설정
INSERT INTO settings (key, value, changed_at) VALUES
('admin_password', '000000', CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;
