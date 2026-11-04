-- ─────────────────────────────────────────────────────────────────────────────
-- HydraWash - Seed Data
-- ─────────────────────────────────────────────────────────────────────────────

USE hydrawash;

-- ── 1. Services ──────────────────────────────────────────────────────────────
INSERT INTO service (service_id, service_name, description, price) VALUES
  (1, 'Wash & Fold', 'Eco-certified deep cleaning with gentle hypoallergenic detergents.', 49.00),
  (2, 'Tumble Dry', 'Precision sensor-controlled thermal tumbling for fabric softness.', 39.00),
  (3, 'Steam Press & Iron', 'High-pressure steam smoothing and anti-crease hanger finish.', 29.00),
  (4, 'Express Full Care', 'Complete wash, dry, steam press, and sealed garment packaging.', 99.00)
ON DUPLICATE KEY UPDATE 
  service_name = VALUES(service_name), 
  description = VALUES(description), 
  price = VALUES(price);

-- ── 2. Customers (Hostel residents) ──────────────────────────────────────────
INSERT INTO customer (customer_id, name, email, phone, address) VALUES
  (1, 'Aarav Sharma', 'aarav.sharma@hostel.edu', '+91 98765 43210', 'Hostel Block B, Room 304, Campus East'),
  (2, 'Ananya Patel', 'ananya.p@hostel.edu', '+91 98123 45678', 'Hostel Block A, Room 112, Campus West'),
  (3, 'Rohan Verma',  'rohan.v@hostel.edu',  '+91 98456 78901', 'Hostel Block C, Room 205, PG Tower')
ON DUPLICATE KEY UPDATE 
  name = VALUES(name), 
  email = VALUES(email), 
  phone = VALUES(phone), 
  address = VALUES(address);

-- ── 3. Orders (Including Demo 1042 and 1048) ─────────────────────────────────
INSERT INTO laundry_order (order_id, customer_id, order_date, status) VALUES
  (1042, 1, CURDATE(), 'In Progress'),
  (1048, 2, CURDATE(), 'In Transit'),
  (1049, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Completed')
ON DUPLICATE KEY UPDATE 
  customer_id = VALUES(customer_id), 
  order_date = VALUES(order_date), 
  status = VALUES(status);

-- ── 4. Order Items ───────────────────────────────────────────────────────────
INSERT INTO order_item (order_id, item_no, service_id, item_name, category, quantity, unit_price) VALUES
  -- Order 1042 items
  (1042, 1, 1, 'Cotton Shirts', 'Clothing', 3, 49.00),
  (1042, 2, 2, 'Denim Jeans', 'Clothing', 2, 39.00),
  (1042, 3, 3, 'Formal Trousers', 'Clothing', 1, 29.00),
  
  -- Order 1048 items
  (1048, 1, 4, 'Winter Hoodies', 'Heavywear', 2, 99.00),
  (1048, 2, 1, 'Bed Linen Set', 'Linen', 1, 49.00),
  
  -- Order 1049 items
  (1049, 1, 1, 'T-Shirts & Shorts', 'Clothing', 4, 49.00)
ON DUPLICATE KEY UPDATE 
  service_id = VALUES(service_id),
  item_name = VALUES(item_name),
  quantity = VALUES(quantity),
  unit_price = VALUES(unit_price);

-- ── 5. Delivery (Pickups and Deliveries) ──────────────────────────────────────
INSERT INTO delivery (delivery_id, order_id, type, status, scheduled_time, actual_time) VALUES
  -- Order 1042: Picked up, delivery scheduled later today
  (1, 1042, 'PICKUP', 'Completed', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (2, 1042, 'DELIVERY', 'Scheduled', DATE_ADD(NOW(), INTERVAL 5 HOUR), NULL),

  -- Order 1048: Picked up, currently out for delivery
  (3, 1048, 'PICKUP', 'Completed', DATE_SUB(NOW(), INTERVAL 18 HOUR), DATE_SUB(NOW(), INTERVAL 18 HOUR)),
  (4, 1048, 'DELIVERY', 'In Transit', NOW(), NULL),

  -- Order 1049: Picked up and Delivered yesterday
  (5, 1049, 'PICKUP', 'Completed', DATE_SUB(NOW(), INTERVAL 28 HOUR), DATE_SUB(NOW(), INTERVAL 28 HOUR)),
  (6, 1049, 'DELIVERY', 'Completed', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR))
ON DUPLICATE KEY UPDATE 
  type = VALUES(type),
  status = VALUES(status),
  scheduled_time = VALUES(scheduled_time),
  actual_time = VALUES(actual_time);

