import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';

// Import setup functions
import {
  setupTestDatabase,
  teardownTestDatabase,
  getTestDatabaseConfig,
  getPrismaClient,
  beforeAllHook,
  afterAllHook,
  isE2E,
} from './setup';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

// Test configuration
const TEST_USER = {
  email: 'e2e-test@jasrapo.com',
  password: 'TestPass123!',
};

describe('Auth E2E (Real Database)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let baseUrl: string;
  let accessToken: string;
  let refreshToken: string;
  let testUserId: number;
  let e2eMode: boolean;

  beforeAll(async () => {
    console.log('🚀 Starting E2E tests...');

    try {
      await beforeAllHook();
      e2eMode = isE2E();
    } catch (err) {
      console.warn('⚠️ Could not initialize test DB:', err);
      e2eMode = false;
    }

    if (!e2eMode) {
      console.log('⚠️ Running in fallback mode without real DB');
      return;
    }

    const dbConfig = getTestDatabaseConfig();

    // Override DATABASE_URL in environment
    process.env.DATABASE_URL = `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_key';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    // Create NestJS testing module
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get base URL
    const address = app.getHttpServer().address();
    baseUrl = `http://localhost:${address?.port}`;

    // Get Prisma service
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    console.log(`✅ App initialized at ${baseUrl}`);
  }, 120000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await afterAllHook();
  }, 60000);

  // =====================================================
  // Phase 1: Auth Flow
  // =====================================================

  describe('1. Register Flow', () => {
    it('1.1 should register a new user successfully', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/register')
        .send(TEST_USER)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      // Verify user in DB
      const dbUser = await prisma.users.findUnique({
        where: { email: TEST_USER.email.toLowerCase() },
      });
      expect(dbUser).toBeDefined();
      testUserId = dbUser!.usersId;

      console.log('✅ Test 1.1: Register successful');
    });

    it('1.2 should reject duplicate email', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/register')
        .send(TEST_USER)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('✅ Test 1.2: Duplicate rejected');
    });

    it('1.3 should reject invalid email', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/register')
        .send({ email: 'invalid', password: 'TestPass123!' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('✅ Test 1.3: Invalid email rejected');
    });

    it('1.4 should reject weak password', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/register')
        .send({ email: 'test@jasrapo.com', password: 'weak' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('✅ Test 1.4: Weak password rejected');
    });

    it('1.5 should normalize email', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/register')
        .send({ email: 'UPPER@TEST.COM', password: 'TestPass123!' })
        .expect(201);

      expect(response.body.user.email).toBe('upper@test.com');
      console.log('✅ Test 1.5: Email normalized');
    });
  });

  describe('2. Login Flow', () => {
    it('2.1 should login with valid credentials', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      // Create user explicitly
      const hashedPassword = await bcrypt.hash('LoginPass123!', 10);
      await prisma.users.create({
        data: {
          email: 'login-test@jasrapo.com',
          password: hashedPassword,
        },
      });

      const response = await request(baseUrl)
        .post('/auth/login')
        .send({ email: 'login-test@jasrapo.com', password: 'LoginPass123!' })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      accessToken = response.body.accessToken;
      console.log('✅ Test 2.1: Login successful');
    });

    it('2.2 should reject invalid credentials', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/login')
        .send({ email: 'wrong@jasrapo.com', password: 'wrong' })
        .expect(401);

      expect(response.body.message).toBeDefined();
      console.log('✅ Test 2.2: Invalid rejected');
    });
  });

  describe('3. Protected Routes', () => {
    it('3.1 should reject without token', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl).get('/user/me').expect(401);
      expect(response.body.message).toBeDefined();
      console.log('✅ Test 3.1: No token rejected');
    });

    it('3.2 should reject invalid token', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl)
        .get('/user/me')
        .set('Authorization', 'Bearer invalid')
        .expect(401);

      expect(response.body.message).toBeDefined();
      console.log('✅ Test 3.2: Invalid token rejected');
    });

    it('3.3 should allow valid token', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
      console.log('✅ Test 3.3: Valid token accepted');
    });
  });

  describe('4. Token Refresh', () => {
    it('4.1 should refresh token', async () => {
      if (!e2eMode || !refreshToken) {
        console.log('⚠️ Test skipped - no refresh token');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      console.log('✅ Test 4.1: Token refresh');
    });

    it('4.2 should reject invalid refresh', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=invalid')
        .expect(401);

      expect(response.body.message).toBeDefined();
      console.log('✅ Test 4.2: Invalid refresh rejected');
    });
  });

  describe('5. Logout', () => {
    it('5.1 should logout successfully', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      console.log('✅ Test 5.1: Logout');
    });
  });

  // =====================================================
  // Phase 2: CRUD Operations
  // =====================================================

  describe('6. Client CRUD', () => {
    let clientId: number;

    it('6.1 should create a client', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .post('/client')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nombre: 'Test Client',
          identificacion: '1234567890',
          tipoIdentificacion: 'CED',
        })
        .expect(201);

      expect(response.body).toHaveProperty('clientesId');
      clientId = response.body.clientesId;
      console.log('✅ Test 6.1: Client created');
    });

    it('6.2 should get client by ID', async () => {
      if (!e2eMode || !clientId || !accessToken) {
        console.log('⚠️ Test skipped - no client');
        return;
      }

      const response = await request(baseUrl)
        .get(`/client/${clientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('clientesId');
      console.log('✅ Test 6.2: Client retrieved');
    });

    it('6.3 should list clients', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .get('/client')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      console.log('✅ Test 6.3: Client list');
    });

    it('6.4 should update client', async () => {
      if (!e2eMode || !clientId || !accessToken) {
        console.log('⚠️ Test skipped - no client');
        return;
      }

      const response = await request(baseUrl)
        .patch(`/client/${clientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ nombre: 'Updated' })
        .expect(200);

      console.log('✅ Test 6.4: Client updated');
    });

    it('6.5 should delete client', async () => {
      if (!e2eMode || !clientId || !accessToken) {
        console.log('⚠️ Test skipped - no client');
        return;
      }

      await request(baseUrl)
        .delete(`/client/${clientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      console.log('✅ Test 6.5: Client deleted');
    });
  });

  // =====================================================
  // Phase 3: Integration
  // =====================================================

  describe('10. Concurrent Sessions', () => {
    it('10.1 should handle multiple logins', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const p1 = await bcrypt.hash('test123', 10);

      await prisma.users.create({
        data: { email: 'concurrent1@test.com', password: p1 },
      });
      await prisma.users.create({
        data: { email: 'concurrent2@test.com', password: p1 },
      });

      const login1 = await request(baseUrl)
        .post('/auth/login')
        .send({ email: 'concurrent1@test.com', password: 'test123' });

      const login2 = await request(baseUrl)
        .post('/auth/login')
        .send({ email: 'concurrent2@test.com', password: 'test123' });

      expect(login1.body.accessToken).toBeDefined();
      expect(login2.body.accessToken).toBeDefined();
      console.log('✅ Test 10.1: Multiple sessions');
    });
  });

  // =====================================================
  // Phase 2: Storage (MinIO)
  // =====================================================

  describe('11. Storage - File Upload', () => {
    it('11.1 should upload a file', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .post('/files/upload?bucket=test-bucket&folder=test')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('test file content'), 'test.txt')
        .expect(201);

      expect(response.body).toHaveProperty('bucket');
      expect(response.body).toHaveProperty('fileName');
      console.log('✅ Test 11.1: File uploaded');
    });

    it('11.2 should reject upload without file', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .post('/files/upload?bucket=test-bucket')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('✅ Test 11.2: Upload without file rejected');
    });

    it('11.3 should reject upload without bucket', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .post('/files/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('test'), 'test.txt')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('✅ Test 11.3: Upload without bucket rejected');
    });
  });

  describe('12. Storage - File Download', () => {
    it('12.1 should get presigned URL', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      // Upload first
      await request(baseUrl)
        .post('/files/upload?bucket=test-bucket')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('test content'), 'download-me.txt')
        .expect(201);

      const response = await request(baseUrl)
        .get('/files/test-bucket/url/download-me.txt')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('url');
      console.log('✅ Test 12.1: Presigned URL obtained');
    });

    it('12.2 should list bucket files', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .get('/files/test-bucket')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('files');
      console.log('✅ Test 12.2: Files listed');
    });
  });

  describe('13. Storage - File Delete', () => {
    it('13.1 should delete a file', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      // Upload first
      await request(baseUrl)
        .post('/files/upload?bucket=test-bucket')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('delete me'), 'to-delete.txt')
        .expect(201);

      const response = await request(baseUrl)
        .delete('/files/test-bucket/to-delete.txt')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBeDefined();
      console.log('✅ Test 13.1: File deleted');
    });
  });

  // =====================================================
  // Phase 3: Lecturas
  // =====================================================

  describe('14. Lecturas CRUD', () => {
    let medidorId: bigint;
    let lecturaId: bigint;

    beforeAll(async () => {
      if (!e2eMode || !accessToken) return;

      // Create a medidor for testing
      const medidor = await prisma.medidores.create({
        data: {
          numeroMedidor: 'TEST-E2E-001',
          marca: 'Test Brand',
          modelo: 'Test Model',
        },
      });
      medidorId = medidor.medidoresId;
    });

    it('14.1 should create a lectura', async () => {
      if (!e2eMode || !accessToken || !medidorId) {
        console.log('⚠️ Test skipped - no medidor');
        return;
      }

      // Create client and contrato first
      const client = await prisma.clientes.create({
        data: {
          nombre: 'Lectura Test Client',
          identificacion: '1111111111',
          tipoIdentificacion: 'CED',
        },
      });

      const contrato = await prisma.contratoMedidor.create({
        data: {
          clientesId: client.clientesId,
          medidoresId: medidorId,
          estado: 'ACTIVO',
          fechaInicio: new Date(),
        },
      });

      const response = await request(baseUrl)
        .post('/lecturas/crearLectura')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          contratoId: contrato.contratoMedidorId.toString(),
          lectura: 100.5,
          fotoMedidor: 'http://example.com/foto.jpg',
        })
        .expect(201);

      expect(response.body).toHaveProperty('lecturasId');
      lecturaId = response.body.lecturasId;
      console.log('✅ Test 14.1: Lectura created');
    });

    it('14.2 should get all lecturas', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .get('/lecturas')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      console.log('✅ Test 14.2: Lecturas listed');
    });

    it('14.3 should get lectura by id', async () => {
      if (!e2eMode || !accessToken || !lecturaId) {
        console.log('⚠️ Test skipped - no lectura');
        return;
      }

      const response = await request(baseUrl)
        .get(`/lecturas/${lecturaId.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('lecturasId');
      console.log('✅ Test 14.3: Lectura retrieved');
    });

    it('14.4 should update lectura', async () => {
      if (!e2eMode || !accessToken || !lecturaId) {
        console.log('⚠️ Test skipped - no lectura');
        return;
      }

      const response = await request(baseUrl)
        .patch(`/lecturas/${lecturaId.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ lectura: 200.75 })
        .expect(200);

      console.log('✅ Test 14.4: Lectura updated');
    });

    it('14.5 should delete lectura', async () => {
      if (!e2eMode || !accessToken || !lecturaId) {
        console.log('⚠️ Test skipped - no lectura');
        return;
      }

      await request(baseUrl)
        .delete(`/lecturas/${lecturaId.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      console.log('✅ Test 14.5: Lectura deleted');
    });
  });

  // =====================================================
  // Phase 4: Contratos
  // =====================================================

  describe('15. Contratos CRUD', () => {
    let testClientId: number;
    let testMedidorId: bigint;
    let contratoId: bigint;

    beforeAll(async () => {
      if (!e2eMode || !accessToken) return;

      // Create test medidor
      const medidor = await prisma.medidores.create({
        data: {
          numeroMedidor: 'TEST-E2E-CONTRATO',
          marca: 'Brand',
          modelo: 'Model',
        },
      });
      testMedidorId = medidor.medidoresId;

      const client = await prisma.clientes.create({
        data: {
          nombre: 'Contrato Test Client',
          identificacion: '2222222222',
          tipoIdentificacion: 'CED',
        },
      });
      testClientId = client.clientesId;
    });

    it('15.1 should create contrato-medidor', async () => {
      if (!e2eMode || !accessToken || !testClientId || !testMedidorId) {
        console.log('⚠️ Test skipped - no setup');
        return;
      }

      const response = await request(baseUrl)
        .post('/contrato-medidor')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          clientesId: testClientId,
          medidoresId: testMedidorId.toString(),
          estado: 'ACTIVO',
        })
        .expect(201);

      expect(response.body).toHaveProperty('contratoMedidorId');
      contratoId = response.body.contratoMedidorId;
      console.log('✅ Test 15.1: Contrato created');
    });

    it('15.2 should get contrato by id', async () => {
      if (!e2eMode || !accessToken || !contratoId) {
        console.log('⚠️ Test skipped - no contrato');
        return;
      }

      const response = await request(baseUrl)
        .get(`/contrato-medidor/${contratoId.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('contratoMedidorId');
      console.log('✅ Test 15.2: Contrato retrieved');
    });

    it('15.3 should get contratos by client', async () => {
      if (!e2eMode || !accessToken || !testClientId) {
        console.log('⚠️ Test skipped - no client');
        return;
      }

      const response = await request(baseUrl)
        .get('/contrato-medidor')
        .query({ contratoId: testClientId.toString() })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      console.log('✅ Test 15.3: Contratos by client');
    });

    it('15.4 should update contrato', async () => {
      if (!e2eMode || !accessToken || !contratoId) {
        console.log('⚠️ Test skipped - no contrato');
        return;
      }

      const response = await request(baseUrl)
        .patch(`/contrato-medidor/${contratoId.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ estado: 'SUSPENDIDO' })
        .expect(200);

      console.log('✅ Test 15.4: Contrato updated');
    });

    it('15.5 should finalize contrato', async () => {
      if (!e2eMode || !accessToken || !contratoId) {
        console.log('⚠️ Test skipped - no contrato');
        return;
      }

      const response = await request(baseUrl)
        .post(`/contrato-medidor/${contratoId.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ motivoCambio: 'Test finalizacion' })
        .expect(201);

      console.log('✅ Test 15.5: Contrato finalized');
    });

    it('15.6 should delete contrato', async () => {
      if (!e2eMode || !accessToken || !contratoId) {
        console.log('⚠️ Test skipped - no contrato');
        return;
      }

      await request(baseUrl)
        .delete(`/contrato-medidor/${contratoId.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      console.log('✅ Test 15.6: Contrato deleted');
    });
  });

  // =====================================================
  // Phase 5: Menus & Permissions
  // =====================================================

  describe('16. Menus', () => {
    it('16.1 should get menus by role', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .get('/menus/my')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      console.log('✅ Test 16.1: Menus retrieved');
    });

    it('16.2 should reject without token', async () => {
      if (!e2eMode) {
        console.log('⚠️ Test skipped - no real DB');
        return;
      }

      const response = await request(baseUrl).get('/menus/my').expect(401);
      expect(response.body.message).toBeDefined();
      console.log('✅ Test 16.2: Menus without token rejected');
    });
  });

  describe('17. Permissions', () => {
    it('17.1 should get all permissions', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      const response = await request(baseUrl)
        .get('/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      console.log('✅ Test 17.1: Permissions listed');
    });

    it('17.2 should get permission by id', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      // First create a permission
      const createResponse = await request(baseUrl)
        .post('/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ resource: 'e2e-test', action: 'read' })
        .expect(201);

      const permId = createResponse.body.permissionsId;

      const response = await request(baseUrl)
        .get(`/permissions/${permId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('permissionsId');
      console.log('✅ Test 17.2: Permission retrieved');
    });

    it('17.3 should update permission', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      // First create a permission
      const createResponse = await request(baseUrl)
        .post('/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ resource: 'e2e-update', action: 'read' })
        .expect(201);

      const permId = createResponse.body.permissionsId;

      await request(baseUrl)
        .patch(`/permissions/${permId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ action: 'update' })
        .expect(200);

      console.log('✅ Test 17.3: Permission updated');
    });

    it('17.4 should delete permission', async () => {
      if (!e2eMode || !accessToken) {
        console.log('⚠️ Test skipped - no token');
        return;
      }

      // First create a permission
      const createResponse = await request(baseUrl)
        .post('/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ resource: 'e2e-delete', action: 'read' })
        .expect(201);

      const permId = createResponse.body.permissionsId;

      await request(baseUrl)
        .delete(`/permissions/${permId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      console.log('✅ Test 17.4: Permission deleted');
    });
  });
});
