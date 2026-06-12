import { Injectable } from '@nestjs/common';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';
import { DebtCalculatorHelper } from 'src/billing/shared/debt-calculator.helper';
import type { TipoBusquedaDeuda } from '../../domain/types/debt-search.types';
import type {
  ContratoDeudaPublicaDto,
  DeudaPublicaItemDto,
  DeudaPublicaResponseDto,
} from '../../interfaces/dto/deuda-publica-response.dto';

@Injectable()
export class SearchDeudaPublicaUseCase {
  constructor(private readonly searchRepository: BusquedaPublicaRepository) {}

  async execute(
    tipo: TipoBusquedaDeuda,
    valor: string,
    page = 1,
    limit = 10,
  ): Promise<DeudaPublicaResponseDto> {
    const safeLimit = Math.min(limit, 50);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const [contratos, total] = await Promise.all([
      this.searchRepository.findContratosDeudaBy(tipo, valor, skip, safeLimit),
      this.searchRepository.countContratosDeuda(tipo, valor),
    ]);

    const agrupado = this.agruparPorCliente(contratos);

    return {
      data: agrupado,
      meta: { total, page: safePage, limit: safeLimit },
    };
  }

  private agruparPorCliente(
    contratos: Awaited<ReturnType<BusquedaPublicaRepository['findContratosDeudaBy']>>,
  ): DeudaPublicaItemDto[] {
    const mapa = new Map<string, DeudaPublicaItemDto>();

    for (const contrato of contratos) {
      const clienteKey = String(contrato.cliente.clienteId);
      const nombre = this.formatearNombre(contrato.cliente.nombres, contrato.cliente.apellidos);

      if (!mapa.has(clienteKey)) {
        mapa.set(clienteKey, {
          cliente: {
            nombre,
            identificacion: contrato.cliente.identificacion,
          },
          contratos: [],
        });
      }

      const contratoDto: ContratoDeudaPublicaDto = {
        contratoId: String(contrato.contratoId),
        numeroGuia: contrato.numeroGuia,
        estado: contrato.estado,
        saldoVencido: DebtCalculatorHelper.calcularSaldoVencido(
          contrato.prefacturasImpagadas,
        ),
        deudaAnterior: DebtCalculatorHelper.calcularDeudaAnterior(
          contrato.prefacturasImpagadas,
        ),
        mesesAtrasado: DebtCalculatorHelper.calcularMesesAtrasado(
          contrato.prefacturasImpagadas,
        ),
      };

      mapa.get(clienteKey)!.contratos.push(contratoDto);
    }

    return Array.from(mapa.values());
  }

  private formatearNombre(
    nombres: string | null,
    apellidos: string | null,
  ): string {
    return `${nombres ?? ''} ${apellidos ?? ''}`.trim().replace(/\s+/g, ' ') || 'Sin nombre';
  }
}
