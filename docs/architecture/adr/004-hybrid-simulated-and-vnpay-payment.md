- **Tiêu đề**: ADR-004: Kiến trúc thanh toán kết hợp Mô phỏng (Demo) và Cổng VNPay Sandbox có Idempotency
- **Trạng thái**: Accepted
- **Bối cảnh**: Đề bài yêu cầu có dịch vụ thanh toán mô phỏng Ví/Thẻ để kiểm thử đầy đủ các nhánh thành công/thất bại/thử lại, đồng thời hệ thống cần sẵn sàng cho tích hợp cổng thanh toán thực tế và chống xử lý trùng khi mạng lỗi.
- **Quyết định**:
  1. Thiết kế `PaymentsModule` hỗ trợ song song: **Chuyển khoản mô phỏng + VietQR**, **Thẻ mô phỏng (`CARD_DEMO`)**, và **VNPay Sandbox (HMAC-SHA512 IPN + QueryDR)**.
  2. Khóa các API mô phỏng bằng biến môi trường (`BANK_TRANSFER_DEMO_ENABLED`, `CARD_DEMO_ENABLED`) và tự động vô hiệu hóa khi `NODE_ENV=production`.
  3. Bắt buộc sử dụng `idempotencyKey` cho mọi yêu cầu tạo thanh toán và kiểm tra trạng thái đơn để ngăn cộng điểm/trừ kho hai lần.
- **Hệ quả**:
  - *Tích cực*: Dễ dàng chạy E2E Test tự động và demo trực tiếp mọi kịch bản (thành công, thất bại, hủy, hết hạn, callback trễ) mà không phụ thuộc trạng thái bảo trì của VNPay Sandbox.
  - *Đánh đổi*: Cần quản lý chặt chẽ biến môi trường giữa môi trường Demo/Staging và Production.