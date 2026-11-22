# BrewLite frontend — Next.js

Frontend dùng React, TypeScript, Next.js App Router và Tailwind CSS. API nghiệp vụ tiếp tục chạy bằng NestJS.

## Chạy local

Từ thư mục gốc repository:

```powershell
pnpm install --frozen-lockfile
docker compose up -d postgres api
pnpm --filter web dev
```

Mở http://localhost:5173. Để chạy cả web bằng Docker: `docker compose up -d --build web` (không đồng thời chạy web bằng pnpm trên cùng cổng).

Khai báo trong file `.env` ở thư mục gốc hoặc `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<Google OAuth client ID của nhóm>
```

Cấu hình gốc cũ `VITE_API_URL` và `VITE_GOOGLE_CLIENT_ID` được đọc tương thích trong giai đoạn chuyển đổi. Ưu tiên đặt tên NEXT_PUBLIC mới và bỏ tên cũ khi nhóm đã cập nhật. Những giá trị NEXT_PUBLIC được đưa vào bundle lúc build; không đặt JWT secret, SMTP password hay khóa thanh toán vào đó.

## Cấu trúc

- `src/app`: page/layout theo URL; nhóm `(shop)` dùng giao diện khách, `(authenticated)` chờ khôi phục phiên rồi yêu cầu đăng nhập.
- `src/app/admin/[section]`: layout quản trị riêng, không có header/footer khách hàng.
- `src/screens`: các màn hình React được tái sử dụng từ bản SPA.
- `src/components/Navigation.tsx`: liên kết menu đang chọn và chuyển hướng client, đều dùng router Next.js.
- `src/services`: gọi API NestJS. Backend vẫn kiểm tra JWT và quyền cho từng yêu cầu.
- AuthProvider giữ khóa token localStorage hiện có; việc kiểm tra route phía giao diện không thay cho kiểm tra quyền tại API.
- Form cần đọc sessionStorage sau hydration dùng `useClientReady`. Không truy cập browser APIs khi render phía server.
- Giữ URL return VNPay/ZaloPay và URL hóa đơn; đích quay lại sau đăng nhập truyền bằng query `next` có kiểm tra URL nội bộ.

## Kiểm tra

```powershell
pnpm --filter web test
pnpm --filter web typecheck
pnpm --filter web build
pnpm --filter web start
pnpm --filter web lint
```

`start` phục vụ bản build local ở cổng 5173. Docker production dùng standalone Node server ở cổng nội bộ 8080. Caddy tiếp tục chuyển `/api/*` tới API; các request còn lại tới Next.js.

Sau đổi frontend cần kiểm tra đăng nhập/Google, đồng bộ giỏ, khuyến mãi/đổi thưởng, checkout, payment return và hóa đơn khi reload, hủy/hoàn tiền, quản trị và đường dẫn không tồn tại. Kiểm tra lint riêng: mã cũ còn các lỗi lint, không đồng nghĩa production build thất bại.
