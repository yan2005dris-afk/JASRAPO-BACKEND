# 4R + Security Audit — JASRAPO Backend

**Date:** 2026-07-23
**Scope:** `backend/src/**` — full read-only review, no code changes.
**Method:** manual review guided by `.coderabbit.yaml` path instructions and `docs/standards/*`, prioritized as: identity/auth → sri (signature/certificates/emision) → billing → infrastructure (mail/storage) → webhooks → light pass over metering/operations/reports/public-portal.
**Lenses:** review-risk / security, review-reliability, review-resilience, review-readability (readability flagged only where genuinely confusing in critical areas, per instructions).

This report uses the project's own vocabulary from `.coderabbit.yaml` (`[RISK]`, `[RELIABILITY]`, `[RESILIENCE]`, `[READABILITY]`) and does not re-flag anything already accepted in `docs/standards/EXCEPTIONS.md`, `LAYERS.md`, `INTERFACES.md`, `NAMING.md`, `REST-API.md`, or `STANDARDS.md` — none of those documents address the findings below, so nothing here is a known/accepted deviation.

---

## 1. Executive summary — top findings by severity

| # | Severity | Area | Finding |
|---|----------|------|---------|
| 1 | **High** | public-portal/search | Unauthenticated `GET /search?tipo=nombre` does partial (`ILIKE %token%`) name matching against all customers and returns full name + cédula/RUC + debt amounts — no proof of identity required, enabling bulk PII harvesting. |
| 2 | **High** | infrastructure/observability | The `useragent` npm package (unmaintained since ~2018, known ReDoS-prone regexes) parses the raw, attacker-controlled `User-Agent` header on **every** request via a globally-registered interceptor. |
| 3 | **Medium** | billing/collections/agreements | Payment-agreement interest and installment amounts are computed with native JS float arithmetic, not `Decimal.js` — directly contradicts the project's own explicit billing standard in `.coderabbit.yaml`. |
| 4 | **Medium** | infrastructure/storage | `STORAGE_SSL_VERIFY=false` is only logged as a warning in production; the adjacent `STORAGE_USE_SSL` check hard-fails boot in the same function, but TLS-verification bypass does not get the same protection. |
| 5 | **Medium** | sri/emision | No automated reconciliation job exists for comprobantes stuck in `FIRMADO`/`EN PROCESO` after an SRI communication failure — recovery depends entirely on an operator manually calling `POST /sri/sincronizar`; there is no `@Cron` anywhere in the codebase. |
| 6 | **Medium** | sri/certificates ↔ emisores | The certificate-upload flow (`EmisoresService.uploadCertificado`) is not wired to any HTTP controller — four `emitir-*` use-cases point users at a `POST /certificates/upload-cert` endpoint that does not exist. |
| 7 | **Medium** | infrastructure/observability, sri/emision | `GET /metrics` (Prometheus) and `GET /catalogos/impuestos` are missing both `@Public()` and `@RequiredPermission`; under the global `JwtAuthGuard` + `PermissionsGuard` this makes them unreachable (401/403) for their intended callers. |
| 8 | **Medium** | sri/emision | `POST /sri/validar` (XML upload) has no Multer `limits`/MIME filter, unlike the project's own file-upload rule — unbounded file buffered fully into memory. |
| 9 | **Medium** | main.ts (global) | Helmet CSP applies `script-src 'self' 'unsafe-inline'` to the entire API (not scoped to `/docs`), weakening CSP as an XSS defense-in-depth layer. |
| 10 | Low | identity, cross-cutting | Several `warn`/`error` log lines interpolate `user.email` directly (e.g. `PermissionsGuard`), contrary to the project's own "log IDs only, never PII" observability rule. |

**What is *not* on this list and deserves acknowledgment:** login/session/refresh-token flow, XAdES signing + post-sign verification, the SRI SOAP client's circuit breaker/retry/backoff, invoice-sequence atomicity, payment-application concurrency control, and the webhook SSRF defenses are all solid and, in several cases, exceed the bar the project sets for itself. See §3.

---

## 2. Findings by area

### 2.1 Identity / Auth (`backend/src/identity/**`)

