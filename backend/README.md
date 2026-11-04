# HydraWash Backend (Node.js + Express + MySQL)

REST API for the HydraWash laundry system. One backend serves the **website**
(React + Tailwind) and the **mobile app** later. Designed from the QSW Laundromat
screen recording: Home, My Orders (status chips + search), New Order (basket),
Profile, notifications, account deletion.

## 1. Folder map

```
sql/
  00_create_user.sql              limited MySQL user for the app (not root)
  01_schema.sql                   15 tables
  02_triggers_views_procedures.sql  triggers, views, stored procedures
  03_seed.sql                     demo data
  99_test_queries.sql             queries to run in Workbench
src/
  config/db.js                    connection pool + friendly startup errors
  middleware/                     auth (JWT) + error handler
  routes/                         auth, me, orders, notifications, meta, public, admin
scripts/smoke-test.js             42 automated checks
server.js
```

## 2. Link MySQL Workbench with the backend (step by step)

Workbench and Node are two clients of the **same MySQL server**. They link when they use
the same host, port, database and a valid user.

**Step 1 - Create a Workbench connection**
Workbench home > `MySQL Connections (+)` > Name `HydraWash Local`, Hostname `127.0.0.1`,
Port `3306`, Username `root` > `Test Connection` > OK > open it.

**Step 2 - Build the database** (File > Open SQL Script, then click the lightning bolt)
Run in this order: `01_schema.sql`, `02_triggers_views_procedures.sql`, `03_seed.sql`, `00_create_user.sql`.
In the left *Schemas* panel press refresh: `hydrawash_db` appears with 15 tables.

**Step 3 - Edit the password in `00_create_user.sql`** (`ChangeMe_123!`) before running it, then
put the same password in `.env`.

**Step 4 - Configure and start the API**
```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: DB_PASSWORD and JWT_SECRET
npm start
```
You must see: `MySQL connected -> database "hydrawash_db"`. If not, the message under it tells you what to fix.

**Step 5 - Prove the link works (both directions)**
1. Browser: `http://localhost:3000/api/public/stats` returns JSON counts from your tables.
2. Place an order through the API (see section 4), then in Workbench run
   `SELECT * FROM laundry_order ORDER BY order_id DESC;` - the new row is there, and
   `order_status_history` and `order_item` filled themselves via triggers.
3. In Workbench run `CALL sp_update_order_status('<code>','Pending',1,'test');` then
   call `GET /api/orders/<code>` - the API shows the new status.
4. `npm run test:smoke` (server running) runs 42 end-to-end checks.

**Step 6 - Generate your ER diagram from the real database (for the report)**
Workbench > Database > Reverse Engineer > pick the connection > select `hydrawash_db` > Next ... > Finish.
Export with File > Export > PNG / PDF.

### Workbench gotchas

| Symptom | Cause | Fix |
|---|---|---|
| API hangs or `Lock wait timeout` | Workbench has an open transaction (auto-commit toggled off) | Press `Commit` or re-enable auto-commit (the toolbar icon) |
| Error 1175 on UPDATE/DELETE | Workbench safe-update mode | Add `WHERE <primary key> = ...`, or Edit > Preferences > SQL Editor > untick Safe Updates |
| Data in Workbench looks old | Result grid is a snapshot | Re-run the query |
| `ECONNREFUSED` | MySQL service stopped | Start MySQL (Windows: Services > MySQL80) |
| `ER_ACCESS_DENIED_ERROR` | Wrong `.env` login | Test the same user/password as a new Workbench connection |
| `ER_BAD_DB_ERROR` | Schema not created | Run `01_schema.sql` |
| `ER_NOT_SUPPORTED_AUTH_MODE` | Old client library | Use `mysql2` (already used here), not `mysql` |
| `CHECK` rules not enforced | MySQL older than 8.0.16 | Upgrade to MySQL 8.x |

## 3. Demo logins (from `03_seed.sql`)

| Role | Email | Password |
|---|---|---|
| Student | demo@hydrawash.test | Test@1234 |
| Admin / Operator / Rider | admin@ / operator@ / rider@hydrawash.test | Admin@1234 |

Change or delete these before any real deployment.

## 4. API reference

All bodies are JSON. Protected routes need `Authorization: Bearer <token>`.

| Screen / purpose | Method & path |
|---|---|
| Sign up dropdowns | `GET /api/meta/campuses` |
| "Select Items" popup | `GET /api/meta/items` |
| Wash/Dry/Iron cards | `GET /api/meta/services` |
| Status chips | `GET /api/meta/statuses` |
| Register / login | `POST /api/auth/register`, `POST /api/auth/login` |
| Staff login | `POST /api/auth/staff/login` |
| **Home** (cycles 6/30, recent orders, unread bell count) | `GET /api/me/home` |
| **Profile** | `GET /api/me`, `PATCH /api/me` |
| Logout | client deletes the token (JWT is stateless) |
| Request Account Deletion | `POST /api/me/deletion-request` |
| **My Orders** (chips + search) | `GET /api/orders?status=Pending&q=9470&page=1&limit=10` |
| **View** an order | `GET /api/orders/:code` |
| **Submit Order** | `POST /api/orders` body `{"items":[{"item_id":12,"quantity":2},{"item_id":13,"quantity":1}]}` |
| Bell icon | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all` |
| Website hero stats / tracker | `GET /api/public/stats`, `GET /api/public/track/:code` |
| Staff order list / detail | `GET /api/admin/orders?status=&q=`, `GET /api/admin/orders/:code` |
| Move an order forward | `PATCH /api/admin/orders/:code/status` `{"status":"Accepted","note":"..."}` |
| Pickup / delivery legs | `POST /api/admin/orders/:code/deliveries`, `PATCH /api/admin/deliveries/:id/complete` |
| Reports | `GET /api/admin/reports/daily`, `GET /api/admin/queue` |
| Plans | `POST /api/admin/customers/:id/subscription` |
| Deletion queue | `GET /api/admin/deletion-requests`, `PATCH /api/admin/deletion-requests/:id` `{"action":"approve"}` |

Order workflow (enforced by the database trigger, not just the API):
`Created > Pending > Accepted > Ready > Delivered`, and `Created/Pending/Accepted > Reverted`.

## 5. Where each DBMS concept lives (for your viva)

| Concept | Where |
|---|---|
| ER to relational mapping, 3NF | `01_schema.sql`, `CHANGES.md` |
| Constraints (PK, FK, UNIQUE, CHECK, ENUM, DEFAULT) | `01_schema.sql` |
| Triggers (totals, price snapshot, workflow rule, audit log, notifications, quota refund) | `02_...sql` |
| Stored procedures | `sp_update_order_status`, `sp_order_details` |
| Views | `v_customer_quota`, `v_staff_queue`, `v_daily_report` |
| Transactions (ACID) | `POST /api/orders` (quota lock + order + lines + quota), deletion request, plan purchase |
| Indexes | `idx_order_customer`, `idx_order_status`, `idx_notif_customer` |
| Joins / aggregates | list and report routes, `v_daily_report` |
| SQL injection defence | every query uses `?` placeholders |

## 6. Getting ready for the mobile app

* Responses are plain JSON, authentication is a bearer token, so React Native / Flutter work unchanged.
* Pagination (`page`, `limit`) is already supported on list endpoints.
* Later: add a `device_token` table and Firebase push notifications (the `notification` table already records what to send).
* Before deploying: HTTPS, a strong `JWT_SECRET`, and tighter `CORS_ORIGIN`.
