/* =========================================================
   Esquema base – SIGL (Zuidwijk & Asoc. SRL)
   Roles soportados: ADMIN, CLIENTE
   ========================================================= */

/* --- Limpieza opcional (cuidado en producción) --- */
-- DROP TABLE IF EXISTS movimientos_stock;
-- DROP TABLE IF EXISTS legajos;
-- DROP TABLE IF EXISTS tickets;
-- DROP TABLE IF EXISTS cargas;
-- DROP TABLE IF EXISTS usuarios_roles;
-- DROP TABLE IF EXISTS usuarios;
-- DROP TABLE IF EXISTS roles;
-- DROP TABLE IF EXISTS clientes;
-- DROP TABLE IF EXISTS almacenes;

/* =========================================================
   TABLAS MAESTRAS
   ========================================================= */

-- Catálogo de roles
CREATE TABLE roles (
                       id           SERIAL PRIMARY KEY,
                       nombre       VARCHAR(32) NOT NULL UNIQUE,   -- 'ADMIN' | 'CLIENTE'
                       descripcion  VARCHAR(255)
);

-- Catálogo de clientes (empresa del cliente final)
CREATE TABLE clientes (
                          id           SERIAL PRIMARY KEY,
                          razon_social VARCHAR(120) NOT NULL UNIQUE,
                          cuit         VARCHAR(32),
                          email_contacto VARCHAR(120),
                          telefono     VARCHAR(50),
                          direccion    VARCHAR(200),
                          ciudad       VARCHAR(100),
                          pais         VARCHAR(80) DEFAULT 'Argentina'
);

-- Usuarios del sistema (internos o clientes con acceso)
CREATE TABLE usuarios (
                          id             SERIAL PRIMARY KEY,
                          nombre         VARCHAR(120) NOT NULL,
                          email          VARCHAR(150) NOT NULL UNIQUE,
                          hash_password  VARCHAR(255) NOT NULL,
                          activo         BOOLEAN DEFAULT TRUE,
                          cliente_id     INTEGER,                        -- si es CLIENTE, puede vincularse a su empresa
                          creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_usuarios_clientes
                              FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                                  ON UPDATE CASCADE ON DELETE SET NULL
);

