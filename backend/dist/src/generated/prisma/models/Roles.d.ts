import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RolesModel = runtime.Types.Result.DefaultSelection<Prisma.$RolesPayload>;
export type AggregateRoles = {
    _count: RolesCountAggregateOutputType | null;
    _avg: RolesAvgAggregateOutputType | null;
    _sum: RolesSumAggregateOutputType | null;
    _min: RolesMinAggregateOutputType | null;
    _max: RolesMaxAggregateOutputType | null;
};
export type RolesAvgAggregateOutputType = {
    rolesId: number | null;
};
export type RolesSumAggregateOutputType = {
    rolesId: number | null;
};
export type RolesMinAggregateOutputType = {
    rolesId: number | null;
    name: string | null;
    deletedAt: Date | null;
};
export type RolesMaxAggregateOutputType = {
    rolesId: number | null;
    name: string | null;
    deletedAt: Date | null;
};
export type RolesCountAggregateOutputType = {
    rolesId: number;
    name: number;
    deletedAt: number;
    _all: number;
};
export type RolesAvgAggregateInputType = {
    rolesId?: true;
};
export type RolesSumAggregateInputType = {
    rolesId?: true;
};
export type RolesMinAggregateInputType = {
    rolesId?: true;
    name?: true;
    deletedAt?: true;
};
export type RolesMaxAggregateInputType = {
    rolesId?: true;
    name?: true;
    deletedAt?: true;
};
export type RolesCountAggregateInputType = {
    rolesId?: true;
    name?: true;
    deletedAt?: true;
    _all?: true;
};
export type RolesAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolesWhereInput;
    orderBy?: Prisma.RolesOrderByWithRelationInput | Prisma.RolesOrderByWithRelationInput[];
    cursor?: Prisma.RolesWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RolesCountAggregateInputType;
    _avg?: RolesAvgAggregateInputType;
    _sum?: RolesSumAggregateInputType;
    _min?: RolesMinAggregateInputType;
    _max?: RolesMaxAggregateInputType;
};
export type GetRolesAggregateType<T extends RolesAggregateArgs> = {
    [P in keyof T & keyof AggregateRoles]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRoles[P]> : Prisma.GetScalarType<T[P], AggregateRoles[P]>;
};
export type RolesGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolesWhereInput;
    orderBy?: Prisma.RolesOrderByWithAggregationInput | Prisma.RolesOrderByWithAggregationInput[];
    by: Prisma.RolesScalarFieldEnum[] | Prisma.RolesScalarFieldEnum;
    having?: Prisma.RolesScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RolesCountAggregateInputType | true;
    _avg?: RolesAvgAggregateInputType;
    _sum?: RolesSumAggregateInputType;
    _min?: RolesMinAggregateInputType;
    _max?: RolesMaxAggregateInputType;
};
export type RolesGroupByOutputType = {
    rolesId: number;
    name: string;
    deletedAt: Date | null;
    _count: RolesCountAggregateOutputType | null;
    _avg: RolesAvgAggregateOutputType | null;
    _sum: RolesSumAggregateOutputType | null;
    _min: RolesMinAggregateOutputType | null;
    _max: RolesMaxAggregateOutputType | null;
};
type GetRolesGroupByPayload<T extends RolesGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RolesGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RolesGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RolesGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RolesGroupByOutputType[P]>;
}>>;
export type RolesWhereInput = {
    AND?: Prisma.RolesWhereInput | Prisma.RolesWhereInput[];
    OR?: Prisma.RolesWhereInput[];
    NOT?: Prisma.RolesWhereInput | Prisma.RolesWhereInput[];
    rolesId?: Prisma.IntFilter<"Roles"> | number;
    name?: Prisma.StringFilter<"Roles"> | string;
    deletedAt?: Prisma.DateTimeNullableFilter<"Roles"> | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsListRelationFilter;
    users?: Prisma.UsersListRelationFilter;
    parentRoleLinks?: Prisma.RolesHeredadosListRelationFilter;
    childRoleLinks?: Prisma.RolesHeredadosListRelationFilter;
};
export type RolesOrderByWithRelationInput = {
    rolesId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    rolPermissions?: Prisma.RolPermissionsOrderByRelationAggregateInput;
    users?: Prisma.UsersOrderByRelationAggregateInput;
    parentRoleLinks?: Prisma.RolesHeredadosOrderByRelationAggregateInput;
    childRoleLinks?: Prisma.RolesHeredadosOrderByRelationAggregateInput;
};
export type RolesWhereUniqueInput = Prisma.AtLeast<{
    rolesId?: number;
    name?: string;
    AND?: Prisma.RolesWhereInput | Prisma.RolesWhereInput[];
    OR?: Prisma.RolesWhereInput[];
    NOT?: Prisma.RolesWhereInput | Prisma.RolesWhereInput[];
    deletedAt?: Prisma.DateTimeNullableFilter<"Roles"> | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsListRelationFilter;
    users?: Prisma.UsersListRelationFilter;
    parentRoleLinks?: Prisma.RolesHeredadosListRelationFilter;
    childRoleLinks?: Prisma.RolesHeredadosListRelationFilter;
}, "rolesId" | "name">;
export type RolesOrderByWithAggregationInput = {
    rolesId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.RolesCountOrderByAggregateInput;
    _avg?: Prisma.RolesAvgOrderByAggregateInput;
    _max?: Prisma.RolesMaxOrderByAggregateInput;
    _min?: Prisma.RolesMinOrderByAggregateInput;
    _sum?: Prisma.RolesSumOrderByAggregateInput;
};
export type RolesScalarWhereWithAggregatesInput = {
    AND?: Prisma.RolesScalarWhereWithAggregatesInput | Prisma.RolesScalarWhereWithAggregatesInput[];
    OR?: Prisma.RolesScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RolesScalarWhereWithAggregatesInput | Prisma.RolesScalarWhereWithAggregatesInput[];
    rolesId?: Prisma.IntWithAggregatesFilter<"Roles"> | number;
    name?: Prisma.StringWithAggregatesFilter<"Roles"> | string;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Roles"> | Date | string | null;
};
export type RolesCreateInput = {
    name: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsCreateNestedManyWithoutRolesInput;
    users?: Prisma.UsersCreateNestedManyWithoutRoleInput;
    parentRoleLinks?: Prisma.RolesHeredadosCreateNestedManyWithoutParentRoleInput;
    childRoleLinks?: Prisma.RolesHeredadosCreateNestedManyWithoutChildRoleInput;
};
export type RolesUncheckedCreateInput = {
    rolesId?: number;
    name: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedCreateNestedManyWithoutRolesInput;
    users?: Prisma.UsersUncheckedCreateNestedManyWithoutRoleInput;
    parentRoleLinks?: Prisma.RolesHeredadosUncheckedCreateNestedManyWithoutParentRoleInput;
    childRoleLinks?: Prisma.RolesHeredadosUncheckedCreateNestedManyWithoutChildRoleInput;
};
export type RolesUpdateInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUpdateManyWithoutRolesNestedInput;
    users?: Prisma.UsersUpdateManyWithoutRoleNestedInput;
    parentRoleLinks?: Prisma.RolesHeredadosUpdateManyWithoutParentRoleNestedInput;
    childRoleLinks?: Prisma.RolesHeredadosUpdateManyWithoutChildRoleNestedInput;
};
export type RolesUncheckedUpdateInput = {
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedUpdateManyWithoutRolesNestedInput;
    users?: Prisma.UsersUncheckedUpdateManyWithoutRoleNestedInput;
    parentRoleLinks?: Prisma.RolesHeredadosUncheckedUpdateManyWithoutParentRoleNestedInput;
    childRoleLinks?: Prisma.RolesHeredadosUncheckedUpdateManyWithoutChildRoleNestedInput;
};
export type RolesCreateManyInput = {
    rolesId?: number;
    name: string;
    deletedAt?: Date | string | null;
};
export type RolesUpdateManyMutationInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolesUncheckedUpdateManyInput = {
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RolesScalarRelationFilter = {
    is?: Prisma.RolesWhereInput;
    isNot?: Prisma.RolesWhereInput;
};
export type RolesCountOrderByAggregateInput = {
    rolesId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RolesAvgOrderByAggregateInput = {
    rolesId?: Prisma.SortOrder;
};
export type RolesMaxOrderByAggregateInput = {
    rolesId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RolesMinOrderByAggregateInput = {
    rolesId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RolesSumOrderByAggregateInput = {
    rolesId?: Prisma.SortOrder;
};
export type RolesNullableScalarRelationFilter = {
    is?: Prisma.RolesWhereInput | null;
    isNot?: Prisma.RolesWhereInput | null;
};
export type RolesCreateNestedOneWithoutRolPermissionsInput = {
    create?: Prisma.XOR<Prisma.RolesCreateWithoutRolPermissionsInput, Prisma.RolesUncheckedCreateWithoutRolPermissionsInput>;
    connectOrCreate?: Prisma.RolesCreateOrConnectWithoutRolPermissionsInput;
    connect?: Prisma.RolesWhereUniqueInput;
};
export type RolesUpdateOneRequiredWithoutRolPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.RolesCreateWithoutRolPermissionsInput, Prisma.RolesUncheckedCreateWithoutRolPermissionsInput>;
    connectOrCreate?: Prisma.RolesCreateOrConnectWithoutRolPermissionsInput;
    upsert?: Prisma.RolesUpsertWithoutRolPermissionsInput;
    connect?: Prisma.RolesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RolesUpdateToOneWithWhereWithoutRolPermissionsInput, Prisma.RolesUpdateWithoutRolPermissionsInput>, Prisma.RolesUncheckedUpdateWithoutRolPermissionsInput>;
};
export type RolesCreateNestedOneWithoutParentRoleLinksInput = {
    create?: Prisma.XOR<Prisma.RolesCreateWithoutParentRoleLinksInput, Prisma.RolesUncheckedCreateWithoutParentRoleLinksInput>;
    connectOrCreate?: Prisma.RolesCreateOrConnectWithoutParentRoleLinksInput;
    connect?: Prisma.RolesWhereUniqueInput;
};
export type RolesCreateNestedOneWithoutChildRoleLinksInput = {
    create?: Prisma.XOR<Prisma.RolesCreateWithoutChildRoleLinksInput, Prisma.RolesUncheckedCreateWithoutChildRoleLinksInput>;
    connectOrCreate?: Prisma.RolesCreateOrConnectWithoutChildRoleLinksInput;
    connect?: Prisma.RolesWhereUniqueInput;
};
export type RolesUpdateOneRequiredWithoutParentRoleLinksNestedInput = {
    create?: Prisma.XOR<Prisma.RolesCreateWithoutParentRoleLinksInput, Prisma.RolesUncheckedCreateWithoutParentRoleLinksInput>;
    connectOrCreate?: Prisma.RolesCreateOrConnectWithoutParentRoleLinksInput;
    upsert?: Prisma.RolesUpsertWithoutParentRoleLinksInput;
    connect?: Prisma.RolesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RolesUpdateToOneWithWhereWithoutParentRoleLinksInput, Prisma.RolesUpdateWithoutParentRoleLinksInput>, Prisma.RolesUncheckedUpdateWithoutParentRoleLinksInput>;
};
export type RolesUpdateOneRequiredWithoutChildRoleLinksNestedInput = {
    create?: Prisma.XOR<Prisma.RolesCreateWithoutChildRoleLinksInput, Prisma.RolesUncheckedCreateWithoutChildRoleLinksInput>;
    connectOrCreate?: Prisma.RolesCreateOrConnectWithoutChildRoleLinksInput;
    upsert?: Prisma.RolesUpsertWithoutChildRoleLinksInput;
    connect?: Prisma.RolesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RolesUpdateToOneWithWhereWithoutChildRoleLinksInput, Prisma.RolesUpdateWithoutChildRoleLinksInput>, Prisma.RolesUncheckedUpdateWithoutChildRoleLinksInput>;
};
export type RolesCreateNestedOneWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.RolesCreateWithoutUsersInput, Prisma.RolesUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.RolesCreateOrConnectWithoutUsersInput;
    connect?: Prisma.RolesWhereUniqueInput;
};
export type RolesUpdateOneWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.RolesCreateWithoutUsersInput, Prisma.RolesUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.RolesCreateOrConnectWithoutUsersInput;
    upsert?: Prisma.RolesUpsertWithoutUsersInput;
    disconnect?: Prisma.RolesWhereInput | boolean;
    delete?: Prisma.RolesWhereInput | boolean;
    connect?: Prisma.RolesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RolesUpdateToOneWithWhereWithoutUsersInput, Prisma.RolesUpdateWithoutUsersInput>, Prisma.RolesUncheckedUpdateWithoutUsersInput>;
};
export type RolesCreateWithoutRolPermissionsInput = {
    name: string;
    deletedAt?: Date | string | null;
    users?: Prisma.UsersCreateNestedManyWithoutRoleInput;
    parentRoleLinks?: Prisma.RolesHeredadosCreateNestedManyWithoutParentRoleInput;
    childRoleLinks?: Prisma.RolesHeredadosCreateNestedManyWithoutChildRoleInput;
};
export type RolesUncheckedCreateWithoutRolPermissionsInput = {
    rolesId?: number;
    name: string;
    deletedAt?: Date | string | null;
    users?: Prisma.UsersUncheckedCreateNestedManyWithoutRoleInput;
    parentRoleLinks?: Prisma.RolesHeredadosUncheckedCreateNestedManyWithoutParentRoleInput;
    childRoleLinks?: Prisma.RolesHeredadosUncheckedCreateNestedManyWithoutChildRoleInput;
};
export type RolesCreateOrConnectWithoutRolPermissionsInput = {
    where: Prisma.RolesWhereUniqueInput;
    create: Prisma.XOR<Prisma.RolesCreateWithoutRolPermissionsInput, Prisma.RolesUncheckedCreateWithoutRolPermissionsInput>;
};
export type RolesUpsertWithoutRolPermissionsInput = {
    update: Prisma.XOR<Prisma.RolesUpdateWithoutRolPermissionsInput, Prisma.RolesUncheckedUpdateWithoutRolPermissionsInput>;
    create: Prisma.XOR<Prisma.RolesCreateWithoutRolPermissionsInput, Prisma.RolesUncheckedCreateWithoutRolPermissionsInput>;
    where?: Prisma.RolesWhereInput;
};
export type RolesUpdateToOneWithWhereWithoutRolPermissionsInput = {
    where?: Prisma.RolesWhereInput;
    data: Prisma.XOR<Prisma.RolesUpdateWithoutRolPermissionsInput, Prisma.RolesUncheckedUpdateWithoutRolPermissionsInput>;
};
export type RolesUpdateWithoutRolPermissionsInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    users?: Prisma.UsersUpdateManyWithoutRoleNestedInput;
    parentRoleLinks?: Prisma.RolesHeredadosUpdateManyWithoutParentRoleNestedInput;
    childRoleLinks?: Prisma.RolesHeredadosUpdateManyWithoutChildRoleNestedInput;
};
export type RolesUncheckedUpdateWithoutRolPermissionsInput = {
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    users?: Prisma.UsersUncheckedUpdateManyWithoutRoleNestedInput;
    parentRoleLinks?: Prisma.RolesHeredadosUncheckedUpdateManyWithoutParentRoleNestedInput;
    childRoleLinks?: Prisma.RolesHeredadosUncheckedUpdateManyWithoutChildRoleNestedInput;
};
export type RolesCreateWithoutParentRoleLinksInput = {
    name: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsCreateNestedManyWithoutRolesInput;
    users?: Prisma.UsersCreateNestedManyWithoutRoleInput;
    childRoleLinks?: Prisma.RolesHeredadosCreateNestedManyWithoutChildRoleInput;
};
export type RolesUncheckedCreateWithoutParentRoleLinksInput = {
    rolesId?: number;
    name: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedCreateNestedManyWithoutRolesInput;
    users?: Prisma.UsersUncheckedCreateNestedManyWithoutRoleInput;
    childRoleLinks?: Prisma.RolesHeredadosUncheckedCreateNestedManyWithoutChildRoleInput;
};
export type RolesCreateOrConnectWithoutParentRoleLinksInput = {
    where: Prisma.RolesWhereUniqueInput;
    create: Prisma.XOR<Prisma.RolesCreateWithoutParentRoleLinksInput, Prisma.RolesUncheckedCreateWithoutParentRoleLinksInput>;
};
export type RolesCreateWithoutChildRoleLinksInput = {
    name: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsCreateNestedManyWithoutRolesInput;
    users?: Prisma.UsersCreateNestedManyWithoutRoleInput;
    parentRoleLinks?: Prisma.RolesHeredadosCreateNestedManyWithoutParentRoleInput;
};
export type RolesUncheckedCreateWithoutChildRoleLinksInput = {
    rolesId?: number;
    name: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedCreateNestedManyWithoutRolesInput;
    users?: Prisma.UsersUncheckedCreateNestedManyWithoutRoleInput;
    parentRoleLinks?: Prisma.RolesHeredadosUncheckedCreateNestedManyWithoutParentRoleInput;
};
export type RolesCreateOrConnectWithoutChildRoleLinksInput = {
    where: Prisma.RolesWhereUniqueInput;
    create: Prisma.XOR<Prisma.RolesCreateWithoutChildRoleLinksInput, Prisma.RolesUncheckedCreateWithoutChildRoleLinksInput>;
};
export type RolesUpsertWithoutParentRoleLinksInput = {
    update: Prisma.XOR<Prisma.RolesUpdateWithoutParentRoleLinksInput, Prisma.RolesUncheckedUpdateWithoutParentRoleLinksInput>;
    create: Prisma.XOR<Prisma.RolesCreateWithoutParentRoleLinksInput, Prisma.RolesUncheckedCreateWithoutParentRoleLinksInput>;
    where?: Prisma.RolesWhereInput;
};
export type RolesUpdateToOneWithWhereWithoutParentRoleLinksInput = {
    where?: Prisma.RolesWhereInput;
    data: Prisma.XOR<Prisma.RolesUpdateWithoutParentRoleLinksInput, Prisma.RolesUncheckedUpdateWithoutParentRoleLinksInput>;
};
export type RolesUpdateWithoutParentRoleLinksInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUpdateManyWithoutRolesNestedInput;
    users?: Prisma.UsersUpdateManyWithoutRoleNestedInput;
    childRoleLinks?: Prisma.RolesHeredadosUpdateManyWithoutChildRoleNestedInput;
};
export type RolesUncheckedUpdateWithoutParentRoleLinksInput = {
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedUpdateManyWithoutRolesNestedInput;
    users?: Prisma.UsersUncheckedUpdateManyWithoutRoleNestedInput;
    childRoleLinks?: Prisma.RolesHeredadosUncheckedUpdateManyWithoutChildRoleNestedInput;
};
export type RolesUpsertWithoutChildRoleLinksInput = {
    update: Prisma.XOR<Prisma.RolesUpdateWithoutChildRoleLinksInput, Prisma.RolesUncheckedUpdateWithoutChildRoleLinksInput>;
    create: Prisma.XOR<Prisma.RolesCreateWithoutChildRoleLinksInput, Prisma.RolesUncheckedCreateWithoutChildRoleLinksInput>;
    where?: Prisma.RolesWhereInput;
};
export type RolesUpdateToOneWithWhereWithoutChildRoleLinksInput = {
    where?: Prisma.RolesWhereInput;
    data: Prisma.XOR<Prisma.RolesUpdateWithoutChildRoleLinksInput, Prisma.RolesUncheckedUpdateWithoutChildRoleLinksInput>;
};
export type RolesUpdateWithoutChildRoleLinksInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUpdateManyWithoutRolesNestedInput;
    users?: Prisma.UsersUpdateManyWithoutRoleNestedInput;
    parentRoleLinks?: Prisma.RolesHeredadosUpdateManyWithoutParentRoleNestedInput;
};
export type RolesUncheckedUpdateWithoutChildRoleLinksInput = {
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedUpdateManyWithoutRolesNestedInput;
    users?: Prisma.UsersUncheckedUpdateManyWithoutRoleNestedInput;
    parentRoleLinks?: Prisma.RolesHeredadosUncheckedUpdateManyWithoutParentRoleNestedInput;
};
export type RolesCreateWithoutUsersInput = {
    name: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsCreateNestedManyWithoutRolesInput;
    parentRoleLinks?: Prisma.RolesHeredadosCreateNestedManyWithoutParentRoleInput;
    childRoleLinks?: Prisma.RolesHeredadosCreateNestedManyWithoutChildRoleInput;
};
export type RolesUncheckedCreateWithoutUsersInput = {
    rolesId?: number;
    name: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedCreateNestedManyWithoutRolesInput;
    parentRoleLinks?: Prisma.RolesHeredadosUncheckedCreateNestedManyWithoutParentRoleInput;
    childRoleLinks?: Prisma.RolesHeredadosUncheckedCreateNestedManyWithoutChildRoleInput;
};
export type RolesCreateOrConnectWithoutUsersInput = {
    where: Prisma.RolesWhereUniqueInput;
    create: Prisma.XOR<Prisma.RolesCreateWithoutUsersInput, Prisma.RolesUncheckedCreateWithoutUsersInput>;
};
export type RolesUpsertWithoutUsersInput = {
    update: Prisma.XOR<Prisma.RolesUpdateWithoutUsersInput, Prisma.RolesUncheckedUpdateWithoutUsersInput>;
    create: Prisma.XOR<Prisma.RolesCreateWithoutUsersInput, Prisma.RolesUncheckedCreateWithoutUsersInput>;
    where?: Prisma.RolesWhereInput;
};
export type RolesUpdateToOneWithWhereWithoutUsersInput = {
    where?: Prisma.RolesWhereInput;
    data: Prisma.XOR<Prisma.RolesUpdateWithoutUsersInput, Prisma.RolesUncheckedUpdateWithoutUsersInput>;
};
export type RolesUpdateWithoutUsersInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUpdateManyWithoutRolesNestedInput;
    parentRoleLinks?: Prisma.RolesHeredadosUpdateManyWithoutParentRoleNestedInput;
    childRoleLinks?: Prisma.RolesHeredadosUpdateManyWithoutChildRoleNestedInput;
};
export type RolesUncheckedUpdateWithoutUsersInput = {
    rolesId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedUpdateManyWithoutRolesNestedInput;
    parentRoleLinks?: Prisma.RolesHeredadosUncheckedUpdateManyWithoutParentRoleNestedInput;
    childRoleLinks?: Prisma.RolesHeredadosUncheckedUpdateManyWithoutChildRoleNestedInput;
};
export type RolesCountOutputType = {
    rolPermissions: number;
    users: number;
    parentRoleLinks: number;
    childRoleLinks: number;
};
export type RolesCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    rolPermissions?: boolean | RolesCountOutputTypeCountRolPermissionsArgs;
    users?: boolean | RolesCountOutputTypeCountUsersArgs;
    parentRoleLinks?: boolean | RolesCountOutputTypeCountParentRoleLinksArgs;
    childRoleLinks?: boolean | RolesCountOutputTypeCountChildRoleLinksArgs;
};
export type RolesCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesCountOutputTypeSelect<ExtArgs> | null;
};
export type RolesCountOutputTypeCountRolPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolPermissionsWhereInput;
};
export type RolesCountOutputTypeCountUsersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsersWhereInput;
};
export type RolesCountOutputTypeCountParentRoleLinksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolesHeredadosWhereInput;
};
export type RolesCountOutputTypeCountChildRoleLinksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolesHeredadosWhereInput;
};
export type RolesSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolesId?: boolean;
    name?: boolean;
    deletedAt?: boolean;
    rolPermissions?: boolean | Prisma.Roles$rolPermissionsArgs<ExtArgs>;
    users?: boolean | Prisma.Roles$usersArgs<ExtArgs>;
    parentRoleLinks?: boolean | Prisma.Roles$parentRoleLinksArgs<ExtArgs>;
    childRoleLinks?: boolean | Prisma.Roles$childRoleLinksArgs<ExtArgs>;
    _count?: boolean | Prisma.RolesCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["roles"]>;
