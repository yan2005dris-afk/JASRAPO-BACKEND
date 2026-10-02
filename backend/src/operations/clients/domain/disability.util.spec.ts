import { DisabilityUtil } from './disability.util';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

describe('DisabilityUtil', () => {
  describe('resolvePercentage', () => {
    it('retorna el porcentaje cuando aplica el beneficio de discapacidad', () => {
      expect(DisabilityUtil.resolvePercentage(true, 50)).toBe(50);
    });

    it('lanza error cuando aplica el beneficio y no hay porcentaje', () => {
      expect(() => DisabilityUtil.resolvePercentage(true, undefined)).toThrow(
        InvalidDomainOperationException,
      );
      expect(() => DisabilityUtil.resolvePercentage(true, null)).toThrow(
        InvalidDomainOperationException,
      );
    });

    it('retorna null cuando no aplica el beneficio aunque llegue un porcentaje', () => {
      expect(DisabilityUtil.resolvePercentage(false, 70)).toBeNull();
    });
  });
});
