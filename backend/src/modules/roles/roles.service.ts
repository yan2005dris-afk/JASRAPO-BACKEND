import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SetRoleChildrenDto } from './dto/set-role-children.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo rol y, si se especifican, asigna roles hijos (herencia).
   * - Valida que los roles hijos existan.
   * - Crea el rol y las relaciones en una transacción.
   * - Si hay error de secuencia, la corrige y reintenta.
   */
  async create(createRoleDto: CreateRoleDto) {
    const { childRoleIds = [], ...roleData } = createRoleDto;
    // Normaliza los IDs de roles hijos: convierte a número, filtra enteros positivos y elimina duplicados
    const normalizedChildRoleIds = Array.from(
      new Set(
        childRoleIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );

    // Si hay roles hijos, valida que existan en la base de datos
    if (normalizedChildRoleIds.length > 0) {
      await this.assertChildRolesExist(normalizedChildRoleIds);
    }

    try {
      // Transacción: crea el rol y las relaciones de herencia
      return await this.prisma.$transaction(async (tx) => {
        const createdRole = await tx.roles.create({
          data: roleData,
        });

        // Si hay roles hijos válidos (y no es el mismo rol), crea las relaciones en rolesHeredados
        if (normalizedChildRoleIds.length > 0) {
          const safeChildIds = normalizedChildRoleIds.filter(
            (childRoleId) => childRoleId !== createdRole.rolesId,
          );

          if (safeChildIds.length > 0) {
            await tx.rolesHeredados.createMany({
              data: safeChildIds.map((childRoleId) => ({
                parentRoleId: createdRole.rolesId,
                childRoleId,
              })),
            });
          }
        }

        return createdRole;
      });
    } catch (error: unknown) {
      // Si hay error de clave única (rolesId duplicado), corrige la secuencia y reintenta
      if (this.isRolesIdUniqueConstraintError(error)) {
        await this.syncRolesIdSequence();
        return this.prisma.$transaction(async (tx) => {
          const createdRole = await tx.roles.create({
            data: roleData,
          });

          if (normalizedChildRoleIds.length > 0) {
            const safeChildIds = normalizedChildRoleIds.filter(
              (childRoleId) => childRoleId !== createdRole.rolesId,
            );

            if (safeChildIds.length > 0) {
              await tx.rolesHeredados.createMany({
                data: safeChildIds.map((childRoleId) => ({
                  parentRoleId: createdRole.rolesId,
                  childRoleId,
                })),
              });
            }
          }

          return createdRole;
        });
      }

      // Si el error no es de clave única, lo relanza
      throw error;
    }
  }

  /**
   * Valida que todos los roles hijos existan y no estén eliminados.
   * Lanza excepción si falta alguno.
   */
  private async assertChildRolesExist(childRoleIds: number[]): Promise<void> {
    const validRoles = await this.prisma.roles.findMany({
      where: {
        rolesId: { in: childRoleIds },
        deletedAt: null,
      },
      select: { rolesId: true },
    });

    const validRoleIds = new Set(validRoles.map((role) => role.rolesId));
    const missing = childRoleIds.filter((id) => !validRoleIds.has(id));

    if (missing.length > 0) {
      throw new NotFoundException(
        `No se encontraron roles hijos válidos: ${missing.join(', ')}`,
      );
    }
  }

  /**
   * Detecta si el error es por restricción de unicidad en roles_id (clave duplicada).
   */
  private isRolesIdUniqueConstraintError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const maybeError = error as {
      code?: unknown;
      meta?: {
        target?: unknown;
        driverAdapterError?: {
          cause?: {
            constraint?: {
              fields?: unknown;
            };
          };
        };
      };
    };

    if (maybeError.code !== 'P2002') {
      return false;
    }

    const target = maybeError.meta?.target;
    if (Array.isArray(target) && target.some((field) => field === 'roles_id')) {
      return true;
    }

    const driverFields =
      maybeError.meta?.driverAdapterError?.cause?.constraint?.fields;
    if (
      Array.isArray(driverFields) &&
      driverFields.some((field) => field === 'roles_id')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Sincroniza la secuencia de IDs de la tabla roles con el valor máximo actual.
   * Soluciona problemas de clave duplicada por desfase en la secuencia.
   */
  private async syncRolesIdSequence(): Promise<void> {
    const sequenceResult = await this.prisma.$queryRaw<
      { seq: string | null }[]
    >`
      SELECT pg_get_serial_sequence('roles', 'roles_id') AS seq
    `;

    const sequenceName = sequenceResult[0]?.seq;
    if (!sequenceName) {
      return;
    }

    const escapedSequenceName = sequenceName.replace(/'/g, "''");

    await this.prisma.$executeRawUnsafe(`
      SELECT setval('${escapedSequenceName}', COALESCE((SELECT MAX(roles_id) FROM roles), 0) + 1, false)
    `);
  }

  /**
   * Devuelve todos los roles (sin filtrar eliminados).
   */
  findAll() {
    return this.prisma.roles.findMany();
  }

  /**
   * Busca un rol por su ID.
   */
  findOne(id: number) {
    return this.prisma.roles.findUnique({
      where: {
        rolesId: id,
      },
    });
  }

  /**
   * Actualiza los datos de un rol por su ID.
   */
  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.roles.update({
      where: {
        rolesId: id,
      },
      data: updateRoleDto,
    });
  }

  /**
   * Obtiene los permisos de un rol (incluyendo herencia).
   * Devuelve permisos únicos, sin repetidos.
   */
  async getRolePermissions(rolesId: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado o eliminado');
    }

    // Resolve full hierarchy: this role + all child roles (transitive)
    const allRoleIds = await this.resolveRoleHierarchy([rolesId]);

    const assignments = await this.prisma.rolPermissions.findMany({
      where: {
        rolesId: { in: allRoleIds },
        deletedAt: null,
        permissions: {
          deletedAt: null,
        },
      },
      orderBy: [
        { permissions: { resource: 'asc' } },
        { permissions: { action: 'asc' } },
      ],
      include: {
        permissions: {
          select: {
            permissionsId: true,
            resource: true,
            action: true,
          },
        },
      },
    });

    // Deduplicate by permissionsId (same permission may come from multiple child roles)
    const seen = new Set<number>();
    return assignments
      .filter((a) => {
        if (seen.has(a.permissionsId)) return false;
        seen.add(a.permissionsId);
        return true;
      })
      .map((assignment) => ({
        rolPermissionsId: assignment.rolPermissionsId,
        permissionsId: assignment.permissionsId,
        resource: assignment.permissions.resource,
        action: assignment.permissions.action,
      }));
  }

  /**
   * Resuelve toda la jerarquía de roles hijos (transitiva) a partir de IDs iniciales.
   * Devuelve todos los IDs de roles relacionados.
   */
  private async resolveRoleHierarchy(
    initialRoleIds: number[],
  ): Promise<number[]> {
    if (initialRoleIds.length === 0) return [];

    const edges = await this.prisma.rolesHeredados.findMany({
      where: {
        deletedAt: null,
        parentRole: { deletedAt: null },
        childRole: { deletedAt: null },
      },
      select: { parentRoleId: true, childRoleId: true },
    });

    const childrenByParent = new Map<number, number[]>();
    for (const edge of edges) {
      const current = childrenByParent.get(edge.parentRoleId) ?? [];
      current.push(edge.childRoleId);
      childrenByParent.set(edge.parentRoleId, current);
    }

    const visited = new Set<number>();
    const stack = [...initialRoleIds];

    while (stack.length > 0) {
      const roleId = stack.pop()!;
      if (visited.has(roleId)) continue;
      visited.add(roleId);

      const children = childrenByParent.get(roleId) ?? [];
      for (const childId of children) {
        if (!visited.has(childId)) stack.push(childId);
      }
    }

    return Array.from(visited);
  }

  /**
   * Asigna un permiso a un rol. Si ya existe y está eliminado, lo reactiva.
   */
  async assignPermission(rolesId: number, permissionsId: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado o eliminado');
    }

    const permission = await this.prisma.permissions.findUnique({
      where: { permissionsId },
    });
    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permiso no encontrado o eliminado');
    }

    const existing = await this.prisma.rolPermissions.findFirst({
      where: { rolesId, permissionsId },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Si el permiso fue eliminado (borrado suave), reactívalo
        return this.prisma.rolPermissions.update({
          where: { rolPermissionsId: existing.rolPermissionsId },
          data: { deletedAt: null },
        });
      } else {
        throw new ConflictException('El rol ya tiene ese permiso asignado');
      }
    }

    return this.prisma.rolPermissions.create({
      data: {
        rolesId,
        permissionsId,
      },
    });
  }

  /**
   * Elimina un permiso de un rol.
   */
  async removePermission(rolesId: number, permissionsId: number) {
    const assignment = await this.prisma.rolPermissions.findFirst({
      where: { rolesId, permissionsId },
    });

    if (!assignment) {
      throw new NotFoundException('Permiso no asignado a este rol');
    }

    return this.prisma.rolPermissions.update({
      where: { rolPermissionsId: assignment.rolPermissionsId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Obtiene los roles hijos directos de un rol.
   */
  async getRoleChildren(rolesId: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado o eliminado');
    }

    const links = await this.prisma.rolesHeredados.findMany({
      where: {
        parentRoleId: rolesId,
        deletedAt: null,
        childRole: { deletedAt: null },
      },
      select: {
        roleHierarchyId: true,
        childRoleId: true,
        childRole: { select: { name: true } },
      },
      orderBy: { childRoleId: 'asc' },
    });

    return links.map((link) => ({
      roleHierarchyId: link.roleHierarchyId,
      childRoleId: link.childRoleId,
      childRoleName: link.childRole.name,
    }));
  }

  /**
   * Actualiza la lista de roles hijos de un rol (herencia).
   * Elimina los que ya no están y agrega los nuevos.
   */
  async setRoleChildren(rolesId: number, dto: SetRoleChildrenDto) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado o eliminado');
    }

    const normalizedChildRoleIds = Array.from(
      new Set(
        dto.childRoleIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0 && id !== rolesId),
      ),
    );

    if (normalizedChildRoleIds.length > 0) {
      await this.assertChildRolesExist(normalizedChildRoleIds);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.rolesHeredados.updateMany({
        where: {
          parentRoleId: rolesId,
          deletedAt: null,
          childRoleId: { notIn: normalizedChildRoleIds },
        },
        data: { deletedAt: new Date() },
      });

      for (const childRoleId of normalizedChildRoleIds) {
        const existing = await tx.rolesHeredados.findFirst({
          where: { parentRoleId: rolesId, childRoleId },
          select: { roleHierarchyId: true, deletedAt: true },
        });

        if (!existing) {
          await tx.rolesHeredados.create({
            data: { parentRoleId: rolesId, childRoleId },
          });
          continue;
        }

        if (existing.deletedAt) {
          await tx.rolesHeredados.update({
            where: { roleHierarchyId: existing.roleHierarchyId },
            data: { deletedAt: null },
          });
        }
      }

      return tx.rolesHeredados.findMany({
        where: {
          parentRoleId: rolesId,
          deletedAt: null,
          childRole: { deletedAt: null },
        },
        select: {
          roleHierarchyId: true,
          childRoleId: true,
          childRole: { select: { name: true } },
        },
        orderBy: { childRoleId: 'asc' },
      });
    });
  }
}