#### [LOW] User email logged in access-denied warnings
- **File:** `backend/src/infrastructure/common/guards/permissions.guard.ts:73`
- **Finding:** `this.logger.warn(\`Acceso denegado: Usuario ${user.email} intentó ${required.accion} en ${required.recurso}\`)` logs the raw email address.
- **Scenario:** Every 403 response leaves the user's email in plaintext application logs. `.coderabbit.yaml`'s own `infrastructure/observability/**` rule states: "Verify no PII (emails, names, document numbers, tokens) is logged... log user IDs (UUIDs) only, never the actual values." This guard sits outside that path filter but the same principle applies — it's the highest-traffic authorization-denial log line in the app.
- **Direction:** Replace `user.email` with `user.usersId` in this and any similar log line (see also `login.use-case.ts`/`refresh-access-token.use-case.ts`, which already do this correctly by logging `user.usuarioId`).

#### [LOW] `RegisterDto.rolId` is caller-supplied with no cross-check against actor's own privileges
- **File:** `backend/src/identity/auth/interfaces/dto/register.dto.ts:49-55`, `backend/src/identity/auth/application/use-cases/register.use-case.ts:24-26`
- **Finding:** Any caller with the generic `users:create` permission can assign **any** `rolId` (including an administrator role) to a newly created user; there is no check that the actor is allowed to grant that specific role.
- **Scenario:** A support-tier admin with only `users:create` (but not, say, `roles:assign`) could create a new user with `rolId` pointing at the Administrador role, achieving privilege escalation through a side door if permission grants in this system are ever more granular than "users:create = full user admin."
- **Direction:** Either gate role assignment behind its own permission (e.g. `users:assign-role`) or explicitly document that `users:create` implies full role-assignment trust. Not exploitable today since `/auth/register` itself requires `users:create` (already an administrative permission), but worth tightening before permission granularity increases.

