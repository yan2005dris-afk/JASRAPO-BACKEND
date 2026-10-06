import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

interface ContractCoordinatesShape {
  latitud?: number | null;
  longitud?: number | null;
}

const PAIR_MESSAGE = 'La latitud y la longitud deben enviarse juntas';

export const shouldValidateCoordinates = (
  dto: ContractCoordinatesShape,
): boolean => {
  const bothUndefined = dto.latitud === undefined && dto.longitud === undefined;
  const bothNull = dto.latitud === null && dto.longitud === null;
  return !bothUndefined && !bothNull;
};

export const IsContractLatitude = () =>
  applyDecorators(
    ApiPropertyOptional({
      description: 'Latitud del predio (grados decimales, WGS84)',
      example: -1.7966,
      minimum: -90,
      maximum: 90,
      nullable: true,
    }),
    ValidateIf(shouldValidateCoordinates),
    IsNotEmpty({ message: PAIR_MESSAGE }),
    IsNumber({}, { message: 'La latitud debe ser numérica' }),
    Min(-90, { message: 'La latitud mínima es -90' }),
    Max(90, { message: 'La latitud máxima es 90' }),
    Type(() => Number),
  );

export const IsContractLongitude = () =>
  applyDecorators(
    ApiPropertyOptional({
      description: 'Longitud del predio (grados decimales, WGS84)',
      example: -80.7568,
      minimum: -180,
      maximum: 180,
      nullable: true,
    }),
    ValidateIf(shouldValidateCoordinates),
    IsNotEmpty({ message: PAIR_MESSAGE }),
    IsNumber({}, { message: 'La longitud debe ser numérica' }),
    Min(-180, { message: 'La longitud mínima es -180' }),
    Max(180, { message: 'La longitud máxima es 180' }),
    Type(() => Number),
  );
