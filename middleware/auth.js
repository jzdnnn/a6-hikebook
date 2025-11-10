import jwt from 'jsonwebtoken';

// Secret key untuk JWT (di production sebaiknya di environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'hikebook-secret-jwt-key-2025-super-secure';

/**
 * Middleware untuk verifikasi JWT token
 * Token harus dikirim di header: Authorization: Bearer <token>
 */
export const authenticateToken = (req, res, next) => {
  // Get token dari header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      message: 'Anda harus login terlebih dahulu' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info ke request
    next(); // Lanjut ke route handler
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'Token tidak valid atau sudah expired' 
    });
  }
};

/**
 * Generate JWT token untuk user
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  // Token expired dalam 24 jam
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export default { authenticateToken, generateToken };
