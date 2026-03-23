import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { RedisSessionService } from '../src/redis/redis-session.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let redisSessionService: RedisSessionService;

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
      .overrideProvider(RedisSessionService)
      .useValue({
        setSession: jest.fn(),
        getSession: jest.fn(),
        delSession: jest.fn(),
        listSessionsByUser: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    redisSessionService =
      moduleFixture.get<RedisSessionService>(RedisSessionService);
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
      (redisSessionService.setSession as jest.Mock).mockResolvedValue(
        undefined,
      );

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty(
        'email',
        testUser.email.toLowerCase(),
      );
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
      (redisSessionService.setSession as jest.Mock).mockResolvedValue(
        undefined,
      );

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'UPPERCASE@JASRAPO.COM', password: 'TestPass123!' })
        .expect(201);

      expect(response.body.user.email).toBe('uppercase@jasrapo.com');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue({
        usersId: 1,
        email: testUser.email,
        password: '$2a$10$hashedpassword',
      });
      (redisSessionService.setSession as jest.Mock).mockResolvedValue(
        undefined,
      );

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
      (redisSessionService.setSession as jest.Mock).mockResolvedValue(
        undefined,
      );

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
        email: testUser.email,
        isRevoked: false,
        refreshToken: '$2a$10$hashedrefresh',
        expiresAt: Date.now() + 86400000,
      };

      (redisSessionService.getSession as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (redisSessionService.setSession as jest.Mock).mockResolvedValue(
        undefined,
      );

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=valid-refresh-token')
        .send()
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject refresh with invalid session', async () => {
      (redisSessionService.getSession as jest.Mock).mockResolvedValue(null);

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
        isRevoked: true,
        refreshToken: '$2a$10$hashed',
        expiresAt: Date.now() + 86400000,
      };

      (redisSessionService.getSession as jest.Mock).mockResolvedValue(
        mockSession,
      );

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
      (redisSessionService.delSession as jest.Mock).mockResolvedValue(
        undefined,
      );

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(redisSessionService.delSession).toHaveBeenCalled();
    });

    it('should clear refresh token cookie on logout', async () => {
      (redisSessionService.delSession as jest.Mock).mockResolvedValue(
        undefined,
      );

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
