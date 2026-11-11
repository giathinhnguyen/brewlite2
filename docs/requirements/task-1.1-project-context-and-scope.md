# TASK 1.1: BỐI CẢNH, STAKEHOLDER VÀ PHẠM VI DỰ ÁN BREWLITE

## 1. Vấn đề nghiệp vụ BrewLite cần giải quyết

Hệ thống BrewLite được xây dựng nhằm giải quyết các vấn đề nghiệp vụ thực tế sau:

- Thời gian chờ đợi khi gọi món và thanh toán
- Khó khăn trong việc ghi nhận yêu cầu tùy chỉnh đồ uống
- Quy trình đặt hàng và thanh toán chưa được đồng bộ
- Khó khăn trong quản lý khuyến mãi và tính toán số tiền phải trả
- Khó khăn trong kiểm soát số lượng sản phẩm còn lại
- Hạn chế trong quản lý điểm thưởng và đổi thưởng
- Thiếu cơ chế quản lý tài khoản và thông tin khách hàng thống nhất

## 2. Bảng Stakeholder

| Stakeholder | Mục tiêu | Kỳ vọng đối với BrewLite |
| --- | --- | --- |
| Khách hàng | Trải nghiệm đặt đồ uống nhanh chóng, tùy chỉnh linh hoạt và thanh toán tiện lợi. | Giao diện thân thiện, tính toán giá chính xác, thanh toán an toàn, không bị mất đơn hay trừ tiền trùng. |
| Nhân viên quầy | Tiếp nhận và xử lý đơn hàng chính xác, giảm áp lực ghi nhận đơn thủ công. | Đơn hàng sau khi thanh toán thành công được chuyển thông tin rõ ràng, không bị chênh lệch tồn kho. |
| Quản lý cửa hàng | Kiểm soát tồn kho, doanh thu, hiệu quả chương trình khuyến mãi và lượng khách hàng thân thiết. | Báo cáo chính xác, quản lý trạng thái kinh doanh/tồn kho theo thời gian thực, chống thất thoát. |
| Giảng viên / Khách hàng nghiệm thu | Đánh giá chất lượng phân tích thiết kế, kiến trúc hệ thống và mức độ hoàn thiện của sản phẩm. | Hệ thống tuân thủ đúng yêu cầu nghiệp vụ, xử lý ngầm Backend chặt chẽ, tài liệu thiết kế đầy đủ. |
| Nhóm phát triển | Xây dựng hệ thống ổn định, dễ bảo trì, mở rộng và hoàn thành dự án đúng hạn. | Kiến trúc mã nguồn rõ ràng, API đạt chuẩn RESTful, có các cơ chế chống nghẽn và idempotency. |
| Đơn vị thanh toán | Cung cấp cổng thanh toán an toàn, tích hợp ổn định và đối soát giao dịch minh bạch. | Phản hồi Webhook chính xác, xử lý các giao dịch nghi vấn/thất bại theo đúng chuẩn bảo mật. |

## 3. Bảng Phạm vi dự án

### 3.1. Phạm vi trong MVP

| STT | Phân hệ / Chức năng | Chi tiết thực hiện |
| --- | --- | --- |
| 1 | Thực đơn & Tùy chỉnh | Xem danh sách món, chi tiết sản phẩm (Size, Topping, Độ ngọt, Lượng đá), tính giá tự động. |
| 2 | Quản lý Giỏ hàng | Thêm/xóa/sửa số lượng, ghi chú từng món, chọn các món cần thanh toán, bắt buộc đăng nhập để thêm giỏ hàng. |
| 3 | Xác thực người dùng | Đăng ký/Đăng nhập bằng Email + Mật khẩu (băm Argon2id/bcrypt) và Đăng nhập Google OAuth2, cấp JWT. |
| 4 | Đặt hàng & Kiểm soát tồn kho | Tạo đơn hàng, kiểm tra số lượng khả dụng, giữ chỗ tồn kho bằng Optimistic Locking. |
| 5 | Thanh toán không tiền mặt | Kết nối cổng thanh toán, xử lý Webhook, bảo đảm Idempotency chống trừ tiền trùng. |
| 6 | Lịch sử đơn hàng | Xem danh sách đơn hàng đã mua, chi tiết giá, phương thức thanh toán. |

### 3.2. Phạm vi mở rộng & Không thực hiện

- Phạm vi mở rộng:
  + Khuyến mãi & Ưu đãi (Tra cứu mã khuyến mãi, dán mã và tính lại tổng tiền đơn hàng).
  + Tích điểm & Đổi điểm thưởng (Tích điểm tự động sau khi thanh toán, đổi điểm lấy món 0đ).
- Không thực hiện:
  + Đánh giá và nhận xét sản phẩm.
  + Gợi ý món thông minh dựa trên lịch sử mua hàng.

## 4. Giả định, Ràng buộc và Rủi ro ban đầu

### 4.1. Bảng Giả định và Ràng buộc

| Loại | Chi tiết |
| --- | --- |
| Giả định | 1. Khách hàng có kết nối Internet ổn định và sử dụng trình duyệt web hiện đại.<br>2. Cổng thanh toán bên thứ ba hoạt động ổn định và cung cấp API/Webhook đúng chuẩn.<br>3. Khách hàng đã có tài khoản Google hợp lệ nếu chọn đăng nhập qua Google. |
| Ràng buộc | 1. Kiến trúc Backend: Mọi logic nghiệp vụ (tồn kho, giá món, khuyến mãi, tích điểm) phải được xác minh và xử lý tại Backend.<br>2. Bảo mật: Mật khẩu phải được băm bằng bcrypt hoặc Argon2id có Salt, không lưu văn bản thuần.<br>3. Tính nhất quán: Phải đảm bảo Idempotency cho các giao dịch thanh toán và không được bán vượt tồn kho. |

### 4.2. Rủi ro ban đầu và Giải pháp khắc phục

- Rủi ro tranh chấp tồn kho: Khi nhiều người dùng cùng đặt một món sắp hết hàng. Giải pháp: Áp dụng cơ chế Optimistic Locking kết hợp Database Transaction có thời gian giữ chỗ hạn định (Thold).
- Rủi ro thanh toán bất đồng bộ: Khách hàng đã bị trừ tiền nhưng kết nối bị ngắt hoặc Webhook phản hồi chậm. Giải pháp: Quản lý trạng thái giao dịch độc lập, triển khai API đối soát tự động và cơ chế Idempotency Key.
- Rủi ro lạm dụng đổi điểm thưởng: Khách hàng gửi nhiều request đồng thời để đổi điểm lặp lại. Giải pháp: Giữ điểm khả dụng ngay khi chọn đổi, kiểm tra điều kiện nghiêm ngặt ở Backend và giới hạn tối đa 1 món đổi điểm trong giỏ hàng.
