import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';
import { MinioService } from '../storage/minio.service';
export declare class ProfileController {
    private readonly profileService;
    private readonly minioService;
    constructor(profileService: ProfileService, minioService: MinioService);
    create(req: any, createProfileDto: CreateProfileDto): Promise<{
        usersId: number;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        profileId: number;
    }>;
    findMe(req: any): Promise<{
        usersId: number;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        profileId: number;
    } | null>;
    update(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        usersId: number;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        profileId: number;
    }>;
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        message: string;
        avatar: {
            uuid: `${string}-${string}-${string}-${string}-${string}`;
            key: string;
            originalName: string;
            mimeType: string;
            size: number;
            bucket: string;
            uploadedAt: string;
        };
    }>;
    listAvailableAvatars(req: any): Promise<{
        avatars: {
            key: string;
            url: string;
        }[];
    }>;
    selectExistingAvatar(req: any, key: string): Promise<{
        message: string;
        avatar: {
            uuid: string;
            key: string;
            originalName: string;
            mimeType: string;
            size: number;
            bucket: string;
            uploadedAt: string;
        };
    }>;
    getAvatar(fileName: string, res: any): Promise<any>;
}
