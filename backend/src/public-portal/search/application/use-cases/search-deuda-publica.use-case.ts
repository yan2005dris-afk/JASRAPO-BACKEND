import { BadRequestException, Injectable } from '@nestjs/common';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';
import { DebtCalculatorHelper } from 'src/shared/utils/debt-calculator.util';
import type {
  IClienteConContratosRaw,
  TipoBusquedaDeuda,
} from '../../domain/types/debt-search.types';
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
    const normalizedValor = valor?.trim();
    if (!normalizedValor) {
      throw new BadRequestException('El valor de búsqueda es obligatorio');
    }

    const parsedLimit = Number.isFinite(limit) ? Math.trunc(limit) : 10;
    const parsedPage = Number.isFinite(page) ? Math.trunc(page) : 1;
    const safeLimit = Math.min(Math.max(parsedLimit, 1), 50);
    const safePage = Math.max(parsedPage, 1);
    const skip = (safePage - 1) * safeLimit;

    if (tipo === 'numeroGuia') {
      const [contratos, total] = await Promise.all([
        this.searchRepository.findContratosDeudaBy(
          tipo,
          normalizedValor,
          skip,
          safeLimit,
        ),
        this.searchRepository.countContratosDeuda(tipo, normalizedValor),
      ]);
      return {
        data: this.agruparPorCliente(contratos, tipo),
        meta: { total, page: safePage, limit: safeLimit },
      };
    }

    const [clientes, total] = await Promise.all([
      this.searchRepository.findClientesBy(
        tipo,
        normalizedValor,
        skip,
        safeLimit,
      ),
      this.searchRepository.countClientesBy(tipo, normalizedValor),
    ]);
    return {
      data: this.mapearClientes(clientes, tipo),
      meta: { total, page: safePage, limit: safeLimit },
    };
  }

  private mapearClientes(
    clientes: IClienteConContratosRaw[],
    tipo: TipoBusquedaDeuda,
  ): DeudaPublicaItemDto[] {
    return clientes.map((cliente) => ({
      cliente: {
        nombre: this.formatearNombre(cliente.nombres, cliente.apellidos),
        identificacion: this.mapearIdentificacion(cliente.identificacion, tipo),
      },
      contratos: cliente.contratos.map(
        (c): ContratoDeudaPublicaDto => ({
          contratoId: String(c.contratoId),
          numeroGuia: c.numeroGuia,
          estado: c.estado,
          saldoVencido: DebtCalculatorHelper.calcularSaldoVencido(
            c.prefacturasImpagadas,
          ),
          deudaAnterior: DebtCalculatorHelper.calcularDeudaAnterior(
            c.prefacturasImpagadas,
          ),
          mesesAtrasado: DebtCalculatorHelper.calcularMesesAtrasado(
            c.prefacturasImpagadas,
          ),
        }),
      ),
    }));
  }

  private agruparPorCliente(
    contratos: Awaited<
      ReturnType<BusquedaPublicaRepository['findContratosDeudaBy']>
    >,
    tipo: TipoBusquedaDeuda,
  ): DeudaPublicaItemDto[] {
    const mapa = new Map<string, DeudaPublicaItemDto>();

    for (const contrato of contratos) {
      const clienteKey = String(contrato.cliente.clienteId);
      const nombre = this.formatearNombre(
        contrato.cliente.nombres,
        contrato.cliente.apellidos,
      );

      if (!mapa.has(clienteKey)) {
        mapa.set(clienteKey, {
          cliente: {
            nombre,
            identificacion: this.mapearIdentificacion(
              contrato.cliente.identificacion,
              tipo,
            ),
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
    return (
      `${nombres ?? ''} ${apellidos ?? ''}`.trim().replace(/\s+/g, ' ') ||
      'Sin nombre'
    );
  }

  /**
   * Búsquedas por `nombre` no prueban identidad (a diferencia de
   * `identificacion`/`numeroGuia`, que actúan como secretos compartidos), por
   * lo que la identificación se enmascara en la respuesta para evitar
   * exponer cédula/RUC completos a partir de un nombre filtrado.
   */
  private mapearIdentificacion(
    identificacion: string | null,
    tipo: TipoBusquedaDeuda,
  ): string | null {
    if (tipo !== 'nombre') {
      return identificacion;
    }
    return this.enmascararIdentificacion(identificacion);
  }

  private enmascararIdentificacion(
    identificacion: string | null,
  ): string | null {
    if (!identificacion) {
      return identificacion;
    }

    const visibles = 3;
    if (identificacion.length <= visibles * 2) {
      return '*'.repeat(identificacion.length);
    }

    const inicio = identificacion.slice(0, visibles);
    const fin = identificacion.slice(-visibles);
    const oculto = '*'.repeat(identificacion.length - visibles * 2);
    return `${inicio}${oculto}${fin}`;
  }
}
