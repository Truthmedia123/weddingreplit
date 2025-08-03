# Comprehensive Monitoring & CI/CD Setup

This document outlines the complete monitoring and CI/CD infrastructure implemented for the wedding platform.

## 🏗️ Architecture Overview

### 1. CI/CD Pipeline
- **GitHub Actions workflows** for automated testing, quality gates, and deployment
- **Multi-environment support** (staging, production)
- **Automated health checks** and monitoring
- **Security scanning** and dependency auditing

### 2. Health Monitoring
- **Health check endpoints** (`/health`, `/health/ready`, `/health/live`)
- **Prometheus metrics** endpoint (`/metrics`)
- **Real-time system monitoring** (memory, CPU, disk, database)
- **Automated alerting** via Slack integration

### 3. Performance Monitoring
- **Request tracking** with detailed metrics
- **Database operation monitoring**
- **Performance bottleneck detection**
- **Real-time performance dashboard**

### 4. Test Monitoring
- **Flaky test detection**
- **Test execution time tracking**
- **Coverage trend analysis**
- **Test health reporting**

## 📁 File Structure

```
.github/workflows/
├── ci.yml                    # Main CI/CD pipeline
└── monitoring.yml            # Health checks and monitoring

server/
├── health.ts                 # Health check endpoints
└── monitoring/
    └── performance.ts        # Performance monitoring utilities

client/src/pages/
└── MonitoringDashboard.tsx   # Real-time monitoring dashboard

scripts/
└── test-monitoring.js        # Test monitoring utilities

test-results/                 # Generated test reports
test-metrics/                 # Performance and health metrics
performance-results/          # Performance benchmark results
```

## 🚀 Getting Started

### 1. Environment Setup

Set up the following environment variables in your GitHub repository:

```bash
# Deployment URLs
STAGING_URL=https://your-staging-url.com
PROD_URL=https://your-production-url.com

# Slack Integration
SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Lighthouse CI (optional)
LHCI_GITHUB_APP_TOKEN=your-lighthouse-token
```

### 2. Local Development

Run health checks locally:
```bash
# Check application health
npm run health-check:local

# Monitor test performance
npm run test:timing-report

# Detect flaky tests
npm run test:flaky-detection

# Generate comprehensive health report
npm run test:health-report
```

### 3. Monitoring Dashboard

Access the monitoring dashboard at `/monitoring` to view:
- Real-time system health
- Performance metrics
- Request statistics
- Error rates and trends

## 🔍 Health Check Endpoints

### `/health`
Comprehensive health check including:
- Database connectivity
- Memory usage
- Disk I/O operations
- Dependency availability
- System metrics

**Response Format:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123456,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": { "status": "pass", "message": "...", "duration": 10 },
    "memory": { "status": "pass", "message": "...", "duration": 5 },
    "disk": { "status": "pass", "message": "...", "duration": 15 },
    "dependencies": { "status": "pass", "message": "...", "duration": 8 }
  },
  "metrics": {
    "responseTime": 25.5,
    "memoryUsage": { "heapUsed": 50000000, "heapTotal": 100000000 },
    "cpuUsage": { "user": 1000, "system": 500 },
    "systemLoad": [0.5, 0.4, 0.3]
  }
}
```

### `/health/ready`
Quick readiness check for load balancers:
```json
{
  "status": "ready|not ready",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "checks": { "database": { "status": "pass" } }
}
```

### `/health/live`
Simple liveness check:
```json
{
  "status": "alive",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123456,
  "pid": 12345
}
```

### `/metrics`
Prometheus-compatible metrics:
```
# HELP app_health_status Application health status
# TYPE app_health_status gauge
app_health_status{environment="production",version="1.0.0"} 2

# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds counter
app_uptime_seconds 123456

