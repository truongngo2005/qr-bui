# COFFEE LAB - HR & POS V2 (QUẢN LÝ NHÂN VIÊN, LỊCH CA, CHẤM CÔNG QR, TÍNH LƯƠNG, KHO HÀNG & BÁO CÁO POS)

Hệ thống ứng dụng Web Quản Trị Toàn Diện Quán Cà Phê chuẩn hiện đại: Phân quyền 3 nhóm (Admin, Management, Staff), Đổi ca song phương trực tiếp tự động không cần quản lý duyệt, Quản lý kho hàng & lập phiếu xuất kho, Kiosk chấm công QR thời gian thực, Báo cáo doanh thu POS cuối ngày với công thức tự động tính tiền mặt nộp két.

---

## ☕ 1. TỔNG QUAN TÍNH NĂNG THEO YÊU CẦU

### 1. GIAO DIỆN & TRẢI NGHIỆM (UI/UX)
- Thiết kế hiện đại theo tông màu cà phê chuẩn nhận diện (nâu ấm, amber hổ phách, ngọc bích), sử dụng font chữ **Plus Jakarta Sans**, số liệu hiển thị căn thẳng hàng (`tabular-nums`), thẻ bo góc mềm mại (`rounded-3xl`), tối ưu Responsive hoàn hảo trên Desktop, Tablet và Mobile.
- **Thanh Navbar Cố Định (Sticky Top)**:
  - Hiển thị trạng thái ca làm việc thời gian thực (`Đang trong ca: Ca Sáng` với chấm xanh nhấp nháy / `Chưa vào ca`).
  - Nút bấm nhanh **"Kiosk QR"** mở Kiosk trạm quầy thu ngân.
  - Nút **"Đổi demo:"** kèm dropdown chuyển nhanh giữa các tài khoản thử nghiệm.
  - **Huy hiệu số đếm thông báo** lời mời đổi ca song phương đang chờ xác nhận.
- **Hệ thống Toast Notification**: Thông báo nổi góc phải màn hình cho mọi thao tác (chấm công, đổi ca, xuất kho, nộp báo cáo POS).

### 2. PHÂN QUYỀN 3 NHÓM TÀI KHOẢN (RBAC)
- **Màn hình Đăng nhập**:
  - Nhập Số điện thoại nhân viên để đăng nhập làm việc.
  - Nút mở nhanh **"Kiosk Quét QR Điểm Danh Ngay"** ngay ngoài màn hình đăng nhập.
  - 3 nút đăng nhập nhanh 1-chạm theo 3 nhóm quyền: **Admin (Chủ quán)**, **Management (Quản lý)**, **Staff (Nhân viên)** và danh sách nhân sự chọn trực tiếp.
