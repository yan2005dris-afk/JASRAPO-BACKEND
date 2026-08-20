import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { DateUtil } from 'src/shared/utils/date.util';
import { RubroResponseDto } from '../../../rubros/interfaces/dto/rubro-response.dto';

export class TariffCategoryResponseDto {
  @ApiProperty({ example: 1, description: 'ID de la categoría de tarifa' })
  categoriaTarifaId: number;

  @ApiProperty({
    example: 'Residencial',
    description: 'Nombre de la categoría',
  })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Tarifa básica para consumo doméstico',
    nullable: true,
    description: 'Descripción detallada',
  })
  descripcion: string | null;

  @ApiProperty({ example: 3.5, description: 'Valor base de la tarifa' })
  valorBase: number;

  @ApiPropertyOptional({
    example: 10,
    nullable: true,
    description: 'Consumo mínimo mensual en m³',
  })
  consumoMinimoMensual: number | null;

  @ApiProperty({
    example: 0.5,
    description: 'Valor excedente por m³ adicional',
  })
  valorExcedenteM3: number;

  @ApiPropertyOptional({
    example: '2026-01-01',
    nullable: true,
    description: 'Fecha de inicio de vigencia',
  })
  fechaVigenciaDesde: string | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Fecha de fin de vigencia',
  })
  fechaVigenciaHasta: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si la categoría está activa',
  })
  activo: boolean;

  @ApiPropertyOptional({
    description: 'Rubros asociados a esta categoría (los 3 default + extras)',
    type: () => RubroResponseDto,
    isArray: true,
  })
  rubros?: RubroResponseDto[];

  static fromEntity(entity: TariffCategoryEntity): TariffCategoryResponseDto {
    const dto = new TariffCategoryResponseDto();
    dto.categoriaTarifaId = entity.categoriaTarifaId;
    dto.nombre = entity.nombre;
    dto.descripcion = entity.descripcion ?? null;
    dto.valorBase = Number(entity.valorBase);
    dto.consumoMinimoMensual = entity.consumoMinimoMensual ?? null;
    dto.valorExcedenteM3 = Number(entity.valorExcedenteM3);
    dto.fechaVigenciaDesde = DateUtil.formatForFrontend(
      entity.fechaVigenciaDesde,
    );
    dto.fechaVigenciaHasta = DateUtil.formatForFrontend(
      entity.fechaVigenciaHasta,
    );
    dto.activo = entity.activo;
    if (entity.rubros) {
      dto.rubros = entity.rubros.map((r) => RubroResponseDto.fromEntity(r));
    }
    return dto;
  }

  static fromEntityList(
    entities: TariffCategoryEntity[],
  ): TariffCategoryResponseDto[] {
    return entities.map((e) => TariffCategoryResponseDto.fromEntity(e));
  }
}
