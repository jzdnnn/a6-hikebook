import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ejsLayouts from 'express-ejs-layouts';
import session from 'express-session';
import bodyParser from 'body-parser';
import { registerToArea, renderArea } from './core/areaManager.js'; // <-- Import area manager
import prisma from './prisma/client.js'; // <-- Import Prisma Client

// Import API routes
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import { authenticateToken } from './middleware/auth.js';

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'hikebook-secret-key-2025',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));
// ------------------

// --- PENGATURAN TEMPLATE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // (Opsional, untuk CSS)
app.use(ejsLayouts);
// File layout default (jika tidak ditentukan di res.render)
app.set('layout', 'layout'); 
// -----------------------------


// --- "PLUGIN" & REGISTRASI AREA ---
// Daftarkan modul filter ke area 'sidebar'
const filterTemplatePath = path.join(__dirname, 'views', 'partials', 'filters.ejs');
const filterData = {
  maxPrice: 1000000,
  durations: ['2 Hari 1 Malam', '3 Hari 2 Malam'],
  difficulties: ['Mudah', 'Sedang', 'Menantang', 'Sulit']
};
registerToArea('sidebar', filterTemplatePath, filterData);
// ----------------------------------


// --- LOGIKA & DATA ---
async function getHikingPackages() {
  try {
    const packages = await prisma.hikingPackage.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Transform data untuk compatibility dengan view yang ada
    return packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      difficulty: pkg.difficulty,
      distance: pkg.distance,
      description: pkg.description
    }));
  } catch (error) {
    console.error('Error fetching hiking packages:', error);
    return [];
  }
}

async function getBasecamps() {
  try {
    const basecamps = await prisma.basecamp.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Transform data untuk compatibility dengan view yang ada
    return basecamps.map(camp => ({
      id: camp.id,
      name: camp.name,
      pricePerNight: camp.price,
      capacity: camp.capacity,
      facilities: JSON.parse(camp.facilities),
      address: camp.location,
      coordinates: '-6.7392, 107.0097', // Default coordinates
      description: camp.description,
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500', // Default image
      rating: 4.5,
      reviews: 0
    }));
  } catch (error) {
    console.error('Error fetching basecamps:', error);
    return [];
  }
}

// --- CONTROLLER (ROUTES) ---

// === API ROUTES (dengan token authentication) ===
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// API route untuk get profile (protected)
app.use('/api/auth/me', authenticateToken, authRoutes);

// === WEB ROUTES (untuk tampilan HTML) ===

// 1. Jadikan route handler ini "async"
app.get('/', async (req, res) => {
  const packages = await getHikingPackages();
  const basecamps = await getBasecamps();

  // 2. Panggil dan AWAIT renderArea di sini (di dalam controller)
  const sidebarHtml = await renderArea('sidebar');

  res.render('home', {
    title: 'Booking Pendakian Gunung Gede Pangrango',
    mountainName: 'Gunung Gede Pangrango',
    packages: packages,
    basecamps: basecamps,
    layout: 'layouts/main-with-sidebar', // Tentukan layout spesifik untuk halaman ini
    sidebarHtml: sidebarHtml // 3. Kirim HTML-nya sebagai variabel
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'Tentang Kami',
    layout: 'layout' // Halaman 'about' pakai layout default
  });
});

app.get('/basecamps', async (req, res) => {
  const basecamps = await getBasecamps();
  res.render('basecamps', {
    title: 'Booking Basecamp',
    basecamps: basecamps,
    layout: 'layout'
  });
});

// === BOOKING FLOW ROUTES ===

