# 📮 POSTMAN SETUP GUIDE - HikeBook API

Panduan lengkap setup dan menggunakan Postman untuk testing API HikeBook.

---

## 📥 STEP 1: Download & Install Postman

### Windows:
1. **Download:**
   - Website: https://www.postman.com/downloads/
   - Pilih "Windows 64-bit"
   - Size: ~150 MB

2. **Install:**
   - Run installer
   - Follow wizard
   - No special configuration needed

### Alternative (Via Package Manager):
```powershell
# Via Chocolatey
choco install postman

# Via Scoop
scoop install postman

# Via Winget
winget install Postman.Postman
```

---

## 📦 STEP 2: Import Collection

### Method 1: Via File Import (Recommended)

1. **Buka Postman**

2. **Import Collection:**
   ```
   Klik "Import" button (pojok kiri atas)
   → Drag & drop file: postman-collection.json
   → Atau: File → Upload Files → Pilih postman-collection.json
   ```

3. **Import Environment:**
   ```
   Klik "⚙️ Settings" → Environments
   → Import → Pilih: postman-environment.json
   ```

4. **Activate Environment:**
   ```
   Dropdown pojok kanan atas
   → Pilih "HikeBook Environment"
   ```

### Method 2: Manual Create

**Create Collection:**
```
Collections → Create Collection
Name: "HikeBook API"
Add Request → Name: "Register User"
```

---

## 🔧 STEP 3: Setup Environment Variables

### Cara 1: Otomatis (Sudah di-import)
File `postman-environment.json` sudah berisi:
- ✅ `base_url`: http://localhost:3000
- ✅ `auth_token`: (akan diisi otomatis setelah login)
- ✅ `user_id`: (akan diisi otomatis)
- ✅ `booking_id`: (akan diisi otomatis)

### Cara 2: Manual Setup
1. Click "⚙️" icon (Environments)
2. Click "+" untuk New Environment
3. Name: "HikeBook Environment"
4. Add variables:
   ```
   Variable        | Initial Value           | Current Value
   ------------------------------------------------------------
   base_url        | http://localhost:3000  | http://localhost:3000
   auth_token      |                        |
   user_id         |                        |
   user_email      |                        |
   booking_id      |                        |
   package_id      |                        |
   ```
5. Save

---

## 🚀 STEP 4: Test Your First API

### 1. Start Server
```powershell
# Di terminal/PowerShell
cd "d:\Polban\Mata Kuliah\Semester 5\Pengembangan Web\a6-hikebook"
npm start
```

**Verify server running:**
```
Server berjalan di http://localhost:3000
```

### 2. Test Register Endpoint

**In Postman:**
```
1. Collections → HikeBook API → Authentication → Register User
2. Lihat Request:
   - Method: POST
   - URL: {{base_url}}/api/auth/register
   - Body: JSON data (name, email, password, phone)
3. Click "Send" button
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clw...",
    "name": "Postman User",
    "email": "postman@hikebook.com",
    "phone": "08123456789"
  }
}
```

**What Happens:**
- ✅ Status: 201 Created
- ✅ Token automatically saved to environment variable `auth_token`
- ✅ User ID saved to `user_id`
- ✅ Console shows: "Token saved: eyJhbGc..."

### 3. Test Login Endpoint

**In Postman:**
```
1. Collections → Authentication → Login User
2. Body sudah berisi email & password
3. Click "Send"
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**What Happens:**
- ✅ Status: 200 OK
- ✅ New token saved (replaces old token)
- ✅ Tests run automatically (see "Test Results" tab)

### 4. Test Protected Endpoint

**In Postman:**
```
1. Collections → Authentication → Get User Profile
2. Lihat Authorization tab:
   - Type: Bearer Token
   - Token: {{auth_token}} (auto dari environment)
3. Click "Send"
```

**Expected Response:**
```json
{
  "user": {
    "id": "clw...",
    "name": "Postman User",
    "email": "postman@hikebook.com",
    "phone": "08123456789"
  }
}
```

**What Happens:**
- ✅ Status: 200 OK
- ✅ Request includes Authorization header
- ✅ Server verifies token dan returns user data

---

## 📚 STEP 5: Complete Testing Flow

### Scenario: End-to-End Booking

#### 1. Register/Login ✅
```
Run: Register User atau Login User
Result: Token saved automatically
```

#### 2. Get Package ID (Manual Step)
```
Option A: Buka browser
  → http://localhost:3000
  → Klik paket hiking
  → Copy ID dari URL (contoh: clwxxx123)
  
