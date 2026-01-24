# DevPaste Monitoring Guide

Complete observability stack for DevPaste with metrics, logs, and dashboards.

## 📊 Monitoring Stack

DevPaste uses a production-grade monitoring stack:

| Component | Purpose | Port | URL |
|-----------|---------|------|-----|
| **Prometheus** | Metrics storage & queries | 9090 | http://localhost:9090 |
| **Grafana** | Dashboards & visualization | 3001 | http://localhost:3001 |
| **Loki** | Log aggregation | 3100 | http://localhost:3100 |
| **Promtail** | Log collector | 9080 | - |

**Credentials:**
- Grafana: `admin` / (see `.env` file for `GF_SECURITY_ADMIN_PASSWORD`)

---

## 🎯 What We Monitor

### Backend Metrics (Prometheus)

#### Paste Metrics
- `pastes_created_total` - Total pastes created (by language, password, private, burn-after-read)
- `pastes_viewed_total` - Total paste views
- `pastes_by_language_total` - Pastes by programming language
- `password_protected_pastes_total` - Password-protected pastes count
- `burn_after_read_pastes_total` - Burn-after-read pastes count
- `private_pastes_total` - Private pastes count

#### HTTP Metrics
- `http_requests_total` - Total HTTP requests (by method, route, status)
- `http_request_duration_seconds` - Request duration histogram
- `http_requests_in_progress` - Active requests (gauge)

#### Database Metrics
- `db_queries_total` - Total database queries (by operation, table)
- `db_query_duration_seconds` - Query duration histogram

#### Cache Metrics
- `cache_hits_total` - Cache hit count
- `cache_misses_total` - Cache miss count

#### Error Metrics
- `errors_total` - Total errors (by type, route)

#### System Metrics (Auto-collected)
- `process_cpu_user_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_heap_size_used_bytes` - Heap memory
- `nodejs_eventloop_lag_seconds` - Event loop lag

### Application Logs (Loki)

Logs are collected in three categories:

- **App Logs** (`app-YYYY-MM-DD.log`) - All application activity
- **Error Logs** (`error-YYYY-MM-DD.log`) - Errors only
- **Info Logs** (`info-YYYY-MM-DD.log`) - Info level and above

**Log Labels:**
- `job=devpaste` - Application identifier
- `service=backend` - Service name
- `log_type=app|error|info` - Log category

---

## 🚀 Quick Start

### 1. Access Dashboards

**Grafana** (Main Dashboard):
```
http://localhost:3001
```
Login: `admin` / (password from `.env`)

**Prometheus** (Raw Metrics):
```
http://localhost:9090
```

### 2. View Metrics

1. Open Grafana
2. Go to **Dashboards** → **DevPaste Metrics**
3. See real-time metrics and graphs

### 3. View Logs

1. Open Grafana
2. Click **🧭 Explore** (compass icon)
3. Select **Loki** datasource
4. Enter query: `{job="devpaste"}`
5. Click **Run query**

---

## 📈 Useful Metrics Queries

### Usage Metrics

**Total pastes created:**
```promql
sum(pastes_created_total)
```

**Pastes created in last hour:**
```promql
increase(pastes_created_total[1h])
```

**Paste creation rate (per minute):**
```promql
rate(pastes_created_total[5m]) * 60
```

**Total views:**
```promql
sum(pastes_viewed_total)
```

**Most popular languages (top 5):**
```promql
topk(5, sum by(language) (pastes_created_total))
```

### Performance Metrics

**Request rate (requests/second):**
```promql
rate(http_requests_total[5m])
```

**95th percentile response time:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Average response time:**
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

**Database query duration (p95):**
```promql
histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))
```

### Error Metrics

**Error rate:**
```promql
rate(errors_total[5m])
```

**Error count (last hour):**
```promql
increase(errors_total[1h])
```

**4xx vs 5xx errors:**
```promql
sum by(status_code) (rate(http_requests_total{status_code=~"[45].."}[5m]))
```

### System Health

**Cache hit rate (%):**
```promql
100 * sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
```

**Memory usage (MB):**
```promql
process_resident_memory_bytes / 1024 / 1024
```

**CPU usage (%):**
```promql
rate(process_cpu_user_seconds_total[5m]) * 100
```

**Active requests:**
```promql
sum(http_requests_in_progress)
```

### Feature Usage

**Password-protected pastes:**
```promql
sum(password_protected_pastes_total)
```

**Burn-after-read pastes:**
```promql
sum(burn_after_read_pastes_total)
```

**Private pastes:**
```promql
sum(private_pastes_total)
```

**Feature usage percentage:**
```promql
100 * sum(password_protected_pastes_total) / sum(pastes_created_total)
```

---

