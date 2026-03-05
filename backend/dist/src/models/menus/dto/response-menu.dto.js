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
exports.MenuResponseExample = exports.MenuResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class MenuResponseDto {
    id;
    parent_menu_id;
    icon;
    name;
    route;
    is_active;
    created_at;
    children;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, parent_menu_id: { required: false, type: () => Number, nullable: true }, icon: { required: false, type: () => String }, name: { required: false, type: () => String }, route: { required: false, type: () => String }, is_active: { required: false, type: () => Boolean }, created_at: { required: false, type: () => Date, nullable: true }, children: { required: false, type: () => [require("./response-menu.dto").MenuResponseDto] } };
    }
}
exports.MenuResponseDto = MenuResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID único del menú',
        example: 1,
        type: 'integer',
    }),
    __metadata("design:type", Number)
], MenuResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del menú padre (null si es raíz)',
        example: null,
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MenuResponseDto.prototype, "parent_menu_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre del ícono asociado al menú',
        example: 'fa-user',
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre del menú',
        example: 'Gestión de Usuarios',
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ruta o path del menú',
        example: '/users',
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "route", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica si el menú está activo',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MenuResponseDto.prototype, "is_active", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de creación del menú',
        example: '2024-01-15T10:30:00.000Z',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MenuResponseDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Lista de menús hijos (submenús)',
        type: [MenuResponseDto],
        nullable: true,
    }),
    __metadata("design:type", Array)
], MenuResponseDto.prototype, "children", void 0);
exports.MenuResponseExample = [
    {
        id: 1,
        parent_menu_id: null,
        icon: 'fa-home',
        name: 'Inicio',
        route: '/dashboard',
        is_active: true,
        created_at: new Date('2024-01-15T10:30:00.000Z'),
        children: [],
    },
    {
        id: 2,
        parent_menu_id: null,
        icon: 'fa-users',
        name: 'Gestión de Usuarios',
        route: undefined,
        is_active: true,
        created_at: new Date('2024-01-15T10:30:00.000Z'),
        children: [
            {
                id: 3,
                parent_menu_id: 2,
                icon: 'fa-user',
                name: 'Usuarios',
                route: '/users',
                is_active: true,
                created_at: undefined,
                children: [],
            },
            {
                id: 4,
                parent_menu_id: 2,
                icon: 'fa-shield-alt',
                name: 'Roles',
                route: '/roles',
                is_active: true,
                created_at: undefined,
                children: [],
            },
            {
                id: 5,
                parent_menu_id: 2,
                icon: 'fa-key',
                name: 'Permisos',
                route: '/permissions',
                is_active: true,
                created_at: undefined,
                children: [],
            },
        ],
    },
    {
        id: 6,
        parent_menu_id: null,
        icon: 'fa-file-invoice',
        name: 'Facturación',
        route: undefined,
        is_active: true,
        created_at: new Date('2024-01-15T10:30:00.000Z'),
        children: [
            {
                id: 7,
                parent_menu_id: 6,
                icon: 'fa-file-invoice-dollar',
                name: 'Facturas',
                route: '/invoices',
                is_active: true,
                created_at: undefined,
                children: [],
            },
            {
                id: 8,
                parent_menu_id: 6,
                icon: 'fa-money-bill-wave',
                name: 'Pagos',
                route: '/payments',
                is_active: true,
                created_at: undefined,
                children: [],
            },
        ],
    },
    {
        id: 9,
        parent_menu_id: null,
        icon: 'fa-cogs',
        name: 'Configuración',
        route: '/settings',
        is_active: true,
        created_at: new Date('2024-01-15T10:30:00.000Z'),
        children: [],
    },
];
//# sourceMappingURL=response-menu.dto.js.map