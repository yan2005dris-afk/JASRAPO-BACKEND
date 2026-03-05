import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from 'src/modules/user/user.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    private readonly config;
    private readonly userService;
    constructor(prisma: PrismaService, config: ConfigService, userService: UserService);
    validate(payload: any): Promise<{
        sub: any;
        usersId: any;
        sid: any;
        email: any;
        permissions: {
            resource: string;
            action: string;
        }[];
    }>;
}
export {};
