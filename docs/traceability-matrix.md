# Ma trận truy vết kiểm thử – FR-01 đến FR-05

Kết quả chạy local ngày 20/11/2026 cho 5 dòng đầu mục 6.1 của báo cáo. Bộ test nằm trong kho [CNPM_brewlite1](https://github.com/giathinhnguyen/CNPM_brewlite1), trên bản làm việc dựa trên commit `9bbdc4e` của nhánh `develop`. Đường dẫn trong bảng tính từ thư mục gốc của kho đó. Các liên kết trong bảng mở đúng ca kiểm thử tại commit này.

| Mã YC | Use-case / Story | Thiết kế / Sơ đồ | Code / API | Kịch bản / file test | Kết quả chạy local |
|---|---|---|---|---|---|
| FR-01 | US-01 – Xem menu | Activity-01, Class-Catalog | `GET /api/products` | [`API-T01: get_products`](https://github.com/giathinhnguyen/CNPM_brewlite1/blob/9bbdc4e70fd18b89717cac3047a48ead79d2015b/apps/api/test/traceability-api.e2e-spec.ts#L88) | PASS. HTTP 200 với danh sách món, size và số lượng khả dụng. Kiểm tra điều kiện lọc món/danh mục đang hoạt động. |
| FR-02 | US-02 – Chi tiết món | Sequence-01, Class-Catalog | `GET /api/products/:id`, `GET /api/toppings` | [`API-T02: get_detail`](https://github.com/giathinhnguyen/CNPM_brewlite1/blob/9bbdc4e70fd18b89717cac3047a48ead79d2015b/apps/api/test/traceability-api.e2e-spec.ts#L106) | PASS. Trả đúng món và size, lấy topping qua API riêng, trả 404 khi món không tồn tại. |
| FR-03 | US-03 – Giỏ hàng | Class-Cart, Class-Catalog | `CartsService.getCart()` | [`UNIT-T01: calc_cart`](https://github.com/giathinhnguyen/CNPM_brewlite1/blob/9bbdc4e70fd18b89717cac3047a48ead79d2015b/apps/api/src/carts/carts.service.spec.ts#L6) | PASS. Tính giá món, phụ thu size, topping và số lượng. Tổng tiền chỉ cộng dòng đã chọn. |
| FR-04 | US-04 – Đăng nhập JWT | Class-Users | `POST /api/auth/login`, `GET /api/auth/me` | [`API-T03: auth_jwt`](https://github.com/giathinhnguyen/CNPM_brewlite1/blob/9bbdc4e70fd18b89717cac3047a48ead79d2015b/apps/api/test/traceability-api.e2e-spec.ts#L126) | PASS. Đăng nhập đúng trả 201 và JWT dùng được ở route xác thực. Sai mật khẩu trả 401. |
| FR-05 | UC-01 – Tạo đơn hàng | Activity-01, Sequence-01 | `POST /api/orders` → `OrdersService.create()` | [`INT-T01: order_trans`](https://github.com/giathinhnguyen/CNPM_brewlite1/blob/9bbdc4e70fd18b89717cac3047a48ead79d2015b/apps/api/test/checkout-inventory.e2e-spec.ts#L339) | PASS. Hai người đặt khi nguyên liệu chỉ đủ một đơn. Chỉ lưu một đơn `PENDING_PAYMENT`, giữ kho một lần và giữ nguyên giỏ của người đặt thất bại. |

## Chạy lại

Chạy từ thư mục gốc của `CNPM_brewlite1` sau khi cài dependencies theo hướng dẫn của repo. Các ca HTTP chạy NestJS và dùng dữ liệu giả lập tại lớp truy cập dữ liệu. Ca unit giỏ hàng cũng dùng dữ liệu giả lập.

```sh
pnpm --filter api test:e2e test/traceability-api.e2e-spec.ts
pnpm --filter api test src/carts/carts.service.spec.ts
```

Với FR-05, đặt `DATABASE_URL` trỏ đến PostgreSQL dành riêng cho kiểm thử, sau đó chạy migration, sinh Prisma Client và chạy riêng ca giao dịch.

```sh
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma generate
pnpm --filter api test:e2e test/checkout-inventory.e2e-spec.ts -t INT-T01
```

Lần xác minh local, PostgreSQL 18 chạy tạm trên máy kiểm thử. Prisma CLI báo lỗi schema engine khi chạy migration trên máy này, nên các tệp SQL migration được áp trực tiếp theo thứ tự vào database thử nghiệm. Vitest xác nhận 3 ca HTTP, 1 ca unit và 1 ca giao dịch pass.
## Phạm vi FR-06 đến FR-10

Các yêu cầu tiếp theo đã được đối chiếu với API hiện có và bổ sung phần còn thiếu cho cập nhật trạng thái đơn hàng:

| Mã YC | Chức năng | API / thành phần | Minh chứng kiểm thử |
|---|---|---|---|
| FR-06 | Thanh toán | `POST /api/payments` | `checkout-inventory.e2e-spec.ts` – các luồng VNPay, ZaloPay và thanh toán demo |
| FR-07 | Theo dõi đơn | `GET /api/orders/:id` | `OrdersController.detail()` và các ca kiểm thử checkout/refund |
| FR-08 | Khuyến mãi | `POST /api/promotions/quote` | `promotions.e2e-spec.ts` |
| FR-09 | Lịch sử đơn | `GET /api/orders` | `OrdersController.list()` |
| FR-10 | Quản trị cập nhật trạng thái | `PATCH /api/orders/:id` | `OrdersService.updateStatus()` và `orders.service.spec.ts` |

FR-06 đến FR-09 đã có các luồng nghiệp vụ trong mã nguồn. FR-10 được bảo vệ bằng quyền `ADMIN`, kiểm tra trạng thái hợp lệ và kiểm tra phiên bản `updatedAt` để tránh ghi đè dữ liệu mới.
