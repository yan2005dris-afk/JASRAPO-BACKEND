import { PrismaService } from 'src/database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(usersId: number, createProfileDto: CreateProfileDto): Promise<{
        usersId: number;
        createdAt: Date;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: string | null;
        updatedAt: Date;
        profileId: number;
    }>;
    findMyProfile(usersId: number): Promise<{
        usersId: number;
        createdAt: Date;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: string | null;
        updatedAt: Date;
        profileId: number;
    }>;
    update(usersId: number, updateProfileDto: UpdateProfileDto): Promise<{
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
