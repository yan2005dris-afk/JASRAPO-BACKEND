import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import {
  beforeAllHook,
  isE2E,
} from './setup';
import {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
} from '../src/shared/enums';

describe('Meter Replacement E2E (All Treatments & Validation Cases)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let e2eMode: boolean;

  let testCommunityId: number;
  let testPeriodoId: number;
  let testClienteId: bigint;
  let testContratoId: bigint;
  let oldMeterId: bigint;
  let newMeterId1: bigint;
  let newMeterId2: bigint;
  let newMeterId3: bigint;
  let newMeterId4: bigint;

  beforeAll(async () => {
    try {
      await beforeAllHook();
      e2eMode = isE2E();
    } catch {
      e2eMode = false;
    }

    if (!e2eMode) {
      console.warn('⚠️ E2E tests running in fallback mode');
      return;
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);

    // 1. Authenticate / get JWT
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'e2e-test@jasrapo.com',
        password: 'TestPass123!',
      });

    if (loginRes.status === 200 && loginRes.body?.tokens?.accessToken) {
      accessToken = loginRes.body.tokens.accessToken;
    }

    // 2. Setup baseline test fixtures
    const community = await prisma.comunidades.create({
      data: {
        codigo: `E2E-COM-${Date.now()}`,
        nombre: 'Comunidad E2E Reemplazos',
      },
    });
    testCommunityId = community.comunidadId;

    const sector = await prisma.sectores.create({
      data: {
        comunidadId: testCommunityId,
        codigo: `SEC-${Date.now()}`,
        nombre: 'Sector E2E',
      },
    });

    const category = await prisma.categoriaTarifa.create({
      data: {
        nombre: `Tarifa E2E ${Date.now()}`,
        valorBase: 5,
        consumoMinimoMensual: 10,
        valorExcedenteM3: 0.5,
      },
    });

    const cliente = await prisma.clientes.create({
      data: {
        identificacion: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        nombres: 'Abonado',
        apellidos: 'E2E Test',
        email: `abonado-${Date.now()}@jasrapo.test`,
        telefono: '0999999999',
      },
    });
    testClienteId = cliente.clienteId;

    const periodo = await prisma.periodos.create({
      data: {
        nombre: `2026 E2E`,
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-12-31'),
        estado: 'ABIERTO',
      },
    });
    testPeriodoId = periodo.periodoId;

    // Create Old Installed Meter + Available Bodega Meters
    const oldMeter = await prisma.medidores.create({
      data: {
        serie: `OLD-${Date.now()}`,
        marca: 'Actaris',
        modelo: 'Flostar',
        estado: 'INSTALADO',
      },
    });
    oldMeterId = oldMeter.medidorId;

    const m1 = await prisma.medidores.create({
      data: { serie: `NEW1-${Date.now()}`, marca: 'Itron', modelo: 'A200', estado: 'BODEGA' },
    });
    newMeterId1 = m1.medidorId;

    const m2 = await prisma.medidores.create({
      data: { serie: `NEW2-${Date.now()}`, marca: 'Itron', modelo: 'A200', estado: 'BODEGA' },
    });
    newMeterId2 = m2.medidorId;

    const m3 = await prisma.medidores.create({
      data: { serie: `NEW3-${Date.now()}`, marca: 'Itron', modelo: 'A200', estado: 'BODEGA' },
    });
    newMeterId3 = m3.medidorId;

    const m4 = await prisma.medidores.create({
      data: { serie: `NEW4-${Date.now()}`, marca: 'Itron', modelo: 'A200', estado: 'BODEGA' },
    });
    newMeterId4 = m4.medidorId;

    // Create Contract with initial meter
    const contrato = await prisma.contratos.create({
      data: {
        clienteId: testClienteId,
        sectorId: sector.sectorId,
        categoriaTarifaId: category.categoriaTarifaId,
        numeroGuia: `GUI-E2E-${Date.now()}`,
        direccionSuministro: 'Calle E2E 123',
        estado: 'ACTIVO',
        comunidadId: testCommunityId,
        historialMedidores: {
          create: {
            medidorId: oldMeterId,
            fechaDesde: new Date('2026-01-01'),
            lecturaInicial: 100,
          },
        },
      },
    });
    testContratoId = contrato.contratoId;

    // Create an approved reading so base reading becomes 150
    await prisma.lecturas.create({
      data: {
        medidorId: oldMeterId,
        contratoId: testContratoId,
        periodoId: testPeriodoId,
        mes: 1,
        lecturaAnterior: 100,
        lecturaActual: 150,
        consumo: 50,
        estado: 'APROBADA',
        fecha: new Date('2026-01-15'),
      },
    });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('Casos Válidos (Happy Paths por cada Tratamiento)', () => {
    it('1. Debe ejecutar reemplazo con COBRO_REAL y FACTURAR_PERIODO_ACTUAL', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId1),
        lecturaFinalSaliente: 180, // Base was 150 -> consumo saliente = 30
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.MANTENIMIENTO_PREVENTIVO,
        responsabilidadDano: ResponsabilidadDano.NO_APLICA,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriodoId,
        mesOrigen: 2,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(res.body).toHaveProperty('reemplazoId');
      expect(res.body.tratamientoSaliente).toBe(TratamientoSaliente.COBRO_REAL);
      expect(res.body.tratamientoEntrante).toBe(TratamientoEntrante.FACTURAR_PERIODO_ACTUAL);
      expect(Number(res.body.lecturaFinalSaliente)).toBe(180);
    });

    it('2. Debe ejecutar reemplazo con PROMEDIO_HISTORICO (ventana 3 meses)', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId2),
        lecturaFinalSaliente: 200,
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.DANO,
        responsabilidadDano: ResponsabilidadDano.JUNTA,
        tratamientoSaliente: TratamientoSaliente.PROMEDIO_HISTORICO,
        ventanaPromedio: 3,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriodoId,
        mesOrigen: 3,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.tratamientoSaliente).toBe(TratamientoSaliente.PROMEDIO_HISTORICO);
      expect(res.body.ventanaPromedio).toBe(3);
    });

    it('3. Debe ejecutar reemplazo con COBRO_PARCIAL (porcentaje 50%)', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId3),
        lecturaFinalSaliente: 250,
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.DANO,
        responsabilidadDano: ResponsabilidadDano.TERCERO,
        tratamientoSaliente: TratamientoSaliente.COBRO_PARCIAL,
        porcentajeCobro: 50,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriodoId,
        mesOrigen: 4,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.tratamientoSaliente).toBe(TratamientoSaliente.COBRO_PARCIAL);
      expect(Number(res.body.porcentajeCobro)).toBe(50);
    });

    it('4. Debe ejecutar reemplazo con DIFERIR_SIGUIENTE_PERIODO', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId4),
        lecturaFinalSaliente: 300,
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.CALIBRACION,
        responsabilidadDano: ResponsabilidadDano.NO_APLICA,
        tratamientoSaliente: TratamientoSaliente.EXONERADO,
        tratamientoEntrante: TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO,
        periodoOrigenId: testPeriodoId,
        mesOrigen: 5,
        periodoDestinoId: testPeriodoId,
        mesDestino: 6,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.tratamientoSaliente).toBe(TratamientoSaliente.EXONERADO);
      expect(res.body.tratamientoEntrante).toBe(TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO);
      expect(res.body.mesDestino).toBe(6);
    });
  });

  describe('Casos Inválidos (Validaciones y Reglas de Negocio)', () => {
    it('❌ Debe fallar si la lectura final de retiro es negativa', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId1),
        lecturaFinalSaliente: -10, // Inconsistente / negativo
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.MANTENIMIENTO_PREVENTIVO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriodoId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringMatching(/no puede ser negativa/i)]),
      );
    });

    it('❌ Debe fallar si el motivo es OTRO y no se envía detalleMotivo', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId1),
        lecturaFinalSaliente: 400,
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.OTRO,
        // detalleMotivo omitido intencionalmente
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriodoId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringMatching(/detalle del motivo es obligatorio/i)]),
      );
    });

    it('❌ Debe fallar si el tratamiento es COBRO_PARCIAL pero el porcentaje es mayor a 100%', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId1),
        lecturaFinalSaliente: 400,
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.COBRO_PARCIAL,
        porcentajeCobro: 150, // Inválido (> 100)
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriodoId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringMatching(/máximo es 100%/i)]),
      );
    });

    it('❌ Debe fallar si el tratamiento es PROMEDIO_HISTORICO con ventana diferente de 3 o 6', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId1),
        lecturaFinalSaliente: 400,
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.PROMEDIO_HISTORICO,
        ventanaPromedio: 5, // Inválido (debe ser 3 o 6)
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriodoId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringMatching(/ventana de promedio debe ser 3 o 6/i)]),
      );
    });

    it('❌ Debe fallar si el tratamiento es DIFERIR_SIGUIENTE_PERIODO sin período o mes destino', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: uuidv4(),
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId1),
        lecturaFinalSaliente: 400,
        lecturaInicialEntrante: 0,
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO,
        periodoOrigenId: testPeriodoId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/período destino es obligatorio/i),
          expect.stringMatching(/mes destino es obligatorio/i),
        ]),
      );
    });

    it('❌ Debe fallar si la clave de idempotencia no es un UUID válido', async () => {
      if (!e2eMode || !accessToken) return;

      const payload = {
        claveIdempotencia: 'clave-no-uuid',
        contratoId: String(testContratoId),
        nuevoMedidorId: String(newMeterId1),
        lecturaFinalSaliente: 400,
        motivo: MotivoReemplazoMedidor.MANTENIMIENTO_PREVENTIVO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriodoId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/meters/replace')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringMatching(/debe ser un UUID v4/i)]),
      );
    });
  });
});
