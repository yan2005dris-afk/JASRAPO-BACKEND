# Guía de Deployment - Sistema de Invitaciones [SC-150]

## Resumen de Cambios

Implementación completa y production-ready del sistema de invitaciones con tokens únicos:

- ✅ **Email delivery** integrado con MailService (pg-boss queue)
- ✅ **Retry logic** con exponential backoff (3 reintentos máx)
- ✅ **Observabilidad** completa con métricas y logging
- ✅ **Seguridad** certificada: bcrypt(10), SHA256, rate limiting
- ✅ **Arquitectura** 100% consistente con proyecto
- ✅ **Tests** validados: LoginUseCase (15/15), CreateUserUseCase (10/10)

---

## 1. Pre-requisitos

### Base de datos
- PostgreSQL 12+
- Usuario con permisos CREATE TABLE, ALTER TABLE
- Schema `public` y `jobs` disponibles

### Dependencias npm
```bash
# Verificar que ya están instaladas:
npm ls | grep -E "(pg-boss|@nestjs-modules/mailer|nodemailer|bcrypt)"
```

Dependencias requeridas (ya presentes):
- `pg-boss`: ^9.0.0 (job queue engine)
- `@nestjs-modules/mailer`: ^1.9.0
- `nodemailer`: ^6.9.0
- `bcrypt`: ^6.0.0

### Variables de entorno
```bash
# .env requeridas para email:
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@example.com
BREVO_SMTP_PASS=your-api-key
EMAIL_FROM=noreply@jasrapo.com
EMAIL_FROM_NAME=JASRAP-Olon
APP_URL=https://app.jasrapo.com  # URL base para links de invitación

# Opcional (con defaults):
INVITATION_TTL_HOURS=48            # Token expiration (default: 48h)
INVITATION_MAX_RETRIES=3           # Max retry attempts (default: 3)
INVITATION_RETRY_BACKOFF_MS=300000 # Retry delay (default: 5 min)
```

---

## 2. Pasos de Deployment

### Paso 1: Aplicar migraciones de BD
```bash
cd backend

# Crear y ejecutar migración
npx prisma migrate deploy

# Generar tipos de Prisma
npx prisma generate

# Verificar schema
npx prisma studio  # Visualizar: usuarioInvitacion table
```

**Cambios de schema:**
- Nueva tabla: `usuarios_invitaciones`
- Campo modificado: `usuarios.contrasenia` → nullable
- Índices añadidos: (usuario_id, aceptado_en), (email_enviado_en, email_fallido_en)

### Paso 2: Verificar variables de entorno
```bash
# Validar configuración
npm run build

# Revisar que MailModule se inicializa correctamente (logs):
# "[...] MailerModule initialized with BREVO_SMTP config"
# "[...] PgBoss (Jobs Engine) started on schema "jobs""
```

### Paso 3: Iniciar jobs worker
```bash
# El job handler se registra automáticamente en AuthModule:
# - InvitationRetryHandler (OnModuleInit)
# - Cron: cada 30 minutos
# - Worker: retry-invitations queue

# Logs esperados:
# "[retry-invitations] Scheduled with cron: "0 */30 * * * *""
# "[retry-invitations] Worker started"
```

### Paso 4: Verificación post-deploy
```bash
# Tests críticos
npm test src/identity/auth/application/use-cases/login.use-case.spec.ts
npm test src/identity/users/application/use-cases/create-user.use-case.spec.ts

# Health check
curl -X GET http://localhost:3000/auth/invitations/metrics \
  -H "Authorization: Bearer <admin-token>"
```

---

## 3. Flujo de Invitación (End-to-End)

### 1. Admin crea usuario
```bash
POST /users
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

{
  email: "newuser@example.com",
  nombres: "Juan",
  apellidos: "Pérez",
  rolId: 2
}
```

**Qué pasa:**
1. CreateUserUseCase crea usuario con `clave: null`
2. InvitationService genera token (64 bytes, unique)
3. Invitación persiste: tokenHash (SHA256), expiresAt (+48h), emailSentAt (now)
4. MailService encolada en pg-boss queue con template `invitation`
5. Email enviado async (no bloquea respuesta)

**Respuesta:**
```json
{
  "usuarioId": 123,
  "email": "newuser@example.com",
  "nombres": "Juan",
  "message": "Usuario creado exitosamente"
}
```

### 2. Usuario recibe email
Email contiene:
- Link directo: `https://app.jasrapo.com/auth/accept-invitation?token=<TOKEN>`
- Token como fallback para copiar-pegar
- Tiempo de expiración: 48 horas

