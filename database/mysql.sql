-- ============================================================
--  SIGL - MySQL schema
--  Base real para facturas + tablas mínimas de apoyo
--  Charset/Collation: utf8mb4
-- ============================================================

-- 1) Base de datos
CREATE DATABASE IF NOT EXISTS `sigl` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `sigl`;

-- ============================================================
-- 2) Tabla: factura  (persistencia real usada por el backend)
-- ============================================================
DROP TABLE IF EXISTS `factura`;

CREATE TABLE `factura` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente`       VARCHAR(180)    NOT NULL,
  `cuit`          VARCHAR(20)     NULL,
  `fecha`         DATE            NOT NULL,
  `detalle`       VARCHAR(255)    NOT NULL,
  `importe`       DECIMAL(15,2)   NOT NULL,
  `estado`        ENUM('EMITIDA','PAGADA','ANULADA') NOT NULL DEFAULT 'EMITIDA',
  `creado_en`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_factura_cliente` (`cliente`),
  KEY `idx_factura_fecha`   (`fecha`),
  KEY `idx_factura_estado`  (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de ejemplo
INSERT INTO `factura` (`cliente`,`cuit`,`fecha`,`detalle`,`importe`,`estado`)
VALUES
  ('ACME S.A.','30-12345678-9','2025-08-10','Servicio de transporte Buenos Aires → Rosario', 215000.00,'EMITIDA'),
  ('Metalúrgica Norte','30-28765432-1','2025-08-12','Flete Zárate → Córdoba',                    165000.00,'EMITIDA');

-- ============================================================
-- 3) Tabla: carga  (opcional – para persistir la gestión de cargas)
--    Estructura compatible con los campos del front
-- ============================================================
DROP TABLE IF EXISTS `carga`;

CREATE TABLE `carga` (
  `id`               VARCHAR(20)   NOT NULL,
  `cliente`          VARCHAR(180)  NOT NULL,
  `origen`           VARCHAR(120)  NULL,
  `destino`          VARCHAR(120)  NULL,
  `estado`           VARCHAR(40)   NULL,
  `terminal`         VARCHAR(80)   NULL,
  `contenedor`       VARCHAR(40)   NULL,
  `tipo`             VARCHAR(40)   NULL,
  `tara_kg`          INT           NULL,
  `precinto`         VARCHAR(40)   NULL,
  `peso_bruto_kg`    INT           NULL,
  `fecha`            DATE          NULL,

  `chofer_nombre`    VARCHAR(120)  NULL,
  `chofer_dni`       VARCHAR(20)   NULL,
  `chofer_cel`       VARCHAR(30)   NULL,

  `tractor_marca`    VARCHAR(60)   NULL,
  `tractor_modelo`   VARCHAR(60)   NULL,
  `tractor_anio`     SMALLINT      NULL,
  `tractor_patente`  VARCHAR(20)   NULL,
  `tractor_sat`      VARCHAR(40)   NULL,

  `semi_marca`       VARCHAR(60)   NULL,
  `semi_modelo`      VARCHAR(60)   NULL,
  `semi_anio`        SMALLINT      NULL,
  `semi_patente`     VARCHAR(20)   NULL,

  `creado_en`        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_carga_cliente` (`cliente`),
  KEY `idx_carga_estado`  (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos demo (coinciden con el front)
INSERT INTO `carga` (`id`,`cliente`,`origen`,`destino`,`estado`,`terminal`,`contenedor`,
                     `tipo`,`tara_kg`,`precinto`,`peso_bruto_kg`,`fecha`)
VALUES
 ('ORD-101','ACME S.A.','Buenos Aires','Rosario','Entregado','-','-','-',NULL,NULL,NULL,'2025-08-10'),
 ('ORD-102','Metalúrgica Norte','Zárate','Córdoba','En preparación','-','-','-',NULL,NULL,NULL,'2025-08-12');

-- ============================================================
-- 4) Tabla: legajo  (opcional – gestión aduanera)
-- ============================================================
DROP TABLE IF EXISTS `legajo`;

CREATE TABLE `legajo` (
  `id`         VARCHAR(20)  NOT NULL,
  `cliente`    VARCHAR(180) NOT NULL,
  `tipo`       VARCHAR(60)  NOT NULL,
  `estado`     VARCHAR(80)  NOT NULL,
  `creado_en`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_legajo_cliente` (`cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `legajo` (`id`,`cliente`,`tipo`,`estado`)
VALUES
 ('LEG-0240','Metalúrgica Norte','Importación','Documentación OK'),
 ('LEG-0241','Agro Sur','Exportación','Esperando verificación');

-- ============================================================
-- 5) Tabla: ticket  (opcional – atención al cliente)
-- ============================================================
DROP TABLE IF EXISTS `ticket`;

CREATE TABLE `ticket` (
  `id`         VARCHAR(20)  NOT NULL,
  `cliente`    VARCHAR(180) NOT NULL,
  `asunto`     VARCHAR(180) NOT NULL,
  `estado`     VARCHAR(60)  NOT NULL,
  `creado_en`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ticket_cliente` (`cliente`),
  KEY `idx_ticket_estado`  (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ticket` (`id`,`cliente`,`asunto`,`estado`)
VALUES
 ('TCK-0502','ACME S.A.','Demora entrega','Abierto'),
 ('TCK-0501','Agro Sur','Cotización','Cerrado');

-- ============================================================
-- 6) (Opcional) Usuario de base de datos con permisos limitados
--     ─ Ajustá la contraseña y host según tu entorno ─
-- ============================================================
-- CREATE USER IF NOT EXISTS 'sigl_user'@'%' IDENTIFIED BY 'sigl_pass';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON `sigl`.* TO 'sigl_user'@'%';
-- FLUSH PRIVILEGES;

-- Fin del script
