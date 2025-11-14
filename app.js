import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ejsLayouts from 'express-ejs-layouts';
import session from 'express-session';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
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

// --- SESSION MIDDLEWARE ---
// Middleware untuk check apakah user sudah login
function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.redirectTo = req.originalUrl; // Save intended URL
    return res.redirect('/login');
  }
  next();
}

// Middleware untuk check apakah user belum login
function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
}

// Middleware untuk membuat user tersedia di semua views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});
// --------------------------

// --- "PLUGIN" & REGISTRASI AREA ---
// Daftarkan modul sidebar info
const sidebarTemplatePath = path.join(__dirname, 'views', 'partials', 'sidebar-info.ejs');
registerToArea('sidebar', sidebarTemplatePath, {});
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

// --- CONTROLLER (ROUTES) ---

// === API ROUTES (dengan token authentication) ===
app.use('/api/auth', authRoutes);
app.use('/api/bookings', authenticateToken, bookingRoutes);

// === WEB ROUTES (untuk tampilan HTML) ===

// 1. Jadikan route handler ini "async"
app.get('/', async (req, res) => {
  const packages = await getHikingPackages();

  // 2. Panggil dan AWAIT renderArea di sini (di dalam controller)
  const sidebarHtml = await renderArea('sidebar');

  res.render('home', {
    title: 'Booking Pendakian Gunung Gede Pangrango',
    mountainName: 'Gunung Gede Pangrango',
    packages: packages,
    layout: 'layouts/main-with-sidebar', // Menggunakan layout dengan sidebar
    sidebarHtml: sidebarHtml // Sidebar kosong untuk saat ini
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'Tentang Kami',
    layout: 'layout' // Halaman 'about' pakai layout default
  });
});

app.get('/info-jalur', async (req, res) => {
  const sidebarHtml = await renderArea('sidebar');
  
  res.render('trail-info', {
    title: 'Informasi Jalur',
    layout: 'layouts/main-with-sidebar',
    sidebarHtml: sidebarHtml
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
    
    // Format data untuk view (separation of concerns)
    const formattedBooking = {
      ...booking,
      hikingDateFormatted: new Date(booking.hikingDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      totalPriceFormatted: 'Rp ' + booking.totalPrice.toLocaleString('id-ID'),
      participantsList: booking.participants ? JSON.parse(booking.participants) : []
    };
    
    res.render('booking/success', {
      title: 'Booking Berhasil',
      booking: formattedBooking,
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
app.get('/my-bookings', requireLogin, async (req, res) => {
  try {
    // Filter bookings berdasarkan userId dari session
    const bookings = await prisma.booking.findMany({
      where: {
        customerEmail: req.session.user.email // Filter by logged-in user
      },
      include: {
        hikingPackage: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format data untuk view (separation of concerns)
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      createdAtFormatted: new Date(booking.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      hikingDateFormatted: new Date(booking.hikingDate).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      totalPriceFormatted: 'Rp ' + booking.totalPrice.toLocaleString('id-ID'),
      participantsList: booking.participants ? JSON.parse(booking.participants) : []
    }));

    res.render('my-bookings', {
      title: 'My Bookings - HikeBook',
      bookings: formattedBookings,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).send('Terjadi kesalahan saat mengambil data booking');
  }
});

// GET - Halaman Edit Booking
app.get('/booking/edit/:id', requireLogin, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        hikingPackage: true
      }
    });

    if (!booking) {
      return res.status(404).send('Booking tidak ditemukan');
    }

    const packages = await getHikingPackages();

    res.render('edit-booking', {
      title: 'Edit Booking - HikeBook',
      booking: booking,
      packages: packages,
      layout: 'layout'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Terjadi kesalahan');
  }
});

// POST - Update Booking
app.post('/booking/update/:id', requireLogin, async (req, res) => {
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
app.post('/booking/delete/:id', requireLogin, async (req, res) => {
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

// === SESSION AUTHENTICATION ROUTES ===

// GET - Login Page
app.get('/login', requireGuest, (req, res) => {
  res.render('login', {
    title: 'Login - HikeBook',
    layout: false,
    error: req.query.error || null,
    success: req.query.success || null
  });
});

// POST - Login Process
app.post('/login', requireGuest, async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    // Validate input
    if (!email || !password) {
      return res.redirect('/login?error=Email dan password harus diisi');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.redirect('/login?error=Email atau password salah');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.redirect('/login?error=Email atau password salah');
    }

    // Set session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    // Extend cookie if remember me is checked
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // Redirect to home or intended page
    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login?error=Terjadi kesalahan saat login');
  }
});

// GET - Register Page
app.get('/register', requireGuest, (req, res) => {
  res.render('register', {
    title: 'Register - HikeBook',
    layout: false,
    error: req.query.error || null
  });
});

// POST - Register Process
app.post('/register', requireGuest, async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.redirect('/register?error=Semua field wajib diisi kecuali telepon');
    }

    if (password !== confirmPassword) {
      return res.redirect('/register?error=Password dan konfirmasi password tidak sama');
    }

    if (password.length < 6) {
      return res.redirect('/register?error=Password minimal 6 karakter');
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.redirect('/register?error=Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email.toLowerCase(),
        phone: phone || null,
        password: hashedPassword
      }
    });

    // Auto login after register
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    res.redirect('/?success=Registrasi berhasil! Selamat datang di HikeBook');
  } catch (error) {
    console.error('Register error:', error);
    res.redirect('/register?error=Terjadi kesalahan saat registrasi');
  }
});

// POST - Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login?success=Logout berhasil');
  });
});

