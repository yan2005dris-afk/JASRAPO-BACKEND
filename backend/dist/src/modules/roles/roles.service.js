"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRoleDto) {
        const { childRoleIds = [], ...roleData } = createRoleDto;
        const normalizedChildRoleIds = Array.from(new Set(childRoleIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0)));
        if (normalizedChildRoleIds.length > 0) {
            await this.assertChildRolesExist(normalizedChildRoleIds);
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const createdRole = await tx.roles.create({
                    data: roleData,
                });
                if (normalizedChildRoleIds.length > 0) {
                    const safeChildIds = normalizedChildRoleIds.filter((childRoleId) => childRoleId !== createdRole.rolesId);
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
        catch (error) {
            if (this.isRolesIdUniqueConstraintError(error)) {
                await this.syncRolesIdSequence();
                return this.prisma.$transaction(async (tx) => {
                    const createdRole = await tx.roles.create({
                        data: roleData,
                    });
                    if (normalizedChildRoleIds.length > 0) {
                        const safeChildIds = normalizedChildRoleIds.filter((childRoleId) => childRoleId !== createdRole.rolesId);
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
            throw error;
        }
    }
    async assertChildRolesExist(childRoleIds) {
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
            throw new common_1.NotFoundException(`No se encontraron roles hijos válidos: ${missing.join(', ')}`);
        }
    }
    isRolesIdUniqueConstraintError(error) {
        if (typeof error !== 'object' || error === null) {
            return false;
        }
        const maybeError = error;
        if (maybeError.code !== 'P2002') {
            return false;
        }
        const target = maybeError.meta?.target;
        if (Array.isArray(target) && target.some((field) => field === 'roles_id')) {
            return true;
        }
        const driverFields = maybeError.meta?.driverAdapterError?.cause?.constraint?.fields;
        if (Array.isArray(driverFields) &&
            driverFields.some((field) => field === 'roles_id')) {
            return true;
        }
        return false;
    }
    async syncRolesIdSequence() {
        const sequenceResult = await this.prisma.$queryRaw `
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
    findAll() {
        return this.prisma.roles.findMany();
    }
    findOne(id) {
        return this.prisma.roles.findUnique({
            where: {
                rolesId: id,
            },
        });
    }
    update(id, updateRoleDto) {
        return this.prisma.roles.update({
            where: {
                rolesId: id,
            },
            data: updateRoleDto,
        });
    }
    async getRolePermissions(rolesId) {
        const role = await this.prisma.roles.findUnique({ where: { rolesId } });
        if (!role || role.deletedAt) {
            throw new common_1.NotFoundException('Rol no encontrado o eliminado');
        }
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
        const seen = new Set();
        return assignments
            .filter((a) => {
            if (seen.has(a.permissionsId))
                return false;
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
    async resolveRoleHierarchy(initialRoleIds) {
        if (initialRoleIds.length === 0)
            return [];
        const edges = await this.prisma.rolesHeredados.findMany({
            where: {
                deletedAt: null,
                parentRole: { deletedAt: null },
                childRole: { deletedAt: null },
            },
            select: { parentRoleId: true, childRoleId: true },
        });
        const childrenByParent = new Map();
        for (const edge of edges) {
            const current = childrenByParent.get(edge.parentRoleId) ?? [];
            current.push(edge.childRoleId);
            childrenByParent.set(edge.parentRoleId, current);
        }
        const visited = new Set();
        const stack = [...initialRoleIds];
        while (stack.length > 0) {
            const roleId = stack.pop();
            if (visited.has(roleId))
                continue;
            visited.add(roleId);
            const children = childrenByParent.get(roleId) ?? [];
            for (const childId of children) {
                if (!visited.has(childId))
                    stack.push(childId);
            }
        }
        return Array.from(visited);
    }
    async assignPermission(rolesId, permissionsId) {
        const role = await this.prisma.roles.findUnique({ where: { rolesId } });
        if (!role || role.deletedAt) {
            throw new common_1.NotFoundException('Rol no encontrado o eliminado');
        }
        const permission = await this.prisma.permissions.findUnique({
            where: { permissionsId },
        });
        if (!permission || permission.deletedAt) {
            throw new common_1.NotFoundException('Permiso no encontrado o eliminado');
        }
        const existing = await this.prisma.rolPermissions.findFirst({
            where: { rolesId, permissionsId },
        });
        if (existing) {
            if (existing.deletedAt) {
                return this.prisma.rolPermissions.update({
                    where: { rolPermissionsId: existing.rolPermissionsId },
                    data: { deletedAt: null },
                });
            }
            else {
                throw new common_1.ConflictException('El rol ya tiene ese permiso asignado');
            }
        }
        return this.prisma.rolPermissions.create({
            data: {
                rolesId,
                permissionsId,
            },
        });
    }
    async removePermission(rolesId, permissionsId) {
        const assignment = await this.prisma.rolPermissions.findFirst({
            where: { rolesId, permissionsId },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Permiso no asignado a este rol');
        }
        return this.prisma.rolPermissions.update({
            where: { rolPermissionsId: assignment.rolPermissionsId },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async getRoleChildren(rolesId) {
        const role = await this.prisma.roles.findUnique({ where: { rolesId } });
        if (!role || role.deletedAt) {
            throw new common_1.NotFoundException('Rol no encontrado o eliminado');
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
    async setRoleChildren(rolesId, dto) {
        const role = await this.prisma.roles.findUnique({ where: { rolesId } });
        if (!role || role.deletedAt) {
            throw new common_1.NotFoundException('Rol no encontrado o eliminado');
        }
        const normalizedChildRoleIds = Array.from(new Set(dto.childRoleIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0 && id !== rolesId)));
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
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map