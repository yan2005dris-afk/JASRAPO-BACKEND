import { PrismaService } from 'src/database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MinioService } from '../storage/minio.service';
export declare class ProfileService {
    private readonly prisma;
    private minioService;
    constructor(prisma: PrismaService, minioService: MinioService);
    create(usersId: number, createProfileDto: CreateProfileDto): Promise<{
        usersId: number;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        profileId: number;
    }>;
    findMyProfile(usersId: number): Promise<{
        usersId: number;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        profileId: number;
    } | null>;
    private tryRecoverAvatar;
    update(usersId: number, updateProfileDto: UpdateProfileDto): Promise<{
        usersId: number;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        profileId: number;
    }>;
    uploadAvatar(usersId: number, file: Express.Multer.File): Promise<{
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
    listAvailableAvatars(usersId: number): Promise<{
        avatars: {
            key: string;
            url: string;
        }[];
    }>;
    selectExistingAvatar(usersId: number, key: string): Promise<{
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
}
