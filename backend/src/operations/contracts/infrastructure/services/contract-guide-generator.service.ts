import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class ContractGuideGeneratorService {
  async generate(
    tx: Prisma.TransactionClient,
    params: { comunidadId: number; serieMedidor: string },
  ): Promise<string> {
    const comunidad = await tx.comunidades.findUnique({
      where: { comunidadId: params.comunidadId },
      select: { codigo: true },
    });

    if (!comunidad) {
      throw new EntityNotFoundException('Comunidad', params.comunidadId);
    }

    const codigoComunidad = this.normalizeSegment(
      comunidad.codigo,
      'comunidad',
    );
    const serieMedidor = this.normalizeSegment(params.serieMedidor, 'medidor');

    const lockedRows = await tx.$queryRaw<
      Array<{
        secuencia_contrato_id: number;
        longitud: number;
        ultimo_valor: bigint;
      }>
    >`
      SELECT "secuencia_contrato_id", "longitud", "ultimo_valor"
      FROM "secuencia_contrato"
      ORDER BY "secuencia_contrato_id"
      LIMIT 1
      FOR UPDATE
    `;

    if (lockedRows.length !== 1) {
      throw new InvalidDomainOperationException(
        'No está configurada la secuencia de números de guía de contratos',
      );
    }

    const counter = lockedRows[0];
    let nextValue = counter.ultimo_valor + 1n;
    let numeroGuia = '';
    let guideInUse = true;

    while (guideInUse) {
      const secuencial = nextValue.toString().padStart(counter.longitud, '0');
      numeroGuia = `${codigoComunidad}-${serieMedidor}-${secuencial}`;

      const existing = await tx.contratos.findUnique({
        where: { numeroGuia },
        select: { contratoId: true },
      });

      guideInUse = Boolean(existing);
      if (guideInUse) nextValue += 1n;
    }

    await tx.secuenciaContrato.update({
      where: { secuenciaContratoId: counter.secuencia_contrato_id },
      data: { ultimoValor: nextValue },
    });

    return numeroGuia;
  }

  private normalizeSegment(value: string, source: string): string {
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toUpperCase();

    if (!normalized) {
      throw new InvalidDomainOperationException(
        `El código de ${source} debe contener al menos un carácter alfanumérico`,
      );
    }

    return normalized;
  }
}
