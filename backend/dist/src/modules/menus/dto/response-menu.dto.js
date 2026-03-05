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
exports.MenuResponseDto = void 0;
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
        return { id: { required: true, type: () => Number }, parent_menu_id: { required: false, type: () => Number, nullable: true }, icon: { required: false, type: () => String, nullable: true }, name: { required: false, type: () => String }, route: { required: false, type: () => String }, is_active: { required: false, type: () => Boolean }, created_at: { required: false, type: () => Date, nullable: true }, children: { required: false, type: () => [require("./response-menu.dto").MenuResponseDto] } };
    }
}
exports.MenuResponseDto = MenuResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del menú', example: 1 }),
    __metadata("design:type", Number)
], MenuResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del menú padre (para submenús)',
        example: null,
    }),
    __metadata("design:type", Object)
], MenuResponseDto.prototype, "parent_menu_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Icono del menú', example: 'fa-home' }),
    __metadata("design:type", Object)
], MenuResponseDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre del menú', example: 'Inicio' }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ruta del menú',
        example: '/dashboard',
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
        example: '2024-01-01T00:00:00Z',
    }),
    __metadata("design:type", Object)
], MenuResponseDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Submenús del menú actual',
        type: [MenuResponseDto],
    }),
    __metadata("design:type", Array)
], MenuResponseDto.prototype, "children", void 0);
//# sourceMappingURL=response-menu.dto.js.map