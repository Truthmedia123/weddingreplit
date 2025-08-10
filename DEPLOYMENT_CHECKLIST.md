# Production Deployment Checklist

## Pre-Deployment Checklist

### 🔧 Environment Setup
- [ ] **Environment Variables Configured**
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (PostgreSQL recommended for production)
  - [ ] `JWT_SECRET` (strong, unique secret)
  - [ ] `SESSION_SECRET` (strong, unique secret)
  - [ ] `SENTRY_DSN` (error monitoring)
  - [ ] `GOOGLE_ANALYTICS_ID`
  - [ ] `SITE_URL` (production domain)
  - [ ] `SLACK_WEBHOOK_URL` (for alerts)

- [ ] **Database Setup**
  - [ ] Production database created and accessible
  - [ ] Database migrations run successfully
  - [ ] Database backup strategy in place
  - [ ] Connection pooling configured
  - [ ] Database monitoring enabled

- [ ] **Security Configuration**
  - [ ] SSL/TLS certificates installed and valid
  - [ ] Security headers configured (HSTS, CSP, etc.)
  - [ ] Rate limiting enabled
  - [ ] CORS properly configured
  - [ ] Sensitive data encrypted
  - [ ] API keys secured and rotated

### 🧪 Testing & Quality Assurance
- [ ] **Automated Tests**
  - [ ] All unit tests passing (`npm test`)
  - [ ] Integration tests passing
  - [ ] End-to-end tests completed
  - [ ] Performance tests within acceptable limits
  - [ ] Security scans completed

- [ ] **Manual Testing**
  - [ ] Critical user flows tested:
    - [ ] Vendor browsing and search
    - [ ] Vendor profile viewing
    - [ ] RSVP creation and submission
    - [ ] Wedding invitation generation
    - [ ] Contact form submissions
    - [ ] Business listing submissions
  - [ ] Cross-browser compatibility verified
  - [ ] Mobile responsiveness confirmed
  - [ ] Accessibility compliance checked

- [ ] **Production Testing Script**
  - [ ] Run `node scripts/production-tests.js`
  - [ ] All health checks passing
  - [ ] Performance benchmarks met
  - [ ] Error handling verified

### 📊 Monitoring & Observability
- [ ] **Error Monitoring**
  - [ ] Sentry configured and tested
  - [ ] Error alerts set up
  - [ ] Log aggregation configured
  - [ ] Performance monitoring active

- [ ] **Health Monitoring**
  - [ ] Health check endpoints responding
  - [ ] Monitoring dashboard accessible
  - [ ] Alerting rules configured
  - [ ] Uptime monitoring enabled

- [ ] **Analytics & SEO**
  - [ ] Google Analytics configured
  - [ ] Sitemap.xml generating correctly
  - [ ] Robots.txt configured
  - [ ] Meta tags and structured data implemented
  - [ ] Social media sharing tested

### 🚀 Infrastructure & Deployment
- [ ] **Server Configuration**
  - [ ] Production server provisioned
  - [ ] Load balancer configured (if applicable)
  - [ ] CDN configured for static assets
  - [ ] Backup and disaster recovery plan
  - [ ] Scaling policies defined

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions workflows tested
  - [ ] Staging environment deployed successfully
  - [ ] Production deployment pipeline verified
  - [ ] Rollback procedures tested

## Deployment Steps

### 1. Pre-Deployment
```bash
# 1. Run final tests
npm run test
npm run test:integration
node scripts/production-tests.js

# 2. Build production assets
npm run build

# 3. Database migrations (if needed)
npm run db:migrate

# 4. Backup current production (if updating)
# Follow your backup procedures
```

### 2. Deployment
```bash
# Option A: Automated deployment via GitHub Actions
git push origin main

# Option B: Manual deployment
npm run deploy:production

# Option C: Docker deployment
docker build -t wedding-app .
docker run -d --env-file .env.production wedding-app
```

