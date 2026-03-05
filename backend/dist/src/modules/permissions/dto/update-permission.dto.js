"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePermissionDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const create_permission_dto_1 = require("./create-permission.dto");
class UpdatePermissionDto extends (0, swagger_1.PartialType)(create_permission_dto_1.CreatePermissionDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdatePermissionDto = UpdatePermissionDto;
//# sourceMappingURL=update-permission.dto.js.map