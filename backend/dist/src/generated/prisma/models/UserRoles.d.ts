import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type UserRolesModel = runtime.Types.Result.DefaultSelection<Prisma.$UserRolesPayload>;
export type AggregateUserRoles = {
    _count: UserRolesCountAggregateOutputType | null;
    _avg: UserRolesAvgAggregateOutputType | null;
    _sum: UserRolesSumAggregateOutputType | null;
    _min: UserRolesMinAggregateOutputType | null;
    _max: UserRolesMaxAggregateOutputType | null;
};
export type UserRolesAvgAggregateOutputType = {
    usersRolesId: number | null;
    usersId: number | null;
    rolesId: number | null;
};
export type UserRolesSumAggregateOutputType = {
    usersRolesId: number | null;
    usersId: number | null;
    rolesId: number | null;
};
export type UserRolesMinAggregateOutputType = {
    usersRolesId: number | null;
    usersId: number | null;
    rolesId: number | null;
    deletedAt: Date | null;
};
export type UserRolesMaxAggregateOutputType = {
    usersRolesId: number | null;
    usersId: number | null;
    rolesId: number | null;
    deletedAt: Date | null;
};
export type UserRolesCountAggregateOutputType = {
    usersRolesId: number;
    usersId: number;
    rolesId: number;
    deletedAt: number;
    _all: number;
};
export type UserRolesAvgAggregateInputType = {
    usersRolesId?: true;
    usersId?: true;
    rolesId?: true;
};
export type UserRolesSumAggregateInputType = {
    usersRolesId?: true;
    usersId?: true;
    rolesId?: true;
};
export type UserRolesMinAggregateInputType = {
    usersRolesId?: true;
    usersId?: true;
    rolesId?: true;
    deletedAt?: true;
};
export type UserRolesMaxAggregateInputType = {
    usersRolesId?: true;
    usersId?: true;
    rolesId?: true;
    deletedAt?: true;
};
export type UserRolesCountAggregateInputType = {
    usersRolesId?: true;
    usersId?: true;
    rolesId?: true;
    deletedAt?: true;
    _all?: true;
};
export type UserRolesAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserRolesWhereInput;
    orderBy?: Prisma.UserRolesOrderByWithRelationInput | Prisma.UserRolesOrderByWithRelationInput[];
    cursor?: Prisma.UserRolesWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserRolesCountAggregateInputType;
    _avg?: UserRolesAvgAggregateInputType;
    _sum?: UserRolesSumAggregateInputType;
    _min?: UserRolesMinAggregateInputType;
    _max?: UserRolesMaxAggregateInputType;
};
export type GetUserRolesAggregateType<T extends UserRolesAggregateArgs> = {
    [P in keyof T & keyof AggregateUserRoles]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUserRoles[P]> : Prisma.GetScalarType<T[P], AggregateUserRoles[P]>;
};
export type UserRolesGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserRolesWhereInput;
    orderBy?: Prisma.UserRolesOrderByWithAggregationInput | Prisma.UserRolesOrderByWithAggregationInput[];
    by: Prisma.UserRolesScalarFieldEnum[] | Prisma.UserRolesScalarFieldEnum;
    having?: Prisma.UserRolesScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserRolesCountAggregateInputType | true;
    _avg?: UserRolesAvgAggregateInputType;
    _sum?: UserRolesSumAggregateInputType;
    _min?: UserRolesMinAggregateInputType;
    _max?: UserRolesMaxAggregateInputType;
};
export type UserRolesGroupByOutputType = {
    usersRolesId: number;
    usersId: number;
    rolesId: number;
    deletedAt: Date | null;
    _count: UserRolesCountAggregateOutputType | null;
    _avg: UserRolesAvgAggregateOutputType | null;
    _sum: UserRolesSumAggregateOutputType | null;
    _min: UserRolesMinAggregateOutputType | null;
    _max: UserRolesMaxAggregateOutputType | null;
};
type GetUserRolesGroupByPayload<T extends UserRolesGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserRolesGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserRolesGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserRolesGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserRolesGroupByOutputType[P]>;
}>>;
export type UserRolesWhereInput = {
    AND?: Prisma.UserRolesWhereInput | Prisma.UserRolesWhereInput[];
    OR?: Prisma.UserRolesWhereInput[];
    NOT?: Prisma.UserRolesWhereInput | Prisma.UserRolesWhereInput[];
    usersRolesId?: Prisma.IntFilter<"UserRoles"> | number;
    usersId?: Prisma.IntFilter<"UserRoles"> | number;
    rolesId?: Prisma.IntFilter<"UserRoles"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"UserRoles"> | Date | string | null;
    user?: Prisma.XOR<Prisma.UsersScalarRelationFilter, Prisma.UsersWhereInput>;
    roles?: Prisma.XOR<Prisma.RolesScalarRelationFilter, Prisma.RolesWhereInput>;
};
export type UserRolesOrderByWithRelationInput = {
    usersRolesId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    user?: Prisma.UsersOrderByWithRelationInput;
    roles?: Prisma.RolesOrderByWithRelationInput;
};
export type UserRolesWhereUniqueInput = Prisma.AtLeast<{
    usersRolesId?: number;
    AND?: Prisma.UserRolesWhereInput | Prisma.UserRolesWhereInput[];
    OR?: Prisma.UserRolesWhereInput[];
    NOT?: Prisma.UserRolesWhereInput | Prisma.UserRolesWhereInput[];
    usersId?: Prisma.IntFilter<"UserRoles"> | number;
    rolesId?: Prisma.IntFilter<"UserRoles"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"UserRoles"> | Date | string | null;
    user?: Prisma.XOR<Prisma.UsersScalarRelationFilter, Prisma.UsersWhereInput>;
    roles?: Prisma.XOR<Prisma.RolesScalarRelationFilter, Prisma.RolesWhereInput>;
}, "usersRolesId">;
export type UserRolesOrderByWithAggregationInput = {
    usersRolesId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.UserRolesCountOrderByAggregateInput;
    _avg?: Prisma.UserRolesAvgOrderByAggregateInput;
    _max?: Prisma.UserRolesMaxOrderByAggregateInput;
    _min?: Prisma.UserRolesMinOrderByAggregateInput;
    _sum?: Prisma.UserRolesSumOrderByAggregateInput;
};
export type UserRolesScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserRolesScalarWhereWithAggregatesInput | Prisma.UserRolesScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserRolesScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserRolesScalarWhereWithAggregatesInput | Prisma.UserRolesScalarWhereWithAggregatesInput[];
    usersRolesId?: Prisma.IntWithAggregatesFilter<"UserRoles"> | number;
    usersId?: Prisma.IntWithAggregatesFilter<"UserRoles"> | number;
    rolesId?: Prisma.IntWithAggregatesFilter<"UserRoles"> | number;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"UserRoles"> | Date | string | null;
};
export type UserRolesCreateInput = {
    deletedAt?: Date | string | null;
    user: Prisma.UsersCreateNestedOneWithoutUserRolesInput;
    roles: Prisma.RolesCreateNestedOneWithoutUserRolesInput;
};
export type UserRolesUncheckedCreateInput = {
    usersRolesId?: number;
    usersId: number;
    rolesId: number;
    deletedAt?: Date | string | null;
};
export type UserRolesUpdateInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    user?: Prisma.UsersUpdateOneRequiredWithoutUserRolesNestedInput;
    roles?: Prisma.RolesUpdateOneRequiredWithoutUserRolesNestedInput;
};
export type UserRolesUncheckedUpdateInput = {
    usersRolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserRolesCreateManyInput = {
    usersRolesId?: number;
    usersId: number;
    rolesId: number;
    deletedAt?: Date | string | null;
};
export type UserRolesUpdateManyMutationInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserRolesUncheckedUpdateManyInput = {
    usersRolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserRolesListRelationFilter = {
    every?: Prisma.UserRolesWhereInput;
    some?: Prisma.UserRolesWhereInput;
    none?: Prisma.UserRolesWhereInput;
};
export type UserRolesOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type UserRolesCountOrderByAggregateInput = {
    usersRolesId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type UserRolesAvgOrderByAggregateInput = {
    usersRolesId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
};
export type UserRolesMaxOrderByAggregateInput = {
    usersRolesId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type UserRolesMinOrderByAggregateInput = {
    usersRolesId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type UserRolesSumOrderByAggregateInput = {
    usersRolesId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    rolesId?: Prisma.SortOrder;
};
export type UserRolesCreateNestedManyWithoutRolesInput = {
    create?: Prisma.XOR<Prisma.UserRolesCreateWithoutRolesInput, Prisma.UserRolesUncheckedCreateWithoutRolesInput> | Prisma.UserRolesCreateWithoutRolesInput[] | Prisma.UserRolesUncheckedCreateWithoutRolesInput[];
    connectOrCreate?: Prisma.UserRolesCreateOrConnectWithoutRolesInput | Prisma.UserRolesCreateOrConnectWithoutRolesInput[];
    createMany?: Prisma.UserRolesCreateManyRolesInputEnvelope;
    connect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
};
export type UserRolesUncheckedCreateNestedManyWithoutRolesInput = {
    create?: Prisma.XOR<Prisma.UserRolesCreateWithoutRolesInput, Prisma.UserRolesUncheckedCreateWithoutRolesInput> | Prisma.UserRolesCreateWithoutRolesInput[] | Prisma.UserRolesUncheckedCreateWithoutRolesInput[];
    connectOrCreate?: Prisma.UserRolesCreateOrConnectWithoutRolesInput | Prisma.UserRolesCreateOrConnectWithoutRolesInput[];
    createMany?: Prisma.UserRolesCreateManyRolesInputEnvelope;
    connect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
};
export type UserRolesUpdateManyWithoutRolesNestedInput = {
    create?: Prisma.XOR<Prisma.UserRolesCreateWithoutRolesInput, Prisma.UserRolesUncheckedCreateWithoutRolesInput> | Prisma.UserRolesCreateWithoutRolesInput[] | Prisma.UserRolesUncheckedCreateWithoutRolesInput[];
    connectOrCreate?: Prisma.UserRolesCreateOrConnectWithoutRolesInput | Prisma.UserRolesCreateOrConnectWithoutRolesInput[];
    upsert?: Prisma.UserRolesUpsertWithWhereUniqueWithoutRolesInput | Prisma.UserRolesUpsertWithWhereUniqueWithoutRolesInput[];
    createMany?: Prisma.UserRolesCreateManyRolesInputEnvelope;
    set?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    disconnect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    delete?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    connect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    update?: Prisma.UserRolesUpdateWithWhereUniqueWithoutRolesInput | Prisma.UserRolesUpdateWithWhereUniqueWithoutRolesInput[];
    updateMany?: Prisma.UserRolesUpdateManyWithWhereWithoutRolesInput | Prisma.UserRolesUpdateManyWithWhereWithoutRolesInput[];
    deleteMany?: Prisma.UserRolesScalarWhereInput | Prisma.UserRolesScalarWhereInput[];
};
export type UserRolesUncheckedUpdateManyWithoutRolesNestedInput = {
    create?: Prisma.XOR<Prisma.UserRolesCreateWithoutRolesInput, Prisma.UserRolesUncheckedCreateWithoutRolesInput> | Prisma.UserRolesCreateWithoutRolesInput[] | Prisma.UserRolesUncheckedCreateWithoutRolesInput[];
    connectOrCreate?: Prisma.UserRolesCreateOrConnectWithoutRolesInput | Prisma.UserRolesCreateOrConnectWithoutRolesInput[];
    upsert?: Prisma.UserRolesUpsertWithWhereUniqueWithoutRolesInput | Prisma.UserRolesUpsertWithWhereUniqueWithoutRolesInput[];
    createMany?: Prisma.UserRolesCreateManyRolesInputEnvelope;
    set?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    disconnect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    delete?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    connect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    update?: Prisma.UserRolesUpdateWithWhereUniqueWithoutRolesInput | Prisma.UserRolesUpdateWithWhereUniqueWithoutRolesInput[];
    updateMany?: Prisma.UserRolesUpdateManyWithWhereWithoutRolesInput | Prisma.UserRolesUpdateManyWithWhereWithoutRolesInput[];
    deleteMany?: Prisma.UserRolesScalarWhereInput | Prisma.UserRolesScalarWhereInput[];
};
export type UserRolesCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserRolesCreateWithoutUserInput, Prisma.UserRolesUncheckedCreateWithoutUserInput> | Prisma.UserRolesCreateWithoutUserInput[] | Prisma.UserRolesUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserRolesCreateOrConnectWithoutUserInput | Prisma.UserRolesCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.UserRolesCreateManyUserInputEnvelope;
    connect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
};
export type UserRolesUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserRolesCreateWithoutUserInput, Prisma.UserRolesUncheckedCreateWithoutUserInput> | Prisma.UserRolesCreateWithoutUserInput[] | Prisma.UserRolesUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserRolesCreateOrConnectWithoutUserInput | Prisma.UserRolesCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.UserRolesCreateManyUserInputEnvelope;
    connect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
};
export type UserRolesUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserRolesCreateWithoutUserInput, Prisma.UserRolesUncheckedCreateWithoutUserInput> | Prisma.UserRolesCreateWithoutUserInput[] | Prisma.UserRolesUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserRolesCreateOrConnectWithoutUserInput | Prisma.UserRolesCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.UserRolesUpsertWithWhereUniqueWithoutUserInput | Prisma.UserRolesUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.UserRolesCreateManyUserInputEnvelope;
    set?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    disconnect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    delete?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    connect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    update?: Prisma.UserRolesUpdateWithWhereUniqueWithoutUserInput | Prisma.UserRolesUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.UserRolesUpdateManyWithWhereWithoutUserInput | Prisma.UserRolesUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.UserRolesScalarWhereInput | Prisma.UserRolesScalarWhereInput[];
};
export type UserRolesUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserRolesCreateWithoutUserInput, Prisma.UserRolesUncheckedCreateWithoutUserInput> | Prisma.UserRolesCreateWithoutUserInput[] | Prisma.UserRolesUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserRolesCreateOrConnectWithoutUserInput | Prisma.UserRolesCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.UserRolesUpsertWithWhereUniqueWithoutUserInput | Prisma.UserRolesUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.UserRolesCreateManyUserInputEnvelope;
    set?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    disconnect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    delete?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    connect?: Prisma.UserRolesWhereUniqueInput | Prisma.UserRolesWhereUniqueInput[];
    update?: Prisma.UserRolesUpdateWithWhereUniqueWithoutUserInput | Prisma.UserRolesUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.UserRolesUpdateManyWithWhereWithoutUserInput | Prisma.UserRolesUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.UserRolesScalarWhereInput | Prisma.UserRolesScalarWhereInput[];
};
export type UserRolesCreateWithoutRolesInput = {
    deletedAt?: Date | string | null;
    user: Prisma.UsersCreateNestedOneWithoutUserRolesInput;
};
export type UserRolesUncheckedCreateWithoutRolesInput = {
    usersRolesId?: number;
    usersId: number;
    deletedAt?: Date | string | null;
};
export type UserRolesCreateOrConnectWithoutRolesInput = {
    where: Prisma.UserRolesWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserRolesCreateWithoutRolesInput, Prisma.UserRolesUncheckedCreateWithoutRolesInput>;
};
export type UserRolesCreateManyRolesInputEnvelope = {
    data: Prisma.UserRolesCreateManyRolesInput | Prisma.UserRolesCreateManyRolesInput[];
    skipDuplicates?: boolean;
};
export type UserRolesUpsertWithWhereUniqueWithoutRolesInput = {
    where: Prisma.UserRolesWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserRolesUpdateWithoutRolesInput, Prisma.UserRolesUncheckedUpdateWithoutRolesInput>;
    create: Prisma.XOR<Prisma.UserRolesCreateWithoutRolesInput, Prisma.UserRolesUncheckedCreateWithoutRolesInput>;
};
export type UserRolesUpdateWithWhereUniqueWithoutRolesInput = {
    where: Prisma.UserRolesWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserRolesUpdateWithoutRolesInput, Prisma.UserRolesUncheckedUpdateWithoutRolesInput>;
};
export type UserRolesUpdateManyWithWhereWithoutRolesInput = {
    where: Prisma.UserRolesScalarWhereInput;
    data: Prisma.XOR<Prisma.UserRolesUpdateManyMutationInput, Prisma.UserRolesUncheckedUpdateManyWithoutRolesInput>;
};
export type UserRolesScalarWhereInput = {
    AND?: Prisma.UserRolesScalarWhereInput | Prisma.UserRolesScalarWhereInput[];
    OR?: Prisma.UserRolesScalarWhereInput[];
    NOT?: Prisma.UserRolesScalarWhereInput | Prisma.UserRolesScalarWhereInput[];
    usersRolesId?: Prisma.IntFilter<"UserRoles"> | number;
    usersId?: Prisma.IntFilter<"UserRoles"> | number;
    rolesId?: Prisma.IntFilter<"UserRoles"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"UserRoles"> | Date | string | null;
};
export type UserRolesCreateWithoutUserInput = {
    deletedAt?: Date | string | null;
    roles: Prisma.RolesCreateNestedOneWithoutUserRolesInput;
};
export type UserRolesUncheckedCreateWithoutUserInput = {
    usersRolesId?: number;
    rolesId: number;
    deletedAt?: Date | string | null;
};
export type UserRolesCreateOrConnectWithoutUserInput = {
    where: Prisma.UserRolesWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserRolesCreateWithoutUserInput, Prisma.UserRolesUncheckedCreateWithoutUserInput>;
};
export type UserRolesCreateManyUserInputEnvelope = {
    data: Prisma.UserRolesCreateManyUserInput | Prisma.UserRolesCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type UserRolesUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.UserRolesWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserRolesUpdateWithoutUserInput, Prisma.UserRolesUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.UserRolesCreateWithoutUserInput, Prisma.UserRolesUncheckedCreateWithoutUserInput>;
};
export type UserRolesUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.UserRolesWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserRolesUpdateWithoutUserInput, Prisma.UserRolesUncheckedUpdateWithoutUserInput>;
};
export type UserRolesUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.UserRolesScalarWhereInput;
    data: Prisma.XOR<Prisma.UserRolesUpdateManyMutationInput, Prisma.UserRolesUncheckedUpdateManyWithoutUserInput>;
};
export type UserRolesCreateManyRolesInput = {
    usersRolesId?: number;
    usersId: number;
    deletedAt?: Date | string | null;
};
export type UserRolesUpdateWithoutRolesInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    user?: Prisma.UsersUpdateOneRequiredWithoutUserRolesNestedInput;
};
export type UserRolesUncheckedUpdateWithoutRolesInput = {
    usersRolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserRolesUncheckedUpdateManyWithoutRolesInput = {
    usersRolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserRolesCreateManyUserInput = {
    usersRolesId?: number;
    rolesId: number;
    deletedAt?: Date | string | null;
};
export type UserRolesUpdateWithoutUserInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    roles?: Prisma.RolesUpdateOneRequiredWithoutUserRolesNestedInput;
};
export type UserRolesUncheckedUpdateWithoutUserInput = {
    usersRolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserRolesUncheckedUpdateManyWithoutUserInput = {
    usersRolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserRolesSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    usersRolesId?: boolean;
    usersId?: boolean;
    rolesId?: boolean;
    deletedAt?: boolean;
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userRoles"]>;
export type UserRolesSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    usersRolesId?: boolean;
    usersId?: boolean;
    rolesId?: boolean;
    deletedAt?: boolean;
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userRoles"]>;
export type UserRolesSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    usersRolesId?: boolean;
    usersId?: boolean;
    rolesId?: boolean;
    deletedAt?: boolean;
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userRoles"]>;
export type UserRolesSelectScalar = {
    usersRolesId?: boolean;
    usersId?: boolean;
    rolesId?: boolean;
    deletedAt?: boolean;
};
export type UserRolesOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"usersRolesId" | "usersId" | "rolesId" | "deletedAt", ExtArgs["result"]["userRoles"]>;
export type UserRolesInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
};
export type UserRolesIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
};
export type UserRolesIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
    roles?: boolean | Prisma.RolesDefaultArgs<ExtArgs>;
};
export type $UserRolesPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "UserRoles";
    objects: {
        user: Prisma.$UsersPayload<ExtArgs>;
        roles: Prisma.$RolesPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        usersRolesId: number;
        usersId: number;
        rolesId: number;
        deletedAt: Date | null;
    }, ExtArgs["result"]["userRoles"]>;
    composites: {};
};
export type UserRolesGetPayload<S extends boolean | null | undefined | UserRolesDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserRolesPayload, S>;
export type UserRolesCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserRolesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserRolesCountAggregateInputType | true;
};
export interface UserRolesDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['UserRoles'];
        meta: {
            name: 'UserRoles';
        };
    };
    findUnique<T extends UserRolesFindUniqueArgs>(args: Prisma.SelectSubset<T, UserRolesFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserRolesClient<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserRolesFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserRolesFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserRolesClient<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserRolesFindFirstArgs>(args?: Prisma.SelectSubset<T, UserRolesFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserRolesClient<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserRolesFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserRolesFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserRolesClient<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserRolesFindManyArgs>(args?: Prisma.SelectSubset<T, UserRolesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UserRolesCreateArgs>(args: Prisma.SelectSubset<T, UserRolesCreateArgs<ExtArgs>>): Prisma.Prisma__UserRolesClient<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserRolesCreateManyArgs>(args?: Prisma.SelectSubset<T, UserRolesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserRolesCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserRolesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UserRolesDeleteArgs>(args: Prisma.SelectSubset<T, UserRolesDeleteArgs<ExtArgs>>): Prisma.Prisma__UserRolesClient<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserRolesUpdateArgs>(args: Prisma.SelectSubset<T, UserRolesUpdateArgs<ExtArgs>>): Prisma.Prisma__UserRolesClient<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserRolesDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserRolesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserRolesUpdateManyArgs>(args: Prisma.SelectSubset<T, UserRolesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserRolesUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserRolesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UserRolesUpsertArgs>(args: Prisma.SelectSubset<T, UserRolesUpsertArgs<ExtArgs>>): Prisma.Prisma__UserRolesClient<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserRolesCountArgs>(args?: Prisma.Subset<T, UserRolesCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserRolesCountAggregateOutputType> : number>;
    aggregate<T extends UserRolesAggregateArgs>(args: Prisma.Subset<T, UserRolesAggregateArgs>): Prisma.PrismaPromise<GetUserRolesAggregateType<T>>;
    groupBy<T extends UserRolesGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserRolesGroupByArgs['orderBy'];
    } : {
        orderBy?: UserRolesGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserRolesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserRolesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserRolesFieldRefs;
}
export interface Prisma__UserRolesClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UsersDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UsersDefaultArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    roles<T extends Prisma.RolesDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RolesDefaultArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserRolesFieldRefs {
    readonly usersRolesId: Prisma.FieldRef<"UserRoles", 'Int'>;
    readonly usersId: Prisma.FieldRef<"UserRoles", 'Int'>;
    readonly rolesId: Prisma.FieldRef<"UserRoles", 'Int'>;
    readonly deletedAt: Prisma.FieldRef<"UserRoles", 'DateTime'>;
}
export type UserRolesFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    where: Prisma.UserRolesWhereUniqueInput;
};
export type UserRolesFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    where: Prisma.UserRolesWhereUniqueInput;
};
export type UserRolesFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    where?: Prisma.UserRolesWhereInput;
    orderBy?: Prisma.UserRolesOrderByWithRelationInput | Prisma.UserRolesOrderByWithRelationInput[];
    cursor?: Prisma.UserRolesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserRolesScalarFieldEnum | Prisma.UserRolesScalarFieldEnum[];
};
export type UserRolesFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    where?: Prisma.UserRolesWhereInput;
    orderBy?: Prisma.UserRolesOrderByWithRelationInput | Prisma.UserRolesOrderByWithRelationInput[];
    cursor?: Prisma.UserRolesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserRolesScalarFieldEnum | Prisma.UserRolesScalarFieldEnum[];
};
export type UserRolesFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    where?: Prisma.UserRolesWhereInput;
    orderBy?: Prisma.UserRolesOrderByWithRelationInput | Prisma.UserRolesOrderByWithRelationInput[];
    cursor?: Prisma.UserRolesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserRolesScalarFieldEnum | Prisma.UserRolesScalarFieldEnum[];
};
export type UserRolesCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserRolesCreateInput, Prisma.UserRolesUncheckedCreateInput>;
};
export type UserRolesCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserRolesCreateManyInput | Prisma.UserRolesCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserRolesCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    data: Prisma.UserRolesCreateManyInput | Prisma.UserRolesCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.UserRolesIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type UserRolesUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserRolesUpdateInput, Prisma.UserRolesUncheckedUpdateInput>;
    where: Prisma.UserRolesWhereUniqueInput;
};
export type UserRolesUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserRolesUpdateManyMutationInput, Prisma.UserRolesUncheckedUpdateManyInput>;
    where?: Prisma.UserRolesWhereInput;
    limit?: number;
};
export type UserRolesUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserRolesUpdateManyMutationInput, Prisma.UserRolesUncheckedUpdateManyInput>;
    where?: Prisma.UserRolesWhereInput;
    limit?: number;
    include?: Prisma.UserRolesIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type UserRolesUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    where: Prisma.UserRolesWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserRolesCreateInput, Prisma.UserRolesUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserRolesUpdateInput, Prisma.UserRolesUncheckedUpdateInput>;
};
export type UserRolesDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
    where: Prisma.UserRolesWhereUniqueInput;
};
export type UserRolesDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserRolesWhereInput;
    limit?: number;
};
export type UserRolesDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserRolesSelect<ExtArgs> | null;
    omit?: Prisma.UserRolesOmit<ExtArgs> | null;
    include?: Prisma.UserRolesInclude<ExtArgs> | null;
};
export {};
