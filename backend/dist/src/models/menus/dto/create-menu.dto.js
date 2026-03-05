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
exports.CreateMenuDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateMenuDto {
    parent_menu_id;
    icon;
    name;
    route;
    is_active;
    static _OPENAPI_METADATA_FACTORY() {
        return { parent_menu_id: { required: false, type: () => Number }, icon: { required: false, type: () => String, maxLength: 50 }, name: { required: true, type: () => String, maxLength: 100 }, route: { required: false, type: () => String, maxLength: 255 }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateMenuDto = CreateMenuDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del menú padre (para menús anidados)',
        example: 1,
        type: 'integer',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMenuDto.prototype, "parent_menu_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre del ícono (clase CSS o nombre de icono)',
        example: 'fa-user',
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre del menú',
        example: 'Gestión de Usuarios',
        maxLength: 100,
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ruta del menú (endpoint o path)',
        example: '/users',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "route", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica si el menú está activo',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMenuDto.prototype, "is_active", void 0);
//# sourceMappingURL=create-menu.dto.js.map