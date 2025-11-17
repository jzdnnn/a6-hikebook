# 🚀 Deployment Guide - HikeBook to Azure VM

## 📋 Prerequisites

- Azure for Students account
- GitHub Student Pack (for free domain)
- SSH client (Windows Terminal, PuTTY, or Git Bash)
- Git installed locally

---

## 🎯 Overview

Deployment architecture:
```
Internet → Domain (GitHub Student) → Azure VM IP → Nginx → Node.js App (PM2)
```

---

## 1️⃣ Persiapan Aplikasi Lokal

### ✅ Update Configuration Files

File yang sudah disiapkan:
- [x] `.env.example` - Template environment variables
- [x] `app.js` - Support production mode dengan dotenv
- [x] `package.json` - Script untuk production
- [x] `.gitignore` - Protect sensitive files

### ✅ Commit & Push ke GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

## 2️⃣ Setup Azure VM

### A. Create Virtual Machine

1. **Login to Azure Portal**: https://portal.azure.com
2. **Create Resource** → Virtual Machines → Create
3. **Configuration:**
   - **Subscription**: Azure for Students
   - **Resource Group**: Create new → `hikebook-rg`
   - **VM Name**: `hikebook-vm`
   - **Region**: Southeast Asia (Singapore) atau yang terdekat
   - **Image**: Ubuntu Server 22.04 LTS
   - **Size**: B1s (1 vCPU, 1 GB RAM) - gratis untuk students
   - **Authentication**: SSH public key
   - **Username**: `azureuser` (atau pilih sendiri)

4. **Networking:**
   - **Inbound port rules**: Allow SSH (22), HTTP (80), HTTPS (443)

5. **Review + Create** → Wait 2-3 minutes

### B. Get Public IP Address

1. Go to VM → Overview
2. Copy **Public IP address** (contoh: `20.212.xx.xx`)
3. Save this IP for DNS configuration

### C. Connect via SSH

**Windows (PowerShell/CMD):**
```bash
ssh azureuser@20.212.xx.xx
```

**Windows (using PuTTY):**
- Host: `20.212.xx.xx`
- Port: 22
- Connection type: SSH

---

## 3️⃣ Setup Server Environment

### A. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### B. Install Node.js (v20 LTS)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js
nvm install 20
nvm use 20
node --version  # Should show v20.x.x
```

### C. Install Git

```bash
sudo apt install git -y
git --version
```

### D. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### E. Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl status nginx
```

---

## 4️⃣ Clone & Setup Application

### A. Clone Repository

```bash
cd ~
git clone https://github.com/jzdnnn/a6-hikebook.git
cd a6-hikebook
```

### B. Create Production .env File

```bash
nano .env
```

**Paste this configuration:**

```env
# ===== PRODUCTION CONFIGURATION =====
NODE_ENV=production

# Server Configuration
PORT=3000

# Database Connection (SQLite)
DATABASE_URL="file:./prisma/production.db"

# Session Secret (GENERATE NEW ONE!)
SESSION_SECRET="your-generated-secret-key-min-32-chars-random-string"

# JWT Secret
JWT_SECRET="your-generated-jwt-secret-min-32-chars-random-string"

# Application URL (update with your domain)
APP_URL=https://yourdomain.com
```

**💡 Generate random secrets:**
```bash
# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save: `Ctrl+X` → `Y` → `Enter`

### C. Install Dependencies

```bash
npm install
```

### D. Setup Database

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npm run seed
```

### E. Test Run

```bash
npm start
```

Test: Open browser → `http://YOUR_VM_IP:3000`

If works, press `Ctrl+C` to stop.

---

## 5️⃣ Setup PM2 (Process Manager)

### A. Start with PM2

```bash
pm2 start app.js --name hikebook
```

### B. Setup Auto-restart on Reboot

```bash
pm2 startup
# Copy and run the command it shows

pm2 save
```

### C. Useful PM2 Commands

```bash
pm2 status           # Check status
pm2 logs hikebook    # View logs
pm2 restart hikebook # Restart app
pm2 stop hikebook    # Stop app
pm2 delete hikebook  # Remove from PM2
```

---

## 6️⃣ Setup Nginx Reverse Proxy

