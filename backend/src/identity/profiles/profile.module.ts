import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { AuthModule } from 'src/identity/auth/auth.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case';
import { FindMyProfileUseCase } from './use-cases/find-my-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { UploadAvatarUseCase } from './use-cases/upload-avatar.use-case';
import { ListAvailableAvatarsUseCase } from './use-cases/list-available-avatars.use-case';
import { SelectExistingAvatarUseCase } from './use-cases/select-existing-avatar.use-case';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    PrismaService,
    CreateProfileUseCase,
    FindMyProfileUseCase,
    UpdateProfileUseCase,
    UploadAvatarUseCase,
    ListAvailableAvatarsUseCase,
    SelectExistingAvatarUseCase,
  ],
  exports: [
    CreateProfileUseCase,
    FindMyProfileUseCase,
    UpdateProfileUseCase,
    UploadAvatarUseCase,
    ListAvailableAvatarsUseCase,
    SelectExistingAvatarUseCase,
  ],
})
export class ProfileModule {}