# HELP app_response_time_ms Health check response time
# TYPE app_response_time_ms gauge
app_response_time_ms 25.5
```

## 📊 Performance Monitoring

### Request Tracking
All HTTP requests are automatically tracked with:
- Response time
- Status code
- User agent
- IP address
- Request path and method

### Database Monitoring
Database operations are monitored for:
- Query execution time
- Connection health
- Error rates

### Performance Statistics API
Access performance data via `/api/monitoring/performance`:
```json
{
  "summary": {
    "totalMetrics": 1000,
    "totalRequests": 5000,
    "recentMetrics": 50,
    "recentRequests": 100
  },
  "performance": {
    "last5Minutes": {
      "count": 50,
      "avg": 125.5,
      "min": 10,
      "max": 500,
      "p95": 300,
      "p99": 450
    }
  },
  "requests": {
    "last5Minutes": {
      "count": 100,
      "avg": 150.2,
      "statusCodes": { "200": 95, "404": 3, "500": 2 }
    }
  },
  "slowestOperations": [...],
  "errorRate": 2.5
}
```

## 🧪 Test Monitoring

### Flaky Test Detection
Automatically detect unreliable tests:
```bash
npm run test:flaky-detection
```

This runs tests multiple times and identifies tests with inconsistent results.

### Performance Tracking
Monitor test execution times:
```bash
npm run test:timing-report
```

Generates reports on:
- Total test execution time
- Average test duration
- Slowest tests
- Performance trends

### Health Reporting
Comprehensive test suite health:
```bash
npm run test:health-report
```

Includes:
- Test stability metrics
- Performance analysis
- Coverage trends
- Actionable recommendations

## 🔄 CI/CD Pipeline

### Continuous Integration
The CI pipeline (`ci.yml`) includes:

1. **Test Suite** - Runs all tests with coverage
2. **Integration Tests** - API and database tests
3. **Performance Tests** - Benchmark critical operations
4. **Security Scan** - Dependency vulnerability check
5. **Quality Gates** - Coverage and performance thresholds

### Quality Gates
- **Coverage Threshold**: 80% minimum
- **Test Stability**: No failing tests
- **Performance**: Response times within limits
- **Security**: No high/critical vulnerabilities

### Deployment Pipeline
- **Staging**: Auto-deploy on `develop` branch
- **Production**: Auto-deploy on `main` branch with manual approval
- **Smoke Tests**: Post-deployment health verification
- **Rollback**: Automatic rollback on health check failures

### Monitoring Pipeline
The monitoring workflow (`monitoring.yml`) runs:
- **Health checks** every 15 minutes
- **Performance monitoring** continuously
- **SSL certificate validation**
- **Lighthouse performance audits**

## 🚨 Alerting

### Slack Integration
Alerts are sent to Slack channels for:
- **Health check failures** → `#alerts`
- **Deployment status** → `#deployments`
- **Performance degradation** → `#monitoring`

### Alert Conditions
- Health status changes to `degraded` or `unhealthy`
- Error rate exceeds 5%
- Response time P95 exceeds 1000ms
- Memory usage exceeds 90%
- Test failures in CI/CD

## 📈 Metrics and Dashboards

### Real-time Dashboard
The monitoring dashboard provides:
- System health overview
- Performance metrics
- Request statistics
- Error tracking
- Resource utilization

### Key Metrics
- **Availability**: Uptime percentage
- **Performance**: Response times (avg, P95, P99)
- **Reliability**: Error rates and success rates
- **Capacity**: Memory, CPU, and disk usage
- **Quality**: Test coverage and stability

## 🔧 Configuration

### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=your-database-url

# Monitoring
HEALTH_CHECK_INTERVAL=30000
PERFORMANCE_RETENTION_HOURS=24
METRICS_RETENTION_DAYS=7

# Alerting
SLACK_WEBHOOK_URL=your-slack-webhook
ALERT_THRESHOLD_ERROR_RATE=5
ALERT_THRESHOLD_RESPONSE_TIME=1000
```

### Customization
- Modify health check thresholds in `server/health.ts`
- Adjust performance monitoring in `server/monitoring/performance.ts`
- Update CI/CD pipeline in `.github/workflows/`
- Customize dashboard in `client/src/pages/MonitoringDashboard.tsx`

## 🛠️ Troubleshooting

### Common Issues

1. **Health checks failing**
   - Check database connectivity
   - Verify disk space and permissions
   - Review memory usage

2. **Performance degradation**
   - Analyze slow operations in dashboard
   - Check database query performance
   - Review system resource usage

3. **CI/CD pipeline failures**
   - Check test stability
   - Verify environment variables
   - Review deployment logs

### Debug Commands
```bash
# Check application logs
npm run logs

# Test health endpoints locally
curl http://localhost:3000/health

# Run performance analysis
npm run monitor:performance

# Generate debug report
npm run test:health-report
```

## 📚 Best Practices

### Monitoring
- Set up alerts for critical metrics
- Regularly review performance trends
- Monitor error rates and patterns
- Keep health check endpoints lightweight

### Testing
- Fix flaky tests immediately
- Monitor test execution times
- Maintain high test coverage
- Use performance benchmarks

### CI/CD
- Keep pipelines fast and reliable
- Use quality gates effectively
- Automate deployment processes
- Monitor deployment success rates

### Performance
- Set performance budgets
- Monitor Core Web Vitals
- Optimize slow operations
- Use caching strategically

This comprehensive monitoring setup provides visibility into system health, performance, and reliability, enabling proactive issue detection and resolution.