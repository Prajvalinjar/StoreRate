const prisma = require('../utils/prisma');
const { hashPassword } = require('../utils/hashUtils');

const DEMO_USER_NAMES = [
  'Aarav Patil', 'Aditya Jadhav', 'Rohan Shinde', 'Siddhant Kulkarni',
  'Akshay Deshmukh', 'Omkar Pawar', 'Prathamesh Kadam', 'Soham Chavan',
  'Atharva Patil', 'Yash More', 'Saurabh Joshi', 'Rahul Bhosale',
  'Tejas Mane', 'Kunal Salunkhe', 'Abhishek Sawant', 'Nikhil Patil',
  'Sneha Deshmukh', 'Priya Jadhav', 'Ananya Kulkarni', 'Sayali Patil',
  'Pooja Shinde', 'Rutuja Pawar', 'Neha Kadam', 'Aditi Chavan',
  'Shruti More', 'Vaishnavi Bhosale', 'Sakshi Mane', 'Mrunal Salunkhe',
  'Isha Sawant', 'Tanvi Patil'
];

const DEMO_LOCATIONS = [
  'Kothrud, Pune, Maharashtra', 'Tarabai Park, Kolhapur, Maharashtra',
  'Bandra West, Mumbai, Maharashtra', 'Rajarampuri, Kolhapur, Maharashtra',
  'Deccan Gymkhana, Pune, Maharashtra', 'Powai Naka, Satara, Maharashtra',
  'Gaon Bhag, Sangli, Maharashtra', 'College Road, Nashik, Maharashtra',
  'Khamla Road, Nagpur, Maharashtra', 'Jalna Road, Sambhajinagar, Maharashtra'
];

