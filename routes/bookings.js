import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/bookings
 * Get all bookings (protected - hanya untuk user yang login)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        hikingPackage: true,
        basecamp: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Bookings retrieved successfully',
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data booking'
    });
  }
});

/**
 * GET /api/bookings/:id
 * Get booking by ID (protected)
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: req.params.id,
        userId: req.user.id // Hanya bisa akses booking sendiri
      },
      include: {
        hikingPackage: true,
        basecamp: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'Booking tidak ditemukan'
      });
    }

    res.json({
      message: 'Booking retrieved successfully',
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data booking'
    });
  }
});

/**
 * POST /api/bookings
 * Create new booking (protected)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      hikingPackageId,
      basecampId,
      hikingDate,
      numberOfPeople,
      participants,
      paymentMethod,
      notes
    } = req.body;

    // Validasi
    if (!hikingDate || !numberOfPeople) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Tanggal hiking dan jumlah peserta harus diisi'
      });
    }

    // Get package/basecamp untuk hitung harga
    let totalPrice = 0;
    if (hikingPackageId) {
      const pkg = await prisma.hikingPackage.findUnique({
        where: { id: hikingPackageId }
      });
      if (pkg) totalPrice += pkg.price * numberOfPeople;
    }
    if (basecampId) {
      const basecamp = await prisma.basecamp.findUnique({
        where: { id: basecampId }
      });
      if (basecamp) totalPrice += basecamp.price * numberOfPeople;
    }

    // Generate booking number
    const bookingNumber = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Buat booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerName: req.user.name,
        customerEmail: req.user.email,
        customerPhone: req.body.customerPhone || '',
        hikingPackageId: hikingPackageId || null,
        basecampId: basecampId || null,
        hikingDate: new Date(hikingDate),
        numberOfPeople: parseInt(numberOfPeople),
        participants: JSON.stringify(participants || []),
        totalPrice,
        paymentMethod: paymentMethod || null,
        paymentStatus: 'pending',
        bookingStatus: 'pending',
        notes: notes || null,
        userId: req.user.id
      },
      include: {
        hikingPackage: true,
        basecamp: true
      }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat membuat booking'
    });
  }
});

/**
 * PUT /api/bookings/:id
 * Update booking (protected)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Cek apakah booking ada dan milik user ini
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingBooking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'Booking tidak ditemukan atau bukan milik Anda'
      });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        hikingDate: req.body.hikingDate ? new Date(req.body.hikingDate) : undefined,
        numberOfPeople: req.body.numberOfPeople ? parseInt(req.body.numberOfPeople) : undefined,
        participants: req.body.participants ? JSON.stringify(req.body.participants) : undefined,
        paymentMethod: req.body.paymentMethod,
        notes: req.body.notes
      },
      include: {
        hikingPackage: true,
        basecamp: true
      }
    });

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat update booking'
    });
  }
});

/**
 * DELETE /api/bookings/:id
 * Cancel/Delete booking (protected)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Cek apakah booking ada dan milik user ini
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingBooking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'Booking tidak ditemukan atau bukan milik Anda'
      });
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Booking cancelled successfully',
      bookingNumber: existingBooking.bookingNumber
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat menghapus booking'
    });
  }
});

export default router;
