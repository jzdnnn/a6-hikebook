import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register user baru
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Nama, email, dan password harus diisi'
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword
      }
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat registrasi'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user dan dapatkan token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email dan password harus diisi'
      });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email atau password salah'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email atau password salah'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat login'
    });
  }
});

/**
 * GET /api/auth/me
 * Get user profile (protected route)
 */
router.get('/me', async (req, res) => {
  try {
    // req.user sudah di-set oleh authenticateToken middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
            bookingNumber: true,
            bookingStatus: true,
            hikingDate: true,
            totalPrice: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data user'
    });
  }
});

export default router;
