export type SearchType = 'cliente' | 'contrato';

export class SearchResultEntity {
  constructor(
    public readonly tipo: SearchType,
    public readonly id: string,
    public readonly label: string,
    public readonly extra: Record<string, unknown>,
  ) {}
}
