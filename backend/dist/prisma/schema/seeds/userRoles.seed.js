"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUserRoles = seedUserRoles;
async function seedUserRoles(prisma, users, roles) {
    const userRoleMap = [
        {
            email: 'admin@jasrapo.com',
            role: roles.adminRol
        },
        {
            email: 'secretary@jasrapo.com',
            role: roles.secretariaRol
        },
        {
            email: 'user@jasrapo.com',
            role: roles.userRol
        },
        {
            email: 'client@jasrapo.com',
            role: roles.clienteRol
        },
    ];
    for (const item of userRoleMap) {
        const user = users.find(u => u.email === item.email);
        if (!user) {
            throw new Error(`Usuario con email ${item.email} no encontrado.`);
        }
        const exits = await prisma.userRoles.findFirst({
            where: {
                usersId: user.usersId,
                rolesId: item.role.rolesId
            }
        });
        if (!exits) {
            await prisma.userRoles.create({
                data: {
                    usersId: user.usersId,
                    rolesId: item.role.rolesId
                }
            });
        }
    }
}
//# sourceMappingURL=userRoles.seed.js.map