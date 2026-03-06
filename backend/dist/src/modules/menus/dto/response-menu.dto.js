"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuResponseDto = void 0;
const openapi = require("@nestjs/swagger");
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
//# sourceMappingURL=response-menu.dto.js.map