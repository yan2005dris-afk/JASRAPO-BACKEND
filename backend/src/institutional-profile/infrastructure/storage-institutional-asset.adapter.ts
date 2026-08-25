import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { InstitutionalAssetPort } from '../application/ports/institutional-profile.ports';
import type {
  InstitutionalAssetReference,
  ResolvedInstitutionalAsset,
} from '../domain/institutional-profile.types';

@Injectable()
export class StorageInstitutionalAssetAdapter extends InstitutionalAssetPort {
  constructor(private readonly storage: StorageService) {
    super();
  }

  async resolve(
    reference: InstitutionalAssetReference,
  ): Promise<ResolvedInstitutionalAsset> {
    const exists = await this.storage.exists(
      reference.contenedor,
      reference.clave,
    );
    if (!exists) {
      throw new UnprocessableEntityException(
        `No existe el activo institucional ${reference.contenedor}/${reference.clave}`,
      );
    }

    const stream = await this.storage.getObject(
      reference.contenedor,
      reference.clave,
    );
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return {
      ...reference,
      url: `data:${reference.tipoContenido};base64,${Buffer.concat(chunks).toString('base64')}`,
    };
  }
}
