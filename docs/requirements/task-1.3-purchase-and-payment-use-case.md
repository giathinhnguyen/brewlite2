# TASK 1.3: ĐẶC TẢ USE CASE MUA HÀNG VÀ THANH TOÁN

Tài liệu mô tả quy trình khách hàng tương tác với hệ thống BrewLite từ khi xem thực đơn đến khi hoàn tất thanh toán không tiền mặt và tra cứu lịch sử đơn hàng. Nội dung được xây dựng theo phạm vi MVP của Task 1.1 và các yêu cầu của Task 1.2. Chức năng khuyến mãi, tích điểm và đổi điểm thưởng được ghi nhận là phạm vi mở rộng, không thuộc tiêu chí nghiệm thu MVP.

## 1. Tổng quan Use Case

### 1.1. Tóm tắt

Use Case Mua hàng và thanh toán mô tả việc khách hàng xem thực đơn, tùy chỉnh đồ uống, quản lý giỏ hàng, chọn món cần thanh toán, đặt hàng và thực hiện thanh toán qua ví điện tử hoặc cổng thanh toán thẻ/ngân hàng. Hệ thống kiểm tra và giữ chỗ tồn kho trước khi thanh toán, xác minh kết quả giao dịch từ đơn vị thanh toán và lưu thông tin đơn hàng vào lịch sử mua hàng. Khách hàng có thể xem thực đơn khi chưa đăng nhập, nhưng phải đăng nhập trước khi thêm món vào giỏ hàng.

### 1.2. Thông tin đặc tả

| Thuộc tính | Nội dung |
| --- | --- |
| Mã Use Case | UC-01 |
| Tên Use Case | Mua hàng và thanh toán |
| Tác nhân chính | Khách hàng |
| Tác nhân phụ | Cổng ví điện tử; ngân hàng hoặc cổng thanh toán thẻ. |
| Mục tiêu | Hoàn tất đặt món và thanh toán không tiền mặt an toàn, ghi nhận đúng đơn hàng và tồn kho. |
| Sự kiện kích hoạt | Khách hàng mở thực đơn để chọn món; quy trình đặt hàng bắt đầu khi khách hàng tiến hành thanh toán các món đã chọn. |
| Mức độ ưu tiên | Must - thuộc phạm vi MVP. |

## 2. Sơ đồ Use Case Mua hàng và thanh toán

Sơ đồ dưới đây thể hiện tác nhân người dùng, các chức năng xem thực đơn, quản lý giỏ hàng, đặt hàng, thanh toán và xem lịch sử; đồng thời minh họa các cổng thanh toán bên ngoài. Chức năng áp dụng khuyến mãi trong sơ đồ là tính năng mở rộng, chưa triển khai trong MVP.

![Sơ đồ Use Case mua hàng và thanh toán](assets/task-1.3-purchase-payment-use-case.png)

Hình 1.1. Sơ đồ Use Case Mua hàng và thanh toán của BrewLite

## 3. Tiền điều kiện

- Hệ thống BrewLite đang hoạt động và có thể kết nối với ít nhất một phương thức thanh toán được tích hợp.
- Khách hàng đã truy cập hệ thống; người dùng chưa đăng nhập vẫn được xem thực đơn và chi tiết sản phẩm.
- Khách hàng phải đăng nhập hợp lệ để thêm sản phẩm vào giỏ hàng, đặt hàng và thanh toán.
- Các món được chọn phải còn khả dụng và có cấu hình hợp lệ tại thời điểm đặt hàng.

## 4. Dòng sự kiện chính

Luồng chính được áp dụng khi khách hàng đặt hàng và thanh toán thành công. Những thao tác phát sinh lỗi hoặc chưa có kết quả thanh toán được mô tả tại Mục 5.

| Bước | Tác nhân | Mô tả sự kiện |
| --- | --- | --- |
| 1 | Khách hàng | Truy cập thực đơn, xem danh sách đồ uống và trạng thái khả dụng. |
| 2 | Khách hàng | Chọn sản phẩm và tùy chỉnh kích thước, topping, độ ngọt, lượng đá; hệ thống hiển thị giá theo cấu hình đã chọn. |
| 3 | Khách hàng | Đăng nhập nếu chưa có phiên hợp lệ, sau đó thêm sản phẩm vào giỏ hàng. |
| 4 | Khách hàng | Kiểm tra giỏ hàng, tăng/giảm số lượng, xóa món, nhập ghi chú và chọn các dòng sản phẩm cần thanh toán. |
| 5 | Hệ thống | Tính lại số tiền của các món được chọn, xác nhận cấu hình và giá bán tại Backend. |
| 6 | Khách hàng / Hệ thống | Khách hàng xác nhận đặt hàng; Backend kiểm tra tồn kho khả dụng, tạo đơn và giữ chỗ số lượng trong thời hạn T nếu đủ điều kiện. |
| 7 | Khách hàng | Chọn thanh toán bằng ví điện tử hoặc thẻ ngân hàng theo các phương thức mà hệ thống hỗ trợ. |
| 8 | Hệ thống / Cổng thanh toán | Khởi tạo giao dịch có khóa chống xử lý trùng, chuyển khách hàng đến luồng xác thực thanh toán phù hợp. |
| 9 | Cổng thanh toán / Hệ thống | Cổng thanh toán trả kết quả; Backend xác minh thông báo giao dịch hợp lệ và cập nhật đơn sang PAID đúng một lần, đồng thời xác nhận khấu trừ tồn kho đã giữ chỗ. |
| 10 | Hệ thống / Khách hàng | Hiển thị kết quả mua hàng thành công, ghi nhận đơn vào lịch sử; khách hàng có thể xem mã đơn, món mua, tổng tiền và trạng thái thanh toán. |