#### [LOW] Login password minimum length is 6 characters
- **File:** `backend/src/identity/auth/interfaces/dto/login-user.dto.ts:21-32`
- **Finding:** `@MinLength(6)` — below the commonly cited OWASP ASVS baseline of 8. (Registration/password-change DTOs were not located in this pass; worth checking they don't inherit the same 6-char floor.)
- **Direction:** Raise to 8+ and consider a compromised-password check (e.g. HaveIBeenPwned k-anonymity) at registration/change time — not blocking, just worth a ticket.

**Checked and found OK (see §3 for detail):** bcrypt cost-factor upgrade path, account lockout, refresh-token replay detection with `timingSafeEqual`, session-secret rotation with optimistic concurrency, `getOrThrow` on all JWT secrets, boot-time refresh-token TTL ceiling.

---

### 2.2 SRI — signature / certificates / emisión (`backend/src/sri/**`)

#### [MEDIUM] Certificate-upload endpoint referenced but not wired
- **Files:** `backend/src/sri/emisores/application/emisores.service.ts:180` (`uploadCertificado` — never called from any controller); error messages in `backend/src/sri/emision/application/use-cases/emitir-factura.use-case.ts:152`, `emitir-nota-credito.use-case.ts:148`, `emitir-nota-debito.use-case.ts:160`, `emitir-retencion.use-case.ts:145` all say "Use el endpoint POST /certificates/upload-cert..."
- **Scenario:** An operator hits the "no certificate configured" error, looks for `/certificates/upload-cert`, and it 404s — `backend/src/sri/certificates/interfaces/http/certificate.controller.ts` only exposes `GET /sri/certificates` and `DELETE /sri/certificates/:fileName`. There is currently no HTTP path to actually upload a P12 for an emisor, which blocks the entire fiscal-signing flow for any new emisor via the API (must be done by direct DB/storage manipulation).
- **Direction:** Add a `POST` route on `EmisoresController` or `CertificateController` that calls `EmisoresService.uploadCertificado`, with Multer `limits` (see finding below) and a `.p12`-only MIME/extension check.

#### [MEDIUM] No automated reconciliation for comprobantes stuck in `FIRMADO` / `EN PROCESO`
- **Files:** `backend/src/sri/emision/application/use-cases/emitir-factura.use-case.ts:196-210` (persists `FIRMADO` before calling SRI, correctly — see §3), `backend/src/sri/emision/infrastructure/soap/sri-soap.client.ts:169-184` (returns `EN PROCESO` after retries exhausted), `backend/src/sri/emision/application/services/sri.service.ts:647` (`sincronizarConSri`, manually invoked via `POST /sri/sincronizar` in `sri.controller.ts:334`). No `@Cron`/`ScheduleModule` usage exists anywhere in `backend/src` (verified via repo-wide search).
- **Scenario:** If the SRI communication step fails or times out (network partition, SRI outage, or the retry budget in `enviarYAutorizar` is exhausted), the comprobante is left `FIRMADO` or `EN PROCESO` in the DB. Per `.coderabbit.yaml`'s own SRI resilience rule ("document state transitions must be persisted before sending... Outbox Pattern"), the write-before-send part is done right, but there's no automatic follow-up: an operator must remember to notice and call `/sri/sincronizar`. In practice this means fiscal documents can silently sit unresolved (not authorized, not rejected) until someone looks.
- **Direction:** Add a scheduled job (pg-boss cron-style job or `@Cron`) that periodically calls the existing `sincronizarConSri` logic for comprobantes in `PENDIENTE`/`EN_PROCESO`/`DEVUELTA` older than N minutes. The reconciliation logic itself already exists — it just needs a trigger other than a human.

#### [MEDIUM] `POST /sri/validar` file upload has no size/MIME limits
- **File:** `backend/src/sri/emision/interfaces/http/sri.controller.ts:184-197`
- **Finding:** `@UseInterceptors(FileInterceptor('file'))` with no `limits` option and no `fileFilter`; the whole file is then read via `file.buffer.toString('utf-8')`.
- **Scenario:** Directly contradicts `.coderabbit.yaml`'s controller rule: "Check that file upload endpoints validate MIME type and file size. Fix: use Multer's fileFilter + limits options." An authenticated user with `sri:admin` (this whole controller requires that permission) could upload an arbitrarily large file, forcing full buffering into process memory — a resource-exhaustion vector against a process that also holds decrypted signing keys in memory (see §2.2 cache note below).
- **Direction:** Add `FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_SIZE_BYTES } })` (the constant already exists in `app.constants.ts` for this exact purpose) and a `fileFilter` restricting to XML/text content types.

#### [LOW] Debug signing path skips the post-signature verification every production path uses
- **File:** `backend/src/sri/emision/application/use-cases/emitir-factura.use-case.ts:313-368` (`generarFacturaFirmadaDebug`), vs. lines 156-169 which call `verifySignature()` after `signXmlForEmisor()`.
- **Scenario:** The debug method signs XML but never verifies the signature, unlike every other `emitir-*` path. It is currently unreachable via HTTP (no controller route calls `generarFacturaFirmadaDebug`/`sriService.generarFacturaFirmadaDebug`), so there's no live exposure today — but it's a footgun: if someone wires it up later (for an internal debug UI, say) they'd silently lose the "signature verified after generation, not just generated" guarantee `.coderabbit.yaml` explicitly calls for.
- **Direction:** Add the same `verifySignature()` call, or delete the method if genuinely unused.

#### [LOW] RSA-SHA1 used as the XML signature algorithm
- **File:** `backend/src/sri/emision/infrastructure/xml/xml-signer.service.ts:196-221`, `478-503` (`{ name: 'RSA-SHA1' }` passed to `xadesjs.SignedXml.Sign`)
- **Finding:** SHA-1 is cryptographically broken for collision resistance (SHAttered, 2017). The **digest** algorithm used for the XAdES reference hash is configurable and defaults to SHA-256 (good), but the **signature** algorithm itself is hardcoded to RSA-SHA1.
- **Context:** This is almost certainly an externally-mandated constraint — Ecuador's SRI XAdES-BES specification has historically required RSA-SHA1 for the signature algorithm regardless of digest choice, so this is very likely not a bug but a spec-compliance requirement. Flagging for visibility rather than as a defect: worth a one-line comment in the source confirming this is intentional/SRI-mandated (similar to the comment already present for `DEFAULT_XADES_HASH_ALGORITHM`), so a future reviewer doesn't "fix" it into an SRI-rejected format.

#### [Note] Decrypted private keys held in an in-process cache for up to 1 hour
- **File:** `backend/src/sri/emision/infrastructure/xml/xml-signer.service.ts:68-73, 331-439` (`emisorCertificateCache`, `CERT_CACHE_TTL_MS` default `3600000`)
- **Finding:** `loadEmisorCertificate()` decrypts the P12 password and parses the private key into a `CryptoKey`, then caches it in a `Map` keyed by RUC for up to `CACHE_CERT_TTL_MS` (1 hour by default) across *all* tenants' certificates simultaneously.
- **Scenario:** This is a reasonable performance tradeoff (re-parsing P12 + scrypt-deriving the decryption key on every signature would be expensive), but it does mean that for up to an hour after first use, every configured emisor's decrypted private key sits in Node process memory. If the process is ever compromised (RCE, memory-dump via a debug endpoint, core dump on crash uploaded somewhere insecure), all cached signing keys are exposed at once rather than just the one in use.
- **Direction:** No code change needed necessarily — just documenting the tradeoff. If this needs hardening later, consider capping cache size (LRU) or shortening TTL for production, and ensure core dumps are disabled/restricted in the deployment environment.

**Checked and found OK (see §3):** `verifySignature()` invoked after signing in all four live `emitir-*` use-cases; `CertificateService.resolveSafePath` blocks path traversal on certificate filenames; certificate passwords are AES-256-GCM encrypted at rest via `EncryptionService`, never stored plaintext; SRI SOAP client circuit breaker + 15s timeout + exponential backoff; invoice sequence generation is an atomic DB upsert.

---

### 2.3 Billing (`backend/src/billing/**`)

#### [MEDIUM] Payment-agreement interest/installment math uses native float arithmetic, not Decimal.js
- **Files:**
  - `backend/src/billing/collections/agreements/application/use-cases/create-agreement.use-case.ts:107-124` — `montoAFinanciar`, `interesesTotales`, `totalADistribuir`, `valorCuotaBase`, `valorUltimaCuota`, `interesPorCuota` are all computed with `*`, `/`, `-`, `Math.round`, `Math.floor` on plain JS `number`.
  - `backend/src/shared/utils/debt-calculator.util.ts:23-53` — `saldoPendienteItem`, `calcularSaldoVencido`, `calcularDeudaAnterior` sum/subtract plain numbers via `toNum()` + native `+`/`-`.
- **Finding:** This directly contradicts `.coderabbit.yaml`'s own billing-path rule: *"Any monetary or invoice calculation must use Decimal.js, never native JavaScript float arithmetic... Decimal.js is already a dependency — use it."* The same file's sibling use-cases (`create-payment.use-case.ts`, `apply-saldo-favor.use-case.ts`) do use `Decimal` correctly for the equivalent operations, which makes this an inconsistency rather than a project-wide gap.
- **Scenario:** `valorCuotaBase = Math.floor((totalADistribuir / numeroCuotas) * 100) / 100` followed by `valorUltimaCuota = totalADistribuir - valorCuotaBase * (numeroCuotas - 1)` is a manual "distribute remainder to the last installment" pattern done in floats. For debt totals / installment counts that don't divide cleanly, IEEE-754 rounding artifacts (the classic `0.1 + 0.2 !== 0.3` class of bug) can produce a sum of all `cuotas.valorCuota` that is off by a cent from `totalADistribuir`, which then shows up as a reconciliation mismatch between the convenio total and its cuotas in accounting reports.
- **Direction:** Port this calculation to `Decimal.js` the same way `create-payment.use-case.ts` already does (`new Decimal(...)`, `.plus()`, `.minus()`, `.times()`, `.dividedBy()`, `.toDecimalPlaces(2)`), including in `DebtCalculatorHelper`.

**Checked and found OK (see §3):** payment creation (`create-payment.use-case.ts`) and saldo-a-favor application (`apply-saldo-favor.use-case.ts`) use `Decimal.js` consistently, row-lock the comprobante (`FOR UPDATE`) before applying a payment, and use optimistic concurrency (`updateMany` with an expected `saldoPendiente` predicate) on cuota updates; invoice-number sequence generation (`prisma-secuencial.repository.ts`) is an atomic DB-level `upsert` + `increment`, not application-level max+1; `$queryRawUnsafe` in `prisma-batch.repository.ts` and `prisma-payment.repository.ts` uses positional bind parameters exclusively (no string interpolation — no injection risk despite the "Unsafe" name).

---

### 2.4 Infrastructure — mail & storage (`backend/src/infrastructure/{mail,storage}/**`, `database/s3-client/**`)

#### [MEDIUM] `STORAGE_SSL_VERIFY=false` is not blocked in production, unlike the adjacent SSL-required check
- **File:** `backend/src/infrastructure/database/s3-client/s3-client.service.ts:53-79`
- **Finding:** Lines 75-79 hard-fail application boot when `NODE_ENV=production` and `STORAGE_USE_SSL !== 'true'` ("Refusing to start... Cleartext S3 connection would expose credentials"). Three lines earlier (57-62), the analogous `STORAGE_SSL_VERIFY=false` path (which disables TLS **certificate verification**, i.e. `rejectUnauthorized: false`) only logs a `logger.warn(...)` — there is no `nodeEnv === 'production'` guard on it at all.
- **Scenario:** An operator who sets `STORAGE_SSL_VERIFY=false` in production (e.g. copy-pasted from a staging `.env` that talks to a self-signed RustFS instance, per the recent commit that introduced this flag) gets a warning log line, not a boot failure. The connection is still HTTPS-labeled (`STORAGE_USE_SSL=true` satisfies the other check) but any attacker capable of intercepting traffic to the storage endpoint (compromised DNS, ARP spoofing on a shared network, a misconfigured reverse proxy) can MITM it with **any** certificate, including a self-signed one for a completely different host, and the client will accept it. This is functionally equivalent to no TLS for confidentiality/integrity purposes, but doesn't get the same fail-fast protection cleartext does — even though it's arguably a worse trap because it *looks* like TLS is on.
- **Direction:** Add the same `if (nodeEnv === 'production' && !sslVerify) throw new Error(...)` guard used for `STORAGE_USE_SSL`, right next to it.

#### [MEDIUM] Global CSP `script-src` includes `'unsafe-inline'`
- **File:** `backend/src/main.ts:93-104`
- **Finding:** `helmet({ contentSecurityPolicy: { directives: { scriptSrc: ["'self'", "'unsafe-inline'"] } } })` is applied globally via `app.use(helmet(...))`, before route registration — it affects every response, not just `/docs`.
- **Scenario:** `'unsafe-inline'` on `script-src` defeats the primary purpose of CSP as an XSS mitigation (it allows any inline `<script>` to execute regardless of origin). This is almost certainly there to support Swagger UI at `/docs`, which needs inline scripts. Because this is predominantly a JSON API, actual exploitability is limited to any surface that reflects user content as `text/html` (none were found in this review), but it's a needless global weakening of an otherwise-good header set.
- **Direction:** Scope the permissive CSP to the `/docs` path only (e.g. `helmet()` with a strict default CSP, and a separate, more permissive CSP middleware applied only ahead of `SwaggerModule.setup`).

**Checked and found OK (see §3):** mail failover dispatcher (rate-limited, timeouts, no raw SMTP command construction); presigned URL TTL hard-capped at 3600s; S3 credentials required via `getOrThrow` at boot; production refuses to start without `STORAGE_USE_SSL=true`.

---

### 2.5 Webhooks (`backend/src/sri/webhooks/**`)

No findings. This module is a standout — see §3 for the specific things checked. The SSRF-hardened webhook dispatch pipeline (`ssrf-resolver.ts` + `webhook.processor.ts`) is the strongest-engineered piece of the codebase reviewed in this pass and can be used as the reference pattern if any other outbound-HTTP integration is added later (there currently isn't one that accepts a user-supplied URL besides this).

---

### 2.6 Light pass — metering, operations, reports, public-portal

#### [HIGH] Unauthenticated public search enables bulk PII harvesting by partial name
- **Files:** `backend/src/public-portal/search/interfaces/http/busqueda-publica.controller.ts` (`@Public()`, `GET /search`, `Throttle 10/min` per IP), `backend/src/public-portal/search/interfaces/dto/search-deuda.dto.ts` (`tipo: 'identificacion' | 'nombre' | 'numeroGuia'`, `@MinLength(2)` on `valor`), `backend/src/public-portal/search/infrastructure/repositories/prisma-busqueda-publica.repository.ts:124-186` (`buildWhereCliente`/`buildWhereDeuda`, `nombre` mode: `{ contains: token, mode: 'insensitive' }` — i.e. SQL `ILIKE '%token%'` — AND-ed over whitespace-split tokens), `backend/src/public-portal/search/interfaces/dto/deuda-publica-response.dto.ts` (response includes `cliente.nombre`, `cliente.identificacion`, and per-contract debt figures).
- **Finding:** This is a deliberately public, unauthenticated endpoint (business requirement: let a customer check their own debt without logging in). The `identificacion` search mode is reasonable — it requires knowing someone's exact cédula/RUC, which functions as a shared secret the customer already has. The `nombre` mode does **not** have an equivalent proof-of-ownership requirement: any two-character-or-longer substring of a first or last name returns every matching customer's full name, national ID number, contract number, and outstanding debt, paginated up to 50 per page.
- **Scenario:** An anonymous actor scripts `GET /search?tipo=nombre&valor=<2-letter fragment>&page=1..N&limit=50` across common name fragments. At 10 requests/minute per IP (the only throttle in place) this is slow from a single IP but trivially parallelized across IPs/proxies, and even single-IP-and-patient this yields the customer base's {full name, cédula, debt} over time with zero authentication. In Ecuador this combination (cédula + full name + amounts owed) is regulated personal/financial data under the Ley Orgánica de Protección de Datos Personales (LOPDP) — this endpoint is a direct, no-auth exfiltration path for it, and it's also useful for attackers building targeted phishing/social-engineering lists ("we see you owe $X on contract Y...").
- **Direction:** The cleanest fix is to remove `nombre` as a public search mode entirely and require `identificacion` or `numeroGuia` (both function as a shared secret the legitimate customer already holds) for the unauthenticated portal, keeping name-search available only behind the authenticated staff-facing search. If product requirements need name search to stay public, consider requiring an exact (not partial/`contains`) match plus a second factor (e.g. also require the last 4 digits of the cédula), and/or truncating `identificacion` in the response (e.g. `091****678`).

#### [Note] `GET /catalogos/impuestos` and `GET /metrics` are unreachable due to a missing decorator
- **Files:** `backend/src/sri/emision/interfaces/http/catalogos.controller.ts` (no `@Public()`, no `@RequiredPermission` anywhere in the file), `backend/src/infrastructure/observability/metrics/metrics.controller.ts` (same).
- **Finding:** The app registers `JwtAuthGuard` and `PermissionsGuard` globally via `APP_GUARD` in `app.module.ts:69-76`. Every route is therefore protected by default unless `@Public()`-decorated, and `PermissionsGuard.canActivate` (`permissions.guard.ts:46-53`) explicitly throws `ForbiddenException('Missing @RequiredPermission decorator on protected route')` when a non-public route lacks the decorator. Neither of these two controllers has `@Public()` or `@RequiredPermission` anywhere.
- **Scenario:** `GET /metrics` is tagged `[No Aplicable] Métricas para Prometheus (scraping)` — a Prometheus scraper doesn't carry a JWT, so it gets `401` from `JwtAuthGuard` before `PermissionsGuard` is even reached; metrics scraping is effectively broken end-to-end today unless something outside the app (a sidecar, a different exposed port) is doing the scraping instead. `GET /catalogos/impuestos` (SRI tax-rate catalog — IVA/ICE/IRBPNR, needed to build correct invoice XML) returns `403` for every authenticated user regardless of role, because the permission-decorator check fails closed. Compare with `backend/src/infrastructure/pdf/pdf-health.controller.ts:7`, which correctly uses `@Public()` for its health-check endpoint — that's the established pattern these two controllers should follow.
- **Direction:** Add `@Public()` to `MetricsController` (matching the `pdf-health` pattern; if scrape-endpoint confidentiality matters, restrict at the network/reverse-proxy layer instead of via JWT) and either `@Public()` or a `@RequiredPermission('catalogos', 'read')` to `CatalogosController`, whichever matches intended access (tax catalogs are typically non-sensitive reference data).

#### Metering, operations — no findings in this pass
Controllers checked for the global-guard pattern (`@UseGuards`/`@Public()` presence) all conform; DTOs sampled had `class-validator` decorators present. No raw SQL, no `eval`/`child_process`, no obviously missing validation was found. This was a lighter pass than the priority areas above and should not be read as an exhaustive review — see §3 for exactly what was and wasn't covered.

---

## 3. What was explicitly checked and found OK

Recorded here so it doesn't need re-auditing blind next time.

**Identity / Auth**
- `LoginUseCase`: `bcrypt.compare` (not `==`) for password checks; generic "Credenciales inválidas" for both nonexistent-user and wrong-password (no user-enumeration oracle); account lockout after `LOGIN_LOCKOUT_THRESHOLD` (5) failures in a 15-minute sliding window, 30-minute lockout, checked *before* password comparison so a locked account doesn't leak "your password was right" timing; opportunistic bcrypt cost-factor upgrade (OWASP 2024 guidance, cost 12 default, bounded 4-15) on successful login, applied to the plaintext already verified (not to the stored hash).
- `RefreshAccessTokenUseCase`: refresh-token replay detection via `tokenVersion` + `timingSafeEqual`-compared session secret; on detected replay (stale `tokenVersion` or lost race on rotation), revokes **all** of the user's sessions, not just the one being replayed (covers the case where an attacker's stolen token lives in a different session row); rotation itself uses `updateMany` with an `expectedTokenVersion` predicate (optimistic concurrency — 0 affected rows means someone else won the race, treated as replay).
- `JwtStrategy`/`RefreshTokenStrategy`: both require the relevant JWT secret to be configured at construction time (`ConfigService.get`, throws if missing) or the module fails to boot; session state (`revocado`, `expiraEn`, `tokenVersion`) is re-checked against the DB on every request, not trusted from the JWT claims alone.
- `main.ts`: `assertAllSecrets()` and `assertRefreshTokenCeiling()` run at boot — the app refuses to start with missing secrets or a refresh-token TTL over 72h unless `ALLOW_LONG_REFRESH=1` is explicitly set.
- `PermissionsGuard`/`app.module.ts`: deny-by-default authorization — `JwtAuthGuard` + `PermissionsGuard` are global (`APP_GUARD`), and `PermissionsGuard` fails closed (throws) on any protected route missing a `@RequiredPermission` decorator, rather than defaulting to "allow."
- `ValidationPipe` in `main.ts` is global with `whitelist: true, forbidNonWhitelisted: true` — unexpected/extra body fields are rejected outright (defense against mass-assignment).

**SRI — signature / certificates / emisión**
- `XmlSignerService.signXmlForEmisor()` is followed by `verifySignature()` in all four live use-cases (`emitir-factura`, `emitir-nota-credito`, `emitir-nota-debito`, `emitir-retencion`) — matches `.coderabbit.yaml`'s "signatures must be verified after generation" rule.
- `CertificateService.resolveSafePath()` normalizes and prefix-checks certificate filenames against the certs directory before any filesystem operation — path traversal via `fileName` is blocked; `deleteCertificate` additionally requires a `.p12` extension.
- Certificate passwords are never stored in plaintext: `EmisoresService.uploadCertificado()` calls `EncryptionService.encrypt(password)` before persisting; `EncryptionService` uses AES-256-GCM with a random 12-byte IV per encryption and validates the auth tag on decrypt (tamper-evident); the legacy AES-256-CBC decrypt path exists only for reading old ciphertext, not for new writes.
- `SriSoapClient`: per-operation circuit breaker (`getCircuitBreaker`), explicit 15s per-call timeout, `enviarYAutorizar` retries the authorization poll with exponential backoff up to a configurable `SRI_MAX_RETRIES`, and cleanly distinguishes an SRI business rejection (`DEVUELTA`/`NO AUTORIZADO`, returned as a structured result) from an infrastructure failure (thrown error) — exactly what `.coderabbit.yaml` asks for.
- `emitir-factura.use-case.ts` persists the comprobante as `FIRMADO` in a short DB transaction **before** calling the SRI SOAP client, and the code comment explicitly notes this is so a crash/timeout during the SRI call still leaves a recoverable `FIRMADO` record rather than losing state (Outbox-style safety) — the reconciliation *trigger* is the gap noted in §2.2, not this persistence step.
- `PrismaSecuencialRepository.getNextSecuencial()` uses a single atomic `upsert` with `{ increment: 1 }` — a database-level atomic sequence, not application-level read-then-write.

**Billing**
- `CreatePaymentUseCase`/`ApplySaldoFavorUseCase` use `Decimal.js` throughout for money math; `CreatePaymentUseCase.validateDetails()` takes a `SELECT ... FOR UPDATE` row lock on the comprobante (`lockComprobante`) before validating/applying a payment, preventing two concurrent payments from double-spending the same balance; cuota updates use `updateMany` with an expected `saldoPendiente` predicate (optimistic concurrency, throws on lost race) rather than blind writes; fully-paid cuotas emit a `cuota.pagada` event through an outbox table (`eventosPendientesRepository.createPending`) inside the same transaction, not a fire-and-forget in-process event.
- Raw SQL usage (`$queryRawUnsafe` in `prisma-batch.repository.ts`, `prisma-payment.repository.ts`, `mail-rate-limit.service.ts`) is exclusively parameterized with positional placeholders (`$1`, `$2`, ...) — no string interpolation of caller-supplied values was found anywhere in the codebase; no SQL injection surface identified.

**Infrastructure — mail / storage**
- `S3ClientService`: refuses to boot in production without `STORAGE_USE_SSL=true`; requires non-empty `STORAGE_ACCESS_KEY`/`STORAGE_SECRET_KEY` via `getOrThrow`-equivalent explicit checks; validates `STORAGE_PORT` range.
- `StorageService.getUrl()` hard-caps presigned URL TTL at 3600 seconds and rejects non-positive/non-finite values.
- `FailoverDispatcher` (mail): tries providers in priority order with per-provider daily rate limits enforced via an atomic parameterized SQL upsert (`ACQUIRE_SLOT_SQL`, `WHERE sent_count < $2`, race-safe), and sets `connectionTimeout`/`socketTimeout`/`greetingTimeout` on every transporter.
- `PdfService`: single warmed-up Puppeteer browser instance reused across requests (not launched per-request); every render wraps `page.setContent`/`page.pdf` in an explicit timeout (`withTimeout`, `PDF_TIMEOUT_MS`); `page.close()` runs in a `finally` block so failures don't leak pages; a concurrency semaphore caps simultaneous renders. Handlebars templates use auto-escaping `{{ }}` throughout — no unescaped `{{{ }}}` interpolation of user-supplied data was found in any `.hbs` file except one intentional layout-composition point (`mail/.../templates/base.hbs`'s `{{{body}}}`, which wraps an already-rendered/escaped child template — the standard Handlebars layout pattern, not a raw user-data sink).

