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
exports.AssignPermissionDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AssignPermissionDto {
    permissionsId;
    allow;
    static _OPENAPI_METADATA_FACTORY() {
        return { permissionsId: { required: true, type: () => Number }, allow: { required: false, type: () => Boolean } };
    }
}
exports.AssignPermissionDto = AssignPermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del permiso a asignar al usuario',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AssignPermissionDto.prototype, "permissionsId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si es true, permite; si es false, revoca el permiso para el usuario',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AssignPermissionDto.prototype, "allow", void 0);
//# sourceMappingURL=assign-permission.dto.js.map