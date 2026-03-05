import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/database/prisma.service';
import { ConfigService } from '@nestjs/config';
declare const RefreshTokenStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    validate(payload: any): Promise<{
        usersId: any;
        sessionsId: any;
    }>;
}
export {};
