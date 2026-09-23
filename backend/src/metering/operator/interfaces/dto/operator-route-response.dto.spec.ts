import { OperatorRouteResponseDto } from './operator-route-response.dto';
import type { OperatorRoute } from '../../domain/repositories/repository-types';

describe('OperatorRouteResponseDto', () => {
  it('maps route and work-order bigint identifiers to strings', () => {
    const route = {
      rutaId: 1n,
      nombre: 'Ruta norte',
      descripcion: null,
      operarioId: 10,
      tipoRuta: 'LECTURA',
      comunidadId: 5,
      sectorId: null,
      periodoId: 20,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      operario: null,
      medidor: null,
      ordenesTrabajo: [
        {
          ordenTrabajoId: 9n,
          rutaId: 1n,
          contratoId: 2n,
          medidorId: null,
          lecturaId: 3n,
          tipoActividad: 'LECTURA',
          estado: 'PENDIENTE',
          ordenVisita: 1,
          resultadoObservacion: null,
          evidenciaFotoUrl: null,
          completadoEn: null,
          contrato: {
            numeroGuia: 'GUIA-001',
            direccionSuministro: 'Calle 1',
            cliente: { nombres: 'Juan', apellidos: 'Pérez', razonSocial: null },
          },
          medidor: null,
        },
      ],
      paradas: [
        {
          ordenTrabajoId: 9n,
          latitud: -0.9,
          longitud: -80.7,
          serie: 'MED-001',
          clienteNombre: 'Juan Pérez',
          tipoActividad: 'LECTURA',
          estado: 'PENDIENTE',
          direccionSuministro: 'Calle 1',
        },
      ],
    } satisfies OperatorRoute;

    const dto = OperatorRouteResponseDto.fromEntity(route);

    expect(dto.rutaId).toBe('1');
    expect(dto.ordenesTrabajo[0].ordenTrabajoId).toBe('9');
    expect(dto.ordenesTrabajo[0].rutaId).toBe('1');
    expect(dto.ordenesTrabajo[0].lecturaId).toBe('3');
    expect(dto.paradas[0].ordenTrabajoId).toBe('9');
    expect(() => JSON.stringify(dto)).not.toThrow();
  });
});