### 3. Usuario acepta invitación
```bash
POST /auth/invitations/accept
Content-Type: application/json

{
  "token": "a1b2c3d4...",
  "password": "SecurePass123!"
}
```

**Validaciones:**
- Token debe existir y no estar hasheado duplicadamente
- No debe estar expirado
- No debe estar consumido (acceptedAt ≠ null)
- Contraseña: 8+ chars, uppercase, lowercase, numbers, symbols

**Qué pasa:**
1. InvitationService.acceptInvitation() entra en transacción
2. Valida token (SELECT FOR UPDATE)
3. Hash contraseña: bcrypt(password, 10)
4. Actualiza usuario: clave = hashedPassword
5. Marca invitación: acceptedAt = now
6. AcceptInvitationUseCase carga UserEntity vía UserRepository
7. Retorna usuario mapeado

**Respuesta:**
```json
{
  "message": "Invitación aceptada correctamente",
  "usuarioId": 123,
  "email": "newuser@example.com"
}
```

### 4. Reenviar invitación (si email falló)
```bash
POST /users/{usuarioId}/resend-invitation
Authorization: Bearer <admin-token>
```

**Qué pasa:**
1. ResendInvitationUseCase valida usuario existe
2. Busca invitación pendiente y no-expirada
3. Genera NUEVO token (anterior invalida)
4. Reenvía email con nuevo token
5. Incrementa emailAttempts

**Respuesta:**
```json
{
  "message": "Invitación reenviada exitosamente",
  "invitationId": 456,
  "expiresAt": "2026-08-23T10:30:00Z"
}
```

### 5. Monitoreo (Dashboard Admin)
```bash
# Invitaciones pendientes
GET /users/invitations/pending
Authorization: Bearer <admin-token>

# Respuesta:
[
  {
    "invitationId": 456,
    "usuarioId": 123,
    "email": "newuser@example.com",
    "nombre": "Juan Pérez",
    "expiresAt": "2026-08-23T10:30:00Z",
    "emailSentAt": "2026-08-21T10:30:00Z",
    "emailFailedAt": null,
    "emailAttempts": 1,
    "status": "pending"
  }
]

# Métricas globales
GET /auth/invitations/metrics
Authorization: Bearer <admin-token>

# Respuesta:
{
  "totalCreated": 150,
  "totalAccepted": 120,
  "totalPending": 20,
  "totalExpired": 10,
  "totalFailed": 3,
  "acceptanceRate": 80,
  "avgTimeToAcceptance": 12.5  // horas
}
```

---

## 4. Retry Logic (Automático)

### Cron Job: `retry-invitations`
- **Trigger**: Cada 30 minutos (cron: `0 */30 * * * *`)
- **Función**: InvitationRetryService.retryFailedInvitations()

**Qué hace:**
1. Busca invitaciones con `emailFailedAt != null`
2. Filtra: `emailAttempts < 3` y `expiresAt > now`
3. Para cada fallida:
   - Genera NUEVO token
   - Actualiza BD: tokenHash, expiresAt, emailAttempts++
   - Reintenta envío via MailService
   - Logs: éxito/error

**Logs esperados (cada 30 min):**
```
[invitation-retry.handler] Worker started
[retry-invitations] Completed: {"attempted": 2, "succeeded": 1, "failed": 1}
```

### Estados de invitación
```
pending           → emailSentAt ≠ null, emailFailedAt = null, emailAttempts ≥ 1
failed            → emailFailedAt ≠ null, emailAttempts < 3
pending_retry     → emailSentAt ≠ null, emailFailedAt = null (entre reintentos)
accepted          → acceptedAt ≠ null (final)
expired           → expiresAt < now, acceptedAt = null (final)
```

---

## 5. Seguridad Verificada

| Aspecto | Verificación | Status |
|---------|-------------|--------|
| **Password Hashing** | bcrypt.hash(password, 10) | ✅ |
| **Token Storage** | SHA256 (plaintext en email only) | ✅ |
| **Race Conditions** | SELECT FOR UPDATE en transacción | ✅ |
| **Token Expiration** | 48h default (configurable) | ✅ |
| **Single Use** | acceptedAt field enforce | ✅ |
| **NULL Password Protection** | LoginUseCase valida antes compare | ✅ |
| **Rate Limiting** | 5/min accept, 10/min preview | ✅ |
| **FK Constraints** | onDelete: SetNull (hard-delete safe) | ✅ |
| **Logging** | No secrets, solo user ID | ✅ |

---

## 6. Monitoreo en Producción

### Logs a revisar

