import prisma from './client.js';

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.hikingPackage.deleteMany();
  await prisma.basecamp.deleteMany();
  await prisma.user.deleteMany();

  // Seed Hiking Packages
  const hikingPackages = await Promise.all([
    prisma.hikingPackage.create({
      data: {
        name: 'Jalur A - Rute Klasik',
        price: 120000,
        duration: '2 Hari 1 Malam',
        difficulty: 'Mudah',
        distance: '5 km',
        description: 'Rute pendakian klasik yang cocok untuk pemula dengan pemandangan yang menakjubkan',
      },
    }),
    prisma.hikingPackage.create({
      data: {
        name: 'Jalur B - Petualangan Menantang',
        price: 150000,
        duration: '3 Hari 2 Malam',
        difficulty: 'Sedang',
        distance: '8 km',
        description: 'Jalur menantang dengan medan yang beragam dan pemandangan spektakuler',
      },
    }),
    prisma.hikingPackage.create({
      data: {
        name: 'Jalur C - Ekspedisi Puncak',
        price: 200000,
        duration: '4 Hari 3 Malam',
        difficulty: 'Sulit',
        distance: '12 km',
        description: 'Ekspedisi menuju puncak tertinggi dengan pemandangan luar biasa',
      },
    }),
    prisma.hikingPackage.create({
      data: {
        name: 'Jalur D - Sunrise Track',
        price: 100000,
        duration: '1 Hari',
        difficulty: 'Mudah',
        distance: '3 km',
        description: 'Jalur cepat menuju spot sunrise terbaik, cocok untuk pendakian sehari',
      },
    }),
  ]);

  console.log('✅ Created hiking packages:', hikingPackages.length);

  // Seed Basecamps
  const basecamps = await Promise.all([
    prisma.basecamp.create({
      data: {
        name: 'Basecamp Pos 1',
        price: 20000,
        capacity: 50,
        location: 'Ketinggian 1.500 mdpl',
        facilities: JSON.stringify([
          'Toilet',
          'Mushola',
          'Area Camping',
          'Warung Makan',
          'Air Bersih',
        ]),
        description:
          'Basecamp pertama yang cocok untuk aklimatisasi. Memiliki fasilitas lengkap dan pemandangan yang indah.',
      },
    }),
    prisma.basecamp.create({
      data: {
        name: 'Basecamp Pos 2',
        price: 25000,
        capacity: 30,
        location: 'Ketinggian 2.000 mdpl',
        facilities: JSON.stringify([
          'Toilet',
          'Area Camping',
          'Shelter',
          'Air Bersih',
        ]),
        description:
          'Basecamp menengah dengan fasilitas memadai. Spot yang bagus untuk istirahat sebelum melanjutkan pendakian.',
      },
    }),
    prisma.basecamp.create({
      data: {
        name: 'Basecamp Pos 3',
        price: 30000,
        capacity: 20,
        location: 'Ketinggian 2.500 mdpl',
        facilities: JSON.stringify(['Shelter', 'Area Camping', 'Air Terbatas']),
        description:
          'Basecamp terakhir sebelum puncak. Fasilitas terbatas namun pemandangan bintang sangat menakjubkan.',
      },
    }),
    prisma.basecamp.create({
      data: {
        name: 'Basecamp Alternatif',
        price: 22000,
        capacity: 40,
        location: 'Ketinggian 1.800 mdpl',
        facilities: JSON.stringify([
          'Toilet',
          'Mushola',
          'Area Camping',
          'Air Bersih',
          'Tempat Parkir',
        ]),
        description:
          'Basecamp alternatif dengan akses yang lebih mudah. Cocok untuk pendaki yang membutuhkan jalur berbeda.',
      },
    }),
  ]);

  console.log('✅ Created basecamps:', basecamps.length);

  // Seed Demo User
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@hikebook.com',
      phone: '081234567890',
      password: 'demo123', // In production, this should be hashed!
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
