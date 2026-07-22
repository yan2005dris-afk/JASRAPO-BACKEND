import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaRoleRepository } from './prisma-role.repository';

describe('PrismaRoleRepository.syncSequence', () => {
  const SEQUENCE_NAME = 'public.roles_rol_id_seq';

  let mockPrisma: {
    $queryRaw: jest.Mock;
    $executeRawUnsafe: jest.Mock;
  };

  let repository: PrismaRoleRepository;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: jest.fn(),
      $executeRawUnsafe: jest.fn(),
    };
    repository = new PrismaRoleRepository(mockPrisma as any);
  });

  it('uses $queryRaw with a Prisma.sql tagged template (never $executeRawUnsafe)', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ seq: SEQUENCE_NAME }]);

    await repository.syncSequence();

    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(2);
    expect(mockPrisma.$executeRawUnsafe).not.toHaveBeenCalled();

    const setvalCallArg = mockPrisma.$queryRaw.mock.calls[1][0];
    expect(Prisma.sql`SELECT setval('x', 1, false)`).toHaveProperty('strings');
    expect(setvalCallArg).toHaveProperty('strings');
    expect(setvalCallArg).toHaveProperty('values');
  });

  it('parameterizes the sequence name and computes MAX(rol_id) + 1', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ seq: SEQUENCE_NAME }]);

    await repository.syncSequence();

    const setvalCallArg = mockPrisma.$queryRaw.mock.calls[1][0] as {
      strings: string[];
      values: unknown[];
    };

    const renderedSql = setvalCallArg.strings
      .map((chunk, i) =>
        i < setvalCallArg.values.length ? `${chunk}?` : chunk,
      )
      .join('');

    expect(renderedSql).toContain('setval');
    expect(renderedSql).toContain('SELECT MAX(rol_id) FROM roles');
    expect(renderedSql).toMatch(/\+\s*1/);
    expect(setvalCallArg.values).toContain(SEQUENCE_NAME);
    expect(renderedSql).not.toContain(SEQUENCE_NAME);
  });

  it('skips the setval call when the sequence cannot be resolved', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ seq: null }]);

    await repository.syncSequence();

    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(mockPrisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });
});
