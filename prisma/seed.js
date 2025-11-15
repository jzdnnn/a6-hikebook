import prisma from './client.js';

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.hikingPackage.deleteMany();
  await prisma.user.deleteMany();

  // Seed Hiking Packages
  const hikingPackages = await Promise.all([
    prisma.hikingPackage.create({
      data: {
        name: 'Jalur Cibodas',
        price: 150000,
        duration: '5-7 Jam',
        difficulty: 'Mudah',
        distance: '7 km',
        description: 'Jalur yang populer karena lebih ramah untuk pemula, memiliki fasilitas yang baik, dan melewati spot-spot menarik seperti Telaga Biru, Rawa Gayonggong, Air Terjun Cibeureum, dan Kandang Badak sebagai tempat perkemahan.',
        mapsLink: 'https://maps.app.goo.gl/EBTwedZKfv77i6DQ8',
        mapImage: '/images/peta-pendakian-cibodas.jpg',
      },
    }),
    prisma.hikingPackage.create({
      data: {
        name: 'Jalur Putri',
        price: 150000,
        duration: '6-8 Jam',
        difficulty: 'Sedang',
        distance: '8 km',
        description: 'Jalur paling favorit karena dianggap paling cepat menuju Alun-alun Surya Kencana. Jalur ini cocok untuk pemula, meskipun didominasi tanjakan, karena jalurnya jelas dan ada banyak shelter di sepanjang perjalanan.',
        mapsLink: 'https://maps.app.goo.gl/qxCrqfSiH5zTbJQK6',
        mapImage: '/images/peta-pendakian.jpg',
      },
    }),
    prisma.hikingPackage.create({
      data: {
        name: 'Jalur Selabinta',
        price: 120000,
        duration: '7-9 Jam',
        difficulty: 'Sulit',
        distance: '10 km',
        description: 'Jalur yang paling panjang, sepi, dan menantang karena melewati hutan tropis lebat yang masih asri. Karakteristiknya meliputi tanjakan panjang, minim fasilitas seperti shelter dan sumber air, serta potensi keberadaan pacet.',
        mapsLink: 'https://maps.app.goo.gl/nRNRmvCvQvb1yiX5A',
        mapImage: '/images/peta-pendakian.jpg',
      },
    }),
  ]);

  console.log('✅ Created hiking packages:', hikingPackages.length);

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
