import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type UsersModel = runtime.Types.Result.DefaultSelection<Prisma.$UsersPayload>;
export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null;
    _avg: UsersAvgAggregateOutputType | null;
    _sum: UsersSumAggregateOutputType | null;
    _min: UsersMinAggregateOutputType | null;
    _max: UsersMaxAggregateOutputType | null;
};
export type UsersAvgAggregateOutputType = {
    usersId: number | null;
};
export type UsersSumAggregateOutputType = {
    usersId: number | null;
};
export type UsersMinAggregateOutputType = {
    usersId: number | null;
    email: string | null;
    password: string | null;
    deletedAt: Date | null;
};
export type UsersMaxAggregateOutputType = {
    usersId: number | null;
    email: string | null;
    password: string | null;
    deletedAt: Date | null;
};
export type UsersCountAggregateOutputType = {
    usersId: number;
    email: number;
    password: number;
    deletedAt: number;
    _all: number;
};
export type UsersAvgAggregateInputType = {
    usersId?: true;
};
export type UsersSumAggregateInputType = {
    usersId?: true;
};
export type UsersMinAggregateInputType = {
    usersId?: true;
    email?: true;
    password?: true;
    deletedAt?: true;
};
export type UsersMaxAggregateInputType = {
    usersId?: true;
    email?: true;
    password?: true;
    deletedAt?: true;
};
export type UsersCountAggregateInputType = {
    usersId?: true;
    email?: true;
    password?: true;
    deletedAt?: true;
    _all?: true;
};
export type UsersAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput | Prisma.UsersOrderByWithRelationInput[];
    cursor?: Prisma.UsersWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UsersCountAggregateInputType;
    _avg?: UsersAvgAggregateInputType;
    _sum?: UsersSumAggregateInputType;
    _min?: UsersMinAggregateInputType;
    _max?: UsersMaxAggregateInputType;
};
export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
    [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUsers[P]> : Prisma.GetScalarType<T[P], AggregateUsers[P]>;
};
export type UsersGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithAggregationInput | Prisma.UsersOrderByWithAggregationInput[];
    by: Prisma.UsersScalarFieldEnum[] | Prisma.UsersScalarFieldEnum;
    having?: Prisma.UsersScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UsersCountAggregateInputType | true;
    _avg?: UsersAvgAggregateInputType;
    _sum?: UsersSumAggregateInputType;
    _min?: UsersMinAggregateInputType;
    _max?: UsersMaxAggregateInputType;
};
export type UsersGroupByOutputType = {
    usersId: number;
    email: string;
    password: string;
    deletedAt: Date | null;
    _count: UsersCountAggregateOutputType | null;
    _avg: UsersAvgAggregateOutputType | null;
    _sum: UsersSumAggregateOutputType | null;
    _min: UsersMinAggregateOutputType | null;
    _max: UsersMaxAggregateOutputType | null;
};
type GetUsersGroupByPayload<T extends UsersGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UsersGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UsersGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UsersGroupByOutputType[P]>;
}>>;
export type UsersWhereInput = {
    AND?: Prisma.UsersWhereInput | Prisma.UsersWhereInput[];
    OR?: Prisma.UsersWhereInput[];
    NOT?: Prisma.UsersWhereInput | Prisma.UsersWhereInput[];
    usersId?: Prisma.IntFilter<"Users"> | number;
    email?: Prisma.StringFilter<"Users"> | string;
    password?: Prisma.StringFilter<"Users"> | string;
    deletedAt?: Prisma.DateTimeNullableFilter<"Users"> | Date | string | null;
    sessions?: Prisma.SessionsListRelationFilter;
    userRoles?: Prisma.UserRolesListRelationFilter;
    userPermissions?: Prisma.UserPermissionsListRelationFilter;
    profile?: Prisma.XOR<Prisma.ProfilesNullableScalarRelationFilter, Prisma.ProfilesWhereInput> | null;
};
export type UsersOrderByWithRelationInput = {
    usersId?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    sessions?: Prisma.SessionsOrderByRelationAggregateInput;
    userRoles?: Prisma.UserRolesOrderByRelationAggregateInput;
    userPermissions?: Prisma.UserPermissionsOrderByRelationAggregateInput;
    profile?: Prisma.ProfilesOrderByWithRelationInput;
};
export type UsersWhereUniqueInput = Prisma.AtLeast<{
    usersId?: number;
    email?: string;
    AND?: Prisma.UsersWhereInput | Prisma.UsersWhereInput[];
    OR?: Prisma.UsersWhereInput[];
    NOT?: Prisma.UsersWhereInput | Prisma.UsersWhereInput[];
    password?: Prisma.StringFilter<"Users"> | string;
    deletedAt?: Prisma.DateTimeNullableFilter<"Users"> | Date | string | null;
    sessions?: Prisma.SessionsListRelationFilter;
    userRoles?: Prisma.UserRolesListRelationFilter;
    userPermissions?: Prisma.UserPermissionsListRelationFilter;
    profile?: Prisma.XOR<Prisma.ProfilesNullableScalarRelationFilter, Prisma.ProfilesWhereInput> | null;
}, "usersId" | "email">;
export type UsersOrderByWithAggregationInput = {
    usersId?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.UsersCountOrderByAggregateInput;
    _avg?: Prisma.UsersAvgOrderByAggregateInput;
    _max?: Prisma.UsersMaxOrderByAggregateInput;
    _min?: Prisma.UsersMinOrderByAggregateInput;
    _sum?: Prisma.UsersSumOrderByAggregateInput;
};
export type UsersScalarWhereWithAggregatesInput = {
    AND?: Prisma.UsersScalarWhereWithAggregatesInput | Prisma.UsersScalarWhereWithAggregatesInput[];
    OR?: Prisma.UsersScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UsersScalarWhereWithAggregatesInput | Prisma.UsersScalarWhereWithAggregatesInput[];
    usersId?: Prisma.IntWithAggregatesFilter<"Users"> | number;
    email?: Prisma.StringWithAggregatesFilter<"Users"> | string;
    password?: Prisma.StringWithAggregatesFilter<"Users"> | string;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Users"> | Date | string | null;
};
export type UsersCreateInput = {
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    sessions?: Prisma.SessionsCreateNestedManyWithoutUsersInput;
    userRoles?: Prisma.UserRolesCreateNestedManyWithoutUserInput;
    userPermissions?: Prisma.UserPermissionsCreateNestedManyWithoutUsersInput;
    profile?: Prisma.ProfilesCreateNestedOneWithoutUserInput;
};
export type UsersUncheckedCreateInput = {
    usersId?: number;
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    sessions?: Prisma.SessionsUncheckedCreateNestedManyWithoutUsersInput;
    userRoles?: Prisma.UserRolesUncheckedCreateNestedManyWithoutUserInput;
    userPermissions?: Prisma.UserPermissionsUncheckedCreateNestedManyWithoutUsersInput;
    profile?: Prisma.ProfilesUncheckedCreateNestedOneWithoutUserInput;
};
export type UsersUpdateInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    sessions?: Prisma.SessionsUpdateManyWithoutUsersNestedInput;
    userRoles?: Prisma.UserRolesUpdateManyWithoutUserNestedInput;
    userPermissions?: Prisma.UserPermissionsUpdateManyWithoutUsersNestedInput;
    profile?: Prisma.ProfilesUpdateOneWithoutUserNestedInput;
};
export type UsersUncheckedUpdateInput = {
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    sessions?: Prisma.SessionsUncheckedUpdateManyWithoutUsersNestedInput;
    userRoles?: Prisma.UserRolesUncheckedUpdateManyWithoutUserNestedInput;
    userPermissions?: Prisma.UserPermissionsUncheckedUpdateManyWithoutUsersNestedInput;
    profile?: Prisma.ProfilesUncheckedUpdateOneWithoutUserNestedInput;
};
export type UsersCreateManyInput = {
    usersId?: number;
    email: string;
    password: string;
    deletedAt?: Date | string | null;
};
export type UsersUpdateManyMutationInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UsersUncheckedUpdateManyInput = {
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UsersScalarRelationFilter = {
    is?: Prisma.UsersWhereInput;
    isNot?: Prisma.UsersWhereInput;
};
export type UsersCountOrderByAggregateInput = {
    usersId?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type UsersAvgOrderByAggregateInput = {
    usersId?: Prisma.SortOrder;
};
export type UsersMaxOrderByAggregateInput = {
    usersId?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type UsersMinOrderByAggregateInput = {
    usersId?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type UsersSumOrderByAggregateInput = {
    usersId?: Prisma.SortOrder;
};
export type UsersCreateNestedOneWithoutProfileInput = {
    create?: Prisma.XOR<Prisma.UsersCreateWithoutProfileInput, Prisma.UsersUncheckedCreateWithoutProfileInput>;
    connectOrCreate?: Prisma.UsersCreateOrConnectWithoutProfileInput;
    connect?: Prisma.UsersWhereUniqueInput;
};
export type UsersUpdateOneRequiredWithoutProfileNestedInput = {
    create?: Prisma.XOR<Prisma.UsersCreateWithoutProfileInput, Prisma.UsersUncheckedCreateWithoutProfileInput>;
    connectOrCreate?: Prisma.UsersCreateOrConnectWithoutProfileInput;
    upsert?: Prisma.UsersUpsertWithoutProfileInput;
    connect?: Prisma.UsersWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UsersUpdateToOneWithWhereWithoutProfileInput, Prisma.UsersUpdateWithoutProfileInput>, Prisma.UsersUncheckedUpdateWithoutProfileInput>;
};
export type UsersCreateNestedOneWithoutSessionsInput = {
    create?: Prisma.XOR<Prisma.UsersCreateWithoutSessionsInput, Prisma.UsersUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: Prisma.UsersCreateOrConnectWithoutSessionsInput;
    connect?: Prisma.UsersWhereUniqueInput;
};
export type UsersUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: Prisma.XOR<Prisma.UsersCreateWithoutSessionsInput, Prisma.UsersUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: Prisma.UsersCreateOrConnectWithoutSessionsInput;
    upsert?: Prisma.UsersUpsertWithoutSessionsInput;
    connect?: Prisma.UsersWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UsersUpdateToOneWithWhereWithoutSessionsInput, Prisma.UsersUpdateWithoutSessionsInput>, Prisma.UsersUncheckedUpdateWithoutSessionsInput>;
};
export type UsersCreateNestedOneWithoutUserPermissionsInput = {
    create?: Prisma.XOR<Prisma.UsersCreateWithoutUserPermissionsInput, Prisma.UsersUncheckedCreateWithoutUserPermissionsInput>;
    connectOrCreate?: Prisma.UsersCreateOrConnectWithoutUserPermissionsInput;
    connect?: Prisma.UsersWhereUniqueInput;
};
export type UsersUpdateOneRequiredWithoutUserPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.UsersCreateWithoutUserPermissionsInput, Prisma.UsersUncheckedCreateWithoutUserPermissionsInput>;
    connectOrCreate?: Prisma.UsersCreateOrConnectWithoutUserPermissionsInput;
    upsert?: Prisma.UsersUpsertWithoutUserPermissionsInput;
    connect?: Prisma.UsersWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UsersUpdateToOneWithWhereWithoutUserPermissionsInput, Prisma.UsersUpdateWithoutUserPermissionsInput>, Prisma.UsersUncheckedUpdateWithoutUserPermissionsInput>;
};
export type UsersCreateNestedOneWithoutUserRolesInput = {
    create?: Prisma.XOR<Prisma.UsersCreateWithoutUserRolesInput, Prisma.UsersUncheckedCreateWithoutUserRolesInput>;
    connectOrCreate?: Prisma.UsersCreateOrConnectWithoutUserRolesInput;
    connect?: Prisma.UsersWhereUniqueInput;
};
export type UsersUpdateOneRequiredWithoutUserRolesNestedInput = {
    create?: Prisma.XOR<Prisma.UsersCreateWithoutUserRolesInput, Prisma.UsersUncheckedCreateWithoutUserRolesInput>;
    connectOrCreate?: Prisma.UsersCreateOrConnectWithoutUserRolesInput;
    upsert?: Prisma.UsersUpsertWithoutUserRolesInput;
    connect?: Prisma.UsersWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UsersUpdateToOneWithWhereWithoutUserRolesInput, Prisma.UsersUpdateWithoutUserRolesInput>, Prisma.UsersUncheckedUpdateWithoutUserRolesInput>;
};
export type UsersCreateWithoutProfileInput = {
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    sessions?: Prisma.SessionsCreateNestedManyWithoutUsersInput;
    userRoles?: Prisma.UserRolesCreateNestedManyWithoutUserInput;
    userPermissions?: Prisma.UserPermissionsCreateNestedManyWithoutUsersInput;
};
export type UsersUncheckedCreateWithoutProfileInput = {
    usersId?: number;
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    sessions?: Prisma.SessionsUncheckedCreateNestedManyWithoutUsersInput;
    userRoles?: Prisma.UserRolesUncheckedCreateNestedManyWithoutUserInput;
    userPermissions?: Prisma.UserPermissionsUncheckedCreateNestedManyWithoutUsersInput;
};
export type UsersCreateOrConnectWithoutProfileInput = {
    where: Prisma.UsersWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsersCreateWithoutProfileInput, Prisma.UsersUncheckedCreateWithoutProfileInput>;
};
export type UsersUpsertWithoutProfileInput = {
    update: Prisma.XOR<Prisma.UsersUpdateWithoutProfileInput, Prisma.UsersUncheckedUpdateWithoutProfileInput>;
    create: Prisma.XOR<Prisma.UsersCreateWithoutProfileInput, Prisma.UsersUncheckedCreateWithoutProfileInput>;
    where?: Prisma.UsersWhereInput;
};
export type UsersUpdateToOneWithWhereWithoutProfileInput = {
    where?: Prisma.UsersWhereInput;
    data: Prisma.XOR<Prisma.UsersUpdateWithoutProfileInput, Prisma.UsersUncheckedUpdateWithoutProfileInput>;
};
export type UsersUpdateWithoutProfileInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    sessions?: Prisma.SessionsUpdateManyWithoutUsersNestedInput;
    userRoles?: Prisma.UserRolesUpdateManyWithoutUserNestedInput;
    userPermissions?: Prisma.UserPermissionsUpdateManyWithoutUsersNestedInput;
};
export type UsersUncheckedUpdateWithoutProfileInput = {
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    sessions?: Prisma.SessionsUncheckedUpdateManyWithoutUsersNestedInput;
    userRoles?: Prisma.UserRolesUncheckedUpdateManyWithoutUserNestedInput;
    userPermissions?: Prisma.UserPermissionsUncheckedUpdateManyWithoutUsersNestedInput;
};
export type UsersCreateWithoutSessionsInput = {
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    userRoles?: Prisma.UserRolesCreateNestedManyWithoutUserInput;
    userPermissions?: Prisma.UserPermissionsCreateNestedManyWithoutUsersInput;
    profile?: Prisma.ProfilesCreateNestedOneWithoutUserInput;
};
export type UsersUncheckedCreateWithoutSessionsInput = {
    usersId?: number;
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    userRoles?: Prisma.UserRolesUncheckedCreateNestedManyWithoutUserInput;
    userPermissions?: Prisma.UserPermissionsUncheckedCreateNestedManyWithoutUsersInput;
    profile?: Prisma.ProfilesUncheckedCreateNestedOneWithoutUserInput;
};
export type UsersCreateOrConnectWithoutSessionsInput = {
    where: Prisma.UsersWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsersCreateWithoutSessionsInput, Prisma.UsersUncheckedCreateWithoutSessionsInput>;
};
export type UsersUpsertWithoutSessionsInput = {
    update: Prisma.XOR<Prisma.UsersUpdateWithoutSessionsInput, Prisma.UsersUncheckedUpdateWithoutSessionsInput>;
    create: Prisma.XOR<Prisma.UsersCreateWithoutSessionsInput, Prisma.UsersUncheckedCreateWithoutSessionsInput>;
    where?: Prisma.UsersWhereInput;
};
export type UsersUpdateToOneWithWhereWithoutSessionsInput = {
    where?: Prisma.UsersWhereInput;
    data: Prisma.XOR<Prisma.UsersUpdateWithoutSessionsInput, Prisma.UsersUncheckedUpdateWithoutSessionsInput>;
};
export type UsersUpdateWithoutSessionsInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    userRoles?: Prisma.UserRolesUpdateManyWithoutUserNestedInput;
    userPermissions?: Prisma.UserPermissionsUpdateManyWithoutUsersNestedInput;
    profile?: Prisma.ProfilesUpdateOneWithoutUserNestedInput;
};
export type UsersUncheckedUpdateWithoutSessionsInput = {
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    userRoles?: Prisma.UserRolesUncheckedUpdateManyWithoutUserNestedInput;
    userPermissions?: Prisma.UserPermissionsUncheckedUpdateManyWithoutUsersNestedInput;
    profile?: Prisma.ProfilesUncheckedUpdateOneWithoutUserNestedInput;
};
export type UsersCreateWithoutUserPermissionsInput = {
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    sessions?: Prisma.SessionsCreateNestedManyWithoutUsersInput;
    userRoles?: Prisma.UserRolesCreateNestedManyWithoutUserInput;
    profile?: Prisma.ProfilesCreateNestedOneWithoutUserInput;
};
export type UsersUncheckedCreateWithoutUserPermissionsInput = {
    usersId?: number;
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    sessions?: Prisma.SessionsUncheckedCreateNestedManyWithoutUsersInput;
    userRoles?: Prisma.UserRolesUncheckedCreateNestedManyWithoutUserInput;
    profile?: Prisma.ProfilesUncheckedCreateNestedOneWithoutUserInput;
};
export type UsersCreateOrConnectWithoutUserPermissionsInput = {
    where: Prisma.UsersWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsersCreateWithoutUserPermissionsInput, Prisma.UsersUncheckedCreateWithoutUserPermissionsInput>;
};
export type UsersUpsertWithoutUserPermissionsInput = {
    update: Prisma.XOR<Prisma.UsersUpdateWithoutUserPermissionsInput, Prisma.UsersUncheckedUpdateWithoutUserPermissionsInput>;
    create: Prisma.XOR<Prisma.UsersCreateWithoutUserPermissionsInput, Prisma.UsersUncheckedCreateWithoutUserPermissionsInput>;
    where?: Prisma.UsersWhereInput;
};
export type UsersUpdateToOneWithWhereWithoutUserPermissionsInput = {
    where?: Prisma.UsersWhereInput;
    data: Prisma.XOR<Prisma.UsersUpdateWithoutUserPermissionsInput, Prisma.UsersUncheckedUpdateWithoutUserPermissionsInput>;
};
export type UsersUpdateWithoutUserPermissionsInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    sessions?: Prisma.SessionsUpdateManyWithoutUsersNestedInput;
    userRoles?: Prisma.UserRolesUpdateManyWithoutUserNestedInput;
    profile?: Prisma.ProfilesUpdateOneWithoutUserNestedInput;
};
export type UsersUncheckedUpdateWithoutUserPermissionsInput = {
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    sessions?: Prisma.SessionsUncheckedUpdateManyWithoutUsersNestedInput;
    userRoles?: Prisma.UserRolesUncheckedUpdateManyWithoutUserNestedInput;
    profile?: Prisma.ProfilesUncheckedUpdateOneWithoutUserNestedInput;
};
export type UsersCreateWithoutUserRolesInput = {
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    sessions?: Prisma.SessionsCreateNestedManyWithoutUsersInput;
    userPermissions?: Prisma.UserPermissionsCreateNestedManyWithoutUsersInput;
    profile?: Prisma.ProfilesCreateNestedOneWithoutUserInput;
};
export type UsersUncheckedCreateWithoutUserRolesInput = {
    usersId?: number;
    email: string;
    password: string;
    deletedAt?: Date | string | null;
    sessions?: Prisma.SessionsUncheckedCreateNestedManyWithoutUsersInput;
    userPermissions?: Prisma.UserPermissionsUncheckedCreateNestedManyWithoutUsersInput;
    profile?: Prisma.ProfilesUncheckedCreateNestedOneWithoutUserInput;
};
export type UsersCreateOrConnectWithoutUserRolesInput = {
    where: Prisma.UsersWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsersCreateWithoutUserRolesInput, Prisma.UsersUncheckedCreateWithoutUserRolesInput>;
};
export type UsersUpsertWithoutUserRolesInput = {
    update: Prisma.XOR<Prisma.UsersUpdateWithoutUserRolesInput, Prisma.UsersUncheckedUpdateWithoutUserRolesInput>;
    create: Prisma.XOR<Prisma.UsersCreateWithoutUserRolesInput, Prisma.UsersUncheckedCreateWithoutUserRolesInput>;
    where?: Prisma.UsersWhereInput;
};
export type UsersUpdateToOneWithWhereWithoutUserRolesInput = {
    where?: Prisma.UsersWhereInput;
    data: Prisma.XOR<Prisma.UsersUpdateWithoutUserRolesInput, Prisma.UsersUncheckedUpdateWithoutUserRolesInput>;
};
export type UsersUpdateWithoutUserRolesInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    sessions?: Prisma.SessionsUpdateManyWithoutUsersNestedInput;
    userPermissions?: Prisma.UserPermissionsUpdateManyWithoutUsersNestedInput;
    profile?: Prisma.ProfilesUpdateOneWithoutUserNestedInput;
};
export type UsersUncheckedUpdateWithoutUserRolesInput = {
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    sessions?: Prisma.SessionsUncheckedUpdateManyWithoutUsersNestedInput;
    userPermissions?: Prisma.UserPermissionsUncheckedUpdateManyWithoutUsersNestedInput;
    profile?: Prisma.ProfilesUncheckedUpdateOneWithoutUserNestedInput;
};
export type UsersCountOutputType = {
    sessions: number;
    userRoles: number;
    userPermissions: number;
};
export type UsersCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sessions?: boolean | UsersCountOutputTypeCountSessionsArgs;
    userRoles?: boolean | UsersCountOutputTypeCountUserRolesArgs;
    userPermissions?: boolean | UsersCountOutputTypeCountUserPermissionsArgs;
};
export type UsersCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersCountOutputTypeSelect<ExtArgs> | null;
};
export type UsersCountOutputTypeCountSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessionsWhereInput;
};
export type UsersCountOutputTypeCountUserRolesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserRolesWhereInput;
};
export type UsersCountOutputTypeCountUserPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserPermissionsWhereInput;
};
export type UsersSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    usersId?: boolean;
    email?: boolean;
    password?: boolean;
    deletedAt?: boolean;
    sessions?: boolean | Prisma.Users$sessionsArgs<ExtArgs>;
    userRoles?: boolean | Prisma.Users$userRolesArgs<ExtArgs>;
    userPermissions?: boolean | Prisma.Users$userPermissionsArgs<ExtArgs>;
    profile?: boolean | Prisma.Users$profileArgs<ExtArgs>;
    _count?: boolean | Prisma.UsersCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["users"]>;
