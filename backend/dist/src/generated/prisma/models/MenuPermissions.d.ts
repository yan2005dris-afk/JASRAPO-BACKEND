import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MenuPermissionsModel = runtime.Types.Result.DefaultSelection<Prisma.$MenuPermissionsPayload>;
export type AggregateMenuPermissions = {
    _count: MenuPermissionsCountAggregateOutputType | null;
    _avg: MenuPermissionsAvgAggregateOutputType | null;
    _sum: MenuPermissionsSumAggregateOutputType | null;
    _min: MenuPermissionsMinAggregateOutputType | null;
    _max: MenuPermissionsMaxAggregateOutputType | null;
};
export type MenuPermissionsAvgAggregateOutputType = {
    rolMenusId: number | null;
    permissionsId: number | null;
    menusId: number | null;
};
export type MenuPermissionsSumAggregateOutputType = {
    rolMenusId: number | null;
    permissionsId: number | null;
    menusId: number | null;
};
export type MenuPermissionsMinAggregateOutputType = {
    rolMenusId: number | null;
    permissionsId: number | null;
    menusId: number | null;
    deletedAt: Date | null;
};
export type MenuPermissionsMaxAggregateOutputType = {
    rolMenusId: number | null;
    permissionsId: number | null;
    menusId: number | null;
    deletedAt: Date | null;
};
export type MenuPermissionsCountAggregateOutputType = {
    rolMenusId: number;
    permissionsId: number;
    menusId: number;
    deletedAt: number;
    _all: number;
};
export type MenuPermissionsAvgAggregateInputType = {
    rolMenusId?: true;
    permissionsId?: true;
    menusId?: true;
};
export type MenuPermissionsSumAggregateInputType = {
    rolMenusId?: true;
    permissionsId?: true;
    menusId?: true;
};
export type MenuPermissionsMinAggregateInputType = {
    rolMenusId?: true;
    permissionsId?: true;
    menusId?: true;
    deletedAt?: true;
};
export type MenuPermissionsMaxAggregateInputType = {
    rolMenusId?: true;
    permissionsId?: true;
    menusId?: true;
    deletedAt?: true;
};
export type MenuPermissionsCountAggregateInputType = {
    rolMenusId?: true;
    permissionsId?: true;
    menusId?: true;
    deletedAt?: true;
    _all?: true;
};
export type MenuPermissionsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenuPermissionsWhereInput;
    orderBy?: Prisma.MenuPermissionsOrderByWithRelationInput | Prisma.MenuPermissionsOrderByWithRelationInput[];
    cursor?: Prisma.MenuPermissionsWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MenuPermissionsCountAggregateInputType;
    _avg?: MenuPermissionsAvgAggregateInputType;
    _sum?: MenuPermissionsSumAggregateInputType;
    _min?: MenuPermissionsMinAggregateInputType;
    _max?: MenuPermissionsMaxAggregateInputType;
};
export type GetMenuPermissionsAggregateType<T extends MenuPermissionsAggregateArgs> = {
    [P in keyof T & keyof AggregateMenuPermissions]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMenuPermissions[P]> : Prisma.GetScalarType<T[P], AggregateMenuPermissions[P]>;
};
export type MenuPermissionsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenuPermissionsWhereInput;
    orderBy?: Prisma.MenuPermissionsOrderByWithAggregationInput | Prisma.MenuPermissionsOrderByWithAggregationInput[];
    by: Prisma.MenuPermissionsScalarFieldEnum[] | Prisma.MenuPermissionsScalarFieldEnum;
    having?: Prisma.MenuPermissionsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MenuPermissionsCountAggregateInputType | true;
    _avg?: MenuPermissionsAvgAggregateInputType;
    _sum?: MenuPermissionsSumAggregateInputType;
    _min?: MenuPermissionsMinAggregateInputType;
    _max?: MenuPermissionsMaxAggregateInputType;
};
export type MenuPermissionsGroupByOutputType = {
    rolMenusId: number;
    permissionsId: number;
    menusId: number;
    deletedAt: Date | null;
    _count: MenuPermissionsCountAggregateOutputType | null;
    _avg: MenuPermissionsAvgAggregateOutputType | null;
    _sum: MenuPermissionsSumAggregateOutputType | null;
    _min: MenuPermissionsMinAggregateOutputType | null;
    _max: MenuPermissionsMaxAggregateOutputType | null;
};
type GetMenuPermissionsGroupByPayload<T extends MenuPermissionsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MenuPermissionsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MenuPermissionsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MenuPermissionsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MenuPermissionsGroupByOutputType[P]>;
}>>;
export type MenuPermissionsWhereInput = {
    AND?: Prisma.MenuPermissionsWhereInput | Prisma.MenuPermissionsWhereInput[];
    OR?: Prisma.MenuPermissionsWhereInput[];
    NOT?: Prisma.MenuPermissionsWhereInput | Prisma.MenuPermissionsWhereInput[];
    rolMenusId?: Prisma.IntFilter<"MenuPermissions"> | number;
    permissionsId?: Prisma.IntFilter<"MenuPermissions"> | number;
    menusId?: Prisma.IntFilter<"MenuPermissions"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"MenuPermissions"> | Date | string | null;
    permissions?: Prisma.XOR<Prisma.PermissionsScalarRelationFilter, Prisma.PermissionsWhereInput>;
    menus?: Prisma.XOR<Prisma.MenusScalarRelationFilter, Prisma.MenusWhereInput>;
};
export type MenuPermissionsOrderByWithRelationInput = {
    rolMenusId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    menusId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    permissions?: Prisma.PermissionsOrderByWithRelationInput;
    menus?: Prisma.MenusOrderByWithRelationInput;
};
export type MenuPermissionsWhereUniqueInput = Prisma.AtLeast<{
    rolMenusId?: number;
    AND?: Prisma.MenuPermissionsWhereInput | Prisma.MenuPermissionsWhereInput[];
    OR?: Prisma.MenuPermissionsWhereInput[];
    NOT?: Prisma.MenuPermissionsWhereInput | Prisma.MenuPermissionsWhereInput[];
    permissionsId?: Prisma.IntFilter<"MenuPermissions"> | number;
    menusId?: Prisma.IntFilter<"MenuPermissions"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"MenuPermissions"> | Date | string | null;
    permissions?: Prisma.XOR<Prisma.PermissionsScalarRelationFilter, Prisma.PermissionsWhereInput>;
    menus?: Prisma.XOR<Prisma.MenusScalarRelationFilter, Prisma.MenusWhereInput>;
}, "rolMenusId">;
export type MenuPermissionsOrderByWithAggregationInput = {
    rolMenusId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    menusId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.MenuPermissionsCountOrderByAggregateInput;
    _avg?: Prisma.MenuPermissionsAvgOrderByAggregateInput;
    _max?: Prisma.MenuPermissionsMaxOrderByAggregateInput;
    _min?: Prisma.MenuPermissionsMinOrderByAggregateInput;
    _sum?: Prisma.MenuPermissionsSumOrderByAggregateInput;
};
export type MenuPermissionsScalarWhereWithAggregatesInput = {
    AND?: Prisma.MenuPermissionsScalarWhereWithAggregatesInput | Prisma.MenuPermissionsScalarWhereWithAggregatesInput[];
    OR?: Prisma.MenuPermissionsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MenuPermissionsScalarWhereWithAggregatesInput | Prisma.MenuPermissionsScalarWhereWithAggregatesInput[];
    rolMenusId?: Prisma.IntWithAggregatesFilter<"MenuPermissions"> | number;
    permissionsId?: Prisma.IntWithAggregatesFilter<"MenuPermissions"> | number;
    menusId?: Prisma.IntWithAggregatesFilter<"MenuPermissions"> | number;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"MenuPermissions"> | Date | string | null;
};
export type MenuPermissionsCreateInput = {
    deletedAt?: Date | string | null;
    permissions: Prisma.PermissionsCreateNestedOneWithoutMenuPermissionsInput;
    menus: Prisma.MenusCreateNestedOneWithoutMenuPermissionsInput;
};
export type MenuPermissionsUncheckedCreateInput = {
    rolMenusId?: number;
    permissionsId: number;
    menusId: number;
    deletedAt?: Date | string | null;
};
export type MenuPermissionsUpdateInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    permissions?: Prisma.PermissionsUpdateOneRequiredWithoutMenuPermissionsNestedInput;
    menus?: Prisma.MenusUpdateOneRequiredWithoutMenuPermissionsNestedInput;
};
export type MenuPermissionsUncheckedUpdateInput = {
    rolMenusId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenuPermissionsCreateManyInput = {
    rolMenusId?: number;
    permissionsId: number;
    menusId: number;
    deletedAt?: Date | string | null;
};
export type MenuPermissionsUpdateManyMutationInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenuPermissionsUncheckedUpdateManyInput = {
    rolMenusId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenuPermissionsCountOrderByAggregateInput = {
    rolMenusId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    menusId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type MenuPermissionsAvgOrderByAggregateInput = {
    rolMenusId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    menusId?: Prisma.SortOrder;
};
export type MenuPermissionsMaxOrderByAggregateInput = {
    rolMenusId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    menusId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type MenuPermissionsMinOrderByAggregateInput = {
    rolMenusId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    menusId?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type MenuPermissionsSumOrderByAggregateInput = {
    rolMenusId?: Prisma.SortOrder;
    permissionsId?: Prisma.SortOrder;
    menusId?: Prisma.SortOrder;
};
export type MenuPermissionsListRelationFilter = {
    every?: Prisma.MenuPermissionsWhereInput;
    some?: Prisma.MenuPermissionsWhereInput;
    none?: Prisma.MenuPermissionsWhereInput;
};
export type MenuPermissionsOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type MenuPermissionsCreateNestedManyWithoutMenusInput = {
    create?: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutMenusInput, Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput> | Prisma.MenuPermissionsCreateWithoutMenusInput[] | Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput[];
    connectOrCreate?: Prisma.MenuPermissionsCreateOrConnectWithoutMenusInput | Prisma.MenuPermissionsCreateOrConnectWithoutMenusInput[];
    createMany?: Prisma.MenuPermissionsCreateManyMenusInputEnvelope;
    connect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
};
export type MenuPermissionsUncheckedCreateNestedManyWithoutMenusInput = {
    create?: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutMenusInput, Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput> | Prisma.MenuPermissionsCreateWithoutMenusInput[] | Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput[];
    connectOrCreate?: Prisma.MenuPermissionsCreateOrConnectWithoutMenusInput | Prisma.MenuPermissionsCreateOrConnectWithoutMenusInput[];
    createMany?: Prisma.MenuPermissionsCreateManyMenusInputEnvelope;
    connect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
};
export type MenuPermissionsUpdateManyWithoutMenusNestedInput = {
    create?: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutMenusInput, Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput> | Prisma.MenuPermissionsCreateWithoutMenusInput[] | Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput[];
    connectOrCreate?: Prisma.MenuPermissionsCreateOrConnectWithoutMenusInput | Prisma.MenuPermissionsCreateOrConnectWithoutMenusInput[];
    upsert?: Prisma.MenuPermissionsUpsertWithWhereUniqueWithoutMenusInput | Prisma.MenuPermissionsUpsertWithWhereUniqueWithoutMenusInput[];
    createMany?: Prisma.MenuPermissionsCreateManyMenusInputEnvelope;
    set?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    disconnect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    delete?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    connect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    update?: Prisma.MenuPermissionsUpdateWithWhereUniqueWithoutMenusInput | Prisma.MenuPermissionsUpdateWithWhereUniqueWithoutMenusInput[];
    updateMany?: Prisma.MenuPermissionsUpdateManyWithWhereWithoutMenusInput | Prisma.MenuPermissionsUpdateManyWithWhereWithoutMenusInput[];
    deleteMany?: Prisma.MenuPermissionsScalarWhereInput | Prisma.MenuPermissionsScalarWhereInput[];
};
export type MenuPermissionsUncheckedUpdateManyWithoutMenusNestedInput = {
    create?: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutMenusInput, Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput> | Prisma.MenuPermissionsCreateWithoutMenusInput[] | Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput[];
    connectOrCreate?: Prisma.MenuPermissionsCreateOrConnectWithoutMenusInput | Prisma.MenuPermissionsCreateOrConnectWithoutMenusInput[];
    upsert?: Prisma.MenuPermissionsUpsertWithWhereUniqueWithoutMenusInput | Prisma.MenuPermissionsUpsertWithWhereUniqueWithoutMenusInput[];
    createMany?: Prisma.MenuPermissionsCreateManyMenusInputEnvelope;
    set?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    disconnect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    delete?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    connect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    update?: Prisma.MenuPermissionsUpdateWithWhereUniqueWithoutMenusInput | Prisma.MenuPermissionsUpdateWithWhereUniqueWithoutMenusInput[];
    updateMany?: Prisma.MenuPermissionsUpdateManyWithWhereWithoutMenusInput | Prisma.MenuPermissionsUpdateManyWithWhereWithoutMenusInput[];
    deleteMany?: Prisma.MenuPermissionsScalarWhereInput | Prisma.MenuPermissionsScalarWhereInput[];
};
export type MenuPermissionsCreateNestedManyWithoutPermissionsInput = {
    create?: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutPermissionsInput, Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.MenuPermissionsCreateWithoutPermissionsInput[] | Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.MenuPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.MenuPermissionsCreateOrConnectWithoutPermissionsInput[];
    createMany?: Prisma.MenuPermissionsCreateManyPermissionsInputEnvelope;
    connect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
};
export type MenuPermissionsUncheckedCreateNestedManyWithoutPermissionsInput = {
    create?: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutPermissionsInput, Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.MenuPermissionsCreateWithoutPermissionsInput[] | Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.MenuPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.MenuPermissionsCreateOrConnectWithoutPermissionsInput[];
    createMany?: Prisma.MenuPermissionsCreateManyPermissionsInputEnvelope;
    connect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
};
export type MenuPermissionsUpdateManyWithoutPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutPermissionsInput, Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.MenuPermissionsCreateWithoutPermissionsInput[] | Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.MenuPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.MenuPermissionsCreateOrConnectWithoutPermissionsInput[];
    upsert?: Prisma.MenuPermissionsUpsertWithWhereUniqueWithoutPermissionsInput | Prisma.MenuPermissionsUpsertWithWhereUniqueWithoutPermissionsInput[];
    createMany?: Prisma.MenuPermissionsCreateManyPermissionsInputEnvelope;
    set?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    disconnect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    delete?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    connect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    update?: Prisma.MenuPermissionsUpdateWithWhereUniqueWithoutPermissionsInput | Prisma.MenuPermissionsUpdateWithWhereUniqueWithoutPermissionsInput[];
    updateMany?: Prisma.MenuPermissionsUpdateManyWithWhereWithoutPermissionsInput | Prisma.MenuPermissionsUpdateManyWithWhereWithoutPermissionsInput[];
    deleteMany?: Prisma.MenuPermissionsScalarWhereInput | Prisma.MenuPermissionsScalarWhereInput[];
};
export type MenuPermissionsUncheckedUpdateManyWithoutPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutPermissionsInput, Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput> | Prisma.MenuPermissionsCreateWithoutPermissionsInput[] | Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput[];
    connectOrCreate?: Prisma.MenuPermissionsCreateOrConnectWithoutPermissionsInput | Prisma.MenuPermissionsCreateOrConnectWithoutPermissionsInput[];
    upsert?: Prisma.MenuPermissionsUpsertWithWhereUniqueWithoutPermissionsInput | Prisma.MenuPermissionsUpsertWithWhereUniqueWithoutPermissionsInput[];
    createMany?: Prisma.MenuPermissionsCreateManyPermissionsInputEnvelope;
    set?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    disconnect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    delete?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    connect?: Prisma.MenuPermissionsWhereUniqueInput | Prisma.MenuPermissionsWhereUniqueInput[];
    update?: Prisma.MenuPermissionsUpdateWithWhereUniqueWithoutPermissionsInput | Prisma.MenuPermissionsUpdateWithWhereUniqueWithoutPermissionsInput[];
    updateMany?: Prisma.MenuPermissionsUpdateManyWithWhereWithoutPermissionsInput | Prisma.MenuPermissionsUpdateManyWithWhereWithoutPermissionsInput[];
    deleteMany?: Prisma.MenuPermissionsScalarWhereInput | Prisma.MenuPermissionsScalarWhereInput[];
};
export type MenuPermissionsCreateWithoutMenusInput = {
    deletedAt?: Date | string | null;
    permissions: Prisma.PermissionsCreateNestedOneWithoutMenuPermissionsInput;
};
export type MenuPermissionsUncheckedCreateWithoutMenusInput = {
    rolMenusId?: number;
    permissionsId: number;
    deletedAt?: Date | string | null;
};
export type MenuPermissionsCreateOrConnectWithoutMenusInput = {
    where: Prisma.MenuPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutMenusInput, Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput>;
};
export type MenuPermissionsCreateManyMenusInputEnvelope = {
    data: Prisma.MenuPermissionsCreateManyMenusInput | Prisma.MenuPermissionsCreateManyMenusInput[];
    skipDuplicates?: boolean;
};
export type MenuPermissionsUpsertWithWhereUniqueWithoutMenusInput = {
    where: Prisma.MenuPermissionsWhereUniqueInput;
    update: Prisma.XOR<Prisma.MenuPermissionsUpdateWithoutMenusInput, Prisma.MenuPermissionsUncheckedUpdateWithoutMenusInput>;
    create: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutMenusInput, Prisma.MenuPermissionsUncheckedCreateWithoutMenusInput>;
};
export type MenuPermissionsUpdateWithWhereUniqueWithoutMenusInput = {
    where: Prisma.MenuPermissionsWhereUniqueInput;
    data: Prisma.XOR<Prisma.MenuPermissionsUpdateWithoutMenusInput, Prisma.MenuPermissionsUncheckedUpdateWithoutMenusInput>;
};
export type MenuPermissionsUpdateManyWithWhereWithoutMenusInput = {
    where: Prisma.MenuPermissionsScalarWhereInput;
    data: Prisma.XOR<Prisma.MenuPermissionsUpdateManyMutationInput, Prisma.MenuPermissionsUncheckedUpdateManyWithoutMenusInput>;
};
export type MenuPermissionsScalarWhereInput = {
    AND?: Prisma.MenuPermissionsScalarWhereInput | Prisma.MenuPermissionsScalarWhereInput[];
    OR?: Prisma.MenuPermissionsScalarWhereInput[];
    NOT?: Prisma.MenuPermissionsScalarWhereInput | Prisma.MenuPermissionsScalarWhereInput[];
    rolMenusId?: Prisma.IntFilter<"MenuPermissions"> | number;
    permissionsId?: Prisma.IntFilter<"MenuPermissions"> | number;
    menusId?: Prisma.IntFilter<"MenuPermissions"> | number;
    deletedAt?: Prisma.DateTimeNullableFilter<"MenuPermissions"> | Date | string | null;
};
export type MenuPermissionsCreateWithoutPermissionsInput = {
    deletedAt?: Date | string | null;
    menus: Prisma.MenusCreateNestedOneWithoutMenuPermissionsInput;
};
export type MenuPermissionsUncheckedCreateWithoutPermissionsInput = {
    rolMenusId?: number;
    menusId: number;
    deletedAt?: Date | string | null;
};
export type MenuPermissionsCreateOrConnectWithoutPermissionsInput = {
    where: Prisma.MenuPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutPermissionsInput, Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput>;
};
export type MenuPermissionsCreateManyPermissionsInputEnvelope = {
    data: Prisma.MenuPermissionsCreateManyPermissionsInput | Prisma.MenuPermissionsCreateManyPermissionsInput[];
    skipDuplicates?: boolean;
};
export type MenuPermissionsUpsertWithWhereUniqueWithoutPermissionsInput = {
    where: Prisma.MenuPermissionsWhereUniqueInput;
    update: Prisma.XOR<Prisma.MenuPermissionsUpdateWithoutPermissionsInput, Prisma.MenuPermissionsUncheckedUpdateWithoutPermissionsInput>;
    create: Prisma.XOR<Prisma.MenuPermissionsCreateWithoutPermissionsInput, Prisma.MenuPermissionsUncheckedCreateWithoutPermissionsInput>;
};
export type MenuPermissionsUpdateWithWhereUniqueWithoutPermissionsInput = {
    where: Prisma.MenuPermissionsWhereUniqueInput;
    data: Prisma.XOR<Prisma.MenuPermissionsUpdateWithoutPermissionsInput, Prisma.MenuPermissionsUncheckedUpdateWithoutPermissionsInput>;
};
export type MenuPermissionsUpdateManyWithWhereWithoutPermissionsInput = {
    where: Prisma.MenuPermissionsScalarWhereInput;
    data: Prisma.XOR<Prisma.MenuPermissionsUpdateManyMutationInput, Prisma.MenuPermissionsUncheckedUpdateManyWithoutPermissionsInput>;
};
export type MenuPermissionsCreateManyMenusInput = {
    rolMenusId?: number;
    permissionsId: number;
    deletedAt?: Date | string | null;
};
export type MenuPermissionsUpdateWithoutMenusInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    permissions?: Prisma.PermissionsUpdateOneRequiredWithoutMenuPermissionsNestedInput;
};
export type MenuPermissionsUncheckedUpdateWithoutMenusInput = {
    rolMenusId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenuPermissionsUncheckedUpdateManyWithoutMenusInput = {
    rolMenusId?: Prisma.IntFieldUpdateOperationsInput | number;
    permissionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenuPermissionsCreateManyPermissionsInput = {
    rolMenusId?: number;
    menusId: number;
    deletedAt?: Date | string | null;
};
export type MenuPermissionsUpdateWithoutPermissionsInput = {
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    menus?: Prisma.MenusUpdateOneRequiredWithoutMenuPermissionsNestedInput;
};
export type MenuPermissionsUncheckedUpdateWithoutPermissionsInput = {
    rolMenusId?: Prisma.IntFieldUpdateOperationsInput | number;
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenuPermissionsUncheckedUpdateManyWithoutPermissionsInput = {
    rolMenusId?: Prisma.IntFieldUpdateOperationsInput | number;
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenuPermissionsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolMenusId?: boolean;
    permissionsId?: boolean;
    menusId?: boolean;
    deletedAt?: boolean;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
    menus?: boolean | Prisma.MenusDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["menuPermissions"]>;
export type MenuPermissionsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolMenusId?: boolean;
    permissionsId?: boolean;
    menusId?: boolean;
    deletedAt?: boolean;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
    menus?: boolean | Prisma.MenusDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["menuPermissions"]>;
export type MenuPermissionsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    rolMenusId?: boolean;
    permissionsId?: boolean;
    menusId?: boolean;
    deletedAt?: boolean;
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
    menus?: boolean | Prisma.MenusDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["menuPermissions"]>;
export type MenuPermissionsSelectScalar = {
    rolMenusId?: boolean;
    permissionsId?: boolean;
    menusId?: boolean;
    deletedAt?: boolean;
};
export type MenuPermissionsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"rolMenusId" | "permissionsId" | "menusId" | "deletedAt", ExtArgs["result"]["menuPermissions"]>;
export type MenuPermissionsInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
    menus?: boolean | Prisma.MenusDefaultArgs<ExtArgs>;
};
export type MenuPermissionsIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
    menus?: boolean | Prisma.MenusDefaultArgs<ExtArgs>;
};
export type MenuPermissionsIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    permissions?: boolean | Prisma.PermissionsDefaultArgs<ExtArgs>;
    menus?: boolean | Prisma.MenusDefaultArgs<ExtArgs>;
};
export type $MenuPermissionsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MenuPermissions";
    objects: {
        permissions: Prisma.$PermissionsPayload<ExtArgs>;
        menus: Prisma.$MenusPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        rolMenusId: number;
        permissionsId: number;
        menusId: number;
        deletedAt: Date | null;
    }, ExtArgs["result"]["menuPermissions"]>;
    composites: {};
};
export type MenuPermissionsGetPayload<S extends boolean | null | undefined | MenuPermissionsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload, S>;
export type MenuPermissionsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MenuPermissionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MenuPermissionsCountAggregateInputType | true;
};
export interface MenuPermissionsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MenuPermissions'];
        meta: {
            name: 'MenuPermissions';
        };
    };
    findUnique<T extends MenuPermissionsFindUniqueArgs>(args: Prisma.SelectSubset<T, MenuPermissionsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MenuPermissionsClient<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MenuPermissionsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MenuPermissionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MenuPermissionsClient<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MenuPermissionsFindFirstArgs>(args?: Prisma.SelectSubset<T, MenuPermissionsFindFirstArgs<ExtArgs>>): Prisma.Prisma__MenuPermissionsClient<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MenuPermissionsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MenuPermissionsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MenuPermissionsClient<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MenuPermissionsFindManyArgs>(args?: Prisma.SelectSubset<T, MenuPermissionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MenuPermissionsCreateArgs>(args: Prisma.SelectSubset<T, MenuPermissionsCreateArgs<ExtArgs>>): Prisma.Prisma__MenuPermissionsClient<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MenuPermissionsCreateManyArgs>(args?: Prisma.SelectSubset<T, MenuPermissionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MenuPermissionsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MenuPermissionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MenuPermissionsDeleteArgs>(args: Prisma.SelectSubset<T, MenuPermissionsDeleteArgs<ExtArgs>>): Prisma.Prisma__MenuPermissionsClient<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MenuPermissionsUpdateArgs>(args: Prisma.SelectSubset<T, MenuPermissionsUpdateArgs<ExtArgs>>): Prisma.Prisma__MenuPermissionsClient<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MenuPermissionsDeleteManyArgs>(args?: Prisma.SelectSubset<T, MenuPermissionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MenuPermissionsUpdateManyArgs>(args: Prisma.SelectSubset<T, MenuPermissionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MenuPermissionsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MenuPermissionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MenuPermissionsUpsertArgs>(args: Prisma.SelectSubset<T, MenuPermissionsUpsertArgs<ExtArgs>>): Prisma.Prisma__MenuPermissionsClient<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MenuPermissionsCountArgs>(args?: Prisma.Subset<T, MenuPermissionsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MenuPermissionsCountAggregateOutputType> : number>;
    aggregate<T extends MenuPermissionsAggregateArgs>(args: Prisma.Subset<T, MenuPermissionsAggregateArgs>): Prisma.PrismaPromise<GetMenuPermissionsAggregateType<T>>;
    groupBy<T extends MenuPermissionsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MenuPermissionsGroupByArgs['orderBy'];
    } : {
        orderBy?: MenuPermissionsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MenuPermissionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMenuPermissionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MenuPermissionsFieldRefs;
}
export interface Prisma__MenuPermissionsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    permissions<T extends Prisma.PermissionsDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PermissionsDefaultArgs<ExtArgs>>): Prisma.Prisma__PermissionsClient<runtime.Types.Result.GetResult<Prisma.$PermissionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    menus<T extends Prisma.MenusDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MenusDefaultArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MenuPermissionsFieldRefs {
    readonly rolMenusId: Prisma.FieldRef<"MenuPermissions", 'Int'>;
    readonly permissionsId: Prisma.FieldRef<"MenuPermissions", 'Int'>;
    readonly menusId: Prisma.FieldRef<"MenuPermissions", 'Int'>;
    readonly deletedAt: Prisma.FieldRef<"MenuPermissions", 'DateTime'>;
}
export type MenuPermissionsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    include?: Prisma.MenuPermissionsInclude<ExtArgs> | null;
    where: Prisma.MenuPermissionsWhereUniqueInput;
};
export type MenuPermissionsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    include?: Prisma.MenuPermissionsInclude<ExtArgs> | null;
    where: Prisma.MenuPermissionsWhereUniqueInput;
};
export type MenuPermissionsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MenuPermissionsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MenuPermissionsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MenuPermissionsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    include?: Prisma.MenuPermissionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MenuPermissionsCreateInput, Prisma.MenuPermissionsUncheckedCreateInput>;
};
export type MenuPermissionsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MenuPermissionsCreateManyInput | Prisma.MenuPermissionsCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MenuPermissionsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    data: Prisma.MenuPermissionsCreateManyInput | Prisma.MenuPermissionsCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.MenuPermissionsIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type MenuPermissionsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    include?: Prisma.MenuPermissionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MenuPermissionsUpdateInput, Prisma.MenuPermissionsUncheckedUpdateInput>;
    where: Prisma.MenuPermissionsWhereUniqueInput;
};
export type MenuPermissionsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MenuPermissionsUpdateManyMutationInput, Prisma.MenuPermissionsUncheckedUpdateManyInput>;
    where?: Prisma.MenuPermissionsWhereInput;
    limit?: number;
};
export type MenuPermissionsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MenuPermissionsUpdateManyMutationInput, Prisma.MenuPermissionsUncheckedUpdateManyInput>;
    where?: Prisma.MenuPermissionsWhereInput;
    limit?: number;
    include?: Prisma.MenuPermissionsIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type MenuPermissionsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    include?: Prisma.MenuPermissionsInclude<ExtArgs> | null;
    where: Prisma.MenuPermissionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.MenuPermissionsCreateInput, Prisma.MenuPermissionsUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MenuPermissionsUpdateInput, Prisma.MenuPermissionsUncheckedUpdateInput>;
};
export type MenuPermissionsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    include?: Prisma.MenuPermissionsInclude<ExtArgs> | null;
    where: Prisma.MenuPermissionsWhereUniqueInput;
};
export type MenuPermissionsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenuPermissionsWhereInput;
    limit?: number;
};
export type MenuPermissionsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenuPermissionsSelect<ExtArgs> | null;
    omit?: Prisma.MenuPermissionsOmit<ExtArgs> | null;
    include?: Prisma.MenuPermissionsInclude<ExtArgs> | null;
};
export {};
