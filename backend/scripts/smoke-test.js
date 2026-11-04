// Run with the server started:  npm start   then   npm run test:smoke
const BASE = process.env.BASE_URL || 'http://localhost:3000';
let passed = 0, failed = 0;

async function call(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null; try { data = await res.json(); } catch {}
  return { status: res.status, data };
}
function check(name, cond, extra = '') {
  if (cond) { passed++; console.log('  PASS', name); }
  else { failed++; console.log('  FAIL', name, extra); }
}

(async () => {
  console.log('Health & public');
  let r = await call('GET', '/api/health'); check('health ok', r.status === 200);
  r = await call('GET', '/api/public/stats'); check('public stats', r.status === 200 && r.data.delivered >= 1, JSON.stringify(r.data));
  r = await call('GET', '/api/public/track/947026'); check('public tracker', r.status === 200 && r.data.status === 'Delivered' && r.data.timeline.length >= 5);
  r = await call('GET', '/api/public/track/000000'); check('tracker 404', r.status === 404);
  r = await call('GET', '/api/meta/campuses'); check('campuses+residences', r.status === 200 && r.data[0].residences.length >= 2);
  r = await call('GET', '/api/meta/items'); check('items list', r.status === 200 && r.data.length >= 10);

  console.log('Student flow (matches the app video)');
  r = await call('POST', '/api/auth/login', { email: 'demo@hydrawash.test', password: 'wrong' }); check('bad password rejected', r.status === 401);
  r = await call('POST', '/api/auth/login', { email: 'demo@hydrawash.test', password: 'Test@1234' }); check('login', r.status === 200 && r.data.token);
  const T = r.data.token;
  r = await call('GET', '/api/me/home', null, T);
  check('home: quota + recent orders', r.status === 200 && r.data.quota.cycles_total === 30 && r.data.recent_orders.length >= 1, JSON.stringify(r.data));
  const usedBefore = r.data.quota.cycles_used;
  r = await call('GET', '/api/me', null, T); check('profile (campus/residence/bag)', r.data.campus === 'JKLU' && r.data.residence === 'BH-2' && r.data.bag_id === 'JK0001');
  r = await call('GET', '/api/orders?status=Delivered', null, T); check('filter by status chip', r.status === 200 && r.data.orders.every(o => o.status === 'Delivered'));
  r = await call('GET', '/api/orders?q=9470', null, T); check('search order id', r.data.orders.length === 1);
  r = await call('GET', '/api/orders/947026', null, T); check('order detail (11 items)', r.data.total_count === 11 && r.data.items.length === 2 && r.data.timeline.length === 5, JSON.stringify(r.data));
  r = await call('POST', '/api/orders', { items: [] }, T); check('empty basket rejected', r.status === 400);
  r = await call('POST', '/api/orders', { items: [{ item_id: 999, quantity: 1 }] }, T); check('unknown item rejected', r.status === 400);
  r = await call('POST', '/api/orders', { items: [{ item_id: 12, quantity: 2 }, { item_id: 13, quantity: 1 }, { item_id: 12, quantity: 1 }] }, T);
  check('submit order (Sweatpants x3, T Shirt x1)', r.status === 201 && r.data.total_count === 4 && r.data.status === 'Created', JSON.stringify(r.data));
  const code = r.data && r.data.order_code;
  r = await call('GET', '/api/me/home', null, T); check('quota went up by 1', r.data.quota.cycles_used === usedBefore + 1);
  r = await call('GET', '/api/orders/' + code, null, T); check('own order readable', r.status === 200);

  console.log('Security');
  r = await call('GET', '/api/orders'); check('no token -> 401', r.status === 401);
  r = await call('GET', '/api/admin/orders', null, T); check('student cannot use admin API', r.status === 403);

  console.log('Staff flow');
  r = await call('POST', '/api/auth/staff/login', { email: 'admin@hydrawash.test', password: 'Admin@1234' }); check('admin login', r.status === 200);
  const A = r.data.token;
  r = await call('POST', '/api/auth/staff/login', { email: 'rider@hydrawash.test', password: 'Admin@1234' }); const R = r.data.token;
  r = await call('GET', '/api/admin/orders?status=Created', null, A); check('admin sees Created orders', r.status === 200 && r.data.orders.some(o => o.order_code === code));
  r = await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'Ready' }, A); check('skipping a step is blocked by DB trigger', r.status === 400 && /Invalid order status/.test(r.data.error), JSON.stringify(r.data));
  r = await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'Pending' }, A); check('Created -> Pending', r.status === 200);
  r = await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'Accepted' }, A); check('Pending -> Accepted', r.status === 200);
  r = await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'Ready' }, A); check('Accepted -> Ready', r.status === 200);
  r = await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'Delivered' }, R); check('rider marks Delivered', r.status === 200);
  r = await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'Pending' }, A); check('cannot reopen a Delivered order', r.status === 400);
  r = await call('GET', `/api/notifications`, null, T); check('student got notifications from trigger', r.data.some(n => n.order_code === code && /Delivered/.test(n.title)));
  r = await call('GET', `/api/admin/orders/${code}`, null, A); check('admin detail has history with staff names', r.data.timeline.some(t => t.changed_by === 'Demo Rider'));

  console.log('Revert refunds the wash cycle');
  r = await call('POST', '/api/orders', { items: [{ item_id: 14, quantity: 2 }] }, T); const code2 = r.data.order_code;
  r = await call('GET', '/api/me/home', null, T); const used2 = r.data.quota.cycles_used;
  r = await call('PATCH', `/api/admin/orders/${code2}/status`, { status: 'Reverted' }, A); check('revert needs a reason', r.status === 400);
  r = await call('PATCH', `/api/admin/orders/${code2}/status`, { status: 'Reverted', note: 'Bag tag missing' }, A); check('revert with reason', r.status === 200);
  r = await call('GET', '/api/me/home', null, T); check('cycle refunded by trigger', r.data.quota.cycles_used === used2 - 1, `${r.data.quota.cycles_used} vs ${used2}`);

  console.log('Deliveries, reports, deletion');
  r = await call('POST', `/api/admin/orders/${code}/deliveries`, { delivery_type: 'Delivery', scheduled_time: '2026-11-05T10:00:00', staff_id: 3 }, A); check('schedule delivery', r.status === 201, JSON.stringify(r.data));
  r = await call('PATCH', `/api/admin/deliveries/${r.data.delivery_id}/complete`, null, R); check('rider completes delivery', r.status === 200);
  r = await call('GET', '/api/admin/reports/daily', null, A); check('daily report', r.status === 200 && r.data.length >= 1);
  r = await call('POST', '/api/auth/register', { name: 'New Kid', email: 'new@hydrawash.test', phone: '9000000000', password: 'password123', bag_id: 'jk0002', residence_id: 1 });
  check('register', r.status === 201, JSON.stringify(r.data)); const N = r.data.token;
  r = await call('POST', '/api/orders', { items: [{ item_id: 1, quantity: 1 }] }, N); check('no plan -> blocked', r.status === 403);
  r = await call('POST', '/api/auth/register', { name: 'Dup', email: 'new@hydrawash.test', phone: '9000000000', password: 'password123', bag_id: 'JK0003', residence_id: 1 }); check('duplicate email -> 409', r.status === 409);
  r = await call('POST', '/api/me/deletion-request', { reason: 'Leaving' }, N); check('request deletion', r.status === 201);
  r = await call('GET', '/api/admin/deletion-requests', null, A); const reqId = r.data[0].request_id;
  r = await call('PATCH', `/api/admin/deletion-requests/${reqId}`, { action: 'approve' }, A); check('admin approves deletion', r.status === 200);
  r = await call('POST', '/api/auth/login', { email: 'new@hydrawash.test', password: 'password123' }); check('deleted account cannot log in', r.status === 401);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
