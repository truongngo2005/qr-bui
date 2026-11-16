-- =====================================================================
-- DATABASE: COFFEE LAB - HR & POS V2
-- Database: coffee_shift_db
-- =====================================================================

DROP DATABASE IF EXISTS `coffee_shift_db`;
CREATE DATABASE IF NOT EXISTS `coffee_shift_db` 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE `coffee_shift_db`;

-- 1. Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE' COMMENT 'ADMIN, MANAGER, EMPLOYEE',
    `position` VARCHAR(50) NOT NULL COMMENT 'Chủ quán, Quản lý, Pha chế, Thu ngân, Phục vụ, Bảo vệ',
    `hourly_rate` DECIMAL(12, 2) NOT NULL DEFAULT 25000.00 COMMENT 'Admin = 0đ, Nhân viên & Quản lý tính theo giờ',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_phone` (`phone_number`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: otp_verifications
DROP TABLE IF EXISTS `otp_verifications`;
CREATE TABLE `otp_verifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `identifier` VARCHAR(100) NOT NULL,
    `otp_code` VARCHAR(10) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: shift_templates (3 Ca chuẩn)
DROP TABLE IF EXISTS `shift_templates`;
CREATE TABLE `shift_templates` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(50) NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `min_employees` INT NOT NULL DEFAULT 1 COMMENT 'Định mức số người (S1=1, C1=1, T1=2)',
    `salary_multiplier` DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: shift_assignments
DROP TABLE IF EXISTS `shift_assignments`;
CREATE TABLE `shift_assignments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `shift_template_id` BIGINT NOT NULL,
    `work_date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED' COMMENT 'ASSIGNED, COMPLETED, CANCELLED',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`shift_template_id`) REFERENCES `shift_templates`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_shift_date` (`user_id`, `shift_template_id`, `work_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: shift_registrations (Đăng ký ca rảnh theo tuần)
DROP TABLE IF EXISTS `shift_registrations`;
CREATE TABLE `shift_registrations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `shift_template_id` BIGINT NOT NULL,
    `work_date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'REGISTERED' COMMENT 'REGISTERED, APPROVED, REJECTED',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`shift_template_id`) REFERENCES `shift_templates`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_reg_shift` (`user_id`, `shift_template_id`, `work_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: attendances (Chấm công QR)
DROP TABLE IF EXISTS `attendances`;
CREATE TABLE `attendances` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `assignment_id` BIGINT NULL,
    `user_id` BIGINT NOT NULL,
    `check_in_time` TIMESTAMP NULL,
    `check_out_time` TIMESTAMP NULL,
    `work_hours` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ON_TIME' COMMENT 'ON_TIME, LATE, EARLY_LEAVE, ABSENT',
    `notes` TEXT NULL,
    `qr_token` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`assignment_id`) REFERENCES `shift_assignments`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: shift_exchange_requests (Đổi ca song phương trực tiếp - Tự động hoán đổi)
DROP TABLE IF EXISTS `shift_exchange_requests`;
CREATE TABLE `shift_exchange_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sender_id` BIGINT NOT NULL,
    `receiver_id` BIGINT NOT NULL,
    `sender_assignment_id` BIGINT NOT NULL,
    `receiver_assignment_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, ACCEPTED, REJECTED, CANCELLED',
    `reason` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sender_assignment_id`) REFERENCES `shift_assignments`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`receiver_assignment_id`) REFERENCES `shift_assignments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: inventory_items (Quản lý kho hàng)
DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(30) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `current_stock` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `safe_stock_threshold` DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
    `unit_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table: stock_issues (Phiếu xuất kho)
DROP TABLE IF EXISTS `stock_issues`;
CREATE TABLE `stock_issues` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `issue_code` VARCHAR(30) NOT NULL UNIQUE,
    `issue_date` DATE NOT NULL,
    `created_by_user_id` BIGINT NOT NULL,
    `shift_name` VARCHAR(50) NOT NULL,
    `total_items` INT NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table: stock_issue_items (Chi tiết xuất kho)
DROP TABLE IF EXISTS `stock_issue_items`;
CREATE TABLE `stock_issue_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `stock_issue_id` BIGINT NOT NULL,
    `inventory_item_id` BIGINT NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `notes` TEXT NULL,
    FOREIGN KEY (`stock_issue_id`) REFERENCES `stock_issues`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Table: pos_reports (Báo cáo doanh thu POS cuối ngày)
DROP TABLE IF EXISTS `pos_reports`;
CREATE TABLE `pos_reports` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `report_date` DATE NOT NULL UNIQUE,
    `created_by_user_id` BIGINT NOT NULL,
    `pos_machine_revenue` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `bank_transfer_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `app_delivery_revenue` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_expenses` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `actual_cash_submitted` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, REJECTED',
    `notes` TEXT NULL,
    `approved_by_user_id` BIGINT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approved_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Table: pos_report_expenses (Các khoản chi khác trong báo cáo)
DROP TABLE IF EXISTS `pos_report_expenses`;
CREATE TABLE `pos_report_expenses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `report_id` BIGINT NOT NULL,
    `expense_name` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (`report_id`) REFERENCES `pos_reports`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Table: shop_settings
DROP TABLE IF EXISTS `shop_settings`;
CREATE TABLE `shop_settings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(50) NOT NULL UNIQUE,
    `setting_value` TEXT NOT NULL,
    `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA
-- =====================================================================

