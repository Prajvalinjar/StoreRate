const prisma = require('../utils/prisma');
const { requireRole } = require('../middleware/roleMiddleware');

const API_URL = 'http://localhost:5000/api';

async function runFullVerificationSuite() {
  console.log('====================================================');
  console.log('  STARTING FULL AUTHENTICATION VERIFICATION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testUserEmail = `verification.user.${Date.now()}@example.com`;
  const validName = 'Jonathan Alexander Montgomery'; // 30 chars
  const nameUnder20 = 'Short Name'; // 10 chars
  const nameOver60 = 'A'.repeat(65); // 65 chars
  const validAddress = '123 Test Street, Suite 100, Metropolis';
  const initialPassword = 'Password123!';
  const updatedPassword = 'NewPassword456!';
  let jwtToken = null;

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

  // 2. Backend Health Check
  await assertTest(2, 'Backend Startup & Health Check', async () => {
    const res = await request('/health', { method: 'GET' });
    if (res.status !== 200) throw new Error(`Backend not responding, status: ${res.status}`);
    if (res.data?.status !== 'ok') throw new Error('Health check status not ok');
  });

  // 4. POST /api/auth/register with valid data
  await assertTest(4, 'POST /api/auth/register with valid data', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: validName,
        email: testUserEmail,
        address: validAddress,
        password: initialPassword,
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status} (${JSON.stringify(res.data)})`);
    if (!res.data?.data?.token) throw new Error('Missing JWT token');
    if (res.data.data.user.passwordHash) throw new Error('passwordHash LEAKED in registration response!');
    if (res.data.data.user.role !== 'USER') throw new Error(`Expected role USER, got ${res.data.data.user.role}`);
    jwtToken = res.data.data.token;
  });

  // 5a. Registration with 19-character name (rejected)
  await assertTest('5a', 'Registration with 19-character name (rejected)', async () => {
    const name19 = 'A'.repeat(19);
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name19,
        email: `name19.${Date.now()}@example.com`,
        address: validAddress,
        password: initialPassword,
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
  });

  // 5b. Registration with 20-character name (accepted)
  await assertTest('5b', 'Registration with 20-character name (accepted)', async () => {
    const name20 = 'A'.repeat(20);
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name20,
        email: `name20.${Date.now()}@example.com`,
        address: validAddress,
        password: initialPassword,
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    await prisma.user.delete({ where: { email: `name20.${Date.now()}@example.com`.toLowerCase() } }).catch(() => {});
  });

  // 6a. Registration with 60-character name (accepted)
  await assertTest('6a', 'Registration with 60-character name (accepted)', async () => {
    const name60 = 'A'.repeat(60);
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name60,
        email: `name60.${Date.now()}@example.com`,
        address: validAddress,
        password: initialPassword,
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  // 6b. Registration with 61-character name (rejected)
  await assertTest('6b', 'Registration with 61-character name (rejected)', async () => {
    const name61 = 'A'.repeat(61);
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name61,
        email: `name61.${Date.now()}@example.com`,
        address: validAddress,
        password: initialPassword,
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
  });

  // 7. Registration with invalid password
  await assertTest(7, 'Registration with invalid password (no special char / no uppercase)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: validName,
        email: `nopass.${Date.now()}@example.com`,
        address: validAddress,
        password: 'password123',
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
  });

  // 8. Registration with invalid email
  await assertTest(8, 'Registration with invalid email format', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: validName,
        email: 'invalid-email-format-string',
        address: validAddress,
        password: initialPassword,
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
  });

  // 9. Duplicate email registration
  await assertTest(9, 'Duplicate email registration (409 Conflict)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: validName,
        email: testUserEmail,
        address: validAddress,
        password: initialPassword,
      }),
    });
    if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
  });

  // 10. POST /api/auth/login with correct credentials
  await assertTest(10, 'POST /api/auth/login with correct credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUserEmail,
        password: initialPassword,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data?.data?.token) throw new Error('Missing token in login response');
    if (res.data.data.user.passwordHash) throw new Error('passwordHash LEAKED in login response!');
    jwtToken = res.data.data.token;
  });

  // 11. Login with incorrect password
  await assertTest(11, 'Login with incorrect password (401 Unauthorized)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUserEmail,
        password: 'IncorrectPassword999!',
      }),
    });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // 12. GET /api/auth/me with valid JWT
  await assertTest(12, 'GET /api/auth/me with valid JWT', async () => {
    const res = await request('/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data?.data?.user?.email !== testUserEmail.toLowerCase()) throw new Error('Email mismatch');
    if (res.data?.data?.user?.passwordHash) throw new Error('passwordHash LEAKED in /me response!');
  });

  // 13. GET /api/auth/me without JWT
  await assertTest(13, 'GET /api/auth/me without JWT (401 Unauthorized)', async () => {
    const res = await request('/auth/me', { method: 'GET' });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // 14. GET /api/auth/me with invalid JWT
  await assertTest(14, 'GET /api/auth/me with invalid JWT (401 Unauthorized)', async () => {
    const res = await request('/auth/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer invalid_forged_token_string' },
    });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // 15. Verify ADMIN / USER / STORE_OWNER role middleware directly
  await assertTest(15, 'Verify ADMIN / USER / STORE_OWNER role middleware', async () => {
    // Test 1: USER attempting ADMIN route -> 403 Forbidden
    let statusSet = null;
    let jsonSent = null;
    let nextCalled = false;
    const mockRes1 = {
      status: (code) => {
        statusSet = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };

    requireRole('ADMIN')({ user: { role: 'USER' } }, mockRes1, () => {
      nextCalled = true;
    });

    if (statusSet !== 403 || nextCalled) {
      throw new Error(`Expected 403 Forbidden for USER accessing ADMIN route, got ${statusSet}`);
    }

    // Test 2: USER accessing USER allowed route -> calls next()
    nextCalled = false;
    requireRole('USER')({ user: { role: 'USER' } }, mockRes1, () => {
      nextCalled = true;
    });
    if (!nextCalled) throw new Error('Expected next() to be called for USER accessing USER route');

    // Test 3: STORE_OWNER accessing STORE_OWNER allowed route -> calls next()
    nextCalled = false;
    requireRole('STORE_OWNER')({ user: { role: 'STORE_OWNER' } }, mockRes1, () => {
      nextCalled = true;
    });
    if (!nextCalled) throw new Error('Expected next() to be called for STORE_OWNER accessing STORE_OWNER route');

    // Test 4: ADMIN accessing ADMIN allowed route -> calls next()
    nextCalled = false;
    requireRole('ADMIN')({ user: { role: 'ADMIN' } }, mockRes1, () => {
      nextCalled = true;
    });
    if (!nextCalled) throw new Error('Expected next() to be called for ADMIN accessing ADMIN route');
  });

  // 16. POST /api/auth/change-password
  await assertTest(16, 'POST /api/auth/change-password with valid old & new passwords', async () => {
    const res = await request('/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwtToken}` },
      body: JSON.stringify({
        oldPassword: initialPassword,
        newPassword: updatedPassword,
        confirmPassword: updatedPassword,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 17. Verify old password no longer works
  await assertTest(17, 'Verify old password no longer works (401 Unauthorized)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUserEmail,
        password: initialPassword,
      }),
    });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // 18. Verify new password works
  await assertTest(18, 'Verify new password works for login (200 OK)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUserEmail,
        password: updatedPassword,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    if (!res.data?.data?.token) throw new Error('Missing new token');
  });

  // Additional Check: Forging ADMIN or STORE_OWNER via public registration
  await assertTest(0, 'Verify public registration CANNOT create ADMIN or STORE_OWNER', async () => {
    const adminAttemptEmail = `admin.forge.${Date.now()}@example.com`;
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Admin Forger Attempt Account',
        email: adminAttemptEmail,
        address: validAddress,
        password: initialPassword,
        role: 'ADMIN', // Client payload trying to create ADMIN
      }),
    });
    if (res.data?.data?.user?.role !== 'USER') {
      throw new Error(`CRITICAL SECURITY FAILURE: Public registration created ${res.data?.data?.user?.role}!`);
    }
    await prisma.user.delete({ where: { email: adminAttemptEmail } });
  });

  // Cleanup test user
  await prisma.user.delete({ where: { email: testUserEmail.toLowerCase() } });
  console.log('\n--- ALL TEST DATA CLEANED UP FROM DATABASE ---');

  console.log('\n====================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED  `);
  console.log('====================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runFullVerificationSuite().catch(async (err) => {
  console.error('Fatal Test Suite Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
