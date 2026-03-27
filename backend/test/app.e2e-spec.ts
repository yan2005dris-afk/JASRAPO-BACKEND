import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { SessionsService } from '../src/modules/sessions/sessions.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let sessionsService: SessionsService;

  const testUser = {
    email: 'e2e-test@jasrapo.com',
    password: 'TestPass123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        users: {
          findUnique: jest.fn(),
          create: jest.fn(),
          delete: jest.fn(),
        },
        profiles: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      })
      .overrideProvider(SessionsService)
      .useValue({
        createSession: jest.fn(),
        getSession: jest.fn(),
        updateSession: jest.fn(),
        revokeSession: jest.fn(),
        deleteSession: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    sessionsService = moduleFixture.get<SessionsService>(SessionsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.users.create as jest.Mock).mockResolvedValue({
        usersId: 999,
        email: testUser.email,
      });
      (sessionsService.createSession as jest.Mock).mockResolvedValue({
        sessionsId: 'test-session-id',
        usersId: 999,
        refreshTokenHash: 'hashedToken',
        ipAddress: null,
        userAgent: null,
        isRevoked: false,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject registration with duplicate email', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue({
        usersId: 1,
        email: testUser.email,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid-email', password: 'TestPass123!' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@jasrapo.com', password: 'weak' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should normalize email to lowercase', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.users.create as jest.Mock).mockResolvedValue({
        usersId: 1000,
        email: 'lowercase@jasrapo.com',
      });
      (sessionsService.createSession as jest.Mock).mockResolvedValue({
        sessionsId: 'test-session-id',
        usersId: 1000,
        refreshTokenHash: 'hashedToken',
        ipAddress: null,
        userAgent: null,
        isRevoked: false,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'UPPERCASE@JASRAPO.COM', password: 'TestPass123!' })
        .expect(201);

      expect(response.body.email).toBe('uppercase@jasrapo.com');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue({
        usersId: 1,
        email: testUser.email,
        password: '$2a$10$hashedpassword',
      });
      (sessionsService.createSession as jest.Mock).mockResolvedValue({
        sessionsId: 'test-session-id',
        usersId: 1,
        refreshTokenHash: 'hashedToken',
        ipAddress: null,
        userAgent: null,
        isRevoked: false,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject login with invalid credentials', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@jasrapo.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    });

    it('should normalize email before login', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue({
        usersId: 1,
        email: 'normalized@jasrapo.com',
        password: '$2a$10$hashedpassword',
      });
      (sessionsService.createSession as jest.Mock).mockResolvedValue({
        sessionsId: 'test-session-id',
        usersId: 1,
        refreshTokenHash: 'hashedToken',
        ipAddress: null,
        userAgent: null,
        isRevoked: false,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: '  NORMALIZED@JASRAPO.COM  ', password: 'TestPass123!' })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh token with valid session', async () => {
      const mockSession = {
        sessionsId: 'test-session-id',
        usersId: 1,
        refreshTokenHash: '$2a$10$hashedrefresh',
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
      };

      (sessionsService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (sessionsService.updateSession as jest.Mock).mockResolvedValue({
        ...mockSession,
        refreshTokenHash: 'newHashedToken',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=valid-refresh-token')
        .send()
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject refresh with invalid session', async () => {
      (sessionsService.getSession as jest.Mock).mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .send()
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject refresh with revoked session', async () => {
      const mockSession = {
        sessionsId: 'revoked-session-id',
        usersId: 1,
        refreshTokenHash: '$2a$10$hashed',
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
      };

      (sessionsService.getSession as jest.Mock).mockResolvedValue(mockSession);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=revoked-token')
        .send()
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully', async () => {
      (sessionsService.revokeSession as jest.Mock).mockResolvedValue({
        sessionsId: 'test-session-id',
        usersId: 1,
        refreshTokenHash: 'hashedToken',
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
        isRevoked: true,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(sessionsService.revokeSession).toHaveBeenCalled();
    });

    it('should clear refresh token cookie on logout', async () => {
      (sessionsService.revokeSession as jest.Mock).mockResolvedValue({
        sessionsId: 'test-session-id',
        usersId: 1,
        refreshTokenHash: 'hashedToken',
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
        isRevoked: true,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Protected routes', () => {
    it('should reject access to protected routes without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/me')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});
