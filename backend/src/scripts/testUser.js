const prisma = require('../utils/prisma');
const { hashPassword } = require('../utils/hashUtils');

const API_URL = 'http://localhost:5000/api';

async function runUserTests() {
  console.log('====================================================');
  console.log('  STARTING TASK 4: NORMAL USER & RATING VERIFICATION ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const timestamp = Date.now();
  const user1Email = `user1.test.${timestamp}@example.com`;
  const user2Email = `user2.test.${timestamp}@example.com`;
  const adminEmail = `admin.test.${timestamp}@example.com`;
  const ownerEmail = `owner.test.${timestamp}@example.com`;
  const password = 'UserPass123!';
  const address = '123 Rating Avenue, Test City';

  let user1Token = null;
  let user2Token = null;
  let adminToken = null;
  let ownerToken = null;

  let storeId = null;

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

  async function assertTest(num, name, testFn) {
    try {
      await testFn();
      console.log(`[PASS] Test ${num}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] Test ${num}: ${name} ->`, err.message);
      failed++;
    }
  }

  // Setup: Create test DB records
  const hashedPw = await hashPassword(password);

  const dbUser1 = await prisma.user.create({
    data: { name: 'Normal User One Account Name', email: user1Email, address, passwordHash: hashedPw, role: 'USER' },
  });
  const dbUser2 = await prisma.user.create({
    data: { name: 'Normal User Two Account Name', email: user2Email, address, passwordHash: hashedPw, role: 'USER' },
  });
  const dbAdmin = await prisma.user.create({
    data: { name: 'Admin Account For User Test', email: adminEmail, address, passwordHash: hashedPw, role: 'ADMIN' },
  });
  const dbOwner = await prisma.user.create({
    data: { name: 'Store Owner Account For Test', email: ownerEmail, address, passwordHash: hashedPw, role: 'STORE_OWNER' },
  });

  const dbStore = await prisma.store.create({
    data: { name: `Test Rating Supermarket ${timestamp}`, email: `store.${timestamp}@example.com`, address: '777 Kolhapur Road', ownerId: dbOwner.id },
  });
  storeId = dbStore.id;

  // Logins to get tokens
  const login1 = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: user1Email, password }) });
  user1Token = login1.data.data.token;

  const login2 = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: user2Email, password }) });
  user2Token = login2.data.data.token;

  const loginAdmin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: adminEmail, password }) });
  adminToken = loginAdmin.data.data.token;

  const loginOwner = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: ownerEmail, password }) });
  ownerToken = loginOwner.data.data.token;

  // 1. USER can retrieve stores
  await assertTest(1, 'USER can retrieve stores (GET /api/stores)', async () => {
    const res = await request('/stores', { method: 'GET', headers: { Authorization: `Bearer ${user1Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.data.stores)) throw new Error('Expected stores array');
  });

  // 2. USER can search by store name
  await assertTest(2, 'USER can search by store name', async () => {
    const res = await request(`/stores?name=Supermarket`, { method: 'GET', headers: { Authorization: `Bearer ${user1Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const found = res.data.data.stores.find((s) => s.id === storeId);
    if (!found) throw new Error('Search by name failed to find store');
  });

  // 3. USER can search by address
  await assertTest(3, 'USER can search by address', async () => {
    const res = await request(`/stores?address=Kolhapur`, { method: 'GET', headers: { Authorization: `Bearer ${user1Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const found = res.data.data.stores.find((s) => s.id === storeId);
    if (!found) throw new Error('Search by address failed to find store');
  });

  // 4 & 5. Initial unrated state
  await assertTest(4, 'USER sees average rating (0 when unrated) and own rating (null)', async () => {
    const res = await request('/stores', { method: 'GET', headers: { Authorization: `Bearer ${user1Token}` } });
    const store = res.data.data.stores.find((s) => s.id === storeId);
    if (store.averageRating !== 0) throw new Error(`Expected 0 average rating, got ${store.averageRating}`);
    if (store.userRating !== null) throw new Error(`Expected null userRating, got ${store.userRating}`);
  });

  // 6. USER can submit rating 1
  await assertTest(6, 'USER can submit rating 1 (POST /api/stores/:id/rating)', async () => {
    const res = await request(`/stores/${storeId}/rating`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ rating: 1 }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status} (${JSON.stringify(res.data)})`);
  });

  // 7. USER 2 can submit rating 5
  await assertTest(7, 'USER 2 can submit rating 5', async () => {
    const res = await request(`/stores/${storeId}/rating`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: JSON.stringify({ rating: 5 }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  // Verify average rating (1 + 5) / 2 = 3.0
  await assertTest(4, 'Overall average rating correctly calculated as 3.0', async () => {
    const res = await request('/stores', { method: 'GET', headers: { Authorization: `Bearer ${user1Token}` } });
    const store = res.data.data.stores.find((s) => s.id === storeId);
    if (store.averageRating !== 3) throw new Error(`Expected 3.0 average rating, got ${store.averageRating}`);
    if (store.userRating !== 1) throw new Error(`User 1 rating should be 1, got ${store.userRating}`);
  });

  // 8. Rating 0 rejected
  await assertTest(8, 'Rating 0 rejected (400 Bad Request)', async () => {
    const res = await request(`/stores/${storeId}/rating`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ rating: 0 }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 9. Rating 6 rejected
  await assertTest(9, 'Rating 6 rejected (400 Bad Request)', async () => {
    const res = await request(`/stores/${storeId}/rating`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ rating: 6 }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 10. Decimal rating rejected
  await assertTest(10, 'Decimal rating 3.5 rejected (400 Bad Request)', async () => {
    const res = await request(`/stores/${storeId}/rating`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ rating: 3.5 }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 11. Malformed / Non-existent store ID rejected
  await assertTest(11, 'Non-existent / malformed store ID rejected (400/404)', async () => {
    const res1 = await request('/stores/invalid-uuid-123/rating', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ rating: 4 }),
    });
    if (res1.status !== 400) throw new Error(`Expected 400 for malformed UUID, got ${res1.status}`);

    const res2 = await request('/stores/00000000-0000-0000-0000-000000000000/rating', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ rating: 4 }),
    });
    if (res2.status !== 404 && res2.status !== 400) throw new Error(`Expected 404 for non-existent store, got ${res2.status}`);
  });

  // 12 & 13. USER can update rating and average updates without duplicate
  await assertTest(12, 'USER 1 updates rating from 1 to 5 (PUT /api/stores/:id/rating)', async () => {
    const res = await request(`/stores/${storeId}/rating`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ rating: 5 }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);

    // Check count of rating rows in DB for storeId
    const count = await prisma.rating.count({ where: { storeId } });
    if (count !== 2) throw new Error(`Expected 2 rating rows, got ${count} (duplicate row created!)`);

    // Verify new average rating: (5 + 5) / 2 = 5.0
    const listRes = await request('/stores', { method: 'GET', headers: { Authorization: `Bearer ${user1Token}` } });
    const store = listRes.data.data.stores.find((s) => s.id === storeId);
    if (store.averageRating !== 5) throw new Error(`Expected 5.0 average rating after update, got ${store.averageRating}`);
  });

  // 14. USER cannot modify another user's rating
  await assertTest(14, 'USER cannot modify another user rating (using req.user.id)', async () => {
    // User 2 rating is currently 5. User 1 sends PUT request. Only User 1's rating changes.
    const res = await request(`/stores/${storeId}/rating`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: JSON.stringify({ rating: 4 }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);

    const u2Rating = await prisma.rating.findUnique({
      where: { userId_storeId: { userId: dbUser2.id, storeId } },
    });
    if (u2Rating.rating !== 5) throw new Error(`User 2 rating was modified by User 1!`);
  });

  // 15. Unauthenticated request rejected
  await assertTest(15, 'Unauthenticated request rejected (401 Unauthorized)', async () => {
    const res = await request('/stores', { method: 'GET' });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 16. ADMIN cannot use USER-only rating endpoint
  await assertTest(16, 'ADMIN receives 403 Forbidden on /api/stores', async () => {
    const res = await request('/stores', { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 17. STORE_OWNER cannot use USER-only rating endpoint
  await assertTest(17, 'STORE_OWNER receives 403 Forbidden on /api/stores', async () => {
    const res = await request('/stores', { method: 'GET', headers: { Authorization: `Bearer ${ownerToken}` } });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 18. Search with no results handled correctly
  await assertTest(18, 'Search with no results returns empty stores array', async () => {
    const res = await request('/stores?name=NonExistentStoreQuery999', { method: 'GET', headers: { Authorization: `Bearer ${user1Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.stores.length !== 0) throw new Error('Expected 0 stores');
  });

  // Cleanup test DB records
  await prisma.rating.deleteMany({ where: { storeId } });
  await prisma.store.delete({ where: { id: storeId } });
  await prisma.user.deleteMany({ where: { email: { contains: timestamp.toString() } } });

  console.log('\n--- TASK 4 TEST DATA CLEANED UP FROM DATABASE ---');

  console.log('\n====================================================');
  console.log(`  NORMAL USER VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED  `);
  console.log('====================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runUserTests().catch(async (err) => {
  console.error('Fatal User Test Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
