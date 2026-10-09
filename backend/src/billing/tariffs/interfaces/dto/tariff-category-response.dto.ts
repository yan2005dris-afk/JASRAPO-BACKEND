import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { DateUtil } from 'src/shared/utils/date.util';
import { RubroSummaryDto } from './rubro-summary.dto';

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

  @ApiPropertyOptional({
    example: 10,
    nullable: true,
    description: 'Consumo mínimo mensual en m³',
  })
  consumoMinimoMensual: number | null;

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
    description: 'Rubros asociados a esta categoría',
    type: () => RubroSummaryDto,
    isArray: true,
  })
  rubros?: RubroSummaryDto[];

  static fromEntity(entity: TariffCategoryEntity): TariffCategoryResponseDto {
    const dto = new TariffCategoryResponseDto();
    dto.categoriaTarifaId = entity.categoriaTarifaId;
    dto.nombre = entity.nombre;
    dto.descripcion = entity.descripcion ?? null;
    dto.consumoMinimoMensual = entity.consumoMinimoMensual ?? null;
    dto.fechaVigenciaDesde = DateUtil.formatForFrontend(
      entity.fechaVigenciaDesde,
    );
    dto.fechaVigenciaHasta = DateUtil.formatForFrontend(
      entity.fechaVigenciaHasta,
    );
    dto.activo = entity.activo;
    if (entity.rubros) {
      dto.rubros = entity.rubros.map((r) => RubroSummaryDto.fromEmbedded(r));
    }
    return dto;
  }

  static fromEntityList(
    entities: TariffCategoryEntity[],
  ): TariffCategoryResponseDto[] {
    return entities.map((e) => TariffCategoryResponseDto.fromEntity(e));
  }
}
