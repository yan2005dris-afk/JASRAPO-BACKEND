import bcrypt from 'bcrypt';
import type {
  PrismaClient,
  Roles,
  Usuarios,
} from 'src/generated/prisma/client';

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
            nombres: 'Administrador',
            apellidos: 'Principal',
            telefono: '+593991234567',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/admin', key: 'avatars/admin' },
        },
        {
            email:'secretaria@jasrapo.com',
            password:'Secretaria123#',
            rolId: roles.secretariaRol.rolId,
            nombres: 'María',
            apellidos: 'Gómez',
            telefono: '+593981234567',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/secretaria', key: 'avatars/secretaria' },
        },
        {
            email:'recaudacion@jasrapo.com',
            password:'Recaudacion123#',
            rolId: roles.recaudacionRol.rolId,
            nombres: 'Carlos',
            apellidos: 'Rodríguez',
            telefono: '+593971234567',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/recaudacion', key: 'avatars/recaudacion' },
        },
        {
            email:'presidencia@jasrapo.com',
            password:'Presidencia123#',
            rolId: roles.presidenciaRol.rolId,
            nombres: 'Ana',
            apellidos: 'Martínez',
            telefono: '+593961234567',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/presidencia', key: 'avatars/presidencia' },
        },
        {
            email:'operadores@jasrapo.com',
            password:'Operadores123#',
            rolId: roles.operadoresRol.rolId,
            nombres: 'Pedro',
            apellidos: 'Sánchez',
            telefono: '+593951234567',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/operadores', key: 'avatars/operadores' },
        },
        {
            email: 'operador1@jasrapo.com',
            password: 'Operadores123#',
            rolId: roles.operadoresRol.rolId,
            nombres: 'Carlos',
            apellidos: 'Méndez',
            telefono: '+593951234501',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/operador1', key: 'avatars/operador1' },
        },
        {
            email: 'operador2@jasrapo.com',
            password: 'Operadores123#',
            rolId: roles.operadoresRol.rolId,
            nombres: 'Roberto',
            apellidos: 'Macías',
            telefono: '+593951234502',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/operador2', key: 'avatars/operador2' },
        },
        {
            email: 'operador3@jasrapo.com',
            password: 'Operadores123#',
            rolId: roles.operadoresRol.rolId,
            nombres: 'Diana',
            apellidos: 'Figueroa',
            telefono: '+593951234503',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/operador3', key: 'avatars/operador3' },
        },
        {
            email: 'operador4@jasrapo.com',
            password: 'Operadores123#',
            rolId: roles.operadoresRol.rolId,
            nombres: 'Marcos',
            apellidos: 'Alarcón',
            telefono: '+593951234504',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/operador4', key: 'avatars/operador4' },
        },
        {
            email: 'operador5@jasrapo.com',
            password: 'Operadores123#',
            rolId: roles.operadoresRol.rolId,
            nombres: 'Patricia',
            apellidos: 'Suárez',
            telefono: '+593951234505',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/operador5', key: 'avatars/operador5' },
        },
        {
            email:'contabilidad@jasrapo.com',
            password:'Contabilidad123#',
            rolId: roles.contabilidadRol.rolId,
            nombres: 'Laura',
            apellidos: 'Fernández',
            telefono: '+593941234567',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/contabilidad', key: 'avatars/contabilidad' },
        },
        {
            email:'user@jasrapo.com',
            password:'User123#',
            rolId: roles.userRol.rolId,
            nombres: 'Usuario',
            apellidos: 'Demo',
            telefono: '+593931234567',
            avatar: { url: 'https://res.cloudinary.com/jasrapo/image/upload/v1/avatars/user', key: 'avatars/user' },
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
                rol: { connect: { rolId: u.rolId } },
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
