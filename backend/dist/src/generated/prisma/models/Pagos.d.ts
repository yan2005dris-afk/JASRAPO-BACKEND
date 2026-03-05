import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PagosModel = runtime.Types.Result.DefaultSelection<Prisma.$PagosPayload>;
export type AggregatePagos = {
    _count: PagosCountAggregateOutputType | null;
    _avg: PagosAvgAggregateOutputType | null;
    _sum: PagosSumAggregateOutputType | null;
    _min: PagosMinAggregateOutputType | null;
    _max: PagosMaxAggregateOutputType | null;
};
export type PagosAvgAggregateOutputType = {
    pagoId: number | null;
    clienteId: number | null;
    facturaId: number | null;
    monto: number | null;
};
export type PagosSumAggregateOutputType = {
    pagoId: bigint | null;
    clienteId: bigint | null;
    facturaId: bigint | null;
    monto: number | null;
};
export type PagosMinAggregateOutputType = {
    pagoId: bigint | null;
    clienteId: bigint | null;
    facturaId: bigint | null;
    fecha: Date | null;
    monto: number | null;
    metodoPago: string | null;
};
export type PagosMaxAggregateOutputType = {
    pagoId: bigint | null;
    clienteId: bigint | null;
    facturaId: bigint | null;
    fecha: Date | null;
    monto: number | null;
    metodoPago: string | null;
};
export type PagosCountAggregateOutputType = {
    pagoId: number;
    clienteId: number;
    facturaId: number;
    fecha: number;
    monto: number;
    metodoPago: number;
    _all: number;
};
export type PagosAvgAggregateInputType = {
    pagoId?: true;
    clienteId?: true;
    facturaId?: true;
    monto?: true;
};
export type PagosSumAggregateInputType = {
    pagoId?: true;
    clienteId?: true;
    facturaId?: true;
    monto?: true;
};
export type PagosMinAggregateInputType = {
    pagoId?: true;
    clienteId?: true;
    facturaId?: true;
    fecha?: true;
    monto?: true;
    metodoPago?: true;
};
export type PagosMaxAggregateInputType = {
    pagoId?: true;
    clienteId?: true;
    facturaId?: true;
    fecha?: true;
    monto?: true;
    metodoPago?: true;
};
export type PagosCountAggregateInputType = {
    pagoId?: true;
    clienteId?: true;
    facturaId?: true;
    fecha?: true;
    monto?: true;
    metodoPago?: true;
    _all?: true;
};
export type PagosAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PagosWhereInput;
    orderBy?: Prisma.PagosOrderByWithRelationInput | Prisma.PagosOrderByWithRelationInput[];
    cursor?: Prisma.PagosWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PagosCountAggregateInputType;
    _avg?: PagosAvgAggregateInputType;
    _sum?: PagosSumAggregateInputType;
    _min?: PagosMinAggregateInputType;
    _max?: PagosMaxAggregateInputType;
};
export type GetPagosAggregateType<T extends PagosAggregateArgs> = {
    [P in keyof T & keyof AggregatePagos]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePagos[P]> : Prisma.GetScalarType<T[P], AggregatePagos[P]>;
};
export type PagosGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PagosWhereInput;
    orderBy?: Prisma.PagosOrderByWithAggregationInput | Prisma.PagosOrderByWithAggregationInput[];
    by: Prisma.PagosScalarFieldEnum[] | Prisma.PagosScalarFieldEnum;
    having?: Prisma.PagosScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PagosCountAggregateInputType | true;
    _avg?: PagosAvgAggregateInputType;
    _sum?: PagosSumAggregateInputType;
    _min?: PagosMinAggregateInputType;
    _max?: PagosMaxAggregateInputType;
};
export type PagosGroupByOutputType = {
    pagoId: bigint;
    clienteId: bigint | null;
    facturaId: bigint | null;
    fecha: Date;
    monto: number;
    metodoPago: string | null;
    _count: PagosCountAggregateOutputType | null;
    _avg: PagosAvgAggregateOutputType | null;
    _sum: PagosSumAggregateOutputType | null;
    _min: PagosMinAggregateOutputType | null;
    _max: PagosMaxAggregateOutputType | null;
};
type GetPagosGroupByPayload<T extends PagosGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PagosGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PagosGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PagosGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PagosGroupByOutputType[P]>;
}>>;
export type PagosWhereInput = {
    AND?: Prisma.PagosWhereInput | Prisma.PagosWhereInput[];
    OR?: Prisma.PagosWhereInput[];
    NOT?: Prisma.PagosWhereInput | Prisma.PagosWhereInput[];
    pagoId?: Prisma.BigIntFilter<"Pagos"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"Pagos"> | bigint | number | null;
    facturaId?: Prisma.BigIntNullableFilter<"Pagos"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Pagos"> | Date | string;
    monto?: Prisma.FloatFilter<"Pagos"> | number;
    metodoPago?: Prisma.StringNullableFilter<"Pagos"> | string | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
    factura?: Prisma.XOR<Prisma.FacturasNullableScalarRelationFilter, Prisma.FacturasWhereInput> | null;
};
export type PagosOrderByWithRelationInput = {
    pagoId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    facturaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    monto?: Prisma.SortOrder;
    metodoPago?: Prisma.SortOrderInput | Prisma.SortOrder;
    cliente?: Prisma.ClientesOrderByWithRelationInput;
    factura?: Prisma.FacturasOrderByWithRelationInput;
};
export type PagosWhereUniqueInput = Prisma.AtLeast<{
    pagoId?: bigint | number;
    AND?: Prisma.PagosWhereInput | Prisma.PagosWhereInput[];
    OR?: Prisma.PagosWhereInput[];
    NOT?: Prisma.PagosWhereInput | Prisma.PagosWhereInput[];
    clienteId?: Prisma.BigIntNullableFilter<"Pagos"> | bigint | number | null;
    facturaId?: Prisma.BigIntNullableFilter<"Pagos"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Pagos"> | Date | string;
    monto?: Prisma.FloatFilter<"Pagos"> | number;
    metodoPago?: Prisma.StringNullableFilter<"Pagos"> | string | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
    factura?: Prisma.XOR<Prisma.FacturasNullableScalarRelationFilter, Prisma.FacturasWhereInput> | null;
}, "pagoId">;
export type PagosOrderByWithAggregationInput = {
    pagoId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    facturaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    monto?: Prisma.SortOrder;
    metodoPago?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.PagosCountOrderByAggregateInput;
    _avg?: Prisma.PagosAvgOrderByAggregateInput;
    _max?: Prisma.PagosMaxOrderByAggregateInput;
    _min?: Prisma.PagosMinOrderByAggregateInput;
    _sum?: Prisma.PagosSumOrderByAggregateInput;
};
export type PagosScalarWhereWithAggregatesInput = {
    AND?: Prisma.PagosScalarWhereWithAggregatesInput | Prisma.PagosScalarWhereWithAggregatesInput[];
    OR?: Prisma.PagosScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PagosScalarWhereWithAggregatesInput | Prisma.PagosScalarWhereWithAggregatesInput[];
    pagoId?: Prisma.BigIntWithAggregatesFilter<"Pagos"> | bigint | number;
    clienteId?: Prisma.BigIntNullableWithAggregatesFilter<"Pagos"> | bigint | number | null;
    facturaId?: Prisma.BigIntNullableWithAggregatesFilter<"Pagos"> | bigint | number | null;
    fecha?: Prisma.DateTimeWithAggregatesFilter<"Pagos"> | Date | string;
    monto?: Prisma.FloatWithAggregatesFilter<"Pagos"> | number;
    metodoPago?: Prisma.StringNullableWithAggregatesFilter<"Pagos"> | string | null;
};
export type PagosCreateInput = {
    pagoId?: bigint | number;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutPagosInput;
    factura?: Prisma.FacturasCreateNestedOneWithoutPagosInput;
};
export type PagosUncheckedCreateInput = {
    pagoId?: bigint | number;
    clienteId?: bigint | number | null;
    facturaId?: bigint | number | null;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
};
export type PagosUpdateInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cliente?: Prisma.ClientesUpdateOneWithoutPagosNestedInput;
    factura?: Prisma.FacturasUpdateOneWithoutPagosNestedInput;
};
export type PagosUncheckedUpdateInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    facturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PagosCreateManyInput = {
    pagoId?: bigint | number;
    clienteId?: bigint | number | null;
    facturaId?: bigint | number | null;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
};
export type PagosUpdateManyMutationInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PagosUncheckedUpdateManyInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    facturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PagosListRelationFilter = {
    every?: Prisma.PagosWhereInput;
    some?: Prisma.PagosWhereInput;
    none?: Prisma.PagosWhereInput;
};
export type PagosOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PagosCountOrderByAggregateInput = {
    pagoId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    monto?: Prisma.SortOrder;
    metodoPago?: Prisma.SortOrder;
};
export type PagosAvgOrderByAggregateInput = {
    pagoId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    monto?: Prisma.SortOrder;
};
export type PagosMaxOrderByAggregateInput = {
    pagoId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    monto?: Prisma.SortOrder;
    metodoPago?: Prisma.SortOrder;
};
export type PagosMinOrderByAggregateInput = {
    pagoId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    monto?: Prisma.SortOrder;
    metodoPago?: Prisma.SortOrder;
};
export type PagosSumOrderByAggregateInput = {
    pagoId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    facturaId?: Prisma.SortOrder;
    monto?: Prisma.SortOrder;
};
export type PagosCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.PagosCreateWithoutClienteInput, Prisma.PagosUncheckedCreateWithoutClienteInput> | Prisma.PagosCreateWithoutClienteInput[] | Prisma.PagosUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.PagosCreateOrConnectWithoutClienteInput | Prisma.PagosCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.PagosCreateManyClienteInputEnvelope;
    connect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
};
export type PagosUncheckedCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.PagosCreateWithoutClienteInput, Prisma.PagosUncheckedCreateWithoutClienteInput> | Prisma.PagosCreateWithoutClienteInput[] | Prisma.PagosUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.PagosCreateOrConnectWithoutClienteInput | Prisma.PagosCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.PagosCreateManyClienteInputEnvelope;
    connect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
};
export type PagosUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.PagosCreateWithoutClienteInput, Prisma.PagosUncheckedCreateWithoutClienteInput> | Prisma.PagosCreateWithoutClienteInput[] | Prisma.PagosUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.PagosCreateOrConnectWithoutClienteInput | Prisma.PagosCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.PagosUpsertWithWhereUniqueWithoutClienteInput | Prisma.PagosUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.PagosCreateManyClienteInputEnvelope;
    set?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    disconnect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    delete?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    connect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    update?: Prisma.PagosUpdateWithWhereUniqueWithoutClienteInput | Prisma.PagosUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.PagosUpdateManyWithWhereWithoutClienteInput | Prisma.PagosUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.PagosScalarWhereInput | Prisma.PagosScalarWhereInput[];
};
export type PagosUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.PagosCreateWithoutClienteInput, Prisma.PagosUncheckedCreateWithoutClienteInput> | Prisma.PagosCreateWithoutClienteInput[] | Prisma.PagosUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.PagosCreateOrConnectWithoutClienteInput | Prisma.PagosCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.PagosUpsertWithWhereUniqueWithoutClienteInput | Prisma.PagosUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.PagosCreateManyClienteInputEnvelope;
    set?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    disconnect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    delete?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    connect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    update?: Prisma.PagosUpdateWithWhereUniqueWithoutClienteInput | Prisma.PagosUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.PagosUpdateManyWithWhereWithoutClienteInput | Prisma.PagosUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.PagosScalarWhereInput | Prisma.PagosScalarWhereInput[];
};
export type PagosCreateNestedManyWithoutFacturaInput = {
    create?: Prisma.XOR<Prisma.PagosCreateWithoutFacturaInput, Prisma.PagosUncheckedCreateWithoutFacturaInput> | Prisma.PagosCreateWithoutFacturaInput[] | Prisma.PagosUncheckedCreateWithoutFacturaInput[];
    connectOrCreate?: Prisma.PagosCreateOrConnectWithoutFacturaInput | Prisma.PagosCreateOrConnectWithoutFacturaInput[];
    createMany?: Prisma.PagosCreateManyFacturaInputEnvelope;
    connect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
};
export type PagosUncheckedCreateNestedManyWithoutFacturaInput = {
    create?: Prisma.XOR<Prisma.PagosCreateWithoutFacturaInput, Prisma.PagosUncheckedCreateWithoutFacturaInput> | Prisma.PagosCreateWithoutFacturaInput[] | Prisma.PagosUncheckedCreateWithoutFacturaInput[];
    connectOrCreate?: Prisma.PagosCreateOrConnectWithoutFacturaInput | Prisma.PagosCreateOrConnectWithoutFacturaInput[];
    createMany?: Prisma.PagosCreateManyFacturaInputEnvelope;
    connect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
};
export type PagosUpdateManyWithoutFacturaNestedInput = {
    create?: Prisma.XOR<Prisma.PagosCreateWithoutFacturaInput, Prisma.PagosUncheckedCreateWithoutFacturaInput> | Prisma.PagosCreateWithoutFacturaInput[] | Prisma.PagosUncheckedCreateWithoutFacturaInput[];
    connectOrCreate?: Prisma.PagosCreateOrConnectWithoutFacturaInput | Prisma.PagosCreateOrConnectWithoutFacturaInput[];
    upsert?: Prisma.PagosUpsertWithWhereUniqueWithoutFacturaInput | Prisma.PagosUpsertWithWhereUniqueWithoutFacturaInput[];
    createMany?: Prisma.PagosCreateManyFacturaInputEnvelope;
    set?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    disconnect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    delete?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    connect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    update?: Prisma.PagosUpdateWithWhereUniqueWithoutFacturaInput | Prisma.PagosUpdateWithWhereUniqueWithoutFacturaInput[];
    updateMany?: Prisma.PagosUpdateManyWithWhereWithoutFacturaInput | Prisma.PagosUpdateManyWithWhereWithoutFacturaInput[];
    deleteMany?: Prisma.PagosScalarWhereInput | Prisma.PagosScalarWhereInput[];
};
export type PagosUncheckedUpdateManyWithoutFacturaNestedInput = {
    create?: Prisma.XOR<Prisma.PagosCreateWithoutFacturaInput, Prisma.PagosUncheckedCreateWithoutFacturaInput> | Prisma.PagosCreateWithoutFacturaInput[] | Prisma.PagosUncheckedCreateWithoutFacturaInput[];
    connectOrCreate?: Prisma.PagosCreateOrConnectWithoutFacturaInput | Prisma.PagosCreateOrConnectWithoutFacturaInput[];
    upsert?: Prisma.PagosUpsertWithWhereUniqueWithoutFacturaInput | Prisma.PagosUpsertWithWhereUniqueWithoutFacturaInput[];
    createMany?: Prisma.PagosCreateManyFacturaInputEnvelope;
    set?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    disconnect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    delete?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    connect?: Prisma.PagosWhereUniqueInput | Prisma.PagosWhereUniqueInput[];
    update?: Prisma.PagosUpdateWithWhereUniqueWithoutFacturaInput | Prisma.PagosUpdateWithWhereUniqueWithoutFacturaInput[];
    updateMany?: Prisma.PagosUpdateManyWithWhereWithoutFacturaInput | Prisma.PagosUpdateManyWithWhereWithoutFacturaInput[];
    deleteMany?: Prisma.PagosScalarWhereInput | Prisma.PagosScalarWhereInput[];
};
export type PagosCreateWithoutClienteInput = {
    pagoId?: bigint | number;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
    factura?: Prisma.FacturasCreateNestedOneWithoutPagosInput;
};
export type PagosUncheckedCreateWithoutClienteInput = {
    pagoId?: bigint | number;
    facturaId?: bigint | number | null;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
};
export type PagosCreateOrConnectWithoutClienteInput = {
    where: Prisma.PagosWhereUniqueInput;
    create: Prisma.XOR<Prisma.PagosCreateWithoutClienteInput, Prisma.PagosUncheckedCreateWithoutClienteInput>;
};
export type PagosCreateManyClienteInputEnvelope = {
    data: Prisma.PagosCreateManyClienteInput | Prisma.PagosCreateManyClienteInput[];
    skipDuplicates?: boolean;
};
export type PagosUpsertWithWhereUniqueWithoutClienteInput = {
    where: Prisma.PagosWhereUniqueInput;
    update: Prisma.XOR<Prisma.PagosUpdateWithoutClienteInput, Prisma.PagosUncheckedUpdateWithoutClienteInput>;
    create: Prisma.XOR<Prisma.PagosCreateWithoutClienteInput, Prisma.PagosUncheckedCreateWithoutClienteInput>;
};
export type PagosUpdateWithWhereUniqueWithoutClienteInput = {
    where: Prisma.PagosWhereUniqueInput;
    data: Prisma.XOR<Prisma.PagosUpdateWithoutClienteInput, Prisma.PagosUncheckedUpdateWithoutClienteInput>;
};
export type PagosUpdateManyWithWhereWithoutClienteInput = {
    where: Prisma.PagosScalarWhereInput;
    data: Prisma.XOR<Prisma.PagosUpdateManyMutationInput, Prisma.PagosUncheckedUpdateManyWithoutClienteInput>;
};
export type PagosScalarWhereInput = {
    AND?: Prisma.PagosScalarWhereInput | Prisma.PagosScalarWhereInput[];
    OR?: Prisma.PagosScalarWhereInput[];
    NOT?: Prisma.PagosScalarWhereInput | Prisma.PagosScalarWhereInput[];
    pagoId?: Prisma.BigIntFilter<"Pagos"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"Pagos"> | bigint | number | null;
    facturaId?: Prisma.BigIntNullableFilter<"Pagos"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Pagos"> | Date | string;
    monto?: Prisma.FloatFilter<"Pagos"> | number;
    metodoPago?: Prisma.StringNullableFilter<"Pagos"> | string | null;
};
export type PagosCreateWithoutFacturaInput = {
    pagoId?: bigint | number;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutPagosInput;
};
export type PagosUncheckedCreateWithoutFacturaInput = {
    pagoId?: bigint | number;
    clienteId?: bigint | number | null;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
};
export type PagosCreateOrConnectWithoutFacturaInput = {
    where: Prisma.PagosWhereUniqueInput;
    create: Prisma.XOR<Prisma.PagosCreateWithoutFacturaInput, Prisma.PagosUncheckedCreateWithoutFacturaInput>;
};
export type PagosCreateManyFacturaInputEnvelope = {
    data: Prisma.PagosCreateManyFacturaInput | Prisma.PagosCreateManyFacturaInput[];
    skipDuplicates?: boolean;
};
export type PagosUpsertWithWhereUniqueWithoutFacturaInput = {
    where: Prisma.PagosWhereUniqueInput;
    update: Prisma.XOR<Prisma.PagosUpdateWithoutFacturaInput, Prisma.PagosUncheckedUpdateWithoutFacturaInput>;
    create: Prisma.XOR<Prisma.PagosCreateWithoutFacturaInput, Prisma.PagosUncheckedCreateWithoutFacturaInput>;
};
export type PagosUpdateWithWhereUniqueWithoutFacturaInput = {
    where: Prisma.PagosWhereUniqueInput;
    data: Prisma.XOR<Prisma.PagosUpdateWithoutFacturaInput, Prisma.PagosUncheckedUpdateWithoutFacturaInput>;
};
export type PagosUpdateManyWithWhereWithoutFacturaInput = {
    where: Prisma.PagosScalarWhereInput;
    data: Prisma.XOR<Prisma.PagosUpdateManyMutationInput, Prisma.PagosUncheckedUpdateManyWithoutFacturaInput>;
};
export type PagosCreateManyClienteInput = {
    pagoId?: bigint | number;
    facturaId?: bigint | number | null;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
};
export type PagosUpdateWithoutClienteInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    factura?: Prisma.FacturasUpdateOneWithoutPagosNestedInput;
};
export type PagosUncheckedUpdateWithoutClienteInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    facturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PagosUncheckedUpdateManyWithoutClienteInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    facturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PagosCreateManyFacturaInput = {
    pagoId?: bigint | number;
    clienteId?: bigint | number | null;
    fecha: Date | string;
    monto: number;
    metodoPago?: string | null;
};
export type PagosUpdateWithoutFacturaInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cliente?: Prisma.ClientesUpdateOneWithoutPagosNestedInput;
};
export type PagosUncheckedUpdateWithoutFacturaInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PagosUncheckedUpdateManyWithoutFacturaInput = {
    pagoId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    monto?: Prisma.FloatFieldUpdateOperationsInput | number;
    metodoPago?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PagosSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    pagoId?: boolean;
    clienteId?: boolean;
    facturaId?: boolean;
    fecha?: boolean;
    monto?: boolean;
    metodoPago?: boolean;
    cliente?: boolean | Prisma.Pagos$clienteArgs<ExtArgs>;
    factura?: boolean | Prisma.Pagos$facturaArgs<ExtArgs>;
}, ExtArgs["result"]["pagos"]>;
export type PagosSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    pagoId?: boolean;
    clienteId?: boolean;
    facturaId?: boolean;
    fecha?: boolean;
    monto?: boolean;
    metodoPago?: boolean;
    cliente?: boolean | Prisma.Pagos$clienteArgs<ExtArgs>;
    factura?: boolean | Prisma.Pagos$facturaArgs<ExtArgs>;
}, ExtArgs["result"]["pagos"]>;
export type PagosSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    pagoId?: boolean;
    clienteId?: boolean;
    facturaId?: boolean;
    fecha?: boolean;
    monto?: boolean;
    metodoPago?: boolean;
    cliente?: boolean | Prisma.Pagos$clienteArgs<ExtArgs>;
    factura?: boolean | Prisma.Pagos$facturaArgs<ExtArgs>;
}, ExtArgs["result"]["pagos"]>;
export type PagosSelectScalar = {
    pagoId?: boolean;
    clienteId?: boolean;
    facturaId?: boolean;
    fecha?: boolean;
    monto?: boolean;
    metodoPago?: boolean;
};
export type PagosOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"pagoId" | "clienteId" | "facturaId" | "fecha" | "monto" | "metodoPago", ExtArgs["result"]["pagos"]>;
export type PagosInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Pagos$clienteArgs<ExtArgs>;
    factura?: boolean | Prisma.Pagos$facturaArgs<ExtArgs>;
};
export type PagosIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Pagos$clienteArgs<ExtArgs>;
    factura?: boolean | Prisma.Pagos$facturaArgs<ExtArgs>;
};
export type PagosIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Pagos$clienteArgs<ExtArgs>;
    factura?: boolean | Prisma.Pagos$facturaArgs<ExtArgs>;
};
export type $PagosPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Pagos";
    objects: {
        cliente: Prisma.$ClientesPayload<ExtArgs> | null;
        factura: Prisma.$FacturasPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        pagoId: bigint;
        clienteId: bigint | null;
        facturaId: bigint | null;
        fecha: Date;
        monto: number;
        metodoPago: string | null;
    }, ExtArgs["result"]["pagos"]>;
    composites: {};
};
export type PagosGetPayload<S extends boolean | null | undefined | PagosDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PagosPayload, S>;
export type PagosCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PagosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PagosCountAggregateInputType | true;
};
export interface PagosDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Pagos'];
        meta: {
            name: 'Pagos';
        };
    };
    findUnique<T extends PagosFindUniqueArgs>(args: Prisma.SelectSubset<T, PagosFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PagosClient<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PagosFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PagosFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PagosClient<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PagosFindFirstArgs>(args?: Prisma.SelectSubset<T, PagosFindFirstArgs<ExtArgs>>): Prisma.Prisma__PagosClient<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PagosFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PagosFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PagosClient<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PagosFindManyArgs>(args?: Prisma.SelectSubset<T, PagosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PagosCreateArgs>(args: Prisma.SelectSubset<T, PagosCreateArgs<ExtArgs>>): Prisma.Prisma__PagosClient<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PagosCreateManyArgs>(args?: Prisma.SelectSubset<T, PagosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PagosCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PagosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PagosDeleteArgs>(args: Prisma.SelectSubset<T, PagosDeleteArgs<ExtArgs>>): Prisma.Prisma__PagosClient<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PagosUpdateArgs>(args: Prisma.SelectSubset<T, PagosUpdateArgs<ExtArgs>>): Prisma.Prisma__PagosClient<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PagosDeleteManyArgs>(args?: Prisma.SelectSubset<T, PagosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PagosUpdateManyArgs>(args: Prisma.SelectSubset<T, PagosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PagosUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PagosUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PagosUpsertArgs>(args: Prisma.SelectSubset<T, PagosUpsertArgs<ExtArgs>>): Prisma.Prisma__PagosClient<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PagosCountArgs>(args?: Prisma.Subset<T, PagosCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PagosCountAggregateOutputType> : number>;
    aggregate<T extends PagosAggregateArgs>(args: Prisma.Subset<T, PagosAggregateArgs>): Prisma.PrismaPromise<GetPagosAggregateType<T>>;
    groupBy<T extends PagosGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PagosGroupByArgs['orderBy'];
    } : {
        orderBy?: PagosGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PagosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPagosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PagosFieldRefs;
}
export interface Prisma__PagosClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    cliente<T extends Prisma.Pagos$clienteArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Pagos$clienteArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    factura<T extends Prisma.Pagos$facturaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Pagos$facturaArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PagosFieldRefs {
    readonly pagoId: Prisma.FieldRef<"Pagos", 'BigInt'>;
    readonly clienteId: Prisma.FieldRef<"Pagos", 'BigInt'>;
    readonly facturaId: Prisma.FieldRef<"Pagos", 'BigInt'>;
    readonly fecha: Prisma.FieldRef<"Pagos", 'DateTime'>;
    readonly monto: Prisma.FieldRef<"Pagos", 'Float'>;
    readonly metodoPago: Prisma.FieldRef<"Pagos", 'String'>;
}
export type PagosFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    where: Prisma.PagosWhereUniqueInput;
};
export type PagosFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    where: Prisma.PagosWhereUniqueInput;
};
export type PagosFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    where?: Prisma.PagosWhereInput;
    orderBy?: Prisma.PagosOrderByWithRelationInput | Prisma.PagosOrderByWithRelationInput[];
    cursor?: Prisma.PagosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PagosScalarFieldEnum | Prisma.PagosScalarFieldEnum[];
};
export type PagosFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    where?: Prisma.PagosWhereInput;
    orderBy?: Prisma.PagosOrderByWithRelationInput | Prisma.PagosOrderByWithRelationInput[];
    cursor?: Prisma.PagosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PagosScalarFieldEnum | Prisma.PagosScalarFieldEnum[];
};
export type PagosFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    where?: Prisma.PagosWhereInput;
    orderBy?: Prisma.PagosOrderByWithRelationInput | Prisma.PagosOrderByWithRelationInput[];
    cursor?: Prisma.PagosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PagosScalarFieldEnum | Prisma.PagosScalarFieldEnum[];
};
export type PagosCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PagosCreateInput, Prisma.PagosUncheckedCreateInput>;
};
export type PagosCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PagosCreateManyInput | Prisma.PagosCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PagosCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    data: Prisma.PagosCreateManyInput | Prisma.PagosCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PagosIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PagosUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PagosUpdateInput, Prisma.PagosUncheckedUpdateInput>;
    where: Prisma.PagosWhereUniqueInput;
};
export type PagosUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PagosUpdateManyMutationInput, Prisma.PagosUncheckedUpdateManyInput>;
    where?: Prisma.PagosWhereInput;
    limit?: number;
};
export type PagosUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PagosUpdateManyMutationInput, Prisma.PagosUncheckedUpdateManyInput>;
    where?: Prisma.PagosWhereInput;
    limit?: number;
    include?: Prisma.PagosIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PagosUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    where: Prisma.PagosWhereUniqueInput;
    create: Prisma.XOR<Prisma.PagosCreateInput, Prisma.PagosUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PagosUpdateInput, Prisma.PagosUncheckedUpdateInput>;
};
export type PagosDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
    where: Prisma.PagosWhereUniqueInput;
};
export type PagosDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PagosWhereInput;
    limit?: number;
};
export type Pagos$clienteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where?: Prisma.ClientesWhereInput;
};
export type Pagos$facturaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where?: Prisma.FacturasWhereInput;
};
export type PagosDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PagosSelect<ExtArgs> | null;
    omit?: Prisma.PagosOmit<ExtArgs> | null;
    include?: Prisma.PagosInclude<ExtArgs> | null;
};
export {};