// Detail Paket Hiking
app.get('/package/:id', async (req, res) => {
  try {
    const packageData = await prisma.hikingPackage.findUnique({
      where: { id: req.params.id }
    });
    
    if (!packageData) {
      return res.status(404).send('Paket tidak ditemukan');
    }
    
    res.render('package-detail', {
      title: `${packageData.name} - Detail Paket`,
      package: packageData,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).send('Terjadi kesalahan');
  }
});

// Step 1: Form Data Diri
app.get('/booking/step1/:packageId', async (req, res) => {
  try {
    const packageData = await prisma.hikingPackage.findUnique({
      where: { id: req.params.packageId }
    });
    
    if (!packageData) {
      return res.status(404).send('Paket tidak ditemukan');
    }
    
    // Initialize session booking data
    req.session.bookingData = {
      packageId: packageData.id,
      packageName: packageData.name,
      packagePrice: packageData.price
    };
    
    res.render('booking/step1-personal-info', {
      title: 'Booking - Data Diri',
      package: packageData,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Terjadi kesalahan');
  }
});

// Step 1: Process Form Data Diri
app.post('/booking/step1', async (req, res) => {
  const { customerName, customerEmail, customerPhone, hikingDate } = req.body;
  
  // Validate
  if (!customerName || !customerEmail || !customerPhone || !hikingDate) {
    return res.status(400).send('Semua field harus diisi');
  }
  
  // Save to session
  req.session.bookingData = {
    ...req.session.bookingData,
    customerName,
    customerEmail,
    customerPhone,
    hikingDate
  };
  
  res.redirect('/booking/step2');
});

// Step 2: Form Data Kelompok
app.get('/booking/step2', (req, res) => {
  if (!req.session.bookingData) {
    return res.redirect('/');
  }
  
  res.render('booking/step2-group-info', {
    title: 'Booking - Data Kelompok',
    bookingData: req.session.bookingData,
    layout: 'layout'
  });
});

// Step 2: Process Form Data Kelompok
app.post('/booking/step2', (req, res) => {
  const { numberOfPeople, participants } = req.body;
  
  if (!numberOfPeople || numberOfPeople < 1) {
    return res.status(400).send('Jumlah peserta minimal 1');
  }
  
  // Parse participants data
  let participantsList = [];
  try {
    participantsList = typeof participants === 'string' 
      ? JSON.parse(participants) 
      : participants;
  } catch (error) {
    console.error('Error parsing participants:', error);
  }
  
  req.session.bookingData = {
    ...req.session.bookingData,
    numberOfPeople: parseInt(numberOfPeople),
    participants: participantsList
  };
  
  res.redirect('/booking/review');
});

// Step 3: Review & Konfirmasi
app.get('/booking/review', async (req, res) => {
  if (!req.session.bookingData) {
    return res.redirect('/');
  }
  
  try {
    const packageData = await prisma.hikingPackage.findUnique({
      where: { id: req.session.bookingData.packageId }
    });
    
    const bookingData = req.session.bookingData;
    const totalPrice = packageData.price * bookingData.numberOfPeople;
    
    res.render('booking/step3-review', {
      title: 'Review Booking',
      package: packageData,
      bookingData: bookingData,
      totalPrice: totalPrice,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Terjadi kesalahan');
  }
});

// Step 4: Payment/Checkout
app.post('/booking/checkout', async (req, res) => {
  if (!req.session.bookingData) {
    return res.redirect('/');
  }
  
  const { paymentMethod } = req.body;
  
  req.session.bookingData.paymentMethod = paymentMethod;
  
  res.redirect('/booking/payment');
});

app.get('/booking/payment', async (req, res) => {
  if (!req.session.bookingData) {
    return res.redirect('/');
  }
  
  try {
    const packageData = await prisma.hikingPackage.findUnique({
      where: { id: req.session.bookingData.packageId }
    });
    
    const bookingData = req.session.bookingData;
    const totalPrice = packageData.price * bookingData.numberOfPeople;
    
    res.render('booking/step4-payment', {
      title: 'Payment',
      package: packageData,
      bookingData: bookingData,
      totalPrice: totalPrice,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Terjadi kesalahan');
  }
});

// Process Payment & Create Booking
app.post('/booking/process-payment', async (req, res) => {
  if (!req.session.bookingData) {
    return res.redirect('/');
  }
  
  try {
    const bookingData = req.session.bookingData;
    const packageData = await prisma.hikingPackage.findUnique({
      where: { id: bookingData.packageId }
    });
    
    const totalPrice = packageData.price * bookingData.numberOfPeople;
    
    // Generate unique booking number
    const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
    
    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: bookingNumber,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        hikingPackageId: bookingData.packageId,
        hikingDate: new Date(bookingData.hikingDate),
        numberOfPeople: bookingData.numberOfPeople,
        participants: JSON.stringify(bookingData.participants || []),
        totalPrice: totalPrice,
        paymentMethod: bookingData.paymentMethod,
        paymentStatus: 'pending',
        bookingStatus: 'pending'
      }
    });
    
    // Clear session
    const bookingId = booking.id;
    req.session.bookingData = null;
    
    res.redirect(`/booking/success/${bookingId}`);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).send('Terjadi kesalahan saat memproses booking');
  }
});

// Success Page
app.get('/booking/success/:bookingId', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.bookingId },
      include: {
        hikingPackage: true
      }
    });
    
    if (!booking) {
      return res.status(404).send('Booking tidak ditemukan');
    }
    
    res.render('booking/success', {
      title: 'Booking Berhasil',
      booking: booking,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Terjadi kesalahan');
  }
});

// === END BOOKING FLOW ROUTES ===

// === MY BOOKINGS & CRUD ROUTES ===

// GET - Halaman My Bookings (daftar booking user)
app.get('/my-bookings', async (req, res) => {
  try {
    // Untuk demo, kita ambil semua bookings
    // Di production, filter berdasarkan userId dari session
    const bookings = await prisma.booking.findMany({
      include: {
        hikingPackage: true,
        basecamp: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.render('my-bookings', {
      title: 'My Bookings - HikeBook',
      bookings: bookings,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).send('Terjadi kesalahan saat mengambil data booking');
  }
});

// GET - Halaman Edit Booking
app.get('/booking/edit/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        hikingPackage: true,
        basecamp: true
      }
    });

    if (!booking) {
      return res.status(404).send('Booking tidak ditemukan');
    }

    const packages = await getHikingPackages();
    const basecamps = await getBasecamps();

    res.render('edit-booking', {
      title: 'Edit Booking - HikeBook',
      booking: booking,
      packages: packages,
      basecamps: basecamps,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Terjadi kesalahan');
  }
});

// POST - Update Booking
app.post('/booking/update/:id', async (req, res) => {
  try {
    const { hikingDate, numberOfPeople, notes } = req.body;

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        hikingDate: new Date(hikingDate),
        numberOfPeople: parseInt(numberOfPeople),
        notes: notes || null
      }
    });

    res.redirect(`/booking/success/${updatedBooking.id}?updated=true`);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).send('Terjadi kesalahan saat update booking');
  }
});

// POST - Delete/Cancel Booking
app.post('/booking/delete/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });

    if (!booking) {
      return res.status(404).send('Booking tidak ditemukan');
    }

    await prisma.booking.delete({
      where: { id: req.params.id }
    });

    res.redirect('/my-bookings?deleted=true');
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).send('Terjadi kesalahan saat menghapus booking');
  }
});

// === END MY BOOKINGS & CRUD ROUTES ===

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});