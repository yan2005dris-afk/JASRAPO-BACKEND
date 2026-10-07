import { BadRequestException } from '@nestjs/common';
import { OperatorNoveltiesController } from './operator-novelties.controller';
import { OperatorNoveltiesService } from '../../application/operator-novelties.service';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';

describe('OperatorNoveltiesController', () => {
  const service = { list: jest.fn(), findOne: jest.fn(), update: jest.fn() };
  const controller = new OperatorNoveltiesController(
    service as unknown as OperatorNoveltiesService,
  );
  const user = { sub: 9 } as JwtPayload;

  beforeEach(() => jest.clearAllMocks());

  it('paginates the authenticated operator novelties', async () => {
    service.list.mockResolvedValue({ data: [], total: 0 });
    await controller.list(user, '2', '20');
    expect(service.list).toHaveBeenCalledWith(9, 2, 20);
    expect(() => controller.list(user, '0', '20')).toThrow(BadRequestException);
  });

  it('uses the authenticated operator for detail and update', async () => {
    await controller.findOne(user, 12n);
    await controller.update(user, 12n, { tipo: undefined }, undefined);
    expect(service.findOne).toHaveBeenCalledWith(9, 12n);
    expect(service.update).toHaveBeenCalledWith(
      9,
      12n,
      { tipo: undefined },
      undefined,
    );
  });
});
