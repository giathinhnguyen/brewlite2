# TASK 1.2: YÊU CẦU CHỨC NĂNG VÀ PHI CHỨC NĂNG (SRS RÚT GỌN)

Tài liệu xác định các yêu cầu chức năng (FR) và phi chức năng (NFR) của hệ thống BrewLite, gắn mã định danh, mức độ ưu tiên theo mô hình MoSCoW và tiêu chí chấp nhận có thể kiểm chứng.

Mức ưu tiên Must là bắt buộc trong MVP; Should là nên có; Could là có thể bổ sung; Won’t (MVP) là không thực hiện ở giai đoạn MVP.

## 1. Yêu cầu chức năng

### 1.1. Thực đơn và chi tiết sản phẩm

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| FR-01 | Must | Yêu cầu: Hiển thị danh sách sản phẩm công khai kèm hình ảnh, tên món, giá bán cơ bản và trạng thái khả dụng.<br>Tiêu chí chấp nhận: Khách hàng chưa đăng nhập hoặc đã đăng nhập đều có thể xem thực đơn. Sản phẩm ngừng kinh doanh hoặc hết hàng phải hiển thị rõ trạng thái và không cho phép chọn. |
| FR-02 | Must | Yêu cầu: Cho phép xem chi tiết sản phẩm và tùy chỉnh kích cỡ, món thêm, độ ngọt và lượng đá.<br>Tiêu chí chấp nhận: Hệ thống cập nhật giá ngay khi khách hàng thay đổi lựa chọn, theo công thức: Giá món = Giá theo kích cỡ + Tổng giá món thêm. |

### 1.2. Giỏ hàng

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| FR-03 | Must | Yêu cầu: Yêu cầu người dùng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.<br>Tiêu chí chấp nhận: Nếu khách hàng chưa đăng nhập chọn “Thêm vào giỏ”, hệ thống chặn thao tác và hiển thị thông báo hoặc chuyển hướng đến màn hình đăng nhập. |
| FR-04 | Must | Yêu cầu: Cho phép thay đổi số lượng, xóa món và nhập ghi chú riêng cho mỗi dòng sản phẩm trong giỏ hàng.<br>Tiêu chí chấp nhận: Hai món cùng loại nhưng khác cấu hình hoặc ghi chú phải được lưu thành hai dòng riêng. Tổng tiền được cập nhật ngay khi thay đổi số lượng. |
| FR-05 | Must | Yêu cầu: Cho phép chọn từng dòng sản phẩm hoặc chọn tất cả để tiến hành thanh toán.<br>Tiêu chí chấp nhận: Tổng tiền đặt hàng chỉ được tính trên những dòng sản phẩm khách hàng đã chọn để thanh toán. |

### 1.3. Xác thực người dùng

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| FR-06 | Must | Yêu cầu: Đăng ký tài khoản bằng email và mật khẩu hoặc thông qua Google OAuth2.<br>Tiêu chí chấp nhận: Kiểm tra email duy nhất; mật khẩu được băm bằng Argon2id hoặc bcrypt có salt trước khi lưu trữ. |
| FR-07 | Must | Yêu cầu: Đăng nhập và duy trì phiên làm việc bằng JWT.<br>Tiêu chí chấp nhận: Sau khi xác thực thành công, hệ thống cấp JWT còn hiệu lực; khách hàng không phải đăng nhập lại khi thao tác trong cùng phiên hợp lệ. |

### 1.4. Đặt hàng và kiểm soát tồn kho

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| FR-08 | Must | Yêu cầu: Tạo đơn hàng và giữ chỗ tồn kho an toàn khi có nhiều yêu cầu đồng thời bằng cơ chế khóa lạc quan.<br>Tiêu chí chấp nhận: Backend kiểm tra và cập nhật tồn kho một cách nguyên tử. Nếu đủ hàng, giữ chỗ số lượng trong thời hạn 5’; nếu không đủ hàng, từ chối tạo đơn và yêu cầu điều chỉnh giỏ. |
| FR-09 | Must | Yêu cầu: Tự động giải phóng tồn kho khi đơn hàng quá hạn thanh toán hoặc bị hủy.<br>Tiêu chí chấp nhận: Khi khách hủy đơn hoặc đơn chưa thanh toán hết thời hạn 5’, toàn bộ số lượng đang giữ chỗ của đơn phải được trả về tồn kho khả dụng. |

### 1.5. Thanh toán không tiền mặt

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| FR-10 | Must | Yêu cầu: Khởi tạo giao dịch thanh toán không tiền mặt với khóa Idempotency-Key.<br>Tiêu chí chấp nhận: Backend áp dụng khóa định danh giao dịch để một yêu cầu được gửi lặp lại không tạo thành hai lần thu tiền. |
| FR-11 | Must | Yêu cầu: Tiếp nhận và xử lý thông báo kết quả thanh toán từ cổng thanh toán qua Webhook.<br>Tiêu chí chấp nhận: Xác minh chữ ký hoặc nguồn đáng tin cậy của Webhook; khi thanh toán thành công, đơn chuyển sang trạng thái PAID và tồn kho được ghi nhận xuất chính thức, không xuất trùng. |

