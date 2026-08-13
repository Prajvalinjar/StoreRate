const prisma = require('../utils/prisma');
const { hashPassword } = require('../utils/hashUtils');

const API_URL = 'http://localhost:5000/api';

async function runOwnerTests() {
  console.log('====================================================');
  console.log('  STARTING TASK 5: STORE OWNER DASHBOARD VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const timestamp = Date.now();
  const owner1Email = `owner1.test.${timestamp}@example.com`;
  const owner2Email = `owner2.test.${timestamp}@example.com`;
  const unassignedOwnerEmail = `unassigned.owner.${timestamp}@example.com`;
  const user1Email = `user1.test.${timestamp}@example.com`;
  const user2Email = `user2.test.${timestamp}@example.com`;
  const user3Email = `user3.test.${timestamp}@example.com`;
  const adminEmail = `admin.test.${timestamp}@example.com`;
  const password = 'OwnerPass123!';
  const address = '100 Owner Boulevard, Metropolis';

  let owner1Token = null;
  let owner2Token = null;
  let unassignedOwnerToken = null;
  let user1Token = null;
  let adminToken = null;

  let store1Id = null;
  let store2Id = null;

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

  const dbOwner1 = await prisma.user.create({
    data: { name: 'Store Owner One Full Name Account', email: owner1Email, address, passwordHash: hashedPw, role: 'STORE_OWNER' },
  });
  const dbOwner2 = await prisma.user.create({
    data: { name: 'Store Owner Two Full Name Account', email: owner2Email, address, passwordHash: hashedPw, role: 'STORE_OWNER' },
  });
  const dbUnassignedOwner = await prisma.user.create({
    data: { name: 'Unassigned Store Owner Account', email: unassignedOwnerEmail, address, passwordHash: hashedPw, role: 'STORE_OWNER' },
  });
  const dbUser1 = await prisma.user.create({
    data: { name: 'Rater User One Full Name Account', email: user1Email, address, passwordHash: hashedPw, role: 'USER' },
  });
  const dbUser2 = await prisma.user.create({
    data: { name: 'Rater User Two Full Name Account', email: user2Email, address, passwordHash: hashedPw, role: 'USER' },
  });
  const dbUser3 = await prisma.user.create({
    data: { name: 'Rater User Three Full Name Account', email: user3Email, address, passwordHash: hashedPw, role: 'USER' },
  });
  const dbAdmin = await prisma.user.create({
    data: { name: 'Admin Account For Owner Testing', email: adminEmail, address, passwordHash: hashedPw, role: 'ADMIN' },
  });

  // Create Stores
  const dbStore1 = await prisma.store.create({
    data: { name: `Owner One Superstore ${timestamp}`, email: `store1.${timestamp}@example.com`, address: '123 Market Street', ownerId: dbOwner1.id },
  });
  store1Id = dbStore1.id;

  const dbStore2 = await prisma.store.create({
    data: { name: `Owner Two Hypermarket ${timestamp}`, email: `store2.${timestamp}@example.com`, address: '456 Commercial Way', ownerId: dbOwner2.id },
  });
  store2Id = dbStore2.id;

  // Logins to get tokens
  const loginO1 = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: owner1Email, password }) });
  owner1Token = loginO1.data.data.token;

  const loginO2 = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: owner2Email, password }) });
  owner2Token = loginO2.data.data.token;

  const loginUnassigned = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: unassignedOwnerEmail, password }) });
  unassignedOwnerToken = loginUnassigned.data.data.token;

  const loginU1 = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: user1Email, password }) });
  user1Token = loginU1.data.data.token;

  const loginAdmin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: adminEmail, password }) });
  adminToken = loginAdmin.data.data.token;

  // 1. STORE_OWNER can access owner dashboard
  await assertTest(1, 'STORE_OWNER can access owner dashboard (GET /api/owner/dashboard)', async () => {
    const res = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${owner1Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 2. USER receives 403 Forbidden
  await assertTest(2, 'USER receives 403 Forbidden on owner dashboard', async () => {
    const res = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${user1Token}` } });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 3. ADMIN receives 403 Forbidden
  await assertTest(3, 'ADMIN receives 403 Forbidden on owner dashboard', async () => {
    const res = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 4. Unauthenticated request receives 401 Unauthorized
  await assertTest(4, 'Unauthenticated request receives 401 Unauthorized', async () => {
    const res = await request('/owner/dashboard', { method: 'GET' });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // 5. Unassigned owner receives clean store: null response
  await assertTest(5, 'Owner without assigned store returns clean payload (store: null)', async () => {
    const res = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${unassignedOwnerToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.store !== null) throw new Error('Expected store to be null');
  });

  // 6. Store with no ratings produces correct empty state payload (averageRating: null, totalRatings: 0)
  await assertTest(6, 'Store with no ratings produces averageRating: null, totalRatings: 0', async () => {
    const res = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${owner1Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const store = res.data.data.store;
    if (store.averageRating !== null) throw new Error(`Expected averageRating null, got ${store.averageRating}`);
    if (store.totalRatings !== 0) throw new Error(`Expected totalRatings 0, got ${store.totalRatings}`);
    if (store.ratings.length !== 0) throw new Error('Expected empty ratings array');
  });

  // Submit Ratings: User 1 -> 5, User 2 -> 4, User 3 -> 3 for Store 1
  await prisma.rating.createMany({
    data: [
      { userId: dbUser1.id, storeId: store1Id, rating: 5 },
      { userId: dbUser2.id, storeId: store1Id, rating: 4 },
      { userId: dbUser3.id, storeId: store1Id, rating: 3 },
    ],
  });

  // Submit Rating for Store 2 (User 1 -> 2)
  await prisma.rating.create({
    data: { userId: dbUser1.id, storeId: store2Id, rating: 2 },
  });

  // 7 & 8. Boundary test: Average rating calculation (5 + 4 + 3) / 3 = 4.0
  await assertTest(7, 'Average rating boundary calculation (5, 4, 3 -> 4.0)', async () => {
    const res = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${owner1Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const store = res.data.data.store;
    if (store.averageRating !== 4) throw new Error(`Expected averageRating 4.0, got ${store.averageRating}`);
    if (store.totalRatings !== 3) throw new Error(`Expected totalRatings 3, got ${store.totalRatings}`);
    if (store.ratings.length !== 3) throw new Error(`Expected 3 rating entries, got ${store.ratings.length}`);
  });

  // 9. Owner sees users who rated their store with details
  await assertTest(9, 'Owner sees rater user details (name, email, rating, date)', async () => {
    const res = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${owner1Token}` } });
    const store = res.data.data.store;
    const rater = store.ratings.find((r) => r.userEmail === user1Email);
    if (!rater) throw new Error('Rater User 1 not found in ratings list');
    if (rater.userName !== 'Rater User One Full Name Account') throw new Error('User name mismatch');
    if (rater.rating !== 5) throw new Error('Rating value mismatch');
  });

  // 10. Data Isolation: Owner 1 cannot see Owner 2 store/rating data
  await assertTest(10, 'Data Isolation: Owner 1 sees Store 1, Owner 2 sees Store 2', async () => {
    const res1 = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${owner1Token}` } });
    if (res1.data.data.store.id !== store1Id) throw new Error('Owner 1 saw wrong store!');

    const res2 = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${owner2Token}` } });
    if (res2.data.data.store.id !== store2Id) throw new Error('Owner 2 saw wrong store!');
    if (res2.data.data.store.totalRatings !== 1) throw new Error('Owner 2 saw wrong ratings count!');
  });

  // 11. passwordHash is never returned
  await assertTest(11, 'passwordHash is never returned in dashboard payload', async () => {
    const res = await request('/owner/dashboard', { method: 'GET', headers: { Authorization: `Bearer ${owner1Token}` } });
    const payloadStr = JSON.stringify(res.data);
    if (payloadStr.includes('passwordHash')) throw new Error('passwordHash LEAKED in response!');
  });

  // 12. Store Owner change-password works
  await assertTest(12, 'Store Owner change-password functionality works', async () => {
    const newPassword = 'NewOwnerPass456!';
    const res = await request('/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${owner1Token}` },
      body: JSON.stringify({
        oldPassword: password,
        newPassword,
        confirmPassword: newPassword,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // Cleanup DB test records
  await prisma.rating.deleteMany({ where: { storeId: { in: [store1Id, store2Id] } } });
  await prisma.store.deleteMany({ where: { id: { in: [store1Id, store2Id] } } });
  await prisma.user.deleteMany({ where: { email: { contains: timestamp.toString() } } });

  console.log('\n--- TASK 5 TEST DATA CLEANED UP FROM DATABASE ---');

  console.log('\n====================================================');
  console.log(`  STORE OWNER VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED  `);
  console.log('====================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runOwnerTests().catch(async (err) => {
  console.error('Fatal Owner Test Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
