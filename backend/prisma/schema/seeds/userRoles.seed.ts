
import { PrismaClient, Roles, Users } from "src/generated/prisma/client";

export async function seedUserRoles(
    prisma: PrismaClient,
    users: Users[],
    roles:{
        adminRol: Roles,
        secretariaRol: Roles,
        userRol: Roles,
        clienteRol: Roles
    }
){
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

    for(const item of userRoleMap){
        const user=users.find(u=>u.email===item.email);
        if(!user){
            throw new Error(`Usuario con email ${item.email} no encontrado.`);
        }

        const exits = await prisma.userRoles.findFirst({
            where:{
                usersId:user.usersId,
                rolesId:item.role.rolesId
            }
        });
        
        if(!exits){
            await prisma.userRoles.create({
                data:{
                    usersId:user.usersId,
                    rolesId:item.role.rolesId
                }
            });
        }
    }
}