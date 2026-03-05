import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PermissionsModel = runtime.Types.Result.DefaultSelection<Prisma.$PermissionsPayload>;
export type AggregatePermissions = {
    _count: PermissionsCountAggregateOutputType | null;
    _avg: PermissionsAvgAggregateOutputType | null;
    _sum: PermissionsSumAggregateOutputType | null;
    _min: PermissionsMinAggregateOutputType | null;
    _max: PermissionsMaxAggregateOutputType | null;
};
export type PermissionsAvgAggregateOutputType = {
    permissionsId: number | null;
};
export type PermissionsSumAggregateOutputType = {
    permissionsId: number | null;
};
export type PermissionsMinAggregateOutputType = {
    permissionsId: number | null;
    resource: string | null;
    action: string | null;
    deletedAt: Date | null;
};
export type PermissionsMaxAggregateOutputType = {
    permissionsId: number | null;
    resource: string | null;
    action: string | null;
    deletedAt: Date | null;
};
export type PermissionsCountAggregateOutputType = {
    permissionsId: number;
    resource: number;
    action: number;
    deletedAt: number;
    _all: number;
};
export type PermissionsAvgAggregateInputType = {
    permissionsId?: true;
};
export type PermissionsSumAggregateInputType = {
    permissionsId?: true;
};
export type PermissionsMinAggregateInputType = {
    permissionsId?: true;
    resource?: true;
    action?: true;
    deletedAt?: true;
};
export type PermissionsMaxAggregateInputType = {
    permissionsId?: true;
    resource?: true;
    action?: true;
    deletedAt?: true;
};
export type PermissionsCountAggregateInputType = {
    permissionsId?: true;
    resource?: true;
    action?: true;
    deletedAt?: true;
    _all?: true;
};
export type PermissionsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PermissionsWhereInput;
    orderBy?: Prisma.PermissionsOrderByWithRelationInput | Prisma.PermissionsOrderByWithRelationInput[];
    cursor?: Prisma.PermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PermissionsCountAggregateInputType;
    _avg?: PermissionsAvgAggregateInputType;
    _sum?: PermissionsSumAggregateInputType;
    _min?: PermissionsMinAggregateInputType;
    _max?: PermissionsMaxAggregateInputType;
};
export type GetPermissionsAggregateType<T extends PermissionsAggregateArgs> = {
    [P in keyof T & keyof AggregatePermissions]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePermissions[P]> : Prisma.GetScalarType<T[P], AggregatePermissions[P]>;
};
export type PermissionsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PermissionsWhereInput;
    orderBy?: Prisma.PermissionsOrderByWithAggregationInput | Prisma.PermissionsOrderByWithAggregationInput[];
    by: Prisma.PermissionsScalarFieldEnum[] | Prisma.PermissionsScalarFieldEnum;
    having?: Prisma.PermissionsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PermissionsCountAggregateInputType | true;
    _avg?: PermissionsAvgAggregateInputType;
    _sum?: PermissionsSumAggregateInputType;
    _min?: PermissionsMinAggregateInputType;
    _max?: PermissionsMaxAggregateInputType;
};
export type PermissionsGroupByOutputType = {
    permissionsId: number;
    resource: string;
    action: string;
    deletedAt: Date | null;
    _count: PermissionsCountAggregateOutputType | null;
    _avg: PermissionsAvgAggregateOutputType | null;
    _sum: PermissionsSumAggregateOutputType | null;
    _min: PermissionsMinAggregateOutputType | null;
    _max: PermissionsMaxAggregateOutputType | null;
};
type GetPermissionsGroupByPayload<T extends PermissionsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PermissionsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PermissionsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PermissionsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PermissionsGroupByOutputType[P]>;
}>>;
export type PermissionsWhereInput = {
    AND?: Prisma.PermissionsWhereInput | Prisma.PermissionsWhereInput[];
    OR?: Prisma.PermissionsWhereInput[];
    NOT?: Prisma.PermissionsWhereInput | Prisma.PermissionsWhereInput[];
    permissionsId?: Prisma.IntFilter<"Permissions"> | number;
    resource?: Prisma.StringFilter<"Permissions"> | string;
    action?: Prisma.StringFilter<"Permissions"> | string;
    deletedAt?: Prisma.DateTimeNullableFilter<"Permissions"> | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsListRelationFilter;
    menuPermissions?: Prisma.MenuPermissionsListRelationFilter;
    userPermissions?: Prisma.UserPermissionsListRelationFilter;
};
export type PermissionsOrderByWithRelationInput = {
    permissionsId?: Prisma.SortOrder;
    resource?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    rolPermissions?: Prisma.RolPermissionsOrderByRelationAggregateInput;
    menuPermissions?: Prisma.MenuPermissionsOrderByRelationAggregateInput;
    userPermissions?: Prisma.UserPermissionsOrderByRelationAggregateInput;
};
export type PermissionsWhereUniqueInput = Prisma.AtLeast<{
    permissionsId?: number;
    AND?: Prisma.PermissionsWhereInput | Prisma.PermissionsWhereInput[];
    OR?: Prisma.PermissionsWhereInput[];
    NOT?: Prisma.PermissionsWhereInput | Prisma.PermissionsWhereInput[];
    resource?: Prisma.StringFilter<"Permissions"> | string;
    action?: Prisma.StringFilter<"Permissions"> | string;
    deletedAt?: Prisma.DateTimeNullableFilter<"Permissions"> | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsListRelationFilter;
    menuPermissions?: Prisma.MenuPermissionsListRelationFilter;
    userPermissions?: Prisma.UserPermissionsListRelationFilter;
}, "permissionsId">;
export type PermissionsOrderByWithAggregationInput = {
    permissionsId?: Prisma.SortOrder;
    resource?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.PermissionsCountOrderByAggregateInput;
    _avg?: Prisma.PermissionsAvgOrderByAggregateInput;
    _max?: Prisma.PermissionsMaxOrderByAggregateInput;
    _min?: Prisma.PermissionsMinOrderByAggregateInput;
    _sum?: Prisma.PermissionsSumOrderByAggregateInput;
};
export type PermissionsScalarWhereWithAggregatesInput = {
    AND?: Prisma.PermissionsScalarWhereWithAggregatesInput | Prisma.PermissionsScalarWhereWithAggregatesInput[];
    OR?: Prisma.PermissionsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PermissionsScalarWhereWithAggregatesInput | Prisma.PermissionsScalarWhereWithAggregatesInput[];
    permissionsId?: Prisma.IntWithAggregatesFilter<"Permissions"> | number;
    resource?: Prisma.StringWithAggregatesFilter<"Permissions"> | string;
    action?: Prisma.StringWithAggregatesFilter<"Permissions"> | string;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Permissions"> | Date | string | null;
};
export type PermissionsCreateInput = {
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsCreateNestedManyWithoutPermissionsInput;
    menuPermissions?: Prisma.MenuPermissionsCreateNestedManyWithoutPermissionsInput;
    userPermissions?: Prisma.UserPermissionsCreateNestedManyWithoutPermissionsInput;
};
export type PermissionsUncheckedCreateInput = {
    permissionsId?: number;
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
    menuPermissions?: Prisma.MenuPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
    userPermissions?: Prisma.UserPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
};
export type PermissionsUpdateInput = {
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUpdateManyWithoutPermissionsNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUpdateManyWithoutPermissionsNestedInput;
    userPermissions?: Prisma.UserPermissionsUpdateManyWithoutPermissionsNestedInput;
};
export type PermissionsUncheckedUpdateInput = {
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
    userPermissions?: Prisma.UserPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
};
export type PermissionsCreateManyInput = {
    permissionsId?: number;
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
};
export type PermissionsUpdateManyMutationInput = {
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type PermissionsUncheckedUpdateManyInput = {
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type PermissionsScalarRelationFilter = {
    is?: Prisma.PermissionsWhereInput;
    isNot?: Prisma.PermissionsWhereInput;
};
export type PermissionsCountOrderByAggregateInput = {
    permissionsId?: Prisma.SortOrder;
    resource?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type PermissionsAvgOrderByAggregateInput = {
    permissionsId?: Prisma.SortOrder;
};
export type PermissionsMaxOrderByAggregateInput = {
    permissionsId?: Prisma.SortOrder;
    resource?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type PermissionsMinOrderByAggregateInput = {
    permissionsId?: Prisma.SortOrder;
    resource?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type PermissionsSumOrderByAggregateInput = {
    permissionsId?: Prisma.SortOrder;
};
export type PermissionsCreateNestedOneWithoutMenuPermissionsInput = {
    create?: Prisma.XOR<Prisma.PermissionsCreateWithoutMenuPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutMenuPermissionsInput>;
    connectOrCreate?: Prisma.PermissionsCreateOrConnectWithoutMenuPermissionsInput;
    connect?: Prisma.PermissionsWhereUniqueInput;
};
export type PermissionsUpdateOneRequiredWithoutMenuPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.PermissionsCreateWithoutMenuPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutMenuPermissionsInput>;
    connectOrCreate?: Prisma.PermissionsCreateOrConnectWithoutMenuPermissionsInput;
    upsert?: Prisma.PermissionsUpsertWithoutMenuPermissionsInput;
    connect?: Prisma.PermissionsWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PermissionsUpdateToOneWithWhereWithoutMenuPermissionsInput, Prisma.PermissionsUpdateWithoutMenuPermissionsInput>, Prisma.PermissionsUncheckedUpdateWithoutMenuPermissionsInput>;
};
export type PermissionsCreateNestedOneWithoutRolPermissionsInput = {
    create?: Prisma.XOR<Prisma.PermissionsCreateWithoutRolPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutRolPermissionsInput>;
    connectOrCreate?: Prisma.PermissionsCreateOrConnectWithoutRolPermissionsInput;
    connect?: Prisma.PermissionsWhereUniqueInput;
};
export type PermissionsUpdateOneRequiredWithoutRolPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.PermissionsCreateWithoutRolPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutRolPermissionsInput>;
    connectOrCreate?: Prisma.PermissionsCreateOrConnectWithoutRolPermissionsInput;
    upsert?: Prisma.PermissionsUpsertWithoutRolPermissionsInput;
    connect?: Prisma.PermissionsWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PermissionsUpdateToOneWithWhereWithoutRolPermissionsInput, Prisma.PermissionsUpdateWithoutRolPermissionsInput>, Prisma.PermissionsUncheckedUpdateWithoutRolPermissionsInput>;
};
export type PermissionsCreateNestedOneWithoutUserPermissionsInput = {
    create?: Prisma.XOR<Prisma.PermissionsCreateWithoutUserPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutUserPermissionsInput>;
    connectOrCreate?: Prisma.PermissionsCreateOrConnectWithoutUserPermissionsInput;
    connect?: Prisma.PermissionsWhereUniqueInput;
};
export type PermissionsUpdateOneRequiredWithoutUserPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.PermissionsCreateWithoutUserPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutUserPermissionsInput>;
    connectOrCreate?: Prisma.PermissionsCreateOrConnectWithoutUserPermissionsInput;
    upsert?: Prisma.PermissionsUpsertWithoutUserPermissionsInput;
    connect?: Prisma.PermissionsWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PermissionsUpdateToOneWithWhereWithoutUserPermissionsInput, Prisma.PermissionsUpdateWithoutUserPermissionsInput>, Prisma.PermissionsUncheckedUpdateWithoutUserPermissionsInput>;
};
export type PermissionsCreateWithoutMenuPermissionsInput = {
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsCreateNestedManyWithoutPermissionsInput;
    userPermissions?: Prisma.UserPermissionsCreateNestedManyWithoutPermissionsInput;
};
export type PermissionsUncheckedCreateWithoutMenuPermissionsInput = {
    permissionsId?: number;
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
    userPermissions?: Prisma.UserPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
};
export type PermissionsCreateOrConnectWithoutMenuPermissionsInput = {
    where: Prisma.PermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.PermissionsCreateWithoutMenuPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutMenuPermissionsInput>;
};
export type PermissionsUpsertWithoutMenuPermissionsInput = {
    update: Prisma.XOR<Prisma.PermissionsUpdateWithoutMenuPermissionsInput, Prisma.PermissionsUncheckedUpdateWithoutMenuPermissionsInput>;
    create: Prisma.XOR<Prisma.PermissionsCreateWithoutMenuPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutMenuPermissionsInput>;
    where?: Prisma.PermissionsWhereInput;
};
export type PermissionsUpdateToOneWithWhereWithoutMenuPermissionsInput = {
    where?: Prisma.PermissionsWhereInput;
    data: Prisma.XOR<Prisma.PermissionsUpdateWithoutMenuPermissionsInput, Prisma.PermissionsUncheckedUpdateWithoutMenuPermissionsInput>;
};
export type PermissionsUpdateWithoutMenuPermissionsInput = {
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUpdateManyWithoutPermissionsNestedInput;
    userPermissions?: Prisma.UserPermissionsUpdateManyWithoutPermissionsNestedInput;
};
export type PermissionsUncheckedUpdateWithoutMenuPermissionsInput = {
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
    userPermissions?: Prisma.UserPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
};
export type PermissionsCreateWithoutRolPermissionsInput = {
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
    menuPermissions?: Prisma.MenuPermissionsCreateNestedManyWithoutPermissionsInput;
    userPermissions?: Prisma.UserPermissionsCreateNestedManyWithoutPermissionsInput;
};
export type PermissionsUncheckedCreateWithoutRolPermissionsInput = {
    permissionsId?: number;
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
    menuPermissions?: Prisma.MenuPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
    userPermissions?: Prisma.UserPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
};
export type PermissionsCreateOrConnectWithoutRolPermissionsInput = {
    where: Prisma.PermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.PermissionsCreateWithoutRolPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutRolPermissionsInput>;
};
export type PermissionsUpsertWithoutRolPermissionsInput = {
    update: Prisma.XOR<Prisma.PermissionsUpdateWithoutRolPermissionsInput, Prisma.PermissionsUncheckedUpdateWithoutRolPermissionsInput>;
    create: Prisma.XOR<Prisma.PermissionsCreateWithoutRolPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutRolPermissionsInput>;
    where?: Prisma.PermissionsWhereInput;
};
export type PermissionsUpdateToOneWithWhereWithoutRolPermissionsInput = {
    where?: Prisma.PermissionsWhereInput;
    data: Prisma.XOR<Prisma.PermissionsUpdateWithoutRolPermissionsInput, Prisma.PermissionsUncheckedUpdateWithoutRolPermissionsInput>;
};
export type PermissionsUpdateWithoutRolPermissionsInput = {
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    menuPermissions?: Prisma.MenuPermissionsUpdateManyWithoutPermissionsNestedInput;
    userPermissions?: Prisma.UserPermissionsUpdateManyWithoutPermissionsNestedInput;
};
export type PermissionsUncheckedUpdateWithoutRolPermissionsInput = {
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    menuPermissions?: Prisma.MenuPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
    userPermissions?: Prisma.UserPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
};
export type PermissionsCreateWithoutUserPermissionsInput = {
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsCreateNestedManyWithoutPermissionsInput;
    menuPermissions?: Prisma.MenuPermissionsCreateNestedManyWithoutPermissionsInput;
};
export type PermissionsUncheckedCreateWithoutUserPermissionsInput = {
    permissionsId?: number;
    resource: string;
    action: string;
    deletedAt?: Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
    menuPermissions?: Prisma.MenuPermissionsUncheckedCreateNestedManyWithoutPermissionsInput;
};
export type PermissionsCreateOrConnectWithoutUserPermissionsInput = {
    where: Prisma.PermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.PermissionsCreateWithoutUserPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutUserPermissionsInput>;
};
export type PermissionsUpsertWithoutUserPermissionsInput = {
    update: Prisma.XOR<Prisma.PermissionsUpdateWithoutUserPermissionsInput, Prisma.PermissionsUncheckedUpdateWithoutUserPermissionsInput>;
    create: Prisma.XOR<Prisma.PermissionsCreateWithoutUserPermissionsInput, Prisma.PermissionsUncheckedCreateWithoutUserPermissionsInput>;
    where?: Prisma.PermissionsWhereInput;
};
export type PermissionsUpdateToOneWithWhereWithoutUserPermissionsInput = {
    where?: Prisma.PermissionsWhereInput;
    data: Prisma.XOR<Prisma.PermissionsUpdateWithoutUserPermissionsInput, Prisma.PermissionsUncheckedUpdateWithoutUserPermissionsInput>;
};
export type PermissionsUpdateWithoutUserPermissionsInput = {
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUpdateManyWithoutPermissionsNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUpdateManyWithoutPermissionsNestedInput;
};
export type PermissionsUncheckedUpdateWithoutUserPermissionsInput = {
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    resource?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    rolPermissions?: Prisma.RolPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput;
};
export type PermissionsCountOutputType = {
    rolPermissions: number;
    menuPermissions: number;
    userPermissions: number;
};
export type PermissionsCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    rolPermissions?: boolean | PermissionsCountOutputTypeCountRolPermissionsArgs;
    menuPermissions?: boolean | PermissionsCountOutputTypeCountMenuPermissionsArgs;
    userPermissions?: boolean | PermissionsCountOutputTypeCountUserPermissionsArgs;
};
export type PermissionsCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsCountOutputTypeSelect<ExtArgs> | null;
};
export type PermissionsCountOutputTypeCountRolPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RolPermissionsWhereInput;
};
export type PermissionsCountOutputTypeCountMenuPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenuPermissionsWhereInput;
};
export type PermissionsCountOutputTypeCountUserPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserPermissionsWhereInput;
};
export type PermissionsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    permissionsId?: boolean;
    resource?: boolean;
    action?: boolean;
    deletedAt?: boolean;
    rolPermissions?: boolean | Prisma.Permissions$rolPermissionsArgs<ExtArgs>;
    menuPermissions?: boolean | Prisma.Permissions$menuPermissionsArgs<ExtArgs>;
    userPermissions?: boolean | Prisma.Permissions$userPermissionsArgs<ExtArgs>;
    _count?: boolean | Prisma.PermissionsCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["permissions"]>;