export type UsersSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    usersId?: boolean;
    email?: boolean;
    password?: boolean;
    deletedAt?: boolean;
}, ExtArgs["result"]["users"]>;
export type UsersSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    usersId?: boolean;
    email?: boolean;
    password?: boolean;
    deletedAt?: boolean;
}, ExtArgs["result"]["users"]>;
export type UsersSelectScalar = {
    usersId?: boolean;
    email?: boolean;
    password?: boolean;
    deletedAt?: boolean;
};
export type UsersOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"usersId" | "email" | "password" | "deletedAt", ExtArgs["result"]["users"]>;
export type UsersInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sessions?: boolean | Prisma.Users$sessionsArgs<ExtArgs>;
    userRoles?: boolean | Prisma.Users$userRolesArgs<ExtArgs>;
    userPermissions?: boolean | Prisma.Users$userPermissionsArgs<ExtArgs>;
    profile?: boolean | Prisma.Users$profileArgs<ExtArgs>;
    _count?: boolean | Prisma.UsersCountOutputTypeDefaultArgs<ExtArgs>;
};
export type UsersIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type UsersIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $UsersPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Users";
    objects: {
        sessions: Prisma.$SessionsPayload<ExtArgs>[];
        userRoles: Prisma.$UserRolesPayload<ExtArgs>[];
        userPermissions: Prisma.$UserPermissionsPayload<ExtArgs>[];
        profile: Prisma.$ProfilesPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        usersId: number;
        email: string;
        password: string;
        deletedAt: Date | null;
    }, ExtArgs["result"]["users"]>;
    composites: {};
};
export type UsersGetPayload<S extends boolean | null | undefined | UsersDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UsersPayload, S>;
export type UsersCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UsersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UsersCountAggregateInputType | true;
};
export interface UsersDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Users'];
        meta: {
            name: 'Users';
        };
    };
    findUnique<T extends UsersFindUniqueArgs>(args: Prisma.SelectSubset<T, UsersFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UsersFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UsersFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UsersFindFirstArgs>(args?: Prisma.SelectSubset<T, UsersFindFirstArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UsersFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UsersFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UsersFindManyArgs>(args?: Prisma.SelectSubset<T, UsersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UsersCreateArgs>(args: Prisma.SelectSubset<T, UsersCreateArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UsersCreateManyArgs>(args?: Prisma.SelectSubset<T, UsersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UsersCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UsersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UsersDeleteArgs>(args: Prisma.SelectSubset<T, UsersDeleteArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UsersUpdateArgs>(args: Prisma.SelectSubset<T, UsersUpdateArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UsersDeleteManyArgs>(args?: Prisma.SelectSubset<T, UsersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UsersUpdateManyArgs>(args: Prisma.SelectSubset<T, UsersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UsersUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UsersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UsersUpsertArgs>(args: Prisma.SelectSubset<T, UsersUpsertArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UsersCountArgs>(args?: Prisma.Subset<T, UsersCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UsersCountAggregateOutputType> : number>;
    aggregate<T extends UsersAggregateArgs>(args: Prisma.Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>;
    groupBy<T extends UsersGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UsersGroupByArgs['orderBy'];
    } : {
        orderBy?: UsersGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UsersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UsersFieldRefs;
}
export interface Prisma__UsersClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    sessions<T extends Prisma.Users$sessionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Users$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    userRoles<T extends Prisma.Users$userRolesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Users$userRolesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserRolesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    userPermissions<T extends Prisma.Users$userPermissionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Users$userPermissionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    profile<T extends Prisma.Users$profileArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Users$profileArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UsersFieldRefs {
    readonly usersId: Prisma.FieldRef<"Users", 'Int'>;
    readonly email: Prisma.FieldRef<"Users", 'String'>;
    readonly password: Prisma.FieldRef<"Users", 'String'>;
    readonly deletedAt: Prisma.FieldRef<"Users", 'DateTime'>;
}
export type UsersFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    include?: Prisma.UsersInclude<ExtArgs> | null;
    where: Prisma.UsersWhereUniqueInput;
};
export type UsersFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    include?: Prisma.UsersInclude<ExtArgs> | null;
    where: Prisma.UsersWhereUniqueInput;
};
export type UsersFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type UsersFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type UsersFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type UsersCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    include?: Prisma.UsersInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsersCreateInput, Prisma.UsersUncheckedCreateInput>;
};
export type UsersCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UsersCreateManyInput | Prisma.UsersCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UsersCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    data: Prisma.UsersCreateManyInput | Prisma.UsersCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UsersUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    include?: Prisma.UsersInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsersUpdateInput, Prisma.UsersUncheckedUpdateInput>;
    where: Prisma.UsersWhereUniqueInput;
};
export type UsersUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UsersUpdateManyMutationInput, Prisma.UsersUncheckedUpdateManyInput>;
    where?: Prisma.UsersWhereInput;
    limit?: number;
};
export type UsersUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsersUpdateManyMutationInput, Prisma.UsersUncheckedUpdateManyInput>;
    where?: Prisma.UsersWhereInput;
    limit?: number;
};
export type UsersUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    include?: Prisma.UsersInclude<ExtArgs> | null;
    where: Prisma.UsersWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsersCreateInput, Prisma.UsersUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UsersUpdateInput, Prisma.UsersUncheckedUpdateInput>;
};
export type UsersDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    include?: Prisma.UsersInclude<ExtArgs> | null;
    where: Prisma.UsersWhereUniqueInput;
};
export type UsersDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsersWhereInput;
    limit?: number;
};
export type Users$sessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    where?: Prisma.SessionsWhereInput;
    orderBy?: Prisma.SessionsOrderByWithRelationInput | Prisma.SessionsOrderByWithRelationInput[];
    cursor?: Prisma.SessionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessionsScalarFieldEnum | Prisma.SessionsScalarFieldEnum[];
};
export type Users$userRolesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Users$userPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Users$profileArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    where?: Prisma.ProfilesWhereInput;
};
export type UsersDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsersSelect<ExtArgs> | null;
    omit?: Prisma.UsersOmit<ExtArgs> | null;
    include?: Prisma.UsersInclude<ExtArgs> | null;
};
export {};
