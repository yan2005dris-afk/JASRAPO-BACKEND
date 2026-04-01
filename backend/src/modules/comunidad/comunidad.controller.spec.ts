import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadController } from './comunidad.controller';
import { ComunidadService } from './comunidad.service';

describe('ComunidadController', () => {
  let controller: ComunidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComunidadController],
      providers: [ComunidadService],
    }).compile();

    controller = module.get<ComunidadController>(ComunidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
