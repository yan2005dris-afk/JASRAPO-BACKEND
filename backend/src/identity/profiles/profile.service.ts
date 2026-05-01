import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case';
import { FindMyProfileUseCase } from './use-cases/find-my-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { UploadAvatarUseCase } from './use-cases/upload-avatar.use-case';
import { ListAvailableAvatarsUseCase } from './use-cases/list-available-avatars.use-case';
import { SelectExistingAvatarUseCase } from './use-cases/select-existing-avatar.use-case';

@Injectable()
export class ProfileService {
  constructor(
    private readonly createUseCase: CreateProfileUseCase,
    private readonly findMyProfileUseCase: FindMyProfileUseCase,
    private readonly updateUseCase: UpdateProfileUseCase,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly listAvatarsUseCase: ListAvailableAvatarsUseCase,
    private readonly selectAvatarUseCase: SelectExistingAvatarUseCase,
  ) {}

  async create(usersId: number, createProfileDto: CreateProfileDto) {
    return this.createUseCase.execute(usersId, createProfileDto);
  }

  async findMyProfile(usersId: number) {
    return this.findMyProfileUseCase.execute(usersId);
  }

  async update(usersId: number, updateProfileDto: UpdateProfileDto) {
    return this.updateUseCase.execute(usersId, updateProfileDto);
  }

  async uploadAvatar(usersId: number, file: Express.Multer.File) {
    return this.uploadAvatarUseCase.execute(usersId, file);
  }

  async listAvailableAvatars(usersId: number) {
    return this.listAvatarsUseCase.execute(usersId);
  }

  async selectExistingAvatar(usersId: number, key: string) {
    return this.selectAvatarUseCase.execute(usersId, key);
  }
}
