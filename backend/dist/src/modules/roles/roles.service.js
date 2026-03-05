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
        try {
            return await this.prisma.roles.create({
                data: createRoleDto,
            });
        }
        catch (error) {
            if (this.isRolesIdUniqueConstraintError(error)) {
                await this.syncRolesIdSequence();
                return this.prisma.roles.create({
                    data: createRoleDto,
                });
            }
            throw error;
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
        const assignments = await this.prisma.rolPermissions.findMany({
            where: {
                rolesId,
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
        return assignments.map((assignment) => ({
            rolPermissionsId: assignment.rolPermissionsId,
            permissionsId: assignment.permissionsId,
            resource: assignment.permissions.resource,
            action: assignment.permissions.action,
        }));
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
            throw new common_1.ConflictException('El rol ya tiene ese permiso asignado');
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
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map