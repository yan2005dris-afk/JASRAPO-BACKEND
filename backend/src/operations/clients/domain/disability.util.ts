import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

export class DisabilityUtil {
  static resolvePercentage(
    hasDisability: boolean,
    percentage?: number | null,
  ): number | null {
    if (!hasDisability) return null;
    if (percentage === undefined || percentage === null) {
      throw new InvalidDomainOperationException(
        'El porcentaje del carné de discapacidad es obligatorio cuando aplica el beneficio de discapacidad',
      );
    }
    return percentage;
  }
}
