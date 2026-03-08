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
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineExtension = exports.JsonNullValueFilter = exports.QueryMode = exports.NullsOrder = exports.NullableJsonNullValueInput = exports.SortOrder = exports.SolicitudesScalarFieldEnum = exports.PagosScalarFieldEnum = exports.MedidoresScalarFieldEnum = exports.LecturasScalarFieldEnum = exports.FacturasScalarFieldEnum = exports.DetalleFacturaScalarFieldEnum = exports.ConveniosScalarFieldEnum = exports.ComunidadesScalarFieldEnum = exports.ClientesMedidoresScalarFieldEnum = exports.ClientesScalarFieldEnum = exports.UsersScalarFieldEnum = exports.UserPermissionsScalarFieldEnum = exports.SessionsScalarFieldEnum = exports.RolesScalarFieldEnum = exports.RolesHeredadosScalarFieldEnum = exports.RolPermissionsScalarFieldEnum = exports.ProfilesScalarFieldEnum = exports.PermissionsScalarFieldEnum = exports.MenusScalarFieldEnum = exports.MenuPermissionsScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.prismaVersion = exports.getExtensionContext = exports.Decimal = exports.Sql = exports.raw = exports.join = exports.empty = exports.sql = exports.PrismaClientValidationError = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
const runtime = __importStar(require("@prisma/client/runtime/client"));
exports.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
exports.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
exports.PrismaClientValidationError = runtime.PrismaClientValidationError;
exports.sql = runtime.sqltag;
exports.empty = runtime.empty;
exports.join = runtime.join;
exports.raw = runtime.raw;
exports.Sql = runtime.Sql;
exports.Decimal = runtime.Decimal;
exports.getExtensionContext = runtime.Extensions.getExtensionContext;
exports.prismaVersion = {
    client: "7.4.2",
    engine: "94a226be1cf2967af2541cca5529f0f7ba866919"
};
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    MenuPermissions: 'MenuPermissions',
    Menus: 'Menus',
    Permissions: 'Permissions',
    Profiles: 'Profiles',
    RolPermissions: 'RolPermissions',
    RolesHeredados: 'RolesHeredados',
    Roles: 'Roles',
    Sessions: 'Sessions',
    UserPermissions: 'UserPermissions',
    Users: 'Users',
    Clientes: 'Clientes',
    ClientesMedidores: 'ClientesMedidores',
    Comunidades: 'Comunidades',
    Convenios: 'Convenios',
    DetalleFactura: 'DetalleFactura',
    Facturas: 'Facturas',
    Lecturas: 'Lecturas',
    Medidores: 'Medidores',
    Pagos: 'Pagos',
    Solicitudes: 'Solicitudes'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.MenuPermissionsScalarFieldEnum = {
    rolMenusId: 'rolMenusId',
    permissionsId: 'permissionsId',
    menusId: 'menusId',
    deletedAt: 'deletedAt'
};
exports.MenusScalarFieldEnum = {
    menusId: 'menusId',
    menusParentId: 'menusParentId',
    icon: 'icon',
    name: 'name',
    route: 'route',
    active: 'active',
    deletedAt: 'deletedAt'
};
exports.PermissionsScalarFieldEnum = {
    permissionsId: 'permissionsId',
    resource: 'resource',
    action: 'action',
    deletedAt: 'deletedAt'
};
exports.ProfilesScalarFieldEnum = {
    profileId: 'profileId',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    avatar: 'avatar',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    usersId: 'usersId'
};
exports.RolPermissionsScalarFieldEnum = {
    rolPermissionsId: 'rolPermissionsId',
    rolesId: 'rolesId',
    permissionsId: 'permissionsId',
    deletedAt: 'deletedAt'
};
exports.RolesHeredadosScalarFieldEnum = {
    roleHierarchyId: 'roleHierarchyId',
    parentRoleId: 'parentRoleId',
    childRoleId: 'childRoleId',
    deletedAt: 'deletedAt'
};
exports.RolesScalarFieldEnum = {
    rolesId: 'rolesId',
    name: 'name',
    deletedAt: 'deletedAt'
};
exports.SessionsScalarFieldEnum = {
    sessionsId: 'sessionsId',
    usersId: 'usersId',
    refreshToken: 'refreshToken',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    isRevoked: 'isRevoked',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
};
exports.UserPermissionsScalarFieldEnum = {
    idUserPermissions: 'idUserPermissions',
    usersId: 'usersId',
    permissionsId: 'permissionsId',
    allow: 'allow',
    deteledAt: 'deteledAt'
};
exports.UsersScalarFieldEnum = {
    usersId: 'usersId',
    email: 'email',
    password: 'password',
    rolesId: 'rolesId',
    deletedAt: 'deletedAt'
};
exports.ClientesScalarFieldEnum = {
    clienteId: 'clienteId',
    comunidadId: 'comunidadId',
    nombre: 'nombre',
    createdAt: 'createdAt'
};
exports.ClientesMedidoresScalarFieldEnum = {
    clienteMedidorId: 'clienteMedidorId',
    clienteId: 'clienteId',
    medidorId: 'medidorId',
    fechaAsignacion: 'fechaAsignacion',
    fechaRetiro: 'fechaRetiro'
};
exports.ComunidadesScalarFieldEnum = {
    comunidadId: 'comunidadId',
    nombre: 'nombre'
};
exports.ConveniosScalarFieldEnum = {
    convenioId: 'convenioId',
    clienteId: 'clienteId',
    fechaInicio: 'fechaInicio',
    fechaFin: 'fechaFin',
    numeroCuotas: 'numeroCuotas',
    montoCuota: 'montoCuota',
    estado: 'estado'
};
exports.DetalleFacturaScalarFieldEnum = {
    detalleFacturaId: 'detalleFacturaId',
    facturaId: 'facturaId',
    descripcion: 'descripcion',
    cantidad: 'cantidad',
    precioUnitario: 'precioUnitario',
    total: 'total'
};
exports.FacturasScalarFieldEnum = {
    facturaId: 'facturaId',
    clienteId: 'clienteId',
    lecturaId: 'lecturaId',
    fecha: 'fecha',
    mes: 'mes',
    consumo: 'consumo',
    tarifa: 'tarifa',
    interesMora: 'interesMora',
    abono: 'abono',
    saldo: 'saldo'
};
exports.LecturasScalarFieldEnum = {
    lecturaId: 'lecturaId',
    clienteMedidorId: 'clienteMedidorId',
    fecha: 'fecha',
    lecturaAnterior: 'lecturaAnterior',
    lecturaActual: 'lecturaActual',
    consumoCalculado: 'consumoCalculado',
    valorMonetario: 'valorMonetario',
    abono: 'abono',
    saldoPendiente: 'saldoPendiente'
};
exports.MedidoresScalarFieldEnum = {
    medidorId: 'medidorId',
    codigo: 'codigo',
    estado: 'estado',
    createdAt: 'createdAt'
};
exports.PagosScalarFieldEnum = {
    pagoId: 'pagoId',
    clienteId: 'clienteId',
    facturaId: 'facturaId',
    fecha: 'fecha',
    monto: 'monto',
    metodoPago: 'metodoPago'
};
exports.SolicitudesScalarFieldEnum = {
    solicitudId: 'solicitudId',
    clienteId: 'clienteId',
    tipoSolicitud: 'tipoSolicitud',
    estado: 'estado',
    fechaSolicitud: 'fechaSolicitud',
    fechaResolucion: 'fechaResolucion'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
exports.defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map