const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SAMPLE_STORES = [
  // Restaurant
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

  // Grocery
  {
    name: 'Panchganga Grocery Hub',
    email: 'panchganga.grocery@storerate-demo.in',
    address: 'Rajarampuri Main Road, Kolhapur, Maharashtra',
    category: 'Grocery',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
  {
    name: 'Deccan Fresh Grocery',
    email: 'deccan.fresh@storerate-demo.in',
    address: 'Kothrud Market, Pune, Maharashtra',
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

  // Electronics
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
  {
    name: 'City Tech World',
    email: 'city.tech@storerate-demo.in',
    address: 'Lamington Road, Mumbai, Maharashtra',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },

  // Fashion
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

  // Beauty
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

  // Healthcare
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

  // Education
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

  // Services
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

  // Automotive
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

  // Home & Furniture
  {
    name: 'Sahyadri Home Furnishings',
    email: 'sahyadri.home@storerate-demo.in',
    address: 'Hadapsar Industrial Zone, Pune, Maharashtra',
    category: 'Home & Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    status: 'APPROVED',
  },
];

async function main() {
  console.log('Seeding sample discovery stores into PostgreSQL...');

  // Ensure a demo store owner account exists
  let demoOwner = await prisma.user.findFirst({
    where: { role: 'STORE_OWNER' },
  });

  if (!demoOwner) {
    const passwordHash = await bcrypt.hash('Owner@123', 10);
    demoOwner = await prisma.user.create({
      data: {
        name: 'Demo Business Owner',
        email: 'demo.owner@storerate-demo.in',
        address: 'Commercial Hub, Kolhapur, Maharashtra',
        passwordHash,
        role: 'STORE_OWNER',
      },
    });
    console.log('Created demo STORE_OWNER user:', demoOwner.email);
  }

  let createdCount = 0;
  for (const store of SAMPLE_STORES) {
    const existing = await prisma.store.findFirst({
      where: { email: store.email.toLowerCase() },
    });

    if (!existing) {
      await prisma.store.create({
        data: {
          ...store,
          ownerId: demoOwner.id,
        },
      });
      createdCount++;
    } else {
      // Update image and category if missing
      await prisma.store.update({
        where: { id: existing.id },
        data: {
          category: store.category,
          imageUrl: store.imageUrl,
        },
      });
    }
  }

  console.log(`Seeding complete! Added ${createdCount} new stores into PostgreSQL database.`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