### 1.6. Lịch sử đơn hàng

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| FR-12 | Must | Yêu cầu: Cho phép khách hàng xem danh sách và chi tiết các đơn hàng của chính mình.<br>Tiêu chí chấp nhận: Chỉ trả về đơn thuộc tài khoản đang đăng nhập; hiển thị mã đơn, thời gian đặt, các món, tổng tiền thực trả và trạng thái thanh toán. |

### 1.7. Chức năng mở rộng ngoài MVP

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| FR-13 | Won’t | Yêu cầu: Tra cứu và áp dụng mã khuyến mãi.<br>Tiêu chí chấp nhận: Ở giai đoạn mở rộng: hỗ trợ mã giảm giá cố định hoặc theo phần trăm và kiểm tra điều kiện áp dụng tại Backend. |
| FR-14 | Won’t | Yêu cầu: Tích điểm và đổi điểm thưởng để nhận món có giá 0 đồng.<br>Tiêu chí chấp nhận: Ở giai đoạn mở rộng: tự động cộng điểm sau khi đơn ở trạng thái PAID và giới hạn tối đa một món đổi điểm trong giỏ hàng. |

## 2. Yêu cầu phi chức năng

### 2.1. Hiệu năng

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| NFR-01 | Must | Yêu cầu: Thời gian phản hồi của API thực đơn và tùy chỉnh sản phẩm phải dưới 500ms trong điều kiện vận hành bình thường.<br>Tiêu chí chấp nhận: Kiểm thử tải xác nhận ít nhất 90% yêu cầu xem thực đơn có thời gian phản hồi dưới 500ms. |
| NFR-02 | Must | Yêu cầu: Hỗ trợ xử lý các giao dịch đặt hàng và giữ chỗ tồn kho khi nhiều yêu cầu được gửi đồng thời.<br>Tiêu chí chấp nhận: Với 100 yêu cầu đồng thời đặt cùng một sản phẩm gần hết hàng, hệ thống vẫn bảo đảm tính nhất quán, không bán vượt tồn kho và không làm dịch vụ ngừng hoạt động. |

### 2.2. Bảo mật

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| NFR-03 | Must | Yêu cầu: Không lưu mật khẩu dưới dạng văn bản thuần hoặc chỉ băm SHA-256; phải dùng Argon2id hoặc bcrypt có salt.<br>Tiêu chí chấp nhận: Kiểm tra mã nguồn và cơ sở dữ liệu để xác nhận mọi mật khẩu lưu trữ đều sử dụng hàm băm phù hợp. |
| NFR-04 | Must | Yêu cầu: Mọi kết nối truyền dữ liệu và API phải sử dụng HTTPS với TLS 1.2 trở lên.<br>Tiêu chí chấp nhận: Không cho phép truyền dữ liệu nhạy cảm qua HTTP không mã hóa; JWT được gửi an toàn qua tiêu đề Authorization. |

### 2.3. Tính khả dụng và độ tin cậy

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| NFR-05 | Must | Yêu cầu: Bảo đảm xử lý lặp an toàn đối với thanh toán và cập nhật trạng thái đơn hàng.<br>Tiêu chí chấp nhận: Khi cùng một Webhook báo thanh toán thành công được gửi 5 lần, đơn chỉ chuyển sang PAID một lần và tồn kho không bị xuất lặp. |

### 2.4. Khả năng triển khai và bảo trì

| Mã | Ưu tiên | Yêu cầu và tiêu chí chấp nhận |
| --- | --- | --- |
| NFR-06 | Should | Yêu cầu: Đóng gói Backend và Frontend bằng Docker, hỗ trợ triển khai môi trường ứng dụng tự động.<br>Tiêu chí chấp nhận: Có thể khởi chạy môi trường ứng dụng bằng lệnh docker compose up. |
| NFR-07 | Should | Yêu cầu: Ghi nhật ký các nghiệp vụ quan trọng như đặt hàng, thanh toán và thay đổi tồn kho để hỗ trợ đối soát.<br>Tiêu chí chấp nhận: Mọi giao dịch thanh toán và thay đổi tồn kho có nhật ký thể hiện thời điểm, mã đơn, mã người dùng và mã giao dịch. |

## 3. Sơ đồ Use Case tổng quát hệ thống BrewLite

Sơ đồ dưới đây mô tả các tương tác chính của khách hàng và các dịch vụ bên ngoài trong phạm vi MVP. Chức năng khuyến mãi, tích điểm và đổi thưởng thuộc phạm vi mở rộng nên không thể hiện trong sơ đồ.

![Sơ đồ Use Case tổng quát hệ thống BrewLite](assets/task-1.2-overview-use-case.png)

Hình 1. Sơ đồ Use Case tổng quát của BrewLite (phạm vi MVP)
