import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type FacturasModel = runtime.Types.Result.DefaultSelection<Prisma.$FacturasPayload>;
export type AggregateFacturas = {
    _count: FacturasCountAggregateOutputType | null;
    _avg: FacturasAvgAggregateOutputType | null;
    _sum: FacturasSumAggregateOutputType | null;
    _min: FacturasMinAggregateOutputType | null;
    _max: FacturasMaxAggregateOutputType | null;
};
export type FacturasAvgAggregateOutputType = {
    facturaId: number | null;
    clienteId: number | null;
    lecturaId: number | null;
    consumo: number | null;
    tarifa: number | null;
    interesMora: number | null;
    abono: number | null;
    saldo: number | null;
};
export type FacturasSumAggregateOutputType = {
    facturaId: bigint | null;
    clienteId: bigint | null;
    lecturaId: bigint | null;
    consumo: number | null;
    tarifa: number | null;
    interesMora: number | null;
    abono: number | null;
    saldo: number | null;
};
export type FacturasMinAggregateOutputType = {
    facturaId: bigint | null;
    clienteId: bigint | null;
    lecturaId: bigint | null;
    fecha: Date | null;
    mes: string | null;
    consumo: number | null;
    tarifa: number | null;
    interesMora: number | null;
    abono: number | null;
    saldo: number | null;
};
export type FacturasMaxAggregateOutputType = {
    facturaId: bigint | null;
    clienteId: bigint | null;
    lecturaId: bigint | null;
    fecha: Date | null;
    mes: string | null;
    consumo: number | null;
    tarifa: number | null;
    interesMora: number | null;
    abono: number | null;
    saldo: number | null;
};
export type FacturasCountAggregateOutputType = {
    facturaId: number;
    clienteId: number;
    lecturaId: number;
    fecha: number;
    mes: number;
    consumo: number;
    tarifa: number;
    interesMora: number;
    abono: number;
    saldo: number;
    _all: number;
};
export type FacturasAvgAggregateInputType = {
    facturaId?: true;
    clienteId?: true;
    lecturaId?: true;
    consumo?: true;
    tarifa?: true;
    interesMora?: true;
    abono?: true;
    saldo?: true;
};
export type FacturasSumAggregateInputType = {
    facturaId?: true;
    clienteId?: true;
    lecturaId?: true;
    consumo?: true;
    tarifa?: true;
    interesMora?: true;
    abono?: true;
    saldo?: true;
};
export type FacturasMinAggregateInputType = {
    facturaId?: true;
    clienteId?: true;
    lecturaId?: true;
    fecha?: true;
    mes?: true;
    consumo?: true;
    tarifa?: true;
    interesMora?: true;
    abono?: true;
    saldo?: true;
};
export type FacturasMaxAggregateInputType = {
    facturaId?: true;
    clienteId?: true;
    lecturaId?: true;
    fecha?: true;
    mes?: true;
    consumo?: true;
    tarifa?: true;
    interesMora?: true;
    abono?: true;
    saldo?: true;
};
export type FacturasCountAggregateInputType = {
    facturaId?: true;
    clienteId?: true;
    lecturaId?: true;
    fecha?: true;
    mes?: true;
    consumo?: true;
    tarifa?: true;
    interesMora?: true;
    abono?: true;
    saldo?: true;
    _all?: true;
};
export type FacturasAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FacturasWhereInput;
    orderBy?: Prisma.FacturasOrderByWithRelationInput | Prisma.FacturasOrderByWithRelationInput[];
    cursor?: Prisma.FacturasWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | FacturasCountAggregateInputType;
    _avg?: FacturasAvgAggregateInputType;
    _sum?: FacturasSumAggregateInputType;
    _min?: FacturasMinAggregateInputType;
    _max?: FacturasMaxAggregateInputType;
};
export type GetFacturasAggregateType<T extends FacturasAggregateArgs> = {
    [P in keyof T & keyof AggregateFacturas]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateFacturas[P]> : Prisma.GetScalarType<T[P], AggregateFacturas[P]>;
};
export type FacturasGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FacturasWhereInput;
    orderBy?: Prisma.FacturasOrderByWithAggregationInput | Prisma.FacturasOrderByWithAggregationInput[];
    by: Prisma.FacturasScalarFieldEnum[] | Prisma.FacturasScalarFieldEnum;
    having?: Prisma.FacturasScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: FacturasCountAggregateInputType | true;
    _avg?: FacturasAvgAggregateInputType;
    _sum?: FacturasSumAggregateInputType;
    _min?: FacturasMinAggregateInputType;
    _max?: FacturasMaxAggregateInputType;
};
export type FacturasGroupByOutputType = {
    facturaId: bigint;
    clienteId: bigint | null;
    lecturaId: bigint | null;
    fecha: Date;
    mes: string;
    consumo: number | null;
    tarifa: number | null;
    interesMora: number | null;
    abono: number | null;
    saldo: number | null;
    _count: FacturasCountAggregateOutputType | null;
    _avg: FacturasAvgAggregateOutputType | null;
    _sum: FacturasSumAggregateOutputType | null;
    _min: FacturasMinAggregateOutputType | null;
    _max: FacturasMaxAggregateOutputType | null;
};
type GetFacturasGroupByPayload<T extends FacturasGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<FacturasGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof FacturasGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], FacturasGroupByOutputType[P]> : Prisma.GetScalarType<T[P], FacturasGroupByOutputType[P]>;
}>>;
export type FacturasWhereInput = {
    AND?: Prisma.FacturasWhereInput | Prisma.FacturasWhereInput[];
    OR?: Prisma.FacturasWhereInput[];
    NOT?: Prisma.FacturasWhereInput | Prisma.FacturasWhereInput[];
    facturaId?: Prisma.BigIntFilter<"Facturas"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"Facturas"> | bigint | number | null;
    lecturaId?: Prisma.BigIntNullableFilter<"Facturas"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Facturas"> | Date | string;
    mes?: Prisma.StringFilter<"Facturas"> | string;
    consumo?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    tarifa?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    interesMora?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    abono?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    saldo?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
    lectura?: Prisma.XOR<Prisma.LecturasNullableScalarRelationFilter, Prisma.LecturasWhereInput> | null;
    detalleFactura?: Prisma.DetalleFacturaListRelationFilter;
    pagos?: Prisma.PagosListRelationFilter;
};
export type FacturasOrderByWithRelationInput = {
    facturaId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    lecturaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    mes?: Prisma.SortOrder;
    consumo?: Prisma.SortOrderInput | Prisma.SortOrder;
    tarifa?: Prisma.SortOrderInput | Prisma.SortOrder;
    interesMora?: Prisma.SortOrderInput | Prisma.SortOrder;
    abono?: Prisma.SortOrderInput | Prisma.SortOrder;
    saldo?: Prisma.SortOrderInput | Prisma.SortOrder;
    cliente?: Prisma.ClientesOrderByWithRelationInput;
    lectura?: Prisma.LecturasOrderByWithRelationInput;
    detalleFactura?: Prisma.DetalleFacturaOrderByRelationAggregateInput;
    pagos?: Prisma.PagosOrderByRelationAggregateInput;
};
export type FacturasWhereUniqueInput = Prisma.AtLeast<{
    facturaId?: bigint | number;
    AND?: Prisma.FacturasWhereInput | Prisma.FacturasWhereInput[];
    OR?: Prisma.FacturasWhereInput[];
    NOT?: Prisma.FacturasWhereInput | Prisma.FacturasWhereInput[];
    clienteId?: Prisma.BigIntNullableFilter<"Facturas"> | bigint | number | null;
    lecturaId?: Prisma.BigIntNullableFilter<"Facturas"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Facturas"> | Date | string;
    mes?: Prisma.StringFilter<"Facturas"> | string;
    consumo?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    tarifa?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    interesMora?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    abono?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    saldo?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
    lectura?: Prisma.XOR<Prisma.LecturasNullableScalarRelationFilter, Prisma.LecturasWhereInput> | null;
    detalleFactura?: Prisma.DetalleFacturaListRelationFilter;
    pagos?: Prisma.PagosListRelationFilter;
}, "facturaId">;
export type FacturasOrderByWithAggregationInput = {
    facturaId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    lecturaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    mes?: Prisma.SortOrder;
    consumo?: Prisma.SortOrderInput | Prisma.SortOrder;
    tarifa?: Prisma.SortOrderInput | Prisma.SortOrder;
    interesMora?: Prisma.SortOrderInput | Prisma.SortOrder;
    abono?: Prisma.SortOrderInput | Prisma.SortOrder;
    saldo?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.FacturasCountOrderByAggregateInput;
    _avg?: Prisma.FacturasAvgOrderByAggregateInput;
    _max?: Prisma.FacturasMaxOrderByAggregateInput;
    _min?: Prisma.FacturasMinOrderByAggregateInput;
    _sum?: Prisma.FacturasSumOrderByAggregateInput;
};
export type FacturasScalarWhereWithAggregatesInput = {
    AND?: Prisma.FacturasScalarWhereWithAggregatesInput | Prisma.FacturasScalarWhereWithAggregatesInput[];
    OR?: Prisma.FacturasScalarWhereWithAggregatesInput[];
    NOT?: Prisma.FacturasScalarWhereWithAggregatesInput | Prisma.FacturasScalarWhereWithAggregatesInput[];
    facturaId?: Prisma.BigIntWithAggregatesFilter<"Facturas"> | bigint | number;
    clienteId?: Prisma.BigIntNullableWithAggregatesFilter<"Facturas"> | bigint | number | null;
    lecturaId?: Prisma.BigIntNullableWithAggregatesFilter<"Facturas"> | bigint | number | null;
    fecha?: Prisma.DateTimeWithAggregatesFilter<"Facturas"> | Date | string;
    mes?: Prisma.StringWithAggregatesFilter<"Facturas"> | string;
    consumo?: Prisma.FloatNullableWithAggregatesFilter<"Facturas"> | number | null;
    tarifa?: Prisma.FloatNullableWithAggregatesFilter<"Facturas"> | number | null;
    interesMora?: Prisma.FloatNullableWithAggregatesFilter<"Facturas"> | number | null;
    abono?: Prisma.FloatNullableWithAggregatesFilter<"Facturas"> | number | null;
    saldo?: Prisma.FloatNullableWithAggregatesFilter<"Facturas"> | number | null;
};
export type FacturasCreateInput = {
    facturaId?: bigint | number;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutFacturasInput;
    lectura?: Prisma.LecturasCreateNestedOneWithoutFacturasInput;
    detalleFactura?: Prisma.DetalleFacturaCreateNestedManyWithoutFacturaInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutFacturaInput;
};
export type FacturasUncheckedCreateInput = {
    facturaId?: bigint | number;
    clienteId?: bigint | number | null;
    lecturaId?: bigint | number | null;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    detalleFactura?: Prisma.DetalleFacturaUncheckedCreateNestedManyWithoutFacturaInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutFacturaInput;
};
export type FacturasUpdateInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    cliente?: Prisma.ClientesUpdateOneWithoutFacturasNestedInput;
    lectura?: Prisma.LecturasUpdateOneWithoutFacturasNestedInput;
    detalleFactura?: Prisma.DetalleFacturaUpdateManyWithoutFacturaNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutFacturaNestedInput;
};
export type FacturasUncheckedUpdateInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    lecturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    detalleFactura?: Prisma.DetalleFacturaUncheckedUpdateManyWithoutFacturaNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutFacturaNestedInput;
};
export type FacturasCreateManyInput = {
    facturaId?: bigint | number;
    clienteId?: bigint | number | null;
    lecturaId?: bigint | number | null;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
};
export type FacturasUpdateManyMutationInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
};
export type FacturasUncheckedUpdateManyInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    lecturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
};
export type FacturasListRelationFilter = {
    every?: Prisma.FacturasWhereInput;
    some?: Prisma.FacturasWhereInput;
    none?: Prisma.FacturasWhereInput;
};
export type FacturasOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type FacturasNullableScalarRelationFilter = {
    is?: Prisma.FacturasWhereInput | null;
    isNot?: Prisma.FacturasWhereInput | null;
};
export type FacturasCountOrderByAggregateInput = {
    facturaId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    lecturaId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    mes?: Prisma.SortOrder;
    consumo?: Prisma.SortOrder;
    tarifa?: Prisma.SortOrder;
    interesMora?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldo?: Prisma.SortOrder;
};
export type FacturasAvgOrderByAggregateInput = {
    facturaId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    lecturaId?: Prisma.SortOrder;
    consumo?: Prisma.SortOrder;
    tarifa?: Prisma.SortOrder;
    interesMora?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldo?: Prisma.SortOrder;
};
export type FacturasMaxOrderByAggregateInput = {
    facturaId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    lecturaId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    mes?: Prisma.SortOrder;
    consumo?: Prisma.SortOrder;
    tarifa?: Prisma.SortOrder;
    interesMora?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldo?: Prisma.SortOrder;
};
export type FacturasMinOrderByAggregateInput = {
    facturaId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    lecturaId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    mes?: Prisma.SortOrder;
    consumo?: Prisma.SortOrder;
    tarifa?: Prisma.SortOrder;
    interesMora?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldo?: Prisma.SortOrder;
};
export type FacturasSumOrderByAggregateInput = {
    facturaId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    lecturaId?: Prisma.SortOrder;
    consumo?: Prisma.SortOrder;
    tarifa?: Prisma.SortOrder;
    interesMora?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldo?: Prisma.SortOrder;
};
export type FacturasCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutClienteInput, Prisma.FacturasUncheckedCreateWithoutClienteInput> | Prisma.FacturasCreateWithoutClienteInput[] | Prisma.FacturasUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutClienteInput | Prisma.FacturasCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.FacturasCreateManyClienteInputEnvelope;
    connect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
};
export type FacturasUncheckedCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutClienteInput, Prisma.FacturasUncheckedCreateWithoutClienteInput> | Prisma.FacturasCreateWithoutClienteInput[] | Prisma.FacturasUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutClienteInput | Prisma.FacturasCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.FacturasCreateManyClienteInputEnvelope;
    connect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
};
export type FacturasUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutClienteInput, Prisma.FacturasUncheckedCreateWithoutClienteInput> | Prisma.FacturasCreateWithoutClienteInput[] | Prisma.FacturasUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutClienteInput | Prisma.FacturasCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.FacturasUpsertWithWhereUniqueWithoutClienteInput | Prisma.FacturasUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.FacturasCreateManyClienteInputEnvelope;
    set?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    disconnect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    delete?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    connect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    update?: Prisma.FacturasUpdateWithWhereUniqueWithoutClienteInput | Prisma.FacturasUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.FacturasUpdateManyWithWhereWithoutClienteInput | Prisma.FacturasUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.FacturasScalarWhereInput | Prisma.FacturasScalarWhereInput[];
};
export type FacturasUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutClienteInput, Prisma.FacturasUncheckedCreateWithoutClienteInput> | Prisma.FacturasCreateWithoutClienteInput[] | Prisma.FacturasUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutClienteInput | Prisma.FacturasCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.FacturasUpsertWithWhereUniqueWithoutClienteInput | Prisma.FacturasUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.FacturasCreateManyClienteInputEnvelope;
    set?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    disconnect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    delete?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    connect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    update?: Prisma.FacturasUpdateWithWhereUniqueWithoutClienteInput | Prisma.FacturasUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.FacturasUpdateManyWithWhereWithoutClienteInput | Prisma.FacturasUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.FacturasScalarWhereInput | Prisma.FacturasScalarWhereInput[];
};
export type FacturasCreateNestedOneWithoutDetalleFacturaInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutDetalleFacturaInput, Prisma.FacturasUncheckedCreateWithoutDetalleFacturaInput>;
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutDetalleFacturaInput;
    connect?: Prisma.FacturasWhereUniqueInput;
};
export type FacturasUpdateOneWithoutDetalleFacturaNestedInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutDetalleFacturaInput, Prisma.FacturasUncheckedCreateWithoutDetalleFacturaInput>;
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutDetalleFacturaInput;
    upsert?: Prisma.FacturasUpsertWithoutDetalleFacturaInput;
    disconnect?: Prisma.FacturasWhereInput | boolean;
    delete?: Prisma.FacturasWhereInput | boolean;
    connect?: Prisma.FacturasWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.FacturasUpdateToOneWithWhereWithoutDetalleFacturaInput, Prisma.FacturasUpdateWithoutDetalleFacturaInput>, Prisma.FacturasUncheckedUpdateWithoutDetalleFacturaInput>;
};
export type FacturasCreateNestedManyWithoutLecturaInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutLecturaInput, Prisma.FacturasUncheckedCreateWithoutLecturaInput> | Prisma.FacturasCreateWithoutLecturaInput[] | Prisma.FacturasUncheckedCreateWithoutLecturaInput[];
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutLecturaInput | Prisma.FacturasCreateOrConnectWithoutLecturaInput[];
    createMany?: Prisma.FacturasCreateManyLecturaInputEnvelope;
    connect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
};
export type FacturasUncheckedCreateNestedManyWithoutLecturaInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutLecturaInput, Prisma.FacturasUncheckedCreateWithoutLecturaInput> | Prisma.FacturasCreateWithoutLecturaInput[] | Prisma.FacturasUncheckedCreateWithoutLecturaInput[];
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutLecturaInput | Prisma.FacturasCreateOrConnectWithoutLecturaInput[];
    createMany?: Prisma.FacturasCreateManyLecturaInputEnvelope;
    connect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
};
export type FacturasUpdateManyWithoutLecturaNestedInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutLecturaInput, Prisma.FacturasUncheckedCreateWithoutLecturaInput> | Prisma.FacturasCreateWithoutLecturaInput[] | Prisma.FacturasUncheckedCreateWithoutLecturaInput[];
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutLecturaInput | Prisma.FacturasCreateOrConnectWithoutLecturaInput[];
    upsert?: Prisma.FacturasUpsertWithWhereUniqueWithoutLecturaInput | Prisma.FacturasUpsertWithWhereUniqueWithoutLecturaInput[];
    createMany?: Prisma.FacturasCreateManyLecturaInputEnvelope;
    set?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    disconnect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    delete?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    connect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    update?: Prisma.FacturasUpdateWithWhereUniqueWithoutLecturaInput | Prisma.FacturasUpdateWithWhereUniqueWithoutLecturaInput[];
    updateMany?: Prisma.FacturasUpdateManyWithWhereWithoutLecturaInput | Prisma.FacturasUpdateManyWithWhereWithoutLecturaInput[];
    deleteMany?: Prisma.FacturasScalarWhereInput | Prisma.FacturasScalarWhereInput[];
};
export type FacturasUncheckedUpdateManyWithoutLecturaNestedInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutLecturaInput, Prisma.FacturasUncheckedCreateWithoutLecturaInput> | Prisma.FacturasCreateWithoutLecturaInput[] | Prisma.FacturasUncheckedCreateWithoutLecturaInput[];
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutLecturaInput | Prisma.FacturasCreateOrConnectWithoutLecturaInput[];
    upsert?: Prisma.FacturasUpsertWithWhereUniqueWithoutLecturaInput | Prisma.FacturasUpsertWithWhereUniqueWithoutLecturaInput[];
    createMany?: Prisma.FacturasCreateManyLecturaInputEnvelope;
    set?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    disconnect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    delete?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    connect?: Prisma.FacturasWhereUniqueInput | Prisma.FacturasWhereUniqueInput[];
    update?: Prisma.FacturasUpdateWithWhereUniqueWithoutLecturaInput | Prisma.FacturasUpdateWithWhereUniqueWithoutLecturaInput[];
    updateMany?: Prisma.FacturasUpdateManyWithWhereWithoutLecturaInput | Prisma.FacturasUpdateManyWithWhereWithoutLecturaInput[];
    deleteMany?: Prisma.FacturasScalarWhereInput | Prisma.FacturasScalarWhereInput[];
};
export type FacturasCreateNestedOneWithoutPagosInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutPagosInput, Prisma.FacturasUncheckedCreateWithoutPagosInput>;
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutPagosInput;
    connect?: Prisma.FacturasWhereUniqueInput;
};
export type FacturasUpdateOneWithoutPagosNestedInput = {
    create?: Prisma.XOR<Prisma.FacturasCreateWithoutPagosInput, Prisma.FacturasUncheckedCreateWithoutPagosInput>;
    connectOrCreate?: Prisma.FacturasCreateOrConnectWithoutPagosInput;
    upsert?: Prisma.FacturasUpsertWithoutPagosInput;
    disconnect?: Prisma.FacturasWhereInput | boolean;
    delete?: Prisma.FacturasWhereInput | boolean;
    connect?: Prisma.FacturasWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.FacturasUpdateToOneWithWhereWithoutPagosInput, Prisma.FacturasUpdateWithoutPagosInput>, Prisma.FacturasUncheckedUpdateWithoutPagosInput>;
};
export type FacturasCreateWithoutClienteInput = {
    facturaId?: bigint | number;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    lectura?: Prisma.LecturasCreateNestedOneWithoutFacturasInput;
    detalleFactura?: Prisma.DetalleFacturaCreateNestedManyWithoutFacturaInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutFacturaInput;
};
export type FacturasUncheckedCreateWithoutClienteInput = {
    facturaId?: bigint | number;
    lecturaId?: bigint | number | null;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    detalleFactura?: Prisma.DetalleFacturaUncheckedCreateNestedManyWithoutFacturaInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutFacturaInput;
};
export type FacturasCreateOrConnectWithoutClienteInput = {
    where: Prisma.FacturasWhereUniqueInput;
    create: Prisma.XOR<Prisma.FacturasCreateWithoutClienteInput, Prisma.FacturasUncheckedCreateWithoutClienteInput>;
};
export type FacturasCreateManyClienteInputEnvelope = {
    data: Prisma.FacturasCreateManyClienteInput | Prisma.FacturasCreateManyClienteInput[];
    skipDuplicates?: boolean;
};
export type FacturasUpsertWithWhereUniqueWithoutClienteInput = {
    where: Prisma.FacturasWhereUniqueInput;
    update: Prisma.XOR<Prisma.FacturasUpdateWithoutClienteInput, Prisma.FacturasUncheckedUpdateWithoutClienteInput>;
    create: Prisma.XOR<Prisma.FacturasCreateWithoutClienteInput, Prisma.FacturasUncheckedCreateWithoutClienteInput>;
};
export type FacturasUpdateWithWhereUniqueWithoutClienteInput = {
    where: Prisma.FacturasWhereUniqueInput;
    data: Prisma.XOR<Prisma.FacturasUpdateWithoutClienteInput, Prisma.FacturasUncheckedUpdateWithoutClienteInput>;
};
export type FacturasUpdateManyWithWhereWithoutClienteInput = {
    where: Prisma.FacturasScalarWhereInput;
    data: Prisma.XOR<Prisma.FacturasUpdateManyMutationInput, Prisma.FacturasUncheckedUpdateManyWithoutClienteInput>;
};
export type FacturasScalarWhereInput = {
    AND?: Prisma.FacturasScalarWhereInput | Prisma.FacturasScalarWhereInput[];
    OR?: Prisma.FacturasScalarWhereInput[];
    NOT?: Prisma.FacturasScalarWhereInput | Prisma.FacturasScalarWhereInput[];
    facturaId?: Prisma.BigIntFilter<"Facturas"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"Facturas"> | bigint | number | null;
    lecturaId?: Prisma.BigIntNullableFilter<"Facturas"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Facturas"> | Date | string;
    mes?: Prisma.StringFilter<"Facturas"> | string;
    consumo?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    tarifa?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    interesMora?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    abono?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
    saldo?: Prisma.FloatNullableFilter<"Facturas"> | number | null;
};
export type FacturasCreateWithoutDetalleFacturaInput = {
    facturaId?: bigint | number;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutFacturasInput;
    lectura?: Prisma.LecturasCreateNestedOneWithoutFacturasInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutFacturaInput;
};
export type FacturasUncheckedCreateWithoutDetalleFacturaInput = {
    facturaId?: bigint | number;
    clienteId?: bigint | number | null;
    lecturaId?: bigint | number | null;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutFacturaInput;
};
export type FacturasCreateOrConnectWithoutDetalleFacturaInput = {
    where: Prisma.FacturasWhereUniqueInput;
    create: Prisma.XOR<Prisma.FacturasCreateWithoutDetalleFacturaInput, Prisma.FacturasUncheckedCreateWithoutDetalleFacturaInput>;
};
export type FacturasUpsertWithoutDetalleFacturaInput = {
    update: Prisma.XOR<Prisma.FacturasUpdateWithoutDetalleFacturaInput, Prisma.FacturasUncheckedUpdateWithoutDetalleFacturaInput>;
    create: Prisma.XOR<Prisma.FacturasCreateWithoutDetalleFacturaInput, Prisma.FacturasUncheckedCreateWithoutDetalleFacturaInput>;
    where?: Prisma.FacturasWhereInput;
};
export type FacturasUpdateToOneWithWhereWithoutDetalleFacturaInput = {
    where?: Prisma.FacturasWhereInput;
    data: Prisma.XOR<Prisma.FacturasUpdateWithoutDetalleFacturaInput, Prisma.FacturasUncheckedUpdateWithoutDetalleFacturaInput>;
};
export type FacturasUpdateWithoutDetalleFacturaInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    cliente?: Prisma.ClientesUpdateOneWithoutFacturasNestedInput;
    lectura?: Prisma.LecturasUpdateOneWithoutFacturasNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutFacturaNestedInput;
};
export type FacturasUncheckedUpdateWithoutDetalleFacturaInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    lecturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutFacturaNestedInput;
};
export type FacturasCreateWithoutLecturaInput = {
    facturaId?: bigint | number;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutFacturasInput;
    detalleFactura?: Prisma.DetalleFacturaCreateNestedManyWithoutFacturaInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutFacturaInput;
};
export type FacturasUncheckedCreateWithoutLecturaInput = {
    facturaId?: bigint | number;
    clienteId?: bigint | number | null;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    detalleFactura?: Prisma.DetalleFacturaUncheckedCreateNestedManyWithoutFacturaInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutFacturaInput;
};
export type FacturasCreateOrConnectWithoutLecturaInput = {
    where: Prisma.FacturasWhereUniqueInput;
    create: Prisma.XOR<Prisma.FacturasCreateWithoutLecturaInput, Prisma.FacturasUncheckedCreateWithoutLecturaInput>;
};
export type FacturasCreateManyLecturaInputEnvelope = {
    data: Prisma.FacturasCreateManyLecturaInput | Prisma.FacturasCreateManyLecturaInput[];
    skipDuplicates?: boolean;
};
export type FacturasUpsertWithWhereUniqueWithoutLecturaInput = {
    where: Prisma.FacturasWhereUniqueInput;
    update: Prisma.XOR<Prisma.FacturasUpdateWithoutLecturaInput, Prisma.FacturasUncheckedUpdateWithoutLecturaInput>;
    create: Prisma.XOR<Prisma.FacturasCreateWithoutLecturaInput, Prisma.FacturasUncheckedCreateWithoutLecturaInput>;
};
export type FacturasUpdateWithWhereUniqueWithoutLecturaInput = {
    where: Prisma.FacturasWhereUniqueInput;
    data: Prisma.XOR<Prisma.FacturasUpdateWithoutLecturaInput, Prisma.FacturasUncheckedUpdateWithoutLecturaInput>;
};
export type FacturasUpdateManyWithWhereWithoutLecturaInput = {
    where: Prisma.FacturasScalarWhereInput;
    data: Prisma.XOR<Prisma.FacturasUpdateManyMutationInput, Prisma.FacturasUncheckedUpdateManyWithoutLecturaInput>;
};
export type FacturasCreateWithoutPagosInput = {
    facturaId?: bigint | number;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutFacturasInput;
    lectura?: Prisma.LecturasCreateNestedOneWithoutFacturasInput;
    detalleFactura?: Prisma.DetalleFacturaCreateNestedManyWithoutFacturaInput;
};
export type FacturasUncheckedCreateWithoutPagosInput = {
    facturaId?: bigint | number;
    clienteId?: bigint | number | null;
    lecturaId?: bigint | number | null;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
    detalleFactura?: Prisma.DetalleFacturaUncheckedCreateNestedManyWithoutFacturaInput;
};
export type FacturasCreateOrConnectWithoutPagosInput = {
    where: Prisma.FacturasWhereUniqueInput;
    create: Prisma.XOR<Prisma.FacturasCreateWithoutPagosInput, Prisma.FacturasUncheckedCreateWithoutPagosInput>;
};
export type FacturasUpsertWithoutPagosInput = {
    update: Prisma.XOR<Prisma.FacturasUpdateWithoutPagosInput, Prisma.FacturasUncheckedUpdateWithoutPagosInput>;
    create: Prisma.XOR<Prisma.FacturasCreateWithoutPagosInput, Prisma.FacturasUncheckedCreateWithoutPagosInput>;
    where?: Prisma.FacturasWhereInput;
};
export type FacturasUpdateToOneWithWhereWithoutPagosInput = {
    where?: Prisma.FacturasWhereInput;
    data: Prisma.XOR<Prisma.FacturasUpdateWithoutPagosInput, Prisma.FacturasUncheckedUpdateWithoutPagosInput>;
};
export type FacturasUpdateWithoutPagosInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    cliente?: Prisma.ClientesUpdateOneWithoutFacturasNestedInput;
    lectura?: Prisma.LecturasUpdateOneWithoutFacturasNestedInput;
    detalleFactura?: Prisma.DetalleFacturaUpdateManyWithoutFacturaNestedInput;
};
export type FacturasUncheckedUpdateWithoutPagosInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    lecturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    detalleFactura?: Prisma.DetalleFacturaUncheckedUpdateManyWithoutFacturaNestedInput;
};
export type FacturasCreateManyClienteInput = {
    facturaId?: bigint | number;
    lecturaId?: bigint | number | null;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
};
export type FacturasUpdateWithoutClienteInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    lectura?: Prisma.LecturasUpdateOneWithoutFacturasNestedInput;
    detalleFactura?: Prisma.DetalleFacturaUpdateManyWithoutFacturaNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutFacturaNestedInput;
};
export type FacturasUncheckedUpdateWithoutClienteInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lecturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    detalleFactura?: Prisma.DetalleFacturaUncheckedUpdateManyWithoutFacturaNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutFacturaNestedInput;
};
export type FacturasUncheckedUpdateManyWithoutClienteInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lecturaId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
};
export type FacturasCreateManyLecturaInput = {
    facturaId?: bigint | number;
    clienteId?: bigint | number | null;
    fecha: Date | string;
    mes: string;
    consumo?: number | null;
    tarifa?: number | null;
    interesMora?: number | null;
    abono?: number | null;
    saldo?: number | null;
};
export type FacturasUpdateWithoutLecturaInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    cliente?: Prisma.ClientesUpdateOneWithoutFacturasNestedInput;
    detalleFactura?: Prisma.DetalleFacturaUpdateManyWithoutFacturaNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutFacturaNestedInput;
};
export type FacturasUncheckedUpdateWithoutLecturaInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    detalleFactura?: Prisma.DetalleFacturaUncheckedUpdateManyWithoutFacturaNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutFacturaNestedInput;
};
export type FacturasUncheckedUpdateManyWithoutLecturaInput = {
    facturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mes?: Prisma.StringFieldUpdateOperationsInput | string;
    consumo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    tarifa?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    interesMora?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldo?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
};
export type FacturasCountOutputType = {
    detalleFactura: number;
    pagos: number;
};
export type FacturasCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    detalleFactura?: boolean | FacturasCountOutputTypeCountDetalleFacturaArgs;
    pagos?: boolean | FacturasCountOutputTypeCountPagosArgs;
};
export type FacturasCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasCountOutputTypeSelect<ExtArgs> | null;
};
export type FacturasCountOutputTypeCountDetalleFacturaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DetalleFacturaWhereInput;
};
export type FacturasCountOutputTypeCountPagosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PagosWhereInput;
};
export type FacturasSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    facturaId?: boolean;
    clienteId?: boolean;
    lecturaId?: boolean;
    fecha?: boolean;
    mes?: boolean;
    consumo?: boolean;
    tarifa?: boolean;
    interesMora?: boolean;
    abono?: boolean;
    saldo?: boolean;
    cliente?: boolean | Prisma.Facturas$clienteArgs<ExtArgs>;
    lectura?: boolean | Prisma.Facturas$lecturaArgs<ExtArgs>;
    detalleFactura?: boolean | Prisma.Facturas$detalleFacturaArgs<ExtArgs>;
    pagos?: boolean | Prisma.Facturas$pagosArgs<ExtArgs>;
    _count?: boolean | Prisma.FacturasCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["facturas"]>;
