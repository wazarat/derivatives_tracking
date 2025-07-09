# CanHav Monitoring Setup

This document outlines the monitoring and logging setup for the CanHav platform.

## Uptime Monitoring

We use [UptimeRobot](https://uptimerobot.com/) for monitoring the availability of our services.

### Setup Instructions

1. Create an account on UptimeRobot if you don't have one already
2. Add a new monitor with the following settings:
   - Monitor Type: HTTP(s)
   - Friendly Name: CanHav API Health
   - URL: https://api.canhav.com/health
   - Monitoring Interval: 5 minutes
   - Monitor Timeout: 30 seconds
   - HTTP Method: GET
   - Alert Contacts: Configure email/SMS alerts as needed

3. Add additional monitors for key endpoints:
   - Web App: https://canhav.com
   - Markets API: https://api.canhav.com/markets
   - Assets API: https://api.canhav.com/assets

4. Configure status page:
   - Create a public status page that includes all monitors
   - Customize with CanHav branding
   - Share the status page URL with the team

### Expected Response

The health endpoint should return a response like:

```json
{
  "status": "ok",
  "timestamp": "2025-07-08T17:06:53.123456",
  "version": "1.0.0",
  "environment": "production"
}
```

If the status is not "ok" or if the endpoint doesn't respond within the timeout period, an alert will be triggered.

## Log Management

We use [Papertrail](https://www.papertrail.com/) for centralized log management.

### Setup Instructions

1. Create a Papertrail account if you don't have one already
2. Create a new log destination in Papertrail to get your log drain URL
3. Configure your deployment platform to send logs to Papertrail:

#### For Heroku:

```bash
heroku drains:add syslog+tls://logsN.papertrailapp.com:XXXXX --app canhav-api
heroku drains:add syslog+tls://logsN.papertrailapp.com:XXXXX --app canhav-web
```

#### For Docker/Kubernetes:

Add the following to your deployment configuration:

```yaml
# For Docker Compose
logging:
  driver: syslog
  options:
    syslog-address: "tls://logsN.papertrailapp.com:XXXXX"
    tag: "{{.Name}}"

# For Kubernetes
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <match **>
      @type papertrail
      papertrail_host logsN.papertrailapp.com
      papertrail_port XXXXX
      tag canhav
    </match>
```

### Log Retention Policy

- Production logs: 30 days
- Development logs: 7 days

### Important Log Events to Monitor

Set up alerts in Papertrail for the following events:

1. Error-level logs
2. Authentication failures
3. API rate limit warnings
4. Database connection issues
5. Third-party API failures (CoinGecko, dYdX, Hyperliquid)

## Metrics and Performance Monitoring

For more detailed application performance monitoring, consider adding:

1. [Prometheus](https://prometheus.io/) for metrics collection
2. [Grafana](https://grafana.com/) for metrics visualization
3. [Sentry](https://sentry.io/) for error tracking

## Emergency Response

In case of service disruption:

1. Check the status page for affected components
2. Review Papertrail logs for error patterns
3. Follow the incident response procedure in the team playbook
4. Communicate status updates through the designated channels

## Environment Variables

Add these environment variables to your deployment:

```
LOG_LEVEL=info
PAPERTRAIL_HOST=logsN.papertrailapp.com
PAPERTRAIL_PORT=XXXXX
ENABLE_METRICS=true
```

## Healthcheck Configuration

The Docker Compose file already includes healthcheck configuration for the API service:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```
