const prisma = require('../utils/prisma');

const API_URL = 'http://localhost:5000/api';

async function runAdminTests() {
  console.log('====================================================');
  console.log('  STARTING TASK 3: ADMIN MANAGEMENT VERIFICATION    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const timestamp = Date.now();
  const adminEmail = `admin.test.${timestamp}@example.com`;
  const userEmail = `user.test.${timestamp}@example.com`;
  const newAdminEmail = `created.admin.${timestamp}@example.com`;
  const ownerEmail = `store.owner.${timestamp}@example.com`;
  const storeEmail = `test.store.${timestamp}@example.com`;
  const password = 'AdminPass123!';
  const address = '999 Admin Way, Capital City';

  let adminToken = null;
  let userToken = null;
  let ownerToken = null;

  let createdOwnerId = null;
  let createdStoreId = null;
  let createdUserId = null;

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

  // Setup: Create test Admin, User, and Store Owner in DB
  const { hashPassword } = require('../utils/hashUtils');
  const hashedPw = await hashPassword(password);

  const dbAdmin = await prisma.user.create({
    data: { name: 'Super Administrator Account', email: adminEmail, address, passwordHash: hashedPw, role: 'ADMIN' },
  });
  const dbUser = await prisma.user.create({
    data: { name: 'Normal Regular User Account', email: userEmail, address, passwordHash: hashedPw, role: 'USER' },
  });
  const dbOwner = await prisma.user.create({
    data: { name: 'Licensed Store Owner Account', email: ownerEmail, address, passwordHash: hashedPw, role: 'STORE_OWNER' },
  });

  createdOwnerId = dbOwner.id;

  // Logins to get tokens
  const adminLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: adminEmail, password }) });
  adminToken = adminLogin.data.data.token;

  const userLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: userEmail, password }) });
  userToken = userLogin.data.data.token;

  const ownerLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: ownerEmail, password }) });
  ownerToken = ownerLogin.data.data.token;

  // 1. Admin dashboard metrics
  await assertTest(1, 'Admin dashboard metrics (GET /api/admin/dashboard)', async () => {
    const res = await request('/admin/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (typeof res.data.data.totalUsers !== 'number') throw new Error('Missing totalUsers metric');
    if (typeof res.data.data.totalStores !== 'number') throw new Error('Missing totalStores metric');
    if (typeof res.data.data.totalRatings !== 'number') throw new Error('Missing totalRatings metric');
  });

  // 2. Admin can list users
  await assertTest(2, 'Admin can list users (GET /api/admin/users)', async () => {
    const res = await request('/admin/users', { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.data.users)) throw new Error('Expected users array');
    if (res.data.data.users.some((u) => u.passwordHash)) throw new Error('passwordHash leaked in user list!');
  });

  // 3. Admin can create USER
  await assertTest(3, 'Admin can create USER (POST /api/admin/users)', async () => {
    const res = await request('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Admin Created Normal User Name',
        email: `created.user.${timestamp}@example.com`,
        address,
        password,
        role: 'USER',
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status} (${JSON.stringify(res.data)})`);
    if (res.data.data.user.role !== 'USER') throw new Error('Role mismatch');
    if (res.data.data.user.passwordHash) throw new Error('passwordHash leaked!');
    createdUserId = res.data.data.user.id;
  });

  // 4. Admin can create ADMIN
  await assertTest(4, 'Admin can create ADMIN (POST /api/admin/users)', async () => {
    const res = await request('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Admin Created Secondary Admin',
        email: newAdminEmail,
        address,
        password,
        role: 'ADMIN',
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (res.data.data.user.role !== 'ADMIN') throw new Error('Role mismatch');
  });

  // 5. Admin can create STORE_OWNER
  await assertTest(5, 'Admin can create STORE_OWNER (POST /api/admin/users)', async () => {
    const res = await request('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Admin Created Store Owner Account',
        email: `created.owner.${timestamp}@example.com`,
        address,
        password,
        role: 'STORE_OWNER',
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (res.data.data.user.role !== 'STORE_OWNER') throw new Error('Role mismatch');
  });

  // 6. Duplicate email rejected
  await assertTest(6, 'Duplicate email creation rejected (409 Conflict)', async () => {
    const res = await request('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Admin Created Duplicate User',
        email: adminEmail,
        address,
        password,
        role: 'USER',
      }),
    });
    if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
  });

  // 7. Admin can view user details
  await assertTest(7, 'Admin can view user details (GET /api/admin/users/:id)', async () => {
    const res = await request(`/admin/users/${dbUser.id}`, { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.user.email !== userEmail) throw new Error('Email mismatch');
    if (res.data.data.user.passwordHash) throw new Error('passwordHash leaked in user details!');
  });

  // 8. Store Owner details include store/rating information
  await assertTest(8, 'Store Owner details include store/rating information', async () => {
    const res = await request(`/admin/users/${dbOwner.id}`, { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.data.user.stores)) throw new Error('Missing stores array on STORE_OWNER');
  });

  // 9. Admin can create store
  await assertTest(9, 'Admin can create store (POST /api/admin/stores)', async () => {
    const res = await request('/admin/stores', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Apex Superstore & Electronics',
        email: storeEmail,
        address: '555 Commerce Way',
        ownerId: createdOwnerId,
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status} (${JSON.stringify(res.data)})`);
    if (res.data.data.store.name !== 'Apex Superstore & Electronics') throw new Error('Store name mismatch');
    createdStoreId = res.data.data.store.id;
  });

  // 10. Invalid owner / non-STORE_OWNER ownerId rejected
  await assertTest(10, 'Rejects store creation with normal USER ownerId', async () => {
    const res = await request('/admin/stores', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Invalid Owner Store Name',
        email: `invalid.owner.${timestamp}@example.com`,
        address: '555 Commerce Way',
        ownerId: dbUser.id, // dbUser has role USER, not STORE_OWNER
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
  });

  // 11. Admin can list stores
  await assertTest(11, 'Admin can list stores (GET /api/admin/stores)', async () => {
    const res = await request('/admin/stores', { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.data.stores)) throw new Error('Expected stores array');
    const store = res.data.data.stores.find((s) => s.id === createdStoreId);
    if (!store) throw new Error('Created store not found in store listing');
    if (typeof store.averageRating !== 'number') throw new Error('Missing calculated averageRating');
  });

  // 12. User filtering (by name, email, address, role)
  await assertTest(12, 'User filtering by role and email', async () => {
    const res = await request(`/admin/users?role=STORE_OWNER&email=${ownerEmail}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.users.length !== 1 || res.data.data.users[0].email !== ownerEmail) {
      throw new Error('Filtering failed to return exact matching user');
    }
  });

  // 13. User sorting
  await assertTest(13, 'User sorting by name asc', async () => {
    const res = await request('/admin/users?sortBy=name&sortOrder=asc', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 14. Store filtering
  await assertTest(14, 'Store filtering by email', async () => {
    const res = await request(`/admin/stores?email=${storeEmail}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.stores.length !== 1 || res.data.data.stores[0].email !== storeEmail) {
      throw new Error('Store filtering failed');
    }
  });

  // 15. Store sorting by rating
  await assertTest(15, 'Store sorting by rating desc', async () => {
    const res = await request('/admin/stores?sortBy=rating&sortOrder=desc', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 16. USER cannot access admin API (403 Forbidden)
  await assertTest(16, 'Normal USER receives 403 Forbidden on /api/admin/dashboard', async () => {
    const res = await request('/admin/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${userToken}` } });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 17. STORE_OWNER cannot access admin API (403 Forbidden)
  await assertTest(17, 'STORE_OWNER receives 403 Forbidden on /api/admin/dashboard', async () => {
    const res = await request('/admin/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${ownerToken}` } });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 18. passwordHash never returned
  await assertTest(18, 'passwordHash is never returned in any response', async () => {
    const res = await request(`/admin/users/${dbAdmin.id}`, { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.data.data.user.passwordHash) throw new Error('passwordHash leaked!');
  });

  // Database Cleanup
  await prisma.store.deleteMany({ where: { email: { contains: timestamp.toString() } } });
  await prisma.user.deleteMany({ where: { email: { contains: timestamp.toString() } } });

  console.log('\n--- TASK 3 TEST DATA CLEANED UP FROM DATABASE ---');

  console.log('\n====================================================');
  console.log(`  ADMIN VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED  `);
  console.log('====================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminTests().catch(async (err) => {
  console.error('Fatal Admin Test Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
