-- ─────────────────────────────────────────────────────────────────────────────
-- HydraWash - Relational Database Schema
-- Based on: Laundry Order Management System ER Diagram Documentation
-- Engine: MySQL 8.0+ / MariaDB
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS hydrawash
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hydrawash;

-- ── 1. CUSTOMER ──────────────────────────────────────────────────────────────
-- Stores customer contact & address information (hostel room, block, phone)
CREATE TABLE IF NOT EXISTS customer (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE,
  phone       VARCHAR(20) NOT NULL,
  address     VARCHAR(255) NOT NULL COMMENT 'Hostel block, room number, or residence address',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_phone (phone),
  INDEX idx_customer_email (email)
) ENGINE=InnoDB;

-- ── 2. SERVICE ───────────────────────────────────────────────────────────────
-- Catalog of fabric care offerings (e.g. Wash, Dry Clean, Steam Iron)
CREATE TABLE IF NOT EXISTS service (
  service_id   INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  description  VARCHAR(255),
  price        DECIMAL(10,2) NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_service_name (service_name)
) ENGINE=InnoDB;

-- ── 3. LAUNDRY_ORDER ─────────────────────────────────────────────────────────
-- Central order entity tracking customer, order date, and lifecycle status
CREATE TABLE IF NOT EXISTS laundry_order (
  order_id    INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date  DATE NOT NULL,
  status      VARCHAR(30) NOT NULL DEFAULT 'Placed' 
              COMMENT 'Placed, In Progress, Washing, Drying, Ironing, Packed, Out for Delivery, Completed, Cancelled',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_customer 
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_order_customer (customer_id),
  INDEX idx_order_date (order_date),
  INDEX idx_order_status (status)
) ENGINE=InnoDB;

-- ── 4. ORDER_ITEM (Weak Entity) ──────────────────────────────────────────────
-- Identifying relationship with LAUNDRY_ORDER. Primary key is composite (order_id, item_no)
CREATE TABLE IF NOT EXISTS order_item (
  order_id    INT NOT NULL,
  item_no     INT NOT NULL COMMENT 'Partial key, sequential item index within order',
  service_id  INT NOT NULL,
  item_name   VARCHAR(100) NOT NULL COMMENT 'e.g. Shirt, Jeans, Bedsheet, Hoodie',
  category    VARCHAR(50) DEFAULT 'Clothing' COMMENT 'Clothing, Linen, Delicate, Heavywear',
  quantity    INT NOT NULL CHECK (quantity > 0),
  unit_price  DECIMAL(10,2) NOT NULL COMMENT 'Price snapshot at the time order was placed',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id, item_no),
  CONSTRAINT fk_item_order 
    FOREIGN KEY (order_id) REFERENCES laundry_order(order_id) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_item_service 
    FOREIGN KEY (service_id) REFERENCES service(service_id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_item_service (service_id)
) ENGINE=InnoDB;

-- ── 5. DELIVERY ──────────────────────────────────────────────────────────────
-- Pickup and delivery logistics events associated with each laundry order
CREATE TABLE IF NOT EXISTS delivery (
  delivery_id    INT AUTO_INCREMENT PRIMARY KEY,
  order_id       INT NOT NULL,
  type           VARCHAR(10) NOT NULL COMMENT 'PICKUP or DELIVERY',
  status         VARCHAR(30) NOT NULL DEFAULT 'Scheduled' 
                 COMMENT 'Scheduled, In Transit, Completed, Failed, Rescheduled',
  scheduled_time DATETIME NOT NULL,
  actual_time    DATETIME NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_delivery_type CHECK (type IN ('PICKUP', 'DELIVERY')),
  CONSTRAINT fk_delivery_order 
    FOREIGN KEY (order_id) REFERENCES laundry_order(order_id) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_delivery_order (order_id),
  INDEX idx_delivery_type_status (type, status),
  INDEX idx_delivery_scheduled (scheduled_time)
) ENGINE=InnoDB;

-- ── 6. VIEWS FOR DERIVED ATTRIBUTES ──────────────────────────────────────────

-- Item-level details with computed subtotal (quantity * unit_price)
CREATE OR REPLACE VIEW v_order_item_details AS
SELECT 
  oi.order_id,
  oi.item_no,
  oi.item_name,
  oi.category,
  oi.quantity,
  oi.unit_price,
  (oi.quantity * oi.unit_price) AS subtotal,
  s.service_id,
  s.service_name
FROM order_item oi
JOIN service s ON oi.service_id = s.service_id;

-- Order-level summary with derived total_count and total_amount
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
  o.order_id,
  o.customer_id,
  c.name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  c.address AS customer_address,
  o.order_date,
  o.status AS order_status,
  COALESCE(SUM(oi.quantity), 0) AS total_count,
  COALESCE(SUM(oi.quantity * oi.unit_price), 0.00) AS total_amount,
  o.created_at,
  o.updated_at
FROM laundry_order o
JOIN customer c ON o.customer_id = c.customer_id
LEFT JOIN order_item oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.customer_id, c.name, c.email, c.phone, c.address, o.order_date, o.status, o.created_at, o.updated_at;

-- Real-time tracking view combining order lifecycle with pickup and delivery schedules
CREATE OR REPLACE VIEW v_order_tracking AS
SELECT 
  o.order_id,
  o.status AS order_status,
  c.name AS customer_name,
  c.address AS pickup_delivery_address,
  p.status AS pickup_status,
  p.scheduled_time AS pickup_scheduled_time,
  p.actual_time AS pickup_actual_time,
  d.status AS delivery_status,
  d.scheduled_time AS delivery_scheduled_time,
  d.actual_time AS delivery_actual_time,
  o.updated_at AS last_updated
FROM laundry_order o
JOIN customer c ON o.customer_id = c.customer_id
LEFT JOIN delivery p ON o.order_id = p.order_id AND p.type = 'PICKUP'
LEFT JOIN delivery d ON o.order_id = d.order_id AND d.type = 'DELIVERY';

