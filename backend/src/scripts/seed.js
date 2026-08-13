const prisma = require('../utils/prisma');
const { hashPassword } = require('../utils/hashUtils');

async function seed() {
  console.log('================================================================');
  console.log('       SEEDING STORE RATE PRODUCTION DEMO DATASET               ');
  console.log('================================================================\n');

  try {
    // 1. CLEANUP AUTOMATED TEST / EXTRA NON-DEMO ENTRIES
    const demoUserEmails = [
      'admin@storerate.local',
      'owner@storerate.local',
      'owner2@storerate.local',
      'owner3@storerate.local',
      'user@storerate.local',
      'user2@storerate.local',
      'user3@storerate.local',
      'user4@storerate.local',
      'user5@storerate.local',
    ];

    const extraUsers = await prisma.user.findMany({
      where: {
        email: { notIn: demoUserEmails },
      },
    });

    if (extraUsers.length > 0) {
      const extraUserIds = extraUsers.map((u) => u.id);
      await prisma.rating.deleteMany({ where: { userId: { in: extraUserIds } } });
      const deletedUsers = await prisma.user.deleteMany({ where: { id: { in: extraUserIds } } });
      console.log(`[CLEANUP] Removed ${deletedUsers.count} non-demo user records.`);
    }

    // Clean up extra stores not in the intended demo set
    const demoStoreEmails = ['store@storerate.local', 'freshmart@storerate.local', 'cityelectronics@storerate.local'];
    const extraStores = await prisma.store.findMany({
      where: {
        email: { notIn: demoStoreEmails },
      },
    });

    if (extraStores.length > 0) {
      const extraStoreIds = extraStores.map((s) => s.id);
      await prisma.rating.deleteMany({ where: { storeId: { in: extraStoreIds } } });
      const deletedStores = await prisma.store.deleteMany({ where: { id: { in: extraStoreIds } } });
      console.log(`[CLEANUP] Removed ${deletedStores.count} non-demo store records.`);
    }

    // 2. CREATE / UPDATE DEMO ADMIN ACCOUNT
    const adminPw = await hashPassword('Admin@123');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@storerate.local' },
      update: {
        name: 'StoreRate System Administrator',
        passwordHash: adminPw,
        role: 'ADMIN',
        address: '100 Central Admin Headquarters, City',
      },
      create: {
        name: 'StoreRate System Administrator',
        email: 'admin@storerate.local',
        passwordHash: adminPw,
        role: 'ADMIN',
        address: '100 Central Admin Headquarters, City',
      },
    });
    console.log(`[SEED] Admin Account: ${admin.email} (Role: ${admin.role})`);

    // 3. CREATE / UPDATE STORE OWNER ACCOUNTS
    const ownerPw = await hashPassword('Owner@123');

    const owner1 = await prisma.user.upsert({
      where: { email: 'owner@storerate.local' },
      update: {
        name: 'StoreRate Primary Store Owner',
        passwordHash: ownerPw,
        role: 'STORE_OWNER',
        address: '200 Commercial Plaza, Kolhapur',
      },
      create: {
        name: 'StoreRate Primary Store Owner',
        email: 'owner@storerate.local',
        passwordHash: ownerPw,
        role: 'STORE_OWNER',
        address: '200 Commercial Plaza, Kolhapur',
      },
    });

    const owner2 = await prisma.user.upsert({
      where: { email: 'owner2@storerate.local' },
      update: {
        name: 'FreshMart Store Manager Account',
        passwordHash: ownerPw,
        role: 'STORE_OWNER',
        address: '15 Market Road, Kolhapur',
      },
      create: {
        name: 'FreshMart Store Manager Account',
        email: 'owner2@storerate.local',
        passwordHash: ownerPw,
        role: 'STORE_OWNER',
        address: '15 Market Road, Kolhapur',
      },
    });

    const owner3 = await prisma.user.upsert({
      where: { email: 'owner3@storerate.local' },
      update: {
        name: 'City Electronics Store Owner',
        passwordHash: ownerPw,
        role: 'STORE_OWNER',
        address: '88 Commercial Tech Park, Pune',
      },
      create: {
        name: 'City Electronics Store Owner',
        email: 'owner3@storerate.local',
        passwordHash: ownerPw,
        role: 'STORE_OWNER',
        address: '88 Commercial Tech Park, Pune',
      },
    });
    console.log(`[SEED] Created/verified 3 Store Owner accounts (${owner1.email}, ${owner2.email}, ${owner3.email})`);

    // 4. CREATE / UPDATE NORMAL USER DEMO ACCOUNTS
    const userPw = await hashPassword('User@123');

    const user1 = await prisma.user.upsert({
      where: { email: 'user@storerate.local' },
      update: {
        name: 'StoreRate Demo Normal User',
        passwordHash: userPw,
        role: 'USER',
        address: '300 Consumer Street, Kolhapur',
      },
      create: {
        name: 'StoreRate Demo Normal User',
        email: 'user@storerate.local',
        passwordHash: userPw,
        role: 'USER',
        address: '300 Consumer Street, Kolhapur',
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'user2@storerate.local' },
      update: {
        name: 'StoreRate Second Consumer User',
        passwordHash: userPw,
        role: 'USER',
        address: '301 Consumer Avenue, Kolhapur',
      },
      create: {
        name: 'StoreRate Second Consumer User',
        email: 'user2@storerate.local',
        passwordHash: userPw,
        role: 'USER',
        address: '301 Consumer Avenue, Kolhapur',
      },
    });

    const user3 = await prisma.user.upsert({
      where: { email: 'user3@storerate.local' },
      update: {
        name: 'StoreRate Third Consumer User',
        passwordHash: userPw,
        role: 'USER',
        address: '302 Consumer Road, Kolhapur',
      },
      create: {
        name: 'StoreRate Third Consumer User',
        email: 'user3@storerate.local',
        passwordHash: userPw,
        role: 'USER',
        address: '302 Consumer Road, Kolhapur',
      },
    });

    const user4 = await prisma.user.upsert({
      where: { email: 'user4@storerate.local' },
      update: {
        name: 'StoreRate Fourth Consumer User',
        passwordHash: userPw,
        role: 'USER',
        address: '303 Consumer Boulevard, Kolhapur',
      },
      create: {
        name: 'StoreRate Fourth Consumer User',
        email: 'user4@storerate.local',
        passwordHash: userPw,
        role: 'USER',
        address: '303 Consumer Boulevard, Kolhapur',
      },
    });

    const user5 = await prisma.user.upsert({
      where: { email: 'user5@storerate.local' },
      update: {
        name: 'StoreRate Fifth Consumer User',
        passwordHash: userPw,
        role: 'USER',
        address: '304 Consumer Way, Kolhapur',
      },
      create: {
        name: 'StoreRate Fifth Consumer User',
        email: 'user5@storerate.local',
        passwordHash: userPw,
        role: 'USER',
        address: '304 Consumer Way, Kolhapur',
      },
    });
    console.log(`[SEED] Created/verified 5 Normal User accounts (${user1.email}, ${user2.email}, ${user3.email}, ${user4.email}, ${user5.email})`);

    // 5. CREATE / UPDATE DEMO STORES
    const store1Data = {
      name: 'Demo StoreRate Market',
      email: 'store@storerate.local',
      address: 'Kolhapur, Maharashtra',
      ownerId: owner1.id,
    };
    const store2Data = {
      name: 'FreshMart Grocery Store',
      email: 'freshmart@storerate.local',
      address: 'Main Street Market, Kolhapur',
      ownerId: owner2.id,
    };
    const store3Data = {
      name: 'City Electronics Superstore',
      email: 'cityelectronics@storerate.local',
      address: 'Commercial Hub, Pune',
      ownerId: owner3.id,
    };

    let store1 = await prisma.store.findFirst({ where: { ownerId: owner1.id } });
    if (!store1) store1 = await prisma.store.create({ data: store1Data });
    else store1 = await prisma.store.update({ where: { id: store1.id }, data: store1Data });

    let store2 = await prisma.store.findFirst({ where: { ownerId: owner2.id } });
    if (!store2) store2 = await prisma.store.create({ data: store2Data });
    else store2 = await prisma.store.update({ where: { id: store2.id }, data: store2Data });

    let store3 = await prisma.store.findFirst({ where: { ownerId: owner3.id } });
    if (!store3) store3 = await prisma.store.create({ data: store3Data });
    else store3 = await prisma.store.update({ where: { id: store3.id }, data: store3Data });

    console.log(`[SEED] Created/verified 3 Demo Stores ("${store1.name}", "${store2.name}", "${store3.name}")`);

    // 6. PURGE EXTRA RATINGS THAT ARE NOT IN THE DEMO SEED SET
    const validStoreIds = [store1.id, store2.id, store3.id];
    const validUserIds = [user1.id, user2.id, user3.id];

    await prisma.rating.deleteMany({
      where: {
        OR: [
          { storeId: { notIn: validStoreIds } },
          { userId: { notIn: validUserIds } },
        ],
      },
    });

    // 7. CREATE / UPDATE DEMO RATINGS (6 TOTAL)
    const ratingsToSeed = [
      // Store 1 Ratings (5, 4, 5 -> Avg 4.7)
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user3.id, storeId: store1.id, rating: 5 },

      // Store 2 Ratings (4, 4 -> Avg 4.0)
      { userId: user1.id, storeId: store2.id, rating: 4 },
      { userId: user2.id, storeId: store2.id, rating: 4 },

      // Store 3 Rating (5 -> Avg 5.0)
      { userId: user3.id, storeId: store3.id, rating: 5 },
    ];

    for (const r of ratingsToSeed) {
      await prisma.rating.upsert({
        where: {
          userId_storeId: {
            userId: r.userId,
            storeId: r.storeId,
          },
        },
        update: { rating: r.rating },
        create: {
          userId: r.userId,
          storeId: r.storeId,
          rating: r.rating,
        },
      });
    }
    console.log(`[SEED] Created/updated ${ratingsToSeed.length} customer ratings across the 3 demo stores`);

    console.log('\n================================================================');
    console.log('         DEMO DATASET SEED COMPLETED SUCCESSFULLY               ');
    console.log('================================================================\n');
  } catch (error) {
    console.error('Seed script error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

