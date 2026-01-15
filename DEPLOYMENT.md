# WAFA Project - VPS Deployment with Docker

Complete deployment solution for the WAFA e-learning platform using Docker, Nginx reverse proxy, and automatic SSL certificates.

## 🚀 Quick Start

### Prerequisites

1. **VPS Server** with:
   - Ubuntu 20.04+ or Debian 10+
   - At least 2GB RAM
   - 20GB+ storage
   - Root or sudo access

2. **Domain Configuration**:
   - `imrs-qcm.com` → Your VPS IP
   - `www.imrs-qcm.com` → Your VPS IP
   - `backend.imrs-qcm.com` → Your VPS IP

3. **Required Services**:
   - Email service (Gmail recommended for nodemailer)
   - Firebase project with service account
   - PayPal developer account (for payments)
   - Cloudinary account (for image uploads)

### Deployment Steps

1. **Clone repository to your VPS**:
   ```bash
   git clone <your-repo-url> /opt/wafa
   cd /opt/wafa
   ```

2. **Configure environment variables**:
   ```bash
   # Backend
   cp wafa-backend/.env.production.example wafa-backend/.env.production
   nano wafa-backend/.env.production  # Edit with your values
   
   # Frontend  
   cp wafa-frentend/.env.production.example wafa-frentend/.env.production
   nano wafa-frentend/.env.production  # Edit with your values
   ```

3. **Add Firebase service account**:
   ```bash
   # Place your firebase-service-account.json in wafa-backend/
   nano wafa-backend/firebase-service-account.json
   ```

4. **Set MongoDB credentials** (in docker-compose.yml):
   ```bash
   nano docker-compose.yml
   # Update MONGO_ROOT_USERNAME and MONGO_ROOT_PASSWORD
   ```

5. **Run deployment**:
   ```bash
   chmod +x deploy-vps.sh
   sudo ./deploy-vps.sh
   ```

The script will:
- ✅ Install Docker & Docker Compose (if needed)
- ✅ Build all Docker images
- ✅ Set up MongoDB with persistence
- ✅ Obtain SSL certificates via Let's Encrypt
- ✅ Configure Nginx reverse proxy
- ✅ Start all services
- ✅ Set up automatic SSL renewal

## 📁 Project Structure

```
wafa/
├── docker-compose.yml          # Main Docker orchestration
├── deploy-vps.sh              # Automated deployment script
├── .gitignore                 # Git ignore rules
│
├── wafa-backend/              # Node.js Backend API
│   ├── Dockerfile             # Backend container
│   ├── .env.production        # Production environment (DO NOT COMMIT)
│   └── .env.production.example # Environment template
│
├── wafa-frentend/             # React Frontend
│   ├── Dockerfile             # Multi-stage frontend build
│   ├── nginx.conf             # Frontend nginx config
│   ├── .env.production        # Production environment (DO NOT COMMIT)
│   └── .env.production.example # Environment template
│
├── nginx/                     # Reverse Proxy Configuration
│   └── nginx.conf             # Main nginx config with SSL
│
├── scripts/                   # Maintenance Scripts
│   ├── ssl-renew.sh          # SSL certificate renewal
│   ├── backup-db.sh          # MongoDB backup
│   ├── restore-db.sh         # MongoDB restore
│   ├── logs.sh               # View service logs
│   └── health-check.sh       # Service health check
│
├── certbot/                   # SSL Certificates (auto-generated)
│   ├── conf/                 # Certificate files
│   └── www/                  # ACME challenge files
│
└── backups/                   # Database backups (auto-generated)
    └── mongodb/              # MongoDB dump files
```

## 🛠️ Management Commands

### Service Management

```bash
# View all services status
docker-compose ps

# View logs
./scripts/logs.sh              # Interactive log viewer
docker-compose logs -f backend # Specific service
docker-compose logs -f         # All services

# Restart services
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx

# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Rebuild and restart
docker-compose up -d --build
```

