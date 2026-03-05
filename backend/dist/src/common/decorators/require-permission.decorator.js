"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredPermission = exports.PERMISSION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSION_KEY = 'permission';
const RequiredPermission = (resource, action) => (0, common_1.SetMetadata)(exports.PERMISSION_KEY, { resource, action });
exports.RequiredPermission = RequiredPermission;
//# sourceMappingURL=require-permission.decorator.js.map