### 3. Post-Deployment Verification
```bash
# 1. Health checks
curl https://your-domain.com/health
curl https://your-domain.com/health/ready
curl https://your-domain.com/health/live

# 2. Critical functionality
curl https://your-domain.com/api/vendors
curl https://your-domain.com/sitemap.xml

# 3. Run production tests
TEST_URL=https://your-domain.com node scripts/production-tests.js
```

## Post-Deployment Checklist

### ✅ Immediate Verification (0-15 minutes)
- [ ] **Application Status**
  - [ ] Application starts successfully
  - [ ] Health endpoints responding (200 OK)
  - [ ] Database connectivity confirmed
  - [ ] No critical errors in logs

- [ ] **Core Functionality**
  - [ ] Homepage loads correctly
  - [ ] Vendor listings display
  - [ ] Search functionality works
  - [ ] RSVP forms functional
  - [ ] Invitation generator works

- [ ] **Monitoring**
  - [ ] Error monitoring receiving data
  - [ ] Performance metrics collecting
  - [ ] Alerts configured and active

### 🔍 Extended Verification (15-60 minutes)
- [ ] **Performance**
  - [ ] Page load times acceptable (<3s)
  - [ ] API response times normal (<1s)
  - [ ] Memory usage stable
  - [ ] No memory leaks detected

- [ ] **User Experience**
  - [ ] All pages accessible
  - [ ] Forms submitting correctly
  - [ ] Images loading properly
  - [ ] Mobile experience optimal

- [ ] **SEO & Analytics**
  - [ ] Google Analytics tracking
  - [ ] Search engine crawling enabled
  - [ ] Social media sharing working

### 📈 Ongoing Monitoring (1-24 hours)
- [ ] **System Health**
  - [ ] No error spikes
  - [ ] Performance metrics stable
  - [ ] User engagement normal
  - [ ] Conversion rates maintained

- [ ] **Business Metrics**
  - [ ] Vendor inquiries functioning
  - [ ] RSVP submissions working
  - [ ] Contact forms operational
  - [ ] Invitation generation stable

## Rollback Procedures

### 🚨 When to Rollback
- Critical functionality broken
- Error rate > 5%
- Performance degradation > 50%
- Security vulnerability detected
- Database corruption

### 🔄 Rollback Steps

#### Immediate Rollback (< 5 minutes)
```bash
# 1. Revert to previous deployment
git revert HEAD
git push origin main

# 2. Or use deployment platform rollback
# Vercel: vercel --prod --rollback
# Heroku: heroku rollback
# Docker: docker run previous-image-tag
```

#### Database Rollback (if needed)
```bash
# 1. Stop application
systemctl stop wedding-app

# 2. Restore database backup
pg_restore -d wedding_db backup_file.sql

# 3. Revert database migrations
npm run db:rollback

# 4. Start application with previous version
systemctl start wedding-app
```

#### Full System Rollback
```bash
# 1. Switch to maintenance mode
echo "Maintenance mode enabled" > public/maintenance.html

# 2. Restore full system backup
# Follow your backup restoration procedures

# 3. Verify system integrity
node scripts/production-tests.js

# 4. Disable maintenance mode
rm public/maintenance.html
```

### 📋 Post-Rollback Actions
- [ ] Verify all systems operational
- [ ] Check error rates normalized
- [ ] Confirm user experience restored
- [ ] Document incident and root cause
- [ ] Plan fix for next deployment
- [ ] Notify stakeholders of resolution

## Emergency Contacts

### 🚨 Incident Response Team
- **Technical Lead**: [Your Name] - [Phone] - [Email]
- **DevOps Engineer**: [Name] - [Phone] - [Email]
- **Database Admin**: [Name] - [Phone] - [Email]
- **Business Owner**: [Name] - [Phone] - [Email]

### 📞 External Services
- **Hosting Provider**: [Support Contact]
- **Database Provider**: [Support Contact]
- **CDN Provider**: [Support Contact]
- **Monitoring Service**: [Support Contact]

## Documentation Links
- [Architecture Overview](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Monitoring Setup](./MONITORING_SETUP.md)
- [Testing Guide](./TESTING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Last Updated**: [Date]
**Version**: 1.0
**Next Review**: [Date + 3 months]