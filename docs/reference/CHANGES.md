# What changed from your ER diagram, and why

## Problems in the original diagram

1. **ORDER ITEM mixed two things.** `ITEM_NAME` and `CATEGORY` depend on `ITEM_ID`, not on the order line,
   which breaks 2NF/3NF. Fix: new **ITEM** table (the catalogue behind the "Select Items" popup).
2. **ORDER ITEM had no clear key.** Fix: surrogate `order_item_id` plus `UNIQUE(order_id, item_id, service_id)`.
3. **CUSTOMER lacked login and campus data** the app shows: password, Bag ID, campus, residence, account status.
4. **Campus depends on residence** (BH-2 belongs to JKLU), so storing both on CUSTOMER is a transitive dependency.
   Fix: **CAMPUS** and **RESIDENCE** tables; the customer stores only `residence_id`.
5. **No cardinalities** on the relationships. The new diagram uses crow's-foot notation (1 : N shown explicitly).
6. **TOTAL COUNT is a derived attribute.** Kept for speed, but now maintained by triggers so it cannot go out of sync.
7. **DELIVERY had no staff and a confusing key name** (`PICK-UP DELIVERY-ID`). Now `delivery_id`, `delivery_type`
   (Pickup / Delivery), and `staff_id`, so one order can have both legs.
8. **Order ID**: the app shows 6-digit ids (#947026). Internal `order_id` stays an integer; the public one is `order_code`.

## New tables (features seen in the video)

| Table | Why |
|---|---|
| CAMPUS, RESIDENCE | Facility Info on the Profile screen |
| STAFF | Someone must accept orders and deliver them |
| SUBSCRIPTION_PLAN, CUSTOMER_SUBSCRIPTION | "Wash Cycles Used 6/30" |
| PAYMENT | Paying for a plan (optional; delete if your project has no payments) |
| ITEM | Select Items popup (Bed Sheet, Blanket, ... Others) |
| ORDER_STATUS_HISTORY | Audit trail and the tracker timeline |
| NOTIFICATION | Bell icon on Home |
| ACCOUNT_DELETION_REQUEST | "Request Account Deletion" button |

## Assumptions I made (please confirm or correct)

* **Status meaning.** The chips show Created, Pending, Accepted, Reverted, Ready, Delivered. I treated them as
  Created (student submitted) > Pending (waiting for bag) > Accepted (laundry took it) > Ready > Delivered, with
  Reverted meaning the laundry sent it back. If your meanings differ, edit the `ENUM` in `01_schema.sql`
  and the rule in trigger `trg_order_bu`.
* **One order uses one wash cycle**, regardless of item count (an order of 11 items still counts once).
* **Item list.** The video only showed part of the list. I seeded the visible items plus a few likely ones
  (Jeans, Shirt, Shorts, Socks). Add yours in `03_seed.sql`.
* **Service.** The app has no service picker, so every line defaults to `Wash` (service 1). The website can still
  offer Wash / Dry / Iron. Prices are 0 because the plan covers the cost; set `price_per_item` if you bill per item.
* The video's status chip row may continue past "Delivered"; I could only see up to there.

## Testing

Everything was run against a MySQL-compatible server (MariaDB 10.11), including all triggers, procedures and
42 API checks. I could not run it on MySQL 8 itself, but the SQL uses only features common to both. If anything
differs on your Workbench setup, send me the error text.
