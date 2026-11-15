# Tài liệu Triển khai Hệ thống BrewLite (Task 3.2)

- **Đồ án**: Công nghệ Phần mềm – Assignment 2 (Requirements to Deployment)
- **Tên dự án**: `brewlite2`
- **Kho mã nguồn chính thức (GitHub)**: [https://github.com/giathinhnguyen/brewlite2.git](https://github.com/giathinhnguyen/brewlite2.git)
- **Tệp nguồn sơ đồ**: [`docs/diagrams/deployment.puml`](./diagrams/deployment.puml)
- **Tệp ảnh sơ đồ kết xuất**: [`docs/diagrams/deployment.svg`](./diagrams/deployment.svg)

---

## 1. Sơ đồ UML Deployment Diagram Tổng thể

Dưới đây là hình ảnh kết xuất chính thức từ tệp nguồn PlantUML, mô tả đầy đủ 3 ranh giới môi trường (Local Development, CI/CD Pipeline và Production Cloud Platform) cùng các giao thức, cổng mạng, dịch vụ bên ngoài và cơ chế lưu trữ bền vững:

![UML Deployment Diagram](./diagrams/deployment.svg)

---

## 2. Đặc tả Triển khai theo Từng Môi trường

### 2.1. Môi trường Phát triển Cục bộ (Local Development)
- **Tập lệnh điều phối**: Định nghĩa tại `docker-compose.yml`.
- **Dịch vụ cấu thành**:
  - `web`: Chạy ứng dụng Next.js Mobile-first/PWA tại cổng `3001` (ánh xạ vào cổng `3000` của container) với cơ chế Hot Module Replacement (HMR).
  - `api`: Chạy ứng dụng NestJS API Server tại cổng `3000` với tiền tố chung `/api`.
  - `postgres`: Container PostgreSQL 16 tại cổng `5432`, dữ liệu được lưu trên volume `postgres_data`.
- **Cơ chế khởi động an toàn**: Container `api` chỉ khởi chạy sau khi container `postgres` đạt trạng thái `service_healthy` thông qua câu lệnh kiểm tra:
  ```bash
  pg_isready -U brewlite -d brewlite

### 2.2. Môi trường Tích hợp và Phân phối Tự động (CI/CD Pipeline)

- **Nền tảng thực thi**: GitHub Actions Runner kết nối trực tiếp với kho mã nguồn `https://github.com/giathinhnguyen/brewlite2.git`.
- **Cơ chế kích hoạt**: Tự động kích hoạt khi có Pull Request vào nhánh `main` hoặc khi đẩy Git Tag phát hành phiên bản mới.
- **Quy trình thực thi tuần tự 7 bước chuẩn DevOps**:

1. **Quality Gate (Kiểm tra chất lượng mã nguồn)**:
   - Cài đặt toàn bộ dependencies với bộ nhớ đệm `pnpm install --frozen-lockfile`.
   - Chạy kiểm tra cú pháp và kiểu dữ liệu TypeScript trên toàn bộ monorepo:
     ```bash
     pnpm --recursive lint
     pnpm --recursive exec tsc --noEmit
     ```
2. **Kiểm thử tự động (Automated Testing)**:
   - Chạy toàn bộ 63 bài Unit Tests kiểm tra tính đúng đắn của logic tính tiền, khuyến mãi và định lượng nguyên liệu.
   - Khởi tạo container cơ sở dữ liệu mẫu để chạy 41 bài E2E/Integration Tests kiểm tra toàn diện luồng tạo đơn, giữ kho 15 phút và thanh toán có Idempotency.
   - **Quy tắc chặn**: Nếu có bất kỳ test case nào thất bại, pipeline lập tức dừng lại và khóa lệnh Merge.
3. **Đóng gói Container Multi-stage (Docker Packaging)**:
   - Xây dựng Multi-stage Docker Image độc lập cho 2 ứng dụng (`apps/web` và `apps/api`) nhằm tối ưu dung lượng ảnh chạy production (< 180MB):
     - Gắn nhãn độc bản (unique tag) theo mã Git Commit SHA và Semantic Version:
       - `ghcr.io/giathinhnguyen/brewlite2-web:<commit-sha>`
       - `ghcr.io/giathinhnguyen/brewlite2-api:<commit-sha>`
4. **Đẩy ảnh lên kho lưu trữ (Push Registry)**:
   - Đăng nhập an toàn vào GitHub Container Registry (`ghcr.io`) thông qua biến bí mật `REGISTRY_TOKEN`.
   - Đẩy các image đã được kiểm định chất lượng lên registry sẵn sàng cho triển khai.
5. **Thực thi Migration cơ sở dữ liệu an toàn (Safe DB Migration)**:
   - Kết nối tới cơ sở dữ liệu đích qua chuỗi kết nối bảo mật `PROD_DATABASE_URL` (SSL mode).
   - Thực thi lệnh cập nhật lược đồ cơ sở dữ liệu nghiêm ngặt, tuyệt đối không dùng `db push` hay `migrate reset`:
     ```bash
     pnpm --filter api exec prisma migrate deploy
     ```
6. **Triển khai Production & Smoke Test tự động**:
   - Kích hoạt Webhook Deploy hoặc SSH lệnh cập nhật container mới trên máy chủ Cloud.
   - Tự động gửi request kiểm tra sức khỏe hệ thống sau khi container vừa khởi động:
     ```http
     GET https://brewlitesguu.duckdns.org/api/health
     ```
   - Xác nhận trạng thái phản hồi đạt `HTTP 200 OK` với nội dung `{"status":"ok","database":"connected"}`.
7. **Cơ chế Dừng khẩn cấp và Rollback (Rollback Strategy)**:
   - Nếu bước Smoke Test thất bại hoặc container API crash trong vòng 60 giây đầu tiên, pipeline tự động phát tín hiệu hủy triển khai và khôi phục (revert) về phiên bản Docker Image ổn định liền trước đó.

---

### 2.3. Môi trường Sản xuất (Production Cloud Platform)

- **Nền tảng mục tiêu**: Triển khai trên nền tảng Cloud hiện đại (Render / Railway kết hợp Edge CDN).
- **Phân vùng an toàn và Cô lập mạng (Network Isolation & VPC)**:
  - **Tầng Trình bày (Edge CDN / Web Service)**:
    - Phục vụ bản build tĩnh và SSR của Next.js Mobile-first/PWA (`apps/web`).
    - Lắng nghe cổng công khai `HTTPS :443` (chuẩn TLS 1.3), tự động nén Gzip/Brotli và hỗ trợ bộ nhớ đệm biên (Edge Caching).
    - Tự động nạp các biến môi trường phía client: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
  - **Tầng Ứng dụng (Private Application VPC - NestJS)**:
    - Container `brewlite-api` chạy Node.js 22 Slim, cổng nội bộ `3000`.
    - Được che chắn phía sau Reverse Proxy / Cloud Load Balancer, chỉ nhận request từ Internet qua định tuyến `/api/*`.
    - Toàn bộ log của ứng dụng được đẩy ra luồng chuẩn (`stdout`/`stderr`) để hệ thống Cloud Log Stream thu thập và phân tích tập trung.
  - **Tầng Dữ liệu Cô lập (Private Database Subnet)**:
    - Managed PostgreSQL 16 nằm hoàn toàn trong mạng nội bộ, **không cấp địa chỉ IP Public** ra ngoài Internet.
    - Chỉ chấp nhận kết nối TCP qua cổng nội bộ `5432` từ container `brewlite-api` thông qua mạng ảo Private Network.
    - Dữ liệu được lưu trữ bền vững trên **Persistent SSD Storage Volume** gắn tại thư mục `/var/lib/postgresql/data` (chống mất mát dữ liệu khi container khởi động lại).
    - Cấu hình cơ chế sao lưu tự động (Automated Daily Snapshot Backups).
- **Quản lý Cấu hình & Chốt chặn Bảo mật (Secrets & Safety Gates)**:
  - Toàn bộ thông tin nhạy cảm (`DATABASE_URL`, `JWT_SECRET`, `SMTP_PASSWORD`, `VNPAY_HASH_SECRET`) được lưu tại Cloud Secrets Manager, nạp vào tiến trình lúc khởi chạy.
  - **Chốt chặn an toàn cho kênh thanh toán Demo**:
    - Thiết lập biến môi trường `BANK_TRANSFER_DEMO_ENABLED=false` và `CARD_DEMO_ENABLED=false`.
    - Backend tự động khóa cứng và từ chối mọi yêu cầu gọi vào API giả lập khi phát hiện `NODE_ENV === 'production'`.

---

## 3. Bảng Ma trận Truy vết Hệ thống (Traceability Matrix)

> **Đáp ứng tiêu chí nghiệm thu Task 3.2**: Có thể truy vết mỗi container/dịch vụ trong Deployment Diagram đến một thành phần tương ứng trong mô tả kiến trúc và tệp mã nguồn cụ thể trong kho lưu trữ `brewlite2`.

| Thành phần trên Sơ đồ Triển khai | Khái niệm Kiến trúc Tương ứng | Mã nguồn / Cấu hình định danh trong Repository (`brewlite2`) | Cổng mạng & Giao thức |
| :--- | :--- | :--- | :--- |
| **`brewlite-web` (Container / CDN)** | Presentation Tier (Next.js Mobile-first PWA) | - Cấu hình gói: `apps/web/package.json`<br/>- Giao diện & Router: `apps/web/src/*`<br/>- Service Worker: `apps/web/public/sw.js`<br/>- Cấu hình Docker: `docker-compose.yml` (service: `web`) | Công khai: `HTTPS :443`<br/>Local Dev: `HTTP :3001` |
| **`brewlite-api` (Container Application)** | Application Tier (NestJS Modular Monolith) | - Khởi tạo Server & Prefix: `apps/api/src/main.ts`<br/>- Quản lý 14 Domain Modules: `apps/api/src/app.module.ts`<br/>- Cấu hình Docker: `docker-compose.yml` (service: `api`) | Công khai: `HTTPS :443`<br/>Nội bộ: `TCP :3000`<br/>Tiền tố: `/api` |
| **Endpoint `GET /api/health`** | Observability & Readiness / Smoke Test Probe | - Controller xử lý: `apps/api/src/health/health.controller.ts`<br/>- Module giám sát: `apps/api/src/health/health.module.ts` | `HTTP/HTTPS :3000`<br/>Endpoint: `GET /api/health` |
| **`brewlite-postgres` (Database & Storage)** | Data Tier & Cơ chế Migration Lược đồ | - Lược đồ 20 bảng & 11 enums: `apps/api/prisma/schema.prisma`<br/>- Chuỗi 9 bản migrations: `apps/api/prisma/migrations/*`<br/>- Cấu hình Volume SSD: `docker-compose.yml` (volume: `postgres_data`) | Nội bộ: `TCP :5432`<br/>Volume mount:<br/>`/var/lib/postgresql/data` |
| **Hệ thống Thanh toán (VNPay & Simulator)** | Sub-system Tích hợp Thanh toán Đa chiến lược | - Điều phối thanh toán: `apps/api/src/payments/payments.controller.ts`<br/>- Cổng VNPay (HMAC-SHA512): `apps/api/src/payments/vnpay.gateway.ts`<br/>- Tạo mã VietQR: `apps/api/src/payments/bank-qr.ts` | Chiều ra (Outbound): `HTTPS :443`<br/>IPN Webhook: `HTTPS :443` |
| **Kho Quản lý Cấu hình & Biến môi trường** | Configuration & Secrets Management | - Tệp khai báo mẫu: `.env.example`<br/>- Nạp cấu hình runtime: `apps/api/src/main.ts` (`import 'dotenv/config'`) | Nạp trực tiếp từ biến môi trường hệ điều hành / Docker Env |
| **Dịch vụ Định danh Google & Gửi OTP SMTP** | External Identity & Notification Integration | - Module xác thực & Guard: `apps/api/src/auth/*`<br/>- Cấu hình biến: `GOOGLE_CLIENT_ID`, `SMTP_HOST`, `SMTP_PORT` | Google Auth: `HTTPS :443`<br/>Gmail SMTP: `SMTPS :465` (TLS) |