### A. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/hikebook
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_HERE;  # Example: hikebook.me

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save: `Ctrl+X` → `Y` → `Enter`

### B. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/hikebook /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### C. Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

---

## 7️⃣ Setup Domain (GitHub Student Pack)

### A. Get Free Domain

1. **Access GitHub Student Pack**: https://education.github.com/pack
2. **Find Namecheap** offer
3. **Claim free .me domain** (1 year)
4. **Register domain** (example: `hikebook.me`)

### B. Configure DNS

1. **Login to Namecheap**
2. **Domain List** → Select your domain → **Manage**
3. **Advanced DNS** tab
4. **Add/Edit DNS Records:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | YOUR_AZURE_VM_IP | Automatic |
| A Record | www | YOUR_AZURE_VM_IP | Automatic |

Example:
```
A Record    @      20.212.xx.xx    Automatic
A Record    www    20.212.xx.xx    Automatic
```

5. **Save Changes** (DNS propagation: 5-30 minutes)

### C. Test DNS Propagation

```bash
# On your local computer
nslookup yourdomain.me
ping yourdomain.me
```

Should show your Azure VM IP!

---

## 8️⃣ Setup SSL Certificate (HTTPS)

### A. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### B. Generate SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.me -d www.yourdomain.me
```

**Follow prompts:**
1. Enter email address
2. Agree to Terms of Service
3. Choose: Redirect HTTP to HTTPS → Yes (option 2)

### C. Test Auto-renewal

```bash
sudo certbot renew --dry-run
```

### D. Update .env with HTTPS URL

```bash
cd ~/a6-hikebook
nano .env
```

Change:
```env
APP_URL=https://yourdomain.me
```

Restart app:
```bash
pm2 restart hikebook
```

---

## 9️⃣ Final Testing

### ✅ Test Checklist

- [ ] Open `https://yourdomain.me` → Homepage loads
- [ ] Register new account → Success
- [ ] Login → Redirects to dashboard
- [ ] Create booking → Booking saved
- [ ] View "My Bookings" → Shows bookings
- [ ] Edit booking → Updates successfully
- [ ] Delete booking → Removes from list
- [ ] Logout → Redirects to login
- [ ] SSL certificate → Green padlock in browser

### 🐛 Troubleshooting

**App not loading:**
```bash
pm2 logs hikebook  # Check logs
pm2 status         # Check if running
```

**Nginx errors:**
```bash
sudo nginx -t                    # Test config
sudo tail -f /var/log/nginx/error.log
```

**Database errors:**
```bash
cd ~/a6-hikebook
npx prisma studio  # Opens database viewer on port 5555
```

**Check if ports are open:**
```bash
sudo netstat -tulpn | grep LISTEN
```

---

## 🔄 Update Deployed App

When you make changes locally:

### On Local Computer:
```bash
git add .
git commit -m "Update features"
git push origin main
```

### On Azure VM:
```bash
cd ~/a6-hikebook
git pull origin main
npm install  # If package.json changed
npx prisma migrate deploy  # If schema changed
pm2 restart hikebook
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
pm2 monit  # Real-time monitoring
pm2 logs hikebook --lines 100  # View last 100 log lines
```

### Check Resource Usage

```bash
htop  # or
top
```

### View Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🎉 Deployment Complete!

Your HikeBook app is now live at: `https://yourdomain.me`

**Architecture:**
```
User Browser
    ↓
DNS (yourdomain.me) → Azure VM IP
    ↓
Nginx :80/:443 (SSL)
    ↓
Node.js :3000 (PM2)
    ↓
SQLite Database
```

---

## 📝 Important Notes

1. **Backup Database Regularly:**
   ```bash
   cp ~/a6-hikebook/prisma/production.db ~/backups/production-$(date +%Y%m%d).db
   ```

2. **Monitor Disk Space:**
   ```bash
   df -h
   ```

3. **Keep System Updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **SSL Certificate Auto-renewal:**
   - Certbot auto-renews every 60 days
   - Check: `sudo certbot renew --dry-run`

---

## 🆘 Need Help?

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **Azure Documentation**: https://learn.microsoft.com/azure/

---

**Good luck with your deployment! 🚀**
