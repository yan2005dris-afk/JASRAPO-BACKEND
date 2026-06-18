import { Module } from '@nestjs/common';
import { StorageProxyController } from './storage-proxy.controller';

@Module({
  controllers: [StorageProxyController],
})
export class StorageProxyModule {}
