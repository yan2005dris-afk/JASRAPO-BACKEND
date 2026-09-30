import { ApiProperty } from '@nestjs/swagger';
import type { IServiceArea } from '../../domain/types/service-area.types';

export class ServiceAreaGeometryDto {
  @ApiProperty({ enum: ['Polygon'], example: 'Polygon' })
  type: 'Polygon';

  @ApiProperty({
    description:
      'Anillos del polígono GeoJSON (RFC 7946) con posiciones [longitud, latitud] en WGS84',
    type: 'array',
    items: {
      type: 'array',
      items: { type: 'array', items: { type: 'number' } },
    },
    example: [
      [
        [-80.802436, -1.711338],
        [-80.801915, -1.711879],
        [-80.802436, -1.711338],
      ],
    ],
  })
  coordinates: number[][][];
}

export class ServiceAreaResponseDto {
  @ApiProperty({ example: 'Parroquia Manglaralto' })
  nombre: string;

  @ApiProperty({
    description: 'Origen y licencia de la geometría',
    example: 'OpenStreetMap (relation 278708), ODbL',
  })
  fuente: string;

  @ApiProperty({
    type: ServiceAreaGeometryDto,
    description: 'Perímetro del área de servicio de la Junta',
  })
  geometria: ServiceAreaGeometryDto;

  static fromDomain(serviceArea: IServiceArea): ServiceAreaResponseDto {
    const dto = new ServiceAreaResponseDto();
    dto.nombre = serviceArea.nombre;
    dto.fuente = serviceArea.fuente;
    dto.geometria = {
      type: serviceArea.geometria.type,
      coordinates: serviceArea.geometria.coordinates,
    };
    return dto;
  }
}