// GET - Logout (alternative)
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login?success=Logout berhasil');
  });
});

// === END SESSION AUTHENTICATION ROUTES ===

// === DEBUG ROUTES (REMOVE IN PRODUCTION!) ===

// Debug: Check session data
app.get('/debug/session', (req, res) => {
  res.json({
    hasSession: !!req.session,
    sessionID: req.sessionID,
    user: req.session.user || null,
    cookie: {
      maxAge: req.session.cookie.maxAge,
      expires: req.session.cookie.expires,
      httpOnly: req.session.cookie.httpOnly,
      secure: req.session.cookie.secure
    }
  });
});

// Debug: Check if user is logged in
app.get('/debug/check-auth', (req, res) => {
  res.json({
    isAuthenticated: !!req.session.user,
    user: req.session.user || null,
    message: req.session.user ? 'User is logged in' : 'User is not logged in'
  });
});

// Test: Protected route
app.get('/test/protected', requireLogin, (req, res) => {
  res.json({
    message: 'Access granted! You are logged in.',
    user: req.session.user
  });
});

// Test: Public route
app.get('/test/public', (req, res) => {
  res.json({
    message: 'This is a public route. Anyone can access.',
    isLoggedIn: !!req.session.user,
    user: req.session.user || null
  });
});

// === END DEBUG ROUTES ===

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
  console.log(`\n🧪 Testing URLs:`);
  console.log(`   - Home: http://localhost:${port}`);
  console.log(`   - Login: http://localhost:${port}/login`);
  console.log(`   - Register: http://localhost:${port}/register`);
  console.log(`   - My Bookings: http://localhost:${port}/my-bookings`);
  console.log(`\n🔍 Debug URLs (remove in production):`);
  console.log(`   - Session Info: http://localhost:${port}/debug/session`);
  console.log(`   - Auth Check: http://localhost:${port}/debug/check-auth`);
  console.log(`   - Test Protected: http://localhost:${port}/test/protected`);
  console.log(`   - Test Public: http://localhost:${port}/test/public`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET /api/auth/me (requires token)`);
  console.log(`   - GET /api/bookings (requires token)`);
  console.log(`   - POST /api/bookings (requires token)`);
});