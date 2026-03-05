import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type LecturasModel = runtime.Types.Result.DefaultSelection<Prisma.$LecturasPayload>;
export type AggregateLecturas = {
    _count: LecturasCountAggregateOutputType | null;
    _avg: LecturasAvgAggregateOutputType | null;
    _sum: LecturasSumAggregateOutputType | null;
    _min: LecturasMinAggregateOutputType | null;
    _max: LecturasMaxAggregateOutputType | null;
};
export type LecturasAvgAggregateOutputType = {
    lecturaId: number | null;
    clienteMedidorId: number | null;
    lecturaAnterior: number | null;
    lecturaActual: number | null;
    consumoCalculado: number | null;
    valorMonetario: number | null;
    abono: number | null;
    saldoPendiente: number | null;
};
export type LecturasSumAggregateOutputType = {
    lecturaId: bigint | null;
    clienteMedidorId: bigint | null;
    lecturaAnterior: number | null;
    lecturaActual: number | null;
    consumoCalculado: number | null;
    valorMonetario: number | null;
    abono: number | null;
    saldoPendiente: number | null;
};
export type LecturasMinAggregateOutputType = {
    lecturaId: bigint | null;
    clienteMedidorId: bigint | null;
    fecha: Date | null;
    lecturaAnterior: number | null;
    lecturaActual: number | null;
    consumoCalculado: number | null;
    valorMonetario: number | null;
    abono: number | null;
    saldoPendiente: number | null;
};
export type LecturasMaxAggregateOutputType = {
    lecturaId: bigint | null;
    clienteMedidorId: bigint | null;
    fecha: Date | null;
    lecturaAnterior: number | null;
    lecturaActual: number | null;
    consumoCalculado: number | null;
    valorMonetario: number | null;
    abono: number | null;
    saldoPendiente: number | null;
};
export type LecturasCountAggregateOutputType = {
    lecturaId: number;
    clienteMedidorId: number;
    fecha: number;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado: number;
    valorMonetario: number;
    abono: number;
    saldoPendiente: number;
    _all: number;
};
export type LecturasAvgAggregateInputType = {
    lecturaId?: true;
    clienteMedidorId?: true;
    lecturaAnterior?: true;
    lecturaActual?: true;
    consumoCalculado?: true;
    valorMonetario?: true;
    abono?: true;
    saldoPendiente?: true;
};
export type LecturasSumAggregateInputType = {
    lecturaId?: true;
    clienteMedidorId?: true;
    lecturaAnterior?: true;
    lecturaActual?: true;
    consumoCalculado?: true;
    valorMonetario?: true;
    abono?: true;
    saldoPendiente?: true;
};
export type LecturasMinAggregateInputType = {
    lecturaId?: true;
    clienteMedidorId?: true;
    fecha?: true;
    lecturaAnterior?: true;
    lecturaActual?: true;
    consumoCalculado?: true;
    valorMonetario?: true;
    abono?: true;
    saldoPendiente?: true;
};
export type LecturasMaxAggregateInputType = {
    lecturaId?: true;
    clienteMedidorId?: true;
    fecha?: true;
    lecturaAnterior?: true;
    lecturaActual?: true;
    consumoCalculado?: true;
    valorMonetario?: true;
    abono?: true;
    saldoPendiente?: true;
};
export type LecturasCountAggregateInputType = {
    lecturaId?: true;
    clienteMedidorId?: true;
    fecha?: true;
    lecturaAnterior?: true;
    lecturaActual?: true;
    consumoCalculado?: true;
    valorMonetario?: true;
    abono?: true;
    saldoPendiente?: true;
    _all?: true;
};
export type LecturasAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithRelationInput | Prisma.LecturasOrderByWithRelationInput[];
    cursor?: Prisma.LecturasWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | LecturasCountAggregateInputType;
    _avg?: LecturasAvgAggregateInputType;
    _sum?: LecturasSumAggregateInputType;
    _min?: LecturasMinAggregateInputType;
    _max?: LecturasMaxAggregateInputType;
};
export type GetLecturasAggregateType<T extends LecturasAggregateArgs> = {
    [P in keyof T & keyof AggregateLecturas]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateLecturas[P]> : Prisma.GetScalarType<T[P], AggregateLecturas[P]>;
};
export type LecturasGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithAggregationInput | Prisma.LecturasOrderByWithAggregationInput[];
    by: Prisma.LecturasScalarFieldEnum[] | Prisma.LecturasScalarFieldEnum;
    having?: Prisma.LecturasScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: LecturasCountAggregateInputType | true;
    _avg?: LecturasAvgAggregateInputType;
    _sum?: LecturasSumAggregateInputType;
    _min?: LecturasMinAggregateInputType;
    _max?: LecturasMaxAggregateInputType;
};
export type LecturasGroupByOutputType = {
    lecturaId: bigint;
    clienteMedidorId: bigint | null;
    fecha: Date;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado: number | null;
    valorMonetario: number | null;
    abono: number | null;
    saldoPendiente: number | null;
    _count: LecturasCountAggregateOutputType | null;
    _avg: LecturasAvgAggregateOutputType | null;
    _sum: LecturasSumAggregateOutputType | null;
    _min: LecturasMinAggregateOutputType | null;
    _max: LecturasMaxAggregateOutputType | null;
};
type GetLecturasGroupByPayload<T extends LecturasGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<LecturasGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof LecturasGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], LecturasGroupByOutputType[P]> : Prisma.GetScalarType<T[P], LecturasGroupByOutputType[P]>;
}>>;
export type LecturasWhereInput = {
    AND?: Prisma.LecturasWhereInput | Prisma.LecturasWhereInput[];
    OR?: Prisma.LecturasWhereInput[];
    NOT?: Prisma.LecturasWhereInput | Prisma.LecturasWhereInput[];
    lecturaId?: Prisma.BigIntFilter<"Lecturas"> | bigint | number;
    clienteMedidorId?: Prisma.BigIntNullableFilter<"Lecturas"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Lecturas"> | Date | string;
    lecturaAnterior?: Prisma.FloatFilter<"Lecturas"> | number;
    lecturaActual?: Prisma.FloatFilter<"Lecturas"> | number;
    consumoCalculado?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    valorMonetario?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    abono?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    saldoPendiente?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    clienteMedidor?: Prisma.XOR<Prisma.ClientesMedidoresNullableScalarRelationFilter, Prisma.ClientesMedidoresWhereInput> | null;
    facturas?: Prisma.FacturasListRelationFilter;
};
export type LecturasOrderByWithRelationInput = {
    lecturaId?: Prisma.SortOrder;
    clienteMedidorId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    lecturaAnterior?: Prisma.SortOrder;
    lecturaActual?: Prisma.SortOrder;
    consumoCalculado?: Prisma.SortOrderInput | Prisma.SortOrder;
    valorMonetario?: Prisma.SortOrderInput | Prisma.SortOrder;
    abono?: Prisma.SortOrderInput | Prisma.SortOrder;
    saldoPendiente?: Prisma.SortOrderInput | Prisma.SortOrder;
    clienteMedidor?: Prisma.ClientesMedidoresOrderByWithRelationInput;
    facturas?: Prisma.FacturasOrderByRelationAggregateInput;
};
export type LecturasWhereUniqueInput = Prisma.AtLeast<{
    lecturaId?: bigint | number;
    AND?: Prisma.LecturasWhereInput | Prisma.LecturasWhereInput[];
    OR?: Prisma.LecturasWhereInput[];
    NOT?: Prisma.LecturasWhereInput | Prisma.LecturasWhereInput[];
    clienteMedidorId?: Prisma.BigIntNullableFilter<"Lecturas"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Lecturas"> | Date | string;
    lecturaAnterior?: Prisma.FloatFilter<"Lecturas"> | number;
    lecturaActual?: Prisma.FloatFilter<"Lecturas"> | number;
    consumoCalculado?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    valorMonetario?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    abono?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    saldoPendiente?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    clienteMedidor?: Prisma.XOR<Prisma.ClientesMedidoresNullableScalarRelationFilter, Prisma.ClientesMedidoresWhereInput> | null;
    facturas?: Prisma.FacturasListRelationFilter;
}, "lecturaId">;
export type LecturasOrderByWithAggregationInput = {
    lecturaId?: Prisma.SortOrder;
    clienteMedidorId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    lecturaAnterior?: Prisma.SortOrder;
    lecturaActual?: Prisma.SortOrder;
    consumoCalculado?: Prisma.SortOrderInput | Prisma.SortOrder;
    valorMonetario?: Prisma.SortOrderInput | Prisma.SortOrder;
    abono?: Prisma.SortOrderInput | Prisma.SortOrder;
    saldoPendiente?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.LecturasCountOrderByAggregateInput;
    _avg?: Prisma.LecturasAvgOrderByAggregateInput;
    _max?: Prisma.LecturasMaxOrderByAggregateInput;
    _min?: Prisma.LecturasMinOrderByAggregateInput;
    _sum?: Prisma.LecturasSumOrderByAggregateInput;
};
export type LecturasScalarWhereWithAggregatesInput = {
    AND?: Prisma.LecturasScalarWhereWithAggregatesInput | Prisma.LecturasScalarWhereWithAggregatesInput[];
    OR?: Prisma.LecturasScalarWhereWithAggregatesInput[];
    NOT?: Prisma.LecturasScalarWhereWithAggregatesInput | Prisma.LecturasScalarWhereWithAggregatesInput[];
    lecturaId?: Prisma.BigIntWithAggregatesFilter<"Lecturas"> | bigint | number;
    clienteMedidorId?: Prisma.BigIntNullableWithAggregatesFilter<"Lecturas"> | bigint | number | null;
    fecha?: Prisma.DateTimeWithAggregatesFilter<"Lecturas"> | Date | string;
    lecturaAnterior?: Prisma.FloatWithAggregatesFilter<"Lecturas"> | number;
    lecturaActual?: Prisma.FloatWithAggregatesFilter<"Lecturas"> | number;
    consumoCalculado?: Prisma.FloatNullableWithAggregatesFilter<"Lecturas"> | number | null;
    valorMonetario?: Prisma.FloatNullableWithAggregatesFilter<"Lecturas"> | number | null;
    abono?: Prisma.FloatNullableWithAggregatesFilter<"Lecturas"> | number | null;
    saldoPendiente?: Prisma.FloatNullableWithAggregatesFilter<"Lecturas"> | number | null;
};
export type LecturasCreateInput = {
    lecturaId?: bigint | number;
    fecha: Date | string;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado?: number | null;
    valorMonetario?: number | null;
    abono?: number | null;
    saldoPendiente?: number | null;
    clienteMedidor?: Prisma.ClientesMedidoresCreateNestedOneWithoutLecturasInput;
    facturas?: Prisma.FacturasCreateNestedManyWithoutLecturaInput;
};
export type LecturasUncheckedCreateInput = {
    lecturaId?: bigint | number;
    clienteMedidorId?: bigint | number | null;
    fecha: Date | string;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado?: number | null;
    valorMonetario?: number | null;
    abono?: number | null;
    saldoPendiente?: number | null;
    facturas?: Prisma.FacturasUncheckedCreateNestedManyWithoutLecturaInput;
};
export type LecturasUpdateInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    clienteMedidor?: Prisma.ClientesMedidoresUpdateOneWithoutLecturasNestedInput;
    facturas?: Prisma.FacturasUpdateManyWithoutLecturaNestedInput;
};
export type LecturasUncheckedUpdateInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteMedidorId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    facturas?: Prisma.FacturasUncheckedUpdateManyWithoutLecturaNestedInput;
};
export type LecturasCreateManyInput = {
    lecturaId?: bigint | number;
    clienteMedidorId?: bigint | number | null;
    fecha: Date | string;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado?: number | null;
    valorMonetario?: number | null;
    abono?: number | null;
    saldoPendiente?: number | null;
};
export type LecturasUpdateManyMutationInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
};
export type LecturasUncheckedUpdateManyInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteMedidorId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
};
export type LecturasListRelationFilter = {
    every?: Prisma.LecturasWhereInput;
    some?: Prisma.LecturasWhereInput;
    none?: Prisma.LecturasWhereInput;
};
export type LecturasOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type LecturasNullableScalarRelationFilter = {
    is?: Prisma.LecturasWhereInput | null;
    isNot?: Prisma.LecturasWhereInput | null;
};
export type LecturasCountOrderByAggregateInput = {
    lecturaId?: Prisma.SortOrder;
    clienteMedidorId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    lecturaAnterior?: Prisma.SortOrder;
    lecturaActual?: Prisma.SortOrder;
    consumoCalculado?: Prisma.SortOrder;
    valorMonetario?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldoPendiente?: Prisma.SortOrder;
};
export type LecturasAvgOrderByAggregateInput = {
    lecturaId?: Prisma.SortOrder;
    clienteMedidorId?: Prisma.SortOrder;
    lecturaAnterior?: Prisma.SortOrder;
    lecturaActual?: Prisma.SortOrder;
    consumoCalculado?: Prisma.SortOrder;
    valorMonetario?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldoPendiente?: Prisma.SortOrder;
};
export type LecturasMaxOrderByAggregateInput = {
    lecturaId?: Prisma.SortOrder;
    clienteMedidorId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    lecturaAnterior?: Prisma.SortOrder;
    lecturaActual?: Prisma.SortOrder;
    consumoCalculado?: Prisma.SortOrder;
    valorMonetario?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldoPendiente?: Prisma.SortOrder;
};
export type LecturasMinOrderByAggregateInput = {
    lecturaId?: Prisma.SortOrder;
    clienteMedidorId?: Prisma.SortOrder;
    fecha?: Prisma.SortOrder;
    lecturaAnterior?: Prisma.SortOrder;
    lecturaActual?: Prisma.SortOrder;
    consumoCalculado?: Prisma.SortOrder;
    valorMonetario?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldoPendiente?: Prisma.SortOrder;
};
export type LecturasSumOrderByAggregateInput = {
    lecturaId?: Prisma.SortOrder;
    clienteMedidorId?: Prisma.SortOrder;
    lecturaAnterior?: Prisma.SortOrder;
    lecturaActual?: Prisma.SortOrder;
    consumoCalculado?: Prisma.SortOrder;
    valorMonetario?: Prisma.SortOrder;
    abono?: Prisma.SortOrder;
    saldoPendiente?: Prisma.SortOrder;
};
export type LecturasCreateNestedManyWithoutClienteMedidorInput = {
    create?: Prisma.XOR<Prisma.LecturasCreateWithoutClienteMedidorInput, Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput> | Prisma.LecturasCreateWithoutClienteMedidorInput[] | Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput[];
    connectOrCreate?: Prisma.LecturasCreateOrConnectWithoutClienteMedidorInput | Prisma.LecturasCreateOrConnectWithoutClienteMedidorInput[];
    createMany?: Prisma.LecturasCreateManyClienteMedidorInputEnvelope;
    connect?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
};
export type LecturasUncheckedCreateNestedManyWithoutClienteMedidorInput = {
    create?: Prisma.XOR<Prisma.LecturasCreateWithoutClienteMedidorInput, Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput> | Prisma.LecturasCreateWithoutClienteMedidorInput[] | Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput[];
    connectOrCreate?: Prisma.LecturasCreateOrConnectWithoutClienteMedidorInput | Prisma.LecturasCreateOrConnectWithoutClienteMedidorInput[];
    createMany?: Prisma.LecturasCreateManyClienteMedidorInputEnvelope;
    connect?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
};
export type LecturasUpdateManyWithoutClienteMedidorNestedInput = {
    create?: Prisma.XOR<Prisma.LecturasCreateWithoutClienteMedidorInput, Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput> | Prisma.LecturasCreateWithoutClienteMedidorInput[] | Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput[];
    connectOrCreate?: Prisma.LecturasCreateOrConnectWithoutClienteMedidorInput | Prisma.LecturasCreateOrConnectWithoutClienteMedidorInput[];
    upsert?: Prisma.LecturasUpsertWithWhereUniqueWithoutClienteMedidorInput | Prisma.LecturasUpsertWithWhereUniqueWithoutClienteMedidorInput[];
    createMany?: Prisma.LecturasCreateManyClienteMedidorInputEnvelope;
    set?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
    disconnect?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
    delete?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
    connect?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
    update?: Prisma.LecturasUpdateWithWhereUniqueWithoutClienteMedidorInput | Prisma.LecturasUpdateWithWhereUniqueWithoutClienteMedidorInput[];
    updateMany?: Prisma.LecturasUpdateManyWithWhereWithoutClienteMedidorInput | Prisma.LecturasUpdateManyWithWhereWithoutClienteMedidorInput[];
    deleteMany?: Prisma.LecturasScalarWhereInput | Prisma.LecturasScalarWhereInput[];
};
export type LecturasUncheckedUpdateManyWithoutClienteMedidorNestedInput = {
    create?: Prisma.XOR<Prisma.LecturasCreateWithoutClienteMedidorInput, Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput> | Prisma.LecturasCreateWithoutClienteMedidorInput[] | Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput[];
    connectOrCreate?: Prisma.LecturasCreateOrConnectWithoutClienteMedidorInput | Prisma.LecturasCreateOrConnectWithoutClienteMedidorInput[];
    upsert?: Prisma.LecturasUpsertWithWhereUniqueWithoutClienteMedidorInput | Prisma.LecturasUpsertWithWhereUniqueWithoutClienteMedidorInput[];
    createMany?: Prisma.LecturasCreateManyClienteMedidorInputEnvelope;
    set?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
    disconnect?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
    delete?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
    connect?: Prisma.LecturasWhereUniqueInput | Prisma.LecturasWhereUniqueInput[];
    update?: Prisma.LecturasUpdateWithWhereUniqueWithoutClienteMedidorInput | Prisma.LecturasUpdateWithWhereUniqueWithoutClienteMedidorInput[];
    updateMany?: Prisma.LecturasUpdateManyWithWhereWithoutClienteMedidorInput | Prisma.LecturasUpdateManyWithWhereWithoutClienteMedidorInput[];
    deleteMany?: Prisma.LecturasScalarWhereInput | Prisma.LecturasScalarWhereInput[];
};
export type LecturasCreateNestedOneWithoutFacturasInput = {
    create?: Prisma.XOR<Prisma.LecturasCreateWithoutFacturasInput, Prisma.LecturasUncheckedCreateWithoutFacturasInput>;
    connectOrCreate?: Prisma.LecturasCreateOrConnectWithoutFacturasInput;
    connect?: Prisma.LecturasWhereUniqueInput;
};
export type LecturasUpdateOneWithoutFacturasNestedInput = {
    create?: Prisma.XOR<Prisma.LecturasCreateWithoutFacturasInput, Prisma.LecturasUncheckedCreateWithoutFacturasInput>;
    connectOrCreate?: Prisma.LecturasCreateOrConnectWithoutFacturasInput;
    upsert?: Prisma.LecturasUpsertWithoutFacturasInput;
    disconnect?: Prisma.LecturasWhereInput | boolean;
    delete?: Prisma.LecturasWhereInput | boolean;
    connect?: Prisma.LecturasWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.LecturasUpdateToOneWithWhereWithoutFacturasInput, Prisma.LecturasUpdateWithoutFacturasInput>, Prisma.LecturasUncheckedUpdateWithoutFacturasInput>;
};
export type LecturasCreateWithoutClienteMedidorInput = {
    lecturaId?: bigint | number;
    fecha: Date | string;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado?: number | null;
    valorMonetario?: number | null;
    abono?: number | null;
    saldoPendiente?: number | null;
    facturas?: Prisma.FacturasCreateNestedManyWithoutLecturaInput;
};
export type LecturasUncheckedCreateWithoutClienteMedidorInput = {
    lecturaId?: bigint | number;
    fecha: Date | string;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado?: number | null;
    valorMonetario?: number | null;
    abono?: number | null;
    saldoPendiente?: number | null;
    facturas?: Prisma.FacturasUncheckedCreateNestedManyWithoutLecturaInput;
};
export type LecturasCreateOrConnectWithoutClienteMedidorInput = {
    where: Prisma.LecturasWhereUniqueInput;
    create: Prisma.XOR<Prisma.LecturasCreateWithoutClienteMedidorInput, Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput>;
};
export type LecturasCreateManyClienteMedidorInputEnvelope = {
    data: Prisma.LecturasCreateManyClienteMedidorInput | Prisma.LecturasCreateManyClienteMedidorInput[];
    skipDuplicates?: boolean;
};
export type LecturasUpsertWithWhereUniqueWithoutClienteMedidorInput = {
    where: Prisma.LecturasWhereUniqueInput;
    update: Prisma.XOR<Prisma.LecturasUpdateWithoutClienteMedidorInput, Prisma.LecturasUncheckedUpdateWithoutClienteMedidorInput>;
    create: Prisma.XOR<Prisma.LecturasCreateWithoutClienteMedidorInput, Prisma.LecturasUncheckedCreateWithoutClienteMedidorInput>;
};
export type LecturasUpdateWithWhereUniqueWithoutClienteMedidorInput = {
    where: Prisma.LecturasWhereUniqueInput;
    data: Prisma.XOR<Prisma.LecturasUpdateWithoutClienteMedidorInput, Prisma.LecturasUncheckedUpdateWithoutClienteMedidorInput>;
};
export type LecturasUpdateManyWithWhereWithoutClienteMedidorInput = {
    where: Prisma.LecturasScalarWhereInput;
    data: Prisma.XOR<Prisma.LecturasUpdateManyMutationInput, Prisma.LecturasUncheckedUpdateManyWithoutClienteMedidorInput>;
};
export type LecturasScalarWhereInput = {
    AND?: Prisma.LecturasScalarWhereInput | Prisma.LecturasScalarWhereInput[];
    OR?: Prisma.LecturasScalarWhereInput[];
    NOT?: Prisma.LecturasScalarWhereInput | Prisma.LecturasScalarWhereInput[];
    lecturaId?: Prisma.BigIntFilter<"Lecturas"> | bigint | number;
    clienteMedidorId?: Prisma.BigIntNullableFilter<"Lecturas"> | bigint | number | null;
    fecha?: Prisma.DateTimeFilter<"Lecturas"> | Date | string;
    lecturaAnterior?: Prisma.FloatFilter<"Lecturas"> | number;
    lecturaActual?: Prisma.FloatFilter<"Lecturas"> | number;
    consumoCalculado?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    valorMonetario?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    abono?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
    saldoPendiente?: Prisma.FloatNullableFilter<"Lecturas"> | number | null;
};
export type LecturasCreateWithoutFacturasInput = {
    lecturaId?: bigint | number;
    fecha: Date | string;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado?: number | null;
    valorMonetario?: number | null;
    abono?: number | null;
    saldoPendiente?: number | null;
    clienteMedidor?: Prisma.ClientesMedidoresCreateNestedOneWithoutLecturasInput;
};
export type LecturasUncheckedCreateWithoutFacturasInput = {
    lecturaId?: bigint | number;
    clienteMedidorId?: bigint | number | null;
    fecha: Date | string;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado?: number | null;
    valorMonetario?: number | null;
    abono?: number | null;
    saldoPendiente?: number | null;
};
export type LecturasCreateOrConnectWithoutFacturasInput = {
    where: Prisma.LecturasWhereUniqueInput;
    create: Prisma.XOR<Prisma.LecturasCreateWithoutFacturasInput, Prisma.LecturasUncheckedCreateWithoutFacturasInput>;
};
export type LecturasUpsertWithoutFacturasInput = {
    update: Prisma.XOR<Prisma.LecturasUpdateWithoutFacturasInput, Prisma.LecturasUncheckedUpdateWithoutFacturasInput>;
    create: Prisma.XOR<Prisma.LecturasCreateWithoutFacturasInput, Prisma.LecturasUncheckedCreateWithoutFacturasInput>;
    where?: Prisma.LecturasWhereInput;
};
export type LecturasUpdateToOneWithWhereWithoutFacturasInput = {
    where?: Prisma.LecturasWhereInput;
    data: Prisma.XOR<Prisma.LecturasUpdateWithoutFacturasInput, Prisma.LecturasUncheckedUpdateWithoutFacturasInput>;
};
export type LecturasUpdateWithoutFacturasInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    clienteMedidor?: Prisma.ClientesMedidoresUpdateOneWithoutLecturasNestedInput;
};
export type LecturasUncheckedUpdateWithoutFacturasInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteMedidorId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
};
export type LecturasCreateManyClienteMedidorInput = {
    lecturaId?: bigint | number;
    fecha: Date | string;
    lecturaAnterior: number;
    lecturaActual: number;
    consumoCalculado?: number | null;
    valorMonetario?: number | null;
    abono?: number | null;
    saldoPendiente?: number | null;
};
export type LecturasUpdateWithoutClienteMedidorInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    facturas?: Prisma.FacturasUpdateManyWithoutLecturaNestedInput;
};
export type LecturasUncheckedUpdateWithoutClienteMedidorInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    facturas?: Prisma.FacturasUncheckedUpdateManyWithoutLecturaNestedInput;
};
export type LecturasUncheckedUpdateManyWithoutClienteMedidorInput = {
    lecturaId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fecha?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lecturaAnterior?: Prisma.FloatFieldUpdateOperationsInput | number;
    lecturaActual?: Prisma.FloatFieldUpdateOperationsInput | number;
    consumoCalculado?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    valorMonetario?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    abono?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    saldoPendiente?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
};
export type LecturasCountOutputType = {
    facturas: number;
};
export type LecturasCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    facturas?: boolean | LecturasCountOutputTypeCountFacturasArgs;
};
export type LecturasCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasCountOutputTypeSelect<ExtArgs> | null;
};
export type LecturasCountOutputTypeCountFacturasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FacturasWhereInput;
};
export type LecturasSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    lecturaId?: boolean;
    clienteMedidorId?: boolean;
    fecha?: boolean;
    lecturaAnterior?: boolean;
    lecturaActual?: boolean;
    consumoCalculado?: boolean;
    valorMonetario?: boolean;
    abono?: boolean;
    saldoPendiente?: boolean;
    clienteMedidor?: boolean | Prisma.Lecturas$clienteMedidorArgs<ExtArgs>;
    facturas?: boolean | Prisma.Lecturas$facturasArgs<ExtArgs>;
    _count?: boolean | Prisma.LecturasCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["lecturas"]>;
