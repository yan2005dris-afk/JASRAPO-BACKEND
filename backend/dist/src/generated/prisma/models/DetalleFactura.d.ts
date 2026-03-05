import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type DetalleFacturaModel = runtime.Types.Result.DefaultSelection<Prisma.$DetalleFacturaPayload>;
export type AggregateDetalleFactura = {
    _count: DetalleFacturaCountAggregateOutputType | null;
    _avg: DetalleFacturaAvgAggregateOutputType | null;
    _sum: DetalleFacturaSumAggregateOutputType | null;
    _min: DetalleFacturaMinAggregateOutputType | null;
    _max: DetalleFacturaMaxAggregateOutputType | null;
};
export type DetalleFacturaAvgAggregateOutputType = {
    detalleFacturaId: number | null;
    facturaId: number | null;
    cantidad: number | null;
    precioUnitario: number | null;
    total: number | null;
};
export type DetalleFacturaSumAggregateOutputType = {
    detalleFacturaId: bigint | null;
    facturaId: bigint | null;
    cantidad: number | null;
    precioUnitario: number | null;
    total: number | null;
};
export type DetalleFacturaMinAggregateOutputType = {
    detalleFacturaId: bigint | null;
    facturaId: bigint | null;
    descripcion: string | null;
    cantidad: number | null;
    precioUnitario: number | null;
    total: number | null;
};
export type DetalleFacturaMaxAggregateOutputType = {
    detalleFacturaId: bigint | null;
    facturaId: bigint | null;
    descripcion: string | null;
    cantidad: number | null;
    precioUnitario: number | null;
    total: number | null;
};
export type DetalleFacturaCountAggregateOutputType = {
    detalleFacturaId: number;
    facturaId: number;
    descripcion: number;
    cantidad: number;
    precioUnitario: number;
    total: number;
    _all: number;
};
export type DetalleFacturaAvgAggregateInputType = {
    detalleFacturaId?: true;
    facturaId?: true;
    cantidad?: true;
    precioUnitario?: true;
    total?: true;
};
export type DetalleFacturaSumAggregateInputType = {
    detalleFacturaId?: true;
    facturaId?: true;
    cantidad?: true;
    precioUnitario?: true;
    total?: true;
};
export type DetalleFacturaMinAggregateInputType = {
    detalleFacturaId?: true;
    facturaId?: true;
    descripcion?: true;
    cantidad?: true;
    precioUnitario?: true;
    total?: true;
};
export type DetalleFacturaMaxAggregateInputType = {
    detalleFacturaId?: true;
    facturaId?: true;
    descripcion?: true;
    cantidad?: true;
    precioUnitario?: true;
    total?: true;
};
export type DetalleFacturaCountAggregateInputType = {
    detalleFacturaId?: true;
    facturaId?: true;
    descripcion?: true;
    cantidad?: true;
    precioUnitario?: true;
    total?: true;
    _all?: true;
};
export type DetalleFacturaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DetalleFacturaWhereInput;
    orderBy?: Prisma.DetalleFacturaOrderByWithRelationInput | Prisma.DetalleFacturaOrderByWithRelationInput[];
    cursor?: Prisma.DetalleFacturaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DetalleFacturaCountAggregateInputType;
    _avg?: DetalleFacturaAvgAggregateInputType;
    _sum?: DetalleFacturaSumAggregateInputType;
    _min?: DetalleFacturaMinAggregateInputType;
    _max?: DetalleFacturaMaxAggregateInputType;
};
export type GetDetalleFacturaAggregateType<T extends DetalleFacturaAggregateArgs> = {
    [P in keyof T & keyof AggregateDetalleFactura]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDetalleFactura[P]> : Prisma.GetScalarType<T[P], AggregateDetalleFactura[P]>;
};
export type DetalleFacturaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DetalleFacturaWhereInput;
    orderBy?: Prisma.DetalleFacturaOrderByWithAggregationInput | Prisma.DetalleFacturaOrderByWithAggregationInput[];
    by: Prisma.DetalleFacturaScalarFieldEnum[] | Prisma.DetalleFacturaScalarFieldEnum;
    having?: Prisma.DetalleFacturaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DetalleFacturaCountAggregateInputType | true;
    _avg?: DetalleFacturaAvgAggregateInputType;
    _sum?: DetalleFacturaSumAggregateInputType;
    _min?: DetalleFacturaMinAggregateInputType;
    _max?: DetalleFacturaMaxAggregateInputType;
};
export type DetalleFacturaGroupByOutputType = {
    detalleFacturaId: bigint;
    facturaId: bigint | null;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
    _count: DetalleFacturaCountAggregateOutputType | null;
    _avg: DetalleFacturaAvgAggregateOutputType | null;
    _sum: DetalleFacturaSumAggregateOutputType | null;
    _min: DetalleFacturaMinAggregateOutputType | null;
    _max: DetalleFacturaMaxAggregateOutputType | null;
};
type GetDetalleFacturaGroupByPayload<T extends DetalleFacturaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DetalleFacturaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DetalleFacturaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DetalleFacturaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DetalleFacturaGroupByOutputType[P]>;
}>>;
export type DetalleFacturaWhereInput = {
    AND?: Prisma.DetalleFacturaWhereInput | Prisma.DetalleFacturaWhereInput[];
    OR?: Prisma.DetalleFacturaWhereInput[];
    NOT?: Prisma.DetalleFacturaWhereInput | Prisma.DetalleFacturaWhereInput[];
    detalleFacturaId?: Prisma.BigIntFilter<"DetalleFactura"> | bigint | number;
    facturaId?: Prisma.BigIntNullableFilter<"DetalleFactura"> | bigint | number | null;
    descripcion?: Prisma.StringFilter<"DetalleFactura"> | string;
    cantidad?: Prisma.FloatFilter<"DetalleFactura"> | number;
    precioUnitario?: Prisma.FloatFilter<"DetalleFactura"> | number;
    total?: Prisma.FloatFilter<"DetalleFactura"> | number;
    factura?: Prisma.XOR<Prisma.FacturasNullableScalarRelationFilter, Prisma.FacturasWhereInput> | null;
};
export type DetalleFacturaOrderByWithRelationInput = {
    detalleFacturaId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    descripcion?: Prisma.SortOrder;
    cantidad?: Prisma.SortOrder;
    precioUnitario?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    factura?: Prisma.FacturasOrderByWithRelationInput;
};
export type DetalleFacturaWhereUniqueInput = Prisma.AtLeast<{
    detalleFacturaId?: bigint | number;
    AND?: Prisma.DetalleFacturaWhereInput | Prisma.DetalleFacturaWhereInput[];
    OR?: Prisma.DetalleFacturaWhereInput[];
    NOT?: Prisma.DetalleFacturaWhereInput | Prisma.DetalleFacturaWhereInput[];
    facturaId?: Prisma.BigIntNullableFilter<"DetalleFactura"> | bigint | number | null;
    descripcion?: Prisma.StringFilter<"DetalleFactura"> | string;
    cantidad?: Prisma.FloatFilter<"DetalleFactura"> | number;
    precioUnitario?: Prisma.FloatFilter<"DetalleFactura"> | number;
    total?: Prisma.FloatFilter<"DetalleFactura"> | number;
    factura?: Prisma.XOR<Prisma.FacturasNullableScalarRelationFilter, Prisma.FacturasWhereInput> | null;
}, "detalleFacturaId">;
export type DetalleFacturaOrderByWithAggregationInput = {
    detalleFacturaId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    descripcion?: Prisma.SortOrder;
    cantidad?: Prisma.SortOrder;
    precioUnitario?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    _count?: Prisma.DetalleFacturaCountOrderByAggregateInput;
    _avg?: Prisma.DetalleFacturaAvgOrderByAggregateInput;
    _max?: Prisma.DetalleFacturaMaxOrderByAggregateInput;
    _min?: Prisma.DetalleFacturaMinOrderByAggregateInput;
    _sum?: Prisma.DetalleFacturaSumOrderByAggregateInput;
};
export type DetalleFacturaScalarWhereWithAggregatesInput = {
    AND?: Prisma.DetalleFacturaScalarWhereWithAggregatesInput | Prisma.DetalleFacturaScalarWhereWithAggregatesInput[];
    OR?: Prisma.DetalleFacturaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DetalleFacturaScalarWhereWithAggregatesInput | Prisma.DetalleFacturaScalarWhereWithAggregatesInput[];
    detalleFacturaId?: Prisma.BigIntWithAggregatesFilter<"DetalleFactura"> | bigint | number;
    facturaId?: Prisma.BigIntNullableWithAggregatesFilter<"DetalleFactura"> | bigint | number | null;
    descripcion?: Prisma.StringWithAggregatesFilter<"DetalleFactura"> | string;
    cantidad?: Prisma.FloatWithAggregatesFilter<"DetalleFactura"> | number;
    precioUnitario?: Prisma.FloatWithAggregatesFilter<"DetalleFactura"> | number;
    total?: Prisma.FloatWithAggregatesFilter<"DetalleFactura"> | number;
};
export type DetalleFacturaCreateInput = {
    detalleFacturaId?: bigint | number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
    factura?: Prisma.FacturasCreateNestedOneWithoutDetalleFacturaInput;
};
export type DetalleFacturaUncheckedCreateInput = {
    detalleFacturaId?: bigint | number;
    facturaId?: bigint | number | null;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
};
export type DetalleFacturaUpdateInput = {
    detalleFacturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    descripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    cantidad?: Prisma.FloatFieldUpdateOperationsInput | number;
    precioUnitario?: Prisma.FloatFieldUpdateOperationsInput | number;
    total?: Prisma.FloatFieldUpdateOperationsInput | number;
    factura?: Prisma.FacturasUpdateOneWithoutDetalleFacturaNestedInput;
};
export type DetalleFacturaUncheckedUpdateInput = {
    detalleFacturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    facturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    descripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    cantidad?: Prisma.FloatFieldUpdateOperationsInput | number;
    precioUnitario?: Prisma.FloatFieldUpdateOperationsInput | number;
    total?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type DetalleFacturaCreateManyInput = {
    detalleFacturaId?: bigint | number;
    facturaId?: bigint | number | null;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
};
export type DetalleFacturaUpdateManyMutationInput = {
    detalleFacturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    descripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    cantidad?: Prisma.FloatFieldUpdateOperationsInput | number;
    precioUnitario?: Prisma.FloatFieldUpdateOperationsInput | number;
    total?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type DetalleFacturaUncheckedUpdateManyInput = {
    detalleFacturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    facturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    descripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    cantidad?: Prisma.FloatFieldUpdateOperationsInput | number;
    precioUnitario?: Prisma.FloatFieldUpdateOperationsInput | number;
    total?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type DetalleFacturaCountOrderByAggregateInput = {
    detalleFacturaId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    descripcion?: Prisma.SortOrder;
    cantidad?: Prisma.SortOrder;
    precioUnitario?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type DetalleFacturaAvgOrderByAggregateInput = {
    detalleFacturaId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    cantidad?: Prisma.SortOrder;
    precioUnitario?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type DetalleFacturaMaxOrderByAggregateInput = {
    detalleFacturaId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    descripcion?: Prisma.SortOrder;
    cantidad?: Prisma.SortOrder;
    precioUnitario?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type DetalleFacturaMinOrderByAggregateInput = {
    detalleFacturaId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    descripcion?: Prisma.SortOrder;
    cantidad?: Prisma.SortOrder;
    precioUnitario?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type DetalleFacturaSumOrderByAggregateInput = {
    detalleFacturaId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    cantidad?: Prisma.SortOrder;
    precioUnitario?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type DetalleFacturaListRelationFilter = {
    every?: Prisma.DetalleFacturaWhereInput;
    some?: Prisma.DetalleFacturaWhereInput;
    none?: Prisma.DetalleFacturaWhereInput;
};
export type DetalleFacturaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type DetalleFacturaCreateNestedManyWithoutFacturaInput = {
    create?: Prisma.XOR<Prisma.DetalleFacturaCreateWithoutFacturaInput, Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput> | Prisma.DetalleFacturaCreateWithoutFacturaInput[] | Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput[];
    connectOrCreate?: Prisma.DetalleFacturaCreateOrConnectWithoutFacturaInput | Prisma.DetalleFacturaCreateOrConnectWithoutFacturaInput[];
    createMany?: Prisma.DetalleFacturaCreateManyFacturaInputEnvelope;
    connect?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
};
export type DetalleFacturaUncheckedCreateNestedManyWithoutFacturaInput = {
    create?: Prisma.XOR<Prisma.DetalleFacturaCreateWithoutFacturaInput, Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput> | Prisma.DetalleFacturaCreateWithoutFacturaInput[] | Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput[];
    connectOrCreate?: Prisma.DetalleFacturaCreateOrConnectWithoutFacturaInput | Prisma.DetalleFacturaCreateOrConnectWithoutFacturaInput[];
    createMany?: Prisma.DetalleFacturaCreateManyFacturaInputEnvelope;
    connect?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
};
export type DetalleFacturaUpdateManyWithoutFacturaNestedInput = {
    create?: Prisma.XOR<Prisma.DetalleFacturaCreateWithoutFacturaInput, Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput> | Prisma.DetalleFacturaCreateWithoutFacturaInput[] | Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput[];
    connectOrCreate?: Prisma.DetalleFacturaCreateOrConnectWithoutFacturaInput | Prisma.DetalleFacturaCreateOrConnectWithoutFacturaInput[];
    upsert?: Prisma.DetalleFacturaUpsertWithWhereUniqueWithoutFacturaInput | Prisma.DetalleFacturaUpsertWithWhereUniqueWithoutFacturaInput[];
    createMany?: Prisma.DetalleFacturaCreateManyFacturaInputEnvelope;
    set?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
    disconnect?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
    delete?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
    connect?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
    update?: Prisma.DetalleFacturaUpdateWithWhereUniqueWithoutFacturaInput | Prisma.DetalleFacturaUpdateWithWhereUniqueWithoutFacturaInput[];
    updateMany?: Prisma.DetalleFacturaUpdateManyWithWhereWithoutFacturaInput | Prisma.DetalleFacturaUpdateManyWithWhereWithoutFacturaInput[];
    deleteMany?: Prisma.DetalleFacturaScalarWhereInput | Prisma.DetalleFacturaScalarWhereInput[];
};
export type DetalleFacturaUncheckedUpdateManyWithoutFacturaNestedInput = {
    create?: Prisma.XOR<Prisma.DetalleFacturaCreateWithoutFacturaInput, Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput> | Prisma.DetalleFacturaCreateWithoutFacturaInput[] | Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput[];
    connectOrCreate?: Prisma.DetalleFacturaCreateOrConnectWithoutFacturaInput | Prisma.DetalleFacturaCreateOrConnectWithoutFacturaInput[];
    upsert?: Prisma.DetalleFacturaUpsertWithWhereUniqueWithoutFacturaInput | Prisma.DetalleFacturaUpsertWithWhereUniqueWithoutFacturaInput[];
    createMany?: Prisma.DetalleFacturaCreateManyFacturaInputEnvelope;
    set?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
    disconnect?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
    delete?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
    connect?: Prisma.DetalleFacturaWhereUniqueInput | Prisma.DetalleFacturaWhereUniqueInput[];
    update?: Prisma.DetalleFacturaUpdateWithWhereUniqueWithoutFacturaInput | Prisma.DetalleFacturaUpdateWithWhereUniqueWithoutFacturaInput[];
    updateMany?: Prisma.DetalleFacturaUpdateManyWithWhereWithoutFacturaInput | Prisma.DetalleFacturaUpdateManyWithWhereWithoutFacturaInput[];
    deleteMany?: Prisma.DetalleFacturaScalarWhereInput | Prisma.DetalleFacturaScalarWhereInput[];
};
export type DetalleFacturaCreateWithoutFacturaInput = {
    detalleFacturaId?: bigint | number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
};
export type DetalleFacturaUncheckedCreateWithoutFacturaInput = {
    detalleFacturaId?: bigint | number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
};
export type DetalleFacturaCreateOrConnectWithoutFacturaInput = {
    where: Prisma.DetalleFacturaWhereUniqueInput;
    create: Prisma.XOR<Prisma.DetalleFacturaCreateWithoutFacturaInput, Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput>;
};
export type DetalleFacturaCreateManyFacturaInputEnvelope = {
    data: Prisma.DetalleFacturaCreateManyFacturaInput | Prisma.DetalleFacturaCreateManyFacturaInput[];
    skipDuplicates?: boolean;
};
export type DetalleFacturaUpsertWithWhereUniqueWithoutFacturaInput = {
    where: Prisma.DetalleFacturaWhereUniqueInput;
    update: Prisma.XOR<Prisma.DetalleFacturaUpdateWithoutFacturaInput, Prisma.DetalleFacturaUncheckedUpdateWithoutFacturaInput>;
    create: Prisma.XOR<Prisma.DetalleFacturaCreateWithoutFacturaInput, Prisma.DetalleFacturaUncheckedCreateWithoutFacturaInput>;
};
export type DetalleFacturaUpdateWithWhereUniqueWithoutFacturaInput = {
    where: Prisma.DetalleFacturaWhereUniqueInput;
    data: Prisma.XOR<Prisma.DetalleFacturaUpdateWithoutFacturaInput, Prisma.DetalleFacturaUncheckedUpdateWithoutFacturaInput>;
};
export type DetalleFacturaUpdateManyWithWhereWithoutFacturaInput = {
    where: Prisma.DetalleFacturaScalarWhereInput;
    data: Prisma.XOR<Prisma.DetalleFacturaUpdateManyMutationInput, Prisma.DetalleFacturaUncheckedUpdateManyWithoutFacturaInput>;
};
export type DetalleFacturaScalarWhereInput = {
    AND?: Prisma.DetalleFacturaScalarWhereInput | Prisma.DetalleFacturaScalarWhereInput[];
    OR?: Prisma.DetalleFacturaScalarWhereInput[];
    NOT?: Prisma.DetalleFacturaScalarWhereInput | Prisma.DetalleFacturaScalarWhereInput[];
    detalleFacturaId?: Prisma.BigIntFilter<"DetalleFactura"> | bigint | number;
    facturaId?: Prisma.BigIntNullableFilter<"DetalleFactura"> | bigint | number | null;
    descripcion?: Prisma.StringFilter<"DetalleFactura"> | string;
    cantidad?: Prisma.FloatFilter<"DetalleFactura"> | number;
    precioUnitario?: Prisma.FloatFilter<"DetalleFactura"> | number;
    total?: Prisma.FloatFilter<"DetalleFactura"> | number;
};
export type DetalleFacturaCreateManyFacturaInput = {
    detalleFacturaId?: bigint | number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
};
export type DetalleFacturaUpdateWithoutFacturaInput = {
    detalleFacturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    descripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    cantidad?: Prisma.FloatFieldUpdateOperationsInput | number;
    precioUnitario?: Prisma.FloatFieldUpdateOperationsInput | number;
    total?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type DetalleFacturaUncheckedUpdateWithoutFacturaInput = {
    detalleFacturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    descripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    cantidad?: Prisma.FloatFieldUpdateOperationsInput | number;
    precioUnitario?: Prisma.FloatFieldUpdateOperationsInput | number;
    total?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type DetalleFacturaUncheckedUpdateManyWithoutFacturaInput = {
    detalleFacturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    descripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    cantidad?: Prisma.FloatFieldUpdateOperationsInput | number;
    precioUnitario?: Prisma.FloatFieldUpdateOperationsInput | number;
    total?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type DetalleFacturaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    detalleFacturaId?: boolean;
    facturaId?: boolean;
    descripcion?: boolean;
    cantidad?: boolean;
    precioUnitario?: boolean;
    total?: boolean;
    factura?: boolean | Prisma.DetalleFactura$facturaArgs<ExtArgs>;
}, ExtArgs["result"]["detalleFactura"]>;
export type DetalleFacturaSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    detalleFacturaId?: boolean;
    facturaId?: boolean;
    descripcion?: boolean;
    cantidad?: boolean;
    precioUnitario?: boolean;
    total?: boolean;
    factura?: boolean | Prisma.DetalleFactura$facturaArgs<ExtArgs>;
}, ExtArgs["result"]["detalleFactura"]>;
export type DetalleFacturaSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    detalleFacturaId?: boolean;
    facturaId?: boolean;
    descripcion?: boolean;
    cantidad?: boolean;
    precioUnitario?: boolean;
    total?: boolean;
    factura?: boolean | Prisma.DetalleFactura$facturaArgs<ExtArgs>;
}, ExtArgs["result"]["detalleFactura"]>;
export type DetalleFacturaSelectScalar = {
    detalleFacturaId?: boolean;
    facturaId?: boolean;
    descripcion?: boolean;
    cantidad?: boolean;
    precioUnitario?: boolean;
    total?: boolean;
};
export type DetalleFacturaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"detalleFacturaId" | "facturaId" | "descripcion" | "cantidad" | "precioUnitario" | "total", ExtArgs["result"]["detalleFactura"]>;
export type DetalleFacturaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    factura?: boolean | Prisma.DetalleFactura$facturaArgs<ExtArgs>;
};
export type DetalleFacturaIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    factura?: boolean | Prisma.DetalleFactura$facturaArgs<ExtArgs>;
};
export type DetalleFacturaIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    factura?: boolean | Prisma.DetalleFactura$facturaArgs<ExtArgs>;
};
export type $DetalleFacturaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DetalleFactura";
    objects: {
        factura: Prisma.$FacturasPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        detalleFacturaId: bigint;
        facturaId: bigint | null;
        descripcion: string;
        cantidad: number;
        precioUnitario: number;
        total: number;
    }, ExtArgs["result"]["detalleFactura"]>;
    composites: {};
};
export type DetalleFacturaGetPayload<S extends boolean | null | undefined | DetalleFacturaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload, S>;
export type DetalleFacturaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DetalleFacturaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DetalleFacturaCountAggregateInputType | true;
};
export interface DetalleFacturaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DetalleFactura'];
        meta: {
            name: 'DetalleFactura';
        };
    };
    findUnique<T extends DetalleFacturaFindUniqueArgs>(args: Prisma.SelectSubset<T, DetalleFacturaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DetalleFacturaClient<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DetalleFacturaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DetalleFacturaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DetalleFacturaClient<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DetalleFacturaFindFirstArgs>(args?: Prisma.SelectSubset<T, DetalleFacturaFindFirstArgs<ExtArgs>>): Prisma.Prisma__DetalleFacturaClient<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DetalleFacturaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DetalleFacturaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DetalleFacturaClient<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DetalleFacturaFindManyArgs>(args?: Prisma.SelectSubset<T, DetalleFacturaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends DetalleFacturaCreateArgs>(args: Prisma.SelectSubset<T, DetalleFacturaCreateArgs<ExtArgs>>): Prisma.Prisma__DetalleFacturaClient<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DetalleFacturaCreateManyArgs>(args?: Prisma.SelectSubset<T, DetalleFacturaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DetalleFacturaCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DetalleFacturaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends DetalleFacturaDeleteArgs>(args: Prisma.SelectSubset<T, DetalleFacturaDeleteArgs<ExtArgs>>): Prisma.Prisma__DetalleFacturaClient<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DetalleFacturaUpdateArgs>(args: Prisma.SelectSubset<T, DetalleFacturaUpdateArgs<ExtArgs>>): Prisma.Prisma__DetalleFacturaClient<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DetalleFacturaDeleteManyArgs>(args?: Prisma.SelectSubset<T, DetalleFacturaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DetalleFacturaUpdateManyArgs>(args: Prisma.SelectSubset<T, DetalleFacturaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DetalleFacturaUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DetalleFacturaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends DetalleFacturaUpsertArgs>(args: Prisma.SelectSubset<T, DetalleFacturaUpsertArgs<ExtArgs>>): Prisma.Prisma__DetalleFacturaClient<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DetalleFacturaCountArgs>(args?: Prisma.Subset<T, DetalleFacturaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DetalleFacturaCountAggregateOutputType> : number>;
    aggregate<T extends DetalleFacturaAggregateArgs>(args: Prisma.Subset<T, DetalleFacturaAggregateArgs>): Prisma.PrismaPromise<GetDetalleFacturaAggregateType<T>>;
    groupBy<T extends DetalleFacturaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DetalleFacturaGroupByArgs['orderBy'];
    } : {
        orderBy?: DetalleFacturaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DetalleFacturaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDetalleFacturaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DetalleFacturaFieldRefs;
}
export interface Prisma__DetalleFacturaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    factura<T extends Prisma.DetalleFactura$facturaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DetalleFactura$facturaArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DetalleFacturaFieldRefs {
    readonly detalleFacturaId: Prisma.FieldRef<"DetalleFactura", 'BigInt'>;
    readonly facturaId: Prisma.FieldRef<"DetalleFactura", 'BigInt'>;
    readonly descripcion: Prisma.FieldRef<"DetalleFactura", 'String'>;
    readonly cantidad: Prisma.FieldRef<"DetalleFactura", 'Float'>;
    readonly precioUnitario: Prisma.FieldRef<"DetalleFactura", 'Float'>;
    readonly total: Prisma.FieldRef<"DetalleFactura", 'Float'>;
}
export type DetalleFacturaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    where: Prisma.DetalleFacturaWhereUniqueInput;
};
export type DetalleFacturaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    where: Prisma.DetalleFacturaWhereUniqueInput;
};
export type DetalleFacturaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    where?: Prisma.DetalleFacturaWhereInput;
    orderBy?: Prisma.DetalleFacturaOrderByWithRelationInput | Prisma.DetalleFacturaOrderByWithRelationInput[];
    cursor?: Prisma.DetalleFacturaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DetalleFacturaScalarFieldEnum | Prisma.DetalleFacturaScalarFieldEnum[];
};
export type DetalleFacturaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    where?: Prisma.DetalleFacturaWhereInput;
    orderBy?: Prisma.DetalleFacturaOrderByWithRelationInput | Prisma.DetalleFacturaOrderByWithRelationInput[];
    cursor?: Prisma.DetalleFacturaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DetalleFacturaScalarFieldEnum | Prisma.DetalleFacturaScalarFieldEnum[];
};
export type DetalleFacturaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    where?: Prisma.DetalleFacturaWhereInput;
    orderBy?: Prisma.DetalleFacturaOrderByWithRelationInput | Prisma.DetalleFacturaOrderByWithRelationInput[];
    cursor?: Prisma.DetalleFacturaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DetalleFacturaScalarFieldEnum | Prisma.DetalleFacturaScalarFieldEnum[];
};
export type DetalleFacturaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DetalleFacturaCreateInput, Prisma.DetalleFacturaUncheckedCreateInput>;
};
export type DetalleFacturaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DetalleFacturaCreateManyInput | Prisma.DetalleFacturaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DetalleFacturaCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    data: Prisma.DetalleFacturaCreateManyInput | Prisma.DetalleFacturaCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.DetalleFacturaIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type DetalleFacturaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DetalleFacturaUpdateInput, Prisma.DetalleFacturaUncheckedUpdateInput>;
    where: Prisma.DetalleFacturaWhereUniqueInput;
};
export type DetalleFacturaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DetalleFacturaUpdateManyMutationInput, Prisma.DetalleFacturaUncheckedUpdateManyInput>;
    where?: Prisma.DetalleFacturaWhereInput;
    limit?: number;
};
export type DetalleFacturaUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DetalleFacturaUpdateManyMutationInput, Prisma.DetalleFacturaUncheckedUpdateManyInput>;
    where?: Prisma.DetalleFacturaWhereInput;
    limit?: number;
    include?: Prisma.DetalleFacturaIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type DetalleFacturaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    where: Prisma.DetalleFacturaWhereUniqueInput;
    create: Prisma.XOR<Prisma.DetalleFacturaCreateInput, Prisma.DetalleFacturaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DetalleFacturaUpdateInput, Prisma.DetalleFacturaUncheckedUpdateInput>;
};
export type DetalleFacturaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
    where: Prisma.DetalleFacturaWhereUniqueInput;
};
export type DetalleFacturaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DetalleFacturaWhereInput;
    limit?: number;
};
export type DetalleFactura$facturaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where?: Prisma.FacturasWhereInput;
};
export type DetalleFacturaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DetalleFacturaSelect<ExtArgs> | null;
    omit?: Prisma.DetalleFacturaOmit<ExtArgs> | null;
    include?: Prisma.DetalleFacturaInclude<ExtArgs> | null;
};
export {};
