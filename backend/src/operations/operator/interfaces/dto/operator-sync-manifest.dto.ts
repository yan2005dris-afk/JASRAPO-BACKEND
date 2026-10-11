import { ApiProperty } from '@nestjs/swagger';

export interface OperatorSyncPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

export class OperatorSyncManifestDto {
  @ApiProperty({ description: 'Version opaca de la lectura del manifiesto' })
  snapshotVersion: string;

  @ApiProperty({ enum: ['snapshot', 'incremental'] })
  mode: 'snapshot' | 'incremental';

  @ApiProperty()
  periodId: number;

  @ApiProperty({ nullable: true })
  cursor: string | null;

  @ApiProperty()
  complete: boolean;

  @ApiProperty({ nullable: true })
  nextCursor: string | null;

  @ApiProperty({ type: [Object] })
  changes: Array<Record<string, unknown>>;

  @ApiProperty()
  routes: OperatorSyncPage<unknown>;

  @ApiProperty()
  workOrders: OperatorSyncPage<unknown>;

  @ApiProperty()
  meters: OperatorSyncPage<unknown>;

  @ApiProperty()
  readings: OperatorSyncPage<unknown>;

  @ApiProperty()
  pendingAnomalies: OperatorSyncPage<unknown>;

  constructor(partial: Partial<OperatorSyncManifestDto>) {
    Object.assign(this, partial);
  }
}