const DEMO_STORES = [
  // General (3)
  {
    name: 'Demo StoreRate Market',
    email: 'store@storerate.local',
    address: 'Kolhapur, Maharashtra',
    category: 'General',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Panchganga Trade Center',
    email: 'panchganga.trade@storerate-demo.in',
    address: 'Shahupuri Commercial Hub, Kolhapur, Maharashtra',
    category: 'General',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Central Business Hub',
    email: 'central.hub@storerate-demo.in',
    address: 'Shivajinagar Square, Pune, Maharashtra',
    category: 'General',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Restaurant (5)
  {
    name: 'Rankala Family Restaurant',
    email: 'rankala.restaurant@storerate-demo.in',
    address: 'Rankala Lake Front, Kolhapur, Maharashtra',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Kolhapur Spice Kitchen',
    email: 'spice.kitchen@storerate-demo.in',
    address: 'Tarabai Park, Kolhapur, Maharashtra',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Deccan Food Plaza',
    email: 'deccan.food@storerate-demo.in',
    address: 'FC Road, Deccan Gymkhana, Pune, Maharashtra',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Sahyadri Thali House',
    email: 'sahyadri.thali@storerate-demo.in',
    address: 'Powai Naka, Satara, Maharashtra',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Konkan Kinara Seafood',
    email: 'konkan.kinara@storerate-demo.in',
    address: 'Bandra West, Mumbai, Maharashtra',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Grocery (3)
  {
    name: 'FreshMart Grocery Store',
    email: 'freshmart@storerate.local',
    address: 'Main Street Market, Kolhapur, Maharashtra',
    category: 'Grocery',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Panchganga Grocery Hub',
    email: 'panchganga.grocery@storerate-demo.in',
    address: 'Rajarampuri Main Road, Kolhapur, Maharashtra',
    category: 'Grocery',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Mahalaxmi Supermarket',
    email: 'mahalaxmi.super@storerate-demo.in',
    address: 'Station Road, Sangli, Maharashtra',
    category: 'Grocery',
    imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Electronics (3)
  {
    name: 'City Electronics Superstore',
    email: 'cityelectronics@storerate.local',
    address: 'Commercial Hub, Pune, Maharashtra',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Mahalaxmi Electronics',
    email: 'mahalaxmi.elec@storerate-demo.in',
    address: 'Laxmi Road, Kolhapur, Maharashtra',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Maharashtra Mobile World',
    email: 'mobile.world@storerate-demo.in',
    address: 'JM Road, Shivajinagar, Pune, Maharashtra',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Fashion (3)
  {
    name: 'Sahyadri Fashion House',
    email: 'sahyadri.fashion@storerate-demo.in',
    address: 'Mahadwar Road, Kolhapur, Maharashtra',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Chhatrapati Silks & Ethnic',
    email: 'chhatrapati.silks@storerate-demo.in',
    address: 'Laxmi Road, Pune, Maharashtra',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Pearl Couture Boutique',
    email: 'pearl.couture@storerate-demo.in',
    address: 'Bandra West, Mumbai, Maharashtra',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Beauty (3)
  {
    name: 'Shivaji Nagar Beauty Studio',
    email: 'shivaji.beauty@storerate-demo.in',
    address: 'FC Road, Pune, Maharashtra',
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Glow Salon & Spa',
    email: 'glow.salon@storerate-demo.in',
    address: 'Assembly Road, Kolhapur, Maharashtra',
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Mahalaxmi Women Care & Salon',
    email: 'mahalaxmi.women@storerate-demo.in',
    address: 'Gaon Bhag, Sangli, Maharashtra',
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Healthcare (3)
  {
    name: 'Western Maharashtra Medical Store',
    email: 'wm.medical@storerate-demo.in',
    address: 'CPR Hospital Chowk, Kolhapur, Maharashtra',
    category: 'Healthcare',
    imageUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Apex Healthcare Pharmacy',
    email: 'apex.pharma@storerate-demo.in',
    address: 'Aundh Commercial Complex, Pune, Maharashtra',
    category: 'Healthcare',
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Sahyadri Medical & Wellness',
    email: 'sahyadri.medical@storerate-demo.in',
    address: 'Powai Naka, Satara, Maharashtra',
    category: 'Healthcare',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Education (3)
  {
    name: 'Pune Career Academy',
    email: 'pune.career@storerate-demo.in',
    address: 'Sadashiv Peth, Pune, Maharashtra',
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Sahyadri Coaching Institute',
    email: 'sahyadri.coach@storerate-demo.in',
    address: 'Bindu Chowk, Kolhapur, Maharashtra',
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Nashik Science Classes',
    email: 'nashik.science@storerate-demo.in',
    address: 'College Road, Nashik, Maharashtra',
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Services (2)
  {
    name: 'Mahalaxmi Services Center',
    email: 'mahalaxmi.services@storerate-demo.in',
    address: 'Shahupuri, Kolhapur, Maharashtra',
    category: 'Services',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Deccan Utility Hub',
    email: 'deccan.utility@storerate-demo.in',
    address: 'Swargate, Pune, Maharashtra',
    category: 'Services',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Automotive (3)
  {
    name: 'Kolhapur Auto Care',
    email: 'kolhapur.auto@storerate-demo.in',
    address: 'Shiroli MIDC, Kolhapur, Maharashtra',
    category: 'Automotive',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Sahyadri Motors & Service',
    email: 'sahyadri.motors@storerate-demo.in',
    address: 'Wakad, Pune, Maharashtra',
    category: 'Automotive',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Nagpur Wheel Care',
    email: 'nagpur.wheel@storerate-demo.in',
    address: 'Khamla Road, Nagpur, Maharashtra',
    category: 'Automotive',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Home & Furniture (3)
  {
    name: 'Sahyadri Home Furnishings',
    email: 'sahyadri.home@storerate-demo.in',
    address: 'Hadapsar Industrial Zone, Pune, Maharashtra',
    category: 'Home & Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Mahalaxmi Furniture Studio',
    email: 'mahalaxmi.furniture@storerate-demo.in',
    address: 'Rajarampuri 5th Lane, Kolhapur, Maharashtra',
    category: 'Home & Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Deccan Decor & Interior',
    email: 'deccan.decor@storerate-demo.in',
    address: 'Jalna Road, Chhatrapati Sambhajinagar, Maharashtra',
    category: 'Home & Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Other (2)
  {
    name: 'Western Maharashtra Art & Craft',
    email: 'wm.crafts@storerate-demo.in',
    address: 'Bhavani Mandap, Kolhapur, Maharashtra',
    category: 'Other',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Pune Book & Stationery World',
    email: 'pune.books@storerate-demo.in',
    address: 'Appa Balwant Chowk, Pune, Maharashtra',
    category: 'Other',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
];

// Deterministic hash helper for reproducible sample ratings
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function seed() {
  console.log('================================================================');
  console.log('       SAFE IDEMPOTENT SEEDING OF STORERATE DATASET             ');
  console.log('================================================================\n');

  try {
    // 1. ENSURE DEMO ADMIN ACCOUNT
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

    // 2. ENSURE DEMO STORE OWNER ACCOUNT
    const ownerPw = await hashPassword('Owner@123');
    const owner = await prisma.user.upsert({
      where: { email: 'owner@storerate.local' },
      update: {
        name: 'StoreRate Primary Store Owner',
        passwordHash: ownerPw,
        role: 'STORE_OWNER',
        address: '200 Commercial Plaza, Kolhapur, Maharashtra',
      },
      create: {
        name: 'StoreRate Primary Store Owner',
        email: 'owner@storerate.local',
        passwordHash: ownerPw,
        role: 'STORE_OWNER',
        address: '200 Commercial Plaza, Kolhapur, Maharashtra',
      },
    });
    console.log(`[SEED] Store Owner Account: ${owner.email}`);

    // 3. ENSURE IDEMPOTENT DEMO USERS POOL (30 Maharashtrian Names)
    const userPw = await hashPassword('User@123');
    const seededDemoUsers = [];

    for (let i = 0; i < DEMO_USER_NAMES.length; i++) {
      const name = DEMO_USER_NAMES[i];
      const emailSlug = name.toLowerCase().replace(/\s+/g, '.');
      const email = `${emailSlug}.demo@storerate.local`;
      const location = DEMO_LOCATIONS[i % DEMO_LOCATIONS.length];

      const u = await prisma.user.upsert({
        where: { email },
        update: {
          name,
          role: 'USER',
          address: location,
        },
        create: {
          name,
          email,
          passwordHash: userPw,
          role: 'USER',
          address: location,
        },
      });
      seededDemoUsers.push(u);
    }
    console.log(`[SEED] Idempotent Demo Users Pool: ${seededDemoUsers.length} accounts verified.`);

    // 4. IDEMPOTENTLY UPSERT DEMO DISCOVERY STORES
    let addedStoreCount = 0;
    let updatedStoreCount = 0;

    for (const storeData of DEMO_STORES) {
      const existing = await prisma.store.findFirst({
        where: { email: storeData.email.toLowerCase() },
      });

      if (!existing) {
        await prisma.store.create({
          data: {
            name: storeData.name,
            email: storeData.email.toLowerCase(),
            address: storeData.address,
            category: storeData.category,
            imageUrl: storeData.imageUrl,
            status: storeData.status,
            ownerId: owner.id,
          },
        });
        addedStoreCount++;
      } else {
        await prisma.store.update({
          where: { id: existing.id },
          data: {
            name: storeData.name,
            address: storeData.address,
            category: storeData.category,
            imageUrl: storeData.imageUrl,
            status: storeData.status,
          },
        });
        updatedStoreCount++;
      }
    }
    console.log(`[SEED] Stores processing complete: ${addedStoreCount} newly created, ${updatedStoreCount} existing updated.`);

    // 5. DETERMINISTIC SAMPLE RATINGS SEEDING
    const allApprovedStores = await prisma.store.findMany({
      where: { status: 'APPROVED' },
    });

    let newRatingsAdded = 0;
    let existingRatingsPreserved = 0;

    // Rating distribution percentages: 5★ (~35%), 4★ (~35%), 3★ (~18%), 2★ (~8%), 1★ (~4%)
    const RATING_SCORES = [5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 1];

    for (let sIdx = 0; sIdx < allApprovedStores.length; sIdx++) {
      const store = allApprovedStores[sIdx];
      const hash = simpleHash(store.id);

      // Determine target number of ratings based on category/popularity
      let targetCount = 0;
      if (['Restaurant', 'General'].includes(store.category)) {
        targetCount = 8 + (hash % 8); // 8–15 ratings
      } else if (['Grocery', 'Electronics', 'Fashion'].includes(store.category)) {
        targetCount = 4 + (hash % 7); // 4–10 ratings
      } else if (['Beauty', 'Healthcare', 'Education'].includes(store.category)) {
        targetCount = 2 + (hash % 5); // 2–6 ratings
      } else {
        targetCount = hash % 4; // 0–3 ratings
      }

      // Pick deterministic subset of demo users for this store
      for (let uIdx = 0; uIdx < targetCount && uIdx < seededDemoUsers.length; uIdx++) {
        const userOffset = (hash + uIdx * 7) % seededDemoUsers.length;
        const demoUser = seededDemoUsers[userOffset];

        // Check if rating already exists (preserves user-created production ratings)
        const existingRating = await prisma.rating.findUnique({
          where: {
            userId_storeId: {
              userId: demoUser.id,
              storeId: store.id,
            },
          },
        });

        if (existingRating) {
          existingRatingsPreserved++;
          continue;
        }

        // Deterministic score and timestamp offset (between 7 and 180 days ago)
        const scoreIndex = (hash + uIdx * 3) % RATING_SCORES.length;
        const score = RATING_SCORES[scoreIndex];
        const daysAgo = 7 + ((hash + uIdx * 13) % 173);
        const createdAtDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await prisma.rating.create({
          data: {
            userId: demoUser.id,
            storeId: store.id,
            rating: score,
            createdAt: createdAtDate,
            updatedAt: createdAtDate,
          },
        });
        newRatingsAdded++;
      }
    }

    console.log(`[SEED] Sample Ratings Seeding: ${newRatingsAdded} newly created, ${existingRatingsPreserved} existing preserved.`);

    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const approvedStores = await prisma.store.count({ where: { status: 'APPROVED' } });
    const pendingStores = await prisma.store.count({ where: { status: 'PENDING' } });
    const rejectedStores = await prisma.store.count({ where: { status: 'REJECTED' } });
    const totalRatings = await prisma.rating.count();

    console.log(`[SEED] Dataset Summary: ${totalUsers} Users, ${totalStores} Stores (${approvedStores} Approved, ${pendingStores} Pending, ${rejectedStores} Rejected), ${totalRatings} Total Ratings.`);

    return {
      success: true,
      addedStoreCount,
      updatedStoreCount,
      newRatingsAdded,
      existingRatingsPreserved,
      totalUsers,
      totalStores,
      approvedStores,
      pendingStores,
      rejectedStores,
      totalRatings,
    };
  } catch (error) {
    console.error('Seed script error:', error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = { seed, DEMO_STORES, DEMO_USER_NAMES };
