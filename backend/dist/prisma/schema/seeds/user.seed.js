"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUSers = seedUSers;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seedUSers(prisma, roles) {
    const usersToCreate = [
        {
            email: 'admin@jasrapo.com',
            password: 'Admin123#',
            rolesId: roles.adminRol.rolesId,
        },
        {
            email: 'secretaria@jasrapo.com',
            password: 'Secretaria123#',
            rolesId: roles.secretariaRol.rolesId,
        },
        {
            email: 'recaudacion@jasrapo.com',
            password: 'Recaudacion123#',
            rolesId: roles.recaudacionRol.rolesId,
        },
        {
            email: 'presidencia@jasrapo.com',
            password: 'Presidencia123#',
            rolesId: roles.presidenciaRol.rolesId,
        },
        {
            email: 'operadores@jasrapo.com',
            password: 'Operadores123#',
            rolesId: roles.operadoresRol.rolesId,
        },
        {
            email: 'contabilidad@jasrapo.com',
            password: 'Contabilidad123#',
            rolesId: roles.contabilidadRol.rolesId,
        },
        {
            email: 'user@jasrapo.com',
            password: 'User123#',
            rolesId: roles.userRol.rolesId,
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
                rolesId: u.rolesId,
            },
        });
        createdUsers.push(user);
    }
    console.log('✅ Usuarios creados correctamente.');
    return createdUsers;
}
//# sourceMappingURL=user.seed.js.map