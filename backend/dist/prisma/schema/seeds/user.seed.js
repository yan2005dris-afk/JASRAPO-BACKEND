"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUSers = seedUSers;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seedUSers(prisma) {
    const usersToCreate = [
        {
            email: 'admin@jasrapo.com',
            password: 'Admin123#',
        },
        {
            email: 'secretary@jasrapo.com',
            password: 'Secretary123#',
        },
        {
            email: 'user@jasrapo.com',
            password: 'User123#',
        },
        {
            email: 'client@jasrapo.com',
            password: 'Client123#',
        },
    ];
    const createdUsers = [];
    for (const u of usersToCreate) {
        const hashedPassword = await bcrypt_1.default.hash(u.password, 10);
        const user = await prisma.users.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                password: hashedPassword,
            },
        });
        createdUsers.push(user);
    }
    console.log('✅ Usuarios creados correctamente.');
    return createdUsers;
}
//# sourceMappingURL=user.seed.js.map