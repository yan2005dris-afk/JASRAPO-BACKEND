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
      email: 'admin@jasrapo.com',
      password: 'Admin123#',
      rolId: roles.adminRol.rolId,
    },
    {
      email: 'secretaria@jasrapo.com',
      password: 'Secretaria123#',
      rolId: roles.secretariaRol.rolId,
    },
    {
      email: 'recaudacion@jasrapo.com',
      password: 'Recaudacion123#',
      rolId: roles.recaudacionRol.rolId,
    },
    {
      email: 'presidencia@jasrapo.com',
      password: 'Presidencia123#',
      rolId: roles.presidenciaRol.rolId,
    },
    {
      email: 'operadores@jasrapo.com',
      password: 'Operadores123#',
      rolId: roles.operadoresRol.rolId,
    },
    {
      email: 'contabilidad@jasrapo.com',
      password: 'Contabilidad123#',
      rolId: roles.contabilidadRol.rolId,
    },
    {
      email: 'user@jasrapo.com',
      password: 'User123#',
      rolId: roles.userRol.rolId,
    },
  ];

  const createdUsers: Usuarios[] = [];

  for (const u of usersToCreate) {
    const hashedPassword = await bcrypt.hash(u.password, 10);

    const user = await prisma.usuarios.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        clave: hashedPassword,
        rolId: u.rolId,
      },
    });
    createdUsers.push(user);
  }

  console.log('✅ Usuarios creados correctamente.');

  return createdUsers;
}