export type PermissionsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    permissionsId?: boolean;
    resource?: boolean;
    action?: boolean;
    deletedAt?: boolean;
}, ExtArgs["result"]["permissions"]>;
export type PermissionsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    permissionsId?: boolean;
    resource?: boolean;
    action?: boolean;
    deletedAt?: boolean;
}, ExtArgs["result"]["permissions"]>;
export type PermissionsSelectScalar = {
    permissionsId?: boolean;
    resource?: boolean;
    action?: boolean;
    deletedAt?: boolean;
};
export type PermissionsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"permissionsId" | "resource" | "action" | "deletedAt", ExtArgs["result"]["permissions"]>;
export type PermissionsInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    rolPermissions?: boolean | Prisma.Permissions$rolPermissionsArgs<ExtArgs>;
    menuPermissions?: boolean | Prisma.Permissions$menuPermissionsArgs<ExtArgs>;
    userPermissions?: boolean | Prisma.Permissions$userPermissionsArgs<ExtArgs>;
    _count?: boolean | Prisma.PermissionsCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PermissionsIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type PermissionsIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $PermissionsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Permissions";
    objects: {
        rolPermissions: Prisma.$RolPermissionsPayload<ExtArgs>[];
        menuPermissions: Prisma.$MenuPermissionsPayload<ExtArgs>[];
        userPermissions: Prisma.$UserPermissionsPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        permissionsId: number;
        resource: string;
        action: string;
        deletedAt: Date | null;
    }, ExtArgs["result"]["permissions"]>;
    composites: {};
};
export type PermissionsGetPayload<S extends boolean | null | undefined | PermissionsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PermissionsPayload, S>;
export type PermissionsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PermissionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PermissionsCountAggregateInputType | true;
};
export interface PermissionsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Permissions'];
        meta: {
            name: 'Permissions';
        };
    };
    findUnique<T extends PermissionsFindUniqueArgs>(args: Prisma.SelectSubset<T, PermissionsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PermissionsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PermissionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PermissionsFindFirstArgs>(args?: Prisma.SelectSubset<T, PermissionsFindFirstArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PermissionsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PermissionsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PermissionsFindManyArgs>(args?: Prisma.SelectSubset<T, PermissionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PermissionsCreateArgs>(args: Prisma.SelectSubset<T, PermissionsCreateArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PermissionsCreateManyArgs>(args?: Prisma.SelectSubset<T, PermissionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PermissionsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PermissionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PermissionsDeleteArgs>(args: Prisma.SelectSubset<T, PermissionsDeleteArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PermissionsUpdateArgs>(args: Prisma.SelectSubset<T, PermissionsUpdateArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PermissionsDeleteManyArgs>(args?: Prisma.SelectSubset<T, PermissionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PermissionsUpdateManyArgs>(args: Prisma.SelectSubset<T, PermissionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PermissionsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PermissionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PermissionsUpsertArgs>(args: Prisma.SelectSubset<T, PermissionsUpsertArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PermissionsCountArgs>(args?: Prisma.Subset<T, PermissionsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PermissionsCountAggregateOutputType> : number>;
    aggregate<T extends PermissionsAggregateArgs>(args: Prisma.Subset<T, PermissionsAggregateArgs>): Prisma.PrismaPromise<GetPermissionsAggregateType<T>>;
    groupBy<T extends PermissionsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PermissionsGroupByArgs['orderBy'];
    } : {
        orderBy?: PermissionsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PermissionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPermissionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PermissionsFieldRefs;
}
export interface Prisma__PermissionsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    rolPermissions<T extends Prisma.Permissions$rolPermissionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Permissions$rolPermissionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    menuPermissions<T extends Prisma.Permissions$menuPermissionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Permissions$menuPermissionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    userPermissions<T extends Prisma.Permissions$userPermissionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Permissions$userPermissionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PermissionsFieldRefs {
    readonly permissionsId: Prisma.FieldRef<"Permissions", 'Int'>;
    readonly resource: Prisma.FieldRef<"Permissions", 'String'>;
    readonly action: Prisma.FieldRef<"Permissions", 'String'>;
    readonly deletedAt: Prisma.FieldRef<"Permissions", 'DateTime'>;
}
export type PermissionsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    where: Prisma.PermissionsWhereUniqueInput;
};
export type PermissionsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    where: Prisma.PermissionsWhereUniqueInput;
};
export type PermissionsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    where?: Prisma.PermissionsWhereInput;
    orderBy?: Prisma.PermissionsOrderByWithRelationInput | Prisma.PermissionsOrderByWithRelationInput[];
    cursor?: Prisma.PermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PermissionsScalarFieldEnum | Prisma.PermissionsScalarFieldEnum[];
};
export type PermissionsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    where?: Prisma.PermissionsWhereInput;
    orderBy?: Prisma.PermissionsOrderByWithRelationInput | Prisma.PermissionsOrderByWithRelationInput[];
    cursor?: Prisma.PermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PermissionsScalarFieldEnum | Prisma.PermissionsScalarFieldEnum[];
};
export type PermissionsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    where?: Prisma.PermissionsWhereInput;
    orderBy?: Prisma.PermissionsOrderByWithRelationInput | Prisma.PermissionsOrderByWithRelationInput[];
    cursor?: Prisma.PermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PermissionsScalarFieldEnum | Prisma.PermissionsScalarFieldEnum[];
};
export type PermissionsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PermissionsCreateInput, Prisma.PermissionsUncheckedCreateInput>;
};
export type PermissionsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PermissionsCreateManyInput | Prisma.PermissionsCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PermissionsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    data: Prisma.PermissionsCreateManyInput | Prisma.PermissionsCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PermissionsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PermissionsUpdateInput, Prisma.PermissionsUncheckedUpdateInput>;
    where: Prisma.PermissionsWhereUniqueInput;
};
export type PermissionsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PermissionsUpdateManyMutationInput, Prisma.PermissionsUncheckedUpdateManyInput>;
    where?: Prisma.PermissionsWhereInput;
    limit?: number;
};
export type PermissionsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PermissionsUpdateManyMutationInput, Prisma.PermissionsUncheckedUpdateManyInput>;
    where?: Prisma.PermissionsWhereInput;
    limit?: number;
};
export type PermissionsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    where: Prisma.PermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.PermissionsCreateInput, Prisma.PermissionsUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PermissionsUpdateInput, Prisma.PermissionsUncheckedUpdateInput>;
};
export type PermissionsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
    where: Prisma.PermissionsWhereUniqueInput;
};
export type PermissionsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PermissionsWhereInput;
    limit?: number;
};
export type Permissions$rolPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Permissions$menuPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    include?: Prisma.MenuPermissionsInclude<ExtArgs> | null;
    where?: Prisma.MenuPermissionsWhereInput;
    orderBy?: Prisma.MenuPermissionsOrderByWithRelationInput | Prisma.MenuPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.MenuPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MenuPermissionsScalarFieldEnum | Prisma.MenuPermissionsScalarFieldEnum[];
};
export type Permissions$userPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PermissionsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PermissionsSelect<ExtArgs> | null;
    omit?: Prisma.PermissionsOmit<ExtArgs> | null;
    include?: Prisma.PermissionsInclude<ExtArgs> | null;
};
export {};