## 🔍 Useful Log Queries (LogQL)

### Basic Queries

**All logs:**
```logql
{job="devpaste"}
```

**Error logs only:**
```logql
{job="devpaste", log_type="error"}
```

**Application logs only:**
```logql
{job="devpaste", log_type="app"}
```

### Search Queries

**Search for "Paste Created":**
```logql
{job="devpaste"} |= "Paste Created"
```

**Search for specific paste ID:**
```logql
{job="devpaste"} |= "abc12345"
```

**Find password attempts:**
```logql
{job="devpaste"} |= "password"
```

**Exclude debug logs:**
```logql
{job="devpaste"} != "debug"
```

**Multiple filters:**
```logql
{job="devpaste", log_type="app"} |= "error" != "debug"
```

### Aggregation Queries

**Count paste creations (last hour):**
```logql
count_over_time({job="devpaste"} |= "Paste Created" [1h])
```

**Error rate:**
```logql
rate({job="devpaste", log_type="error"} [5m])
```

**Count by operation:**
```logql
sum by (context) (count_over_time({job="devpaste"} [1h]))
```

### Advanced Queries

**JSON parsing (if needed):**
```logql
{job="devpaste"} | json | level="error"
```

**Regex matching:**
```logql
{job="devpaste"} |~ "paste.*created"
```

**Extract fields:**
```logql
{job="devpaste"} | json message, level, context
```

---

## 📊 Creating Dashboards

### Create a New Dashboard

1. Open Grafana
2. Click **+** → **Dashboard**
3. Click **Add visualization**
4. Select datasource (**Prometheus** or **Loki**)
5. Enter your query
6. Choose visualization type
7. Configure panel options
8. Click **Apply**
9. Click **💾 Save dashboard**

### Example: Usage Overview Panel

**Panel 1 - Total Pastes (Stat)**
- Datasource: Prometheus
- Query: `sum(pastes_created_total)`
- Visualization: Stat
- Title: "Total Pastes"

**Panel 2 - Language Breakdown (Pie Chart)**
- Datasource: Prometheus
- Query: `sum by(language) (pastes_created_total)`
- Visualization: Pie chart
- Title: "Pastes by Language"

**Panel 3 - Request Rate (Time Series)**
- Datasource: Prometheus
- Query: `rate(http_requests_total[5m])`
- Visualization: Time series
- Title: "Request Rate"

**Panel 4 - Recent Errors (Logs)**
- Datasource: Loki
- Query: `{job="devpaste", log_type="error"}`
- Visualization: Logs
- Title: "Recent Errors"

---

## 🔧 Configuration

### Prometheus

**Config:** `monitoring/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'devpaste-backend'
    static_configs:
      - targets: ['backend:4000']
    metrics_path: '/api/metrics'
```

**Data Retention:** 30 days (configurable in docker-compose)

### Loki

**Config:** `monitoring/loki/loki-config.yml`

- Storage: Filesystem
- Retention: Unlimited (configure if needed)
- Schema: v13 (tsdb)

### Promtail

**Config:** `monitoring/promtail/promtail-config.yml`

Collects logs from:
- `/logs/app-*.log`
- `/logs/error-*.log`
- `/logs/info-*.log`

### Log Rotation

Logs automatically rotate:
- **Error logs:** 14 days retention
- **App logs:** 7 days retention
- **Info logs:** 3 days retention
- **Max file size:** 20MB

---

## 🛠️ Maintenance

### View Logs

**Backend logs:**
```bash
docker-compose logs backend
```

**Prometheus logs:**
```bash
docker-compose logs prometheus
```

**Loki logs:**
```bash
docker-compose logs loki
```

**Promtail logs:**
```bash
docker-compose logs promtail
```

### Restart Services

**Restart all monitoring:**
```bash
docker-compose restart prometheus grafana loki promtail
```

**Restart specific service:**
```bash
docker-compose restart grafana
```

### Check Service Status

```bash
docker-compose ps
```

### Access Metrics Endpoint

**Backend metrics (Prometheus format):**
```bash
curl http://localhost:4000/api/metrics
```

### Clear Old Data

**Remove Prometheus data:**
```bash
docker-compose down
docker volume rm devpaste_prometheus-data
docker-compose up -d
```

**Remove Loki data:**
```bash
docker-compose down
docker volume rm devpaste_loki-data
docker-compose up -d
```

**Remove old log files:**
```bash
# Delete logs older than 7 days
find logs/ -name "*.log" -mtime +7 -delete
```

---

## 📁 File Structure