- **Quyền hạn chi tiết**:
  - **a) Admin (Chủ cửa hàng)**:
    - **Lương = 0 ₫**, tự động loại trừ khỏi danh sách quyết toán bảng lương nhân sự.
    - **Dashboard tổng quan**: KPI nhân sự đang làm, tổng giờ công/quỹ lương dự kiến, doanh thu thực thu, biểu đồ cột & biểu đồ tròn trực quan (**Recharts**) đối soát doanh thu POS vs chi phí, cảnh báo tồn kho thấp, trạng thái ca làm trong ngày.
    - **Quản lý Nhân viên**: Thêm mới, chỉnh sửa hồ sơ, khóa/mở khóa tài khoản, xóa nhân sự, thiết lập mức lương/giờ.
    - **Cài đặt định mức ca**: 3 ca chuẩn S1 (1 người), C1 (1 người), T1 (2 người); nút `+` / `-` chỉnh nhanh định mức và nút **"Đặt lại định mức chuẩn"**.
    - **Quản lý Kho hàng**: Danh mục mặt hàng, đơn vị tính, ngưỡng tồn an toàn, cảnh báo sắp hết/hết hàng; **Lập phiếu xuất kho** trừ trực tiếp số lượng tồn kho tự động; Xem lịch sử xuất kho.
    - **Báo cáo POS cuối ngày**: Xem toàn bộ danh sách, lọc theo ngày/trạng thái, xem chi tiết từng dòng khoản chi và phê duyệt báo cáo.
    - **Bảng lương tháng**: Xem chi tiết bảng quyết toán lương nhân sự toàn quán (loại trừ Admin).
  - **b) Management (Quản lý)**:
    - Sử dụng giao diện Cổng Nhân Viên, nhận lương theo giờ như Staff.
    - Có thêm duy nhất 1 tab đặc quyền: **"Xếp Lịch (Quản Lý)"** để xếp nhân sự vào các ca, tự nhận ca nhanh ("Tôi nhận") và bấm **"Lưu / Chốt Lịch Cửa Hàng"**.
    - Không có quyền đổi định mức số người tối đa của ca (dành riêng cho Admin).
    - **Đã loại bỏ hoàn toàn mục Quản lý Kho / Xuất kho** khỏi thanh điều hướng.
  - **c) Staff (Nhân viên)**:
    - Giao diện Cổng Nhân Viên gọn nhẹ với thanh Bottom Bar trên mobile gồm đúng 5 mục:
      1. **Tổng Quan**: Chào đón, trạng thái ca, thẻ nổi bật lời mời đổi ca.
      2. **Chấm Công QR**: Mở giao diện Kiosk điểm danh quầy thu ngân.
      3. **Lịch Ca & Đổi Ca**: Xem lịch tuần, đăng ký ca rảnh hàng loạt & Đổi ca song phương.
      4. **Lương & Giờ Làm**: Xem chi tiết phiếu lương cá nhân, tổng giờ, lương cơ bản, phụ cấp chuyên cần và thực lĩnh.
      5. **Báo Cáo POS**: Nộp báo cáo doanh thu POS cuối ngày và theo dõi trạng thái duyệt.
    - Đã loại bỏ hoàn toàn mục Xuất kho.

### 3. CA LÀM VIỆC & ĐĂNG KÝ LỊCH TUẦN
- 3 ca chuẩn mỗi ngày:
  - **Ca Sáng (S1)**: 07:00 – 12:00 (định mức: 1 người)
  - **Ca Chiều (C1)**: 12:00 – 18:00 (định mức: 1 người)
  - **Ca Tối (T1)**: 18:00 – 22:30 (định mức: 2 người)
- Bảng lịch tuần (Thứ 2 → Chủ Nhật) dạng bảng trực quan trên Desktop và dạng thẻ trên Mobile.
- Nhân viên / Quản lý có chế độ **"Đăng Ký Ca Rảnh"**: bấm chọn nhanh nhiều ca trong tuần (từng ca hoặc cả ngày) và gửi đăng ký hàng loạt chỉ với 1 click.

### 4. CƠ CHẾ ĐỔI CA SONG PHƯƠNG TRỰC TIẾP (TỐI GIẢN & TỰ ĐỘNG)
- Bỏ hoàn toàn hình thức nhờ nhận ca / làm thay 1 chiều. Chỉ hỗ trợ đổi ca 2 chiều giữa 2 nhân viên có ca làm chính thức sắp tới.
- **Quy trình tối giản, KHÔNG CẦN Admin hay Quản lý phê duyệt**:
  1. Người A bấm *"Đổi Ca Cho Nhau"* -> chọn 1 ca sắp tới của mình -> chọn đồng nghiệp B -> chọn 1 ca sắp tới của B muốn đổi lấy -> nhập lời nhắn (tùy chọn) -> Bấm *"Gửi Lời Mời Đổi Ca"*.
  2. Người B nhận thông báo ngay lập tức qua:
     - Huy hiệu đếm số lượng trên Navbar.
     - Thẻ nổi bật màu đỏ-cam trên Dashboard.
     - Tab Lịch Ca & Đổi Ca.
  3. Thẻ lời mời đổi ca tối giản: Tên người gửi, *"Ca của bạn"*, *"Đổi lấy ca"* và 2 nút: **"Từ chối"** hoặc **"Đồng Ý Đổi Ca"**.
  4. Ngay khi Người B bấm **"Đồng Ý Đổi Ca"**, hệ thống **tự động hoán đổi 2 ca làm việc trên lịch chính thức của cửa hàng ngay lập tức**! (Người A có thể hủy lời mời khi Người B chưa phản hồi).