export type FacturasSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    facturaId?: boolean;
    clienteId?: boolean;
    lecturaId?: boolean;
    fecha?: boolean;
    mes?: boolean;
    consumo?: boolean;
    tarifa?: boolean;
    interesMora?: boolean;
    abono?: boolean;
    saldo?: boolean;
    cliente?: boolean | Prisma.Facturas$clienteArgs<ExtArgs>;
    lectura?: boolean | Prisma.Facturas$lecturaArgs<ExtArgs>;
}, ExtArgs["result"]["facturas"]>;
export type FacturasSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    facturaId?: boolean;
    clienteId?: boolean;
    lecturaId?: boolean;
    fecha?: boolean;
    mes?: boolean;
    consumo?: boolean;
    tarifa?: boolean;
    interesMora?: boolean;
    abono?: boolean;
    saldo?: boolean;
    cliente?: boolean | Prisma.Facturas$clienteArgs<ExtArgs>;
    lectura?: boolean | Prisma.Facturas$lecturaArgs<ExtArgs>;
}, ExtArgs["result"]["facturas"]>;
export type FacturasSelectScalar = {
    facturaId?: boolean;
    clienteId?: boolean;
    lecturaId?: boolean;
    fecha?: boolean;
    mes?: boolean;
    consumo?: boolean;
    tarifa?: boolean;
    interesMora?: boolean;
    abono?: boolean;
    saldo?: boolean;
};
export type FacturasOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"facturaId" | "clienteId" | "lecturaId" | "fecha" | "mes" | "consumo" | "tarifa" | "interesMora" | "abono" | "saldo", ExtArgs["result"]["facturas"]>;
export type FacturasInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Facturas$clienteArgs<ExtArgs>;
    lectura?: boolean | Prisma.Facturas$lecturaArgs<ExtArgs>;
    detalleFactura?: boolean | Prisma.Facturas$detalleFacturaArgs<ExtArgs>;
    pagos?: boolean | Prisma.Facturas$pagosArgs<ExtArgs>;
    _count?: boolean | Prisma.FacturasCountOutputTypeDefaultArgs<ExtArgs>;
};
export type FacturasIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Facturas$clienteArgs<ExtArgs>;
    lectura?: boolean | Prisma.Facturas$lecturaArgs<ExtArgs>;
};
export type FacturasIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Facturas$clienteArgs<ExtArgs>;
    lectura?: boolean | Prisma.Facturas$lecturaArgs<ExtArgs>;
};
export type $FacturasPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Facturas";
    objects: {
        cliente: Prisma.$ClientesPayload<ExtArgs> | null;
        lectura: Prisma.$LecturasPayload<ExtArgs> | null;
        detalleFactura: Prisma.$DetalleFacturaPayload<ExtArgs>[];
        pagos: Prisma.$PagosPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        facturaId: bigint;
        clienteId: bigint | null;
        lecturaId: bigint | null;
        fecha: Date;
        mes: string;
        consumo: number | null;
        tarifa: number | null;
        interesMora: number | null;
        abono: number | null;
        saldo: number | null;
    }, ExtArgs["result"]["facturas"]>;
    composites: {};
};
export type FacturasGetPayload<S extends boolean | null | undefined | FacturasDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$FacturasPayload, S>;
export type FacturasCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<FacturasFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: FacturasCountAggregateInputType | true;
};
export interface FacturasDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Facturas'];
        meta: {
            name: 'Facturas';
        };
    };
    findUnique<T extends FacturasFindUniqueArgs>(args: Prisma.SelectSubset<T, FacturasFindUniqueArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends FacturasFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, FacturasFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends FacturasFindFirstArgs>(args?: Prisma.SelectSubset<T, FacturasFindFirstArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends FacturasFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, FacturasFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends FacturasFindManyArgs>(args?: Prisma.SelectSubset<T, FacturasFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends FacturasCreateArgs>(args: Prisma.SelectSubset<T, FacturasCreateArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends FacturasCreateManyArgs>(args?: Prisma.SelectSubset<T, FacturasCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends FacturasCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, FacturasCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends FacturasDeleteArgs>(args: Prisma.SelectSubset<T, FacturasDeleteArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends FacturasUpdateArgs>(args: Prisma.SelectSubset<T, FacturasUpdateArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends FacturasDeleteManyArgs>(args?: Prisma.SelectSubset<T, FacturasDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends FacturasUpdateManyArgs>(args: Prisma.SelectSubset<T, FacturasUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends FacturasUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, FacturasUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends FacturasUpsertArgs>(args: Prisma.SelectSubset<T, FacturasUpsertArgs<ExtArgs>>): Prisma.Prisma__FacturasClient<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends FacturasCountArgs>(args?: Prisma.Subset<T, FacturasCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], FacturasCountAggregateOutputType> : number>;
    aggregate<T extends FacturasAggregateArgs>(args: Prisma.Subset<T, FacturasAggregateArgs>): Prisma.PrismaPromise<GetFacturasAggregateType<T>>;
    groupBy<T extends FacturasGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: FacturasGroupByArgs['orderBy'];
    } : {
        orderBy?: FacturasGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, FacturasGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFacturasGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: FacturasFieldRefs;
}
export interface Prisma__FacturasClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    cliente<T extends Prisma.Facturas$clienteArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Facturas$clienteArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    lectura<T extends Prisma.Facturas$lecturaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Facturas$lecturaArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    detalleFactura<T extends Prisma.Facturas$detalleFacturaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Facturas$detalleFacturaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DetalleFacturaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    pagos<T extends Prisma.Facturas$pagosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Facturas$pagosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface FacturasFieldRefs {
    readonly facturaId: Prisma.FieldRef<"Facturas", 'BigInt'>;
    readonly clienteId: Prisma.FieldRef<"Facturas", 'BigInt'>;
    readonly lecturaId: Prisma.FieldRef<"Facturas", 'BigInt'>;
    readonly fecha: Prisma.FieldRef<"Facturas", 'DateTime'>;
    readonly mes: Prisma.FieldRef<"Facturas", 'String'>;
    readonly consumo: Prisma.FieldRef<"Facturas", 'Float'>;
    readonly tarifa: Prisma.FieldRef<"Facturas", 'Float'>;
    readonly interesMora: Prisma.FieldRef<"Facturas", 'Float'>;
    readonly abono: Prisma.FieldRef<"Facturas", 'Float'>;
    readonly saldo: Prisma.FieldRef<"Facturas", 'Float'>;
}
export type FacturasFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where: Prisma.FacturasWhereUniqueInput;
};
export type FacturasFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where: Prisma.FacturasWhereUniqueInput;
};
export type FacturasFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where?: Prisma.FacturasWhereInput;
    orderBy?: Prisma.FacturasOrderByWithRelationInput | Prisma.FacturasOrderByWithRelationInput[];
    cursor?: Prisma.FacturasWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FacturasScalarFieldEnum | Prisma.FacturasScalarFieldEnum[];
};
export type FacturasFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where?: Prisma.FacturasWhereInput;
    orderBy?: Prisma.FacturasOrderByWithRelationInput | Prisma.FacturasOrderByWithRelationInput[];
    cursor?: Prisma.FacturasWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FacturasScalarFieldEnum | Prisma.FacturasScalarFieldEnum[];
};
export type FacturasFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where?: Prisma.FacturasWhereInput;
    orderBy?: Prisma.FacturasOrderByWithRelationInput | Prisma.FacturasOrderByWithRelationInput[];
    cursor?: Prisma.FacturasWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FacturasScalarFieldEnum | Prisma.FacturasScalarFieldEnum[];
};
export type FacturasCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FacturasCreateInput, Prisma.FacturasUncheckedCreateInput>;
};
export type FacturasCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.FacturasCreateManyInput | Prisma.FacturasCreateManyInput[];
    skipDuplicates?: boolean;
};
export type FacturasCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    data: Prisma.FacturasCreateManyInput | Prisma.FacturasCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.FacturasIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type FacturasUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FacturasUpdateInput, Prisma.FacturasUncheckedUpdateInput>;
    where: Prisma.FacturasWhereUniqueInput;
};
export type FacturasUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.FacturasUpdateManyMutationInput, Prisma.FacturasUncheckedUpdateManyInput>;
    where?: Prisma.FacturasWhereInput;
    limit?: number;
};
export type FacturasUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FacturasUpdateManyMutationInput, Prisma.FacturasUncheckedUpdateManyInput>;
    where?: Prisma.FacturasWhereInput;
    limit?: number;
    include?: Prisma.FacturasIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type FacturasUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where: Prisma.FacturasWhereUniqueInput;
    create: Prisma.XOR<Prisma.FacturasCreateInput, Prisma.FacturasUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.FacturasUpdateInput, Prisma.FacturasUncheckedUpdateInput>;
};
export type FacturasDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
    where: Prisma.FacturasWhereUniqueInput;
};
export type FacturasDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FacturasWhereInput;
    limit?: number;
};
export type Facturas$clienteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where?: Prisma.ClientesWhereInput;
};
export type Facturas$lecturaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    where?: Prisma.LecturasWhereInput;
};
export type Facturas$detalleFacturaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Facturas$pagosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type FacturasDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FacturasSelect<ExtArgs> | null;
    omit?: Prisma.FacturasOmit<ExtArgs> | null;
    include?: Prisma.FacturasInclude<ExtArgs> | null;
};
export {};
