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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const user_service_1 = require("../user/user.service");
let MenusService = class MenusService {
    prisma;
    userService;
    constructor(prisma, userService) {
        this.prisma = prisma;
        this.userService = userService;
    }
    async getMyMenus(userId) {
        const permissions = (await this.userService.getEffectivePermissions(userId));
        if (permissions.length === 0) {
            return [];
        }
        const permissionConditions = permissions.map((p) => ({
            resource: p.resource,
            action: p.action,
        }));
        const directMenus = await this.prisma.menus.findMany({
            where: {
                menuPermissions: {
                    some: {
                        permissions: {
                            OR: permissionConditions,
                        },
                    },
                },
                active: true,
                deletedAt: null,
            },
        });
        const menuMap = new Map();
        directMenus.forEach((m) => menuMap.set(m.menusId, m));
        let currentMenus = directMenus;
        while (currentMenus.length > 0) {
            const missingParentIds = [
                ...new Set(currentMenus
                    .map((m) => m.menusParentId)
                    .filter((id) => id !== null && id !== undefined && !menuMap.has(id))),
            ];
            if (missingParentIds.length === 0)
                break;
            const parentMenus = await this.prisma.menus.findMany({
                where: {
                    menusId: { in: missingParentIds },
                    active: true,
                    deletedAt: null,
                },
            });
            parentMenus.forEach((m) => menuMap.set(m.menusId, m));
            currentMenus = parentMenus;
        }
        const finalMenus = Array.from(menuMap.values()).sort((a, b) => a.menusId - b.menusId);
        const fullTree = this.buildMenuTree(finalMenus);
        fullTree.forEach((level1) => {
            if (level1.children && level1.children.length > 0) {
                level1.children.forEach((level2) => {
                    level2.children = [];
                });
            }
        });
        return fullTree;
    }
    buildMenuTree(menuList) {
        const menuMap = new Map();
        const tree = [];
        menuList.forEach((menu) => {
            const mappedMenu = {
                id: menu.menusId,
                parent_menu_id: menu.menusParentId,
                name: menu.name,
                route: menu.route,
                icon: menu.icon ?? null,
                is_active: menu.active,
                created_at: menu.createdAt ? new Date(menu.createdAt) : null,
                children: [],
            };
            menuMap.set(menu.menusId, mappedMenu);
        });
        for (const menu of menuMap.values()) {
            const parentId = menu.parent_menu_id;
            if (parentId !== null &&
                parentId !== undefined &&
                menuMap.has(parentId)) {
                menuMap.get(parentId).children.push(menu);
            }
            else {
                tree.push(menu);
            }
        }
        return tree;
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        user_service_1.UserService])
], MenusService);
//# sourceMappingURL=menus.service.js.map