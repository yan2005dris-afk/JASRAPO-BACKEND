import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    create(req: any, createProfileDto: CreateProfileDto): Promise<{
        usersId: number;
        createdAt: Date;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: string | null;
        updatedAt: Date;
        profileId: number;
    }>;
    findMe(req: any): Promise<{
        usersId: number;
        createdAt: Date;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: string | null;
        updatedAt: Date;
        profileId: number;
    }>;
    update(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        usersId: number;
        createdAt: Date;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: string | null;
        updatedAt: Date;
        profileId: number;
    }>;
}