-- Users (Admin lương = 0, Management & Staff tính lương/h)
INSERT INTO `users` (`id`, `full_name`, `phone_number`, `email`, `role`, `position`, `hourly_rate`, `is_active`) VALUES
(1, 'Trần Minh Đức', '0901234567', 'admin@coffeeshop.vn', 'ADMIN', 'Chủ cửa hàng (Admin)', 0.00, TRUE),
(2, 'Hoàng Thùy Linh', '0909876543', 'manager@coffeeshop.vn', 'MANAGER', 'Quản lý cửa hàng (Management)', 35000.00, TRUE),
(3, 'Nguyễn Văn An', '0912345678', 'an.nguyen@coffeeshop.vn', 'EMPLOYEE', 'Pha chế chính (Barista)', 30000.00, TRUE),
(4, 'Trần Thái Bình', '0912345679', 'binh.tran@coffeeshop.vn', 'EMPLOYEE', 'Thu ngân (Cashier)', 27000.00, TRUE),
(5, 'Lê Thị Mỹ Cúc', '0912345680', 'cuc.le@coffeeshop.vn', 'EMPLOYEE', 'Phục vụ bàn (Waitress)', 25000.00, TRUE),
(6, 'Phạm Quốc Dũng', '0912345681', 'dung.pham@coffeeshop.vn', 'EMPLOYEE', 'Bảo vệ & Hướng dẫn xe', 26000.00, TRUE);

-- 3 Ca chuẩn
INSERT INTO `shift_templates` (`id`, `code`, `name`, `start_time`, `end_time`, `min_employees`, `salary_multiplier`, `is_active`) VALUES
(1, 'S1', 'Ca Sáng (S1)', '07:00:00', '12:00:00', 1, 1.00, TRUE),
(2, 'C1', 'Ca Chiều (C1)', '12:00:00', '18:00:00', 1, 1.00, TRUE),
(3, 'T1', 'Ca Tối (T1)', '18:00:00', '22:30:00', 2, 1.10, TRUE);

-- Inventory Items (Mặt hàng trong kho)
INSERT INTO `inventory_items` (`id`, `code`, `name`, `category`, `unit`, `current_stock`, `safe_stock_threshold`, `unit_price`, `notes`) VALUES
(1, 'CF-ROBUSTA', 'Cà phê Robusta Dak Lak', 'Nguyên liệu cà phê', 'kg', 24.50, 10.00, 185000.00, 'Hạt rang mộc'),
(2, 'CF-ARABICA', 'Cà phê Arabica Cầu Đất', 'Nguyên liệu cà phê', 'kg', 12.00, 8.00, 260000.00, 'Rang vừa specialty'),
(3, 'MILK-BARISTA', 'Sữa tươi Dalat Milk Barista', 'Sữa & Kem', 'Hộp 1L', 6.00, 15.00, 36000.00, 'SẮP HẾT - Cần nhập thêm'),
(4, 'MILK-COND', 'Sữa đặc Ngôi Sao Phương Nam', 'Sữa & Kem', 'Lon', 32.00, 12.00, 24000.00, 'Tồn an toàn'),
(5, 'SYRUP-VANILLA', 'Syrup Monin Vanilla 700ml', 'Syrup & Sốt', 'Chai', 2.00, 3.00, 220000.00, 'CẢNH BÁO: Tồn kho thấp'),
(6, 'SYRUP-CARAMEL', 'Syrup Monin Caramel 700ml', 'Syrup & Sốt', 'Chai', 5.00, 3.00, 220000.00, 'Tồn an toàn'),
(7, 'CUP-HOT-8OZ', 'Ly giấy nóng 8oz có nắp', 'Bao bì & Ly tách', 'Cây (50 cái)', 18.00, 10.00, 48000.00, 'Dùng cho espresso/latte'),
(8, 'CUP-COLD-12OZ', 'Ly nhựa takeaway 12oz', 'Bao bì & Ly tách', 'Cây (50 cái)', 25.00, 15.00, 52000.00, 'Đồ uống đá');

-- Phiếu xuất kho mẫu
INSERT INTO `stock_issues` (`id`, `issue_code`, `issue_date`, `created_by_user_id`, `shift_name`, `total_items`, `notes`) VALUES
(1, 'XK-20261116-01', CURDATE(), 2, 'Ca Sáng (S1)', 3, 'Xuất nguyên liệu đầu ngày cho quầy pha chế');

INSERT INTO `stock_issue_items` (`id`, `stock_issue_id`, `inventory_item_id`, `quantity`, `notes`) VALUES
(1, 1, 1, 2.00, '2kg Robusta'),
(2, 1, 3, 4.00, '4 hộp Dalat Milk'),
(3, 1, 4, 3.00, '3 lon sữa đặc');

-- Báo cáo POS cuối ngày mẫu
INSERT INTO `pos_reports` (`id`, `report_date`, `created_by_user_id`, `pos_machine_revenue`, `bank_transfer_amount`, `app_delivery_revenue`, `total_expenses`, `actual_cash_submitted`, `status`, `notes`, `approved_by_user_id`) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 2, 8560000.00, 4200000.00, 1850000.00, 260000.00, 2250000.00, 'APPROVED', 'Đã nộp đủ tiền mặt vào két an toàn', 1);

INSERT INTO `pos_report_expenses` (`id`, `report_id`, `expense_name`, `amount`) VALUES
(1, 1, 'Mua đá cây ca chiều', 60000.00),
(2, 1, 'Mua chanh & sả tươi', 80000.00),
(3, 1, 'Sửa bóng đèn toilet tầng 2', 120000.00);

-- Settings
INSERT INTO `shop_settings` (`setting_key`, `setting_value`, `description`) VALUES
('SHOP_NAME', 'Coffee Lab - HR & POS v2', 'Tên thương hiệu cửa hàng'),
('QR_REFRESH_INTERVAL_SECONDS', '30', 'Chu kỳ đổi QR động'),
('LATE_GRACE_PERIOD_MINUTES', '10', 'Thời gian ân hạn trễ');
