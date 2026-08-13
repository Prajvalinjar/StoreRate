const prisma = require('../utils/prisma');
const { hashPassword } = require('../utils/hashUtils');

const API_URL = 'http://localhost:5000/api';

async function runMasterQA() {
  console.log('================================================================');
  console.log('  STARTING MASTER SYSTEM QUALITY ASSURANCE & SECURITY AUDIT     ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const timestamp = Date.now();
  const adminEmail = `master.admin.${timestamp}@example.com`;
  const user1Email = `master.user1.${timestamp}@example.com`;
  const user2Email = `master.user2.${timestamp}@example.com`;
  const owner1Email = `master.owner1.${timestamp}@example.com`;
  const owner2Email = `master.owner2.${timestamp}@example.com`;
  const storeEmail = `master.store1.${timestamp}@example.com`;
  const password = 'MasterPass123!';
  const address = '123 Master QA Boulevard, Capital City';

  let adminToken, user1Token, user2Token, owner1Token, owner2Token;
  let dbAdmin, dbUser1, dbUser2, dbOwner1, dbOwner2, dbStore1;

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

  async function assertAudit(category, num, name, testFn) {
    try {
      await testFn();
      console.log(`[PASS] [${category}] #${num}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] [${category}] #${num}: ${name} ->`, err.message);
      failed++;
    }
  }

  // --- SECTION 1: AUTHENTICATION & REGISTRATION VALIDATION AUDIT ---
  await assertAudit('AUTH', 1, 'Public registration creates USER account (min 20 char name)', async () => {
    const name20 = 'A'.repeat(20);
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name20,
        email: `reg.test.${timestamp}@example.com`,
        address,
        password,
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (res.data.data.user.role !== 'USER') throw new Error('Role was not USER');
    if (res.data.data.user.passwordHash) throw new Error('passwordHash leaked in register payload!');
    await prisma.user.delete({ where: { email: `reg.test.${timestamp}@example.com`.toLowerCase() } });
  });

  await assertAudit('AUTH', 2, 'User Name validation boundaries (19 chars rejected, 61 chars rejected)', async () => {
    const res19 = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'A'.repeat(19), email: `name19.${timestamp}@example.com`, address, password }),
    });
    if (res19.status !== 400) throw new Error(`19 chars expected 400, got ${res19.status}`);

    const res61 = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'A'.repeat(61), email: `name61.${timestamp}@example.com`, address, password }),
    });
    if (res61.status !== 400) throw new Error(`61 chars expected 400, got ${res61.status}`);
  });

  await assertAudit('AUTH', 3, 'Public registration CANNOT forge ADMIN or STORE_OWNER role', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Admin Forger Attempt Account',
        email: `forger.${timestamp}@example.com`,
        address,
        password,
        role: 'ADMIN',
      }),
    });
    if (res.data.data.user.role !== 'USER') throw new Error('Security Breach: Public created ADMIN!');
    await prisma.user.delete({ where: { email: `forger.${timestamp}@example.com`.toLowerCase() } });
  });

  // Setup Accounts for Master Audit
  const hashedPw = await hashPassword(password);
  dbAdmin = await prisma.user.create({ data: { name: 'Master System Administrator Account', email: adminEmail, address, passwordHash: hashedPw, role: 'ADMIN' } });
  dbUser1 = await prisma.user.create({ data: { name: 'Master Normal User Account One', email: user1Email, address, passwordHash: hashedPw, role: 'USER' } });
  dbUser2 = await prisma.user.create({ data: { name: 'Master Normal User Account Two', email: user2Email, address, passwordHash: hashedPw, role: 'USER' } });
  dbOwner1 = await prisma.user.create({ data: { name: 'Master Licensed Store Owner One', email: owner1Email, address, passwordHash: hashedPw, role: 'STORE_OWNER' } });
  dbOwner2 = await prisma.user.create({ data: { name: 'Master Licensed Store Owner Two', email: owner2Email, address, passwordHash: hashedPw, role: 'STORE_OWNER' } });

  dbStore1 = await prisma.store.create({ data: { name: `Master Quality Supermarket ${timestamp}`, email: storeEmail, address: '456 QA Boulevard', ownerId: dbOwner1.id } });
  dbStore2 = await prisma.store.create({ data: { name: `Master Unrated Store ${timestamp}`, email: `unrated.${timestamp}@example.com`, address: '789 Unrated Lane', ownerId: dbOwner2.id } });

  // Login tokens
  adminToken = (await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: adminEmail, password }) })).data.data.token;
  user1Token = (await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: user1Email, password }) })).data.data.token;
  user2Token = (await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: user2Email, password }) })).data.data.token;
  owner1Token = (await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: owner1Email, password }) })).data.data.token;
  owner2Token = (await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: owner2Email, password }) })).data.data.token;

  // --- SECTION 2: SECURITY & RBAC AUDIT ---
  await assertAudit('SECURITY', 4, 'Unauthenticated access to protected APIs rejected (401)', async () => {
    const r1 = await request('/auth/me');
    const r2 = await request('/admin/dashboard');
    const r3 = await request('/stores');
    const r4 = await request('/owner/dashboard');
    if (r1.status !== 401 || r2.status !== 401 || r3.status !== 401 || r4.status !== 401) {
      throw new Error('Unauthenticated access was allowed!');
    }
  });

  await assertAudit('SECURITY', 5, 'USER role RBAC isolation (403 on ADMIN & OWNER routes)', async () => {
    const rAdmin = await request('/admin/dashboard', { headers: { Authorization: `Bearer ${user1Token}` } });
    const rOwner = await request('/owner/dashboard', { headers: { Authorization: `Bearer ${user1Token}` } });
    if (rAdmin.status !== 403 || rOwner.status !== 403) throw new Error('USER accessed admin/owner endpoint');
  });

  await assertAudit('SECURITY', 6, 'STORE_OWNER role RBAC isolation (403 on ADMIN & USER rating routes)', async () => {
    const rAdmin = await request('/admin/dashboard', { headers: { Authorization: `Bearer ${owner1Token}` } });
    const rUser = await request('/stores', { headers: { Authorization: `Bearer ${owner1Token}` } });
    if (rAdmin.status !== 403 || rUser.status !== 403) throw new Error('STORE_OWNER accessed admin/user endpoint');
  });

  await assertAudit('SECURITY', 7, 'ADMIN role RBAC isolation (403 on USER rating routes)', async () => {
    const rUser = await request('/stores', { headers: { Authorization: `Bearer ${adminToken}` } });
    if (rUser.status !== 403) throw new Error('ADMIN accessed user-only rating endpoint');
  });

  // --- SECTION 3: ADMIN & STORE MANAGEMENT AUDIT ---
  await assertAudit('ADMIN', 8, 'Admin dashboard metrics', async () => {
    const res = await request('/admin/dashboard', { headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await assertAudit('ADMIN', 9, 'Admin user filtering, sorting, & pagination', async () => {
    const res = await request(`/admin/users?role=STORE_OWNER&sortBy=name&sortOrder=asc`, { headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await assertAudit('ADMIN', 10, 'Admin creates Store requiring valid STORE_OWNER ownerId', async () => {
    const invalidRes = await request('/admin/stores', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Invalid Owner Store Name', email: `invalid.${timestamp}@example.com`, address, ownerId: dbUser1.id }),
    });
    if (invalidRes.status !== 400) throw new Error('Allowed normal USER as store owner!');
  });

  // --- SECTION 4: NORMAL USER & RATING SYSTEM AUDIT ---
  await assertAudit('USER', 11, 'Rating submission validation (decimals, 0, 6 rejected)', async () => {
    const r0 = await request(`/stores/${dbStore1.id}/rating`, { method: 'POST', headers: { Authorization: `Bearer ${user1Token}` }, body: JSON.stringify({ rating: 0 }) });
    const r6 = await request(`/stores/${dbStore1.id}/rating`, { method: 'POST', headers: { Authorization: `Bearer ${user1Token}` }, body: JSON.stringify({ rating: 6 }) });
    const rDec = await request(`/stores/${dbStore1.id}/rating`, { method: 'POST', headers: { Authorization: `Bearer ${user1Token}` }, body: JSON.stringify({ rating: 3.5 }) });
    if (r0.status !== 400 || r6.status !== 400 || rDec.status !== 400) throw new Error('Rating validation failed');
  });

  await assertAudit('USER', 12, 'Rating submission & update recalculates store average without duplicate rows', async () => {
    // User 1 submits 4
    await request(`/stores/${dbStore1.id}/rating`, { method: 'POST', headers: { Authorization: `Bearer ${user1Token}` }, body: JSON.stringify({ rating: 4 }) });
    // User 2 submits 5
    await request(`/stores/${dbStore1.id}/rating`, { method: 'POST', headers: { Authorization: `Bearer ${user2Token}` }, body: JSON.stringify({ rating: 5 }) });

    // User 1 updates 4 -> 5
    await request(`/stores/${dbStore1.id}/rating`, { method: 'PUT', headers: { Authorization: `Bearer ${user1Token}` }, body: JSON.stringify({ rating: 5 }) });

    const ratingCount = await prisma.rating.count({ where: { storeId: dbStore1.id } });
    if (ratingCount !== 2) throw new Error(`Expected 2 rating rows, got ${ratingCount} (duplicate created!)`);

    const storesRes = await request('/stores', { headers: { Authorization: `Bearer ${user1Token}` } });
    const store = storesRes.data.data.stores.find((s) => s.id === dbStore1.id);
    if (store.averageRating !== 5) throw new Error(`Expected average rating 5.0, got ${store.averageRating}`);
  });

  // --- SECTION 5: STORE OWNER AUDIT ---
  await assertAudit('OWNER', 13, 'Store Owner sees exact assigned store, average rating, and rater list', async () => {
    const res = await request('/owner/dashboard', { headers: { Authorization: `Bearer ${owner1Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const store = res.data.data.store;
    if (store.id !== dbStore1.id) throw new Error('Wrong store returned for owner!');
    if (store.averageRating !== 5) throw new Error(`Expected average 5.0, got ${store.averageRating}`);
    if (store.ratings.length !== 2) throw new Error('Expected 2 rater entries');
  });

  await assertAudit('OWNER', 14, 'Owner 2 sees empty ratings state (totalRatings: 0, averageRating: null)', async () => {
    const res = await request('/owner/dashboard', { headers: { Authorization: `Bearer ${owner2Token}` } });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const store = res.data.data.store;
    if (store.averageRating !== null) throw new Error('Expected averageRating null for unrated store');
    if (store.totalRatings !== 0) throw new Error('Expected totalRatings 0');
  });

  // Clean up Master Test DB records
  await prisma.rating.deleteMany({ where: { storeId: { in: [dbStore1.id, dbStore2.id] } } });
  await prisma.store.deleteMany({ where: { id: { in: [dbStore1.id, dbStore2.id] } } });
  await prisma.user.deleteMany({ where: { email: { contains: timestamp.toString() } } });

  console.log('\n--- MASTER AUDIT DB CLEANUP COMPLETE ---');
  console.log('================================================================');
  console.log(`  MASTER QA AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED  `);
  console.log('================================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterQA().catch(async (err) => {
  console.error('Fatal Master QA Audit Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
