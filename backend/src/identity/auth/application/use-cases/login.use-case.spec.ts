import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from '../../../sessions/application/sessions.service';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

jest.mock('bcrypt');
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: () => 'test-uuid-1234-5678',
}));

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let sessionsService: jest.Mocked<SessionsService>;
  let configService: jest.Mocked<ConfigService>;

  const baseUserMock = {
    usuarioId: 1,
    email: 'test@jasrapo.com',
    clave: 'hashedPassword',
    deletedAt: null,
    nombres: 'Juan',
    apellidos: 'Pérez',
    avatar: { url: 'https://example.com/avatar.png', key: 'avatar.png' },
    rolId: 1,
    rol: { rolId: 1, nombre: 'admin', deletedAt: null },
    intentosFallidos: 0,
    ultimoIntentoFallidoEn: null,
    bloqueadoHasta: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        LoginUseCase,
        {
          provide: UserRepository,
          useValue: {
            findByEmailWithPassword: jest.fn(),
            recordFailedLoginAttempt: jest.fn(),
            clearFailedLoginAttempts: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_ACCESS_SECRET: 'test-access-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
            get: jest.fn((_key: string, fallback?: unknown) => fallback),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            createSession: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
    sessionsService = module.get(SessionsService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should login successfully with minimal data retrieval', async () => {
      const loginDto = { email: 'test@jasrapo.com', password: 'Password123!' };

      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        baseUserMock,
      );

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      jwtService.decode
        .mockReturnValueOnce({ iat: 1000, exp: 2000 })
        .mockReturnValueOnce({ iat: 1000, exp: 2000 });

      sessionsService.createSession.mockResolvedValue({} as any);

      const result = await useCase.execute(loginDto, '127.0.0.1', 'Chrome');

      expect(result).toMatchObject({
        sub: 1,
        email: 'test@jasrapo.com',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        nombre: 'Juan Pérez',
        avatar: {
          key: 'avatar.png',
          url: 'https://example.com/avatar.png',
        },
        rolId: 1,
        nombreRol: 'admin',
      });

      expect(sessionsService.createSession).toHaveBeenCalled();
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledTimes(1);
      expect(userRepository.clearFailedLoginAttempts).toHaveBeenCalledWith(1);
      expect(userRepository.recordFailedLoginAttempt).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        useCase.execute({ email: 'notfound@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password invalid', async () => {
      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...baseUserMock,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (userRepository.recordFailedLoginAttempt as jest.Mock).mockResolvedValue({
        intentosFallidos: 1,
        bloqueadoHasta: null,
      });

      await expect(
        useCase.execute({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepository.recordFailedLoginAttempt).toHaveBeenCalledWith(1, {
        threshold: 5,
        windowMs: 15 * 60 * 1000,
        lockoutDurationMs: 30 * 60 * 1000,
      });
    });

    it('should throw InternalServerErrorException when session creation fails', async () => {
      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...baseUserMock,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      sessionsService.createSession.mockRejectedValue(new Error('DB Error'));

      await expect(
        useCase.execute({ email: 'test@test.com', password: 'pass' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should return null rolId and nombreRol when role is soft-deleted', async () => {
      const loginDto = { email: 'test@jasrapo.com', password: 'Password123!' };

      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...baseUserMock,
        rol: { rolId: 1, nombre: 'admin', deletedAt: new Date() },
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      jwtService.decode
        .mockReturnValueOnce({ iat: 1000, exp: 2000 })
        .mockReturnValueOnce({ iat: 1000, exp: 2000 });

      sessionsService.createSession.mockResolvedValue({} as any);

      const result = await useCase.execute(loginDto, '127.0.0.1', 'Chrome');

      expect(result).toMatchObject({
        sub: 1,
        email: 'test@jasrapo.com',
        rolId: null,
        nombreRol: null,
      });
    });
  });

  describe('brute-force lockout (issue #136)', () => {
    it('should throw lockout error on the 6th attempt after 5 consecutive failures', async () => {
      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...baseUserMock,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // En el 6to intento, el repositorio indica que la cuenta acaba de ser
      // bloqueada (bloqueadoHasta en el futuro). El mensaje debe ser el de
      // lockout, no el genérico de credenciales inválidas.
      (userRepository.recordFailedLoginAttempt as jest.Mock).mockResolvedValue({
        intentosFallidos: 0,
        bloqueadoHasta: new Date(Date.now() + 30 * 60 * 1000),
      });

      await expect(
        useCase.execute({
          email: 'test@jasrapo.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(/Cuenta bloqueada temporalmente/);

      expect(userRepository.recordFailedLoginAttempt).toHaveBeenCalledTimes(1);
    });

    it('should reset failed-attempt counter after a successful login', async () => {
      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...baseUserMock,
        // El usuario viene con contadores sucios de intentos previos.
        intentosFallidos: 4,
        ultimoIntentoFallidoEn: new Date(Date.now() - 60 * 1000),
        bloqueadoHasta: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      jwtService.decode
        .mockReturnValueOnce({ iat: 1000, exp: 2000 })
        .mockReturnValueOnce({ iat: 1000, exp: 2000 });

      sessionsService.createSession.mockResolvedValue({} as any);

      const result = await useCase.execute({
        email: 'test@jasrapo.com',
        password: 'Password123!',
      });

      expect(result.accessToken).toBe('access-token');
      expect(userRepository.clearFailedLoginAttempts).toHaveBeenCalledWith(1);
      expect(userRepository.recordFailedLoginAttempt).not.toHaveBeenCalled();
    });

    it('should block login with valid credentials while bloqueadoHasta is in the future', async () => {
      const futureLockout = new Date(Date.now() + 30 * 60 * 1000);
      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...baseUserMock,
        bloqueadoHasta: futureLockout,
        intentosFallidos: 5,
      });

      // Aunque la contraseña sea correcta, el lockout prevalece.
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        useCase.execute({
          email: 'test@jasrapo.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(/Cuenta bloqueada temporalmente/);

      expect(userRepository.clearFailedLoginAttempts).not.toHaveBeenCalled();
      expect(sessionsService.createSession).not.toHaveBeenCalled();
    });

    it('should apply sliding 15-min window: counter restarts at 1 when last failure is older than the window', async () => {
      // El usuario llega con un contador sucio de 5 fallos pero el último fue
      // hace 16 minutos (fuera de la ventana deslizante de 15 min).
      const oldFailure = new Date(Date.now() - 16 * 60 * 1000);
      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...baseUserMock,
        intentosFallidos: 5,
        ultimoIntentoFallidoEn: oldFailure,
        bloqueadoHasta: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // El repositorio respeta la ventana deslizante y reinicia el contador a 1.
      (userRepository.recordFailedLoginAttempt as jest.Mock).mockResolvedValue({
        intentosFallidos: 1,
        bloqueadoHasta: null,
      });

      await expect(
        useCase.execute({
          email: 'test@jasrapo.com',
          password: 'wrong',
        }),
      ).rejects.toThrow('Credenciales inválidas');

      // No debe disparar lockout porque el contador se reinició a 1.
      expect(userRepository.recordFailedLoginAttempt).toHaveBeenCalledWith(1, {
        threshold: 5,
        windowMs: 15 * 60 * 1000,
        lockoutDurationMs: 30 * 60 * 1000,
      });
    });
  });

  describe('bcrypt cost upgrade (issue #137)', () => {
    const setupSuccessfulLogin = () => {
      (userRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...baseUserMock,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('rehashed-password');
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      jwtService.decode
        .mockReturnValueOnce({ iat: 1000, exp: 2000 })
        .mockReturnValueOnce({ iat: 1000, exp: 2000 });
      sessionsService.createSession.mockResolvedValue({} as any);
    };

    it('re-hashes the plaintext password when stored cost is below the target', async () => {
      setupSuccessfulLogin();
      (bcrypt.getRounds as jest.Mock).mockReturnValue(10);

      await useCase.execute({
        email: 'test@jasrapo.com',
        password: 'Password123!',
      });

      // Re-hashea la CONTRASEÑA en claro, no el hash almacenado, a cost 12.
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        clave: 'rehashed-password',
      });
    });

    it('does not re-hash when stored cost already meets the target', async () => {
      setupSuccessfulLogin();
      (bcrypt.getRounds as jest.Mock).mockReturnValue(12);

      await useCase.execute({
        email: 'test@jasrapo.com',
        password: 'Password123!',
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('honors a configured BCRYPT_COST value', async () => {
      setupSuccessfulLogin();
      (bcrypt.getRounds as jest.Mock).mockReturnValue(10);
      (configService.get as jest.Mock).mockImplementation(
        (key: string, fallback?: unknown) =>
          key === 'BCRYPT_COST' ? 14 : fallback,
      );

      await useCase.execute({
        email: 'test@jasrapo.com',
        password: 'Password123!',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 14);
    });

    it('does not block login if the re-hash update fails', async () => {
      setupSuccessfulLogin();
      (bcrypt.getRounds as jest.Mock).mockReturnValue(10);
      (userRepository.update as jest.Mock).mockRejectedValue(
        new Error('DB down'),
      );

      const result = await useCase.execute({
        email: 'test@jasrapo.com',
        password: 'Password123!',
      });

      expect(result.accessToken).toBe('access-token');
    });
  });
});