### Database Operations

```bash
# Backup database
./scripts/backup-db.sh

# Restore database
./scripts/restore-db.sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p changeme123
```

### SSL Certificates

```bash
# Manual renewal
./scripts/ssl-renew.sh

# Check certificate status
docker-compose run --rm certbot certificates

# Auto-renewal is configured via cron (runs twice daily)
```

### Health Checks

```bash
# Run health check
./scripts/health-check.sh

# Check specific service
docker-compose exec backend wget -qO- http://localhost:5010/api/v1/test
```

## 🔒 Security Checklist

- [ ] Changed MongoDB default credentials in `docker-compose.yml`
- [ ] Set strong `SESSION_SECRET` and `JWT_SECRET` in `.env.production`
- [ ] Never commit `.env.production` files
- [ ] Firebase service account file has restricted permissions
- [ ] PayPal is in LIVE mode for production
- [ ] Email credentials use app-specific passwords
- [ ] Regular database backups are scheduled
- [ ] Server firewall allows only ports 80, 443, and SSH
- [ ] SSH uses key-based authentication (not passwords)

## 🌐 URLs

- **Frontend**: https://imrs-qcm.com
- **Backend API**: https://backend.imrs-qcm.com
- **API Test**: https://backend.imrs-qcm.com/api/v1/test

## 📊 Monitoring

Monitor your application health:

```bash
# Check all services
./scripts/health-check.sh

# Monitor resource usage
docker stats

# Check disk space
df -h

# View system logs
docker-compose logs -f --tail=100
```

## 🔄 Updating the Application

```bash
# Pull latest code
cd /opt/wafa
git pull

# Rebuild and restart
docker-compose up -d --build

# Check logs for any issues
docker-compose logs -f
```

## 🆘 Troubleshooting

### Backend not starting

```bash
# Check backend logs
docker-compose logs backend

# Common issues:
# - MongoDB connection failed → Check MONGO_URL in .env.production
# - Firebase init failed → Verify firebase-service-account.json exists
# - Port already in use → Check if another service uses port 5010
```

### Frontend not loading

```bash
# Check frontend logs
docker-compose logs frontend

# Check nginx logs
docker-compose logs nginx

# Verify build succeeded
docker-compose exec frontend ls -la /usr/share/nginx/html
```

### SSL certificate issues

```bash
# Check certificate status
docker-compose run --rm certbot certificates

# Re-obtain certificates
docker-compose down
rm -rf certbot/conf/live certbot/conf/archive
sudo ./deploy-vps.sh  # Re-run deployment
```

### Database connection issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh -u admin -p changeme123

# Restart MongoDB
docker-compose restart mongodb
```

## 📝 Environment Variables

### Backend (.env.production)

Required variables:
- `MONGO_URL` - MongoDB connection string
- `SESSION_SECRET` - Session encryption key
- `JWT_SECRET` - JWT token secret
- `FRONTEND_URL` - Frontend URL for CORS
- `EMAIL_USER` / `EMAIL_PASSWORD` - Email service credentials
- Firebase credentials (file or env vars)
- PayPal credentials
- Cloudinary credentials

### Frontend (.env.production)

Required variables:
- `VITE_API_URL` - Backend API URL
- Firebase config variables (from Firebase Console)

## 🔐 Backup Strategy

Automated backups run via the `backup-db.sh` script:

- Retention: 7 days
- Compression: gzip
- Location: `./backups/mongodb/`

Set up daily backups:

```bash
# Add to crontab
crontab -e

# Add line (runs daily at 2 AM):
0 2 * * * /opt/wafa/scripts/backup-db.sh >> /var/log/wafa-backup.log 2>&1
```

## 📞 Support

For issues or questions:
1. Check logs: `./scripts/logs.sh`
2. Run health check: `./scripts/health-check.sh`
3. Review Docker status: `docker-compose ps`
4. Check system resources: `docker stats`

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team Here]
