import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RolPermissionsModel = runtime.Types.Result.DefaultSelection<Prisma.$RolPermissionsPayload>;
export type AggregateRolPermissions = {
    _count: RolPermissionsCountAggregateOutputType | null;
    _avg: RolPermissionsAvgAggregateOutputType | null;
    _sum: RolPermissionsSumAggregateOutputType | null;
    _min: RolPermissionsMinAggregateOutputType | null;
    _max: RolPermissionsMaxAggregateOutputType | null;
};
export type RolPermissionsAvgAggregateOutputType = {
    rolPermissionsId: number | null;
    rolesId: number | null;
    permissionsId: number | null;
};
export type RolPermissionsSumAggregateOutputType = {
    rolPermissionsId: number | null;
    rolesId: number | null;
    permissionsId: number | null;
};
export type RolPermissionsMinAggregateOutputType = {
    rolPermissionsId: number | null;
    rolesId: number | null;
    permissionsId: number | null;
    deletedAt: Date | null;
};
export type RolPermissionsMaxAggregateOutputType = {
    rolPermissionsId: number | null;
    rolesId: number | null;
    permissionsId: number | null;
    deletedAt: Date | null;
};
export type RolPermissionsCountAggregateOutputType = {
    rolPermissionsId: number;
    rolesId: number;
    permissionsId: number;
    deletedAt: number;
    _all: number;
};
export type RolPermissionsAvgAggregateInputType = {
    rolPermissionsId?: true;
    rolesId?: true;
    permissionsId?: true;
};
export type RolPermissionsSumAggregateInputType = {
    rolPermissionsId?: true;
    rolesId?: true;
    permissionsId?: true;
};
export type RolPermissionsMinAggregateInputType = {
    rolPermissionsId?: true;
    rolesId?: true;
    permissionsId?: true;
    deletedAt?: true;
};
export type RolPermissionsMaxAggregateInputType = {
    rolPermissionsId?: true;
    rolesId?: true;
    permissionsId?: true;
    deletedAt?: true;
};
export type RolPermissionsCountAggregateInputType = {
    rolPermissionsId?: true;
    rolesId?: true;
    permissionsId?: true;
    deletedAt?: true;
    _all?: true;
};
export type RolPermissionsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolPermissionsWhereInput;
    orderBy?: Prisma.RolPermissionsOrderByWithRelationInput | Prisma.RolPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.RolPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RolPermissionsCountAggregateInputType;
    _avg?: RolPermissionsAvgAggregateInputType;
    _sum?: RolPermissionsSumAggregateInputType;
    _min?: RolPermissionsMinAggregateInputType;
    _max?: RolPermissionsMaxAggregateInputType;
};
export type GetRolPermissionsAggregateType<T extends RolPermissionsAggregateArgs> = {
    [P in keyof T & keyof AggregateRolPermissions]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRolPermissions[P]> : Prisma.GetScalarType<T[P], AggregateRolPermissions[P]>;
};
export type RolPermissionsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolPermissionsWhereInput;
    orderBy?: Prisma.RolPermissionsOrderByWithAggregationInput | Prisma.RolPermissionsOrderByWithAggregationInput[];
    by: Prisma.RolPermissionsScalarFieldEnum[] | Prisma.RolPermissionsScalarFieldEnum;
    having?: Prisma.RolPermissionsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RolPermissionsCountAggregateInputType | true;
    _avg?: RolPermissionsAvgAggregateInputType;
    _sum?: RolPermissionsSumAggregateInputType;
    _min?: RolPermissionsMinAggregateInputType;
    _max?: RolPermissionsMaxAggregateInputType;
};
export type RolPermissionsGroupByOutputType = {
    rolPermissionsId: number;
    rolesId: number;
    permissionsId: number;
    deletedAt: Date | null;
    _count: RolPermissionsCountAggregateOutputType | null;
    _avg: RolPermissionsAvgAggregateOutputType | null;
    _sum: RolPermissionsSumAggregateOutputType | null;
    _min: RolPermissionsMinAggregateOutputType | null;
    _max: RolPermissionsMaxAggregateOutputType | null;
};
type GetRolPermissionsGroupByPayload<T extends RolPermissionsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RolPermissionsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RolPermissionsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RolPermissionsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RolPermissionsGroupByOutputType[P]>;
}>>;
export type RolPermissionsWhereInput = {
    AND?: Prisma.RolPermissionsWhereInput | Prisma.RolPermissionsWhereInput[];
    OR?: Prisma.RolPermissionsWhereInput[];
    NOT?: Prisma.RolPermissionsWhereInput | Prisma.RolPermissionsWhereInput[];
    rolPermissionsId?: Prisma.IntFilter<"RolPermissions"> | number;
    rolesId?: Prisma.IntFilter<"RolPermissions"> | number;
    permissionsId?: Prisma.IntFilter<"RolPermissions"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"RolPermissions"> | Date | string | null;
    roles?: Prisma.XOR<Prisma.RolesScalarRelationFilter, Prisma.RolesWhereInput>;
    permissions?: Prisma.XOR<Prisma.PermissionsScalarRelationFilter, Prisma.PermissionsWhereInput>;
};
export type RolPermissionsOrderByWithRelationInput = {
    rolPermissionsId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    roles?: Prisma.RolesOrderByWithRelationInput;
    permissions?: Prisma.PermissionsOrderByWithRelationInput;
};
export type RolPermissionsWhereUniqueInput = Prisma.AtLeast<{
    rolPermissionsId?: number;
    AND?: Prisma.RolPermissionsWhereInput | Prisma.RolPermissionsWhereInput[];
    OR?: Prisma.RolPermissionsWhereInput[];
    NOT?: Prisma.RolPermissionsWhereInput | Prisma.RolPermissionsWhereInput[];
    rolesId?: Prisma.IntFilter<"RolPermissions"> | number;
    permissionsId?: Prisma.IntFilter<"RolPermissions"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"RolPermissions"> | Date | string | null;
    roles?: Prisma.XOR<Prisma.RolesScalarRelationFilter, Prisma.RolesWhereInput>;
    permissions?: Prisma.XOR<Prisma.PermissionsScalarRelationFilter, Prisma.PermissionsWhereInput>;
}, "rolPermissionsId">;
export type RolPermissionsOrderByWithAggregationInput = {
    rolPermissionsId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.RolPermissionsCountOrderByAggregateInput;
    _avg?: Prisma.RolPermissionsAvgOrderByAggregateInput;
    _max?: Prisma.RolPermissionsMaxOrderByAggregateInput;
    _min?: Prisma.RolPermissionsMinOrderByAggregateInput;
    _sum?: Prisma.RolPermissionsSumOrderByAggregateInput;
};
export type RolPermissionsScalarWhereWithAggregatesInput = {
    AND?: Prisma.RolPermissionsScalarWhereWithAggregatesInput | Prisma.RolPermissionsScalarWhereWithAggregatesInput[];
    OR?: Prisma.RolPermissionsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RolPermissionsScalarWhereWithAggregatesInput | Prisma.RolPermissionsScalarWhereWithAggregatesInput[];
    rolPermissionsId?: Prisma.IntWithAggregatesFilter<"RolPermissions"> | number;
    rolesId?: Prisma.IntWithAggregatesFilter<"RolPermissions"> | number;
    permissionsId?: Prisma.IntWithAggregatesFilter<"RolPermissions"> | number;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"RolPermissions"> | Date | string | null;
};
export type RolPermissionsCreateInput = {
    deletedAt?: Date | string | null;
    roles: Prisma.RolesCreateNestedOneWithoutRolPermissionsInput;
    permissions: Prisma.PermissionsCreateNestedOneWithoutRolPermissionsInput;
};
export type RolPermissionsUncheckedCreateInput = {
    rolPermissionsId?: number;
    rolesId: number;
    permissionsId: number;
    deletedAt?: Date | string | null;
};
export type RolPermissionsUpdateInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    roles?: Prisma.RolesUpdateOneRequiredWithoutRolPermissionsNestedInput;
    permissions?: Prisma.PermissionsUpdateOneRequiredWithoutRolPermissionsNestedInput;
};
export type RolPermissionsUncheckedUpdateInput = {
    rolPermissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolPermissionsCreateManyInput = {
    rolPermissionsId?: number;
    rolesId: number;
    permissionsId: number;
    deletedAt?: Date | string | null;
};
export type RolPermissionsUpdateManyMutationInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolPermissionsUncheckedUpdateManyInput = {
    rolPermissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolPermissionsListRelationFilter = {
    every?: Prisma.RolPermissionsWhereInput;
    some?: Prisma.RolPermissionsWhereInput;
    none?: Prisma.RolPermissionsWhereInput;
};
export type RolPermissionsOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RolPermissionsCountOrderByAggregateInput = {
    rolPermissionsId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RolPermissionsAvgOrderByAggregateInput = {
    rolPermissionsId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
};
export type RolPermissionsMaxOrderByAggregateInput = {
    rolPermissionsId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RolPermissionsMinOrderByAggregateInput = {
    rolPermissionsId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RolPermissionsSumOrderByAggregateInput = {
    rolPermissionsId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
};
export type RolPermissionsCreateNestedManyWithoutPermissionsInput = {
    create?: Prisma.XOR<Prisma.RolPermissionsCreateWithoutPermissionsInput, Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.RolPermissionsCreateWithoutPermissionsInput[] | Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.RolPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.RolPermissionsCreateOrConnectWithoutPermissionsInput[];
    createMany?: Prisma.RolPermissionsCreateManyPermissionsInputEnvelope;
    connect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
};
export type RolPermissionsUncheckedCreateNestedManyWithoutPermissionsInput = {
    create?: Prisma.XOR<Prisma.RolPermissionsCreateWithoutPermissionsInput, Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.RolPermissionsCreateWithoutPermissionsInput[] | Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.RolPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.RolPermissionsCreateOrConnectWithoutPermissionsInput[];
    createMany?: Prisma.RolPermissionsCreateManyPermissionsInputEnvelope;
    connect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
};
export type RolPermissionsUpdateManyWithoutPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.RolPermissionsCreateWithoutPermissionsInput, Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.RolPermissionsCreateWithoutPermissionsInput[] | Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.RolPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.RolPermissionsCreateOrConnectWithoutPermissionsInput[];
    upsert?: Prisma.RolPermissionsUpsertWithWhereUniqueWithoutPermissionsInput | Prisma.RolPermissionsUpsertWithWhereUniqueWithoutPermissionsInput[];
    createMany?: Prisma.RolPermissionsCreateManyPermissionsInputEnvelope;
    set?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    disconnect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    delete?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    connect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    update?: Prisma.RolPermissionsUpdateWithWhereUniqueWithoutPermissionsInput | Prisma.RolPermissionsUpdateWithWhereUniqueWithoutPermissionsInput[];
    updateMany?: Prisma.RolPermissionsUpdateManyWithWhereWithoutPermissionsInput | Prisma.RolPermissionsUpdateManyWithWhereWithoutPermissionsInput[];
    deleteMany?: Prisma.RolPermissionsScalarWhereInput | Prisma.RolPermissionsScalarWhereInput[];
};
export type RolPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.RolPermissionsCreateWithoutPermissionsInput, Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.RolPermissionsCreateWithoutPermissionsInput[] | Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.RolPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.RolPermissionsCreateOrConnectWithoutPermissionsInput[];
    upsert?: Prisma.RolPermissionsUpsertWithWhereUniqueWithoutPermissionsInput | Prisma.RolPermissionsUpsertWithWhereUniqueWithoutPermissionsInput[];
    createMany?: Prisma.RolPermissionsCreateManyPermissionsInputEnvelope;
    set?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    disconnect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    delete?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    connect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    update?: Prisma.RolPermissionsUpdateWithWhereUniqueWithoutPermissionsInput | Prisma.RolPermissionsUpdateWithWhereUniqueWithoutPermissionsInput[];
    updateMany?: Prisma.RolPermissionsUpdateManyWithWhereWithoutPermissionsInput | Prisma.RolPermissionsUpdateManyWithWhereWithoutPermissionsInput[];
    deleteMany?: Prisma.RolPermissionsScalarWhereInput | Prisma.RolPermissionsScalarWhereInput[];
};
export type RolPermissionsCreateNestedManyWithoutRolesInput = {
    create?: Prisma.XOR<Prisma.RolPermissionsCreateWithoutRolesInput, Prisma.RolPermissionsUncheckedCreateWithoutRolesInput> | Prisma.RolPermissionsCreateWithoutRolesInput[] | Prisma.RolPermissionsUncheckedCreateWithoutRolesInput[];
    connectOrCreate?: Prisma.RolPermissionsCreateOrConnectWithoutRolesInput | Prisma.RolPermissionsCreateOrConnectWithoutRolesInput[];
    createMany?: Prisma.RolPermissionsCreateManyRolesInputEnvelope;
    connect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
};
export type RolPermissionsUncheckedCreateNestedManyWithoutRolesInput = {
    create?: Prisma.XOR<Prisma.RolPermissionsCreateWithoutRolesInput, Prisma.RolPermissionsUncheckedCreateWithoutRolesInput> | Prisma.RolPermissionsCreateWithoutRolesInput[] | Prisma.RolPermissionsUncheckedCreateWithoutRolesInput[];
    connectOrCreate?: Prisma.RolPermissionsCreateOrConnectWithoutRolesInput | Prisma.RolPermissionsCreateOrConnectWithoutRolesInput[];
    createMany?: Prisma.RolPermissionsCreateManyRolesInputEnvelope;
    connect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
};
export type RolPermissionsUpdateManyWithoutRolesNestedInput = {
    create?: Prisma.XOR<Prisma.RolPermissionsCreateWithoutRolesInput, Prisma.RolPermissionsUncheckedCreateWithoutRolesInput> | Prisma.RolPermissionsCreateWithoutRolesInput[] | Prisma.RolPermissionsUncheckedCreateWithoutRolesInput[];
    connectOrCreate?: Prisma.RolPermissionsCreateOrConnectWithoutRolesInput | Prisma.RolPermissionsCreateOrConnectWithoutRolesInput[];
    upsert?: Prisma.RolPermissionsUpsertWithWhereUniqueWithoutRolesInput | Prisma.RolPermissionsUpsertWithWhereUniqueWithoutRolesInput[];
    createMany?: Prisma.RolPermissionsCreateManyRolesInputEnvelope;
    set?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    disconnect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    delete?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    connect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    update?: Prisma.RolPermissionsUpdateWithWhereUniqueWithoutRolesInput | Prisma.RolPermissionsUpdateWithWhereUniqueWithoutRolesInput[];
    updateMany?: Prisma.RolPermissionsUpdateManyWithWhereWithoutRolesInput | Prisma.RolPermissionsUpdateManyWithWhereWithoutRolesInput[];
    deleteMany?: Prisma.RolPermissionsScalarWhereInput | Prisma.RolPermissionsScalarWhereInput[];
};
export type RolPermissionsUncheckedUpdateManyWithoutRolesNestedInput = {
    create?: Prisma.XOR<Prisma.RolPermissionsCreateWithoutRolesInput, Prisma.RolPermissionsUncheckedCreateWithoutRolesInput> | Prisma.RolPermissionsCreateWithoutRolesInput[] | Prisma.RolPermissionsUncheckedCreateWithoutRolesInput[];
    connectOrCreate?: Prisma.RolPermissionsCreateOrConnectWithoutRolesInput | Prisma.RolPermissionsCreateOrConnectWithoutRolesInput[];
    upsert?: Prisma.RolPermissionsUpsertWithWhereUniqueWithoutRolesInput | Prisma.RolPermissionsUpsertWithWhereUniqueWithoutRolesInput[];
    createMany?: Prisma.RolPermissionsCreateManyRolesInputEnvelope;
    set?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    disconnect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    delete?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    connect?: Prisma.RolPermissionsWhereUniqueInput | Prisma.RolPermissionsWhereUniqueInput[];
    update?: Prisma.RolPermissionsUpdateWithWhereUniqueWithoutRolesInput | Prisma.RolPermissionsUpdateWithWhereUniqueWithoutRolesInput[];
    updateMany?: Prisma.RolPermissionsUpdateManyWithWhereWithoutRolesInput | Prisma.RolPermissionsUpdateManyWithWhereWithoutRolesInput[];
    deleteMany?: Prisma.RolPermissionsScalarWhereInput | Prisma.RolPermissionsScalarWhereInput[];
};
export type RolPermissionsCreateWithoutPermissionsInput = {
    deletedAt?: Date | string | null;
    roles: Prisma.RolesCreateNestedOneWithoutRolPermissionsInput;
};
export type RolPermissionsUncheckedCreateWithoutPermissionsInput = {
    rolPermissionsId?: number;
    rolesId: number;
    deletedAt?: Date | string | null;
};
export type RolPermissionsCreateOrConnectWithoutPermissionsInput = {
    where: Prisma.RolPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.RolPermissionsCreateWithoutPermissionsInput, Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput>;
};
export type RolPermissionsCreateManyPermissionsInputEnvelope = {
    data: Prisma.RolPermissionsCreateManyPermissionsInput | Prisma.RolPermissionsCreateManyPermissionsInput[];
    skipDuplicates?: boolean;
};
export type RolPermissionsUpsertWithWhereUniqueWithoutPermissionsInput = {
    where: Prisma.RolPermissionsWhereUniqueInput;
    update: Prisma.XOR<Prisma.RolPermissionsUpdateWithoutPermissionsInput, Prisma.RolPermissionsUncheckedUpdateWithoutPermissionsInput>;
    create: Prisma.XOR<Prisma.RolPermissionsCreateWithoutPermissionsInput, Prisma.RolPermissionsUncheckedCreateWithoutPermissionsInput>;
};
export type RolPermissionsUpdateWithWhereUniqueWithoutPermissionsInput = {
    where: Prisma.RolPermissionsWhereUniqueInput;
    data: Prisma.XOR<Prisma.RolPermissionsUpdateWithoutPermissionsInput, Prisma.RolPermissionsUncheckedUpdateWithoutPermissionsInput>;
};
export type RolPermissionsUpdateManyWithWhereWithoutPermissionsInput = {
    where: Prisma.RolPermissionsScalarWhereInput;
    data: Prisma.XOR<Prisma.RolPermissionsUpdateManyMutationInput, Prisma.RolPermissionsUncheckedUpdateManyWithoutPermissionsInput>;
};
export type RolPermissionsScalarWhereInput = {
    AND?: Prisma.RolPermissionsScalarWhereInput | Prisma.RolPermissionsScalarWhereInput[];
    OR?: Prisma.RolPermissionsScalarWhereInput[];
    NOT?: Prisma.RolPermissionsScalarWhereInput | Prisma.RolPermissionsScalarWhereInput[];
    rolPermissionsId?: Prisma.IntFilter<"RolPermissions"> | number;
    rolesId?: Prisma.IntFilter<"RolPermissions"> | number;
    permissionsId?: Prisma.IntFilter<"RolPermissions"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"RolPermissions"> | Date | string | null;
};
export type RolPermissionsCreateWithoutRolesInput = {
    deletedAt?: Date | string | null;
    permissions: Prisma.PermissionsCreateNestedOneWithoutRolPermissionsInput;
};
export type RolPermissionsUncheckedCreateWithoutRolesInput = {
    rolPermissionsId?: number;
    permissionsId: number;
    deletedAt?: Date | string | null;
};
export type RolPermissionsCreateOrConnectWithoutRolesInput = {
    where: Prisma.RolPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.RolPermissionsCreateWithoutRolesInput, Prisma.RolPermissionsUncheckedCreateWithoutRolesInput>;
};
export type RolPermissionsCreateManyRolesInputEnvelope = {
    data: Prisma.RolPermissionsCreateManyRolesInput | Prisma.RolPermissionsCreateManyRolesInput[];
    skipDuplicates?: boolean;
};
export type RolPermissionsUpsertWithWhereUniqueWithoutRolesInput = {
    where: Prisma.RolPermissionsWhereUniqueInput;
    update: Prisma.XOR<Prisma.RolPermissionsUpdateWithoutRolesInput, Prisma.RolPermissionsUncheckedUpdateWithoutRolesInput>;
    create: Prisma.XOR<Prisma.RolPermissionsCreateWithoutRolesInput, Prisma.RolPermissionsUncheckedCreateWithoutRolesInput>;
};
export type RolPermissionsUpdateWithWhereUniqueWithoutRolesInput = {
    where: Prisma.RolPermissionsWhereUniqueInput;
    data: Prisma.XOR<Prisma.RolPermissionsUpdateWithoutRolesInput, Prisma.RolPermissionsUncheckedUpdateWithoutRolesInput>;
};
export type RolPermissionsUpdateManyWithWhereWithoutRolesInput = {
    where: Prisma.RolPermissionsScalarWhereInput;
    data: Prisma.XOR<Prisma.RolPermissionsUpdateManyMutationInput, Prisma.RolPermissionsUncheckedUpdateManyWithoutRolesInput>;
};
export type RolPermissionsCreateManyPermissionsInput = {
    rolPermissionsId?: number;
    rolesId: number;
    deletedAt?: Date | string | null;
};
export type RolPermissionsUpdateWithoutPermissionsInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    roles?: Prisma.RolesUpdateOneRequiredWithoutRolPermissionsNestedInput;
};
export type RolPermissionsUncheckedUpdateWithoutPermissionsInput = {
    rolPermissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolPermissionsUncheckedUpdateManyWithoutPermissionsInput = {
    rolPermissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolPermissionsCreateManyRolesInput = {
    rolPermissionsId?: number;
    permissionsId: number;
    deletedAt?: Date | string | null;
};
export type RolPermissionsUpdateWithoutRolesInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    permissions?: Prisma.PermissionsUpdateOneRequiredWithoutRolPermissionsNestedInput;
};
export type RolPermissionsUncheckedUpdateWithoutRolesInput = {
    rolPermissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolPermissionsUncheckedUpdateManyWithoutRolesInput = {
    rolPermissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolPermissionsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolPermissionsId?: boolean;
    rolesId?: boolean;
    permissionsId?: boolean;
    deletedAt?: boolean;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["rolPermissions"]>;
export type RolPermissionsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolPermissionsId?: boolean;
    rolesId?: boolean;
    permissionsId?: boolean;
    deletedAt?: boolean;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["rolPermissions"]>;
export type RolPermissionsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolPermissionsId?: boolean;
    rolesId?: boolean;
    permissionsId?: boolean;
    deletedAt?: boolean;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["rolPermissions"]>;
export type RolPermissionsSelectScalar = {
    rolPermissionsId?: boolean;
    rolesId?: boolean;
    permissionsId?: boolean;
    deletedAt?: boolean;
};
export type RolPermissionsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"rolPermissionsId" | "rolesId" | "permissionsId" | "deletedAt", ExtArgs["result"]["rolPermissions"]>;
export type RolPermissionsInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
};
export type RolPermissionsIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
};
export type RolPermissionsIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
};
export type $RolPermissionsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RolPermissions";
    objects: {
        roles: Prisma.$RolesPayload<ExtArgs>;
        permissions: Prisma.$PermissionsPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        rolPermissionsId: number;
        rolesId: number;
        permissionsId: number;
        deletedAt: Date | null;
    }, ExtArgs["result"]["rolPermissions"]>;
    composites: {};
};
export type RolPermissionsGetPayload<S extends boolean | null | undefined | RolPermissionsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload, S>;
export type RolPermissionsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RolPermissionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RolPermissionsCountAggregateInputType | true;
};
export interface RolPermissionsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RolPermissions'];
        meta: {
            name: 'RolPermissions';
        };
    };
    findUnique<T extends RolPermissionsFindUniqueArgs>(args: Prisma.SelectSubset<T, RolPermissionsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RolPermissionsClient<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RolPermissionsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RolPermissionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RolPermissionsClient<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RolPermissionsFindFirstArgs>(args?: Prisma.SelectSubset<T, RolPermissionsFindFirstArgs<ExtArgs>>): Prisma.Prisma__RolPermissionsClient<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RolPermissionsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RolPermissionsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RolPermissionsClient<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RolPermissionsFindManyArgs>(args?: Prisma.SelectSubset<T, RolPermissionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RolPermissionsCreateArgs>(args: Prisma.SelectSubset<T, RolPermissionsCreateArgs<ExtArgs>>): Prisma.Prisma__RolPermissionsClient<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RolPermissionsCreateManyArgs>(args?: Prisma.SelectSubset<T, RolPermissionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RolPermissionsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RolPermissionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RolPermissionsDeleteArgs>(args: Prisma.SelectSubset<T, RolPermissionsDeleteArgs<ExtArgs>>): Prisma.Prisma__RolPermissionsClient<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RolPermissionsUpdateArgs>(args: Prisma.SelectSubset<T, RolPermissionsUpdateArgs<ExtArgs>>): Prisma.Prisma__RolPermissionsClient<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RolPermissionsDeleteManyArgs>(args?: Prisma.SelectSubset<T, RolPermissionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RolPermissionsUpdateManyArgs>(args: Prisma.SelectSubset<T, RolPermissionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RolPermissionsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RolPermissionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RolPermissionsUpsertArgs>(args: Prisma.SelectSubset<T, RolPermissionsUpsertArgs<ExtArgs>>): Prisma.Prisma__RolPermissionsClient<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RolPermissionsCountArgs>(args?: Prisma.Subset<T, RolPermissionsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RolPermissionsCountAggregateOutputType> : number>;
    aggregate<T extends RolPermissionsAggregateArgs>(args: Prisma.Subset<T, RolPermissionsAggregateArgs>): Prisma.PrismaPromise<GetRolPermissionsAggregateType<T>>;
    groupBy<T extends RolPermissionsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RolPermissionsGroupByArgs['orderBy'];
    } : {
        orderBy?: RolPermissionsGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RolPermissionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRolPermissionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RolPermissionsFieldRefs;
}
export interface Prisma__RolPermissionsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    roles<T extends Prisma.RolesDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RolesDefaultArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    permissions<T extends Prisma.PermissionsDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PermissionsDefaultArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RolPermissionsFieldRefs {
    readonly rolPermissionsId: Prisma.FieldRef<"RolPermissions", 'Int'>;
    readonly rolesId: Prisma.FieldRef<"RolPermissions", 'Int'>;
    readonly permissionsId: Prisma.FieldRef<"RolPermissions", 'Int'>;
    readonly deletedAt: Prisma.FieldRef<"RolPermissions", 'DateTime'>;
}
export type RolPermissionsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    where: Prisma.RolPermissionsWhereUniqueInput;
};
export type RolPermissionsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    where: Prisma.RolPermissionsWhereUniqueInput;
};
export type RolPermissionsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    where?: Prisma.RolPermissionsWhereInput;
    orderBy?: Prisma.RolPermissionsOrderByWithRelationInput | Prisma.RolPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.RolPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RolPermissionsScalarFieldEnum | Prisma.RolPermissionsScalarFieldEnum[];
};
export type RolPermissionsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    where?: Prisma.RolPermissionsWhereInput;
    orderBy?: Prisma.RolPermissionsOrderByWithRelationInput | Prisma.RolPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.RolPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RolPermissionsScalarFieldEnum | Prisma.RolPermissionsScalarFieldEnum[];
};
export type RolPermissionsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    where?: Prisma.RolPermissionsWhereInput;
    orderBy?: Prisma.RolPermissionsOrderByWithRelationInput | Prisma.RolPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.RolPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RolPermissionsScalarFieldEnum | Prisma.RolPermissionsScalarFieldEnum[];
};
export type RolPermissionsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RolPermissionsCreateInput, Prisma.RolPermissionsUncheckedCreateInput>;
};
export type RolPermissionsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RolPermissionsCreateManyInput | Prisma.RolPermissionsCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RolPermissionsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    data: Prisma.RolPermissionsCreateManyInput | Prisma.RolPermissionsCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.RolPermissionsIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RolPermissionsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RolPermissionsUpdateInput, Prisma.RolPermissionsUncheckedUpdateInput>;
    where: Prisma.RolPermissionsWhereUniqueInput;
};
export type RolPermissionsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RolPermissionsUpdateManyMutationInput, Prisma.RolPermissionsUncheckedUpdateManyInput>;
    where?: Prisma.RolPermissionsWhereInput;
    limit?: number;
};
export type RolPermissionsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RolPermissionsUpdateManyMutationInput, Prisma.RolPermissionsUncheckedUpdateManyInput>;
    where?: Prisma.RolPermissionsWhereInput;
    limit?: number;
    include?: Prisma.RolPermissionsIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RolPermissionsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    where: Prisma.RolPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.RolPermissionsCreateInput, Prisma.RolPermissionsUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RolPermissionsUpdateInput, Prisma.RolPermissionsUncheckedUpdateInput>;
};
export type RolPermissionsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
    where: Prisma.RolPermissionsWhereUniqueInput;
};
export type RolPermissionsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolPermissionsWhereInput;
    limit?: number;
};
export type RolPermissionsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.RolPermissionsOmit<ExtArgs> | null;
    include?: Prisma.RolPermissionsInclude<ExtArgs> | null;
};
export {};
