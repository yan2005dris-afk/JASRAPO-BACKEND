import type { FilterContractsDto } from '../../interfaces/dto/filter-contracts.dto';
import type { ContractFilters } from '../../domain/types/contract.types';

export function buildContractFilters(dto: FilterContractsDto): ContractFilters {
  const filters: ContractFilters = {};

  if (dto.search) filters.search = dto.search;
  if (dto.contratoId) filters.contratoId = BigInt(dto.contratoId);
  if (dto.medidorId) filters.medidorId = BigInt(dto.medidorId);
  if (dto.medidorSerie) filters.medidorSerie = dto.medidorSerie;
  if (dto.numeroGuia) filters.numeroGuia = dto.numeroGuia;
  if (dto.categoriaTarifaId)
    filters.categoriaTarifaId = Number(dto.categoriaTarifaId);
  if (dto.ubicacion) filters.ubicacion = dto.ubicacion;
  if (dto.estado) filters.estado = dto.estado;
  if (dto.estadoServicio) filters.estadoServicio = dto.estadoServicio;
  if (dto.estadoCobranza) filters.estadoCobranza = dto.estadoCobranza;
  if (dto.hasDebt !== undefined) filters.hasDebt = dto.hasDebt;

  return filters;
}