**Webhooks**
- `ssrf-resolver.ts`: resolves the target hostname via DNS, checks every returned address (not just the first) against a combined IPv4/IPv6 deny-list (loopback, link-local incl. cloud metadata `169.254.0.0/16`, RFC1918 private ranges, multicast, reserved/unspecified), fails closed on unparseable input, and then pins the chosen public IP into a dedicated `undici.Agent` so the actual HTTP connection cannot be re-resolved to a different (dangerous) address between validation and connect — closes the classic DNS-rebinding TOCTOU gap.
- `webhook.processor.ts`: uses the pinned dispatcher for the actual `fetch`, sets `redirect: 'error'` (a malicious 3xx response cannot redirect the request to an internal address), a 30s `AbortSignal.timeout`, a per-destination-host circuit breaker, HMAC-SHA256 request signing, and always closes the per-job dispatcher in a `finally` block; SSRF blocks are logged with the attempted URL, resolved IP, and reason for audit purposes.

**Cross-cutting**
- No `eval(`, `new Function(`, `child_process.exec/execSync/spawn` usage anywhere in `backend/src`.
- `main.ts`: Helmet is applied (CSP present, if broad — see §2.4), global `ValidationPipe` blocks unexpected fields, JSON/urlencoded body size capped at 10mb, `trust proxy` scoped to exactly 1 hop (matches the documented Nginx reverse-proxy topology, not an unbounded trust of `X-Forwarded-For`), refresh-token cookie is `httpOnly` + `sameSite: 'lax'` + `secure` in production.
- `.env.example` at the repo root was intentionally **not read** in this review — the harness's own permission settings blocked access to any `.env*` file, including the example, which is itself a reasonable secret-hygiene posture; the expected configuration surface was instead inferred from `ConfigService.get`/`getOrThrow` call sites in source (documented per-finding above).

---

## 4. Coverage notes / not fully audited

- **Metering, operations, reports, public-portal** received the lighter pass requested — controller-level guard presence and DTO validation presence were checked broadly, but business logic inside individual use-cases in these modules was not read line-by-line the way identity/sri/billing/mail/storage/webhooks were.
- **Database-level logic** (Postgres functions such as `generar_prefacturas_lote()`, invoked via `$queryRawUnsafe` from `PrismaBatchRepository.generate()`) is out of scope for a TypeScript-source review — the SQL function body itself (money math, numeric types used, etc.) was not located/reviewed and should be checked separately if it isn't already covered by a DB-level review process.
- **Test coverage** was spot-checked by file-count comparison (e.g. `sri/emision`: 50 source files vs. 11 spec files) rather than exhaustively enumerated; this report does not include a systematic coverage gap list beyond what's noted per-finding (e.g. the debug signing path).
- Dependency review was a `package.json` skim, not a full `pnpm audit`/SCA run; flagged `useragent` because it's both unmaintained and actively fed attacker-controlled input on the hot path — a full SCA pass may surface additional transitive-dependency issues not visible from `package.json` alone.