Option B: Buka Prisma Studio
  → npx prisma studio
  → Table: HikingPackage
  → Copy ID dari row pertama
```

#### 3. Save Package ID
```
Postman → Environments → HikeBook Environment
→ Variable: package_id
→ Current Value: [PASTE ID DARI STEP 2]
→ Save
```

#### 4. Create Booking
```
Collections → Bookings → Create Booking
Body akan otomatis pakai:
  - hikingPackageId: {{package_id}}
  - hikingDate: 2025-12-25
  - numberOfPeople: 2
Click "Send"
```

**Expected Response:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "clw...",
    "bookingNumber": "BK1731628800123",
    "customerName": "Postman User",
    "hikingDate": "2025-12-25T00:00:00.000Z",
    "numberOfPeople": 2,
    "totalPrice": 1000000,
    "bookingStatus": "pending"
  }
}
```

**What Happens:**
- ✅ Booking created
- ✅ `booking_id` saved to environment
- ✅ Can be used for Update/Delete

#### 5. Get All Bookings
```
Collections → Bookings → Get All Bookings
Click "Send"
```

**Expected Response:**
```json
{
  "bookings": [
    {
      "id": "clw...",
      "bookingNumber": "BK1731628800123",
      ...
    }
  ]
}
```

#### 6. Update Booking
```
Collections → Bookings → Update Booking
URL otomatis: {{base_url}}/api/bookings/{{booking_id}}
Body: Change numberOfPeople to 3
Click "Send"
```

#### 7. Delete Booking
```
Collections → Bookings → Delete Booking
Click "Send"
```

---

## 🧪 STEP 6: Test Error Cases

### 1. Test Without Token (Should Fail)
```
Collections → Testing → Test Without Token
Result: 401 Unauthorized
```

### 2. Test Invalid Token (Should Fail)
```
Collections → Testing → Test Invalid Token
Result: 403 Forbidden
```

---

## 💡 POSTMAN TIPS & TRICKS

### 1. View Environment Variables
```
Click "👁️ Eye" icon (pojok kanan atas)
Lihat semua variables dan values
```

### 2. View Console (Debugging)
```
View → Show Postman Console (Ctrl+Alt+C)
Lihat semua requests & responses
Good untuk debugging
```

### 3. Pre-request Scripts
Sudah dikonfigurasi untuk auto-save token:
```javascript
// After Login, token otomatis saved:
pm.environment.set("auth_token", jsonData.token);
```

### 4. Tests Tab
Setiap request punya automated tests:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

### 5. Collections Runner
Test semua endpoints sekaligus:
```
Collections → HikeBook API → "⋯" → Run collection
Select requests → Run HikeBook API
Result: All tests in sequence
```

### 6. Export Results
```
Runner → Export Results
Format: JSON or HTML
Share dengan team atau untuk dokumentasi
```

---

## 🎯 KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| Ctrl+Enter | Send request |
| Ctrl+S | Save request |
| Ctrl+Alt+C | Open console |
| Ctrl+K | Search commands |
| Alt+B | Open body tab |
| Alt+H | Open headers tab |

---

## 🔍 TROUBLESHOOTING

### Problem 1: "Could not get any response"
**Solution:**
```
1. Check server running: npm start
2. Check URL correct: http://localhost:3000
3. Check firewall not blocking
```

### Problem 2: "401 Unauthorized"
**Solution:**
```
1. Run Login request first
2. Check token saved: Eye icon → auth_token
3. Check Authorization tab: Type = Bearer Token
```

### Problem 3: "Token is invalid"
**Solution:**
```
Token expired (24 hours). Login again:
1. Run Login request
2. Token will refresh automatically
```

### Problem 4: "Cannot find booking"
**Solution:**
```
1. Run Get All Bookings
2. Copy booking ID from response
3. Manually set: booking_id environment variable
```

### Problem 5: "Environment variables not working"
**Solution:**
```
1. Check environment selected (dropdown pojok kanan atas)
2. Should be: "HikeBook Environment"
3. Re-import environment file if needed
```

