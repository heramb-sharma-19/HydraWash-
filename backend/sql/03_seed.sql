-- =====================================================================
-- HydraWash | Sample data (demo logins use the password hashes below)
--   Student : demo@hydrawash.test  / Test@1234
--   Admin   : admin@hydrawash.test / Admin@1234
-- Run AFTER 02_triggers_views_procedures.sql
-- =====================================================================
USE hydrawash_db;

INSERT INTO campus (campus_name) VALUES ('JKLU');
INSERT INTO residence (campus_id, residence_name) VALUES
  (1,'BH-1'),(1,'BH-2'),(1,'BH-3'),(1,'GH-1');

INSERT INTO service (service_name, description, price_per_item) VALUES
  ('Wash', 'Machine wash with detergent', 0.00),
  ('Dry',  'Tumble dry',                  0.00),
  ('Iron', 'Steam press and fold',        0.00);

-- Items seen in the app (Bed Sheet ... Others). Add the ones hidden between
-- "Hoodie" and "Sweater" in your list (Jeans, Shirt, Shorts, Socks ...).
INSERT INTO item (item_name, category) VALUES
  ('Bed Sheet','Bedding'),('Blanket','Bedding'),('Bra','Innerwear'),
  ('Comforter','Bedding'),('Dress','Topwear'),('Hoodie','Topwear'),
  ('Jeans','Bottomwear'),('Shirt','Topwear'),('Shorts','Bottomwear'),
  ('Socks','Innerwear'),('Sweater','Topwear'),('Sweatpants','Bottomwear'),
  ('T Shirt','Topwear'),('Towel','Other'),('Underwear','Innerwear'),
  ('Others','Other');

INSERT INTO subscription_plan (plan_name, wash_cycles, price, validity_days) VALUES
  ('Semester 30', 30, 2999.00, 180),
  ('Monthly 8',    8,  799.00,  30);

-- bcrypt hashes (cost 10)
INSERT INTO customer (bag_id, name, email, phone, password_hash, residence_id) VALUES
  ('JK0001','Demo Student','demo@hydrawash.test','9999999999','$2b$10$uW2GeXH9PyIt9cqpMPZ/iunhfg45HaVTGUh7Ei0iR1TJcvEnspB0u',2);
INSERT INTO staff (name, email, phone, password_hash, role, campus_id) VALUES
  ('Demo Admin','admin@hydrawash.test','8888888888','$2b$10$sxMSZBHRZRv043z/.LU1IeEHCXN2Fj4CofhcDCVa4zlzGTd.NNxA6','Admin',1),
  ('Demo Operator','operator@hydrawash.test','8888888887','$2b$10$sxMSZBHRZRv043z/.LU1IeEHCXN2Fj4CofhcDCVa4zlzGTd.NNxA6','Operator',1),
  ('Demo Rider','rider@hydrawash.test','8888888886','$2b$10$sxMSZBHRZRv043z/.LU1IeEHCXN2Fj4CofhcDCVa4zlzGTd.NNxA6','Delivery',1);

INSERT INTO customer_subscription (customer_id, plan_id, cycles_used, start_date, end_date)
VALUES (1, 1, 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY));
INSERT INTO payment (subscription_id, amount, mode, status, txn_ref, paid_at)
VALUES (1, 2999.00, 'UPI', 'Success', 'DEMO-TXN-0001', NOW());

-- Two historical orders that walk through the full workflow (fires triggers)
INSERT INTO laundry_order (order_code, customer_id, subscription_id, order_date)
VALUES ('947026',1,1,DATE_SUB(NOW(), INTERVAL 20 DAY)), ('009228',1,1,DATE_SUB(NOW(), INTERVAL 10 DAY));
INSERT INTO order_item (order_id,item_id,service_id,quantity) VALUES
  (1,13,1,5),(1,15,1,6),(2,12,1,2),(2,14,1,3),(2,1,1,1);
UPDATE customer_subscription SET cycles_used = 2 WHERE subscription_id = 1;

CALL sp_update_order_status('947026','Pending',  2,'Bag received');
CALL sp_update_order_status('947026','Accepted', 2,NULL);
CALL sp_update_order_status('947026','Ready',    2,NULL);
CALL sp_update_order_status('947026','Delivered',3,'Handed over');
CALL sp_update_order_status('009228','Pending',  2,NULL);