## 5. Dòng sự kiện phụ và ngoại lệ

### 5.1. Luồng phụ SF-01 - Áp dụng mã khuyến mãi

Phạm vi: Chỉ thực hiện khi triển khai chức năng mở rộng; không bắt buộc trong MVP.

- Tại giỏ hàng hoặc trước khi xác nhận đặt hàng, khách hàng nhập hoặc chọn mã khuyến mãi.
- Backend kiểm tra hiệu lực, điều kiện sử dụng và số tiền được giảm; nếu hợp lệ, hệ thống cập nhật số tiền thanh toán.
- Nếu mã không hợp lệ, đã hết hạn hoặc không đủ điều kiện, hệ thống thông báo lý do và giữ nguyên số tiền trước giảm giá.

### 5.2. Luồng thay thế AF-01 - Thanh toán thất bại hoặc bị hủy

- Tại bước 8 hoặc 9, cổng thanh toán xác nhận giao dịch thất bại hoặc khách hàng hủy giao dịch.
- Hệ thống ghi nhận kết quả, thông báo thất bại và không chuyển đơn hàng sang PAID.
- Sau khi xác định giao dịch không thành công, hệ thống giải phóng số lượng đã giữ chỗ. Khách hàng có thể thử đặt/thanh toán lại sau khi hệ thống kiểm tra lại tồn kho.

### 5.3. Luồng thay thế AF-02 - Không đủ tồn kho khi đặt hàng

- Tại bước 6, Backend phát hiện số lượng khả dụng không đáp ứng số lượng khách hàng đặt.
- Hệ thống từ chối tạo đơn/giữ chỗ, xác định món không đủ hàng và yêu cầu khách hàng điều chỉnh giỏ hàng.
- Không khởi tạo thanh toán cho đơn hàng chưa được chấp nhận.

### 5.4. Luồng thay thế AF-03 - Chưa có kết quả thanh toán

- Tại bước 8 hoặc 9, kết nối bị gián đoạn hoặc thông báo kết quả thanh toán đến chậm.
- Đơn hàng được giữ ở trạng thái chờ xác nhận; hệ thống không tự suy luận rằng thanh toán đã thất bại hoặc thành công.
- Backend tiếp nhận thông báo thanh toán hoặc truy vấn/đối soát trạng thái giao dịch với cổng thanh toán trước khi quyết định cập nhật đơn.

### 5.5. Luồng thay thế AF-04 - Hết hạn giữ chỗ tồn kho

- Khi thời hạn giữ chỗ T kết thúc mà giao dịch chưa hoàn tất, hệ thống kiểm tra trạng thái thanh toán thực tế.
- Nếu xác định đơn chưa được thanh toán và không còn giao dịch đang chờ xử lý, hệ thống hủy giữ chỗ và hoàn trả số lượng vào tồn kho khả dụng.
- Nếu kết quả thanh toán đến muộn hoặc chưa rõ, hệ thống phải đối soát để tránh vừa giải phóng tồn kho vừa xác nhận đơn đã thanh toán.

### 5.6. Luồng thay thế AF-05 - Khách hàng chưa đăng nhập

- Nếu người dùng chưa đăng nhập chọn thêm vào giỏ hàng tại bước 3, hệ thống ngăn thao tác và yêu cầu đăng nhập.
- Sau khi xác thực thành công, khách hàng tiếp tục quá trình lựa chọn hoặc thêm món vào giỏ hàng.

### 5.7. Luồng thay thế AF-06 - Nhận thông báo thanh toán lặp

- Nếu cổng thanh toán gửi lại cùng một kết quả giao dịch nhiều lần, Backend đối chiếu mã giao dịch và trạng thái đã xử lý.
- Hệ thống chỉ ghi nhận thành công, cập nhật trạng thái đơn và xác nhận tồn kho một lần; các thông báo trùng không làm phát sinh giao dịch mới.

## 6. Hậu điều kiện

### 6.1. Trường hợp thành công

- Đơn hàng được lưu với trạng thái PAID sau khi hệ thống xác minh giao dịch thành công.
- Tồn kho được cập nhật chính thức một lần trên cơ sở số lượng đã giữ chỗ.
- Thông tin đơn hàng và thanh toán được lưu để khách hàng tra cứu trong lịch sử mua hàng.
- Khi tính năng tích điểm được phát triển trong giai đoạn mở rộng, điểm thưởng được cộng theo quy tắc sau thanh toán thành công.

### 6.2. Trường hợp thất bại hoặc hủy

- Đơn hàng không được ghi nhận là đã thanh toán; khách hàng nhận được thông báo phù hợp.
- Số lượng giữ chỗ được hoàn trả khi đã xác định giao dịch thất bại, bị hủy hoặc hết hạn hợp lệ.
- Khách hàng có thể quay lại giỏ hàng hoặc bắt đầu lượt thanh toán khác sau khi kiểm tra lại điều kiện đặt hàng.

### 6.3. Trường hợp đang chờ xác nhận

- Đơn hàng được duy trì ở trạng thái chờ cho đến khi nhận được kết quả đáng tin cậy từ đơn vị thanh toán.
- Không cập nhật thành PAID, không phát sinh cộng điểm thưởng và không xử lý tồn kho lặp lại khi chưa xác minh được kết quả.