---

## 📊 RESPONSE STATUS CODES

| Code | Meaning | Cause |
|------|---------|-------|
| 200 | OK | Request successful |
| 201 | Created | Resource created (register, create booking) |
| 400 | Bad Request | Invalid data (missing fields, wrong format) |
| 401 | Unauthorized | No token provided |
| 403 | Forbidden | Invalid/expired token |
| 404 | Not Found | Resource not found (wrong ID) |
| 500 | Server Error | Server crash (check terminal logs) |

---

## 🎓 LEARNING RESOURCES

### Postman Official:
- Documentation: https://learning.postman.com/docs/
- Video Tutorials: https://www.youtube.com/postmanapi
- Community: https://community.postman.com/

### HikeBook API Docs:
- File: `API_DOCUMENTATION.md`
- Contains: All endpoints, request/response examples
- Testing Guide: `TESTING_GUIDE.md`

---

## ✅ QUICK CHECKLIST

Before testing, verify:
- [ ] Postman installed
- [ ] Collection imported (`postman-collection.json`)
- [ ] Environment imported (`postman-environment.json`)
- [ ] Environment activated (HikeBook Environment)
- [ ] Server running (`npm start`)
- [ ] Server accessible (http://localhost:3000)

For testing:
- [ ] Register/Login first (get token)
- [ ] Token automatically saved
- [ ] Run protected endpoints
- [ ] Check Test Results tab
- [ ] Check Console for logs

---

## 🚀 ADVANCED FEATURES

### 1. Collection Variables
```
Collections → HikeBook API → Variables tab
Add collection-level variables
```

### 2. Mock Servers
```
Collections → "⋯" → Mock Collection
Create fake API responses for frontend development
```

### 3. Documentation
```
Collections → "⋯" → View Documentation
Auto-generated API docs from collection
```

### 4. Code Generation
```
Code icon (</>) → Select language
Generate code: curl, JavaScript fetch, Axios, etc.
```

### 5. Monitors
```
Collections → "⋯" → Monitor Collection
Schedule automated tests (hourly, daily)
```

---

## 📝 SAMPLE WORKFLOW

```
Day 1: Setup
✅ Install Postman
✅ Import collection
✅ Import environment
✅ Test Register & Login

Day 2: Basic Testing
✅ Test all Authentication endpoints
✅ Test Get Bookings
✅ Test error cases

Day 3: CRUD Testing
✅ Create booking
✅ Update booking
✅ Delete booking
✅ Verify data in Prisma Studio

Day 4: Advanced
✅ Run Collection Runner
✅ Export test results
✅ Generate documentation
✅ Share with team
```

---

## 🎉 SUCCESS INDICATORS

You're ready when:
- ✅ Collection imported with 10+ requests
- ✅ Environment variables working
- ✅ Register creates user & saves token
- ✅ Login returns token
- ✅ Protected routes work with token
- ✅ All tests passing (green checkmarks)
- ✅ Console shows request/response logs

---

## 📞 NEED HELP?

**File Issues:**
- Check `TESTING_GUIDE.md` untuk error handling
- Check `API_DOCUMENTATION.md` untuk endpoint details
- Check terminal logs untuk server errors

**Common Files:**
- `postman-collection.json` - Collection file
- `postman-environment.json` - Environment variables
- `API_DOCUMENTATION.md` - Complete API reference
- `TESTING_GUIDE.md` - Testing scenarios

---

## 🎯 FINAL TIPS

1. **Always start server first:** `npm start`
2. **Always login first:** To get fresh token
3. **Check environment selected:** Should be "HikeBook Environment"
4. **Use Console:** For debugging (Ctrl+Alt+C)
5. **Read Test Results:** Green = pass, Red = fail
6. **Save requests:** Any changes you make
7. **Use Collections Runner:** For batch testing

---

**Happy Testing with Postman! 🚀**

**Collection includes:**
- ✅ 3 Authentication endpoints
- ✅ 4 Booking CRUD endpoints
- ✅ 2 Error testing endpoints
- ✅ Auto token management
- ✅ Automated tests
- ✅ Pre-request scripts
- ✅ Environment variables

**Everything is ready to use! Just import and start testing!** 🎉
