import { UnauthorizedException } from '@nestjs/common';
import { summarizeReportRequestContext } from './models/report-request-context';
import { ReportRequestContextFactory } from './report-request-context.factory';

describe('ReportRequestContextFactory', () => {
  const factory = new ReportRequestContextFactory();

  it('reportModalSummarizesSubmittedContext', () => {
    const context = factory.create({
      reportType: 'connection-history',
      actor: {
        usersId: 17,
        email: 'operator@example.com',
        rol: 'operador',
      },
      filters: {
        fechaHasta: '2026-08-24',
        contratoId: ' 125 ',
        fechaDesde: '2026-08-01',
      },
      timeZone: 'America/Guayaquil',
      locale: 'es-EC,es;q=0.9',
    });

    expect(summarizeReportRequestContext(context)).toEqual({
      reportType: 'connection-history',
      actorId: 17,
      entity: {
        resource: 'connection-history',
        identifiers: { contratoId: '125' },
      },
      period: {
        from: '2026-08-01',
        to: '2026-08-24',
        cutoff: undefined,
      },
      timeZone: 'America/Guayaquil',
      locale: 'es-EC',
      filters: {
        contratoId: '125',
        fechaDesde: '2026-08-01',
        fechaHasta: '2026-08-24',
      },
    });
  });

  it('normaliza el rango temporal una sola vez dentro del contexto', () => {
    const context = factory.create({
      reportType: 'payments-report',
      actor: { usersId: 7 },
      filters: {
        fechaDesde: '2026-08-24',
        fechaHasta: '2026-08-24',
      },
    });

    expect(context.period.startInclusive?.toISOString()).toBe(
      '2026-08-24T05:00:00.000Z',
    );
    expect(context.period.endExclusive?.toISOString()).toBe(
      '2026-08-25T05:00:00.000Z',
    );
  });

  it('normaliza los límites como días calendario de la zona solicitada', () => {
    const context = factory.create({
      reportType: 'payments-report',
      actor: { usersId: 7 },
      filters: {
        fechaDesde: '2026-03-08',
        fechaHasta: '2026-03-08',
      },
      timeZone: 'America/New_York',
    });

    expect(context.period.startInclusive?.toISOString()).toBe(
      '2026-03-08T05:00:00.000Z',
    );
    expect(context.period.endExclusive?.toISOString()).toBe(
      '2026-03-09T04:00:00.000Z',
    );
  });

  it('hace explícita la fecha de corte automática para reintentos', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-25T02:00:00.000Z'));

    try {
      const context = factory.create({
        reportType: 'overdue-accounts',
        actor: { usersId: 7 },
        filters: {},
        timeZone: 'America/Guayaquil',
      });

      expect(context.filters).toEqual({ fechaCorte: '2026-08-24' });
      expect(context.period.cutoff).toBe('2026-08-24');
      expect(context.period.cutoffInclusive?.toISOString()).toBe(
        '2026-08-25T04:59:59.999Z',
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('rechaza contextos sin actor autorizado', () => {
    expect(() =>
      factory.create({
        reportType: 'clients-list',
        actor: {},
        filters: {},
      }),
    ).toThrow(UnauthorizedException);
  });

  it('mantiene inmutable el contrato compartido', () => {
    const context = factory.create({
      reportType: 'clients-list',
      actor: { usersId: 7 },
      filters: { activo: true },
    });

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.actor)).toBe(true);
    expect(Object.isFrozen(context.entity)).toBe(true);
    expect(Object.isFrozen(context.period)).toBe(true);
    expect(Object.isFrozen(context.filters)).toBe(true);
  });
});
