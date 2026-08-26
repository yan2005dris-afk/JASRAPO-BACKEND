import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { StorageService } from 'src/infrastructure/storage/storage.service';

const INITIAL_ASSET_BUCKET = 'institutional-assets';
const INITIAL_ASSET_KEY = 'profiles/v1/logo.jpeg';

@Injectable()
export class InstitutionalAssetsBootstrap implements OnApplicationBootstrap {
  constructor(private readonly storage: StorageService) {}

  async onApplicationBootstrap(): Promise<void> {
    const exists = await this.storage.exists(
      INITIAL_ASSET_BUCKET,
      INITIAL_ASSET_KEY,
    );
    if (exists) return;

    const assetPath = path.resolve(
      __dirname,
      '../../infrastructure/pdf/assets/Logo.jpeg',
    );
    await this.storage.upload(
      INITIAL_ASSET_BUCKET,
      INITIAL_ASSET_KEY,
      await readFile(assetPath),
      { contentType: 'image/jpeg' },
    );
  }
}
