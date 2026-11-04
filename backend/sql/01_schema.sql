-- =====================================================================
-- HydraWash  |  Schema  |  MySQL 8.x (tested on MySQL-compatible engine)
-- Run in MySQL Workbench: open this file, press the lightning bolt.
-- =====================================================================
DROP DATABASE IF EXISTS hydrawash_db;
CREATE DATABASE hydrawash_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hydrawash_db;

-- ---------- Location (normalised: Residence -> Campus) ---------------
CREATE TABLE campus (
  campus_id    INT AUTO_INCREMENT PRIMARY KEY,
  campus_name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE residence (
  residence_id   INT AUTO_INCREMENT PRIMARY KEY,
  campus_id      INT NOT NULL,
  residence_name VARCHAR(50) NOT NULL,              -- e.g. BH-2
  UNIQUE (campus_id, residence_name),
  FOREIGN KEY (campus_id) REFERENCES campus(campus_id)
);

-- ---------- People ---------------------------------------------------
CREATE TABLE customer (
  customer_id    INT AUTO_INCREMENT PRIMARY KEY,
  bag_id         VARCHAR(20)  NOT NULL UNIQUE,      -- e.g. JK1016 (laundry bag tag)
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  phone          VARCHAR(15)  NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  residence_id   INT NOT NULL,                      -- campus is reached via residence
  profile_photo  VARCHAR(255) NULL,
  account_status ENUM('Active','DeletionRequested','Deleted') NOT NULL DEFAULT 'Active',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (residence_id) REFERENCES residence(residence_id)
);

CREATE TABLE staff (
  staff_id      INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  phone         VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('Admin','Operator','Delivery') NOT NULL,
  campus_id     INT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (campus_id) REFERENCES campus(campus_id)
);

-- ---------- Plans / quota ("Wash Cycles Used 6/30") ------------------
CREATE TABLE subscription_plan (
  plan_id       INT AUTO_INCREMENT PRIMARY KEY,
  plan_name     VARCHAR(60) NOT NULL UNIQUE,
  wash_cycles   INT NOT NULL CHECK (wash_cycles > 0),
  price         DECIMAL(10,2) NOT NULL,
  validity_days INT NOT NULL CHECK (validity_days > 0)
);

CREATE TABLE customer_subscription (
  subscription_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id     INT NOT NULL,
  plan_id         INT NOT NULL,
  cycles_used     INT NOT NULL DEFAULT 0 CHECK (cycles_used >= 0),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          ENUM('Active','Expired') NOT NULL DEFAULT 'Active',
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (plan_id)     REFERENCES subscription_plan(plan_id),
  INDEX idx_sub_customer (customer_id, status)
);

CREATE TABLE payment (                               -- optional: pay for a plan
  payment_id      INT AUTO_INCREMENT PRIMARY KEY,
  subscription_id INT NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  mode            ENUM('UPI','Card','NetBanking','Cash') NOT NULL,
  status          ENUM('Pending','Success','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  txn_ref         VARCHAR(60) NULL,
  paid_at         DATETIME NULL,
  FOREIGN KEY (subscription_id) REFERENCES customer_subscription(subscription_id)
);

-- ---------- Catalogue (items & services were mixed into ORDER ITEM) --
CREATE TABLE service (
  service_id     INT AUTO_INCREMENT PRIMARY KEY,
  service_name   VARCHAR(50) NOT NULL UNIQUE,        -- Wash / Dry / Iron
  description    VARCHAR(255),
  price_per_item DECIMAL(8,2) NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE item (
  item_id   INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(60) NOT NULL UNIQUE,            -- Bed Sheet, T Shirt ...
  category  ENUM('Topwear','Bottomwear','Innerwear','Bedding','Other') NOT NULL,
  icon      VARCHAR(100) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------- Orders ---------------------------------------------------
CREATE TABLE laundry_order (
  order_id        INT AUTO_INCREMENT PRIMARY KEY,
  order_code      CHAR(6) NOT NULL UNIQUE,           -- the "#947026" shown in the app
  customer_id     INT NOT NULL,
  subscription_id INT NULL,                          -- which plan paid for this cycle
  order_date      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pickup_date     DATE NULL,
  delivery_date   DATE NULL,
  status          ENUM('Created','Pending','Accepted','Reverted','Ready','Delivered')
                  NOT NULL DEFAULT 'Created',
  total_count     INT NOT NULL DEFAULT 0,            -- kept in sync by triggers
  total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,  -- kept in sync by triggers
  remarks         VARCHAR(255) NULL,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id)     REFERENCES customer(customer_id),
  FOREIGN KEY (subscription_id) REFERENCES customer_subscription(subscription_id),
  INDEX idx_order_customer (customer_id, status, order_date),
  INDEX idx_order_status   (status, order_date)
);

CREATE TABLE order_item (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  item_id       INT NOT NULL,
  service_id    INT NOT NULL,
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit_price    DECIMAL(8,2)  NOT NULL DEFAULT 0,    -- copied from service by trigger
  subtotal      DECIMAL(10,2) NOT NULL DEFAULT 0,    -- quantity * unit_price (trigger)
  UNIQUE (order_id, item_id, service_id),
  FOREIGN KEY (order_id)   REFERENCES laundry_order(order_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id)    REFERENCES item(item_id),
  FOREIGN KEY (service_id) REFERENCES service(service_id)
);

CREATE TABLE order_status_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  old_status VARCHAR(20) NULL,
  new_status VARCHAR(20) NOT NULL,
  changed_by INT NULL,                               -- staff who made the change
  note       VARCHAR(255) NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES laundry_order(order_id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES staff(staff_id)
);

CREATE TABLE delivery (                              -- pickup AND delivery legs
  delivery_id    INT AUTO_INCREMENT PRIMARY KEY,
  order_id       INT NOT NULL,
  staff_id       INT NULL,
  delivery_type  ENUM('Pickup','Delivery') NOT NULL,
  scheduled_time DATETIME NOT NULL,
  actual_time    DATETIME NULL,
  status         ENUM('Scheduled','Completed','Missed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  FOREIGN KEY (order_id) REFERENCES laundry_order(order_id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- ---------- App features seen in the video ---------------------------
CREATE TABLE notification (                          -- the bell icon
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id     INT NOT NULL,
  order_id        INT NULL,
  title           VARCHAR(100) NOT NULL,
  message         VARCHAR(255) NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
  FOREIGN KEY (order_id)    REFERENCES laundry_order(order_id) ON DELETE SET NULL,
  INDEX idx_notif_customer (customer_id, is_read, created_at)
);

CREATE TABLE account_deletion_request (              -- "Request Account Deletion"
  request_id   INT AUTO_INCREMENT PRIMARY KEY,
  customer_id  INT NOT NULL,
  reason       VARCHAR(255) NULL,
  status       ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_by INT NULL,
  processed_at DATETIME NULL,
  FOREIGN KEY (customer_id)  REFERENCES customer(customer_id),
  FOREIGN KEY (processed_by) REFERENCES staff(staff_id)
);
