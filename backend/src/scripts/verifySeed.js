const API_URL = 'http://localhost:5000/api';

async function verifySeed() {
  console.log('====================================================');
  console.log('    VERIFYING DEMO SEED ACCOUNTS & ROLE PORTALS     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  async function assertCheck(num, name, checkFn) {
    try {
      await checkFn();
      console.log(`[PASS] Check ${num}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] Check ${num}: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1 & 4. ADMIN login & role check
  let adminToken = null;
  await assertCheck(1, 'ADMIN login with admin@storerate.local', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@storerate.local', password: 'Admin@123' }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.user.role !== 'ADMIN') throw new Error(`Expected ADMIN role, got ${res.data.data.user.role}`);
    if (res.data.data.user.passwordHash) throw new Error('passwordHash leaked in login!');
    adminToken = res.data.data.token;
  });

  // 2 & 4. NORMAL USER login & role check
  let userToken = null;
  await assertCheck(2, 'NORMAL USER login with user@storerate.local', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@storerate.local', password: 'User@123' }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.user.role !== 'USER') throw new Error(`Expected USER role, got ${res.data.data.user.role}`);
    if (res.data.data.user.passwordHash) throw new Error('passwordHash leaked in login!');
    userToken = res.data.data.token;
  });

  // 3 & 4. STORE_OWNER login & role check
  let ownerToken = null;
  await assertCheck(3, 'STORE_OWNER login with owner@storerate.local', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'owner@storerate.local', password: 'Owner@123' }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.user.role !== 'STORE_OWNER') throw new Error(`Expected STORE_OWNER role, got ${res.data.data.user.role}`);
    if (res.data.data.user.passwordHash) throw new Error('passwordHash leaked in login!');
    ownerToken = res.data.data.token;
  });

  // 5. GET /api/auth/me passwordHash leakage check
  await assertCheck(5, 'GET /api/auth/me never exposes passwordHash', async () => {
    const res = await request('/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
    if (JSON.stringify(res.data).includes('passwordHash')) throw new Error('passwordHash leaked in /me response!');
  });

  // 6. ADMIN accesses Admin Dashboard
  await assertCheck(6, 'ADMIN accesses Admin Dashboard (GET /api/admin/dashboard)', async () => {
    const res = await request('/admin/dashboard', { headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 7. USER accesses User Store Browser
  await assertCheck(7, 'USER accesses User Store Browser (GET /api/stores)', async () => {
    const res = await request('/stores', { headers: { Authorization: `Bearer ${userToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const demoStore = res.data.data.stores.find((s) => s.name === 'Demo StoreRate Market');
    if (!demoStore) throw new Error('Demo StoreRate Market not found in store listing');
  });

  // 8 & 9. STORE_OWNER accesses Owner Dashboard & sees demo store & ratings
  await assertCheck(8, 'STORE_OWNER accesses Owner Dashboard and sees assigned store data', async () => {
    const res = await request('/owner/dashboard', { headers: { Authorization: `Bearer ${ownerToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const store = res.data.data.store;
    if (store.name !== 'Demo StoreRate Market') throw new Error(`Expected Demo StoreRate Market, got ${store.name}`);
    if (store.totalRatings !== 3) throw new Error(`Expected 3 total ratings, got ${store.totalRatings}`);
    if (store.averageRating !== 4.7) throw new Error(`Expected 4.7 average rating, got ${store.averageRating}`);
  });

  console.log('\n====================================================');
  console.log(`    SEED VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED   `);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

verifySeed().catch((err) => {
  console.error('Fatal Seed Verification Error:', err);
  process.exit(1);
});
