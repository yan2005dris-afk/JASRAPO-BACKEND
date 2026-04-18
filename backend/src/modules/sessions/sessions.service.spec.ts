import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from 'src/database/prisma.service';

describe('SessionsService', () => {
  let service: SessionsService;

  const mockSession = {
    sessionsId: 'session-123',
    usersId: 1,
    refreshTokenHash: 'hash123',
    ipAddress: '127.0.0.1',
    userAgent: 'TestAgent',
    isRevoked: false,
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
  };

  const mockPrismaService = {
    sessions: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      mockPrismaService.sessions.create.mockResolvedValue(mockSession);

      const result = await service.createSession({
        usersId: 1,
        refreshTokenHash: 'hash123',
        expiresAt: mockSession.expiresAt,
      });

      expect(result).toEqual(mockSession);
      expect(mockPrismaService.sessions.create).toHaveBeenCalledWith({
        data: {
          usersId: 1,
          refreshTokenHash: 'hash123',
          expiresAt: mockSession.expiresAt,
        },
      });
    });

    it('should create session with optional fields', async () => {
      mockPrismaService.sessions.create.mockResolvedValue(mockSession);

      await service.createSession({
        usersId: 1,
        refreshTokenHash: 'hash123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla',
        expiresAt: mockSession.expiresAt,
      });

      expect(mockPrismaService.sessions.create).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should return active non-expired session', async () => {
      mockPrismaService.sessions.findFirst.mockResolvedValue(mockSession);

      const result = await service.getSession(1, 'session-123');

      expect(result).toEqual(mockSession);
    });

    it('should return null for revoked session', async () => {
      mockPrismaService.sessions.findFirst.mockResolvedValue(null);

      const result = await service.getSession(1, 'session-123');

      expect(result).toBeNull();
    });

    it('should return null for expired session', async () => {
      mockPrismaService.sessions.findFirst.mockResolvedValue(null);

      const result = await service.getSession(1, 'session-123');

      expect(result).toBeNull();
    });

    it('should return null for non-existent session', async () => {
      mockPrismaService.sessions.findFirst.mockResolvedValue(null);

      const result = await service.getSession(999, 'not-found');

      expect(result).toBeNull();
    });
  });

  describe('getSessionById', () => {
    it('should return session by id without user filter', async () => {
      mockPrismaService.sessions.findUnique.mockResolvedValue(mockSession);

      const result = await service.getSessionById('session-123');

      expect(result).toEqual(mockSession);
    });

    it('should return null for non-existent session', async () => {
      mockPrismaService.sessions.findUnique.mockResolvedValue(null);

      const result = await service.getSessionById('not-found');

      expect(result).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update session data', async () => {
      const updatedSession = { ...mockSession, ipAddress: '192.168.1.1' };
      mockPrismaService.sessions.update.mockResolvedValue(updatedSession);

      const result = await service.updateSession('session-123', {
        ipAddress: '192.168.1.1',
      });

      expect(result.ipAddress).toBe('192.168.1.1');
    });

    it('should throw when session not found', async () => {
      const error = new Error('Not found');
      error['name'] = 'NotFoundError';
      mockPrismaService.sessions.update.mockRejectedValue(error);

      await expect(
        service.updateSession('not-found', { ipAddress: 'test' }),
      ).rejects.toThrow();
    });
  });

  describe('revokeSession', () => {
    it('should mark session as revoked', async () => {
      const revokedSession = { ...mockSession, isRevoked: true };
      mockPrismaService.sessions.update.mockResolvedValue(revokedSession);

      const result = await service.revokeSession('session-123');

      expect(result.isRevoked).toBe(true);
    });

    it('should call update with isRevoked: true', async () => {
      mockPrismaService.sessions.update.mockResolvedValue({
        ...mockSession,
        isRevoked: true,
      });

      await service.revokeSession('session-123');

      expect(mockPrismaService.sessions.update).toHaveBeenCalledWith({
        where: { sessionsId: 'session-123' },
        data: { isRevoked: true },
      });
    });
  });

  describe('listSessionsByUser', () => {
    it('should return active non-expired sessions for user', async () => {
      mockPrismaService.sessions.findMany.mockResolvedValue([mockSession]);

      const result = await service.listSessionsByUser(1);

      expect(result).toEqual([mockSession]);
    });

    it('should filter out revoked sessions', async () => {
      mockPrismaService.sessions.findMany.mockResolvedValue([mockSession]);

      await service.listSessionsByUser(1);

      expect(mockPrismaService.sessions.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRevoked: false,
          }),
        }),
      );
    });

    it('should filter out expired sessions', async () => {
      mockPrismaService.sessions.findMany.mockResolvedValue([mockSession]);

      await service.listSessionsByUser(1);

      expect(mockPrismaService.sessions.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            expiresAt: expect.objectContaining({ gt: expect.any(Date) }),
          }),
        }),
      );
    });

    it('should return empty array when no sessions exist', async () => {
      mockPrismaService.sessions.findMany.mockResolvedValue([]);

      const result = await service.listSessionsByUser(1);

      expect(result).toEqual([]);
    });

    it('should order by createdAt descending', async () => {
      mockPrismaService.sessions.findMany.mockResolvedValue([]);

      await service.listSessionsByUser(1);

      expect(mockPrismaService.sessions.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });
});