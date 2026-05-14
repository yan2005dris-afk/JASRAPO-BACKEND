import bcrypt from 'bcrypt';
import { PrismaClient, Roles, Usuarios } from "src/generated/prisma/client";

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
            rolId: roles.adminRol.rolId,
            nombres: 'Juan',
            apellidos: 'Pérez',
            telefono: '+5491155555555',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/admin', publicId: 'avatars/admin' },
        },
        {
            email:'secretaria@jasrapo.com',
            password:'Secretaria123#',
            rolId: roles.secretariaRol.rolId,
            nombres: 'María',
            apellidos: 'Gómez',
            telefono: '+5491155555556',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/secretaria', publicId: 'avatars/secretaria' },
        },
        {
            email:'recaudacion@jasrapo.com',
            password:'Recaudacion123#',
            rolId: roles.recaudacionRol.rolId,
            nombres: 'Carlos',
            apellidos: 'Rodríguez',
            telefono: '+5491155555557',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/recaudacion', publicId: 'avatars/recaudacion' },
        },
        {
            email:'presidencia@jasrapo.com',
            password:'Presidencia123#',
            rolId: roles.presidenciaRol.rolId,
            nombres: 'Ana',
            apellidos: 'Martínez',
            telefono: '+5491155555558',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/presidencia', publicId: 'avatars/presidencia' },
        },
        {
            email:'operadores@jasrapo.com',
            password:'Operadores123#',
            rolId: roles.operadoresRol.rolId,
            nombres: 'Pedro',
            apellidos: 'Sánchez',
            telefono: '+5491155555559',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/operadores', publicId: 'avatars/operadores' },
        },
        {
            email:'contabilidad@jasrapo.com',
            password:'Contabilidad123#',
            rolId: roles.contabilidadRol.rolId,
            nombres: 'Laura',
            apellidos: 'Fernández',
            telefono: '+5491155555560',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/contabilidad', publicId: 'avatars/contabilidad' },
        },
        {
            email:'user@jasrapo.com',
            password:'User123#',
            rolId: roles.userRol.rolId,
            nombres: 'Usuario',
            apellidos: 'Demo',
            telefono: '+5491155555561',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/user', publicId: 'avatars/user' },
        },
    ];
    
    const createdUsers:Usuarios[] = [];

    for (const u of usersToCreate) {
        const hashedPassword = await bcrypt.hash(u.password, 10);

        const user = await prisma.usuarios.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                clave: hashedPassword,
                rolId: u.rolId,
                nombres: u.nombres,
                apellidos: u.apellidos,
                telefono: u.telefono,
                avatar: u.avatar,
                createdAt: new Date(),
                },
                });

        createdUsers.push(user);
    }

    console.log('✅ Usuarios creados correctamente.');

    return createdUsers;
}
