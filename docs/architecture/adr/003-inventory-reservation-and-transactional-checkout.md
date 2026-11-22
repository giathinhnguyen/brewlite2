- **Tiêu đề**: ADR-003: Quản lý tồn kho theo nguyên liệu động và cơ chế giữ chỗ (Reservation) 15 phút khi tạo đơn
- **Trạng thái**: Accepted
- **Bối cảnh**: Đồ uống pha chế có nhiều kích cỡ (S/M/L) và mức đường (0/50/100/120%) dùng chung 26 nguyên liệu. Nếu chỉ quản lý tồn kho tĩnh theo số ly (`stock_quantity`) sẽ dẫn đến sai lệch thực tế và nguy cơ bán vượt tồn kho khi hai khách cùng đặt món cuối cùng.
- **Quyết định**:
  1. Tính khả năng bán động theo công thức nguyên liệu (`available = on_hand - reserved`).
  2. Khi tạo đơn (`POST /api/orders`), khóa nguyên liệu theo thứ tự UUID và tăng `reserved` trong 15 phút (`InventoryStatus.RESERVED`), đồng thời lưu snapshot `reserved_ingredients` vào đơn.
  3. Khi thanh toán thành công mới trừ thật (`on_hand` và `reserved` cùng giảm, chuyển sang `DEDUCTED`). Nếu hủy hoặc quá 15 phút chưa thanh toán, Background Worker tự động hoàn trả `reserved` (`RELEASED`).
- **Hệ quả**:
  - *Tích cực*: Chống triệt để lỗi bán vượt tồn kho (overselling) trong môi trường đồng thời cao; giữ nguyên liệu cho khách trong lúc đang thao tác trên cổng thanh toán.
  - *Đánh đổi*: Phép tính số ly khả dụng phức tạp hơn và cần worker chạy ngầm để giải phóng tồn kho bị giữ bởi các đơn bỏ dở.