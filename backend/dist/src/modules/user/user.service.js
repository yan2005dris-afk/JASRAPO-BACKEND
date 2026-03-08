"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../database/prisma.service");
const safeUserSelect = {
    usersId: true,
    email: true,
};
const userWithRolesSelect = {
    usersId: true,
    email: true,
    role: {
        select: {
            rolesId: true,
            name: true,
            deletedAt: true,
        },
    },
};
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    isBcryptHash(value) {
        return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
    }
    async ensureHashedPassword(password) {
        if (this.isBcryptHash(password)) {
            return password;
        }
        return bcrypt.hash(password, 10);
    }
    async user(userWhereUniqueInput) {
        return this.prisma.users.findUnique({
            where: userWhereUniqueInput,
            select: safeUserSelect,
        });
    }
    async users(params) {
        const { skip, take, cursor, where, orderBy } = params;
        const users = await this.prisma.users.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            select: userWithRolesSelect,
        });
        return users.map((user) => ({
            usersId: user.usersId,
            email: user.email,
            roles: user.role && !user.role.deletedAt
                ? [
                    {
                        rolesId: user.role.rolesId,
                        name: user.role.name,
                    },
                ]
                : [],
        }));
    }
    async createUser(createUsersDto) {
        const userRole = await this.prisma.roles.findFirst({
            where: { name: 'user' },
        });
        if (!userRole) {
            throw new Error('No existe el rol por defecto "user".');
        }
        const safePassword = await this.ensureHashedPassword(createUsersDto.password);
        const newUser = await this.prisma.users.create({
            data: {
                email: createUsersDto.email,
                password: safePassword,
                rolesId: userRole.rolesId,
            },
        });
        await this.prisma.profiles.create({
            data: { usersId: newUser.usersId },
        });
        return {
            usersId: newUser.usersId,
            email: newUser.email,
        };
    }
    async updateUser(params) {
        const updateData = { ...params.data };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        return this.prisma.users.update({
            where: params.where,
            data: updateData,
            select: safeUserSelect,
        });
    }
    async softDeleteUser(where) {
        return this.prisma.users.update({
            where,
            data: { deletedAt: new Date() },
            select: safeUserSelect,
        });
    }
    async getRolesByUserId(usersId) {
        const user = await this.prisma.users.findUnique({
            where: { usersId },
            select: {
                role: {
                    select: {
                        name: true,
                        deletedAt: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (!user.role || user.role.deletedAt) {
            return [];
        }
        return [user.role.name];
    }
    async getRoleAssignmentsByUserId(usersId) {
        const user = await this.prisma.users.findUnique({
            where: { usersId },
            select: {
                usersId: true,
                deletedAt: true,
                rolesId: true,
                role: {
                    select: {
                        rolesId: true,
                        name: true,
                        deletedAt: true,
                    },
                },
            },
        });
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('Usuario eliminado o no encontrado');
        }
        if (!user.role || user.role.deletedAt || !user.rolesId) {
            return [];
        }
        return [
            {
                usersId: user.usersId,
                rolesId: user.rolesId,
                name: user.role.name,
            },
        ];
    }
    async assignRoleToUser(usersId, rolesId) {
        const user = await this.prisma.users.findUnique({ where: { usersId } });
        if (!user || user.deletedAt)
            throw new common_1.NotFoundException('Usuario no encontrado o eliminado');
        const role = await this.prisma.roles.findUnique({ where: { rolesId } });
        if (!role || role.deletedAt)
            throw new common_1.NotFoundException('Rol no encontrado o eliminado');
        if (user.rolesId === rolesId)
            throw new common_1.ConflictException('El usuario ya tiene ese rol activo');
        return this.prisma.users.update({
            where: { usersId },
            data: { rolesId },
        });
    }
    async revokeRoleFromUser(usersId) {
        const user = await this.prisma.users.findUnique({
            where: { usersId },
            select: { usersId: true, deletedAt: true, rolesId: true },
        });
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('Usuario no encontrado o eliminado');
        }
        if (!user.rolesId) {
            throw new common_1.ConflictException('El usuario ya no tiene rol asignado');
        }
        return this.prisma.users.update({
            where: { usersId },
            data: { rolesId: null },
        });
    }
    async getDirectPermissionsByUserId(usersId) {
        const user = await this.prisma.users.findUnique({ where: { usersId } });
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('Usuario no encontrado o eliminado');
        }
        const assignments = await this.prisma.userPermissions.findMany({
            where: {
                usersId,
                deteledAt: null,
                Permissions: {
                    deletedAt: null,
                },
            },
            orderBy: [
                { Permissions: { resource: 'asc' } },
                { Permissions: { action: 'asc' } },
            ],
            include: {
                Permissions: {
                    select: {
                        permissionsId: true,
                        resource: true,
                        action: true,
                    },
                },
            },
        });
        return assignments.map((assignment) => ({
            idUserPermissions: assignment.idUserPermissions,
            permissionsId: assignment.permissionsId,
            resource: assignment.Permissions.resource,
            action: assignment.Permissions.action,
            allow: assignment.allow,
        }));
    }
    async assignPermissionToUser(usersId, permissionsId, allow = true) {
        const user = await this.prisma.users.findUnique({ where: { usersId } });
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('Usuario no encontrado o eliminado');
        }
        const permission = await this.prisma.permissions.findUnique({
            where: { permissionsId },
        });
        if (!permission || permission.deletedAt) {
            throw new common_1.NotFoundException('Permiso no encontrado o eliminado');
        }
        const existing = await this.prisma.userPermissions.findFirst({
            where: {
                usersId,
                permissionsId,
                deteledAt: null,
            },
        });
        if (existing) {
            return this.prisma.userPermissions.update({
                where: { idUserPermissions: existing.idUserPermissions },
                data: { allow },
            });
        }
        return this.prisma.userPermissions.create({
            data: {
                usersId,
                permissionsId,
                allow,
            },
        });
    }
    async revokePermissionFromUser(idUserPermissions) {
        const userPermission = await this.prisma.userPermissions.findUnique({
            where: { idUserPermissions },
        });
        if (!userPermission) {
            throw new common_1.NotFoundException('Asignacion de permiso no encontrada');
        }
        if (userPermission.deteledAt) {
            throw new common_1.ConflictException('Este permiso ya fue revocado previamente');
        }
        return this.prisma.userPermissions.update({
            where: { idUserPermissions },
            data: { deteledAt: new Date() },
        });
    }
    async getEffectivePermissions(usersId) {
        const user = await this.prisma.users.findUnique({
            where: { usersId },
            include: {
                role: {
                    select: {
                        rolesId: true,
                        deletedAt: true,
                    },
                },
                userPermissions: {
                    where: {
                        deteledAt: null,
                    },
                    include: {
                        Permissions: true,
                    },
                },
            },
        });
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('usuario elimiando o no encontrado');
        }
        const directRoleIds = user.role && !user.role.deletedAt ? [user.role.rolesId] : [];
        const allRoleIds = await this.resolveRoleHierarchy(directRoleIds);
        const rolePermissionAssignments = allRoleIds.length === 0
            ? []
            : await this.prisma.rolPermissions.findMany({
                where: {
                    deletedAt: null,
                    rolesId: { in: allRoleIds },
                    permissions: {
                        deletedAt: null,
                    },
                },
                include: {
                    permissions: {
                        select: {
                            resource: true,
                            action: true,
                        },
                    },
                },
            });
        const rolPermissions = rolePermissionAssignments.map((rolPermiso) => ({
            resource: rolPermiso.permissions.resource,
            action: rolPermiso.permissions.action,
        }));
        const rolPermisoSinDuplicados = rolPermissions.reduce((acum, permiso) => {
            const existePermiso = acum.some((permisoAcumulador) => permisoAcumulador.resource === permiso.resource &&
                permisoAcumulador.action === permiso.action);
            if (!existePermiso) {
                acum.push(permiso);
            }
            return acum;
        }, []);
        const userPermissions = user?.userPermissions
            .filter((userPermiso) => userPermiso.Permissions &&
            !userPermiso.Permissions.deletedAt &&
            !userPermiso.deteledAt)
            .map((userPermiso) => ({
            resource: userPermiso.Permissions.resource,
            action: userPermiso.Permissions.action,
            allow: userPermiso.allow,
        })) ?? [];
        const rolPermissionsSinDuplicados_copy = [...rolPermisoSinDuplicados];
        for (const userPerm of userPermissions) {
            const index = rolPermissionsSinDuplicados_copy.findIndex((permiso) => userPerm.action === permiso.action &&
                userPerm.resource === permiso.resource);
            if (userPerm.allow) {
                if (index === -1) {
                    rolPermissionsSinDuplicados_copy.push({
                        resource: userPerm.resource,
                        action: userPerm.action,
                    });
                }
            }
            else {
                if (index !== -1) {
                    rolPermissionsSinDuplicados_copy.splice(index, 1);
                }
            }
        }
        return rolPermissionsSinDuplicados_copy;
    }
    async resolveRoleHierarchy(initialRoleIds) {
        if (initialRoleIds.length === 0) {
            return [];
        }
        const edges = await this.prisma.rolesHeredados.findMany({
            where: {
                deletedAt: null,
                parentRole: {
                    deletedAt: null,
                },
                childRole: {
                    deletedAt: null,
                },
            },
            select: {
                parentRoleId: true,
                childRoleId: true,
            },
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
            if (visited.has(roleId)) {
                continue;
            }
            visited.add(roleId);
            const children = childrenByParent.get(roleId) ?? [];
            for (const childId of children) {
                if (!visited.has(childId)) {
                    stack.push(childId);
                }
            }
        }
        return Array.from(visited);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map