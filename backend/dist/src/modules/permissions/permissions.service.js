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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PermissionsService = class PermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createPermissionDto) {
        return this.prisma.permissions.create({
            data: {
                resource: createPermissionDto.resource,
                action: createPermissionDto.action,
            },
        });
    }
    findAll() {
        return this.prisma.permissions.findMany({
            where: { deletedAt: null },
            orderBy: [{ resource: 'asc' }, { action: 'asc' }],
            select: {
                permissionsId: true,
                resource: true,
                action: true,
            },
        });
    }
    async findOne(id) {
        const permission = await this.prisma.permissions.findUnique({
            where: { permissionsId: id },
            select: {
                permissionsId: true,
                resource: true,
                action: true,
                deletedAt: true,
            },
        });
        if (!permission || permission.deletedAt) {
            throw new common_1.NotFoundException('Permiso no encontrado');
        }
        return permission;
    }
    update(id, updatePermissionDto) {
        return this.prisma.permissions.update({
            where: { permissionsId: id },
            data: {
                resource: updatePermissionDto.resource,
                action: updatePermissionDto.action,
            },
            select: {
                permissionsId: true,
                resource: true,
                action: true,
            },
        });
    }
    remove(id) {
        return this.prisma.permissions.update({
            where: { permissionsId: id },
            data: { deletedAt: new Date() },
            select: {
                permissionsId: true,
                resource: true,
                action: true,
            },
        });
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map