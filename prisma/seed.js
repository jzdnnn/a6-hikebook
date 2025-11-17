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
        mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3962.2447824311002!2d107.0019814!3d-6.7399667!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69b47edb6afe0f%3A0xeee60501ca85e84f!2sPintu%20Masuk%20Pendakian%20Cibodas%20(TNGGP)!5e0!3m2!1sid!2sid!4v1763346398962!5m2!1sid!2sid" width="800" height="600" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade',
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
        mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3962.087292438528!2d107.0049175!3d-6.7592097!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69b568b1d914c3%3A0xd059e9172d60c413!2sPos%20Pemantauan%20KLHK!5e0!3m2!1sid!2sid!4v1763346523722!5m2!1sid!2sid" width="800" height="600" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade',
        mapImage: '/images/peta-pendakian-putri.jpg',
      },
    }),
    prisma.hikingPackage.create({
      data: {
        name: 'Jalur Selabintana',
        price: 120000,
        duration: '7-9 Jam',
        difficulty: 'Sulit',
        distance: '10 km',
        description: 'Jalur yang paling panjang, sepi, dan menantang karena melewati hutan tropis lebat yang masih asri. Karakteristiknya meliputi tanjakan panjang, minim fasilitas seperti shelter dan sumber air, serta potensi keberadaan pacet.',
        mapsLink: 'https://maps.app.goo.gl/nRNRmvCvQvb1yiX5A',
        mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1980.679734735443!2d106.9608322!3d-6.84744!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e684bb56ee35d1d%3A0x555fbf93dcfe89c8!2sKantor%20Resor%20PTN%20Selabintana%2C%20TNGGP!5e0!3m2!1sid!2sid!4v1763346570870!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade',
        mapImage: '/images/peta-pendakian-selabintana.jpg',
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
