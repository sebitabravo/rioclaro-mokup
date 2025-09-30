-- ------------------------------------------------------------
-- Esquema inicial y datos mock para el proyecto Río Claro (MySQL)
-- Generado a partir de los repositorios mock existentes en src/infrastructure/adapters
-- ------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `rioclaro_mokup`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `rioclaro_mokup`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- ------------------------------------------------------------
-- Eliminación previa de tablas (para ambientes de desarrollo)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `report_critical_events`;
DROP TABLE IF EXISTS `report_daily_averages`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `measurements`;
DROP TABLE IF EXISTS `user_assigned_stations`;
DROP TABLE IF EXISTS `alerts`;
DROP TABLE IF EXISTS `variable_modules`;
DROP TABLE IF EXISTS `stations`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------------
-- Tabla: users
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `is_staff` TINYINT(1) NOT NULL DEFAULT 0,
  `is_superuser` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `username`, `email`, `first_name`, `last_name`, `role`, `is_staff`, `is_superuser`, `created_at`, `updated_at`) VALUES
  (1, 'admin.gobierno', 'admin@digital.gob.cl', 'María', 'González', 'Administrador', 1, 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (2, 'tecnico.pucon', 'tecnico@pucon.cl', 'Carlos', 'Martínez', 'Técnico', 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
  (3, 'observador.regional', 'observador@araucania.gob.cl', 'Ana', 'López', 'Observador', 0, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- ------------------------------------------------------------
-- Tabla: stations
-- ------------------------------------------------------------
CREATE TABLE `stations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `location` VARCHAR(200) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `status` ENUM('active','maintenance','inactive') NOT NULL DEFAULT 'active',
  `latitude` DECIMAL(10,6) NOT NULL,
  `longitude` DECIMAL(10,6) NOT NULL,
  `current_level` DECIMAL(5,2) NOT NULL,
  `threshold` DECIMAL(5,2) NOT NULL,
  `last_measurement` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `stations` (`id`, `name`, `location`, `code`, `status`, `latitude`, `longitude`, `current_level`, `threshold`, `last_measurement`, `created_at`, `updated_at`) VALUES
  (1, 'Estación Río Claro Norte', 'Pucón Norte, Región de La Araucanía', 'RCN-001', 'active', -39.290745, -71.931994, 2.45, 3.00, '2025-01-13 10:30:00', '2025-01-01 00:00:00', '2025-01-13 10:30:00'),
  (2, 'Estación Río Claro Centro', 'Pucón Centro, Región de La Araucanía', 'RCC-002', 'active', -39.283331, -71.938868, 1.85, 2.50, '2025-01-13 10:30:00', '2025-01-01 00:00:00', '2025-01-13 10:30:00'),
  (3, 'Estación Río Claro Sur', 'Pucón Sur, Región de La Araucanía', 'RCS-003', 'maintenance', -39.281843, -71.940563, 3.20, 3.50, '2025-01-13 09:45:00', '2025-01-01 00:00:00', '2025-01-13 09:45:00');

-- ------------------------------------------------------------
-- Tabla: variable_modules
-- ------------------------------------------------------------
CREATE TABLE `variable_modules` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `variable_type` VARCHAR(50) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 0,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `variable_modules` (`id`, `name`, `variable_type`, `unit`, `description`, `is_active`, `is_default`, `created_at`) VALUES
  (1, 'Nivel del Agua', 'water_level', 'm', 'Variable principal del sistema de monitoreo', 1, 1, '2025-01-01 00:00:00'),
  (2, 'Turbidez del Agua', 'turbidity', 'NTU', 'Medición de la calidad del agua', 0, 0, '2025-01-01 00:00:00'),
  (3, 'Temperatura del Agua', 'temperature', '°C', 'Temperatura del agua y ambiente', 0, 0, '2025-01-01 00:00:00');

-- ------------------------------------------------------------
-- Tabla: alerts
-- ------------------------------------------------------------
CREATE TABLE `alerts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `station_id` INT NOT NULL,
  `station_name` VARCHAR(150) NOT NULL,
  `variable_type` VARCHAR(50) NOT NULL,
  `threshold_value` DECIMAL(5,2) NOT NULL,
  `current_value` DECIMAL(5,2) NOT NULL,
  `alert_type` VARCHAR(50) NOT NULL,
  `message` VARCHAR(255) NOT NULL,
  `severity` ENUM('low','medium','high','critical') NOT NULL DEFAULT 'low',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL,
  `resolved_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `alerts` (`id`, `station_id`, `station_name`, `variable_type`, `threshold_value`, `current_value`, `alert_type`, `message`, `severity`, `is_active`, `created_at`, `resolved_at`) VALUES
  (1, 3, 'Estación Río Claro Sur', 'water_level', 3.00, 3.20, 'high_level', 'Nivel del agua superó el umbral crítico (3.2m > 3.0m)', 'high', 1, '2025-01-13 09:45:00', NULL),
  (2, 1, 'Estación Río Claro Norte', 'water_level', 3.00, 2.45, 'maintenance', 'Mantenimiento programado completado', 'low', 0, '2025-01-12 14:30:00', '2025-01-12 16:00:00');

-- ------------------------------------------------------------
-- Tabla pivote: user_assigned_stations
-- ------------------------------------------------------------
CREATE TABLE `user_assigned_stations` (
  `user_id` INT NOT NULL,
  `station_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `station_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `user_assigned_stations` (`user_id`, `station_id`) VALUES
  (1, 1), (1, 2), (1, 3),
  (2, 1), (2, 2),
  (3, 3);

-- ------------------------------------------------------------
-- Tabla: measurements
-- ------------------------------------------------------------
CREATE TABLE `measurements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `station_id` INT NOT NULL,
  `station_name` VARCHAR(150) NOT NULL,
  `variable_type` VARCHAR(50) NOT NULL,
  `value` DECIMAL(6,3) NOT NULL,
  `unit` VARCHAR(10) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  `is_critical` TINYINT(1) NOT NULL DEFAULT 0,
  `quality` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `measurements` (`id`, `station_id`, `station_name`, `variable_type`, `value`, `unit`, `timestamp`, `is_critical`, `quality`) VALUES
  (1, 1, 'Estación Río Claro Norte', 'water_level', 2.440, 'm', '2025-01-10 11:30:00', 0, 'good'),
  (2, 2, 'Estación Río Claro Centro', 'water_level', 1.807, 'm', '2025-01-10 12:30:00', 0, 'good'),
  (3, 3, 'Estación Río Claro Sur', 'water_level', 3.179, 'm', '2025-01-10 13:30:00', 0, 'good'),
  (4, 1, 'Estación Río Claro Norte', 'water_level', 2.497, 'm', '2025-01-10 14:30:00', 0, 'good'),
  (5, 2, 'Estación Río Claro Centro', 'water_level', 2.116, 'm', '2025-01-10 15:30:00', 0, 'good'),
  (6, 3, 'Estación Río Claro Sur', 'water_level', 3.597, 'm', '2025-01-10 16:30:00', 0, 'good'),
  (7, 1, 'Estación Río Claro Norte', 'water_level', 2.822, 'm', '2025-01-10 17:30:00', 0, 'good'),
  (8, 2, 'Estación Río Claro Centro', 'water_level', 2.272, 'm', '2025-01-10 18:30:00', 0, 'good'),
  (9, 3, 'Estación Río Claro Sur', 'water_level', 3.285, 'm', '2025-01-10 19:30:00', 0, 'good'),
  (10, 1, 'Estación Río Claro Norte', 'water_level', 2.455, 'm', '2025-01-10 20:30:00', 0, 'good'),
  (11, 2, 'Estación Río Claro Centro', 'water_level', 1.896, 'm', '2025-01-10 21:30:00', 0, 'good'),
  (12, 3, 'Estación Río Claro Sur', 'water_level', 2.907, 'm', '2025-01-10 22:30:00', 0, 'good'),
  (13, 1, 'Estación Río Claro Norte', 'water_level', 2.170, 'm', '2025-01-10 23:30:00', 0, 'good'),
  (14, 2, 'Estación Río Claro Centro', 'water_level', 1.415, 'm', '2025-01-11 00:30:00', 0, 'good'),
  (15, 3, 'Estación Río Claro Sur', 'water_level', 2.649, 'm', '2025-01-11 01:30:00', 0, 'good'),
  (16, 1, 'Estación Río Claro Norte', 'water_level', 1.959, 'm', '2025-01-11 02:30:00', 0, 'good'),
  (17, 2, 'Estación Río Claro Centro', 'water_level', 1.377, 'm', '2025-01-11 03:30:00', 0, 'good'),
  (18, 3, 'Estación Río Claro Sur', 'water_level', 2.696, 'm', '2025-01-11 04:30:00', 0, 'good'),
  (19, 1, 'Estación Río Claro Norte', 'water_level', 2.130, 'm', '2025-01-11 05:30:00', 0, 'good'),
  (20, 2, 'Estación Río Claro Centro', 'water_level', 1.452, 'm', '2025-01-11 06:30:00', 0, 'good'),
  (21, 3, 'Estación Río Claro Sur', 'water_level', 2.883, 'm', '2025-01-11 07:30:00', 0, 'good'),
  (22, 1, 'Estación Río Claro Norte', 'water_level', 2.220, 'm', '2025-01-11 08:30:00', 0, 'good'),
  (23, 2, 'Estación Río Claro Centro', 'water_level', 1.985, 'm', '2025-01-11 09:30:00', 0, 'good'),
  (24, 3, 'Estación Río Claro Sur', 'water_level', 3.472, 'm', '2025-01-11 10:30:00', 0, 'good'),
  (25, 1, 'Estación Río Claro Norte', 'water_level', 2.581, 'm', '2025-01-11 11:30:00', 0, 'good'),
  (26, 2, 'Estación Río Claro Centro', 'water_level', 2.181, 'm', '2025-01-11 12:30:00', 0, 'good'),
  (27, 3, 'Estación Río Claro Sur', 'water_level', 3.535, 'm', '2025-01-11 13:30:00', 0, 'good'),
  (28, 1, 'Estación Río Claro Norte', 'water_level', 2.604, 'm', '2025-01-11 14:30:00', 0, 'good'),
  (29, 2, 'Estación Río Claro Centro', 'water_level', 2.177, 'm', '2025-01-11 15:30:00', 0, 'good'),
  (30, 3, 'Estación Río Claro Sur', 'water_level', 3.271, 'm', '2025-01-11 16:30:00', 0, 'good'),
  (31, 1, 'Estación Río Claro Norte', 'water_level', 2.485, 'm', '2025-01-11 17:30:00', 0, 'good'),
  (32, 2, 'Estación Río Claro Centro', 'water_level', 1.976, 'm', '2025-01-11 18:30:00', 0, 'good'),
  (33, 3, 'Estación Río Claro Sur', 'water_level', 2.999, 'm', '2025-01-11 19:30:00', 0, 'good'),
  (34, 1, 'Estación Río Claro Norte', 'water_level', 2.201, 'm', '2025-01-11 20:30:00', 0, 'good'),
  (35, 2, 'Estación Río Claro Centro', 'water_level', 1.588, 'm', '2025-01-11 21:30:00', 0, 'good'),
  (36, 3, 'Estación Río Claro Sur', 'water_level', 2.744, 'm', '2025-01-11 22:30:00', 0, 'good'),
  (37, 1, 'Estación Río Claro Norte', 'water_level', 1.766, 'm', '2025-01-11 23:30:00', 0, 'good'),
  (38, 2, 'Estación Río Claro Centro', 'water_level', 1.376, 'm', '2025-01-12 00:30:00', 0, 'good'),
  (39, 3, 'Estación Río Claro Sur', 'water_level', 2.736, 'm', '2025-01-12 01:30:00', 0, 'good'),
  (40, 1, 'Estación Río Claro Norte', 'water_level', 1.920, 'm', '2025-01-12 02:30:00', 0, 'good'),
  (41, 2, 'Estación Río Claro Centro', 'water_level', 1.565, 'm', '2025-01-12 03:30:00', 0, 'good'),
  (42, 3, 'Estación Río Claro Sur', 'water_level', 3.063, 'm', '2025-01-12 04:30:00', 0, 'good'),
  (43, 1, 'Estación Río Claro Norte', 'water_level', 2.392, 'm', '2025-01-12 05:30:00', 0, 'good'),
  (44, 2, 'Estación Río Claro Centro', 'water_level', 1.870, 'm', '2025-01-12 06:30:00', 0, 'good'),
  (45, 3, 'Estación Río Claro Sur', 'water_level', 3.450, 'm', '2025-01-12 07:30:00', 0, 'good'),
  (46, 1, 'Estación Río Claro Norte', 'water_level', 2.624, 'm', '2025-01-12 08:30:00', 0, 'good'),
  (47, 2, 'Estación Río Claro Centro', 'water_level', 2.056, 'm', '2025-01-12 09:30:00', 0, 'good'),
  (48, 3, 'Estación Río Claro Sur', 'water_level', 3.471, 'm', '2025-01-12 10:30:00', 0, 'good'),
  (49, 1, 'Estación Río Claro Norte', 'water_level', 2.741, 'm', '2025-01-12 11:30:00', 0, 'good'),
  (50, 2, 'Estación Río Claro Centro', 'water_level', 2.170, 'm', '2025-01-12 12:30:00', 0, 'good'),
  (51, 3, 'Estación Río Claro Sur', 'water_level', 3.324, 'm', '2025-01-12 13:30:00', 0, 'good'),
  (52, 1, 'Estación Río Claro Norte', 'water_level', 2.565, 'm', '2025-01-12 14:30:00', 0, 'good'),
  (53, 2, 'Estación Río Claro Centro', 'water_level', 1.897, 'm', '2025-01-12 15:30:00', 0, 'good'),
  (54, 3, 'Estación Río Claro Sur', 'water_level', 3.143, 'm', '2025-01-12 16:30:00', 0, 'good'),
  (55, 1, 'Estación Río Claro Norte', 'water_level', 2.086, 'm', '2025-01-12 17:30:00', 0, 'good'),
  (56, 2, 'Estación Río Claro Centro', 'water_level', 1.459, 'm', '2025-01-12 18:30:00', 0, 'good'),
  (57, 3, 'Estación Río Claro Sur', 'water_level', 2.742, 'm', '2025-01-12 19:30:00', 0, 'good'),
  (58, 1, 'Estación Río Claro Norte', 'water_level', 1.773, 'm', '2025-01-12 20:30:00', 0, 'good'),
  (59, 2, 'Estación Río Claro Centro', 'water_level', 1.312, 'm', '2025-01-12 21:30:00', 0, 'good'),
  (60, 3, 'Estación Río Claro Sur', 'water_level', 2.594, 'm', '2025-01-12 22:30:00', 0, 'good'),
  (61, 1, 'Estación Río Claro Norte', 'water_level', 2.105, 'm', '2025-01-12 23:30:00', 0, 'good'),
  (62, 2, 'Estación Río Claro Centro', 'water_level', 1.555, 'm', '2025-01-13 00:30:00', 0, 'good'),
  (63, 3, 'Estación Río Claro Sur', 'water_level', 2.953, 'm', '2025-01-13 01:30:00', 0, 'good'),
  (64, 1, 'Estación Río Claro Norte', 'water_level', 2.329, 'm', '2025-01-13 02:30:00', 0, 'good'),
  (65, 2, 'Estación Río Claro Centro', 'water_level', 2.054, 'm', '2025-01-13 03:30:00', 0, 'good'),
  (66, 3, 'Estación Río Claro Sur', 'water_level', 3.308, 'm', '2025-01-13 04:30:00', 0, 'good'),
  (67, 1, 'Estación Río Claro Norte', 'water_level', 2.516, 'm', '2025-01-13 05:30:00', 0, 'good'),
  (68, 2, 'Estación Río Claro Centro', 'water_level', 2.186, 'm', '2025-01-13 06:30:00', 0, 'good'),
  (69, 3, 'Estación Río Claro Sur', 'water_level', 3.405, 'm', '2025-01-13 07:30:00', 0, 'good'),
  (70, 1, 'Estación Río Claro Norte', 'water_level', 2.764, 'm', '2025-01-13 08:30:00', 0, 'good'),
  (71, 2, 'Estación Río Claro Centro', 'water_level', 2.073, 'm', '2025-01-13 09:30:00', 0, 'good'),
  (72, 3, 'Estación Río Claro Sur', 'water_level', 3.401, 'm', '2025-01-13 10:30:00', 0, 'good');

-- ------------------------------------------------------------
-- Tabla: activity_logs
-- ------------------------------------------------------------
CREATE TABLE `activity_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `timestamp` DATETIME NOT NULL,
  `user_id` INT NULL,
  `user_name` VARCHAR(120) NULL,
  `activity_type` VARCHAR(60) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('success','info','warning','error') NOT NULL DEFAULT 'info',
  `station_id` INT NULL,
  `station_name` VARCHAR(150) NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `activity_logs` (`id`, `timestamp`, `user_id`, `user_name`, `activity_type`, `title`, `description`, `status`, `station_id`, `station_name`, `ip_address`, `user_agent`, `metadata`, `created_at`) VALUES
  (1, '2025-08-27 14:30:00', 1, 'María González', 'report_generated', 'Reporte diario generado', 'Se generó automáticamente el reporte diario del Río Claro', 'success', 1, 'Estación Río Claro Norte', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', JSON_OBJECT('report_type', 'daily', 'format', 'PDF'), '2025-08-27 14:30:00'),
  (2, '2025-08-27 14:15:00', 2, 'Carlos Martínez', 'alert_triggered', 'Alerta de nivel crítico', 'Se activó alerta por nivel de agua superior al umbral crítico', 'warning', 3, 'Estación Río Claro Sur', '192.168.1.105', NULL, JSON_OBJECT('level', 3.2, 'threshold', 3.0, 'alert_id', 15), '2025-08-27 14:15:00'),
  (3, '2025-08-27 13:45:00', 1, 'María González', 'station_updated', 'Configuración de estación actualizada', 'Se actualizó el umbral de alerta para la estación centro', 'success', 2, 'Estación Río Claro Centro', '192.168.1.100', NULL, JSON_OBJECT('old_threshold', 2.3, 'new_threshold', 2.5), '2025-08-27 13:45:00'),
  (4, '2025-08-27 13:30:00', 3, 'Ana López', 'user_login', 'Inicio de sesión', 'Usuario ingresó al sistema', 'info', NULL, NULL, '192.168.1.110', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NULL, '2025-08-27 13:30:00'),
  (5, '2025-08-27 12:00:00', NULL, NULL, 'measurement_recorded', 'Medición automática registrada', 'Se registró nueva medición de nivel de agua', 'success', 1, 'Estación Río Claro Norte', NULL, NULL, JSON_OBJECT('water_level', 2.45, 'flow_rate', 14.2), '2025-08-27 12:00:00'),
  (6, '2025-08-27 11:30:00', 2, 'Carlos Martínez', 'report_downloaded', 'Reporte descargado', 'Se descargó el informe semanal de nivel y riesgo hídrico', 'success', NULL, NULL, '192.168.1.105', NULL, JSON_OBJECT('report_id', 'weekly_2025_34', 'format', 'PDF'), '2025-08-27 11:30:00'),
  (7, '2025-08-27 11:00:00', NULL, NULL, 'system_maintenance', 'Mantenimiento del sistema', 'Se realizó mantenimiento programado de la base de datos', 'info', NULL, NULL, NULL, NULL, JSON_OBJECT('duration_minutes', 15, 'affected_services', JSON_ARRAY('api', 'database')), '2025-08-27 11:00:00'),
  (8, '2025-08-27 10:45:00', 1, 'María González', 'alert_resolved', 'Alerta resuelta', 'Se marcó como resuelta la alerta de nivel crítico', 'success', 3, 'Estación Río Claro Sur', '192.168.1.100', NULL, JSON_OBJECT('alert_id', 14, 'resolution_time_minutes', 30), '2025-08-27 10:45:00'),
  (9, '2025-08-27 09:30:00', 2, 'Carlos Martínez', 'configuration_changed', 'Configuración modificada', 'Se actualizó la frecuencia de medición automática', 'warning', NULL, NULL, NULL, NULL, JSON_OBJECT('old_frequency', 30, 'new_frequency', 15, 'unit', 'minutes'), '2025-08-27 09:30:00'),
  (10, '2025-08-27 08:00:00', NULL, NULL, 'backup_created', 'Respaldo automático', 'Se creó respaldo automático del sistema', 'success', NULL, NULL, NULL, NULL, JSON_OBJECT('backup_size_mb', 245, 'location', 'cloud_storage'), '2025-08-27 08:00:00');

-- ------------------------------------------------------------
-- Tabla: report_daily_averages
-- ------------------------------------------------------------
CREATE TABLE `report_daily_averages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `station_name` VARCHAR(150) NOT NULL,
  `average_value` DECIMAL(5,2) NOT NULL,
  `min_value` DECIMAL(5,2) NOT NULL,
  `max_value` DECIMAL(5,2) NOT NULL,
  `measurement_count` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `report_daily_averages` (`id`, `date`, `station_name`, `average_value`, `min_value`, `max_value`, `measurement_count`) VALUES
  (1, '2025-01-07', 'Río Claro Norte', 2.10, 1.90, 2.30, 96),
  (2, '2025-01-08', 'Río Claro Norte', 2.30, 2.10, 2.50, 96),
  (3, '2025-01-09', 'Río Claro Norte', 2.80, 2.40, 3.10, 96),
  (4, '2025-01-10', 'Río Claro Norte', 2.60, 2.30, 2.90, 96),
  (5, '2025-01-11', 'Río Claro Norte', 2.40, 2.20, 2.70, 96),
  (6, '2025-01-12', 'Río Claro Norte', 2.20, 2.00, 2.40, 96),
  (7, '2025-01-13', 'Río Claro Norte', 2.50, 2.30, 2.70, 96);

-- ------------------------------------------------------------
-- Tabla: report_critical_events
-- ------------------------------------------------------------
CREATE TABLE `report_critical_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `station_name` VARCHAR(150) NOT NULL,
  `water_level` DECIMAL(5,2) NOT NULL,
  `threshold` DECIMAL(5,2) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  `duration_minutes` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `report_critical_events` (`id`, `station_name`, `water_level`, `threshold`, `timestamp`, `duration_minutes`) VALUES
  (1, 'Río Claro Sur', 3.20, 3.00, '2025-01-13 09:45:00', 45),
  (2, 'Río Claro Norte', 3.10, 3.00, '2025-01-11 15:20:00', 120);

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