```
devpaste/
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml          # Prometheus configuration
│   ├── loki/
│   │   └── loki-config.yml         # Loki configuration
│   ├── promtail/
│   │   └── promtail-config.yml     # Promtail configuration
│   └── grafana/
│       └── provisioning/
│           └── datasources/
│               └── datasources.yml  # Auto-configure datasources
├── logs/                            # Application logs (auto-generated)
│   ├── app-YYYY-MM-DD.log
│   ├── error-YYYY-MM-DD.log
│   └── info-YYYY-MM-DD.log
└── backend/
    └── src/
        ├── metrics/                 # Backend metrics
        │   ├── metrics.service.ts
        │   ├── metrics.controller.ts
        │   ├── metrics.middleware.ts
        │   └── metrics.module.ts
        └── logger/                  # Backend logging
            ├── logger.service.ts
            └── logger.module.ts
```

---

## 🚨 Troubleshooting

### Prometheus Shows "Down" Target

**Check:**
1. Backend is running: `docker-compose ps backend`
2. Metrics endpoint works: `curl http://localhost:4000/api/metrics`
3. Prometheus can reach backend: `docker-compose exec prometheus curl http://backend:4000/api/metrics`

**Fix:** Restart backend and Prometheus

### No Logs in Grafana

**Check:**
1. Log files exist: `ls -la logs/`
2. Promtail is running: `docker-compose ps promtail`
3. Promtail can see logs: `docker-compose exec promtail ls -la /logs/`
4. Check time range in Grafana (set to "Last 1 hour")

**Fix:**
```bash
docker-compose restart promtail
```

### Loki Won't Start

**Check logs:**
```bash
docker-compose logs loki
```

**Common issues:**
- Config file is directory instead of file
- Schema version mismatch
- Port 3100 already in use

**Fix:** Check config file exists and is valid YAML

### Grafana Data Source Error

**Check:**
1. Prometheus/Loki is running
2. URL is correct (`http://prometheus:9090`, `http://loki:3100`)
3. Restart Grafana: `docker-compose restart grafana`

### High Memory Usage

**Prometheus:**
- Reduce retention: Change `--storage.tsdb.retention.time=30d` to `7d`

**Loki:**
- Configure retention in `loki-config.yml`

**Logs:**
- Delete old logs: `find logs/ -mtime +7 -delete`

### Missing Metrics

**Check:**
1. MetricsModule imported in AppModule
2. MetricsService injected in services
3. Backend restarted after adding metrics
4. Check backend logs for errors

---

## 📊 Monitoring Best Practices

### For Development

1. **Monitor during testing** - See real-time impact
2. **Check error logs** - Catch bugs early
3. **Watch performance** - Identify slow queries
4. **Track feature usage** - See what users actually use

### For Production

1. **Set up alerts** - Get notified of issues
2. **Review dashboards daily** - Spot trends
3. **Monitor error rate** - Keep it under 1%
4. **Check response times** - Keep p95 under 500ms
5. **Track cache hit rate** - Should be >80%
6. **Monitor disk space** - Logs and metrics grow

### Key Metrics to Watch

**Health Indicators:**
- Error rate < 1%
- Response time p95 < 500ms
- Cache hit rate > 80%
- CPU usage < 70%
- Memory usage < 80%

**Usage Indicators:**
- Daily active pastes
- Most popular languages
- Feature adoption (password, burn-after-read)
- Peak traffic hours

---

## 🎯 Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response Time (p95) | < 200ms | > 500ms |
| Error Rate | < 0.1% | > 1% |
| Cache Hit Rate | > 80% | < 60% |
| Database Query (p95) | < 50ms | > 100ms |
| CPU Usage | < 50% | > 70% |
| Memory Usage | < 70% | > 85% |

---

## 📚 Resources

**Prometheus:**
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Recording Rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/)
- [Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)

**Grafana:**
- [Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/)
- [Panel Types](https://grafana.com/docs/grafana/latest/panels-visualizations/)

**Loki:**
- [LogQL](https://grafana.com/docs/loki/latest/logql/)
- [Log Queries](https://grafana.com/docs/loki/latest/logql/log_queries/)

**Winston:**
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Log Levels](https://github.com/winstonjs/winston#logging-levels)

---

## 🔐 Security Notes

1. **Grafana credentials** - Store in `.env`, never commit
2. **Metrics endpoint** - No authentication by default (add if needed)
3. **Log sanitization** - Don't log passwords or sensitive data
4. **Access control** - Restrict Grafana access in production
5. **HTTPS** - Use HTTPS in production for Grafana

---

## 🎉 You're All Set!

Your DevPaste app now has:
- ✅ Real-time metrics tracking
- ✅ Comprehensive logging
- ✅ Beautiful dashboards
- ✅ Performance monitoring
- ✅ Error tracking
- ✅ Usage analytics

**Access your dashboards:**
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

**Need help?** Check the troubleshooting section above!