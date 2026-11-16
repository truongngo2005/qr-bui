-- Flyway Schema Migration V1
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    `position` VARCHAR(50) NOT NULL,
    `hourly_rate` DECIMAL(12, 2) NOT NULL DEFAULT 25000.00,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `otp_verifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `identifier` VARCHAR(100) NOT NULL,
    `otp_code` VARCHAR(10) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `shift_templates` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `min_employees` INT NOT NULL DEFAULT 2,
    `salary_multiplier` DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `shift_assignments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `shift_template_id` BIGINT NOT NULL,
    `work_date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_assign_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_assign_shift` FOREIGN KEY (`shift_template_id`) REFERENCES `shift_templates`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `attendances` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `assignment_id` BIGINT NULL,
    `user_id` BIGINT NOT NULL,
    `check_in_time` TIMESTAMP NULL,
    `check_out_time` TIMESTAMP NULL,
    `work_hours` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ON_TIME',
    `notes` TEXT NULL,
    `qr_token` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_att_assign` FOREIGN KEY (`assignment_id`) REFERENCES `shift_assignments`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_att_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `shift_exchange_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sender_id` BIGINT NOT NULL,
    `receiver_id` BIGINT NULL,
    `sender_assignment_id` BIGINT NOT NULL,
    `receiver_assignment_id` BIGINT NULL,
    `request_type` VARCHAR(20) NOT NULL DEFAULT 'EXCHANGE',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `reason` TEXT NOT NULL,
    `manager_note` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_req_sender` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_req_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_req_sender_assign` FOREIGN KEY (`sender_assignment_id`) REFERENCES `shift_assignments`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_req_recv_assign` FOREIGN KEY (`receiver_assignment_id`) REFERENCES `shift_assignments`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `shop_settings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(50) NOT NULL UNIQUE,
    `setting_value` TEXT NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
