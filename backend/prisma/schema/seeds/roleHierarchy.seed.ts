import { PrismaClient, Roles } from 'src/generated/prisma/client';

export async function seedRoleHierarchy(
  prisma: PrismaClient,
  roles: {
    adminRol: Roles;
    secretariaRol: Roles;
    recaudacionRol: Roles;
    presidenciaRol: Roles;
    operadoresRol: Roles;
    userRol: Roles;
    contabilidadRol: Roles;
  },
) {
  await prisma.rolesHeredados.deleteMany();

  const links = [
    // Contabilidad agrega permisos de secretaria y recaudacion.
    {
      parentRoleId: roles.contabilidadRol.rolesId,
      childRoleId: roles.secretariaRol.rolesId,
    },
    {
      parentRoleId: roles.contabilidadRol.rolesId,
      childRoleId: roles.recaudacionRol.rolesId,
    },
  ];

  for (const link of links) {
    if (link.parentRoleId === link.childRoleId) {
      continue;
    }

    await prisma.rolesHeredados.create({
      data: link,
    });
  }
}
