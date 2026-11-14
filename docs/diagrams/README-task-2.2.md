# Task 2.2 - Đặt và thanh toán đơn hàng

Bản chỉnh ngày 14/11/2026. Tài liệu đối chiếu: Assignment2-BrewLite (2).pdf, mục 4.2 (trang in số 3, trang PDF thứ 4) và Task 1.3_Đặc tả UseCase_Mua Hàng và thanh toán.docx.

## Bộ nộp chính

- `sequence-checkout.puml`: nguồn PlantUML có thể chỉnh sửa.
- `sequence-checkout.svg`: ảnh vector được render trực tiếp từ nguồn trên. Mở trong trình duyệt rồi phóng to để đọc; không co toàn bộ sơ đồ dài vào một trang A4.
- Hai sơ đồ `sequence-order` (tổng quan) và `sequence-account` (tài khoản) là tài liệu bổ trợ; không thay thế sơ đồ checkout.
- `sequence-payment` là bản cũ, được thay thế bởi `sequence-checkout` và gỡ khỏi repository để tránh nộp nhầm.

## Đối chiếu tiêu chí bắt buộc Task 2.2

| Tiêu chí | Vị trí trên sơ đồ mới |
|---|---|
| Customer → React/Vite UI → NestJS API → Database → Payment Service | Đủ 5 vai trò lifeline; tên frontend được điều chỉnh theo công nghệ thực tế của nhóm |
| Request/response và thứ tự API | Mũi tên request / response, đánh số, 6 chặng nghiệp vụ |
| Kiểm tra JWT và validate dữ liệu | Chặng 1 và 3; kiểm tra lại quyền sở hữu khi thanh toán, đối soát và đọc lịch sử |
| Transaction tạo đơn và tồn kho | Transaction A: tạo đơn + giữ nguyên liệu; rollback khi hết hàng / giá đổi |
| Transaction cập nhật sau thanh toán | Transaction B: payment + order + kho + điểm; Transaction C: thất bại và giải phóng giữ chỗ |
| alt thành công / thất bại | Chặng 5; chặng 6 hiển thị kết quả tương ứng |
| Idempotency khi client gửi lại | Chặng 4: cùng khóa/cùng nội dung trả lại giao dịch cũ; cùng khóa/khác nội dung bị từ chối; unique/lock chống đồng thời |
| Thông báo cuối cùng cho khách | Chặng 6: PAID / PAYMENT_FAILED / chờ xác nhận, hóa đơn và lịch sử |
| Activation Bar | Các khoảng activate/deactivate trên UI, API, Database và Payment Service |

## Bao phủ đặc tả Task 1.3

- Luồng chính: xem menu, chọn tùy chọn, cập nhật giỏ, đặt hàng, giữ chỗ, ví/thẻ, xác minh thanh toán, trừ kho, cộng điểm, hóa đơn, lịch sử.
- Sub-Flow 1: mã hợp lệ giảm giá; mã sai/hết hạn không áp dụng giảm và cho sửa/bỏ mã.
- Alt-Flow 1: cổng xác nhận thất bại hoặc khách hủy; thông báo lỗi, giải phóng giữ chỗ, cho đổi phương thức hoặc hủy đơn. Thử lại phải kiểm tra và giữ kho lại, không giả định kho vẫn còn.
- Alt-Flow 2: hết nguyên liệu lúc đặt hàng → rollback, không tạo đơn, yêu cầu cập nhật giỏ.
- Alt-Flow 3: không nhận kết quả ngay → chờ callback/truy vấn; lỗi mạng không đồng nghĩa tiền chưa bị trừ.
- Bổ sung kiểm soát: JWT thiếu/hết hạn, dữ liệu sai, quyền sở hữu, giá thay đổi, chữ ký kết quả sai, callback trùng và kết quả đến muộn.

## Những chỗ nhóm cần thống nhất với mã nguồn trước khi nghiệm thu

Đây là mô hình theo yêu cầu được gửi, không phải tuyên bố mọi nhánh đều đã được hiện thực đúng như sơ đồ.

1. Theo yêu cầu của nhóm, sơ đồ dùng React/Vite UI đúng frontend hiện tại; backend NestJS và PostgreSQL. Assignment ghi Next.js, nên đây là điều chỉnh công nghệ theo triển khai thực tế, không phải xác nhận đã đáp ứng ràng buộc Next.js trong đề.
2. Đặc tả Task 1.3 yêu cầu giải phóng giữ chỗ khi xác nhận thanh toán thất bại. Code hiện giữ kho còn hạn để thử lại. Sơ đồ theo đặc tả: giải phóng khi thất bại, kiểm tra và giữ lại khi thử phương thức khác. Nhóm cần sửa code hoặc chỉnh đặc tả có lý do và chấp thuận; không dùng hai chính sách mâu thuẫn để nghiệm thu.
3. Đặc tả yêu cầu đăng nhập để thao tác giỏ; code có thêm giỏ khách. Sơ đồ chính chỉ mô tả phạm vi đăng nhập theo tài liệu đã gửi.
4. Bản DOCX gửi chưa có mã FR liên kết hoặc mã use-case rõ ràng. Không tự gán mã FR để tránh sai SRS; nhóm cần bổ sung mã thật vào traceability-matrix.
5. Hoàn tiền sau PAID, giới hạn hủy 2 phút và mô phỏng hoàn tiền là use-case mở rộng, không nằm trong luồng mua hàng được đặc tả ở DOCX này. Vì vậy không ghép vào sơ đồ checkout nộp Task 2.2.

Các URI được dùng để giúp đối chiếu API hiện tại; nghiệp vụ transaction/giữ kho vẫn phải kiểm tra theo chính sách cuối cùng nhóm thống nhất.