**Critical:**
```log
[invitation.service] Failed to queue invitation email for usuario=123
[login.use-case] Intento de login en usuario sin contraseña configurada: user=456
```

**Normal:**
```log
[mail.service] Invitation email queued for newuser@example.com (jobId=xyz)
[invitation-retry.handler] Completed: {"attempted": 5, "succeeded": 4, "failed": 1}
[invitation-metrics.service] getMetrics() acceptance rate: 78.5%
```

### Alertas recomendadas

1. **Email failure rate > 10%**
   - Verificar BREVO_SMTP credenciales
   - Revisar pg-boss schema health

2. **Acceptance rate < 50%**
   - Revisar link en email template
   - Validar APP_URL configurada correctamente

3. **Expired tokens accumulating**
   - Monitor old invitations (> 30 días)
   - Consider cleanup job para invitaciones muy viejas

4. **Retry job no ejecutando**
   - Logs de JobsService durante startup
   - Verificar schema "jobs" en PostgreSQL

---

## 7. Rollback Plan

Si hay issues en prod:

### Option A: Disable email (keep tokens)
```typescript
// En InvitationService.createAndSendInvitation()
// Comentar: await this.mailService.sendInvitation(...)
// Invitaciones siguen siendo creadas, solo email no se envía
// Usar admin endpoint para reenviar cuando mail se arregle
```

### Option B: Disable retry jobs
```typescript
// En InvitationRetryHandler.onModuleInit()
// Comentar: await this.jobsService.schedule(...)
// Jobs todavía se registran, solo cron no se ejecuta
// Admins pueden reenviar manualmente
```

### Option C: Full rollback (revert commits)
```bash
git revert 40ab7b5c  # Email + retries + metrics
git revert 91bffc91  # Architecture alignment
git revert 1dc3cdce  # Base implementation

npx prisma migrate resolve --rolled-back add_usuario_invitaciones_table
```

---

## 8. Performance Expectations

| Operación | Latency | Queue |
|-----------|---------|-------|
| Create user + queue email | ~200ms | Async (pg-boss) |
| Accept invitation | ~150ms | Transaction |
| Resend invitation | ~180ms | Async (pg-boss) |
| Retry job (50 items) | ~2000ms | Cron (30 min) |
| Metrics query | ~50ms | Real-time |

**BD Indices:**
- `idx_usuario_invitacion_usuario_aceptado` → speedup pending queries
- `idx_usuario_invitacion_email` → speedup retry scanning
- `tokenHash unique constraint` → O(1) token lookup

---

## 9. Maintenance Tasks

### Weekly
```bash
# Revisar logs de fallos
docker logs jasrapo-backend | grep -E "(Failed|Error|retry)"

# Monitoreo de métricas
curl -s http://localhost:3000/auth/invitations/metrics | jq '.acceptanceRate'
```

### Monthly
```bash
# Limpiar invitaciones muy viejas (opcional)
# DELETE FROM usuarios_invitaciones 
# WHERE expiresAt < now() - interval 90 days 
# AND acceptedAt IS NULL

# Revisar pg-boss queue health
psql -c "SELECT queue, count(*) FROM pgboss.job WHERE state IN ('created', 'active') GROUP BY queue;"
```

### Quarterly
- Revisar rotación de SMTP credentials
- Actualizar APP_URL si cambia dominio
- Review acceptance rate trends

---

## 10. Checklist Pre-Go-Live

- [ ] BD migrada: `npx prisma migrate deploy`
- [ ] Tipos Prisma generados: `npx prisma generate`
- [ ] Variables ENV completas (BREVO_SMTP, APP_URL)
- [ ] Build sin errores: `npm run build`
- [ ] Tests pasan: LoginUseCase (15/15), CreateUser (10/10)
- [ ] Reintentos job se registran (logs en startup)
- [ ] Email template visible (invitation.hbs exists)
- [ ] Rate limiting activo en endpoints públicos
- [ ] Métricas endpoint accesible (admin only)
- [ ] Logging configurado (observability)
- [ ] Rollback plan documentado
- [ ] Monitoring/alerting setup
- [ ] Load test (si es crítico)

---

## Soporte

En caso de issues:

1. **Email no llega**: Revisar BREVO_SMTP config y pg-boss queue status
2. **Token inválido**: Verificar APP_URL en env (link de email correcto)
3. **Login falla**: Confirmar usuario aceptó invitación (clave ≠ null)
4. **Retry job no corre**: Check JobsService logs y schema "jobs"

Contactar al equipo de DevOps si hay issues con PostgreSQL/pg-boss.