export type RolesSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolesId?: boolean;
    name?: boolean;
    deletedAt?: boolean;
}, ExtArgs["result"]["roles"]>;
export type RolesSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolesId?: boolean;
    name?: boolean;
    deletedAt?: boolean;
}, ExtArgs["result"]["roles"]>;
export type RolesSelectScalar = {
    rolesId?: boolean;
    name?: boolean;
    deletedAt?: boolean;
};
export type RolesOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"rolesId" | "name" | "deletedAt", ExtArgs["result"]["roles"]>;
export type RolesInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    rolPermissions?: boolean | Prisma.Roles$rolPermissionsArgs<ExtArgs>;
    users?: boolean | Prisma.Roles$usersArgs<ExtArgs>;
    parentRoleLinks?: boolean | Prisma.Roles$parentRoleLinksArgs<ExtArgs>;
    childRoleLinks?: boolean | Prisma.Roles$childRoleLinksArgs<ExtArgs>;
    _count?: boolean | Prisma.RolesCountOutputTypeDefaultArgs<ExtArgs>;
};
export type RolesIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type RolesIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $RolesPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Roles";
    objects: {
        rolPermissions: Prisma.$RolPermissionsPayload<ExtArgs>[];
        users: Prisma.$UsersPayload<ExtArgs>[];
        parentRoleLinks: Prisma.$RolesHeredadosPayload<ExtArgs>[];
        childRoleLinks: Prisma.$RolesHeredadosPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        rolesId: number;
        name: string;
        deletedAt: Date | null;
    }, ExtArgs["result"]["roles"]>;
    composites: {};
};
export type RolesGetPayload<S extends boolean | null | undefined | RolesDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RolesPayload, S>;
export type RolesCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RolesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RolesCountAggregateInputType | true;
};
export interface RolesDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Roles'];
        meta: {
            name: 'Roles';
        };
    };
    findUnique<T extends RolesFindUniqueArgs>(args: Prisma.SelectSubset<T, RolesFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RolesFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RolesFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RolesFindFirstArgs>(args?: Prisma.SelectSubset<T, RolesFindFirstArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RolesFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RolesFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RolesFindManyArgs>(args?: Prisma.SelectSubset<T, RolesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RolesCreateArgs>(args: Prisma.SelectSubset<T, RolesCreateArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RolesCreateManyArgs>(args?: Prisma.SelectSubset<T, RolesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RolesCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RolesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RolesDeleteArgs>(args: Prisma.SelectSubset<T, RolesDeleteArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RolesUpdateArgs>(args: Prisma.SelectSubset<T, RolesUpdateArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RolesDeleteManyArgs>(args?: Prisma.SelectSubset<T, RolesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RolesUpdateManyArgs>(args: Prisma.SelectSubset<T, RolesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RolesUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RolesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RolesUpsertArgs>(args: Prisma.SelectSubset<T, RolesUpsertArgs<ExtArgs>>): Prisma.Prisma__RolesClient<runtime.Types.Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RolesCountArgs>(args?: Prisma.Subset<T, RolesCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RolesCountAggregateOutputType> : number>;
    aggregate<T extends RolesAggregateArgs>(args: Prisma.Subset<T, RolesAggregateArgs>): Prisma.PrismaPromise<GetRolesAggregateType<T>>;
    groupBy<T extends RolesGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RolesGroupByArgs['orderBy'];
    } : {
        orderBy?: RolesGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RolesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRolesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RolesFieldRefs;
}
export interface Prisma__RolesClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    rolPermissions<T extends Prisma.Roles$rolPermissionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Roles$rolPermissionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    users<T extends Prisma.Roles$usersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Roles$usersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    parentRoleLinks<T extends Prisma.Roles$parentRoleLinksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Roles$parentRoleLinksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolesHeredadosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    childRoleLinks<T extends Prisma.Roles$childRoleLinksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Roles$childRoleLinksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolesHeredadosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RolesFieldRefs {
    readonly rolesId: Prisma.FieldRef<"Roles", 'Int'>;
    readonly name: Prisma.FieldRef<"Roles", 'String'>;
    readonly deletedAt: Prisma.FieldRef<"Roles", 'DateTime'>;
}
export type RolesFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    where: Prisma.RolesWhereUniqueInput;
};
export type RolesFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    where: Prisma.RolesWhereUniqueInput;
};
export type RolesFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    where?: Prisma.RolesWhereInput;
    orderBy?: Prisma.RolesOrderByWithRelationInput | Prisma.RolesOrderByWithRelationInput[];
    cursor?: Prisma.RolesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RolesScalarFieldEnum | Prisma.RolesScalarFieldEnum[];
};
export type RolesFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    where?: Prisma.RolesWhereInput;
    orderBy?: Prisma.RolesOrderByWithRelationInput | Prisma.RolesOrderByWithRelationInput[];
    cursor?: Prisma.RolesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RolesScalarFieldEnum | Prisma.RolesScalarFieldEnum[];
};
export type RolesFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    where?: Prisma.RolesWhereInput;
    orderBy?: Prisma.RolesOrderByWithRelationInput | Prisma.RolesOrderByWithRelationInput[];
    cursor?: Prisma.RolesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RolesScalarFieldEnum | Prisma.RolesScalarFieldEnum[];
};
export type RolesCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RolesCreateInput, Prisma.RolesUncheckedCreateInput>;
};
export type RolesCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RolesCreateManyInput | Prisma.RolesCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RolesCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    data: Prisma.RolesCreateManyInput | Prisma.RolesCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RolesUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RolesUpdateInput, Prisma.RolesUncheckedUpdateInput>;
    where: Prisma.RolesWhereUniqueInput;
};
export type RolesUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RolesUpdateManyMutationInput, Prisma.RolesUncheckedUpdateManyInput>;
    where?: Prisma.RolesWhereInput;
    limit?: number;
};
export type RolesUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RolesUpdateManyMutationInput, Prisma.RolesUncheckedUpdateManyInput>;
    where?: Prisma.RolesWhereInput;
    limit?: number;
};
export type RolesUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    where: Prisma.RolesWhereUniqueInput;
    create: Prisma.XOR<Prisma.RolesCreateInput, Prisma.RolesUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RolesUpdateInput, Prisma.RolesUncheckedUpdateInput>;
};
export type RolesDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
    where: Prisma.RolesWhereUniqueInput;
};
export type RolesDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolesWhereInput;
    limit?: number;
};
export type Roles$rolPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Roles$usersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    include?: Prisma.UsersInclude<ExtArgs> | null;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput | Prisma.UsersOrderByWithRelationInput[];
    cursor?: Prisma.UsersWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsersScalarFieldEnum | Prisma.UsersScalarFieldEnum[];
};
export type Roles$parentRoleLinksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesHeredadosSelect<ExtArgs> | null;
    omit?: Prisma.RolesHeredadosOmit<ExtArgs> | null;
    include?: Prisma.RolesHeredadosInclude<ExtArgs> | null;
    where?: Prisma.RolesHeredadosWhereInput;
    orderBy?: Prisma.RolesHeredadosOrderByWithRelationInput | Prisma.RolesHeredadosOrderByWithRelationInput[];
    cursor?: Prisma.RolesHeredadosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RolesHeredadosScalarFieldEnum | Prisma.RolesHeredadosScalarFieldEnum[];
};
export type Roles$childRoleLinksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesHeredadosSelect<ExtArgs> | null;
    omit?: Prisma.RolesHeredadosOmit<ExtArgs> | null;
    include?: Prisma.RolesHeredadosInclude<ExtArgs> | null;
    where?: Prisma.RolesHeredadosWhereInput;
    orderBy?: Prisma.RolesHeredadosOrderByWithRelationInput | Prisma.RolesHeredadosOrderByWithRelationInput[];
    cursor?: Prisma.RolesHeredadosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RolesHeredadosScalarFieldEnum | Prisma.RolesHeredadosScalarFieldEnum[];
};
export type RolesDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RolesSelect<ExtArgs> | null;
    omit?: Prisma.RolesOmit<ExtArgs> | null;
    include?: Prisma.RolesInclude<ExtArgs> | null;
};
export {};
