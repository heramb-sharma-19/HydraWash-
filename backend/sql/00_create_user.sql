-- Run ONCE in MySQL Workbench as root (File > Open SQL Script > Run).
-- Creates a limited user for the Node app so the app never uses root.
CREATE USER IF NOT EXISTS 'hydrawash_user'@'localhost' IDENTIFIED BY 'ChangeMe_123!';
GRANT ALL PRIVILEGES ON hydrawash_db.* TO 'hydrawash_user'@'localhost';
FLUSH PRIVILEGES;
