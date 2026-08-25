import { Injectable } from '@nestjs/common';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';
import { DebtCalculatorHelper } from 'src/shared/utils/debt-calculator.util';
import {
  DomainValidationException,
  EntityNotFoundException,
} from 'src/shared/domain/exceptions/domain.exception';
import type {
  IClienteConContratosRaw,
  TipoBusquedaDeuda,
} from '../../domain/types/debt-search.types';
import type {
  ContratoDeudaPublicaDto,
  DeudaPublicaResponseDto,
} from '../../interfaces/dto/deuda-publica-response.dto';

@Injectable()
export class SearchDeudaPublicaUseCase {
  constructor(private readonly searchRepository: BusquedaPublicaRepository) {}

  async execute(
    tipo: TipoBusquedaDeuda,
    valor: string,
  ): Promise<DeudaPublicaResponseDto> {
    const normalizedValor = valor?.trim();
    if (!normalizedValor) {
      throw new DomainValidationException(
        'El valor de búsqueda es obligatorio',
      );
    }

    let resultado: DeudaPublicaResponseDto | null = null;

    if (tipo === 'numeroGuia') {
      const contratos = await this.searchRepository.findContratosDeudaBy(
        tipo,
        normalizedValor,
        0,
        50,
      );
      const agrupados = this.agruparPorCliente(contratos);
      resultado = agrupados.length > 0 ? agrupados[0] : null;
    } else {
      const clientes = await this.searchRepository.findClientesBy(
        tipo,
        normalizedValor,
        0,
        50,
      );
      const mapeados = this.mapearClientes(clientes);
      resultado = mapeados.length > 0 ? mapeados[0] : null;
    }

    if (!resultado) {
      throw new EntityNotFoundException(
        'Búsqueda de deuda para el parámetro ingresado',
        normalizedValor,
      );
    }

    return resultado;
  }

  private mapearClientes(
    clientes: IClienteConContratosRaw[],
  ): DeudaPublicaResponseDto[] {
    return clientes.map((cliente) => {
      const contratos = cliente.contratos.map(
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
      );
      const totalDeuda = contratos.reduce((acc, c) => acc + c.saldoVencido, 0);

      return {
        cliente: {
          nombre: this.formatearNombre(cliente.nombres, cliente.apellidos),
          identificacion: cliente.identificacion,
        },
        contratos,
        totalDeuda,
      };
    });
  }

  private agruparPorCliente(
    contratos: Awaited<
      ReturnType<BusquedaPublicaRepository['findContratosDeudaBy']>
    >,
  ): DeudaPublicaResponseDto[] {
    const mapa = new Map<string, DeudaPublicaResponseDto>();

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
            identificacion: contrato.cliente.identificacion,
          },
          contratos: [],
          totalDeuda: 0,
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

      const entry = mapa.get(clienteKey)!;
      entry.contratos.push(contratoDto);
      entry.totalDeuda += contratoDto.saldoVencido;
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
}
