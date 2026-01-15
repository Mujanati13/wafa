# Quick Deployment Guide

## On Your VPS (Ubuntu/Debian)

### 1. Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Clone your repository
cd /opt
sudo git clone <your-repo-url> wafa
cd wafa
```

### 2. Configure Environment

```bash
# Backend environment
sudo cp wafa-backend/.env.production.example wafa-backend/.env.production
sudo nano wafa-backend/.env.production
```

**Edit these key values:**
- `SESSION_SECRET` - Generate: `openssl rand -base64 32`
- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `EMAIL_USER` / `EMAIL_PASSWORD` - Your Gmail & app password
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` - From PayPal dashboard
- `CLOUDINARY_*` - From Cloudinary dashboard

```bash
# Frontend environment
sudo cp wafa-frentend/.env.production.example wafa-frentend/.env.production
# Should be pre-configured with correct URLs
```

### 3. Firebase Setup

```bash
# Copy your Firebase service account JSON
sudo nano wafa-backend/firebase-service-account.json
# Paste the JSON content from Firebase Console
```

### 4. MongoDB Credentials

```bash
# Edit docker-compose.yml
sudo nano docker-compose.yml

# Change these lines (in the mongodb service):
MONGO_INITDB_ROOT_USERNAME: admin        # Change to secure username
MONGO_INITDB_ROOT_PASSWORD: changeme123  # Change to secure password

# Also update in backend environment section:
MONGO_URL=mongodb://USERNAME:PASSWORD@mongodb:27017/wafa?authSource=admin
```

### 5. Deploy!

```bash
# Make script executable
sudo chmod +x deploy-vps.sh
sudo chmod +x scripts/*.sh

# Run deployment
sudo ./deploy-vps.sh
```

The script will:
1. Install Docker if needed
2. Check DNS configuration
3. Build all containers
4. Obtain SSL certificates
5. Start all services
6. Configure auto-renewal

### 6. Verify Deployment

```bash
# Check service status
docker-compose ps

# Run health check
./scripts/health-check.sh

# View logs
./scripts/logs.sh
```

Visit:
- Frontend: https://imrs-qcm.com
- Backend: https://backend.imrs-qcm.com/api/v1/test

## DNS Configuration (Before Deployment)

In your domain registrar (Namecheap, GoDaddy, etc.):

```
Type    Name        Value           TTL
A       @           YOUR_VPS_IP     300
A       www         YOUR_VPS_IP     300
A       backend     YOUR_VPS_IP     300
```

Wait 5-10 minutes for DNS propagation, then verify:

```bash
dig imrs-qcm.com +short
dig www.imrs-qcm.com +short
dig backend.imrs-qcm.com +short
```

## Common Issues

### Issue: SSL certificate fails
**Solution**: Ensure DNS is propagated and ports 80/443 are open
```bash
sudo ufw allow 80
sudo ufw allow 443
```

### Issue: Backend can't connect to MongoDB
**Solution**: Check credentials match in docker-compose.yml and .env.production

### Issue: Frontend shows connection refused
**Solution**: Check CORS settings in backend .env.production
```bash
CORS_ORIGIN=https://imrs-qcm.com,https://www.imrs-qcm.com
```

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart service
docker-compose restart backend

# Rebuild after code changes
git pull
docker-compose up -d --build

# Backup database
./scripts/backup-db.sh

# Check SSL expiry
docker-compose run --rm certbot certificates
```

## Security Reminders

1. ✅ Change MongoDB password
2. ✅ Generate unique SESSION_SECRET & JWT_SECRET
3. ✅ Use Gmail app passwords (not regular password)
4. ✅ Keep firebase-service-account.json secure
5. ✅ Set PayPal to LIVE mode
6. ✅ Enable UFW firewall
7. ✅ Set up regular backups

```bash
# Enable firewall
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Need Help?

Run diagnostics:
```bash
./scripts/health-check.sh
docker-compose ps
docker stats
```

Check logs:
```bash
./scripts/logs.sh
```
