import type { CreateContractData } from './create-contract-data';

export type UpdateContractData = Partial<CreateContractData> & {
  medidorId?: bigint;
  lecturaInicial?: number;
};
