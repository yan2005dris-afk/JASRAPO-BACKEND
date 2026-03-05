import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly MenuPermissions: "MenuPermissions";
    readonly Menus: "Menus";
    readonly Permissions: "Permissions";
    readonly Profiles: "Profiles";
    readonly RolPermissions: "RolPermissions";
    readonly Roles: "Roles";
    readonly Sessions: "Sessions";
    readonly UserPermissions: "UserPermissions";
    readonly UserRoles: "UserRoles";
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
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "menuPermissions" | "menus" | "permissions" | "profiles" | "rolPermissions" | "roles" | "sessions" | "userPermissions" | "userRoles" | "users" | "clientes" | "clientesMedidores" | "comunidades" | "convenios" | "detalleFactura" | "facturas" | "lecturas" | "medidores" | "pagos" | "solicitudes";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        MenuPermissions: {
            payload: Prisma.$MenuPermissionsPayload<ExtArgs>;
            fields: Prisma.MenuPermissionsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MenuPermissionsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MenuPermissionsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>;
                };
                findFirst: {
                    args: Prisma.MenuPermissionsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MenuPermissionsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>;
                };
                findMany: {
                    args: Prisma.MenuPermissionsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>[];
                };
                create: {
                    args: Prisma.MenuPermissionsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>;
                };
                createMany: {
                    args: Prisma.MenuPermissionsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MenuPermissionsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>[];
                };
                delete: {
                    args: Prisma.MenuPermissionsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>;
                };
                update: {
                    args: Prisma.MenuPermissionsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>;
                };
                deleteMany: {
                    args: Prisma.MenuPermissionsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MenuPermissionsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MenuPermissionsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>[];
                };
                upsert: {
                    args: Prisma.MenuPermissionsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenuPermissionsPayload>;
                };
                aggregate: {
                    args: Prisma.MenuPermissionsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMenuPermissions>;
                };
                groupBy: {
                    args: Prisma.MenuPermissionsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MenuPermissionsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MenuPermissionsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MenuPermissionsCountAggregateOutputType> | number;
                };
            };
        };
        Menus: {
            payload: Prisma.$MenusPayload<ExtArgs>;
            fields: Prisma.MenusFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MenusFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MenusFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>;
                };
                findFirst: {
                    args: Prisma.MenusFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MenusFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>;
                };
                findMany: {
                    args: Prisma.MenusFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>[];
                };
                create: {
                    args: Prisma.MenusCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>;
                };
                createMany: {
                    args: Prisma.MenusCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MenusCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>[];
                };
                delete: {
                    args: Prisma.MenusDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>;
                };
                update: {
                    args: Prisma.MenusUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>;
                };
                deleteMany: {
                    args: Prisma.MenusDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MenusUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MenusUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>[];
                };
                upsert: {
                    args: Prisma.MenusUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MenusPayload>;
                };
                aggregate: {
                    args: Prisma.MenusAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMenus>;
                };
                groupBy: {
                    args: Prisma.MenusGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MenusGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MenusCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MenusCountAggregateOutputType> | number;
                };
            };
        };
        Permissions: {
            payload: Prisma.$PermissionsPayload<ExtArgs>;
            fields: Prisma.PermissionsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PermissionsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PermissionsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>;
                };
                findFirst: {
                    args: Prisma.PermissionsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PermissionsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>;
                };
                findMany: {
                    args: Prisma.PermissionsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>[];
                };
                create: {
                    args: Prisma.PermissionsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>;
                };
                createMany: {
                    args: Prisma.PermissionsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PermissionsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>[];
                };
                delete: {
                    args: Prisma.PermissionsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>;
                };
                update: {
                    args: Prisma.PermissionsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>;
                };
                deleteMany: {
                    args: Prisma.PermissionsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PermissionsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PermissionsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>[];
                };
                upsert: {
                    args: Prisma.PermissionsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionsPayload>;
                };
                aggregate: {
                    args: Prisma.PermissionsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePermissions>;
                };
                groupBy: {
                    args: Prisma.PermissionsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PermissionsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionsCountAggregateOutputType> | number;
                };
            };
        };
        Profiles: {
            payload: Prisma.$ProfilesPayload<ExtArgs>;
            fields: Prisma.ProfilesFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ProfilesFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ProfilesFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>;
                };
                findFirst: {
                    args: Prisma.ProfilesFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ProfilesFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>;
                };
                findMany: {
                    args: Prisma.ProfilesFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>[];
                };
                create: {
                    args: Prisma.ProfilesCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>;
                };
                createMany: {
                    args: Prisma.ProfilesCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ProfilesCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>[];
                };
                delete: {
                    args: Prisma.ProfilesDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>;
                };
                update: {
                    args: Prisma.ProfilesUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>;
                };
                deleteMany: {
                    args: Prisma.ProfilesDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ProfilesUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ProfilesUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>[];
                };
                upsert: {
                    args: Prisma.ProfilesUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProfilesPayload>;
                };
                aggregate: {
                    args: Prisma.ProfilesAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateProfiles>;
                };
                groupBy: {
                    args: Prisma.ProfilesGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProfilesGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ProfilesCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProfilesCountAggregateOutputType> | number;
                };
            };
        };
        RolPermissions: {
            payload: Prisma.$RolPermissionsPayload<ExtArgs>;
            fields: Prisma.RolPermissionsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RolPermissionsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RolPermissionsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>;
                };
                findFirst: {
                    args: Prisma.RolPermissionsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RolPermissionsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>;
                };
                findMany: {
                    args: Prisma.RolPermissionsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>[];
                };
                create: {
                    args: Prisma.RolPermissionsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>;
                };
                createMany: {
                    args: Prisma.RolPermissionsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RolPermissionsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>[];
                };
                delete: {
                    args: Prisma.RolPermissionsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>;
                };
                update: {
                    args: Prisma.RolPermissionsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>;
                };
                deleteMany: {
                    args: Prisma.RolPermissionsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RolPermissionsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RolPermissionsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>[];
                };
                upsert: {
                    args: Prisma.RolPermissionsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolPermissionsPayload>;
                };
                aggregate: {
                    args: Prisma.RolPermissionsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRolPermissions>;
                };
                groupBy: {
                    args: Prisma.RolPermissionsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RolPermissionsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RolPermissionsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RolPermissionsCountAggregateOutputType> | number;
                };
            };
        };
        Roles: {
            payload: Prisma.$RolesPayload<ExtArgs>;
            fields: Prisma.RolesFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RolesFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RolesFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>;
                };
                findFirst: {
                    args: Prisma.RolesFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RolesFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>;
                };
                findMany: {
                    args: Prisma.RolesFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>[];
                };
                create: {
                    args: Prisma.RolesCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>;
                };
                createMany: {
                    args: Prisma.RolesCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RolesCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>[];
                };
                delete: {
                    args: Prisma.RolesDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>;
                };
                update: {
                    args: Prisma.RolesUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>;
                };
                deleteMany: {
                    args: Prisma.RolesDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RolesUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RolesUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>[];
                };
                upsert: {
                    args: Prisma.RolesUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolesPayload>;
                };
                aggregate: {
                    args: Prisma.RolesAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRoles>;
                };
                groupBy: {
                    args: Prisma.RolesGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RolesGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RolesCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RolesCountAggregateOutputType> | number;
                };
            };
        };
        Sessions: {
            payload: Prisma.$SessionsPayload<ExtArgs>;
            fields: Prisma.SessionsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SessionsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SessionsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>;
                };
                findFirst: {
                    args: Prisma.SessionsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SessionsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>;
                };
                findMany: {
                    args: Prisma.SessionsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>[];
                };
                create: {
                    args: Prisma.SessionsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>;
                };
                createMany: {
                    args: Prisma.SessionsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SessionsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>[];
                };
                delete: {
                    args: Prisma.SessionsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>;
                };
                update: {
                    args: Prisma.SessionsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>;
                };
                deleteMany: {
                    args: Prisma.SessionsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SessionsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SessionsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>[];
                };
                upsert: {
                    args: Prisma.SessionsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionsPayload>;
                };
                aggregate: {
                    args: Prisma.SessionsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSessions>;
                };
                groupBy: {
                    args: Prisma.SessionsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SessionsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SessionsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SessionsCountAggregateOutputType> | number;
                };
            };
        };
        UserPermissions: {
            payload: Prisma.$UserPermissionsPayload<ExtArgs>;
            fields: Prisma.UserPermissionsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserPermissionsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserPermissionsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>;
                };
                findFirst: {
                    args: Prisma.UserPermissionsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserPermissionsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>;
                };
                findMany: {
                    args: Prisma.UserPermissionsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>[];
                };
                create: {
                    args: Prisma.UserPermissionsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>;
                };
                createMany: {
                    args: Prisma.UserPermissionsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserPermissionsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>[];
                };
                delete: {
                    args: Prisma.UserPermissionsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>;
                };
                update: {
                    args: Prisma.UserPermissionsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>;
                };
                deleteMany: {
                    args: Prisma.UserPermissionsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserPermissionsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserPermissionsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>[];
                };
                upsert: {
                    args: Prisma.UserPermissionsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPermissionsPayload>;
                };
                aggregate: {
                    args: Prisma.UserPermissionsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUserPermissions>;
                };
                groupBy: {
                    args: Prisma.UserPermissionsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserPermissionsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserPermissionsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserPermissionsCountAggregateOutputType> | number;
                };
            };
        };
        UserRoles: {
            payload: Prisma.$UserRolesPayload<ExtArgs>;
            fields: Prisma.UserRolesFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserRolesFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserRolesFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>;
                };
                findFirst: {
                    args: Prisma.UserRolesFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserRolesFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>;
                };
                findMany: {
                    args: Prisma.UserRolesFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>[];
                };
                create: {
                    args: Prisma.UserRolesCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>;
                };
                createMany: {
                    args: Prisma.UserRolesCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserRolesCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>[];
                };
                delete: {
                    args: Prisma.UserRolesDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>;
                };
                update: {
                    args: Prisma.UserRolesUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>;
                };
                deleteMany: {
                    args: Prisma.UserRolesDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserRolesUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserRolesUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>[];
                };
                upsert: {
                    args: Prisma.UserRolesUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolesPayload>;
                };
                aggregate: {
                    args: Prisma.UserRolesAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUserRoles>;
                };
                groupBy: {
                    args: Prisma.UserRolesGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserRolesGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserRolesCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserRolesCountAggregateOutputType> | number;
                };
            };
        };
        Users: {
            payload: Prisma.$UsersPayload<ExtArgs>;
            fields: Prisma.UsersFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UsersFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UsersFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>;
                };
                findFirst: {
                    args: Prisma.UsersFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UsersFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>;
                };
                findMany: {
                    args: Prisma.UsersFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>[];
                };
                create: {
                    args: Prisma.UsersCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>;
                };
                createMany: {
                    args: Prisma.UsersCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UsersCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>[];
                };
                delete: {
                    args: Prisma.UsersDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>;
                };
                update: {
                    args: Prisma.UsersUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>;
                };
                deleteMany: {
                    args: Prisma.UsersDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UsersUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UsersUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>[];
                };
                upsert: {
                    args: Prisma.UsersUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsersPayload>;
                };
                aggregate: {
                    args: Prisma.UsersAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUsers>;
                };
                groupBy: {
                    args: Prisma.UsersGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UsersGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UsersCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UsersCountAggregateOutputType> | number;
                };
            };
        };
        Clientes: {
            payload: Prisma.$ClientesPayload<ExtArgs>;
            fields: Prisma.ClientesFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientesFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientesFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>;
                };
                findFirst: {
                    args: Prisma.ClientesFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientesFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>;
                };
                findMany: {
                    args: Prisma.ClientesFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>[];
                };
                create: {
                    args: Prisma.ClientesCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>;
                };
                createMany: {
                    args: Prisma.ClientesCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientesCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>[];
                };
                delete: {
                    args: Prisma.ClientesDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>;
                };
                update: {
                    args: Prisma.ClientesUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>;
                };
                deleteMany: {
                    args: Prisma.ClientesDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientesUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientesUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>[];
                };
                upsert: {
                    args: Prisma.ClientesUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesPayload>;
                };
                aggregate: {
                    args: Prisma.ClientesAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientes>;
                };
                groupBy: {
                    args: Prisma.ClientesGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientesGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientesCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientesCountAggregateOutputType> | number;
                };
            };
        };
        ClientesMedidores: {
            payload: Prisma.$ClientesMedidoresPayload<ExtArgs>;
            fields: Prisma.ClientesMedidoresFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientesMedidoresFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientesMedidoresFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>;
                };
                findFirst: {
                    args: Prisma.ClientesMedidoresFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientesMedidoresFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>;
                };
                findMany: {
                    args: Prisma.ClientesMedidoresFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>[];
                };
                create: {
                    args: Prisma.ClientesMedidoresCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>;
                };
                createMany: {
                    args: Prisma.ClientesMedidoresCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientesMedidoresCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>[];
                };
                delete: {
                    args: Prisma.ClientesMedidoresDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>;
                };
                update: {
                    args: Prisma.ClientesMedidoresUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>;
                };
                deleteMany: {
                    args: Prisma.ClientesMedidoresDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientesMedidoresUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientesMedidoresUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>[];
                };
                upsert: {
                    args: Prisma.ClientesMedidoresUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientesMedidoresPayload>;
                };
                aggregate: {
                    args: Prisma.ClientesMedidoresAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientesMedidores>;
                };
                groupBy: {
                    args: Prisma.ClientesMedidoresGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientesMedidoresGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientesMedidoresCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientesMedidoresCountAggregateOutputType> | number;
                };
            };
        };
        Comunidades: {
            payload: Prisma.$ComunidadesPayload<ExtArgs>;
            fields: Prisma.ComunidadesFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ComunidadesFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ComunidadesFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>;
                };
                findFirst: {
                    args: Prisma.ComunidadesFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ComunidadesFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>;
                };
                findMany: {
                    args: Prisma.ComunidadesFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>[];
                };
                create: {
                    args: Prisma.ComunidadesCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>;
                };
                createMany: {
                    args: Prisma.ComunidadesCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ComunidadesCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>[];
                };
                delete: {
                    args: Prisma.ComunidadesDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>;
                };
                update: {
                    args: Prisma.ComunidadesUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>;
                };
                deleteMany: {
                    args: Prisma.ComunidadesDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ComunidadesUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ComunidadesUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>[];
                };
                upsert: {
                    args: Prisma.ComunidadesUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComunidadesPayload>;
                };
                aggregate: {
                    args: Prisma.ComunidadesAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateComunidades>;
                };
                groupBy: {
                    args: Prisma.ComunidadesGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ComunidadesGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ComunidadesCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ComunidadesCountAggregateOutputType> | number;
                };
            };
        };
        Convenios: {
            payload: Prisma.$ConveniosPayload<ExtArgs>;
            fields: Prisma.ConveniosFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ConveniosFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ConveniosFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>;
                };
                findFirst: {
                    args: Prisma.ConveniosFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ConveniosFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>;
                };
                findMany: {
                    args: Prisma.ConveniosFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>[];
                };
                create: {
                    args: Prisma.ConveniosCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>;
                };
                createMany: {
                    args: Prisma.ConveniosCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ConveniosCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>[];
                };
                delete: {
                    args: Prisma.ConveniosDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>;
                };
                update: {
                    args: Prisma.ConveniosUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>;
                };
                deleteMany: {
                    args: Prisma.ConveniosDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ConveniosUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ConveniosUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>[];
                };
                upsert: {
                    args: Prisma.ConveniosUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConveniosPayload>;
                };
                aggregate: {
                    args: Prisma.ConveniosAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateConvenios>;
                };
                groupBy: {
                    args: Prisma.ConveniosGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ConveniosGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ConveniosCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ConveniosCountAggregateOutputType> | number;
                };
            };
        };
        DetalleFactura: {
            payload: Prisma.$DetalleFacturaPayload<ExtArgs>;
            fields: Prisma.DetalleFacturaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DetalleFacturaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DetalleFacturaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>;
                };
                findFirst: {
                    args: Prisma.DetalleFacturaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DetalleFacturaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>;
                };
                findMany: {
                    args: Prisma.DetalleFacturaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>[];
                };
                create: {
                    args: Prisma.DetalleFacturaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>;
                };
                createMany: {
                    args: Prisma.DetalleFacturaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DetalleFacturaCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>[];
                };
                delete: {
                    args: Prisma.DetalleFacturaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>;
                };
                update: {
                    args: Prisma.DetalleFacturaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>;
                };
                deleteMany: {
                    args: Prisma.DetalleFacturaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DetalleFacturaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DetalleFacturaUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>[];
                };
                upsert: {
                    args: Prisma.DetalleFacturaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DetalleFacturaPayload>;
                };
                aggregate: {
                    args: Prisma.DetalleFacturaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDetalleFactura>;
                };
                groupBy: {
                    args: Prisma.DetalleFacturaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DetalleFacturaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DetalleFacturaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DetalleFacturaCountAggregateOutputType> | number;
                };
            };
        };
        Facturas: {
            payload: Prisma.$FacturasPayload<ExtArgs>;
            fields: Prisma.FacturasFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.FacturasFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.FacturasFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>;
                };
                findFirst: {
                    args: Prisma.FacturasFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.FacturasFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>;
                };
                findMany: {
                    args: Prisma.FacturasFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>[];
                };
                create: {
                    args: Prisma.FacturasCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>;
                };
                createMany: {
                    args: Prisma.FacturasCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.FacturasCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>[];
                };
                delete: {
                    args: Prisma.FacturasDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>;
                };
                update: {
                    args: Prisma.FacturasUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>;
                };
                deleteMany: {
                    args: Prisma.FacturasDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.FacturasUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.FacturasUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>[];
                };
                upsert: {
                    args: Prisma.FacturasUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FacturasPayload>;
                };
                aggregate: {
                    args: Prisma.FacturasAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateFacturas>;
                };
                groupBy: {
                    args: Prisma.FacturasGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FacturasGroupByOutputType>[];
                };
                count: {
                    args: Prisma.FacturasCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FacturasCountAggregateOutputType> | number;
                };
            };
        };
        Lecturas: {
            payload: Prisma.$LecturasPayload<ExtArgs>;
            fields: Prisma.LecturasFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.LecturasFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.LecturasFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>;
                };
                findFirst: {
                    args: Prisma.LecturasFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.LecturasFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>;
                };
                findMany: {
                    args: Prisma.LecturasFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>[];
                };
                create: {
                    args: Prisma.LecturasCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>;
                };
                createMany: {
                    args: Prisma.LecturasCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.LecturasCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>[];
                };
                delete: {
                    args: Prisma.LecturasDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>;
                };
                update: {
                    args: Prisma.LecturasUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>;
                };
                deleteMany: {
                    args: Prisma.LecturasDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.LecturasUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.LecturasUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>[];
                };
                upsert: {
                    args: Prisma.LecturasUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LecturasPayload>;
                };
                aggregate: {
                    args: Prisma.LecturasAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateLecturas>;
                };
                groupBy: {
                    args: Prisma.LecturasGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LecturasGroupByOutputType>[];
                };
                count: {
                    args: Prisma.LecturasCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LecturasCountAggregateOutputType> | number;
                };
            };
        };
        Medidores: {
            payload: Prisma.$MedidoresPayload<ExtArgs>;
            fields: Prisma.MedidoresFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MedidoresFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MedidoresFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>;
                };
                findFirst: {
                    args: Prisma.MedidoresFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MedidoresFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>;
                };
                findMany: {
                    args: Prisma.MedidoresFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>[];
                };
                create: {
                    args: Prisma.MedidoresCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>;
                };
                createMany: {
                    args: Prisma.MedidoresCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MedidoresCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>[];
                };
                delete: {
                    args: Prisma.MedidoresDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>;
                };
                update: {
                    args: Prisma.MedidoresUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>;
                };
                deleteMany: {
                    args: Prisma.MedidoresDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MedidoresUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MedidoresUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>[];
                };
                upsert: {
                    args: Prisma.MedidoresUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MedidoresPayload>;
                };
                aggregate: {
                    args: Prisma.MedidoresAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMedidores>;
                };
                groupBy: {
                    args: Prisma.MedidoresGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MedidoresGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MedidoresCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MedidoresCountAggregateOutputType> | number;
                };
            };
        };
        Pagos: {
            payload: Prisma.$PagosPayload<ExtArgs>;
            fields: Prisma.PagosFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PagosFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PagosFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>;
                };
                findFirst: {
                    args: Prisma.PagosFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PagosFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>;
                };
                findMany: {
                    args: Prisma.PagosFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>[];
                };
                create: {
                    args: Prisma.PagosCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>;
                };
                createMany: {
                    args: Prisma.PagosCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PagosCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>[];
                };
                delete: {
                    args: Prisma.PagosDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>;
                };
                update: {
                    args: Prisma.PagosUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>;
                };
                deleteMany: {
                    args: Prisma.PagosDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PagosUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PagosUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>[];
                };
                upsert: {
                    args: Prisma.PagosUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PagosPayload>;
                };
                aggregate: {
                    args: Prisma.PagosAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePagos>;
                };
                groupBy: {
                    args: Prisma.PagosGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PagosGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PagosCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PagosCountAggregateOutputType> | number;
                };
            };
        };
        Solicitudes: {
            payload: Prisma.$SolicitudesPayload<ExtArgs>;
            fields: Prisma.SolicitudesFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SolicitudesFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SolicitudesFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>;
                };
                findFirst: {
                    args: Prisma.SolicitudesFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SolicitudesFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>;
                };
                findMany: {
                    args: Prisma.SolicitudesFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>[];
                };
                create: {
                    args: Prisma.SolicitudesCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>;
                };
                createMany: {
                    args: Prisma.SolicitudesCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SolicitudesCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>[];
                };
                delete: {
                    args: Prisma.SolicitudesDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>;
                };
                update: {
                    args: Prisma.SolicitudesUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>;
                };
                deleteMany: {
                    args: Prisma.SolicitudesDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SolicitudesUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SolicitudesUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>[];
                };
                upsert: {
                    args: Prisma.SolicitudesUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudesPayload>;
                };
                aggregate: {
                    args: Prisma.SolicitudesAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSolicitudes>;
                };
                groupBy: {
                    args: Prisma.SolicitudesGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SolicitudesGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SolicitudesCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SolicitudesCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
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
export declare const UserRolesScalarFieldEnum: {
    readonly usersRolesId: "usersRolesId";
    readonly usersId: "usersId";
    readonly rolesId: "rolesId";
    readonly deletedAt: "deletedAt";
};
export type UserRolesScalarFieldEnum = (typeof UserRolesScalarFieldEnum)[keyof typeof UserRolesScalarFieldEnum];
export declare const UsersScalarFieldEnum: {
    readonly usersId: "usersId";
    readonly email: "email";
    readonly password: "password";
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
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>;
export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    accelerateUrl: string;
    adapter?: never;
}) & {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    menuPermissions?: Prisma.MenuPermissionsOmit;
    menus?: Prisma.MenusOmit;
    permissions?: Prisma.PermissionsOmit;
    profiles?: Prisma.ProfilesOmit;
    rolPermissions?: Prisma.RolPermissionsOmit;
    roles?: Prisma.RolesOmit;
    sessions?: Prisma.SessionsOmit;
    userPermissions?: Prisma.UserPermissionsOmit;
    userRoles?: Prisma.UserRolesOmit;
    users?: Prisma.UsersOmit;
    clientes?: Prisma.ClientesOmit;
    clientesMedidores?: Prisma.ClientesMedidoresOmit;
    comunidades?: Prisma.ComunidadesOmit;
    convenios?: Prisma.ConveniosOmit;
    detalleFactura?: Prisma.DetalleFacturaOmit;
    facturas?: Prisma.FacturasOmit;
    lecturas?: Prisma.LecturasOmit;
    medidores?: Prisma.MedidoresOmit;
    pagos?: Prisma.PagosOmit;
    solicitudes?: Prisma.SolicitudesOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
