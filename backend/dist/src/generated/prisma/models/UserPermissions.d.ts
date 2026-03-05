import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type UserPermissionsModel = runtime.Types.Result.DefaultSelection<Prisma.$UserPermissionsPayload>;
export type AggregateUserPermissions = {
    _count: UserPermissionsCountAggregateOutputType | null;
    _avg: UserPermissionsAvgAggregateOutputType | null;
    _sum: UserPermissionsSumAggregateOutputType | null;
    _min: UserPermissionsMinAggregateOutputType | null;
    _max: UserPermissionsMaxAggregateOutputType | null;
};
export type UserPermissionsAvgAggregateOutputType = {
    idUserPermissions: number | null;
    usersId: number | null;
    permissionsId: number | null;
};
export type UserPermissionsSumAggregateOutputType = {
    idUserPermissions: number | null;
    usersId: number | null;
    permissionsId: number | null;
};
export type UserPermissionsMinAggregateOutputType = {
    idUserPermissions: number | null;
    usersId: number | null;
    permissionsId: number | null;
    allow: boolean | null;
    deteledAt: Date | null;
};
export type UserPermissionsMaxAggregateOutputType = {
    idUserPermissions: number | null;
    usersId: number | null;
    permissionsId: number | null;
    allow: boolean | null;
    deteledAt: Date | null;
};
export type UserPermissionsCountAggregateOutputType = {
    idUserPermissions: number;
    usersId: number;
    permissionsId: number;
    allow: number;
    deteledAt: number;
    _all: number;
};
export type UserPermissionsAvgAggregateInputType = {
    idUserPermissions?: true;
    usersId?: true;
    permissionsId?: true;
};
export type UserPermissionsSumAggregateInputType = {
    idUserPermissions?: true;
    usersId?: true;
    permissionsId?: true;
};
export type UserPermissionsMinAggregateInputType = {
    idUserPermissions?: true;
    usersId?: true;
    permissionsId?: true;
    allow?: true;
    deteledAt?: true;
};
export type UserPermissionsMaxAggregateInputType = {
    idUserPermissions?: true;
    usersId?: true;
    permissionsId?: true;
    allow?: true;
    deteledAt?: true;
};
export type UserPermissionsCountAggregateInputType = {
    idUserPermissions?: true;
    usersId?: true;
    permissionsId?: true;
    allow?: true;
    deteledAt?: true;
    _all?: true;
};
export type UserPermissionsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserPermissionsWhereInput;
    orderBy?: Prisma.UserPermissionsOrderByWithRelationInput | Prisma.UserPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.UserPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserPermissionsCountAggregateInputType;
    _avg?: UserPermissionsAvgAggregateInputType;
    _sum?: UserPermissionsSumAggregateInputType;
    _min?: UserPermissionsMinAggregateInputType;
    _max?: UserPermissionsMaxAggregateInputType;
};
export type GetUserPermissionsAggregateType<T extends UserPermissionsAggregateArgs> = {
    [P in keyof T & keyof AggregateUserPermissions]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUserPermissions[P]> : Prisma.GetScalarType<T[P], AggregateUserPermissions[P]>;
};
export type UserPermissionsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserPermissionsWhereInput;
    orderBy?: Prisma.UserPermissionsOrderByWithAggregationInput | Prisma.UserPermissionsOrderByWithAggregationInput[];
    by: Prisma.UserPermissionsScalarFieldEnum[] | Prisma.UserPermissionsScalarFieldEnum;
    having?: Prisma.UserPermissionsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserPermissionsCountAggregateInputType | true;
    _avg?: UserPermissionsAvgAggregateInputType;
    _sum?: UserPermissionsSumAggregateInputType;
    _min?: UserPermissionsMinAggregateInputType;
    _max?: UserPermissionsMaxAggregateInputType;
};
export type UserPermissionsGroupByOutputType = {
    idUserPermissions: number;
    usersId: number;
    permissionsId: number;
    allow: boolean;
    deteledAt: Date | null;
    _count: UserPermissionsCountAggregateOutputType | null;
    _avg: UserPermissionsAvgAggregateOutputType | null;
    _sum: UserPermissionsSumAggregateOutputType | null;
    _min: UserPermissionsMinAggregateOutputType | null;
    _max: UserPermissionsMaxAggregateOutputType | null;
};
type GetUserPermissionsGroupByPayload<T extends UserPermissionsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserPermissionsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserPermissionsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserPermissionsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserPermissionsGroupByOutputType[P]>;
}>>;
export type UserPermissionsWhereInput = {
    AND?: Prisma.UserPermissionsWhereInput | Prisma.UserPermissionsWhereInput[];
    OR?: Prisma.UserPermissionsWhereInput[];
    NOT?: Prisma.UserPermissionsWhereInput | Prisma.UserPermissionsWhereInput[];
    idUserPermissions?: Prisma.IntFilter<"UserPermissions"> | number;
    usersId?: Prisma.IntFilter<"UserPermissions"> | number;
    permissionsId?: Prisma.IntFilter<"UserPermissions"> | number;
    allow?: Prisma.BoolFilter<"UserPermissions"> | boolean;
    deteledAt?: Prisma.DateTimeNullableFilter<"UserPermissions"> | Date | string | null;
    users?: Prisma.XOR<Prisma.UsersScalarRelationFilter, Prisma.UsersWhereInput>;
    Permissions?: Prisma.XOR<Prisma.PermissionsScalarRelationFilter, Prisma.PermissionsWhereInput>;
};
export type UserPermissionsOrderByWithRelationInput = {
    idUserPermissions?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    allow?: Prisma.SortOrder;
    deteledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    users?: Prisma.UsersOrderByWithRelationInput;
    Permissions?: Prisma.PermissionsOrderByWithRelationInput;
};
export type UserPermissionsWhereUniqueInput = Prisma.AtLeast<{
    idUserPermissions?: number;
    AND?: Prisma.UserPermissionsWhereInput | Prisma.UserPermissionsWhereInput[];
    OR?: Prisma.UserPermissionsWhereInput[];
    NOT?: Prisma.UserPermissionsWhereInput | Prisma.UserPermissionsWhereInput[];
    usersId?: Prisma.IntFilter<"UserPermissions"> | number;
    permissionsId?: Prisma.IntFilter<"UserPermissions"> | number;
    allow?: Prisma.BoolFilter<"UserPermissions"> | boolean;
    deteledAt?: Prisma.DateTimeNullableFilter<"UserPermissions"> | Date | string | null;
    users?: Prisma.XOR<Prisma.UsersScalarRelationFilter, Prisma.UsersWhereInput>;
    Permissions?: Prisma.XOR<Prisma.PermissionsScalarRelationFilter, Prisma.PermissionsWhereInput>;
}, "idUserPermissions">;
export type UserPermissionsOrderByWithAggregationInput = {
    idUserPermissions?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    allow?: Prisma.SortOrder;
    deteledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.UserPermissionsCountOrderByAggregateInput;
    _avg?: Prisma.UserPermissionsAvgOrderByAggregateInput;
    _max?: Prisma.UserPermissionsMaxOrderByAggregateInput;
    _min?: Prisma.UserPermissionsMinOrderByAggregateInput;
    _sum?: Prisma.UserPermissionsSumOrderByAggregateInput;
};
export type UserPermissionsScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserPermissionsScalarWhereWithAggregatesInput | Prisma.UserPermissionsScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserPermissionsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserPermissionsScalarWhereWithAggregatesInput | Prisma.UserPermissionsScalarWhereWithAggregatesInput[];
    idUserPermissions?: Prisma.IntWithAggregatesFilter<"UserPermissions"> | number;
    usersId?: Prisma.IntWithAggregatesFilter<"UserPermissions"> | number;
    permissionsId?: Prisma.IntWithAggregatesFilter<"UserPermissions"> | number;
    allow?: Prisma.BoolWithAggregatesFilter<"UserPermissions"> | boolean;
    deteledAt?: Prisma.DateTimeNullableWithAggregatesFilter<"UserPermissions"> | Date | string | null;
};
export type UserPermissionsCreateInput = {
    allow: boolean;
    deteledAt?: Date | string | null;
    users: Prisma.UsersCreateNestedOneWithoutUserPermissionsInput;
    Permissions: Prisma.PermissionsCreateNestedOneWithoutUserPermissionsInput;
};
export type UserPermissionsUncheckedCreateInput = {
    idUserPermissions?: number;
    usersId: number;
    permissionsId: number;
    allow: boolean;
    deteledAt?: Date | string | null;
};
export type UserPermissionsUpdateInput = {
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    users?: Prisma.UsersUpdateOneRequiredWithoutUserPermissionsNestedInput;
    Permissions?: Prisma.PermissionsUpdateOneRequiredWithoutUserPermissionsNestedInput;
};
export type UserPermissionsUncheckedUpdateInput = {
    idUserPermissions?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserPermissionsCreateManyInput = {
    idUserPermissions?: number;
    usersId: number;
    permissionsId: number;
    allow: boolean;
    deteledAt?: Date | string | null;
};
export type UserPermissionsUpdateManyMutationInput = {
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserPermissionsUncheckedUpdateManyInput = {
    idUserPermissions?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserPermissionsListRelationFilter = {
    every?: Prisma.UserPermissionsWhereInput;
    some?: Prisma.UserPermissionsWhereInput;
    none?: Prisma.UserPermissionsWhereInput;
};
export type UserPermissionsOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type UserPermissionsCountOrderByAggregateInput = {
    idUserPermissions?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    allow?: Prisma.SortOrder;
    deteledAt?: Prisma.SortOrder;
};
export type UserPermissionsAvgOrderByAggregateInput = {
    idUserPermissions?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
};
export type UserPermissionsMaxOrderByAggregateInput = {
    idUserPermissions?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    allow?: Prisma.SortOrder;
    deteledAt?: Prisma.SortOrder;
};
export type UserPermissionsMinOrderByAggregateInput = {
    idUserPermissions?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    allow?: Prisma.SortOrder;
    deteledAt?: Prisma.SortOrder;
};
export type UserPermissionsSumOrderByAggregateInput = {
    idUserPermissions?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
};
export type UserPermissionsCreateNestedManyWithoutPermissionsInput = {
    create?: Prisma.XOR<Prisma.UserPermissionsCreateWithoutPermissionsInput, Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.UserPermissionsCreateWithoutPermissionsInput[] | Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.UserPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.UserPermissionsCreateOrConnectWithoutPermissionsInput[];
    createMany?: Prisma.UserPermissionsCreateManyPermissionsInputEnvelope;
    connect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
};
export type UserPermissionsUncheckedCreateNestedManyWithoutPermissionsInput = {
    create?: Prisma.XOR<Prisma.UserPermissionsCreateWithoutPermissionsInput, Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.UserPermissionsCreateWithoutPermissionsInput[] | Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.UserPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.UserPermissionsCreateOrConnectWithoutPermissionsInput[];
    createMany?: Prisma.UserPermissionsCreateManyPermissionsInputEnvelope;
    connect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
};
export type UserPermissionsUpdateManyWithoutPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.UserPermissionsCreateWithoutPermissionsInput, Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.UserPermissionsCreateWithoutPermissionsInput[] | Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.UserPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.UserPermissionsCreateOrConnectWithoutPermissionsInput[];
    upsert?: Prisma.UserPermissionsUpsertWithWhereUniqueWithoutPermissionsInput | Prisma.UserPermissionsUpsertWithWhereUniqueWithoutPermissionsInput[];
    createMany?: Prisma.UserPermissionsCreateManyPermissionsInputEnvelope;
    set?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    disconnect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    delete?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    connect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    update?: Prisma.UserPermissionsUpdateWithWhereUniqueWithoutPermissionsInput | Prisma.UserPermissionsUpdateWithWhereUniqueWithoutPermissionsInput[];
    updateMany?: Prisma.UserPermissionsUpdateManyWithWhereWithoutPermissionsInput | Prisma.UserPermissionsUpdateManyWithWhereWithoutPermissionsInput[];
    deleteMany?: Prisma.UserPermissionsScalarWhereInput | Prisma.UserPermissionsScalarWhereInput[];
};
export type UserPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.UserPermissionsCreateWithoutPermissionsInput, Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.UserPermissionsCreateWithoutPermissionsInput[] | Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.UserPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.UserPermissionsCreateOrConnectWithoutPermissionsInput[];
    upsert?: Prisma.UserPermissionsUpsertWithWhereUniqueWithoutPermissionsInput | Prisma.UserPermissionsUpsertWithWhereUniqueWithoutPermissionsInput[];
    createMany?: Prisma.UserPermissionsCreateManyPermissionsInputEnvelope;
    set?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    disconnect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    delete?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    connect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    update?: Prisma.UserPermissionsUpdateWithWhereUniqueWithoutPermissionsInput | Prisma.UserPermissionsUpdateWithWhereUniqueWithoutPermissionsInput[];
    updateMany?: Prisma.UserPermissionsUpdateManyWithWhereWithoutPermissionsInput | Prisma.UserPermissionsUpdateManyWithWhereWithoutPermissionsInput[];
    deleteMany?: Prisma.UserPermissionsScalarWhereInput | Prisma.UserPermissionsScalarWhereInput[];
};
export type UserPermissionsCreateNestedManyWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.UserPermissionsCreateWithoutUsersInput, Prisma.UserPermissionsUncheckedCreateWithoutUsersInput> | Prisma.UserPermissionsCreateWithoutUsersInput[] | Prisma.UserPermissionsUncheckedCreateWithoutUsersInput[];
    connectOrCreate?: Prisma.UserPermissionsCreateOrConnectWithoutUsersInput | Prisma.UserPermissionsCreateOrConnectWithoutUsersInput[];
    createMany?: Prisma.UserPermissionsCreateManyUsersInputEnvelope;
    connect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
};
export type UserPermissionsUncheckedCreateNestedManyWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.UserPermissionsCreateWithoutUsersInput, Prisma.UserPermissionsUncheckedCreateWithoutUsersInput> | Prisma.UserPermissionsCreateWithoutUsersInput[] | Prisma.UserPermissionsUncheckedCreateWithoutUsersInput[];
    connectOrCreate?: Prisma.UserPermissionsCreateOrConnectWithoutUsersInput | Prisma.UserPermissionsCreateOrConnectWithoutUsersInput[];
    createMany?: Prisma.UserPermissionsCreateManyUsersInputEnvelope;
    connect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
};
export type UserPermissionsUpdateManyWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.UserPermissionsCreateWithoutUsersInput, Prisma.UserPermissionsUncheckedCreateWithoutUsersInput> | Prisma.UserPermissionsCreateWithoutUsersInput[] | Prisma.UserPermissionsUncheckedCreateWithoutUsersInput[];
    connectOrCreate?: Prisma.UserPermissionsCreateOrConnectWithoutUsersInput | Prisma.UserPermissionsCreateOrConnectWithoutUsersInput[];
    upsert?: Prisma.UserPermissionsUpsertWithWhereUniqueWithoutUsersInput | Prisma.UserPermissionsUpsertWithWhereUniqueWithoutUsersInput[];
    createMany?: Prisma.UserPermissionsCreateManyUsersInputEnvelope;
    set?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    disconnect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    delete?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    connect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    update?: Prisma.UserPermissionsUpdateWithWhereUniqueWithoutUsersInput | Prisma.UserPermissionsUpdateWithWhereUniqueWithoutUsersInput[];
    updateMany?: Prisma.UserPermissionsUpdateManyWithWhereWithoutUsersInput | Prisma.UserPermissionsUpdateManyWithWhereWithoutUsersInput[];
    deleteMany?: Prisma.UserPermissionsScalarWhereInput | Prisma.UserPermissionsScalarWhereInput[];
};
export type UserPermissionsUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.UserPermissionsCreateWithoutUsersInput, Prisma.UserPermissionsUncheckedCreateWithoutUsersInput> | Prisma.UserPermissionsCreateWithoutUsersInput[] | Prisma.UserPermissionsUncheckedCreateWithoutUsersInput[];
    connectOrCreate?: Prisma.UserPermissionsCreateOrConnectWithoutUsersInput | Prisma.UserPermissionsCreateOrConnectWithoutUsersInput[];
    upsert?: Prisma.UserPermissionsUpsertWithWhereUniqueWithoutUsersInput | Prisma.UserPermissionsUpsertWithWhereUniqueWithoutUsersInput[];
    createMany?: Prisma.UserPermissionsCreateManyUsersInputEnvelope;
    set?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    disconnect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    delete?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    connect?: Prisma.UserPermissionsWhereUniqueInput | Prisma.UserPermissionsWhereUniqueInput[];
    update?: Prisma.UserPermissionsUpdateWithWhereUniqueWithoutUsersInput | Prisma.UserPermissionsUpdateWithWhereUniqueWithoutUsersInput[];
    updateMany?: Prisma.UserPermissionsUpdateManyWithWhereWithoutUsersInput | Prisma.UserPermissionsUpdateManyWithWhereWithoutUsersInput[];
    deleteMany?: Prisma.UserPermissionsScalarWhereInput | Prisma.UserPermissionsScalarWhereInput[];
};
export type UserPermissionsCreateWithoutPermissionsInput = {
    allow: boolean;
    deteledAt?: Date | string | null;
    users: Prisma.UsersCreateNestedOneWithoutUserPermissionsInput;
};
export type UserPermissionsUncheckedCreateWithoutPermissionsInput = {
    idUserPermissions?: number;
    usersId: number;
    allow: boolean;
    deteledAt?: Date | string | null;
};
export type UserPermissionsCreateOrConnectWithoutPermissionsInput = {
    where: Prisma.UserPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserPermissionsCreateWithoutPermissionsInput, Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput>;
};
export type UserPermissionsCreateManyPermissionsInputEnvelope = {
    data: Prisma.UserPermissionsCreateManyPermissionsInput | Prisma.UserPermissionsCreateManyPermissionsInput[];
    skipDuplicates?: boolean;
};
export type UserPermissionsUpsertWithWhereUniqueWithoutPermissionsInput = {
    where: Prisma.UserPermissionsWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserPermissionsUpdateWithoutPermissionsInput, Prisma.UserPermissionsUncheckedUpdateWithoutPermissionsInput>;
    create: Prisma.XOR<Prisma.UserPermissionsCreateWithoutPermissionsInput, Prisma.UserPermissionsUncheckedCreateWithoutPermissionsInput>;
};
export type UserPermissionsUpdateWithWhereUniqueWithoutPermissionsInput = {
    where: Prisma.UserPermissionsWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserPermissionsUpdateWithoutPermissionsInput, Prisma.UserPermissionsUncheckedUpdateWithoutPermissionsInput>;
};
export type UserPermissionsUpdateManyWithWhereWithoutPermissionsInput = {
    where: Prisma.UserPermissionsScalarWhereInput;
    data: Prisma.XOR<Prisma.UserPermissionsUpdateManyMutationInput, Prisma.UserPermissionsUncheckedUpdateManyWithoutPermissionsInput>;
};
export type UserPermissionsScalarWhereInput = {
    AND?: Prisma.UserPermissionsScalarWhereInput | Prisma.UserPermissionsScalarWhereInput[];
    OR?: Prisma.UserPermissionsScalarWhereInput[];
    NOT?: Prisma.UserPermissionsScalarWhereInput | Prisma.UserPermissionsScalarWhereInput[];
    idUserPermissions?: Prisma.IntFilter<"UserPermissions"> | number;
    usersId?: Prisma.IntFilter<"UserPermissions"> | number;
    permissionsId?: Prisma.IntFilter<"UserPermissions"> | number;
    allow?: Prisma.BoolFilter<"UserPermissions"> | boolean;
    deteledAt?: Prisma.DateTimeNullableFilter<"UserPermissions"> | Date | string | null;
};
export type UserPermissionsCreateWithoutUsersInput = {
    allow: boolean;
    deteledAt?: Date | string | null;
    Permissions: Prisma.PermissionsCreateNestedOneWithoutUserPermissionsInput;
};
export type UserPermissionsUncheckedCreateWithoutUsersInput = {
    idUserPermissions?: number;
    permissionsId: number;
    allow: boolean;
    deteledAt?: Date | string | null;
};
export type UserPermissionsCreateOrConnectWithoutUsersInput = {
    where: Prisma.UserPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserPermissionsCreateWithoutUsersInput, Prisma.UserPermissionsUncheckedCreateWithoutUsersInput>;
};
export type UserPermissionsCreateManyUsersInputEnvelope = {
    data: Prisma.UserPermissionsCreateManyUsersInput | Prisma.UserPermissionsCreateManyUsersInput[];
    skipDuplicates?: boolean;
};
export type UserPermissionsUpsertWithWhereUniqueWithoutUsersInput = {
    where: Prisma.UserPermissionsWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserPermissionsUpdateWithoutUsersInput, Prisma.UserPermissionsUncheckedUpdateWithoutUsersInput>;
    create: Prisma.XOR<Prisma.UserPermissionsCreateWithoutUsersInput, Prisma.UserPermissionsUncheckedCreateWithoutUsersInput>;
};
export type UserPermissionsUpdateWithWhereUniqueWithoutUsersInput = {
    where: Prisma.UserPermissionsWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserPermissionsUpdateWithoutUsersInput, Prisma.UserPermissionsUncheckedUpdateWithoutUsersInput>;
};
export type UserPermissionsUpdateManyWithWhereWithoutUsersInput = {
    where: Prisma.UserPermissionsScalarWhereInput;
    data: Prisma.XOR<Prisma.UserPermissionsUpdateManyMutationInput, Prisma.UserPermissionsUncheckedUpdateManyWithoutUsersInput>;
};
export type UserPermissionsCreateManyPermissionsInput = {
    idUserPermissions?: number;
    usersId: number;
    allow: boolean;
    deteledAt?: Date | string | null;
};
export type UserPermissionsUpdateWithoutPermissionsInput = {
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    users?: Prisma.UsersUpdateOneRequiredWithoutUserPermissionsNestedInput;
};
export type UserPermissionsUncheckedUpdateWithoutPermissionsInput = {
    idUserPermissions?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserPermissionsUncheckedUpdateManyWithoutPermissionsInput = {
    idUserPermissions?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserPermissionsCreateManyUsersInput = {
    idUserPermissions?: number;
    permissionsId: number;
    allow: boolean;
    deteledAt?: Date | string | null;
};
export type UserPermissionsUpdateWithoutUsersInput = {
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    Permissions?: Prisma.PermissionsUpdateOneRequiredWithoutUserPermissionsNestedInput;
};
export type UserPermissionsUncheckedUpdateWithoutUsersInput = {
    idUserPermissions?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserPermissionsUncheckedUpdateManyWithoutUsersInput = {
    idUserPermissions?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    allow?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deteledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserPermissionsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    idUserPermissions?: boolean;
    usersId?: boolean;
    permissionsId?: boolean;
    allow?: boolean;
    deteledAt?: boolean;
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    Permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userPermissions"]>;
export type UserPermissionsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    idUserPermissions?: boolean;
    usersId?: boolean;
    permissionsId?: boolean;
    allow?: boolean;
    deteledAt?: boolean;
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    Permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userPermissions"]>;
export type UserPermissionsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    idUserPermissions?: boolean;
    usersId?: boolean;
    permissionsId?: boolean;
    allow?: boolean;
    deteledAt?: boolean;
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    Permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userPermissions"]>;
export type UserPermissionsSelectScalar = {
    idUserPermissions?: boolean;
    usersId?: boolean;
    permissionsId?: boolean;
    allow?: boolean;
    deteledAt?: boolean;
};
export type UserPermissionsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"idUserPermissions" | "usersId" | "permissionsId" | "allow" | "deteledAt", ExtArgs["result"]["userPermissions"]>;
export type UserPermissionsInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    Permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
};
export type UserPermissionsIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    Permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
};
export type UserPermissionsIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    Permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
};
export type $UserPermissionsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "UserPermissions";
    objects: {
        users: Prisma.$UsersPayload<ExtArgs>;
        Permissions: Prisma.$PermissionsPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        idUserPermissions: number;
        usersId: number;
        permissionsId: number;
        allow: boolean;
        deteledAt: Date | null;
    }, ExtArgs["result"]["userPermissions"]>;
    composites: {};
};
export type UserPermissionsGetPayload<S extends boolean | null | undefined | UserPermissionsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload, S>;
export type UserPermissionsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserPermissionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserPermissionsCountAggregateInputType | true;
};
export interface UserPermissionsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['UserPermissions'];
        meta: {
            name: 'UserPermissions';
        };
    };
    findUnique<T extends UserPermissionsFindUniqueArgs>(args: Prisma.SelectSubset<T, UserPermissionsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserPermissionsClient<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserPermissionsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserPermissionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserPermissionsClient<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserPermissionsFindFirstArgs>(args?: Prisma.SelectSubset<T, UserPermissionsFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserPermissionsClient<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserPermissionsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserPermissionsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserPermissionsClient<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserPermissionsFindManyArgs>(args?: Prisma.SelectSubset<T, UserPermissionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UserPermissionsCreateArgs>(args: Prisma.SelectSubset<T, UserPermissionsCreateArgs<ExtArgs>>): Prisma.Prisma__UserPermissionsClient<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserPermissionsCreateManyArgs>(args?: Prisma.SelectSubset<T, UserPermissionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserPermissionsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserPermissionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UserPermissionsDeleteArgs>(args: Prisma.SelectSubset<T, UserPermissionsDeleteArgs<ExtArgs>>): Prisma.Prisma__UserPermissionsClient<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserPermissionsUpdateArgs>(args: Prisma.SelectSubset<T, UserPermissionsUpdateArgs<ExtArgs>>): Prisma.Prisma__UserPermissionsClient<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserPermissionsDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserPermissionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserPermissionsUpdateManyArgs>(args: Prisma.SelectSubset<T, UserPermissionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserPermissionsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserPermissionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UserPermissionsUpsertArgs>(args: Prisma.SelectSubset<T, UserPermissionsUpsertArgs<ExtArgs>>): Prisma.Prisma__UserPermissionsClient<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserPermissionsCountArgs>(args?: Prisma.Subset<T, UserPermissionsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserPermissionsCountAggregateOutputType> : number>;
    aggregate<T extends UserPermissionsAggregateArgs>(args: Prisma.Subset<T, UserPermissionsAggregateArgs>): Prisma.PrismaPromise<GetUserPermissionsAggregateType<T>>;
    groupBy<T extends UserPermissionsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserPermissionsGroupByArgs['orderBy'];
    } : {
        orderBy?: UserPermissionsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserPermissionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserPermissionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserPermissionsFieldRefs;
}
export interface Prisma__UserPermissionsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    users<T extends Prisma.UsersDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UsersDefaultArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    Permissions<T extends Prisma.PermissionsDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PermissionsDefaultArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserPermissionsFieldRefs {
    readonly idUserPermissions: Prisma.FieldRef<"UserPermissions", 'Int'>;
    readonly usersId: Prisma.FieldRef<"UserPermissions", 'Int'>;
    readonly permissionsId: Prisma.FieldRef<"UserPermissions", 'Int'>;
    readonly allow: Prisma.FieldRef<"UserPermissions", 'Boolean'>;
    readonly deteledAt: Prisma.FieldRef<"UserPermissions", 'DateTime'>;
}
export type UserPermissionsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    where: Prisma.UserPermissionsWhereUniqueInput;
};
export type UserPermissionsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    where: Prisma.UserPermissionsWhereUniqueInput;
};
export type UserPermissionsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    where?: Prisma.UserPermissionsWhereInput;
    orderBy?: Prisma.UserPermissionsOrderByWithRelationInput | Prisma.UserPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.UserPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserPermissionsScalarFieldEnum | Prisma.UserPermissionsScalarFieldEnum[];
};
export type UserPermissionsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    where?: Prisma.UserPermissionsWhereInput;
    orderBy?: Prisma.UserPermissionsOrderByWithRelationInput | Prisma.UserPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.UserPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserPermissionsScalarFieldEnum | Prisma.UserPermissionsScalarFieldEnum[];
};
export type UserPermissionsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    where?: Prisma.UserPermissionsWhereInput;
    orderBy?: Prisma.UserPermissionsOrderByWithRelationInput | Prisma.UserPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.UserPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserPermissionsScalarFieldEnum | Prisma.UserPermissionsScalarFieldEnum[];
};
export type UserPermissionsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserPermissionsCreateInput, Prisma.UserPermissionsUncheckedCreateInput>;
};
export type UserPermissionsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserPermissionsCreateManyInput | Prisma.UserPermissionsCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserPermissionsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    data: Prisma.UserPermissionsCreateManyInput | Prisma.UserPermissionsCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.UserPermissionsIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type UserPermissionsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserPermissionsUpdateInput, Prisma.UserPermissionsUncheckedUpdateInput>;
    where: Prisma.UserPermissionsWhereUniqueInput;
};
export type UserPermissionsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserPermissionsUpdateManyMutationInput, Prisma.UserPermissionsUncheckedUpdateManyInput>;
    where?: Prisma.UserPermissionsWhereInput;
    limit?: number;
};
export type UserPermissionsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserPermissionsUpdateManyMutationInput, Prisma.UserPermissionsUncheckedUpdateManyInput>;
    where?: Prisma.UserPermissionsWhereInput;
    limit?: number;
    include?: Prisma.UserPermissionsIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type UserPermissionsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    where: Prisma.UserPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserPermissionsCreateInput, Prisma.UserPermissionsUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserPermissionsUpdateInput, Prisma.UserPermissionsUncheckedUpdateInput>;
};
export type UserPermissionsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
    where: Prisma.UserPermissionsWhereUniqueInput;
};
export type UserPermissionsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserPermissionsWhereInput;
    limit?: number;
};
export type UserPermissionsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.UserPermissionsOmit<ExtArgs> | null;
    include?: Prisma.UserPermissionsInclude<ExtArgs> | null;
};
export {};
