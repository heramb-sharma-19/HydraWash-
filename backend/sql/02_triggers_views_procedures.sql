-- =====================================================================
-- HydraWash | Triggers, Views, Stored Procedures
-- Run AFTER 01_schema.sql. In Workbench this file works as-is.
-- =====================================================================
USE hydrawash_db;

DELIMITER $$

-- ---------------------------------------------------------------------
-- ORDER ITEM: price snapshot + subtotal
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_oi_bi BEFORE INSERT ON order_item
FOR EACH ROW
BEGIN
  SET NEW.unit_price = (SELECT price_per_item FROM service WHERE service_id = NEW.service_id);
  SET NEW.subtotal   = NEW.quantity * NEW.unit_price;
END$$

CREATE TRIGGER trg_oi_bu BEFORE UPDATE ON order_item
FOR EACH ROW
BEGIN
  SET NEW.subtotal = NEW.quantity * NEW.unit_price;
END$$

-- ---------------------------------------------------------------------
-- ORDER ITEM -> keep laundry_order.total_count / total_amount in sync
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_oi_ai AFTER INSERT ON order_item
FOR EACH ROW
BEGIN
  UPDATE laundry_order
     SET total_count  = (SELECT COALESCE(SUM(quantity),0) FROM order_item WHERE order_id = NEW.order_id),
         total_amount = (SELECT COALESCE(SUM(subtotal),0) FROM order_item WHERE order_id = NEW.order_id)
   WHERE order_id = NEW.order_id;
END$$

CREATE TRIGGER trg_oi_au AFTER UPDATE ON order_item
FOR EACH ROW
BEGIN
  UPDATE laundry_order
     SET total_count  = (SELECT COALESCE(SUM(quantity),0) FROM order_item WHERE order_id = NEW.order_id),
         total_amount = (SELECT COALESCE(SUM(subtotal),0) FROM order_item WHERE order_id = NEW.order_id)
   WHERE order_id = NEW.order_id;
END$$

CREATE TRIGGER trg_oi_ad AFTER DELETE ON order_item
FOR EACH ROW
BEGIN
  UPDATE laundry_order
     SET total_count  = (SELECT COALESCE(SUM(quantity),0) FROM order_item WHERE order_id = OLD.order_id),
         total_amount = (SELECT COALESCE(SUM(subtotal),0) FROM order_item WHERE order_id = OLD.order_id)
   WHERE order_id = OLD.order_id;
END$$

-- ---------------------------------------------------------------------
-- ORDER STATUS: enforce the workflow (single source of truth = database)
--   Created -> Pending -> Accepted -> Ready -> Delivered
--   Created / Pending / Accepted -> Reverted      (Delivered, Reverted = final)
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_order_bu BEFORE UPDATE ON laundry_order
FOR EACH ROW
BEGIN
  IF NEW.status <> OLD.status THEN
    IF NOT (
         (OLD.status = 'Created'  AND NEW.status IN ('Pending','Reverted'))
      OR (OLD.status = 'Pending'  AND NEW.status IN ('Accepted','Reverted'))
      OR (OLD.status = 'Accepted' AND NEW.status IN ('Ready','Reverted'))
      OR (OLD.status = 'Ready'    AND NEW.status = 'Delivered')
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid order status transition';
    END IF;

    IF NEW.status = 'Delivered' THEN
      SET NEW.delivery_date = CURDATE();
    END IF;
  END IF;
END$$

-- On every status change: write history, notify the student, refund the
-- wash cycle if the order was reverted.
-- Session variables @current_staff_id / @status_note are set by the caller
-- (the Node API, or you in Workbench) just before the UPDATE.
CREATE TRIGGER trg_order_au AFTER UPDATE ON laundry_order
FOR EACH ROW
BEGIN
  IF NEW.status <> OLD.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, note)
    VALUES (NEW.order_id, OLD.status, NEW.status, @current_staff_id, @status_note);

    INSERT INTO notification (customer_id, order_id, title, message)
    VALUES (NEW.customer_id, NEW.order_id,
            CONCAT('Order #', NEW.order_code, ' ', NEW.status),
            CONCAT('Your order #', NEW.order_code, ' is now ', NEW.status, '.'));

    IF NEW.status = 'Reverted' AND NEW.subscription_id IS NOT NULL THEN
      UPDATE customer_subscription
         SET cycles_used = GREATEST(cycles_used - 1, 0)
       WHERE subscription_id = NEW.subscription_id;
    END IF;
  END IF;
END$$

-- First history row when an order is created
CREATE TRIGGER trg_order_ai AFTER INSERT ON laundry_order
FOR EACH ROW
BEGIN
  INSERT INTO order_status_history (order_id, old_status, new_status, note)
  VALUES (NEW.order_id, NULL, NEW.status, 'Order created');
END$$

-- ---------------------------------------------------------------------
-- STORED PROCEDURES
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_update_order_status(
  IN p_order_code CHAR(6),
  IN p_new_status VARCHAR(20),
  IN p_staff_id   INT,
  IN p_note       VARCHAR(255)
)
BEGIN
  DECLARE v_id INT;
  SELECT order_id INTO v_id FROM laundry_order WHERE order_code = p_order_code;
  IF v_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found';
  END IF;

  SET @current_staff_id = p_staff_id;
  SET @status_note      = p_note;

  UPDATE laundry_order SET status = p_new_status WHERE order_id = v_id;

  SET @current_staff_id = NULL;
  SET @status_note      = NULL;
END$$

-- Bill / order details for one order (2 result sets: header, lines)
CREATE PROCEDURE sp_order_details(IN p_order_code CHAR(6))
BEGIN
  SELECT o.order_code, o.order_date, o.status, o.total_count, o.total_amount,
         c.name AS customer, c.bag_id, r.residence_name
    FROM laundry_order o
    JOIN customer  c ON c.customer_id  = o.customer_id
    JOIN residence r ON r.residence_id = c.residence_id
   WHERE o.order_code = p_order_code;

  SELECT i.item_name, s.service_name, oi.quantity, oi.unit_price, oi.subtotal
    FROM order_item oi
    JOIN laundry_order o ON o.order_id = oi.order_id
    JOIN item    i ON i.item_id    = oi.item_id
    JOIN service s ON s.service_id = oi.service_id
   WHERE o.order_code = p_order_code
   ORDER BY i.item_name;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------
-- VIEWS
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_customer_quota AS
SELECT cs.customer_id, cs.subscription_id, sp.plan_name,
       cs.cycles_used, sp.wash_cycles AS cycles_total,
       sp.wash_cycles - cs.cycles_used AS cycles_left,
       cs.start_date, cs.end_date
  FROM customer_subscription cs
  JOIN subscription_plan sp ON sp.plan_id = cs.plan_id
 WHERE cs.status = 'Active';

CREATE OR REPLACE VIEW v_staff_queue AS
SELECT o.order_code, o.order_date, o.status, o.total_count,
       c.name AS customer, c.bag_id, ca.campus_name, r.residence_name
  FROM laundry_order o
  JOIN customer  c  ON c.customer_id  = o.customer_id
  JOIN residence r  ON r.residence_id = c.residence_id
  JOIN campus    ca ON ca.campus_id   = r.campus_id
 WHERE o.status IN ('Created','Pending','Accepted','Ready');

CREATE OR REPLACE VIEW v_daily_report AS
SELECT DATE(order_date) AS day,
       COUNT(*)         AS orders_placed,
       SUM(total_count) AS items_received,
       SUM(status = 'Delivered') AS orders_delivered,
       SUM(status = 'Reverted')  AS orders_reverted
  FROM laundry_order
 GROUP BY DATE(order_date);