export type LecturasSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    lecturaId?: boolean;
    clienteMedidorId?: boolean;
    fecha?: boolean;
    lecturaAnterior?: boolean;
    lecturaActual?: boolean;
    consumoCalculado?: boolean;
    valorMonetario?: boolean;
    abono?: boolean;
    saldoPendiente?: boolean;
    clienteMedidor?: boolean | Prisma.Lecturas$clienteMedidorArgs<ExtArgs>;
}, ExtArgs["result"]["lecturas"]>;
export type LecturasSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    lecturaId?: boolean;
    clienteMedidorId?: boolean;
    fecha?: boolean;
    lecturaAnterior?: boolean;
    lecturaActual?: boolean;
    consumoCalculado?: boolean;
    valorMonetario?: boolean;
    abono?: boolean;
    saldoPendiente?: boolean;
    clienteMedidor?: boolean | Prisma.Lecturas$clienteMedidorArgs<ExtArgs>;
}, ExtArgs["result"]["lecturas"]>;
export type LecturasSelectScalar = {
    lecturaId?: boolean;
    clienteMedidorId?: boolean;
    fecha?: boolean;
    lecturaAnterior?: boolean;
    lecturaActual?: boolean;
    consumoCalculado?: boolean;
    valorMonetario?: boolean;
    abono?: boolean;
    saldoPendiente?: boolean;
};
export type LecturasOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"lecturaId" | "clienteMedidorId" | "fecha" | "lecturaAnterior" | "lecturaActual" | "consumoCalculado" | "valorMonetario" | "abono" | "saldoPendiente", ExtArgs["result"]["lecturas"]>;
export type LecturasInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clienteMedidor?: boolean | Prisma.Lecturas$clienteMedidorArgs<ExtArgs>;
    facturas?: boolean | Prisma.Lecturas$facturasArgs<ExtArgs>;
    _count?: boolean | Prisma.LecturasCountOutputTypeDefaultArgs<ExtArgs>;
};
export type LecturasIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clienteMedidor?: boolean | Prisma.Lecturas$clienteMedidorArgs<ExtArgs>;
};
export type LecturasIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clienteMedidor?: boolean | Prisma.Lecturas$clienteMedidorArgs<ExtArgs>;
};
export type $LecturasPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Lecturas";
    objects: {
        clienteMedidor: Prisma.$ClientesMedidoresPayload<ExtArgs> | null;
        facturas: Prisma.$FacturasPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        lecturaId: bigint;
        clienteMedidorId: bigint | null;
        fecha: Date;
        lecturaAnterior: number;
        lecturaActual: number;
        consumoCalculado: number | null;
        valorMonetario: number | null;
        abono: number | null;
        saldoPendiente: number | null;
    }, ExtArgs["result"]["lecturas"]>;
    composites: {};
};
export type LecturasGetPayload<S extends boolean | null | undefined | LecturasDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$LecturasPayload, S>;
export type LecturasCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<LecturasFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: LecturasCountAggregateInputType | true;
};
export interface LecturasDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Lecturas'];
        meta: {
            name: 'Lecturas';
        };
    };
    findUnique<T extends LecturasFindUniqueArgs>(args: Prisma.SelectSubset<T, LecturasFindUniqueArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends LecturasFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, LecturasFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends LecturasFindFirstArgs>(args?: Prisma.SelectSubset<T, LecturasFindFirstArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends LecturasFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, LecturasFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends LecturasFindManyArgs>(args?: Prisma.SelectSubset<T, LecturasFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends LecturasCreateArgs>(args: Prisma.SelectSubset<T, LecturasCreateArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends LecturasCreateManyArgs>(args?: Prisma.SelectSubset<T, LecturasCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends LecturasCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, LecturasCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends LecturasDeleteArgs>(args: Prisma.SelectSubset<T, LecturasDeleteArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends LecturasUpdateArgs>(args: Prisma.SelectSubset<T, LecturasUpdateArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends LecturasDeleteManyArgs>(args?: Prisma.SelectSubset<T, LecturasDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends LecturasUpdateManyArgs>(args: Prisma.SelectSubset<T, LecturasUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends LecturasUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, LecturasUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends LecturasUpsertArgs>(args: Prisma.SelectSubset<T, LecturasUpsertArgs<ExtArgs>>): Prisma.Prisma__LecturasClient<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends LecturasCountArgs>(args?: Prisma.Subset<T, LecturasCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], LecturasCountAggregateOutputType> : number>;
    aggregate<T extends LecturasAggregateArgs>(args: Prisma.Subset<T, LecturasAggregateArgs>): Prisma.PrismaPromise<GetLecturasAggregateType<T>>;
    groupBy<T extends LecturasGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: LecturasGroupByArgs['orderBy'];
    } : {
        orderBy?: LecturasGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, LecturasGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLecturasGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: LecturasFieldRefs;
}
export interface Prisma__LecturasClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clienteMedidor<T extends Prisma.Lecturas$clienteMedidorArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Lecturas$clienteMedidorArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    facturas<T extends Prisma.Lecturas$facturasArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Lecturas$facturasArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface LecturasFieldRefs {
    readonly lecturaId: Prisma.FieldRef<"Lecturas", 'BigInt'>;
    readonly clienteMedidorId: Prisma.FieldRef<"Lecturas", 'BigInt'>;
    readonly fecha: Prisma.FieldRef<"Lecturas", 'DateTime'>;
    readonly lecturaAnterior: Prisma.FieldRef<"Lecturas", 'Float'>;
    readonly lecturaActual: Prisma.FieldRef<"Lecturas", 'Float'>;
    readonly consumoCalculado: Prisma.FieldRef<"Lecturas", 'Float'>;
    readonly valorMonetario: Prisma.FieldRef<"Lecturas", 'Float'>;
    readonly abono: Prisma.FieldRef<"Lecturas", 'Float'>;
    readonly saldoPendiente: Prisma.FieldRef<"Lecturas", 'Float'>;
}
export type LecturasFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    where: Prisma.LecturasWhereUniqueInput;
};
export type LecturasFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    where: Prisma.LecturasWhereUniqueInput;
};
export type LecturasFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithRelationInput | Prisma.LecturasOrderByWithRelationInput[];
    cursor?: Prisma.LecturasWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.LecturasScalarFieldEnum | Prisma.LecturasScalarFieldEnum[];
};
export type LecturasFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithRelationInput | Prisma.LecturasOrderByWithRelationInput[];
    cursor?: Prisma.LecturasWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.LecturasScalarFieldEnum | Prisma.LecturasScalarFieldEnum[];
};
export type LecturasFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithRelationInput | Prisma.LecturasOrderByWithRelationInput[];
    cursor?: Prisma.LecturasWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.LecturasScalarFieldEnum | Prisma.LecturasScalarFieldEnum[];
};
export type LecturasCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LecturasCreateInput, Prisma.LecturasUncheckedCreateInput>;
};
export type LecturasCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.LecturasCreateManyInput | Prisma.LecturasCreateManyInput[];
    skipDuplicates?: boolean;
};
export type LecturasCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    data: Prisma.LecturasCreateManyInput | Prisma.LecturasCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.LecturasIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type LecturasUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LecturasUpdateInput, Prisma.LecturasUncheckedUpdateInput>;
    where: Prisma.LecturasWhereUniqueInput;
};
export type LecturasUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.LecturasUpdateManyMutationInput, Prisma.LecturasUncheckedUpdateManyInput>;
    where?: Prisma.LecturasWhereInput;
    limit?: number;
};
export type LecturasUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LecturasUpdateManyMutationInput, Prisma.LecturasUncheckedUpdateManyInput>;
    where?: Prisma.LecturasWhereInput;
    limit?: number;
    include?: Prisma.LecturasIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type LecturasUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    where: Prisma.LecturasWhereUniqueInput;
    create: Prisma.XOR<Prisma.LecturasCreateInput, Prisma.LecturasUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.LecturasUpdateInput, Prisma.LecturasUncheckedUpdateInput>;
};
export type LecturasDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
    where: Prisma.LecturasWhereUniqueInput;
};
export type LecturasDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LecturasWhereInput;
    limit?: number;
};
export type Lecturas$clienteMedidorArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    where?: Prisma.ClientesMedidoresWhereInput;
};
export type Lecturas$facturasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type LecturasDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LecturasSelect<ExtArgs> | null;
    omit?: Prisma.LecturasOmit<ExtArgs> | null;
    include?: Prisma.LecturasInclude<ExtArgs> | null;
};
export {};
