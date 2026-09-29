import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetServiceAreaUseCase } from './get-service-area.use-case';
import { SERVICE_AREA } from '../../domain/policies/service-area.policy';

describe('GetServiceAreaUseCase', () => {
  let useCase: GetServiceAreaUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetServiceAreaUseCase],
    }).compile();

    useCase = module.get<GetServiceAreaUseCase>(GetServiceAreaUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('returns the Manglaralto service area used to validate coordinates', () => {
    const result = useCase.execute();

    expect(result).toBe(SERVICE_AREA);
    expect(result).toMatchObject({
      nombre: 'Parroquia Manglaralto',
      fuente: 'OpenStreetMap (relation 278708), ODbL',
      geometria: { type: 'Polygon' },
    });
  });
});
