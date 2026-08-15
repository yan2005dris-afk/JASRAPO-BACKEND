import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DiscountEntity } from '../../domain/entities/discount.entity';

export class DiscountResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del descuento' })
  id: number;

  @ApiProperty({ example: 'Tercera Edad', description: 'Nombre del descuento' })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Descuento para adultos mayores',
    nullable: true,
    description: 'Descripción opcional',
  })
  descripcion: string | null;

  @ApiProperty({ example: 'TERCERA_EDAD', description: 'Tipo de descuento' })
  tipoDescuento: string;

  @ApiProperty({ example: 50, description: 'Valor del descuento' })
  valor: number;

  @ApiProperty({ example: true, description: 'Indica si el valor es un porcentaje' })
  esPorcentaje: boolean;

  @ApiPropertyOptional({
    example: 2,
    nullable: true,
    description: 'ID del rubro asociado',
  })
  rubroId: number | null;

  @ApiProperty({ example: true, description: 'Indica si el descuento está activo' })
  activo: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si se aplica automáticamente',
  })
  aplicaAutomatico: boolean;

  static fromEntity(entity: DiscountEntity): DiscountResponseDto {
    const dto = new DiscountResponseDto();
    dto.id = entity.id;
    dto.nombre = entity.nombre;
    dto.descripcion = entity.descripcion ?? null;
    dto.tipoDescuento = entity.tipoDescuento;
    dto.valor = Number(entity.valor);
    dto.esPorcentaje = entity.esPorcentaje;
    dto.rubroId = entity.rubroId ?? null;
    dto.activo = entity.activo;
    dto.aplicaAutomatico = entity.aplicaAutomatico;
    return dto;
  }

  static fromEntityList(entities: DiscountEntity[]): DiscountResponseDto[] {
    return entities.map((e) => DiscountResponseDto.fromEntity(e));
  }
}
