import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ConveniosModel = runtime.Types.Result.DefaultSelection<Prisma.$ConveniosPayload>;
export type AggregateConvenios = {
    _count: ConveniosCountAggregateOutputType | null;
    _avg: ConveniosAvgAggregateOutputType | null;
    _sum: ConveniosSumAggregateOutputType | null;
    _min: ConveniosMinAggregateOutputType | null;
    _max: ConveniosMaxAggregateOutputType | null;
};
export type ConveniosAvgAggregateOutputType = {
    convenioId: number | null;
    clienteId: number | null;
    numeroCuotas: number | null;
    montoCuota: number | null;
};
export type ConveniosSumAggregateOutputType = {
    convenioId: bigint | null;
    clienteId: bigint | null;
    numeroCuotas: number | null;
    montoCuota: number | null;
};
export type ConveniosMinAggregateOutputType = {
    convenioId: bigint | null;
    clienteId: bigint | null;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    numeroCuotas: number | null;
    montoCuota: number | null;
    estado: string | null;
};
export type ConveniosMaxAggregateOutputType = {
    convenioId: bigint | null;
    clienteId: bigint | null;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    numeroCuotas: number | null;
    montoCuota: number | null;
    estado: string | null;
};
export type ConveniosCountAggregateOutputType = {
    convenioId: number;
    clienteId: number;
    fechaInicio: number;
    fechaFin: number;
    numeroCuotas: number;
    montoCuota: number;
    estado: number;
    _all: number;
};
export type ConveniosAvgAggregateInputType = {
    convenioId?: true;
    clienteId?: true;
    numeroCuotas?: true;
    montoCuota?: true;
};
export type ConveniosSumAggregateInputType = {
    convenioId?: true;
    clienteId?: true;
    numeroCuotas?: true;
    montoCuota?: true;
};
export type ConveniosMinAggregateInputType = {
    convenioId?: true;
    clienteId?: true;
    fechaInicio?: true;
    fechaFin?: true;
    numeroCuotas?: true;
    montoCuota?: true;
    estado?: true;
};
export type ConveniosMaxAggregateInputType = {
    convenioId?: true;
    clienteId?: true;
    fechaInicio?: true;
    fechaFin?: true;
    numeroCuotas?: true;
    montoCuota?: true;
    estado?: true;
};
export type ConveniosCountAggregateInputType = {
    convenioId?: true;
    clienteId?: true;
    fechaInicio?: true;
    fechaFin?: true;
    numeroCuotas?: true;
    montoCuota?: true;
    estado?: true;
    _all?: true;
};
export type ConveniosAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConveniosWhereInput;
    orderBy?: Prisma.ConveniosOrderByWithRelationInput | Prisma.ConveniosOrderByWithRelationInput[];
    cursor?: Prisma.ConveniosWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ConveniosCountAggregateInputType;
    _avg?: ConveniosAvgAggregateInputType;
    _sum?: ConveniosSumAggregateInputType;
    _min?: ConveniosMinAggregateInputType;
    _max?: ConveniosMaxAggregateInputType;
};
export type GetConveniosAggregateType<T extends ConveniosAggregateArgs> = {
    [P in keyof T & keyof AggregateConvenios]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateConvenios[P]> : Prisma.GetScalarType<T[P], AggregateConvenios[P]>;
};
export type ConveniosGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConveniosWhereInput;
    orderBy?: Prisma.ConveniosOrderByWithAggregationInput | Prisma.ConveniosOrderByWithAggregationInput[];
    by: Prisma.ConveniosScalarFieldEnum[] | Prisma.ConveniosScalarFieldEnum;
    having?: Prisma.ConveniosScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ConveniosCountAggregateInputType | true;
    _avg?: ConveniosAvgAggregateInputType;
    _sum?: ConveniosSumAggregateInputType;
    _min?: ConveniosMinAggregateInputType;
    _max?: ConveniosMaxAggregateInputType;
};
export type ConveniosGroupByOutputType = {
    convenioId: bigint;
    clienteId: bigint | null;
    fechaInicio: Date;
    fechaFin: Date | null;
    numeroCuotas: number | null;
    montoCuota: number | null;
    estado: string | null;
    _count: ConveniosCountAggregateOutputType | null;
    _avg: ConveniosAvgAggregateOutputType | null;
    _sum: ConveniosSumAggregateOutputType | null;
    _min: ConveniosMinAggregateOutputType | null;
    _max: ConveniosMaxAggregateOutputType | null;
};
type GetConveniosGroupByPayload<T extends ConveniosGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ConveniosGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ConveniosGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ConveniosGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ConveniosGroupByOutputType[P]>;
}>>;
export type ConveniosWhereInput = {
    AND?: Prisma.ConveniosWhereInput | Prisma.ConveniosWhereInput[];
    OR?: Prisma.ConveniosWhereInput[];
    NOT?: Prisma.ConveniosWhereInput | Prisma.ConveniosWhereInput[];
    convenioId?: Prisma.BigIntFilter<"Convenios"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"Convenios"> | bigint | number | null;
    fechaInicio?: Prisma.DateTimeFilter<"Convenios"> | Date | string;
    fechaFin?: Prisma.DateTimeNullableFilter<"Convenios"> | Date | string | null;
    numeroCuotas?: Prisma.IntNullableFilter<"Convenios"> | number | null;
    montoCuota?: Prisma.FloatNullableFilter<"Convenios"> | number | null;
    estado?: Prisma.StringNullableFilter<"Convenios"> | string | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
};
export type ConveniosOrderByWithRelationInput = {
    convenioId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaInicio?: Prisma.SortOrder;
    fechaFin?: Prisma.SortOrderInput | Prisma.SortOrder;
    numeroCuotas?: Prisma.SortOrderInput | Prisma.SortOrder;
    montoCuota?: Prisma.SortOrderInput | Prisma.SortOrder;
    estado?: Prisma.SortOrderInput | Prisma.SortOrder;
    cliente?: Prisma.ClientesOrderByWithRelationInput;
};
export type ConveniosWhereUniqueInput = Prisma.AtLeast<{
    convenioId?: bigint | number;
    AND?: Prisma.ConveniosWhereInput | Prisma.ConveniosWhereInput[];
    OR?: Prisma.ConveniosWhereInput[];
    NOT?: Prisma.ConveniosWhereInput | Prisma.ConveniosWhereInput[];
    clienteId?: Prisma.BigIntNullableFilter<"Convenios"> | bigint | number | null;
    fechaInicio?: Prisma.DateTimeFilter<"Convenios"> | Date | string;
    fechaFin?: Prisma.DateTimeNullableFilter<"Convenios"> | Date | string | null;
    numeroCuotas?: Prisma.IntNullableFilter<"Convenios"> | number | null;
    montoCuota?: Prisma.FloatNullableFilter<"Convenios"> | number | null;
    estado?: Prisma.StringNullableFilter<"Convenios"> | string | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
}, "convenioId">;
export type ConveniosOrderByWithAggregationInput = {
    convenioId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaInicio?: Prisma.SortOrder;
    fechaFin?: Prisma.SortOrderInput | Prisma.SortOrder;
    numeroCuotas?: Prisma.SortOrderInput | Prisma.SortOrder;
    montoCuota?: Prisma.SortOrderInput | Prisma.SortOrder;
    estado?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.ConveniosCountOrderByAggregateInput;
    _avg?: Prisma.ConveniosAvgOrderByAggregateInput;
    _max?: Prisma.ConveniosMaxOrderByAggregateInput;
    _min?: Prisma.ConveniosMinOrderByAggregateInput;
    _sum?: Prisma.ConveniosSumOrderByAggregateInput;
};
export type ConveniosScalarWhereWithAggregatesInput = {
    AND?: Prisma.ConveniosScalarWhereWithAggregatesInput | Prisma.ConveniosScalarWhereWithAggregatesInput[];
    OR?: Prisma.ConveniosScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ConveniosScalarWhereWithAggregatesInput | Prisma.ConveniosScalarWhereWithAggregatesInput[];
    convenioId?: Prisma.BigIntWithAggregatesFilter<"Convenios"> | bigint | number;
    clienteId?: Prisma.BigIntNullableWithAggregatesFilter<"Convenios"> | bigint | number | null;
    fechaInicio?: Prisma.DateTimeWithAggregatesFilter<"Convenios"> | Date | string;
    fechaFin?: Prisma.DateTimeNullableWithAggregatesFilter<"Convenios"> | Date | string | null;
    numeroCuotas?: Prisma.IntNullableWithAggregatesFilter<"Convenios"> | number | null;
    montoCuota?: Prisma.FloatNullableWithAggregatesFilter<"Convenios"> | number | null;
    estado?: Prisma.StringNullableWithAggregatesFilter<"Convenios"> | string | null;
};
export type ConveniosCreateInput = {
    convenioId?: bigint | number;
    fechaInicio: Date | string;
    fechaFin?: Date | string | null;
    numeroCuotas?: number | null;
    montoCuota?: number | null;
    estado?: string | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutConveniosInput;
};
export type ConveniosUncheckedCreateInput = {
    convenioId?: bigint | number;
    clienteId?: bigint | number | null;
    fechaInicio: Date | string;
    fechaFin?: Date | string | null;
    numeroCuotas?: number | null;
    montoCuota?: number | null;
    estado?: string | null;
};
export type ConveniosUpdateInput = {
    convenioId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaInicio?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    numeroCuotas?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    montoCuota?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cliente?: Prisma.ClientesUpdateOneWithoutConveniosNestedInput;
};
export type ConveniosUncheckedUpdateInput = {
    convenioId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaInicio?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    numeroCuotas?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    montoCuota?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ConveniosCreateManyInput = {
    convenioId?: bigint | number;
    clienteId?: bigint | number | null;
    fechaInicio: Date | string;
    fechaFin?: Date | string | null;
    numeroCuotas?: number | null;
    montoCuota?: number | null;
    estado?: string | null;
};
export type ConveniosUpdateManyMutationInput = {
    convenioId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaInicio?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    numeroCuotas?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    montoCuota?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ConveniosUncheckedUpdateManyInput = {
    convenioId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaInicio?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    numeroCuotas?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    montoCuota?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ConveniosListRelationFilter = {
    every?: Prisma.ConveniosWhereInput;
    some?: Prisma.ConveniosWhereInput;
    none?: Prisma.ConveniosWhereInput;
};
export type ConveniosOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ConveniosCountOrderByAggregateInput = {
    convenioId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    fechaInicio?: Prisma.SortOrder;
    fechaFin?: Prisma.SortOrder;
    numeroCuotas?: Prisma.SortOrder;
    montoCuota?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
};
export type ConveniosAvgOrderByAggregateInput = {
    convenioId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    numeroCuotas?: Prisma.SortOrder;
    montoCuota?: Prisma.SortOrder;
};
export type ConveniosMaxOrderByAggregateInput = {
    convenioId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    fechaInicio?: Prisma.SortOrder;
    fechaFin?: Prisma.SortOrder;
    numeroCuotas?: Prisma.SortOrder;
    montoCuota?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
};
export type ConveniosMinOrderByAggregateInput = {
    convenioId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    fechaInicio?: Prisma.SortOrder;
    fechaFin?: Prisma.SortOrder;
    numeroCuotas?: Prisma.SortOrder;
    montoCuota?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
};
export type ConveniosSumOrderByAggregateInput = {
    convenioId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    numeroCuotas?: Prisma.SortOrder;
    montoCuota?: Prisma.SortOrder;
};
export type ConveniosCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.ConveniosCreateWithoutClienteInput, Prisma.ConveniosUncheckedCreateWithoutClienteInput> | Prisma.ConveniosCreateWithoutClienteInput[] | Prisma.ConveniosUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.ConveniosCreateOrConnectWithoutClienteInput | Prisma.ConveniosCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.ConveniosCreateManyClienteInputEnvelope;
    connect?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
};
export type ConveniosUncheckedCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.ConveniosCreateWithoutClienteInput, Prisma.ConveniosUncheckedCreateWithoutClienteInput> | Prisma.ConveniosCreateWithoutClienteInput[] | Prisma.ConveniosUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.ConveniosCreateOrConnectWithoutClienteInput | Prisma.ConveniosCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.ConveniosCreateManyClienteInputEnvelope;
    connect?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
};
export type ConveniosUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.ConveniosCreateWithoutClienteInput, Prisma.ConveniosUncheckedCreateWithoutClienteInput> | Prisma.ConveniosCreateWithoutClienteInput[] | Prisma.ConveniosUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.ConveniosCreateOrConnectWithoutClienteInput | Prisma.ConveniosCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.ConveniosUpsertWithWhereUniqueWithoutClienteInput | Prisma.ConveniosUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.ConveniosCreateManyClienteInputEnvelope;
    set?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
    disconnect?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
    delete?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
    connect?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
    update?: Prisma.ConveniosUpdateWithWhereUniqueWithoutClienteInput | Prisma.ConveniosUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.ConveniosUpdateManyWithWhereWithoutClienteInput | Prisma.ConveniosUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.ConveniosScalarWhereInput | Prisma.ConveniosScalarWhereInput[];
};
export type ConveniosUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.ConveniosCreateWithoutClienteInput, Prisma.ConveniosUncheckedCreateWithoutClienteInput> | Prisma.ConveniosCreateWithoutClienteInput[] | Prisma.ConveniosUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.ConveniosCreateOrConnectWithoutClienteInput | Prisma.ConveniosCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.ConveniosUpsertWithWhereUniqueWithoutClienteInput | Prisma.ConveniosUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.ConveniosCreateManyClienteInputEnvelope;
    set?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
    disconnect?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
    delete?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
    connect?: Prisma.ConveniosWhereUniqueInput | Prisma.ConveniosWhereUniqueInput[];
    update?: Prisma.ConveniosUpdateWithWhereUniqueWithoutClienteInput | Prisma.ConveniosUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.ConveniosUpdateManyWithWhereWithoutClienteInput | Prisma.ConveniosUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.ConveniosScalarWhereInput | Prisma.ConveniosScalarWhereInput[];
};
export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type ConveniosCreateWithoutClienteInput = {
    convenioId?: bigint | number;
    fechaInicio: Date | string;
    fechaFin?: Date | string | null;
    numeroCuotas?: number | null;
    montoCuota?: number | null;
    estado?: string | null;
};
export type ConveniosUncheckedCreateWithoutClienteInput = {
    convenioId?: bigint | number;
    fechaInicio: Date | string;
    fechaFin?: Date | string | null;
    numeroCuotas?: number | null;
    montoCuota?: number | null;
    estado?: string | null;
};
export type ConveniosCreateOrConnectWithoutClienteInput = {
    where: Prisma.ConveniosWhereUniqueInput;
    create: Prisma.XOR<Prisma.ConveniosCreateWithoutClienteInput, Prisma.ConveniosUncheckedCreateWithoutClienteInput>;
};
export type ConveniosCreateManyClienteInputEnvelope = {
    data: Prisma.ConveniosCreateManyClienteInput | Prisma.ConveniosCreateManyClienteInput[];
    skipDuplicates?: boolean;
};
export type ConveniosUpsertWithWhereUniqueWithoutClienteInput = {
    where: Prisma.ConveniosWhereUniqueInput;
    update: Prisma.XOR<Prisma.ConveniosUpdateWithoutClienteInput, Prisma.ConveniosUncheckedUpdateWithoutClienteInput>;
    create: Prisma.XOR<Prisma.ConveniosCreateWithoutClienteInput, Prisma.ConveniosUncheckedCreateWithoutClienteInput>;
};
export type ConveniosUpdateWithWhereUniqueWithoutClienteInput = {
    where: Prisma.ConveniosWhereUniqueInput;
    data: Prisma.XOR<Prisma.ConveniosUpdateWithoutClienteInput, Prisma.ConveniosUncheckedUpdateWithoutClienteInput>;
};
export type ConveniosUpdateManyWithWhereWithoutClienteInput = {
    where: Prisma.ConveniosScalarWhereInput;
    data: Prisma.XOR<Prisma.ConveniosUpdateManyMutationInput, Prisma.ConveniosUncheckedUpdateManyWithoutClienteInput>;
};
export type ConveniosScalarWhereInput = {
    AND?: Prisma.ConveniosScalarWhereInput | Prisma.ConveniosScalarWhereInput[];
    OR?: Prisma.ConveniosScalarWhereInput[];
    NOT?: Prisma.ConveniosScalarWhereInput | Prisma.ConveniosScalarWhereInput[];
    convenioId?: Prisma.BigIntFilter<"Convenios"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"Convenios"> | bigint | number | null;
    fechaInicio?: Prisma.DateTimeFilter<"Convenios"> | Date | string;
    fechaFin?: Prisma.DateTimeNullableFilter<"Convenios"> | Date | string | null;
    numeroCuotas?: Prisma.IntNullableFilter<"Convenios"> | number | null;
    montoCuota?: Prisma.FloatNullableFilter<"Convenios"> | number | null;
    estado?: Prisma.StringNullableFilter<"Convenios"> | string | null;
};
export type ConveniosCreateManyClienteInput = {
    convenioId?: bigint | number;
    fechaInicio: Date | string;
    fechaFin?: Date | string | null;
    numeroCuotas?: number | null;
    montoCuota?: number | null;
    estado?: string | null;
};
export type ConveniosUpdateWithoutClienteInput = {
    convenioId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaInicio?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    numeroCuotas?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    montoCuota?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ConveniosUncheckedUpdateWithoutClienteInput = {
    convenioId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaInicio?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    numeroCuotas?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    montoCuota?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ConveniosUncheckedUpdateManyWithoutClienteInput = {
    convenioId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaInicio?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    numeroCuotas?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    montoCuota?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ConveniosSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    convenioId?: boolean;
    clienteId?: boolean;
    fechaInicio?: boolean;
    fechaFin?: boolean;
    numeroCuotas?: boolean;
    montoCuota?: boolean;
    estado?: boolean;
    cliente?: boolean | Prisma.Convenios$clienteArgs<ExtArgs>;
}, ExtArgs["result"]["convenios"]>;
export type ConveniosSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    convenioId?: boolean;
    clienteId?: boolean;
    fechaInicio?: boolean;
    fechaFin?: boolean;
    numeroCuotas?: boolean;
    montoCuota?: boolean;
    estado?: boolean;
    cliente?: boolean | Prisma.Convenios$clienteArgs<ExtArgs>;
}, ExtArgs["result"]["convenios"]>;
export type ConveniosSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    convenioId?: boolean;
    clienteId?: boolean;
    fechaInicio?: boolean;
    fechaFin?: boolean;
    numeroCuotas?: boolean;
    montoCuota?: boolean;
    estado?: boolean;
    cliente?: boolean | Prisma.Convenios$clienteArgs<ExtArgs>;
}, ExtArgs["result"]["convenios"]>;
export type ConveniosSelectScalar = {
    convenioId?: boolean;
    clienteId?: boolean;
    fechaInicio?: boolean;
    fechaFin?: boolean;
    numeroCuotas?: boolean;
    montoCuota?: boolean;
    estado?: boolean;
};
export type ConveniosOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"convenioId" | "clienteId" | "fechaInicio" | "fechaFin" | "numeroCuotas" | "montoCuota" | "estado", ExtArgs["result"]["convenios"]>;
export type ConveniosInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Convenios$clienteArgs<ExtArgs>;
};
export type ConveniosIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Convenios$clienteArgs<ExtArgs>;
};
export type ConveniosIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Convenios$clienteArgs<ExtArgs>;
};
export type $ConveniosPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Convenios";
    objects: {
        cliente: Prisma.$ClientesPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        convenioId: bigint;
        clienteId: bigint | null;
        fechaInicio: Date;
        fechaFin: Date | null;
        numeroCuotas: number | null;
        montoCuota: number | null;
        estado: string | null;
    }, ExtArgs["result"]["convenios"]>;
    composites: {};
};
export type ConveniosGetPayload<S extends boolean | null | undefined | ConveniosDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ConveniosPayload, S>;
export type ConveniosCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ConveniosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ConveniosCountAggregateInputType | true;
};
export interface ConveniosDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Convenios'];
        meta: {
            name: 'Convenios';
        };
    };
    findUnique<T extends ConveniosFindUniqueArgs>(args: Prisma.SelectSubset<T, ConveniosFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ConveniosClient<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ConveniosFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ConveniosFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ConveniosClient<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ConveniosFindFirstArgs>(args?: Prisma.SelectSubset<T, ConveniosFindFirstArgs<ExtArgs>>): Prisma.Prisma__ConveniosClient<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ConveniosFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ConveniosFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ConveniosClient<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ConveniosFindManyArgs>(args?: Prisma.SelectSubset<T, ConveniosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ConveniosCreateArgs>(args: Prisma.SelectSubset<T, ConveniosCreateArgs<ExtArgs>>): Prisma.Prisma__ConveniosClient<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ConveniosCreateManyArgs>(args?: Prisma.SelectSubset<T, ConveniosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ConveniosCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ConveniosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ConveniosDeleteArgs>(args: Prisma.SelectSubset<T, ConveniosDeleteArgs<ExtArgs>>): Prisma.Prisma__ConveniosClient<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ConveniosUpdateArgs>(args: Prisma.SelectSubset<T, ConveniosUpdateArgs<ExtArgs>>): Prisma.Prisma__ConveniosClient<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ConveniosDeleteManyArgs>(args?: Prisma.SelectSubset<T, ConveniosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ConveniosUpdateManyArgs>(args: Prisma.SelectSubset<T, ConveniosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ConveniosUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ConveniosUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ConveniosUpsertArgs>(args: Prisma.SelectSubset<T, ConveniosUpsertArgs<ExtArgs>>): Prisma.Prisma__ConveniosClient<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ConveniosCountArgs>(args?: Prisma.Subset<T, ConveniosCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ConveniosCountAggregateOutputType> : number>;
    aggregate<T extends ConveniosAggregateArgs>(args: Prisma.Subset<T, ConveniosAggregateArgs>): Prisma.PrismaPromise<GetConveniosAggregateType<T>>;
    groupBy<T extends ConveniosGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ConveniosGroupByArgs['orderBy'];
    } : {
        orderBy?: ConveniosGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ConveniosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConveniosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ConveniosFieldRefs;
}
export interface Prisma__ConveniosClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    cliente<T extends Prisma.Convenios$clienteArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Convenios$clienteArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ConveniosFieldRefs {
    readonly convenioId: Prisma.FieldRef<"Convenios", 'BigInt'>;
    readonly clienteId: Prisma.FieldRef<"Convenios", 'BigInt'>;
    readonly fechaInicio: Prisma.FieldRef<"Convenios", 'DateTime'>;
    readonly fechaFin: Prisma.FieldRef<"Convenios", 'DateTime'>;
    readonly numeroCuotas: Prisma.FieldRef<"Convenios", 'Int'>;
    readonly montoCuota: Prisma.FieldRef<"Convenios", 'Float'>;
    readonly estado: Prisma.FieldRef<"Convenios", 'String'>;
}
export type ConveniosFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    where: Prisma.ConveniosWhereUniqueInput;
};
export type ConveniosFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    where: Prisma.ConveniosWhereUniqueInput;
};
export type ConveniosFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    where?: Prisma.ConveniosWhereInput;
    orderBy?: Prisma.ConveniosOrderByWithRelationInput | Prisma.ConveniosOrderByWithRelationInput[];
    cursor?: Prisma.ConveniosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConveniosScalarFieldEnum | Prisma.ConveniosScalarFieldEnum[];
};
export type ConveniosFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    where?: Prisma.ConveniosWhereInput;
    orderBy?: Prisma.ConveniosOrderByWithRelationInput | Prisma.ConveniosOrderByWithRelationInput[];
    cursor?: Prisma.ConveniosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConveniosScalarFieldEnum | Prisma.ConveniosScalarFieldEnum[];
};
export type ConveniosFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    where?: Prisma.ConveniosWhereInput;
    orderBy?: Prisma.ConveniosOrderByWithRelationInput | Prisma.ConveniosOrderByWithRelationInput[];
    cursor?: Prisma.ConveniosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConveniosScalarFieldEnum | Prisma.ConveniosScalarFieldEnum[];
};
export type ConveniosCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConveniosCreateInput, Prisma.ConveniosUncheckedCreateInput>;
};
export type ConveniosCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ConveniosCreateManyInput | Prisma.ConveniosCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ConveniosCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    data: Prisma.ConveniosCreateManyInput | Prisma.ConveniosCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ConveniosIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ConveniosUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConveniosUpdateInput, Prisma.ConveniosUncheckedUpdateInput>;
    where: Prisma.ConveniosWhereUniqueInput;
};
export type ConveniosUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ConveniosUpdateManyMutationInput, Prisma.ConveniosUncheckedUpdateManyInput>;
    where?: Prisma.ConveniosWhereInput;
    limit?: number;
};
export type ConveniosUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConveniosUpdateManyMutationInput, Prisma.ConveniosUncheckedUpdateManyInput>;
    where?: Prisma.ConveniosWhereInput;
    limit?: number;
    include?: Prisma.ConveniosIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ConveniosUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    where: Prisma.ConveniosWhereUniqueInput;
    create: Prisma.XOR<Prisma.ConveniosCreateInput, Prisma.ConveniosUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ConveniosUpdateInput, Prisma.ConveniosUncheckedUpdateInput>;
};
export type ConveniosDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
    where: Prisma.ConveniosWhereUniqueInput;
};
export type ConveniosDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConveniosWhereInput;
    limit?: number;
};
export type Convenios$clienteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where?: Prisma.ClientesWhereInput;
};
export type ConveniosDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConveniosSelect<ExtArgs> | null;
    omit?: Prisma.ConveniosOmit<ExtArgs> | null;
    include?: Prisma.ConveniosInclude<ExtArgs> | null;
};
export {};
