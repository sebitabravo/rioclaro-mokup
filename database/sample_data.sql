-- ------------------------------------------------------------
-- Datos de prueba completos para Base de Datos Río Claro
-- Incluye ejemplos realistas para todas las tablas y escenarios
-- Ejecutar después de rioclaro_schema.sql
-- ------------------------------------------------------------

USE `rioclaro_mokup`;

SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- Limpiar datos existentes (mantener solo estructura)
DELETE FROM `report_critical_events`;
DELETE FROM `report_daily_averages`;
DELETE FROM `activity_logs`;
DELETE FROM `alerts`;
DELETE FROM `measurements`;
DELETE FROM `sensor_readings`;
DELETE FROM `thresholds`;
DELETE FROM `measurement_configurations`;
DELETE FROM `sensors`;
DELETE FROM `station_assignments`;
DELETE FROM `variable_modules`;
DELETE FROM `stations`;
DELETE FROM `users`;

-- Reiniciar auto_increment
ALTER TABLE `users` AUTO_INCREMENT = 1;
ALTER TABLE `stations` AUTO_INCREMENT = 1;
ALTER TABLE `sensors` AUTO_INCREMENT = 1;
ALTER TABLE `thresholds` AUTO_INCREMENT = 1;
ALTER TABLE `measurements` AUTO_INCREMENT = 1;
ALTER TABLE `alerts` AUTO_INCREMENT = 1;

