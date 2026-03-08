import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly MenuPermissions: "MenuPermissions";
    readonly Menus: "Menus";
    readonly Permissions: "Permissions";
    readonly Profiles: "Profiles";
    readonly RolPermissions: "RolPermissions";
    readonly RolesHeredados: "RolesHeredados";
    readonly Roles: "Roles";
    readonly Sessions: "Sessions";
    readonly UserPermissions: "UserPermissions";
    readonly Users: "Users";
    readonly Clientes: "Clientes";
    readonly ClientesMedidores: "ClientesMedidores";
    readonly Comunidades: "Comunidades";
    readonly Convenios: "Convenios";
    readonly DetalleFactura: "DetalleFactura";
    readonly Facturas: "Facturas";
    readonly Lecturas: "Lecturas";
    readonly Medidores: "Medidores";
    readonly Pagos: "Pagos";
    readonly Solicitudes: "Solicitudes";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const MenuPermissionsScalarFieldEnum: {
    readonly rolMenusId: "rolMenusId";
    readonly permissionsId: "permissionsId";
    readonly menusId: "menusId";
    readonly deletedAt: "deletedAt";
};
export type MenuPermissionsScalarFieldEnum = (typeof MenuPermissionsScalarFieldEnum)[keyof typeof MenuPermissionsScalarFieldEnum];
export declare const MenusScalarFieldEnum: {
    readonly menusId: "menusId";
    readonly menusParentId: "menusParentId";
    readonly icon: "icon";
    readonly name: "name";
    readonly route: "route";
    readonly active: "active";
    readonly deletedAt: "deletedAt";
};
export type MenusScalarFieldEnum = (typeof MenusScalarFieldEnum)[keyof typeof MenusScalarFieldEnum];
export declare const PermissionsScalarFieldEnum: {
    readonly permissionsId: "permissionsId";
    readonly resource: "resource";
    readonly action: "action";
    readonly deletedAt: "deletedAt";
};
export type PermissionsScalarFieldEnum = (typeof PermissionsScalarFieldEnum)[keyof typeof PermissionsScalarFieldEnum];
export declare const ProfilesScalarFieldEnum: {
    readonly profileId: "profileId";
    readonly firstName: "firstName";
    readonly lastName: "lastName";
    readonly phone: "phone";
    readonly avatar: "avatar";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly usersId: "usersId";
};
export type ProfilesScalarFieldEnum = (typeof ProfilesScalarFieldEnum)[keyof typeof ProfilesScalarFieldEnum];
export declare const RolPermissionsScalarFieldEnum: {
    readonly rolPermissionsId: "rolPermissionsId";
    readonly rolesId: "rolesId";
    readonly permissionsId: "permissionsId";
    readonly deletedAt: "deletedAt";
};
export type RolPermissionsScalarFieldEnum = (typeof RolPermissionsScalarFieldEnum)[keyof typeof RolPermissionsScalarFieldEnum];
export declare const RolesHeredadosScalarFieldEnum: {
    readonly roleHierarchyId: "roleHierarchyId";
    readonly parentRoleId: "parentRoleId";
    readonly childRoleId: "childRoleId";
    readonly deletedAt: "deletedAt";
};
export type RolesHeredadosScalarFieldEnum = (typeof RolesHeredadosScalarFieldEnum)[keyof typeof RolesHeredadosScalarFieldEnum];
export declare const RolesScalarFieldEnum: {
    readonly rolesId: "rolesId";
    readonly name: "name";
    readonly deletedAt: "deletedAt";
};
export type RolesScalarFieldEnum = (typeof RolesScalarFieldEnum)[keyof typeof RolesScalarFieldEnum];
export declare const SessionsScalarFieldEnum: {
    readonly sessionsId: "sessionsId";
    readonly usersId: "usersId";
    readonly refreshToken: "refreshToken";
    readonly ipAddress: "ipAddress";
    readonly userAgent: "userAgent";
    readonly isRevoked: "isRevoked";
    readonly expiresAt: "expiresAt";
    readonly createdAt: "createdAt";
};
export type SessionsScalarFieldEnum = (typeof SessionsScalarFieldEnum)[keyof typeof SessionsScalarFieldEnum];
export declare const UserPermissionsScalarFieldEnum: {
    readonly idUserPermissions: "idUserPermissions";
    readonly usersId: "usersId";
    readonly permissionsId: "permissionsId";
    readonly allow: "allow";
    readonly deteledAt: "deteledAt";
};
export type UserPermissionsScalarFieldEnum = (typeof UserPermissionsScalarFieldEnum)[keyof typeof UserPermissionsScalarFieldEnum];
export declare const UsersScalarFieldEnum: {
    readonly usersId: "usersId";
    readonly email: "email";
    readonly password: "password";
    readonly rolesId: "rolesId";
    readonly deletedAt: "deletedAt";
};
export type UsersScalarFieldEnum = (typeof UsersScalarFieldEnum)[keyof typeof UsersScalarFieldEnum];
export declare const ClientesScalarFieldEnum: {
    readonly clienteId: "clienteId";
    readonly comunidadId: "comunidadId";
    readonly nombre: "nombre";
    readonly createdAt: "createdAt";
};
export type ClientesScalarFieldEnum = (typeof ClientesScalarFieldEnum)[keyof typeof ClientesScalarFieldEnum];
export declare const ClientesMedidoresScalarFieldEnum: {
    readonly clienteMedidorId: "clienteMedidorId";
    readonly clienteId: "clienteId";
    readonly medidorId: "medidorId";
    readonly fechaAsignacion: "fechaAsignacion";
    readonly fechaRetiro: "fechaRetiro";
};
export type ClientesMedidoresScalarFieldEnum = (typeof ClientesMedidoresScalarFieldEnum)[keyof typeof ClientesMedidoresScalarFieldEnum];
export declare const ComunidadesScalarFieldEnum: {
    readonly comunidadId: "comunidadId";
    readonly nombre: "nombre";
};
export type ComunidadesScalarFieldEnum = (typeof ComunidadesScalarFieldEnum)[keyof typeof ComunidadesScalarFieldEnum];
export declare const ConveniosScalarFieldEnum: {
    readonly convenioId: "convenioId";
    readonly clienteId: "clienteId";
    readonly fechaInicio: "fechaInicio";
    readonly fechaFin: "fechaFin";
    readonly numeroCuotas: "numeroCuotas";
    readonly montoCuota: "montoCuota";
    readonly estado: "estado";
};
export type ConveniosScalarFieldEnum = (typeof ConveniosScalarFieldEnum)[keyof typeof ConveniosScalarFieldEnum];
export declare const DetalleFacturaScalarFieldEnum: {
    readonly detalleFacturaId: "detalleFacturaId";
    readonly facturaId: "facturaId";
    readonly descripcion: "descripcion";
    readonly cantidad: "cantidad";
    readonly precioUnitario: "precioUnitario";
    readonly total: "total";
};
export type DetalleFacturaScalarFieldEnum = (typeof DetalleFacturaScalarFieldEnum)[keyof typeof DetalleFacturaScalarFieldEnum];
export declare const FacturasScalarFieldEnum: {
    readonly facturaId: "facturaId";
    readonly clienteId: "clienteId";
    readonly lecturaId: "lecturaId";
    readonly fecha: "fecha";
    readonly mes: "mes";
    readonly consumo: "consumo";
    readonly tarifa: "tarifa";
    readonly interesMora: "interesMora";
    readonly abono: "abono";
    readonly saldo: "saldo";
};
export type FacturasScalarFieldEnum = (typeof FacturasScalarFieldEnum)[keyof typeof FacturasScalarFieldEnum];
export declare const LecturasScalarFieldEnum: {
    readonly lecturaId: "lecturaId";
    readonly clienteMedidorId: "clienteMedidorId";
    readonly fecha: "fecha";
    readonly lecturaAnterior: "lecturaAnterior";
    readonly lecturaActual: "lecturaActual";
    readonly consumoCalculado: "consumoCalculado";
    readonly valorMonetario: "valorMonetario";
    readonly abono: "abono";
    readonly saldoPendiente: "saldoPendiente";
};
export type LecturasScalarFieldEnum = (typeof LecturasScalarFieldEnum)[keyof typeof LecturasScalarFieldEnum];
export declare const MedidoresScalarFieldEnum: {
    readonly medidorId: "medidorId";
    readonly codigo: "codigo";
    readonly estado: "estado";
    readonly createdAt: "createdAt";
};
export type MedidoresScalarFieldEnum = (typeof MedidoresScalarFieldEnum)[keyof typeof MedidoresScalarFieldEnum];
export declare const PagosScalarFieldEnum: {
    readonly pagoId: "pagoId";
    readonly clienteId: "clienteId";
    readonly facturaId: "facturaId";
    readonly fecha: "fecha";
    readonly monto: "monto";
    readonly metodoPago: "metodoPago";
};
export type PagosScalarFieldEnum = (typeof PagosScalarFieldEnum)[keyof typeof PagosScalarFieldEnum];
export declare const SolicitudesScalarFieldEnum: {
    readonly solicitudId: "solicitudId";
    readonly clienteId: "clienteId";
    readonly tipoSolicitud: "tipoSolicitud";
    readonly estado: "estado";
    readonly fechaSolicitud: "fechaSolicitud";
    readonly fechaResolucion: "fechaResolucion";
};
export type SolicitudesScalarFieldEnum = (typeof SolicitudesScalarFieldEnum)[keyof typeof SolicitudesScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
    readonly AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
