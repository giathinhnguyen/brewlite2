# HỒ SƠ THIẾT KẾ KIẾN TRÚC VÀ TRIỂN KHAI HỆ THỐNG BREWLITE
## Môn học: Công nghệ Phần mềm – Assignment 2 (Task 3)

- **Kho mã nguồn chính thức (GitHub)**: [https://github.com/giathinhnguyen/brewlite2.git](https://github.com/giathinhnguyen/brewlite2.git)
- **Tổ chức / Tài khoản sở hữu**: `giathinhnguyen`
- **Dự án**: `brewlite2`
- **Bộ công nghệ bắt buộc**: Next.js (Mobile-first/PWA), NestJS, PostgreSQL 16 và Docker
- **Mô hình quản lý mã nguồn**: Monorepo (`apps/web`, `apps/api`, `docs/`)

---

# PHẦN 1: TỔNG QUAN KIẾN TRÚC HỆ THỐNG (TASK 3.1)

## 1. Phương pháp tiếp cận kiến trúc

Hệ thống **BrewLite** được thiết kế kết hợp hai phương pháp kỹ nghệ phần mềm chuẩn:
1. **Mô hình C4 (Context, Containers, Components)**: Phân rã hệ thống theo góc nhìn phân tầng trực quan từ ngữ cảnh tương tác người dùng, các container triển khai đến cấu trúc module nghiệp vụ nội bộ.
2. **Kiến trúc Phân lớp kết hợp Modular Monolith (Layered Modular Architecture)**:
   - **Tầng Trình bày (Presentation Tier)**: Ứng dụng Next.js Mobile-first/PWA (`apps/web`).
   - **Tầng Ứng dụng & Nghiệp vụ (Application Tier)**: Ứng dụng NestJS Modular Monolith (`apps/api`) gồm 14 Domain Modules.
   - **Tầng Dữ liệu (Data Tier)**: Cơ sở dữ liệu PostgreSQL 16 quản lý qua Prisma ORM.

---

## 2. Mô hình C4

### 2.1. C4 Level 1 – Sơ đồ Ngữ cảnh Hệ thống (System Context Diagram)

```mermaid
flowchart TB
    Customer["👤 Khách hàng (Customer)<br/>Xem menu, tùy biến đồ uống, đặt đơn,<br/>thanh toán, tích lũy & đổi điểm thưởng"]
    StaffAdmin["👤 Quản trị viên / Thu ngân (Admin/Staff)<br/>Kiểm kê kho nguyên liệu, thiết lập công thức,<br/>quản lý khuyến mãi, tra cứu khách hàng"]

    subgraph SystemBoundary["Hệ thống Đặt nước & Quản lý Cửa hàng BrewLite"]
        BrewLite["☕ Ứng dụng BrewLite<br/>(Next.js Mobile-First PWA + NestJS RESTful API)"]
    end

    VNPay["💳 Cổng thanh toán VNPay Sandbox<br/>(Thanh toán thẻ/VNPAY-QR, IPN Webhook, QueryDR)"]
    VietQR["🏦 Dịch vụ VietQR Quick Link<br/>(Sinh mã VietQR chuyển khoản động SVG)"]
    GoogleOAuth["🔐 Google Identity Services<br/>(Xác thực OAuth 2.0 / ID Token)"]
    SMTP["📧 Dịch vụ Email SMTP (Gmail TLS :465)<br/>(Gửi mã OTP 6 số xác minh tài khoản)"]

    Customer -->|"HTTPS (Mobile Browser / PWA)"| BrewLite
    StaffAdmin -->|"HTTPS (/admin/*)"| BrewLite
    BrewLite -->|"Redirect / HMAC-SHA512 IPN / QueryDR"| VNPay
    BrewLite -->|"HTTPS GET SVG QR"| VietQR
    BrewLite -->|"Verify ID Token"| GoogleOAuth
    BrewLite -->|"SMTPS Port 465"| SMTP

### 2.2. Sơ đồ C4 Level 2 – Container Architecture & Kiến trúc Phân lớp
flowchart TB
    subgraph ClientTier["📱 Tầng Thiết bị Người dùng (Client Tier)"]
        Browser["Trình duyệt Di động & Máy tính<br/>(Mobile PWA, Desktop Browser)"]
    end

    subgraph PresentationTier["🌐 Tầng Trình bày (Frontend Container - apps/web)"]
        NextApp["Next.js Mobile-First Web / PWA Container<br/>Next.js 14/15 App Router + TailwindCSS + PWA Service Worker<br/>Hỗ trợ SSR/SSG Menu, Caching ngoại tuyến, Giỏ hàng Khách & Auth Session"]
    end

    subgraph ApplicationTier["⚙️ Tầng Ứng dụng & Nghiệp vụ (Backend Container - apps/api)"]
        APIGateway["🛡️ NestJS HTTP Layer & Guards<br/>CORS, Global Prefix (/api), AuthGuard (JWT HS256), Admin Role Guard"]
        BusinessModules["⚙️ NestJS 14 Domain Modules<br/>Auth, Users, Categories, Products, Toppings, Carts,<br/>Promotions, Rewards, Inventory, Orders, Payments, Admin, Health"]
        BgWorker["⏱️ Background Expiration Worker<br/>Quét mỗi 60s giải phóng đơn PENDING_PAYMENT quá hạn 15 phút"]
        PrismaORM["🗄️ Data Access Layer (Prisma Client v6)<br/>Quản lý Transaction ACID, Khóa bi quan (Pessimistic Lock)"]
    end

    subgraph DataTier["🐘 Tầng Dữ liệu (Data Tier)"]
        Postgres[("PostgreSQL 16 Database<br/>20 bảng quan hệ, Snapshot đơn hàng,<br/>Tồn kho 26 nguyên liệu & Lịch sử điểm thưởng")]
    end

    subgraph ExternalSimulated["🧪 Tầng Dịch vụ Tích hợp & Giả lập"]
        SimPayment["Payment Simulator (In-App Demo)<br/>Mô phỏng Chuyển khoản VietQR & Thẻ Test (4111...)"]
        VNPaySvc["VNPay Sandbox Gateway"]
        VietQRSvc["VietQR Generator"]
        GoogleSvc["Google OAuth 2.0 API"]
        SMTPSvc["Gmail SMTP Server"]
    end

    Browser -->|"HTTPS :443 / Dev :3001"| NextApp
    Browser -->|"REST API JSON + Bearer JWT (HTTPS :443 / Dev :3000)"| APIGateway
    NextApp -.->|"Server-Side / Client-Side Fetch"| APIGateway
    APIGateway --> BusinessModules
    BgWorker --> BusinessModules
    BusinessModules --> PrismaORM
    PrismaORM -->|"TCP :5432 (Connection Pool)"| Postgres
    BusinessModules --> SimPayment
    BusinessModules -->|"HTTPS"| VNPaySvc
    BusinessModules -->|"HTTPS"| GoogleSvc
    BusinessModules -->|"SMTPS :465"| SMTPSvc
    Browser -->|"Tải ảnh QR SVG"| VietQRSvc