import bcrypt from 'bcrypt';
import { PrismaClient, Roles, Users } from "src/generated/prisma/client";

export async function seedUSers(
  prisma: PrismaClient,
  roles: {
    adminRol: Roles;
    secretariaRol: Roles;
    recaudacionRol: Roles;
    presidenciaRol: Roles;
    operadoresRol: Roles;
    contabilidadRol: Roles;
    userRol: Roles;
  },
) {
    const usersToCreate = [
        {
            email:'admin@jasrapo.com',
            password:'Admin123#',
            rolesId: roles.adminRol.rolesId,
        },
        {
            email:'secretaria@jasrapo.com',
            password:'Secretaria123#',
            rolesId: roles.secretariaRol.rolesId,
        },
        {
            email:'recaudacion@jasrapo.com',
            password:'Recaudacion123#',
            rolesId: roles.recaudacionRol.rolesId,
        },
        {
            email:'presidencia@jasrapo.com',
            password:'Presidencia123#',
            rolesId: roles.presidenciaRol.rolesId,
        },
        {
            email:'operadores@jasrapo.com',
            password:'Operadores123#',
            rolesId: roles.operadoresRol.rolesId,
        },
        {
            email:'contabilidad@jasrapo.com',
            password:'Contabilidad123#',
            rolesId: roles.contabilidadRol.rolesId,
        },
        {
            email:'user@jasrapo.com',
            password:'User123#',
            rolesId: roles.userRol.rolesId,
        },
    ];
    
    const createdUsers:Users[] = [];

    for (const u of usersToCreate) {
        const hashedPassword = await bcrypt.hash(u.password, 10);

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