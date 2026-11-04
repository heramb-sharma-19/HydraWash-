-- Handy queries to run in Workbench to verify everything is wired up.
USE hydrawash_db;

SELECT * FROM v_customer_quota;                       -- "Wash Cycles Used 2/30"
SELECT * FROM v_staff_queue;                          -- staff work list
SELECT * FROM v_daily_report;                         -- reports page
CALL sp_order_details('947026');                      -- bill
SELECT * FROM order_status_history ORDER BY history_id; -- audit trail from trigger
SELECT * FROM notification ORDER BY notification_id;  -- bell-icon rows from trigger

-- Prove the workflow rule works (this MUST fail with 'Invalid order status transition'):
CALL sp_update_order_status('947026','Pending',2,'should fail');

-- Customer home screen in one query:
SELECT o.order_code, o.order_date, o.status, o.total_count
  FROM laundry_order o WHERE o.customer_id = 1
 ORDER BY o.order_date DESC LIMIT 3;
