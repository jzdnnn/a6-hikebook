# API Documentation - HikeBook

Base URL: `http://localhost:3000/api`
Production URL: `https://your-domain.com/api`

## Authentication

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08123456789",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Get User Profile (Protected)
**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "createdAt": "2025-11-10T...",
    "bookings": []
  }
}
```

---

## Bookings (All endpoints require authentication)

### 4. Get All Bookings
**Endpoint:** `GET /api/bookings`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Bookings retrieved successfully",
  "count": 2,
  "bookings": [
    {
      "id": "uuid",
      "bookingNumber": "BK123456ABC",
      "hikingDate": "2025-11-15",
      "numberOfPeople": 3,
      "totalPrice": 450000,
      "bookingStatus": "confirmed",
      "hikingPackage": {...},
      "basecamp": {...}
    }
  ]
}
```

---

### 5. Get Booking by ID
**Endpoint:** `GET /api/bookings/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Booking retrieved successfully",
  "booking": {
    "id": "uuid",
    "bookingNumber": "BK123456ABC",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "hikingDate": "2025-11-15",
    "numberOfPeople": 3,
    "totalPrice": 450000,
    "hikingPackage": {...},
    "basecamp": {...},
    "user": {...}
  }
}
```

---

### 6. Create New Booking (POST)
**Endpoint:** `POST /api/bookings`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "hikingPackageId": "uuid-hiking-package",
  "basecampId": "uuid-basecamp",
  "hikingDate": "2025-11-15",
  "numberOfPeople": 3,
  "customerPhone": "08123456789",
  "participants": [
    {
      "name": "John Doe",
      "identityNumber": "1234567890123456",
      "age": 25
    }
  ],
  "paymentMethod": "transfer_bank",
  "notes": "Catatan khusus..."
}
```

**Response (201 Created):**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "uuid",
    "bookingNumber": "BK123456ABC",
    "hikingDate": "2025-11-15",
    "numberOfPeople": 3,
    "totalPrice": 450000,
    "bookingStatus": "pending",
    "paymentStatus": "pending"
  }
}
```

---

### 7. Update Booking (PUT)
**Endpoint:** `PUT /api/bookings/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "hikingDate": "2025-11-20",
  "numberOfPeople": 4,
  "notes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "message": "Booking updated successfully",
  "booking": {...}
}
```

---

### 8. Delete Booking (DELETE)
**Endpoint:** `DELETE /api/bookings/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Booking cancelled successfully",
  "bookingNumber": "BK123456ABC"
}
```

---

## Error Responses

### 401 Unauthorized (No Token)
```json
{
  "error": "Access denied. No token provided.",
  "message": "Anda harus login terlebih dahulu"
}
```

### 403 Forbidden (Invalid Token)
```json
{
  "error": "Invalid token",
  "message": "Token tidak valid atau sudah expired"
}
```

### 404 Not Found
```json
{
  "error": "Booking not found",
  "message": "Booking tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Terjadi kesalahan saat memproses permintaan"
}
```

---

## Testing dengan cURL

### Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Get Bookings (with token):
```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Booking:
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"hikingPackageId":"package-uuid","hikingDate":"2025-11-15","numberOfPeople":2}'
```

---

## Notes
- Token expired dalam 24 jam
- Semua endpoint booking memerlukan authentication
- User hanya bisa akses booking miliknya sendiri
- Password di-hash menggunakan bcrypt