-- ------------------------------------------------------------
-- USUARIOS COMPLETOS (diferentes roles y estados)
-- ------------------------------------------------------------
INSERT INTO `users` (`id`, `password`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_superuser`, `role`, `is_active`, `last_login`) VALUES
-- Administradores
(1, 'pbkdf2_sha256$600000$salt1$hash1', 'admin.gobierno', 'María', 'González', 'admin@digital.gob.cl', 1, 1, 'admin', 1, '2025-01-13 08:00:00'),
(2, 'pbkdf2_sha256$600000$salt2$hash2', 'admin.emergencias', 'Roberto', 'Silva', 'emergencias@onemi.gob.cl', 1, 1, 'admin', 1, '2025-01-12 15:30:00'),

-- Técnicos
(3, 'pbkdf2_sha256$600000$salt3$hash3', 'tecnico.pucon', 'Carlos', 'Martínez', 'tecnico@pucon.cl', 1, 0, 'technician', 1, '2025-01-13 07:45:00'),
(4, 'pbkdf2_sha256$600000$salt4$hash4', 'tecnico.villarrica', 'Andrea', 'Morales', 'amorales@villarrica.cl', 1, 0, 'technician', 1, '2025-01-12 16:20:00'),
(5, 'pbkdf2_sha256$600000$salt5$hash5', 'tecnico.campo', 'Luis', 'Hernández', 'lhernandez@dga.cl', 1, 0, 'technician', 0, NULL), -- Usuario inactivo

-- Observadores
(6, 'pbkdf2_sha256$600000$salt6$hash6', 'observador.regional', 'Ana', 'López', 'observador@araucania.gob.cl', 0, 0, 'observer', 1, '2025-01-13 09:15:00'),
(7, 'pbkdf2_sha256$600000$salt7$hash7', 'observador.municipal', 'Jorge', 'Ramírez', 'jramirez@pucon.cl', 0, 0, 'observer', 1, '2025-01-12 14:00:00'),
(8, 'pbkdf2_sha256$600000$salt8$hash8', 'observador.comunidad', 'Patricia', 'Flores', 'pflores@vecinospucon.cl', 0, 0, 'observer', 1, '2025-01-11 18:30:00');

-- ------------------------------------------------------------
-- ESTACIONES DE MONITOREO (diferentes ubicaciones y estados)
-- ------------------------------------------------------------
INSERT INTO `stations` (`id`, `name`, `code`, `latitude`, `longitude`, `description`, `is_active`) VALUES
(1, 'Estación Río Claro Norte', 'RCN-001', -39.29074500, -71.93199400, 'Estación de monitoreo ubicada en el sector norte del río, cerca del puente principal de Pucón. Zona de mayor flujo turístico.', 1),
(2, 'Estación Río Claro Centro', 'RCC-002', -39.28333100, -71.93886800, 'Estación central de monitoreo ubicada en el sector comercial de Pucón. Punto crítico para actividades comerciales.', 1),
(3, 'Estación Río Claro Sur', 'RCS-003', -39.28184300, -71.94056300, 'Estación de monitoreo ubicada en el sector sur del río, zona residencial. Área de mayor riesgo por viviendas cercanas.', 1),
(4, 'Estación Villarrica Confluencia', 'VLC-004', -39.27500000, -71.94500000, 'Estación en la confluencia con el río Villarrica. Punto estratégico para medición de caudales combinados.', 1),
(5, 'Estación Cabecera Norte', 'RCH-005', -39.25000000, -71.90000000, 'Estación en la cabecera norte del río, zona montañosa. Importante para pronósticos tempranos.', 0), -- Estación inactiva
(6, 'Estación Desembocadura', 'RCD-006', -39.30000000, -71.95000000, 'Estación cerca de la desembocadura en el lago Villarrica. Control final del sistema hídrico.', 1);

-- ------------------------------------------------------------
-- ASIGNACIONES DE USUARIOS A ESTACIONES
-- ------------------------------------------------------------
INSERT INTO `station_assignments` (`user_id`, `station_id`, `assigned_by_id`) VALUES
-- Administradores tienen acceso a todas las estaciones
(1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 6, 1),
(2, 1, 1), (2, 2, 1), (2, 3, 1), (2, 4, 1), (2, 6, 1),

-- Técnicos por zona
(3, 1, 1), (3, 2, 1), (3, 3, 1), -- Técnico Pucón: estaciones urbanas
(4, 4, 1), (4, 6, 1),             -- Técnico Villarrica: estaciones periféricas

-- Observadores específicos
(6, 1, 1), (6, 2, 1), (6, 3, 1),  -- Observador regional: zona crítica
(7, 2, 1), (7, 3, 1),             -- Observador municipal: zona urbana
(8, 3, 1);                        -- Observador comunidad: zona residencial

-- ------------------------------------------------------------
-- SENSORES (diferentes tipos por estación)
-- ------------------------------------------------------------
INSERT INTO `sensors` (`id`, `station_id`, `name`, `sensor_type`, `unit`, `is_active`, `calibration_factor`) VALUES
-- Estación Norte - Completa
(1, 1, 'Sensor Nivel Agua Norte', 'water_level', 'm', 1, 1.0250),
(2, 1, 'Sensor Temperatura Norte', 'temperature', '°C', 1, 0.9800),
(3, 1, 'Sensor Caudal Norte', 'flow_rate', 'l/s', 1, 1.0150),

-- Estación Centro - Básica
(4, 2, 'Sensor Nivel Agua Centro', 'water_level', 'm', 1, 1.0100),
(5, 2, 'Sensor Temperatura Centro', 'temperature', '°C', 1, 1.0000),

-- Estación Sur - Completa con pH
(6, 3, 'Sensor Nivel Agua Sur', 'water_level', 'm', 1, 0.9950),
(7, 3, 'Sensor Temperatura Sur', 'temperature', '°C', 1, 1.0200),
(8, 3, 'Sensor pH Sur', 'ph', 'pH', 1, 1.0000),

-- Estación Villarrica - Avanzada
(9, 4, 'Sensor Nivel Villarrica', 'water_level', 'm', 1, 1.0000),
(10, 4, 'Sensor Caudal Villarrica', 'flow_rate', 'l/s', 1, 1.0300),
(11, 4, 'Sensor Temperatura Villarrica', 'temperature', '°C', 1, 0.9900),

-- Estación Desembocadura
(12, 6, 'Sensor Nivel Desembocadura', 'water_level', 'm', 1, 1.0080),
(13, 6, 'Sensor Temperatura Desembocadura', 'temperature', '°C', 0, 1.0000); -- Sensor inactivo

-- ------------------------------------------------------------
-- CONFIGURACIONES DE MEDICIÓN
-- ------------------------------------------------------------
INSERT INTO `measurement_configurations` (`station_id`, `measurement_interval_minutes`, `data_retention_days`, `auto_alerts_enabled`, `notification_email`) VALUES
(1, 15, 365, 1, 'alertas@pucon.cl'),
(2, 10, 365, 1, 'alertas@pucon.cl'),         -- Intervalo más frecuente (zona comercial)
(3, 15, 730, 1, 'emergencias@pucon.cl'),     -- Retención más larga (zona residencial)
(4, 20, 365, 1, 'monitoreo@villarrica.cl'),
(6, 30, 180, 0, NULL);                       -- Sin alertas automáticas

-- ------------------------------------------------------------
-- UMBRALES CONFIGURADOS
-- ------------------------------------------------------------
INSERT INTO `thresholds` (`station_id`, `measurement_type`, `warning_min`, `warning_max`, `critical_min`, `critical_max`, `unit`, `created_by_id`, `notes`) VALUES
-- Umbrales de nivel de agua
(1, 'water_level', 0.50, 2.50, 0.30, 3.00, 'm', 1, 'Umbrales estándar para zona turística'),
(2, 'water_level', 0.80, 2.00, 0.50, 2.50, 'm', 1, 'Umbrales conservadores para zona comercial'),
(3, 'water_level', 0.60, 3.00, 0.40, 3.50, 'm', 1, 'Umbrales ajustados para zona residencial de mayor riesgo'),
(4, 'water_level', 1.00, 4.00, 0.70, 5.00, 'm', 1, 'Umbrales para confluencia - mayor capacidad'),
(6, 'water_level', 0.50, 2.50, 0.30, 3.00, 'm', 1, 'Umbrales desembocadura'),

-- Umbrales de temperatura
(1, 'temperature', 5.0, 25.0, 2.0, 30.0, '°C', 3, 'Rango normal para ecosistema local'),
(2, 'temperature', 5.0, 25.0, 2.0, 30.0, '°C', 3, NULL),
(3, 'temperature', 5.0, 25.0, 2.0, 30.0, '°C', 3, NULL),

-- Umbrales de caudal
(1, 'flow_rate', 50.0, 800.0, 20.0, 1000.0, 'l/s', 1, 'Caudal normal para época estival'),
(4, 'flow_rate', 100.0, 1500.0, 50.0, 2000.0, 'l/s', 1, 'Caudal de confluencia'),

-- Umbrales de pH
(3, 'ph', 6.5, 8.5, 6.0, 9.0, 'pH', 3, 'Rango estándar para agua dulce');

-- ------------------------------------------------------------
-- LECTURAS DE SENSORES (datos recientes)
-- ------------------------------------------------------------
INSERT INTO `sensor_readings` (`sensor_id`, `value`, `timestamp`) VALUES
-- Últimas 24 horas - Estación Norte
(1, 2.45, '2025-01-13 10:00:00'), (1, 2.47, '2025-01-13 10:15:00'), (1, 2.44, '2025-01-13 10:30:00'),
(2, 18.5, '2025-01-13 10:00:00'), (2, 18.7, '2025-01-13 10:15:00'), (2, 18.6, '2025-01-13 10:30:00'),
(3, 145.2, '2025-01-13 10:00:00'), (3, 147.8, '2025-01-13 10:15:00'), (3, 144.9, '2025-01-13 10:30:00'),

-- Estación Centro
(4, 1.85, '2025-01-13 10:10:00'), (4, 1.87, '2025-01-13 10:20:00'), (4, 1.86, '2025-01-13 10:30:00'),
(5, 19.2, '2025-01-13 10:10:00'), (5, 19.1, '2025-01-13 10:20:00'), (5, 19.3, '2025-01-13 10:30:00'),

-- Estación Sur - Con valor crítico
(6, 3.45, '2025-01-13 10:00:00'), (6, 3.52, '2025-01-13 10:15:00'), (6, 3.58, '2025-01-13 10:30:00'), -- Nivel crítico
(7, 17.8, '2025-01-13 10:00:00'), (7, 17.9, '2025-01-13 10:15:00'), (7, 18.0, '2025-01-13 10:30:00'),
(8, 7.2, '2025-01-13 10:00:00'), (8, 7.1, '2025-01-13 10:15:00'), (8, 7.3, '2025-01-13 10:30:00'),

-- Estación Villarrica
(9, 4.20, '2025-01-13 10:00:00'), (9, 4.18, '2025-01-13 10:20:00'), (9, 4.22, '2025-01-13 10:40:00'),
(10, 1245.5, '2025-01-13 10:00:00'), (10, 1248.2, '2025-01-13 10:20:00'), (10, 1243.8, '2025-01-13 10:40:00'),

-- Estación Desembocadura
(12, 1.95, '2025-01-13 10:00:00'), (12, 1.97, '2025-01-13 10:30:00'), (12, 1.96, '2025-01-13 11:00:00');

-- ------------------------------------------------------------
-- MEDICIONES PROCESADAS (con diferentes calidades)
-- ------------------------------------------------------------
INSERT INTO `measurements` (`station_id`, `sensor_id`, `measurement_type`, `value`, `raw_value`, `unit`, `quality_flag`, `timestamp`, `metadata`) VALUES
-- Mediciones de nivel de agua (últimas 48 horas)
(1, 1, 'water_level', 2.4500, 2.3902, 'm', 'good', '2025-01-13 10:30:00', '{"calibrated": true, "weather": "sunny"}'),
(2, 4, 'water_level', 1.8500, 1.8317, 'm', 'good', '2025-01-13 10:30:00', '{"calibrated": true, "weather": "sunny"}'),
(3, 6, 'water_level', 3.5800, 3.5981, 'm', 'good', '2025-01-13 10:30:00', '{"calibrated": true, "weather": "sunny", "alert_triggered": true}'),
(4, 9, 'water_level', 4.2200, 4.2200, 'm', 'good', '2025-01-13 10:40:00', '{"calibrated": true, "weather": "sunny"}'),
(6, 12, 'water_level', 1.9600, 1.9444, 'm', 'good', '2025-01-13 11:00:00', '{"calibrated": true, "weather": "sunny"}'),

-- Mediciones con problemas de calidad
(1, 1, 'water_level', 2.4700, 2.4100, 'm', 'suspect', '2025-01-13 10:15:00', '{"calibrated": true, "issue": "sensor_drift"}'),
(2, 4, 'water_level', 1.8700, 1.8500, 'm', 'poor', '2025-01-13 09:30:00', '{"calibrated": false, "issue": "communication_error"}'),

-- Mediciones de temperatura
(1, 2, 'temperature', 18.6, 19.0, '°C', 'good', '2025-01-13 10:30:00', '{"calibrated": true, "ambient": 22.5}'),
(2, 5, 'temperature', 19.3, 19.3, '°C', 'good', '2025-01-13 10:30:00', '{"calibrated": true, "ambient": 23.1}'),
(3, 7, 'temperature', 18.0, 17.6, '°C', 'good', '2025-01-13 10:30:00', '{"calibrated": true, "ambient": 21.8}'),

-- Mediciones de caudal
(1, 3, 'flow_rate', 144.9, 142.8, 'l/s', 'good', '2025-01-13 10:30:00', '{"calibrated": true, "velocity_avg": 1.2}'),
(4, 10, 'flow_rate', 1243.8, 1205.2, 'l/s', 'good', '2025-01-13 10:40:00', '{"calibrated": true, "velocity_avg": 2.1}'),

-- Medición de pH
(3, 8, 'ph', 7.3, 7.3, 'pH', 'good', '2025-01-13 10:30:00', '{"calibrated": true, "buffer_calibrated": "2025-01-10"}}');

-- ------------------------------------------------------------
-- ALERTAS (diferentes estados y niveles)
-- ------------------------------------------------------------
INSERT INTO `alerts` (`station_id`, `measurement_id`, `threshold_id`, `level`, `status`, `title`, `message`, `triggered_at`, `acknowledged_at`, `acknowledged_by_id`, `resolved_at`, `resolved_by_id`, `resolution_notes`, `metadata`) VALUES
-- Alerta crítica activa
(3, 3, 3, 'critical', 'active', 'NIVEL CRÍTICO - Estación Sur', 'El nivel del agua ha superado el umbral crítico (3.58m > 3.50m). Se requiere acción inmediata para evacuar zona residencial.', '2025-01-13 10:30:00', NULL, NULL, NULL, NULL, NULL, '{"auto_generated": true, "priority": "emergency", "affected_residents": 45}'),

-- Alerta de advertencia reconocida
(1, 1, 1, 'warning', 'acknowledged', 'Nivel de Advertencia - Estación Norte', 'El nivel del agua se acerca al umbral de advertencia (2.45m, umbral: 2.50m)', '2025-01-13 09:15:00', '2025-01-13 09:45:00', 3, NULL, NULL, NULL, '{"auto_generated": true, "trend": "stable"}'),

-- Alerta resuelta
(2, 7, 2, 'warning', 'resolved', 'Calidad de Datos Degradada', 'Se detectó degradación en la calidad de los datos del sensor de nivel', '2025-01-13 09:30:00', '2025-01-13 10:00:00', 3, '2025-01-13 10:15:00', 3, 'Problema de comunicación resuelto. Sensor recalibrado y funcionando normalmente.', '{"issue_type": "communication", "repair_time_minutes": 45}'),

-- Alerta informativa
(4, 4, 4, 'info', 'dismissed', 'Información - Caudal Normal', 'Los niveles de caudal en confluencia están dentro del rango normal esperado', '2025-01-13 08:00:00', '2025-01-13 08:30:00', 6, '2025-01-13 08:35:00', 6, 'Información rutinaria, sin acción requerida.', '{"auto_generated": true, "routine_check": true}');

-- ------------------------------------------------------------
-- MÓDULOS DE VARIABLES
-- ------------------------------------------------------------
INSERT INTO `variable_modules` (`id`, `name`, `variable_type`, `unit`, `description`, `is_active`, `is_default`) VALUES
(1, 'Nivel del Agua', 'water_level', 'm', 'Variable principal del sistema de monitoreo hidrológico', 1, 1),
(2, 'Temperatura del Agua', 'temperature', '°C', 'Temperatura del agua para monitoreo ambiental y calidad', 1, 0),
(3, 'Caudal', 'flow_rate', 'l/s', 'Medición de caudal para análisis hidrológico', 1, 0),
(4, 'pH del Agua', 'ph', 'pH', 'Nivel de acidez/alcalinidad para calidad del agua', 1, 0),
(5, 'Turbidez del Agua', 'turbidity', 'NTU', 'Medición de turbidez para calidad del agua', 0, 0),
(6, 'Conductividad', 'conductivity', 'µS/cm', 'Conductividad eléctrica del agua', 0, 0),
(7, 'Oxígeno Disuelto', 'dissolved_oxygen', 'mg/L', 'Concentración de oxígeno disuelto', 0, 0);

-- ------------------------------------------------------------
-- LOGS DE ACTIVIDAD (últimas actividades)
-- ------------------------------------------------------------
INSERT INTO `activity_logs` (`timestamp`, `user_id`, `user_name`, `activity_type`, `title`, `description`, `status`, `station_id`, `station_name`, `ip_address`, `user_agent`, `metadata`) VALUES
-- Actividades del sistema
('2025-01-13 10:30:15', NULL, 'Sistema', 'alert_triggered', 'Alerta crítica generada', 'Se generó alerta crítica por nivel de agua en Estación Sur', 'warning', 3, 'Estación Río Claro Sur', NULL, NULL, '{"alert_id": 1, "level": "critical", "auto_generated": true}'),

-- Actividades de usuarios
('2025-01-13 10:15:30', 3, 'Carlos Martínez', 'alert_resolved', 'Alerta de calidad resuelta', 'Se resolvió problema de calidad de datos en sensor de nivel', 'success', 2, 'Estación Río Claro Centro', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"alert_id": 3, "resolution_time_minutes": 45, "action": "sensor_recalibration"}'),

('2025-01-13 09:45:00', 3, 'Carlos Martínez', 'alert_acknowledged', 'Alerta de advertencia reconocida', 'Se reconoció alerta de nivel de advertencia en Estación Norte', 'info', 1, 'Estación Río Claro Norte', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"alert_id": 2, "response_time_minutes": 30}'),

('2025-01-13 09:30:00', 1, 'María González', 'threshold_updated', 'Umbral crítico actualizado', 'Se actualizó el umbral crítico para nivel de agua en Estación Sur', 'success', 3, 'Estación Río Claro Sur', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '{"threshold_type": "critical_max", "old_value": 3.50, "new_value": 3.50, "reason": "seasonal_adjustment"}'),

('2025-01-13 09:00:00', 6, 'Ana López', 'report_generated', 'Reporte diario generado', 'Se generó el reporte diario de monitoreo para todas las estaciones', 'success', NULL, NULL, '192.168.1.110', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"report_type": "daily", "stations_count": 5, "format": "PDF", "file_size_kb": 1024}'),

('2025-01-13 08:30:00', 4, 'Andrea Morales', 'sensor_maintenance', 'Mantenimiento preventivo completado', 'Se completó mantenimiento preventivo en sensores de Estación Villarrica', 'success', 4, 'Estación Villarrica Confluencia', '192.168.1.115', NULL, '{"maintenance_type": "preventive", "sensors_checked": 3, "duration_minutes": 45, "next_maintenance": "2025-02-13"}'),

('2025-01-13 08:00:00', NULL, 'Sistema', 'system_startup', 'Sistema iniciado', 'El sistema de monitoreo se ha iniciado correctamente', 'success', NULL, NULL, NULL, NULL, '{"version": "2.0", "environment": "production", "startup_time_seconds": 12.5}'),

('2025-01-13 07:45:00', 3, 'Carlos Martínez', 'user_login', 'Inicio de sesión técnico', 'Técnico Carlos Martínez ingresó al sistema', 'info', NULL, NULL, '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"login_method": "password", "session_duration_planned": "8_hours"}'),

-- Actividades de mediciones
('2025-01-13 10:00:00', NULL, 'Sistema', 'measurement_recorded', 'Mediciones automáticas registradas', 'Se registraron mediciones automáticas de todas las estaciones activas', 'success', NULL, NULL, NULL, NULL, '{"measurements_count": 15, "stations_active": 5, "quality_good": 13, "quality_suspect": 1, "quality_poor": 1}'),

('2025-01-12 23:59:59', NULL, 'Sistema', 'daily_report_generated', 'Resumen diario generado', 'Se generó automáticamente el resumen diario de actividades', 'success', NULL, NULL, NULL, NULL, '{"measurements_total": 1440, "alerts_generated": 12, "alerts_resolved": 8, "system_uptime": "99.8%"}');

-- ------------------------------------------------------------
-- REPORTES DIARIOS PROMEDIO
-- ------------------------------------------------------------
INSERT INTO `report_daily_averages` (`date`, `station_id`, `station_name`, `measurement_type`, `average_value`, `min_value`, `max_value`, `measurement_count`) VALUES
-- Últimos 7 días - Estación Norte
('2025-01-13', 1, 'Estación Río Claro Norte', 'water_level', 2.4500, 2.20, 2.70, 96),
('2025-01-12', 1, 'Estación Río Claro Norte', 'water_level', 2.3200, 2.10, 2.65, 96),
('2025-01-11', 1, 'Estación Río Claro Norte', 'water_level', 2.4100, 2.25, 2.58, 96),
('2025-01-10', 1, 'Estación Río Claro Norte', 'water_level', 2.5500, 2.35, 2.82, 96),

-- Estación Centro
('2025-01-13', 2, 'Estación Río Claro Centro', 'water_level', 1.8600, 1.65, 2.05, 144),
('2025-01-12', 2, 'Estación Río Claro Centro', 'water_level', 1.7800, 1.55, 1.95, 144),
('2025-01-11', 2, 'Estación Río Claro Centro', 'water_level', 1.8200, 1.60, 2.10, 144),

-- Estación Sur (valores más altos)
('2025-01-13', 3, 'Estación Río Claro Sur', 'water_level', 3.4500, 3.20, 3.58, 96),
('2025-01-12', 3, 'Estación Río Claro Sur', 'water_level', 3.2800, 3.05, 3.45, 96),
('2025-01-11', 3, 'Estación Río Claro Sur', 'water_level', 3.1500, 2.95, 3.35, 96),

-- Temperaturas
('2025-01-13', 1, 'Estación Río Claro Norte', 'temperature', 18.5, 16.2, 21.3, 96),
('2025-01-13', 2, 'Estación Río Claro Centro', 'temperature', 19.1, 17.0, 22.1, 144),
('2025-01-13', 3, 'Estación Río Claro Sur', 'temperature', 18.0, 15.8, 20.5, 96),

-- Caudales
('2025-01-13', 1, 'Estación Río Claro Norte', 'flow_rate', 145.2, 120.5, 168.9, 96),
('2025-01-13', 4, 'Estación Villarrica Confluencia', 'flow_rate', 1245.0, 1180.2, 1320.8, 72);

-- ------------------------------------------------------------
-- EVENTOS CRÍTICOS
-- ------------------------------------------------------------
INSERT INTO `report_critical_events` (`station_id`, `station_name`, `measurement_type`, `water_level`, `threshold`, `timestamp`, `duration_minutes`, `severity`) VALUES
-- Evento crítico actual
(3, 'Estación Río Claro Sur', 'water_level', 3.5800, 3.5000, '2025-01-13 10:30:00', 15, 'critical'),

-- Eventos históricos
(3, 'Estación Río Claro Sur', 'water_level', 3.5200, 3.5000, '2025-01-12 14:20:00', 45, 'critical'),
(1, 'Estación Río Claro Norte', 'water_level', 3.0500, 3.0000, '2025-01-11 16:15:00', 120, 'critical'),
(2, 'Estación Río Claro Centro', 'water_level', 2.5200, 2.5000, '2025-01-10 09:30:00', 30, 'high'),
(4, 'Estación Villarrica Confluencia', 'water_level', 5.0200, 5.0000, '2025-01-09 11:45:00', 180, 'critical'),

-- Eventos por temperatura extrema (verano)
(1, 'Estación Río Claro Norte', 'temperature', 30.2, 30.0, '2025-01-08 14:30:00', 90, 'high'),
(2, 'Estación Río Claro Centro', 'temperature', 31.5, 30.0, '2025-01-07 15:45:00', 120, 'critical');

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- VERIFICACIÓN DE DATOS
-- ------------------------------------------------------------
SELECT 'Datos de prueba cargados correctamente' AS status;

SELECT
    'RESUMEN DE DATOS' AS titulo,
    (SELECT COUNT(*) FROM users) AS usuarios,
    (SELECT COUNT(*) FROM stations WHERE is_active = 1) AS estaciones_activas,
    (SELECT COUNT(*) FROM sensors WHERE is_active = 1) AS sensores_activos,
    (SELECT COUNT(*) FROM measurements) AS mediciones_registradas,
    (SELECT COUNT(*) FROM alerts WHERE status = 'active') AS alertas_activas,
    (SELECT COUNT(*) FROM thresholds WHERE is_active = 1) AS umbrales_configurados;

-- Mostrar alertas activas críticas
SELECT
    'ALERTAS CRÍTICAS ACTIVAS' AS tipo,
    s.name AS estacion,
    a.title AS titulo,
    a.level AS nivel,
    a.triggered_at AS hora
FROM alerts a
JOIN stations s ON a.station_id = s.id
WHERE a.status = 'active' AND a.level = 'critical'
ORDER BY a.triggered_at DESC;