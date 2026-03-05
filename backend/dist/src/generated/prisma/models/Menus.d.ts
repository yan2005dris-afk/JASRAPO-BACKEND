import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MenusModel = runtime.Types.Result.DefaultSelection<Prisma.$MenusPayload>;
export type AggregateMenus = {
    _count: MenusCountAggregateOutputType | null;
    _avg: MenusAvgAggregateOutputType | null;
    _sum: MenusSumAggregateOutputType | null;
    _min: MenusMinAggregateOutputType | null;
    _max: MenusMaxAggregateOutputType | null;
};
export type MenusAvgAggregateOutputType = {
    menusId: number | null;
    menusParentId: number | null;
};
export type MenusSumAggregateOutputType = {
    menusId: number | null;
    menusParentId: number | null;
};
export type MenusMinAggregateOutputType = {
    menusId: number | null;
    menusParentId: number | null;
    icon: string | null;
    name: string | null;
    route: string | null;
    active: boolean | null;
    deletedAt: Date | null;
};
export type MenusMaxAggregateOutputType = {
    menusId: number | null;
    menusParentId: number | null;
    icon: string | null;
    name: string | null;
    route: string | null;
    active: boolean | null;
    deletedAt: Date | null;
};
export type MenusCountAggregateOutputType = {
    menusId: number;
    menusParentId: number;
    icon: number;
    name: number;
    route: number;
    active: number;
    deletedAt: number;
    _all: number;
};
export type MenusAvgAggregateInputType = {
    menusId?: true;
    menusParentId?: true;
};
export type MenusSumAggregateInputType = {
    menusId?: true;
    menusParentId?: true;
};
export type MenusMinAggregateInputType = {
    menusId?: true;
    menusParentId?: true;
    icon?: true;
    name?: true;
    route?: true;
    active?: true;
    deletedAt?: true;
};
export type MenusMaxAggregateInputType = {
    menusId?: true;
    menusParentId?: true;
    icon?: true;
    name?: true;
    route?: true;
    active?: true;
    deletedAt?: true;
};
export type MenusCountAggregateInputType = {
    menusId?: true;
    menusParentId?: true;
    icon?: true;
    name?: true;
    route?: true;
    active?: true;
    deletedAt?: true;
    _all?: true;
};
export type MenusAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenusWhereInput;
    orderBy?: Prisma.MenusOrderByWithRelationInput | Prisma.MenusOrderByWithRelationInput[];
    cursor?: Prisma.MenusWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MenusCountAggregateInputType;
    _avg?: MenusAvgAggregateInputType;
    _sum?: MenusSumAggregateInputType;
    _min?: MenusMinAggregateInputType;
    _max?: MenusMaxAggregateInputType;
};
export type GetMenusAggregateType<T extends MenusAggregateArgs> = {
    [P in keyof T & keyof AggregateMenus]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMenus[P]> : Prisma.GetScalarType<T[P], AggregateMenus[P]>;
};
export type MenusGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenusWhereInput;
    orderBy?: Prisma.MenusOrderByWithAggregationInput | Prisma.MenusOrderByWithAggregationInput[];
    by: Prisma.MenusScalarFieldEnum[] | Prisma.MenusScalarFieldEnum;
    having?: Prisma.MenusScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MenusCountAggregateInputType | true;
    _avg?: MenusAvgAggregateInputType;
    _sum?: MenusSumAggregateInputType;
    _min?: MenusMinAggregateInputType;
    _max?: MenusMaxAggregateInputType;
};
export type MenusGroupByOutputType = {
    menusId: number;
    menusParentId: number | null;
    icon: string | null;
    name: string;
    route: string;
    active: boolean;
    deletedAt: Date | null;
    _count: MenusCountAggregateOutputType | null;
    _avg: MenusAvgAggregateOutputType | null;
    _sum: MenusSumAggregateOutputType | null;
    _min: MenusMinAggregateOutputType | null;
    _max: MenusMaxAggregateOutputType | null;
};
type GetMenusGroupByPayload<T extends MenusGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MenusGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MenusGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MenusGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MenusGroupByOutputType[P]>;
}>>;
export type MenusWhereInput = {
    AND?: Prisma.MenusWhereInput | Prisma.MenusWhereInput[];
    OR?: Prisma.MenusWhereInput[];
    NOT?: Prisma.MenusWhereInput | Prisma.MenusWhereInput[];
    menusId?: Prisma.IntFilter<"Menus"> | number;
    menusParentId?: Prisma.IntNullableFilter<"Menus"> | number | null;
    icon?: Prisma.StringNullableFilter<"Menus"> | string | null;
    name?: Prisma.StringFilter<"Menus"> | string;
    route?: Prisma.StringFilter<"Menus"> | string;
    active?: Prisma.BoolFilter<"Menus"> | boolean;
    deletedAt?: Prisma.DateTimeNullableFilter<"Menus"> | Date | string | null;
    parent?: Prisma.XOR<Prisma.MenusNullableScalarRelationFilter, Prisma.MenusWhereInput> | null;
    children?: Prisma.MenusListRelationFilter;
    menuPermissions?: Prisma.MenuPermissionsListRelationFilter;
};
export type MenusOrderByWithRelationInput = {
    menusId?: Prisma.SortOrder;
    menusParentId?: Prisma.SortOrderInput | Prisma.SortOrder;
    icon?: Prisma.SortOrderInput | Prisma.SortOrder;
    name?: Prisma.SortOrder;
    route?: Prisma.SortOrder;
    active?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    parent?: Prisma.MenusOrderByWithRelationInput;
    children?: Prisma.MenusOrderByRelationAggregateInput;
    menuPermissions?: Prisma.MenuPermissionsOrderByRelationAggregateInput;
};
export type MenusWhereUniqueInput = Prisma.AtLeast<{
    menusId?: number;
    AND?: Prisma.MenusWhereInput | Prisma.MenusWhereInput[];
    OR?: Prisma.MenusWhereInput[];
    NOT?: Prisma.MenusWhereInput | Prisma.MenusWhereInput[];
    menusParentId?: Prisma.IntNullableFilter<"Menus"> | number | null;
    icon?: Prisma.StringNullableFilter<"Menus"> | string | null;
    name?: Prisma.StringFilter<"Menus"> | string;
    route?: Prisma.StringFilter<"Menus"> | string;
    active?: Prisma.BoolFilter<"Menus"> | boolean;
    deletedAt?: Prisma.DateTimeNullableFilter<"Menus"> | Date | string | null;
    parent?: Prisma.XOR<Prisma.MenusNullableScalarRelationFilter, Prisma.MenusWhereInput> | null;
    children?: Prisma.MenusListRelationFilter;
    menuPermissions?: Prisma.MenuPermissionsListRelationFilter;
}, "menusId">;
export type MenusOrderByWithAggregationInput = {
    menusId?: Prisma.SortOrder;
    menusParentId?: Prisma.SortOrderInput | Prisma.SortOrder;
    icon?: Prisma.SortOrderInput | Prisma.SortOrder;
    name?: Prisma.SortOrder;
    route?: Prisma.SortOrder;
    active?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.MenusCountOrderByAggregateInput;
    _avg?: Prisma.MenusAvgOrderByAggregateInput;
    _max?: Prisma.MenusMaxOrderByAggregateInput;
    _min?: Prisma.MenusMinOrderByAggregateInput;
    _sum?: Prisma.MenusSumOrderByAggregateInput;
};
export type MenusScalarWhereWithAggregatesInput = {
    AND?: Prisma.MenusScalarWhereWithAggregatesInput | Prisma.MenusScalarWhereWithAggregatesInput[];
    OR?: Prisma.MenusScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MenusScalarWhereWithAggregatesInput | Prisma.MenusScalarWhereWithAggregatesInput[];
    menusId?: Prisma.IntWithAggregatesFilter<"Menus"> | number;
    menusParentId?: Prisma.IntNullableWithAggregatesFilter<"Menus"> | number | null;
    icon?: Prisma.StringNullableWithAggregatesFilter<"Menus"> | string | null;
    name?: Prisma.StringWithAggregatesFilter<"Menus"> | string;
    route?: Prisma.StringWithAggregatesFilter<"Menus"> | string;
    active?: Prisma.BoolWithAggregatesFilter<"Menus"> | boolean;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Menus"> | Date | string | null;
};
export type MenusCreateInput = {
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
    parent?: Prisma.MenusCreateNestedOneWithoutChildrenInput;
    children?: Prisma.MenusCreateNestedManyWithoutParentInput;
    menuPermissions?: Prisma.MenuPermissionsCreateNestedManyWithoutMenusInput;
};
export type MenusUncheckedCreateInput = {
    menusId?: number;
    menusParentId?: number | null;
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
    children?: Prisma.MenusUncheckedCreateNestedManyWithoutParentInput;
    menuPermissions?: Prisma.MenuPermissionsUncheckedCreateNestedManyWithoutMenusInput;
};
export type MenusUpdateInput = {
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    parent?: Prisma.MenusUpdateOneWithoutChildrenNestedInput;
    children?: Prisma.MenusUpdateManyWithoutParentNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUpdateManyWithoutMenusNestedInput;
};
export type MenusUncheckedUpdateInput = {
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    menusParentId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    children?: Prisma.MenusUncheckedUpdateManyWithoutParentNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUncheckedUpdateManyWithoutMenusNestedInput;
};
export type MenusCreateManyInput = {
    menusId?: number;
    menusParentId?: number | null;
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
};
export type MenusUpdateManyMutationInput = {
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenusUncheckedUpdateManyInput = {
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    menusParentId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenusScalarRelationFilter = {
    is?: Prisma.MenusWhereInput;
    isNot?: Prisma.MenusWhereInput;
};
export type MenusNullableScalarRelationFilter = {
    is?: Prisma.MenusWhereInput | null;
    isNot?: Prisma.MenusWhereInput | null;
};
export type MenusListRelationFilter = {
    every?: Prisma.MenusWhereInput;
    some?: Prisma.MenusWhereInput;
    none?: Prisma.MenusWhereInput;
};
export type MenusOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MenusCountOrderByAggregateInput = {
    menusId?: Prisma.SortOrder;
    menusParentId?: Prisma.SortOrder;
    icon?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    route?: Prisma.SortOrder;
    active?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type MenusAvgOrderByAggregateInput = {
    menusId?: Prisma.SortOrder;
    menusParentId?: Prisma.SortOrder;
};
export type MenusMaxOrderByAggregateInput = {
    menusId?: Prisma.SortOrder;
    menusParentId?: Prisma.SortOrder;
    icon?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    route?: Prisma.SortOrder;
    active?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type MenusMinOrderByAggregateInput = {
    menusId?: Prisma.SortOrder;
    menusParentId?: Prisma.SortOrder;
    icon?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    route?: Prisma.SortOrder;
    active?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type MenusSumOrderByAggregateInput = {
    menusId?: Prisma.SortOrder;
    menusParentId?: Prisma.SortOrder;
};
export type MenusCreateNestedOneWithoutMenuPermissionsInput = {
    create?: Prisma.XOR<Prisma.MenusCreateWithoutMenuPermissionsInput, Prisma.MenusUncheckedCreateWithoutMenuPermissionsInput>;
    connectOrCreate?: Prisma.MenusCreateOrConnectWithoutMenuPermissionsInput;
    connect?: Prisma.MenusWhereUniqueInput;
};
export type MenusUpdateOneRequiredWithoutMenuPermissionsNestedInput = {
    create?: Prisma.XOR<Prisma.MenusCreateWithoutMenuPermissionsInput, Prisma.MenusUncheckedCreateWithoutMenuPermissionsInput>;
    connectOrCreate?: Prisma.MenusCreateOrConnectWithoutMenuPermissionsInput;
    upsert?: Prisma.MenusUpsertWithoutMenuPermissionsInput;
    connect?: Prisma.MenusWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MenusUpdateToOneWithWhereWithoutMenuPermissionsInput, Prisma.MenusUpdateWithoutMenuPermissionsInput>, Prisma.MenusUncheckedUpdateWithoutMenuPermissionsInput>;
};
export type MenusCreateNestedOneWithoutChildrenInput = {
    create?: Prisma.XOR<Prisma.MenusCreateWithoutChildrenInput, Prisma.MenusUncheckedCreateWithoutChildrenInput>;
    connectOrCreate?: Prisma.MenusCreateOrConnectWithoutChildrenInput;
    connect?: Prisma.MenusWhereUniqueInput;
};
export type MenusCreateNestedManyWithoutParentInput = {
    create?: Prisma.XOR<Prisma.MenusCreateWithoutParentInput, Prisma.MenusUncheckedCreateWithoutParentInput> | Prisma.MenusCreateWithoutParentInput[] | Prisma.MenusUncheckedCreateWithoutParentInput[];
    connectOrCreate?: Prisma.MenusCreateOrConnectWithoutParentInput | Prisma.MenusCreateOrConnectWithoutParentInput[];
    createMany?: Prisma.MenusCreateManyParentInputEnvelope;
    connect?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
};
export type MenusUncheckedCreateNestedManyWithoutParentInput = {
    create?: Prisma.XOR<Prisma.MenusCreateWithoutParentInput, Prisma.MenusUncheckedCreateWithoutParentInput> | Prisma.MenusCreateWithoutParentInput[] | Prisma.MenusUncheckedCreateWithoutParentInput[];
    connectOrCreate?: Prisma.MenusCreateOrConnectWithoutParentInput | Prisma.MenusCreateOrConnectWithoutParentInput[];
    createMany?: Prisma.MenusCreateManyParentInputEnvelope;
    connect?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type MenusUpdateOneWithoutChildrenNestedInput = {
    create?: Prisma.XOR<Prisma.MenusCreateWithoutChildrenInput, Prisma.MenusUncheckedCreateWithoutChildrenInput>;
    connectOrCreate?: Prisma.MenusCreateOrConnectWithoutChildrenInput;
    upsert?: Prisma.MenusUpsertWithoutChildrenInput;
    disconnect?: Prisma.MenusWhereInput | boolean;
    delete?: Prisma.MenusWhereInput | boolean;
    connect?: Prisma.MenusWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MenusUpdateToOneWithWhereWithoutChildrenInput, Prisma.MenusUpdateWithoutChildrenInput>, Prisma.MenusUncheckedUpdateWithoutChildrenInput>;
};
export type MenusUpdateManyWithoutParentNestedInput = {
    create?: Prisma.XOR<Prisma.MenusCreateWithoutParentInput, Prisma.MenusUncheckedCreateWithoutParentInput> | Prisma.MenusCreateWithoutParentInput[] | Prisma.MenusUncheckedCreateWithoutParentInput[];
    connectOrCreate?: Prisma.MenusCreateOrConnectWithoutParentInput | Prisma.MenusCreateOrConnectWithoutParentInput[];
    upsert?: Prisma.MenusUpsertWithWhereUniqueWithoutParentInput | Prisma.MenusUpsertWithWhereUniqueWithoutParentInput[];
    createMany?: Prisma.MenusCreateManyParentInputEnvelope;
    set?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
    disconnect?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
    delete?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
    connect?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
    update?: Prisma.MenusUpdateWithWhereUniqueWithoutParentInput | Prisma.MenusUpdateWithWhereUniqueWithoutParentInput[];
    updateMany?: Prisma.MenusUpdateManyWithWhereWithoutParentInput | Prisma.MenusUpdateManyWithWhereWithoutParentInput[];
    deleteMany?: Prisma.MenusScalarWhereInput | Prisma.MenusScalarWhereInput[];
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type MenusUncheckedUpdateManyWithoutParentNestedInput = {
    create?: Prisma.XOR<Prisma.MenusCreateWithoutParentInput, Prisma.MenusUncheckedCreateWithoutParentInput> | Prisma.MenusCreateWithoutParentInput[] | Prisma.MenusUncheckedCreateWithoutParentInput[];
    connectOrCreate?: Prisma.MenusCreateOrConnectWithoutParentInput | Prisma.MenusCreateOrConnectWithoutParentInput[];
    upsert?: Prisma.MenusUpsertWithWhereUniqueWithoutParentInput | Prisma.MenusUpsertWithWhereUniqueWithoutParentInput[];
    createMany?: Prisma.MenusCreateManyParentInputEnvelope;
    set?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
    disconnect?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
    delete?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
    connect?: Prisma.MenusWhereUniqueInput | Prisma.MenusWhereUniqueInput[];
    update?: Prisma.MenusUpdateWithWhereUniqueWithoutParentInput | Prisma.MenusUpdateWithWhereUniqueWithoutParentInput[];
    updateMany?: Prisma.MenusUpdateManyWithWhereWithoutParentInput | Prisma.MenusUpdateManyWithWhereWithoutParentInput[];
    deleteMany?: Prisma.MenusScalarWhereInput | Prisma.MenusScalarWhereInput[];
};
export type MenusCreateWithoutMenuPermissionsInput = {
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
    parent?: Prisma.MenusCreateNestedOneWithoutChildrenInput;
    children?: Prisma.MenusCreateNestedManyWithoutParentInput;
};
export type MenusUncheckedCreateWithoutMenuPermissionsInput = {
    menusId?: number;
    menusParentId?: number | null;
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
    children?: Prisma.MenusUncheckedCreateNestedManyWithoutParentInput;
};
export type MenusCreateOrConnectWithoutMenuPermissionsInput = {
    where: Prisma.MenusWhereUniqueInput;
    create: Prisma.XOR<Prisma.MenusCreateWithoutMenuPermissionsInput, Prisma.MenusUncheckedCreateWithoutMenuPermissionsInput>;
};
export type MenusUpsertWithoutMenuPermissionsInput = {
    update: Prisma.XOR<Prisma.MenusUpdateWithoutMenuPermissionsInput, Prisma.MenusUncheckedUpdateWithoutMenuPermissionsInput>;
    create: Prisma.XOR<Prisma.MenusCreateWithoutMenuPermissionsInput, Prisma.MenusUncheckedCreateWithoutMenuPermissionsInput>;
    where?: Prisma.MenusWhereInput;
};
export type MenusUpdateToOneWithWhereWithoutMenuPermissionsInput = {
    where?: Prisma.MenusWhereInput;
    data: Prisma.XOR<Prisma.MenusUpdateWithoutMenuPermissionsInput, Prisma.MenusUncheckedUpdateWithoutMenuPermissionsInput>;
};
export type MenusUpdateWithoutMenuPermissionsInput = {
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    parent?: Prisma.MenusUpdateOneWithoutChildrenNestedInput;
    children?: Prisma.MenusUpdateManyWithoutParentNestedInput;
};
export type MenusUncheckedUpdateWithoutMenuPermissionsInput = {
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    menusParentId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    children?: Prisma.MenusUncheckedUpdateManyWithoutParentNestedInput;
};
export type MenusCreateWithoutChildrenInput = {
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
    parent?: Prisma.MenusCreateNestedOneWithoutChildrenInput;
    menuPermissions?: Prisma.MenuPermissionsCreateNestedManyWithoutMenusInput;
};
export type MenusUncheckedCreateWithoutChildrenInput = {
    menusId?: number;
    menusParentId?: number | null;
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
    menuPermissions?: Prisma.MenuPermissionsUncheckedCreateNestedManyWithoutMenusInput;
};
export type MenusCreateOrConnectWithoutChildrenInput = {
    where: Prisma.MenusWhereUniqueInput;
    create: Prisma.XOR<Prisma.MenusCreateWithoutChildrenInput, Prisma.MenusUncheckedCreateWithoutChildrenInput>;
};
export type MenusCreateWithoutParentInput = {
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
    children?: Prisma.MenusCreateNestedManyWithoutParentInput;
    menuPermissions?: Prisma.MenuPermissionsCreateNestedManyWithoutMenusInput;
};
export type MenusUncheckedCreateWithoutParentInput = {
    menusId?: number;
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
    children?: Prisma.MenusUncheckedCreateNestedManyWithoutParentInput;
    menuPermissions?: Prisma.MenuPermissionsUncheckedCreateNestedManyWithoutMenusInput;
};
export type MenusCreateOrConnectWithoutParentInput = {
    where: Prisma.MenusWhereUniqueInput;
    create: Prisma.XOR<Prisma.MenusCreateWithoutParentInput, Prisma.MenusUncheckedCreateWithoutParentInput>;
};
export type MenusCreateManyParentInputEnvelope = {
    data: Prisma.MenusCreateManyParentInput | Prisma.MenusCreateManyParentInput[];
    skipDuplicates?: boolean;
};
export type MenusUpsertWithoutChildrenInput = {
    update: Prisma.XOR<Prisma.MenusUpdateWithoutChildrenInput, Prisma.MenusUncheckedUpdateWithoutChildrenInput>;
    create: Prisma.XOR<Prisma.MenusCreateWithoutChildrenInput, Prisma.MenusUncheckedCreateWithoutChildrenInput>;
    where?: Prisma.MenusWhereInput;
};
export type MenusUpdateToOneWithWhereWithoutChildrenInput = {
    where?: Prisma.MenusWhereInput;
    data: Prisma.XOR<Prisma.MenusUpdateWithoutChildrenInput, Prisma.MenusUncheckedUpdateWithoutChildrenInput>;
};
export type MenusUpdateWithoutChildrenInput = {
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    parent?: Prisma.MenusUpdateOneWithoutChildrenNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUpdateManyWithoutMenusNestedInput;
};
export type MenusUncheckedUpdateWithoutChildrenInput = {
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    menusParentId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    menuPermissions?: Prisma.MenuPermissionsUncheckedUpdateManyWithoutMenusNestedInput;
};
export type MenusUpsertWithWhereUniqueWithoutParentInput = {
    where: Prisma.MenusWhereUniqueInput;
    update: Prisma.XOR<Prisma.MenusUpdateWithoutParentInput, Prisma.MenusUncheckedUpdateWithoutParentInput>;
    create: Prisma.XOR<Prisma.MenusCreateWithoutParentInput, Prisma.MenusUncheckedCreateWithoutParentInput>;
};
export type MenusUpdateWithWhereUniqueWithoutParentInput = {
    where: Prisma.MenusWhereUniqueInput;
    data: Prisma.XOR<Prisma.MenusUpdateWithoutParentInput, Prisma.MenusUncheckedUpdateWithoutParentInput>;
};
export type MenusUpdateManyWithWhereWithoutParentInput = {
    where: Prisma.MenusScalarWhereInput;
    data: Prisma.XOR<Prisma.MenusUpdateManyMutationInput, Prisma.MenusUncheckedUpdateManyWithoutParentInput>;
};
export type MenusScalarWhereInput = {
    AND?: Prisma.MenusScalarWhereInput | Prisma.MenusScalarWhereInput[];
    OR?: Prisma.MenusScalarWhereInput[];
    NOT?: Prisma.MenusScalarWhereInput | Prisma.MenusScalarWhereInput[];
    menusId?: Prisma.IntFilter<"Menus"> | number;
    menusParentId?: Prisma.IntNullableFilter<"Menus"> | number | null;
    icon?: Prisma.StringNullableFilter<"Menus"> | string | null;
    name?: Prisma.StringFilter<"Menus"> | string;
    route?: Prisma.StringFilter<"Menus"> | string;
    active?: Prisma.BoolFilter<"Menus"> | boolean;
    deletedAt?: Prisma.DateTimeNullableFilter<"Menus"> | Date | string | null;
};
export type MenusCreateManyParentInput = {
    menusId?: number;
    icon?: string | null;
    name: string;
    route: string;
    active?: boolean;
    deletedAt?: Date | string | null;
};
export type MenusUpdateWithoutParentInput = {
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    children?: Prisma.MenusUpdateManyWithoutParentNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUpdateManyWithoutMenusNestedInput;
};
export type MenusUncheckedUpdateWithoutParentInput = {
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    children?: Prisma.MenusUncheckedUpdateManyWithoutParentNestedInput;
    menuPermissions?: Prisma.MenuPermissionsUncheckedUpdateManyWithoutMenusNestedInput;
};
export type MenusUncheckedUpdateManyWithoutParentInput = {
    menusId?: Prisma.IntFieldUpdateOperationsInput | number;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    route?: Prisma.StringFieldUpdateOperationsInput | string;
    active?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type MenusCountOutputType = {
    children: number;
    menuPermissions: number;
};
export type MenusCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    children?: boolean | MenusCountOutputTypeCountChildrenArgs;
    menuPermissions?: boolean | MenusCountOutputTypeCountMenuPermissionsArgs;
};
export type MenusCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusCountOutputTypeSelect<ExtArgs> | null;
};
export type MenusCountOutputTypeCountChildrenArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenusWhereInput;
};
export type MenusCountOutputTypeCountMenuPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenuPermissionsWhereInput;
};
export type MenusSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    menusId?: boolean;
    menusParentId?: boolean;
    icon?: boolean;
    name?: boolean;
    route?: boolean;
    active?: boolean;
    deletedAt?: boolean;
    parent?: boolean | Prisma.Menus$parentArgs<ExtArgs>;
    children?: boolean | Prisma.Menus$childrenArgs<ExtArgs>;
    menuPermissions?: boolean | Prisma.Menus$menuPermissionsArgs<ExtArgs>;
    _count?: boolean | Prisma.MenusCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["menus"]>;
export type MenusSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    menusId?: boolean;
    menusParentId?: boolean;
    icon?: boolean;
    name?: boolean;
    route?: boolean;
    active?: boolean;
    deletedAt?: boolean;
    parent?: boolean | Prisma.Menus$parentArgs<ExtArgs>;
}, ExtArgs["result"]["menus"]>;
export type MenusSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    menusId?: boolean;
    menusParentId?: boolean;
    icon?: boolean;
    name?: boolean;
    route?: boolean;
    active?: boolean;
    deletedAt?: boolean;
    parent?: boolean | Prisma.Menus$parentArgs<ExtArgs>;
}, ExtArgs["result"]["menus"]>;
export type MenusSelectScalar = {
    menusId?: boolean;
    menusParentId?: boolean;
    icon?: boolean;
    name?: boolean;
    route?: boolean;
    active?: boolean;
    deletedAt?: boolean;
};
export type MenusOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"menusId" | "menusParentId" | "icon" | "name" | "route" | "active" | "deletedAt", ExtArgs["result"]["menus"]>;
export type MenusInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    parent?: boolean | Prisma.Menus$parentArgs<ExtArgs>;
    children?: boolean | Prisma.Menus$childrenArgs<ExtArgs>;
    menuPermissions?: boolean | Prisma.Menus$menuPermissionsArgs<ExtArgs>;
    _count?: boolean | Prisma.MenusCountOutputTypeDefaultArgs<ExtArgs>;
};
export type MenusIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    parent?: boolean | Prisma.Menus$parentArgs<ExtArgs>;
};
export type MenusIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    parent?: boolean | Prisma.Menus$parentArgs<ExtArgs>;
};
export type $MenusPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Menus";
    objects: {
        parent: Prisma.$MenusPayload<ExtArgs> | null;
        children: Prisma.$MenusPayload<ExtArgs>[];
        menuPermissions: Prisma.$MenuPermissionsPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        menusId: number;
        menusParentId: number | null;
        icon: string | null;
        name: string;
        route: string;
        active: boolean;
        deletedAt: Date | null;
    }, ExtArgs["result"]["menus"]>;
    composites: {};
};
export type MenusGetPayload<S extends boolean | null | undefined | MenusDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MenusPayload, S>;
export type MenusCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MenusFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MenusCountAggregateInputType | true;
};
export interface MenusDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Menus'];
        meta: {
            name: 'Menus';
        };
    };
    findUnique<T extends MenusFindUniqueArgs>(args: Prisma.SelectSubset<T, MenusFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MenusFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MenusFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MenusFindFirstArgs>(args?: Prisma.SelectSubset<T, MenusFindFirstArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MenusFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MenusFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MenusFindManyArgs>(args?: Prisma.SelectSubset<T, MenusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MenusCreateArgs>(args: Prisma.SelectSubset<T, MenusCreateArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MenusCreateManyArgs>(args?: Prisma.SelectSubset<T, MenusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MenusCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MenusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MenusDeleteArgs>(args: Prisma.SelectSubset<T, MenusDeleteArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MenusUpdateArgs>(args: Prisma.SelectSubset<T, MenusUpdateArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MenusDeleteManyArgs>(args?: Prisma.SelectSubset<T, MenusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MenusUpdateManyArgs>(args: Prisma.SelectSubset<T, MenusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MenusUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MenusUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MenusUpsertArgs>(args: Prisma.SelectSubset<T, MenusUpsertArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MenusCountArgs>(args?: Prisma.Subset<T, MenusCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MenusCountAggregateOutputType> : number>;
    aggregate<T extends MenusAggregateArgs>(args: Prisma.Subset<T, MenusAggregateArgs>): Prisma.PrismaPromise<GetMenusAggregateType<T>>;
    groupBy<T extends MenusGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MenusGroupByArgs['orderBy'];
    } : {
        orderBy?: MenusGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MenusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMenusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MenusFieldRefs;
}
export interface Prisma__MenusClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    parent<T extends Prisma.Menus$parentArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Menus$parentArgs<ExtArgs>>): Prisma.Prisma__MenusClient<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    children<T extends Prisma.Menus$childrenArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Menus$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenusPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    menuPermissions<T extends Prisma.Menus$menuPermissionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Menus$menuPermissionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MenuPermissionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MenusFieldRefs {
    readonly menusId: Prisma.FieldRef<"Menus", 'Int'>;
    readonly menusParentId: Prisma.FieldRef<"Menus", 'Int'>;
    readonly icon: Prisma.FieldRef<"Menus", 'String'>;
    readonly name: Prisma.FieldRef<"Menus", 'String'>;
    readonly route: Prisma.FieldRef<"Menus", 'String'>;
    readonly active: Prisma.FieldRef<"Menus", 'Boolean'>;
    readonly deletedAt: Prisma.FieldRef<"Menus", 'DateTime'>;
}
export type MenusFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where: Prisma.MenusWhereUniqueInput;
};
export type MenusFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where: Prisma.MenusWhereUniqueInput;
};
export type MenusFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where?: Prisma.MenusWhereInput;
    orderBy?: Prisma.MenusOrderByWithRelationInput | Prisma.MenusOrderByWithRelationInput[];
    cursor?: Prisma.MenusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MenusScalarFieldEnum | Prisma.MenusScalarFieldEnum[];
};
export type MenusFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where?: Prisma.MenusWhereInput;
    orderBy?: Prisma.MenusOrderByWithRelationInput | Prisma.MenusOrderByWithRelationInput[];
    cursor?: Prisma.MenusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MenusScalarFieldEnum | Prisma.MenusScalarFieldEnum[];
};
export type MenusFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where?: Prisma.MenusWhereInput;
    orderBy?: Prisma.MenusOrderByWithRelationInput | Prisma.MenusOrderByWithRelationInput[];
    cursor?: Prisma.MenusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MenusScalarFieldEnum | Prisma.MenusScalarFieldEnum[];
};
export type MenusCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MenusCreateInput, Prisma.MenusUncheckedCreateInput>;
};
export type MenusCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MenusCreateManyInput | Prisma.MenusCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MenusCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    data: Prisma.MenusCreateManyInput | Prisma.MenusCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.MenusIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type MenusUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MenusUpdateInput, Prisma.MenusUncheckedUpdateInput>;
    where: Prisma.MenusWhereUniqueInput;
};
export type MenusUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MenusUpdateManyMutationInput, Prisma.MenusUncheckedUpdateManyInput>;
    where?: Prisma.MenusWhereInput;
    limit?: number;
};
export type MenusUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MenusUpdateManyMutationInput, Prisma.MenusUncheckedUpdateManyInput>;
    where?: Prisma.MenusWhereInput;
    limit?: number;
    include?: Prisma.MenusIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type MenusUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where: Prisma.MenusWhereUniqueInput;
    create: Prisma.XOR<Prisma.MenusCreateInput, Prisma.MenusUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MenusUpdateInput, Prisma.MenusUncheckedUpdateInput>;
};
export type MenusDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where: Prisma.MenusWhereUniqueInput;
};
export type MenusDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MenusWhereInput;
    limit?: number;
};
export type Menus$parentArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where?: Prisma.MenusWhereInput;
};
export type Menus$childrenArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
    where?: Prisma.MenusWhereInput;
    orderBy?: Prisma.MenusOrderByWithRelationInput | Prisma.MenusOrderByWithRelationInput[];
    cursor?: Prisma.MenusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MenusScalarFieldEnum | Prisma.MenusScalarFieldEnum[];
};
export type Menus$menuPermissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MenusDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MenusSelect<ExtArgs> | null;
    omit?: Prisma.MenusOmit<ExtArgs> | null;
    include?: Prisma.MenusInclude<ExtArgs> | null;
};
export {};
