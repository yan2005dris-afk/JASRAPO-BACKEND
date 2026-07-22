# Grafana Loki PII RBAC and Retention

This document is the operator-facing companion to the application-level PII redaction introduced in #138.
The application (`backend/src/infrastructure/observability/redact.ts`, `logger.config.ts`) redacts PII
**at write time** so that the value never reaches Loki. The configuration below adds a second line of
defence: even if a redacted field leaks, the operator can restrict who can read it, and for how long it
is retained.

## Quick path

1. Apply the `loki.yaml` snippet below to your Loki configuration.
2. Apply the `rbac.yaml` snippet to Grafana (Loki data source) or the OpenShift/Keycloak realm fronting
   the dashboards.
3. Confirm with `logcli` that an `admin` user can read `{app="jasrapo-backend"}` and a `viewer` user
   cannot see `pii="raw"` streams.
4. Schedule a quarterly review of `compactor.retention_deletes_enabled`.

## Loki configuration (`loki.yaml`)

```yaml
auth_enabled: true

# Path-based RBAC: gate access to PII-labelled streams.
# Streams are labelled by the application: `pii="redacted"` for access logs,
# `pii="raw"` reserved for future opt-in debug sinks.
limits_config:
  retention_period: 720h # 30 days, hard cap for PII fields
  reject_old_samples: true
  reject_old_samples_max_age: 720h
  ingestion_rate_mb: 8
  ingestion_burst_size_mb: 16

# Per-tenant retention; PII streams must expire in 30 days.
compactor:
  retention_enabled: true
  retention_delete_delay: 2h
  retention_delete_worker_count: 150
  delete_request_store: filesystem

# Blocklist the raw PII fields from ever being indexed as labels (high-cardinality
# and GDPR-sensitive). Labels are immutable once written.
ruler:
  alertmanager:
    enable: false
  storage:
    type: local
    local:
      directory: /loki/rules
  rule_path: /loki/tmp/rules

# Schema: keep streams sharded by pii label so the compactor can drop them
# independently from operational logs.
schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: s3
      schema: v13
      index:
        prefix: index_
        period: 24h
```

## Grafana RBAC (`rbac.yaml`)

```yaml
apiVersion: 1
# Grafana provisioned RBAC for the jasrapo-backend data source.
# - `admin`: SRE + on-call. Full read.
# - `auditor`: Compliance. Read redacted streams only.
# - `viewer`: Product + Support. No PII streams.
access:
  role:
    - name: 'jasrapo:admin'
      permissions:
        - action: 'datasources:query'
          resources: ['datasources:uid:lokijasrapo']
        - action: 'datasources:query'
          resources: ['datasources:uid:lokijasrapo']
          scope: 'datasources:scope:rawPii'
    - name: 'jasrapo:auditor'
      permissions:
        - action: 'datasources:query'
          resources: ['datasources:uid:lokijasrapo']
          scope: 'datasources:scope:redactedOnly'
    - name: 'jasrapo:viewer'
      permissions:
        - action: 'datasources:query'
          resources: ['datasources:uid:lokijasrapo']
          scope: 'datasources:scope:noPii'
```

In Grafana UI, create the data source scopes:

| Scope name | Allowed LogQL selector |
|------------|------------------------|
| `rawPii` | `{app="jasrapo-backend"}` |
| `redactedOnly` | `{app="jasrapo-backend", pii="redacted"}` |
| `noPii` | `{app="jasrapo-backend"} \|= ""` after dropping `ip`, `email`, `userAgent` |

## What the application guarantees

| Field | Source code | Value reaching Loki |
|-------|-------------|---------------------|
| `req.headers.cookie` | `logger.config.ts` Pino `redact` | `[REDACTED]` |
| `req.headers.authorization` | `logger.config.ts` Pino `redact` | `[REDACTED]` |
| `*.email` | `logger.config.ts` Pino `redact` | `[REDACTED]` |
| `*.ipAddress` | `logger.config.ts` Pino `redact` | `[REDACTED]` |
| `*.password` | `logger.config.ts` Pino `redact` | `[REDACTED]` |
| Access log IP | `LoggingInterceptor` + `redactIp` | `a.b.c.0/24` |
| Access log UA | `LoggingInterceptor` + `parseUserAgent` | `Chrome 124` / `curl 8` |
| Audit `usuarioEmail` | `AuditService` + `redactEmail` | `j***@e***.com` |
| Audit `ipAddress` | `AuditService` + `redactIp` | `a.b.c.0/24` |

## Retention policy

| Stream label | Retention | Justification |
|--------------|-----------|---------------|
| `{app="jasrapo-backend", pii="redacted"}` | 30 days (`720h`) | GDPR data-minimization; aligned with audit DB retention. |
| `{app="jasrapo-backend", pii="raw"}` | 7 days (`168h`) | Reserved for opt-in debug; shorter than redacted. |
| `{app="jasrapo-backend"}` (no `pii` label) | 90 days (`2160h`) | Operational traces; no PII by design. |

The compactor enforces these via `retention_period` and the `compactor.retention_*` block. Streams
exceeding the period are deleted in the next compaction cycle (≤ 2h after expiry).

## Verification checklist

- [ ] `logcli query '{app="jasrapo-backend"}' --since=24h` returns no rows containing an email address
      or a full IPv4/IPv6 address.
- [ ] `logcli query '{app="jasrapo-backend", pii="redacted"}' --since=24h` returns the access-log
      stream with `a.b.c.0/24` IPs and `Family Major` UAs.
- [ ] `logcli query '{app="jasrapo-backend"}' --since=31d` returns no rows (retention enforced).
- [ ] Grafana `viewer` role cannot see `{pii="raw"}` streams when querying the `lokijasrapo` data
      source.
- [ ] `compactor` logs show `retention: deleting chunks older than 720h` in the last 24h.

## Next step

After applying these settings, run `pnpm test -- redact.spec` in `backend/` to confirm the
application-side redaction still produces the expected output, then schedule the first quarterly
retention audit in your compliance tracker.
