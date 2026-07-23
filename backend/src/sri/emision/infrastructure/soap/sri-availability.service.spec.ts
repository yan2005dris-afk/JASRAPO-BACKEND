import { SriAvailabilityService } from './sri-availability.service';
import { SriSoapFactoryService } from './sri-soap-factory.service';
import { Ambiente } from '../../domain/constants';

describe('SriAvailabilityService', () => {
  let service: SriAvailabilityService;
  let soapFactory: jest.Mocked<SriSoapFactoryService>;

  const createMockBreaker = (isOpenValue: boolean) => ({
    isOpen: jest.fn().mockReturnValue(isOpenValue),
  });

  beforeEach(() => {
    soapFactory = {
      getCircuitBreaker: jest.fn(),
    } as any;

    service = new SriAvailabilityService(soapFactory);
  });

  describe('isRecepcionDown', () => {
    it('should return true when recepcion circuit breaker is open', () => {
      soapFactory.getCircuitBreaker.mockReturnValue(createMockBreaker(true) as any);

      const isDown = service.isRecepcionDown(Ambiente.PRUEBAS);

      expect(isDown).toBe(true);
      expect(soapFactory.getCircuitBreaker).toHaveBeenCalledWith('recepcion_1');
    });

    it('should return false when recepcion circuit breaker is closed', () => {
      soapFactory.getCircuitBreaker.mockReturnValue(createMockBreaker(false) as any);

      const isDown = service.isRecepcionDown(Ambiente.PRODUCCION);

      expect(isDown).toBe(false);
      expect(soapFactory.getCircuitBreaker).toHaveBeenCalledWith('recepcion_2');
    });
  });

  describe('isAutorizacionDown', () => {
    it('should return true when autorizacion circuit breaker is open', () => {
      soapFactory.getCircuitBreaker.mockReturnValue(createMockBreaker(true) as any);

      const isDown = service.isAutorizacionDown(Ambiente.PRUEBAS);

      expect(isDown).toBe(true);
      expect(soapFactory.getCircuitBreaker).toHaveBeenCalledWith('autorizacion_1');
    });
  });

  describe('isSriDown', () => {
    it('should rely on isRecepcionDown', () => {
      soapFactory.getCircuitBreaker.mockReturnValue(createMockBreaker(true) as any);

      expect(service.isSriDown(Ambiente.PRUEBAS)).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return full status snapshot', () => {
      soapFactory.getCircuitBreaker.mockImplementation((name: string) => {
        if (name === 'recepcion_1') return createMockBreaker(true) as any;
        if (name === 'autorizacion_1') return createMockBreaker(false) as any;
        return createMockBreaker(false) as any;
      });

      const status = service.getStatus(Ambiente.PRUEBAS);

      expect(status).toEqual({
        ambiente: Ambiente.PRUEBAS,
        recepcionOpen: true,
        autorizacionOpen: false,
        down: true,
      });
    });
  });
});