-- Relación N:M Usuarios-Roles (permite futuro crecimiento)
CREATE TABLE usuarios_roles (
                                usuario_id INTEGER NOT NULL,
                                rol_id     INTEGER NOT NULL,
                                PRIMARY KEY (usuario_id, rol_id),
                                CONSTRAINT fk_ur_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                                    ON UPDATE CASCADE ON DELETE CASCADE,
                                CONSTRAINT fk_ur_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
                                    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Almacenes/Depósitos (opcional, útil para stock)
CREATE TABLE almacenes (
                           id           SERIAL PRIMARY KEY,
                           nombre       VARCHAR(100) NOT NULL,
                           direccion    VARCHAR(200),
                           ciudad       VARCHAR(100),
                           provincia    VARCHAR(100),
                           pais         VARCHAR(80) DEFAULT 'Argentina',
                           capacidad_pallets INTEGER
);

/* =========================================================
   OPERACIONES LOGÍSTICAS
   ========================================================= */

-- Cargas / Órdenes de transporte
CREATE TABLE cargas (
                        id              SERIAL PRIMARY KEY,
                        codigo          VARCHAR(32) NOT NULL UNIQUE,       -- p.ej. 'ORD-101'
                        cliente_id      INTEGER NOT NULL,
                        origen          VARCHAR(120) NOT NULL,
                        destino         VARCHAR(120) NOT NULL,
                        estado          VARCHAR(40)  NOT NULL,             -- 'En preparación' | 'En tránsito' | 'Entregado' | 'Demorado'
                        peso_kg         DECIMAL(12,2),
                        fecha           DATE,
                        creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT fk_cargas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                            ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_cargas_cliente ON cargas (cliente_id);
CREATE INDEX idx_cargas_estado  ON cargas (estado);

-- Tickets / Atención al cliente
CREATE TABLE tickets (
                         id              SERIAL PRIMARY KEY,
                         codigo          VARCHAR(32) NOT NULL UNIQUE,   -- p.ej. 'TCK-0502'
                         cliente_id      INTEGER NOT NULL,
                         asunto          VARCHAR(160) NOT NULL,
                         descripcion     TEXT,
                         estado          VARCHAR(40) NOT NULL,          -- 'Abierto' | 'Cerrado' | 'En gestión'
                         creado_por      INTEGER,                        -- usuario que creó el ticket
                         creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         CONSTRAINT fk_tickets_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                             ON UPDATE CASCADE ON DELETE RESTRICT,
                         CONSTRAINT fk_tickets_usuario FOREIGN KEY (creado_por) REFERENCES usuarios(id)
                             ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX idx_tickets_cliente ON tickets (cliente_id);
CREATE INDEX idx_tickets_estado  ON tickets (estado);

-- Legajos aduaneros
CREATE TABLE legajos (
                         id              SERIAL PRIMARY KEY,
                         codigo          VARCHAR(32) NOT NULL UNIQUE,   -- p.ej. 'LEG-0240'
                         cliente_id      INTEGER NOT NULL,
                         tipo            VARCHAR(40) NOT NULL,          -- 'Importación' | 'Exportación' | etc.
                         estado          VARCHAR(80) NOT NULL,          -- 'Documentación OK' | 'Esperando verificación' | etc.
                         observaciones   TEXT,
                         creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         CONSTRAINT fk_legajos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                             ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_legajos_cliente ON legajos (cliente_id);

-- (Opcional) Movimientos de stock por almacén
CREATE TABLE movimientos_stock (
                                   id              SERIAL PRIMARY KEY,
                                   almacen_id      INTEGER NOT NULL,
                                   descripcion     VARCHAR(160) NOT NULL,
                                   cantidad        INTEGER NOT NULL,
                                   creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   CONSTRAINT fk_ms_almacen FOREIGN KEY (almacen_id) REFERENCES almacenes(id)
                                       ON UPDATE CASCADE ON DELETE RESTRICT
);

/* =========================================================
   TRIGGERS SIMPLES (actualizado_en)
   ========================================================= */
-- PostgreSQL:
-- CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
-- BEGIN
--   NEW.actualizado_en = CURRENT_TIMESTAMP;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER t_cargas_updated BEFORE UPDATE ON cargas
-- FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- CREATE TRIGGER t_tickets_updated BEFORE UPDATE ON tickets
-- FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- CREATE TRIGGER t_legajos_updated BEFORE UPDATE ON legajos
-- FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- CREATE TRIGGER t_usuarios_updated BEFORE UPDATE ON usuarios
-- FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/* =========================================================
   DATOS SEMILLA (coherentes con tu mock)
   ========================================================= */

-- ROLES
INSERT INTO roles (nombre, descripcion) VALUES
                                            ('ADMIN',   'Administrador total'),
                                            ('CLIENTE', 'Cliente externo');

-- CLIENTES
INSERT INTO clientes (razon_social, cuit, email_contacto, telefono, direccion, ciudad)
VALUES
    ('ACME S.A.',            '30-12345678-9', 'contacto@acme.com',           '+54 11 4000 0001', 'Av. Siempreviva 123', 'CABA'),
    ('Agro Sur',             '30-87654321-0', 'ventas@agrosur.com',          '+54 11 4000 0002', 'Ruta 2 Km 80',        'La Plata'),
    ('Metalúrgica Norte',    '30-11223344-5', 'info@metalurgicanorte.com',   '+54 11 4000 0003', 'Parque Ind. S/N',     'Zárate');

-- USUARIOS
-- OJO: reemplazar hash_password por hash real (bcrypt/argon2) desde backend Java.
INSERT INTO usuarios (nombre, email, hash_password, cliente_id)
VALUES
    ('Admin',  'admin@empresa.com',   '$2y$10$reemplazar_con_hash_real', NULL),
    ('Cliente ACME', 'cliente@empresa.com', '$2y$10$reemplazar_con_hash_real',
     (SELECT id FROM clientes WHERE razon_social='ACME S.A.')),
    ('Cliente Agro', 'cliente2@empresa.com', '$2y$10$reemplazar_con_hash_real',
     (SELECT id FROM clientes WHERE razon_social='Agro Sur'));

-- USUARIOS_ROLES
INSERT INTO usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u JOIN roles r ON u.email='admin@empresa.com' AND r.nombre='ADMIN';

INSERT INTO usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u JOIN roles r ON u.email='cliente@empresa.com' AND r.nombre='CLIENTE';

INSERT INTO usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u JOIN roles r ON u.email='cliente2@empresa.com' AND r.nombre='CLIENTE';

-- ALMACENES (opcional)
INSERT INTO almacenes (nombre, direccion, ciudad, provincia, capacidad_pallets)
VALUES
    ('Depósito Central', 'Av. Logística 450', 'Concepción del Uruguay', 'Entre Ríos', 1000);

-- CARGAS (coherentes con tu mock)
INSERT INTO cargas (codigo, cliente_id, origen, destino, estado, peso_kg, fecha)
VALUES
    ('ORD-101', (SELECT id FROM clientes WHERE razon_social='ACME S.A.'),         'Buenos Aires', 'Rosario',       'En tránsito',     1200, '2025-08-10'),
    ('ORD-102', (SELECT id FROM clientes WHERE razon_social='Metalúrgica Norte'), 'Zárate',       'Córdoba',       'En preparación',   800, '2025-08-12'),
    ('ORD-103', (SELECT id FROM clientes WHERE razon_social='Agro Sur'),          'Santa Fe',     'Bahía Blanca',  'Entregado',        600, '2025-08-01');

-- TICKETS
INSERT INTO tickets (codigo, cliente_id, asunto, descripcion, estado, creado_por)
VALUES
    ('TCK-0502', (SELECT id FROM clientes WHERE razon_social='ACME S.A.'), 'Demora entrega', 'El cliente reporta demora en ORD-101', 'Abierto',
     (SELECT id FROM usuarios WHERE email='admin@empresa.com')),
    ('TCK-0501', (SELECT id FROM clientes WHERE razon_social='Agro Sur'),  'Cotización',     'Solicitan tarifa para ruta SF-BB',     'Cerrado',
     (SELECT id FROM usuarios WHERE email='admin@empresa.com'));

-- LEGAJOS (aduana)
INSERT INTO legajos (codigo, cliente_id, tipo, estado, observaciones)
VALUES
    ('LEG-0240', (SELECT id FROM clientes WHERE razon_social='Metalúrgica Norte'), 'Importación', 'Documentación OK',        'Sin observaciones'),
    ('LEG-0241', (SELECT id FROM clientes WHERE razon_social='Agro Sur'),          'Exportación', 'Esperando verificación',  'Pendiente de certificado');

/* ================================================
   SIGL – Esquema base (ADMIN / CLIENTE)
   ================================================ */

-- Limpieza opcional
-- DROP TABLE IF EXISTS movimientos_stock, legajos, tickets, cargas, usuarios_roles, usuarios, roles, clientes, almacenes;

CREATE TABLE roles (
                       id SERIAL PRIMARY KEY,
                       nombre VARCHAR(32) NOT NULL UNIQUE,      -- 'ADMIN', 'CLIENTE'
                       descripcion VARCHAR(255)
);

CREATE TABLE clientes (
                          id SERIAL PRIMARY KEY,
                          razon_social VARCHAR(120) NOT NULL UNIQUE,
                          cuit VARCHAR(32),
                          email_contacto VARCHAR(120),
                          telefono VARCHAR(50),
                          direccion VARCHAR(200),
                          ciudad VARCHAR(100),
                          pais VARCHAR(80) DEFAULT 'Argentina'
);

CREATE TABLE usuarios (
                          id SERIAL PRIMARY KEY,
                          nombre VARCHAR(120) NOT NULL,
                          email VARCHAR(150) NOT NULL UNIQUE,
                          hash_password VARCHAR(255) NOT NULL,
                          activo BOOLEAN DEFAULT TRUE,
                          cliente_id INTEGER,
                          creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_usuarios_clientes
                              FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                                  ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE usuarios_roles (
                                usuario_id INTEGER NOT NULL,
                                rol_id     INTEGER NOT NULL,
                                PRIMARY KEY (usuario_id, rol_id),
                                CONSTRAINT fk_ur_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                                    ON UPDATE CASCADE ON DELETE CASCADE,
                                CONSTRAINT fk_ur_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
                                    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE almacenes (
                           id SERIAL PRIMARY KEY,
                           nombre VARCHAR(100) NOT NULL,
                           direccion VARCHAR(200),
                           ciudad VARCHAR(100),
                           provincia VARCHAR(100),
                           pais VARCHAR(80) DEFAULT 'Argentina',
                           capacidad_pallets INTEGER
);

-- Cargas con todos los campos solicitados
CREATE TABLE cargas (
                        id SERIAL PRIMARY KEY,
                        codigo VARCHAR(32) NOT NULL UNIQUE,           -- 'ORD-101'
                        cliente_id INTEGER NOT NULL,

    -- Origen/Destino
                        origen VARCHAR(120) NOT NULL,
                        destino VARCHAR(120) NOT NULL,

    -- Terminal / Contenedor
                        terminal VARCHAR(120),
                        contenedor VARCHAR(20),
                        tipo VARCHAR(40),                              -- Dry 40 / HC 40 / Reefer 20
                        tara_kg DECIMAL(12,2),
                        precinto VARCHAR(40),

    -- Peso
                        peso_bruto_kg DECIMAL(12,2),

    -- Estado y fecha
                        estado VARCHAR(40) NOT NULL,                  -- En preparación / En tránsito / Entregado / Demorado
                        fecha DATE,

    -- Chofer
                        chofer_nombre VARCHAR(120),
                        chofer_dni VARCHAR(20),
                        chofer_celular VARCHAR(30),

    -- Tractor
                        tractor_marca VARCHAR(60),
                        tractor_modelo VARCHAR(60),
                        tractor_anio INTEGER,
                        tractor_patente VARCHAR(20),

    -- Semi
                        semi_marca VARCHAR(60),
                        semi_modelo VARCHAR(60),
                        semi_anio INTEGER,
                        semi_patente VARCHAR(20),

    -- Satelital
                        marca_satelital VARCHAR(60),
                        satelital_usuario VARCHAR(80),
                        satelital_pass VARCHAR(120),                  -- cifrar en backend si se guarda

                        creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                        CONSTRAINT fk_cargas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                            ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_cargas_cliente   ON cargas (cliente_id);
CREATE INDEX idx_cargas_estado    ON cargas (estado);
CREATE INDEX idx_cargas_contenedor ON cargas (contenedor);

CREATE TABLE tickets (
                         id SERIAL PRIMARY KEY,
                         codigo VARCHAR(32) NOT NULL UNIQUE,           -- 'TCK-0502'
                         cliente_id INTEGER NOT NULL,
                         asunto VARCHAR(160) NOT NULL,
                         descripcion TEXT,
                         estado VARCHAR(40) NOT NULL,                  -- Abierto / Cerrado / En gestión
                         creado_por INTEGER,
                         creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         CONSTRAINT fk_tickets_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                             ON UPDATE CASCADE ON DELETE RESTRICT,
                         CONSTRAINT fk_tickets_usuario FOREIGN KEY (creado_por) REFERENCES usuarios(id)
                             ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX idx_tickets_cliente ON tickets (cliente_id);
CREATE INDEX idx_tickets_estado  ON tickets (estado);

CREATE TABLE legajos (
                         id SERIAL PRIMARY KEY,
                         codigo VARCHAR(32) NOT NULL UNIQUE,           -- 'LEG-0240'
                         cliente_id INTEGER NOT NULL,
                         tipo VARCHAR(40) NOT NULL,                    -- Importación / Exportación
                         estado VARCHAR(80) NOT NULL,
                         observaciones TEXT,
                         creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         CONSTRAINT fk_legajos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                             ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_legajos_cliente ON legajos (cliente_id);

CREATE TABLE movimientos_stock (
                                   id SERIAL PRIMARY KEY,
                                   almacen_id INTEGER NOT NULL,
                                   descripcion VARCHAR(160) NOT NULL,
                                   cantidad INTEGER NOT NULL,
                                   creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   CONSTRAINT fk_ms_almacen FOREIGN KEY (almacen_id) REFERENCES almacenes(id)
                                       ON UPDATE CASCADE ON DELETE RESTRICT
);

/* ==== SEMILLA ==== */
INSERT INTO roles (nombre, descripcion) VALUES
                                            ('ADMIN','Administrador total'),
                                            ('CLIENTE','Cliente externo');

INSERT INTO clientes (razon_social, cuit, email_contacto, telefono, direccion, ciudad) VALUES
                                                                                           ('ACME S.A.', '30-12345678-9', 'contacto@acme.com', '+54 11 4000 0001', 'Av. Siempreviva 123', 'CABA'),
                                                                                           ('Agro Sur', '30-87654321-0', 'ventas@agrosur.com', '+54 11 4000 0002', 'Ruta 2 Km 80', 'La Plata'),
                                                                                           ('Metalúrgica Norte', '30-11223344-5', 'info@metalurgicanorte.com', '+54 11 4000 0003', 'Parque Ind. S/N', 'Zárate');

INSERT INTO usuarios (nombre, email, hash_password, cliente_id) VALUES
                                                                    ('Admin','admin@empresa.com','$2y$10$reemplazar_con_hash_real', NULL),
                                                                    ('Cliente ACME','cliente@empresa.com','$2y$10$reemplazar_con_hash_real',
                                                                     (SELECT id FROM clientes WHERE razon_social='ACME S.A.')),
                                                                    ('Cliente Agro','cliente2@empresa.com','$2y$10$reemplazar_con_hash_real',
                                                                     (SELECT id FROM clientes WHERE razon_social='Agro Sur'));

INSERT INTO usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u JOIN roles r ON u.email='admin@empresa.com' AND r.nombre='ADMIN';
INSERT INTO usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u JOIN roles r ON u.email='cliente@empresa.com' AND r.nombre='CLIENTE';
INSERT INTO usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u JOIN roles r ON u.email='cliente2@empresa.com' AND r.nombre='CLIENTE';

INSERT INTO almacenes (nombre, direccion, ciudad, provincia, capacidad_pallets) VALUES
    ('Depósito Central', 'Av. Logística 450', 'Concepción del Uruguay', 'Entre Ríos', 1000);

INSERT INTO cargas (codigo, cliente_id, origen, destino, terminal, contenedor, tipo, tara_kg, precinto, peso_bruto_kg, estado, fecha,
                    chofer_nombre, chofer_dni, chofer_celular,
                    tractor_marca, tractor_modelo, tractor_anio, tractor_patente,
                    semi_marca, semi_modelo, semi_anio, semi_patente,
                    marca_satelital, satelital_usuario, satelital_pass)
VALUES
    ('ORD-101', (SELECT id FROM clientes WHERE razon_social='ACME S.A.'), 'Buenos Aires','Rosario','Terminal 4 BA','MSCU1234567','Dry 40',3800,'ABC123456',25000,'En tránsito','2025-08-10',
     'Juan Gómez','23456789','+54 9 11 5555-5555','Scania','R410',2019,'AD123BC','Randon','SR',2018,'AA123BB','LoJack','acme_ops','******'),
    ('ORD-102', (SELECT id FROM clientes WHERE razon_social='Metalúrgica Norte'),'Zárate','Córdoba','T6','MAEU7654321','HC 40',3900,'XYZ987654',18000,'En preparación','2025-08-12',
     'Marcos Silva','28765432','+54 9 11 4000-2222','Volvo','FH440',2020,'AE456CD','Helvética','HM',2017,'AC987CD','SETracking','mn_log','******'),
    ('ORD-103', (SELECT id FROM clientes WHERE razon_social='Agro Sur'),'Santa Fe','Bahía Blanca','BB Port','TLLU1112223','Reefer 20',3000,'PQR112233',14000,'Entregado','2025-08-01',
     'Carlos Duarte','21112223','+54 9 291 555-0000','Iveco','Stralis',2018,'AB321EF','Montenegro','MB',2016,'AF654GH','Prosegur Sat','agro_ops','******');

INSERT INTO tickets (codigo, cliente_id, asunto, descripcion, estado, creado_por) VALUES
                                                                                      ('TCK-0502', (SELECT id FROM clientes WHERE razon_social='ACME S.A.'), 'Demora entrega','Demora reportada en ORD-101','Abierto',(SELECT id FROM usuarios WHERE email='admin@empresa.com')),
                                                                                      ('TCK-0501', (SELECT id FROM clientes WHERE razon_social='Agro Sur'), 'Cotización','Tarifa para SF → BB','Cerrado',(SELECT id FROM usuarios WHERE email='admin@empresa.com'));

INSERT INTO legajos (codigo, cliente_id, tipo, estado, observaciones) VALUES
                                                                          ('LEG-0240', (SELECT id FROM clientes WHERE razon_social='Metalúrgica Norte'),'Importación','Documentación OK','-'),
                                                                          ('LEG-0241', (SELECT id FROM clientes WHERE razon_social='Agro Sur'),'Exportación','Esperando verificación','Pendiente certificado');