### 5. CHẤM CÔNG MÃ QR & TÍNH LƯƠNG TỰ ĐỘNG
- **Kiosk/Modal Chấm Công QR**:
  - Mã QR động trạm quầy thời gian thực (`qrcode.react`), đếm nhịp đổi mới mỗi 30 giây chống chụp ảnh giả mạo.
  - Đồng hồ điện tử giây thực tế.
  - Nút bấm 1-chạm Check-in và Check-out, tự động tính số phút, làm tròn giờ công và tiền lương ca làm = `Số giờ công × Lương/giờ`.
- **Trang Lương & Giờ Làm**:
  - Chi tiết từng ca đã chấm công theo tháng, tổng giờ, lương cơ bản, phụ cấp chuyên cần (+200,000đ nếu không đi muộn), khấu trừ phạt và thu nhập thực lĩnh.
  - **Loại trừ Admin**: Chủ cửa hàng không nhận lương theo giờ (Lương = 0 ₫).

### 6. BÁO CÁO DOANH THU POS CUỐI NGÀY
- Nhân viên / Quản lý tạo báo cáo cuối ngày gồm:
  - Ngày báo cáo.
  - Doanh thu máy POS cả ngày.
  - Tiền chuyển khoản ngân hàng.
  - Doanh thu ứng dụng giao hàng (Grab, ShopeeFood...).
  - Danh sách động **"Các khoản chi khác"** (thêm/xóa nhiều dòng: Tên khoản chi + Số tiền).
  - Ghi chú bàn giao két.
- **Công thức tính tự động**:
  $$\text{Tiền mặt thực tế nộp két} = \text{Doanh thu máy POS} - \text{Tiền chuyển khoản} - \text{Doanh thu ứng dụng} - \text{Tổng các khoản chi khác}$$
- Admin xem danh sách báo cáo, lọc theo ngày/trạng thái, xem chi tiết từng dòng khoản chi và phê duyệt báo cáo.

---

## 👥 2. TÀI KHOẢN THỬ NGHIỆM ĐẦY ĐỦ

| Nhóm quyền | Họ tên | Số điện thoại | Chức vụ | Mức lương/h |
|---|---|---|---|---|
| **1. ADMIN** | Trần Minh Đức | `0901234567` | Chủ cửa hàng (Admin) | **0 ₫ (Không tính lương)** |
| **2. MANAGEMENT** | Hoàng Thùy Linh | `0909876543` | Cửa hàng trưởng (Quản lý) | **35.000 ₫/h** |
| **3. STAFF** | Nguyễn Văn An | `0912345678` | Pha chế chính (Barista) | **30.000 ₫/h** |
| **3. STAFF** | Trần Thái Bình | `0912345679` | Thu ngân (Cashier) | **27.000 ₫/h** |
| **3. STAFF** | Lê Thị Mỹ Cúc | `0912345680` | Phục vụ bàn (Waitress) | **25.000 ₫/h** |
| **3. STAFF** | Phạm Quốc Dũng | `0912345681` | Bảo vệ & Hướng dẫn xe | **26.000 ₫/h** |

---

## 🛠️ 3. CÁCH CHẠY DỰ ÁN

### Frontend (React + Vite + Tailwind CSS + Recharts):
```powershell
cd C:\Users\HUBT\.gemini\antigravity\scratch\coffee-shop-system\frontend
npm run dev
```
Truy cập: `http://localhost:5173`

### Backend (Spring Boot 3.3.4 + Java 17 + MySQL 8.x):
```powershell
cd C:\Users\HUBT\.gemini\antigravity\scratch\coffee-shop-system\backend
java -jar target/coffee-shift-system-1.0.0.jar --spring.profiles.active=mysql
# Hoặc chạy in-memory:
java -jar target/coffee-shift-system-1.0.0.jar --spring.profiles.active=h2
```
API & Swagger: `http://localhost:8080/swagger-ui.html`

### Cơ sở dữ liệu MySQL:
File script: [`database/coffee_shop_db.sql`](file:///C:/Users/HUBT/.gemini/antigravity/scratch/coffee-shop-system/database/coffee_shop_db.sql) (tự động tạo database `coffee_shift_db` và 13 bảng cấu trúc chuẩn).
