import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClientesMedidoresModel = runtime.Types.Result.DefaultSelection<Prisma.$ClientesMedidoresPayload>;
export type AggregateClientesMedidores = {
    _count: ClientesMedidoresCountAggregateOutputType | null;
    _avg: ClientesMedidoresAvgAggregateOutputType | null;
    _sum: ClientesMedidoresSumAggregateOutputType | null;
    _min: ClientesMedidoresMinAggregateOutputType | null;
    _max: ClientesMedidoresMaxAggregateOutputType | null;
};
export type ClientesMedidoresAvgAggregateOutputType = {
    clienteMedidorId: number | null;
    clienteId: number | null;
    medidorId: number | null;
};
export type ClientesMedidoresSumAggregateOutputType = {
    clienteMedidorId: bigint | null;
    clienteId: bigint | null;
    medidorId: bigint | null;
};
export type ClientesMedidoresMinAggregateOutputType = {
    clienteMedidorId: bigint | null;
    clienteId: bigint | null;
    medidorId: bigint | null;
    fechaAsignacion: Date | null;
    fechaRetiro: Date | null;
};
export type ClientesMedidoresMaxAggregateOutputType = {
    clienteMedidorId: bigint | null;
    clienteId: bigint | null;
    medidorId: bigint | null;
    fechaAsignacion: Date | null;
    fechaRetiro: Date | null;
};
export type ClientesMedidoresCountAggregateOutputType = {
    clienteMedidorId: number;
    clienteId: number;
    medidorId: number;
    fechaAsignacion: number;
    fechaRetiro: number;
    _all: number;
};
export type ClientesMedidoresAvgAggregateInputType = {
    clienteMedidorId?: true;
    clienteId?: true;
    medidorId?: true;
};
export type ClientesMedidoresSumAggregateInputType = {
    clienteMedidorId?: true;
    clienteId?: true;
    medidorId?: true;
};
export type ClientesMedidoresMinAggregateInputType = {
    clienteMedidorId?: true;
    clienteId?: true;
    medidorId?: true;
    fechaAsignacion?: true;
    fechaRetiro?: true;
};
export type ClientesMedidoresMaxAggregateInputType = {
    clienteMedidorId?: true;
    clienteId?: true;
    medidorId?: true;
    fechaAsignacion?: true;
    fechaRetiro?: true;
};
export type ClientesMedidoresCountAggregateInputType = {
    clienteMedidorId?: true;
    clienteId?: true;
    medidorId?: true;
    fechaAsignacion?: true;
    fechaRetiro?: true;
    _all?: true;
};
export type ClientesMedidoresAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesMedidoresWhereInput;
    orderBy?: Prisma.ClientesMedidoresOrderByWithRelationInput | Prisma.ClientesMedidoresOrderByWithRelationInput[];
    cursor?: Prisma.ClientesMedidoresWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClientesMedidoresCountAggregateInputType;
    _avg?: ClientesMedidoresAvgAggregateInputType;
    _sum?: ClientesMedidoresSumAggregateInputType;
    _min?: ClientesMedidoresMinAggregateInputType;
    _max?: ClientesMedidoresMaxAggregateInputType;
};
export type GetClientesMedidoresAggregateType<T extends ClientesMedidoresAggregateArgs> = {
    [P in keyof T & keyof AggregateClientesMedidores]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClientesMedidores[P]> : Prisma.GetScalarType<T[P], AggregateClientesMedidores[P]>;
};
export type ClientesMedidoresGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesMedidoresWhereInput;
    orderBy?: Prisma.ClientesMedidoresOrderByWithAggregationInput | Prisma.ClientesMedidoresOrderByWithAggregationInput[];
    by: Prisma.ClientesMedidoresScalarFieldEnum[] | Prisma.ClientesMedidoresScalarFieldEnum;
    having?: Prisma.ClientesMedidoresScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientesMedidoresCountAggregateInputType | true;
    _avg?: ClientesMedidoresAvgAggregateInputType;
    _sum?: ClientesMedidoresSumAggregateInputType;
    _min?: ClientesMedidoresMinAggregateInputType;
    _max?: ClientesMedidoresMaxAggregateInputType;
};
export type ClientesMedidoresGroupByOutputType = {
    clienteMedidorId: bigint;
    clienteId: bigint | null;
    medidorId: bigint | null;
    fechaAsignacion: Date;
    fechaRetiro: Date | null;
    _count: ClientesMedidoresCountAggregateOutputType | null;
    _avg: ClientesMedidoresAvgAggregateOutputType | null;
    _sum: ClientesMedidoresSumAggregateOutputType | null;
    _min: ClientesMedidoresMinAggregateOutputType | null;
    _max: ClientesMedidoresMaxAggregateOutputType | null;
};
type GetClientesMedidoresGroupByPayload<T extends ClientesMedidoresGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClientesMedidoresGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClientesMedidoresGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClientesMedidoresGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClientesMedidoresGroupByOutputType[P]>;
}>>;
export type ClientesMedidoresWhereInput = {
    AND?: Prisma.ClientesMedidoresWhereInput | Prisma.ClientesMedidoresWhereInput[];
    OR?: Prisma.ClientesMedidoresWhereInput[];
    NOT?: Prisma.ClientesMedidoresWhereInput | Prisma.ClientesMedidoresWhereInput[];
    clienteMedidorId?: Prisma.BigIntFilter<"ClientesMedidores"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"ClientesMedidores"> | bigint | number | null;
    medidorId?: Prisma.BigIntNullableFilter<"ClientesMedidores"> | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFilter<"ClientesMedidores"> | Date | string;
    fechaRetiro?: Prisma.DateTimeNullableFilter<"ClientesMedidores"> | Date | string | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
    medidor?: Prisma.XOR<Prisma.MedidoresNullableScalarRelationFilter, Prisma.MedidoresWhereInput> | null;
    lecturas?: Prisma.LecturasListRelationFilter;
};
export type ClientesMedidoresOrderByWithRelationInput = {
    clienteMedidorId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    medidorId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaAsignacion?: Prisma.SortOrder;
    fechaRetiro?: Prisma.SortOrderInput | Prisma.SortOrder;
    cliente?: Prisma.ClientesOrderByWithRelationInput;
    medidor?: Prisma.MedidoresOrderByWithRelationInput;
    lecturas?: Prisma.LecturasOrderByRelationAggregateInput;
};
export type ClientesMedidoresWhereUniqueInput = Prisma.AtLeast<{
    clienteMedidorId?: bigint | number;
    AND?: Prisma.ClientesMedidoresWhereInput | Prisma.ClientesMedidoresWhereInput[];
    OR?: Prisma.ClientesMedidoresWhereInput[];
    NOT?: Prisma.ClientesMedidoresWhereInput | Prisma.ClientesMedidoresWhereInput[];
    clienteId?: Prisma.BigIntNullableFilter<"ClientesMedidores"> | bigint | number | null;
    medidorId?: Prisma.BigIntNullableFilter<"ClientesMedidores"> | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFilter<"ClientesMedidores"> | Date | string;
    fechaRetiro?: Prisma.DateTimeNullableFilter<"ClientesMedidores"> | Date | string | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
    medidor?: Prisma.XOR<Prisma.MedidoresNullableScalarRelationFilter, Prisma.MedidoresWhereInput> | null;
    lecturas?: Prisma.LecturasListRelationFilter;
}, "clienteMedidorId">;
export type ClientesMedidoresOrderByWithAggregationInput = {
    clienteMedidorId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    medidorId?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaAsignacion?: Prisma.SortOrder;
    fechaRetiro?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.ClientesMedidoresCountOrderByAggregateInput;
    _avg?: Prisma.ClientesMedidoresAvgOrderByAggregateInput;
    _max?: Prisma.ClientesMedidoresMaxOrderByAggregateInput;
    _min?: Prisma.ClientesMedidoresMinOrderByAggregateInput;
    _sum?: Prisma.ClientesMedidoresSumOrderByAggregateInput;
};
export type ClientesMedidoresScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClientesMedidoresScalarWhereWithAggregatesInput | Prisma.ClientesMedidoresScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClientesMedidoresScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClientesMedidoresScalarWhereWithAggregatesInput | Prisma.ClientesMedidoresScalarWhereWithAggregatesInput[];
    clienteMedidorId?: Prisma.BigIntWithAggregatesFilter<"ClientesMedidores"> | bigint | number;
    clienteId?: Prisma.BigIntNullableWithAggregatesFilter<"ClientesMedidores"> | bigint | number | null;
    medidorId?: Prisma.BigIntNullableWithAggregatesFilter<"ClientesMedidores"> | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeWithAggregatesFilter<"ClientesMedidores"> | Date | string;
    fechaRetiro?: Prisma.DateTimeNullableWithAggregatesFilter<"ClientesMedidores"> | Date | string | null;
};
export type ClientesMedidoresCreateInput = {
    clienteMedidorId?: bigint | number;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutClientesMedidoresInput;
    medidor?: Prisma.MedidoresCreateNestedOneWithoutClientesMedidoresInput;
    lecturas?: Prisma.LecturasCreateNestedManyWithoutClienteMedidorInput;
};
export type ClientesMedidoresUncheckedCreateInput = {
    clienteMedidorId?: bigint | number;
    clienteId?: bigint | number | null;
    medidorId?: bigint | number | null;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
    lecturas?: Prisma.LecturasUncheckedCreateNestedManyWithoutClienteMedidorInput;
};
export type ClientesMedidoresUpdateInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cliente?: Prisma.ClientesUpdateOneWithoutClientesMedidoresNestedInput;
    medidor?: Prisma.MedidoresUpdateOneWithoutClientesMedidoresNestedInput;
    lecturas?: Prisma.LecturasUpdateManyWithoutClienteMedidorNestedInput;
};
export type ClientesMedidoresUncheckedUpdateInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    medidorId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    lecturas?: Prisma.LecturasUncheckedUpdateManyWithoutClienteMedidorNestedInput;
};
export type ClientesMedidoresCreateManyInput = {
    clienteMedidorId?: bigint | number;
    clienteId?: bigint | number | null;
    medidorId?: bigint | number | null;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
};
export type ClientesMedidoresUpdateManyMutationInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type ClientesMedidoresUncheckedUpdateManyInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    medidorId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type ClientesMedidoresListRelationFilter = {
    every?: Prisma.ClientesMedidoresWhereInput;
    some?: Prisma.ClientesMedidoresWhereInput;
    none?: Prisma.ClientesMedidoresWhereInput;
};
export type ClientesMedidoresOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClientesMedidoresCountOrderByAggregateInput = {
    clienteMedidorId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    medidorId?: Prisma.SortOrder;
    fechaAsignacion?: Prisma.SortOrder;
    fechaRetiro?: Prisma.SortOrder;
};
export type ClientesMedidoresAvgOrderByAggregateInput = {
    clienteMedidorId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    medidorId?: Prisma.SortOrder;
};
export type ClientesMedidoresMaxOrderByAggregateInput = {
    clienteMedidorId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    medidorId?: Prisma.SortOrder;
    fechaAsignacion?: Prisma.SortOrder;
    fechaRetiro?: Prisma.SortOrder;
};
export type ClientesMedidoresMinOrderByAggregateInput = {
    clienteMedidorId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    medidorId?: Prisma.SortOrder;
    fechaAsignacion?: Prisma.SortOrder;
    fechaRetiro?: Prisma.SortOrder;
};
export type ClientesMedidoresSumOrderByAggregateInput = {
    clienteMedidorId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    medidorId?: Prisma.SortOrder;
};
export type ClientesMedidoresNullableScalarRelationFilter = {
    is?: Prisma.ClientesMedidoresWhereInput | null;
    isNot?: Prisma.ClientesMedidoresWhereInput | null;
};
export type ClientesMedidoresCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutClienteInput, Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput> | Prisma.ClientesMedidoresCreateWithoutClienteInput[] | Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutClienteInput | Prisma.ClientesMedidoresCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.ClientesMedidoresCreateManyClienteInputEnvelope;
    connect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
};
export type ClientesMedidoresUncheckedCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutClienteInput, Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput> | Prisma.ClientesMedidoresCreateWithoutClienteInput[] | Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutClienteInput | Prisma.ClientesMedidoresCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.ClientesMedidoresCreateManyClienteInputEnvelope;
    connect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
};
export type ClientesMedidoresUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutClienteInput, Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput> | Prisma.ClientesMedidoresCreateWithoutClienteInput[] | Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutClienteInput | Prisma.ClientesMedidoresCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.ClientesMedidoresUpsertWithWhereUniqueWithoutClienteInput | Prisma.ClientesMedidoresUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.ClientesMedidoresCreateManyClienteInputEnvelope;
    set?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    disconnect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    delete?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    connect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    update?: Prisma.ClientesMedidoresUpdateWithWhereUniqueWithoutClienteInput | Prisma.ClientesMedidoresUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.ClientesMedidoresUpdateManyWithWhereWithoutClienteInput | Prisma.ClientesMedidoresUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.ClientesMedidoresScalarWhereInput | Prisma.ClientesMedidoresScalarWhereInput[];
};
export type ClientesMedidoresUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutClienteInput, Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput> | Prisma.ClientesMedidoresCreateWithoutClienteInput[] | Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutClienteInput | Prisma.ClientesMedidoresCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.ClientesMedidoresUpsertWithWhereUniqueWithoutClienteInput | Prisma.ClientesMedidoresUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.ClientesMedidoresCreateManyClienteInputEnvelope;
    set?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    disconnect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    delete?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    connect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    update?: Prisma.ClientesMedidoresUpdateWithWhereUniqueWithoutClienteInput | Prisma.ClientesMedidoresUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.ClientesMedidoresUpdateManyWithWhereWithoutClienteInput | Prisma.ClientesMedidoresUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.ClientesMedidoresScalarWhereInput | Prisma.ClientesMedidoresScalarWhereInput[];
};
export type ClientesMedidoresCreateNestedOneWithoutLecturasInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutLecturasInput, Prisma.ClientesMedidoresUncheckedCreateWithoutLecturasInput>;
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutLecturasInput;
    connect?: Prisma.ClientesMedidoresWhereUniqueInput;
};
export type ClientesMedidoresUpdateOneWithoutLecturasNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutLecturasInput, Prisma.ClientesMedidoresUncheckedCreateWithoutLecturasInput>;
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutLecturasInput;
    upsert?: Prisma.ClientesMedidoresUpsertWithoutLecturasInput;
    disconnect?: Prisma.ClientesMedidoresWhereInput | boolean;
    delete?: Prisma.ClientesMedidoresWhereInput | boolean;
    connect?: Prisma.ClientesMedidoresWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientesMedidoresUpdateToOneWithWhereWithoutLecturasInput, Prisma.ClientesMedidoresUpdateWithoutLecturasInput>, Prisma.ClientesMedidoresUncheckedUpdateWithoutLecturasInput>;
};
export type ClientesMedidoresCreateNestedManyWithoutMedidorInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutMedidorInput, Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput> | Prisma.ClientesMedidoresCreateWithoutMedidorInput[] | Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput[];
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutMedidorInput | Prisma.ClientesMedidoresCreateOrConnectWithoutMedidorInput[];
    createMany?: Prisma.ClientesMedidoresCreateManyMedidorInputEnvelope;
    connect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
};
export type ClientesMedidoresUncheckedCreateNestedManyWithoutMedidorInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutMedidorInput, Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput> | Prisma.ClientesMedidoresCreateWithoutMedidorInput[] | Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput[];
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutMedidorInput | Prisma.ClientesMedidoresCreateOrConnectWithoutMedidorInput[];
    createMany?: Prisma.ClientesMedidoresCreateManyMedidorInputEnvelope;
    connect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
};
export type ClientesMedidoresUpdateManyWithoutMedidorNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutMedidorInput, Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput> | Prisma.ClientesMedidoresCreateWithoutMedidorInput[] | Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput[];
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutMedidorInput | Prisma.ClientesMedidoresCreateOrConnectWithoutMedidorInput[];
    upsert?: Prisma.ClientesMedidoresUpsertWithWhereUniqueWithoutMedidorInput | Prisma.ClientesMedidoresUpsertWithWhereUniqueWithoutMedidorInput[];
    createMany?: Prisma.ClientesMedidoresCreateManyMedidorInputEnvelope;
    set?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    disconnect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    delete?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    connect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    update?: Prisma.ClientesMedidoresUpdateWithWhereUniqueWithoutMedidorInput | Prisma.ClientesMedidoresUpdateWithWhereUniqueWithoutMedidorInput[];
    updateMany?: Prisma.ClientesMedidoresUpdateManyWithWhereWithoutMedidorInput | Prisma.ClientesMedidoresUpdateManyWithWhereWithoutMedidorInput[];
    deleteMany?: Prisma.ClientesMedidoresScalarWhereInput | Prisma.ClientesMedidoresScalarWhereInput[];
};
export type ClientesMedidoresUncheckedUpdateManyWithoutMedidorNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutMedidorInput, Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput> | Prisma.ClientesMedidoresCreateWithoutMedidorInput[] | Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput[];
    connectOrCreate?: Prisma.ClientesMedidoresCreateOrConnectWithoutMedidorInput | Prisma.ClientesMedidoresCreateOrConnectWithoutMedidorInput[];
    upsert?: Prisma.ClientesMedidoresUpsertWithWhereUniqueWithoutMedidorInput | Prisma.ClientesMedidoresUpsertWithWhereUniqueWithoutMedidorInput[];
    createMany?: Prisma.ClientesMedidoresCreateManyMedidorInputEnvelope;
    set?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    disconnect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    delete?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    connect?: Prisma.ClientesMedidoresWhereUniqueInput | Prisma.ClientesMedidoresWhereUniqueInput[];
    update?: Prisma.ClientesMedidoresUpdateWithWhereUniqueWithoutMedidorInput | Prisma.ClientesMedidoresUpdateWithWhereUniqueWithoutMedidorInput[];
    updateMany?: Prisma.ClientesMedidoresUpdateManyWithWhereWithoutMedidorInput | Prisma.ClientesMedidoresUpdateManyWithWhereWithoutMedidorInput[];
    deleteMany?: Prisma.ClientesMedidoresScalarWhereInput | Prisma.ClientesMedidoresScalarWhereInput[];
};
export type ClientesMedidoresCreateWithoutClienteInput = {
    clienteMedidorId?: bigint | number;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
    medidor?: Prisma.MedidoresCreateNestedOneWithoutClientesMedidoresInput;
    lecturas?: Prisma.LecturasCreateNestedManyWithoutClienteMedidorInput;
};
export type ClientesMedidoresUncheckedCreateWithoutClienteInput = {
    clienteMedidorId?: bigint | number;
    medidorId?: bigint | number | null;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
    lecturas?: Prisma.LecturasUncheckedCreateNestedManyWithoutClienteMedidorInput;
};
export type ClientesMedidoresCreateOrConnectWithoutClienteInput = {
    where: Prisma.ClientesMedidoresWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutClienteInput, Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput>;
};
export type ClientesMedidoresCreateManyClienteInputEnvelope = {
    data: Prisma.ClientesMedidoresCreateManyClienteInput | Prisma.ClientesMedidoresCreateManyClienteInput[];
    skipDuplicates?: boolean;
};
export type ClientesMedidoresUpsertWithWhereUniqueWithoutClienteInput = {
    where: Prisma.ClientesMedidoresWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientesMedidoresUpdateWithoutClienteInput, Prisma.ClientesMedidoresUncheckedUpdateWithoutClienteInput>;
    create: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutClienteInput, Prisma.ClientesMedidoresUncheckedCreateWithoutClienteInput>;
};
export type ClientesMedidoresUpdateWithWhereUniqueWithoutClienteInput = {
    where: Prisma.ClientesMedidoresWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientesMedidoresUpdateWithoutClienteInput, Prisma.ClientesMedidoresUncheckedUpdateWithoutClienteInput>;
};
export type ClientesMedidoresUpdateManyWithWhereWithoutClienteInput = {
    where: Prisma.ClientesMedidoresScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientesMedidoresUpdateManyMutationInput, Prisma.ClientesMedidoresUncheckedUpdateManyWithoutClienteInput>;
};
export type ClientesMedidoresScalarWhereInput = {
    AND?: Prisma.ClientesMedidoresScalarWhereInput | Prisma.ClientesMedidoresScalarWhereInput[];
    OR?: Prisma.ClientesMedidoresScalarWhereInput[];
    NOT?: Prisma.ClientesMedidoresScalarWhereInput | Prisma.ClientesMedidoresScalarWhereInput[];
    clienteMedidorId?: Prisma.BigIntFilter<"ClientesMedidores"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"ClientesMedidores"> | bigint | number | null;
    medidorId?: Prisma.BigIntNullableFilter<"ClientesMedidores"> | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFilter<"ClientesMedidores"> | Date | string;
    fechaRetiro?: Prisma.DateTimeNullableFilter<"ClientesMedidores"> | Date | string | null;
};
export type ClientesMedidoresCreateWithoutLecturasInput = {
    clienteMedidorId?: bigint | number;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutClientesMedidoresInput;
    medidor?: Prisma.MedidoresCreateNestedOneWithoutClientesMedidoresInput;
};
export type ClientesMedidoresUncheckedCreateWithoutLecturasInput = {
    clienteMedidorId?: bigint | number;
    clienteId?: bigint | number | null;
    medidorId?: bigint | number | null;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
};
export type ClientesMedidoresCreateOrConnectWithoutLecturasInput = {
    where: Prisma.ClientesMedidoresWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutLecturasInput, Prisma.ClientesMedidoresUncheckedCreateWithoutLecturasInput>;
};
export type ClientesMedidoresUpsertWithoutLecturasInput = {
    update: Prisma.XOR<Prisma.ClientesMedidoresUpdateWithoutLecturasInput, Prisma.ClientesMedidoresUncheckedUpdateWithoutLecturasInput>;
    create: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutLecturasInput, Prisma.ClientesMedidoresUncheckedCreateWithoutLecturasInput>;
    where?: Prisma.ClientesMedidoresWhereInput;
};
export type ClientesMedidoresUpdateToOneWithWhereWithoutLecturasInput = {
    where?: Prisma.ClientesMedidoresWhereInput;
    data: Prisma.XOR<Prisma.ClientesMedidoresUpdateWithoutLecturasInput, Prisma.ClientesMedidoresUncheckedUpdateWithoutLecturasInput>;
};
export type ClientesMedidoresUpdateWithoutLecturasInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cliente?: Prisma.ClientesUpdateOneWithoutClientesMedidoresNestedInput;
    medidor?: Prisma.MedidoresUpdateOneWithoutClientesMedidoresNestedInput;
};
export type ClientesMedidoresUncheckedUpdateWithoutLecturasInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    medidorId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type ClientesMedidoresCreateWithoutMedidorInput = {
    clienteMedidorId?: bigint | number;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutClientesMedidoresInput;
    lecturas?: Prisma.LecturasCreateNestedManyWithoutClienteMedidorInput;
};
export type ClientesMedidoresUncheckedCreateWithoutMedidorInput = {
    clienteMedidorId?: bigint | number;
    clienteId?: bigint | number | null;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
    lecturas?: Prisma.LecturasUncheckedCreateNestedManyWithoutClienteMedidorInput;
};
export type ClientesMedidoresCreateOrConnectWithoutMedidorInput = {
    where: Prisma.ClientesMedidoresWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutMedidorInput, Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput>;
};
export type ClientesMedidoresCreateManyMedidorInputEnvelope = {
    data: Prisma.ClientesMedidoresCreateManyMedidorInput | Prisma.ClientesMedidoresCreateManyMedidorInput[];
    skipDuplicates?: boolean;
};
export type ClientesMedidoresUpsertWithWhereUniqueWithoutMedidorInput = {
    where: Prisma.ClientesMedidoresWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientesMedidoresUpdateWithoutMedidorInput, Prisma.ClientesMedidoresUncheckedUpdateWithoutMedidorInput>;
    create: Prisma.XOR<Prisma.ClientesMedidoresCreateWithoutMedidorInput, Prisma.ClientesMedidoresUncheckedCreateWithoutMedidorInput>;
};
export type ClientesMedidoresUpdateWithWhereUniqueWithoutMedidorInput = {
    where: Prisma.ClientesMedidoresWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientesMedidoresUpdateWithoutMedidorInput, Prisma.ClientesMedidoresUncheckedUpdateWithoutMedidorInput>;
};
export type ClientesMedidoresUpdateManyWithWhereWithoutMedidorInput = {
    where: Prisma.ClientesMedidoresScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientesMedidoresUpdateManyMutationInput, Prisma.ClientesMedidoresUncheckedUpdateManyWithoutMedidorInput>;
};
export type ClientesMedidoresCreateManyClienteInput = {
    clienteMedidorId?: bigint | number;
    medidorId?: bigint | number | null;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
};
export type ClientesMedidoresUpdateWithoutClienteInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    medidor?: Prisma.MedidoresUpdateOneWithoutClientesMedidoresNestedInput;
    lecturas?: Prisma.LecturasUpdateManyWithoutClienteMedidorNestedInput;
};
export type ClientesMedidoresUncheckedUpdateWithoutClienteInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    medidorId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    lecturas?: Prisma.LecturasUncheckedUpdateManyWithoutClienteMedidorNestedInput;
};
export type ClientesMedidoresUncheckedUpdateManyWithoutClienteInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    medidorId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type ClientesMedidoresCreateManyMedidorInput = {
    clienteMedidorId?: bigint | number;
    clienteId?: bigint | number | null;
    fechaAsignacion: Date | string;
    fechaRetiro?: Date | string | null;
};
export type ClientesMedidoresUpdateWithoutMedidorInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cliente?: Prisma.ClientesUpdateOneWithoutClientesMedidoresNestedInput;
    lecturas?: Prisma.LecturasUpdateManyWithoutClienteMedidorNestedInput;
};
export type ClientesMedidoresUncheckedUpdateWithoutMedidorInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    lecturas?: Prisma.LecturasUncheckedUpdateManyWithoutClienteMedidorNestedInput;
};
export type ClientesMedidoresUncheckedUpdateManyWithoutMedidorInput = {
    clienteMedidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    fechaAsignacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaRetiro?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type ClientesMedidoresCountOutputType = {
    lecturas: number;
};
export type ClientesMedidoresCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    lecturas?: boolean | ClientesMedidoresCountOutputTypeCountLecturasArgs;
};
export type ClientesMedidoresCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresCountOutputTypeSelect<ExtArgs> | null;
};
export type ClientesMedidoresCountOutputTypeCountLecturasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LecturasWhereInput;
};
export type ClientesMedidoresSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    clienteMedidorId?: boolean;
    clienteId?: boolean;
    medidorId?: boolean;
    fechaAsignacion?: boolean;
    fechaRetiro?: boolean;
    cliente?: boolean | Prisma.ClientesMedidores$clienteArgs<ExtArgs>;
    medidor?: boolean | Prisma.ClientesMedidores$medidorArgs<ExtArgs>;
    lecturas?: boolean | Prisma.ClientesMedidores$lecturasArgs<ExtArgs>;
    _count?: boolean | Prisma.ClientesMedidoresCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientesMedidores"]>;
export type ClientesMedidoresSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    clienteMedidorId?: boolean;
    clienteId?: boolean;
    medidorId?: boolean;
    fechaAsignacion?: boolean;
    fechaRetiro?: boolean;
    cliente?: boolean | Prisma.ClientesMedidores$clienteArgs<ExtArgs>;
    medidor?: boolean | Prisma.ClientesMedidores$medidorArgs<ExtArgs>;
}, ExtArgs["result"]["clientesMedidores"]>;
export type ClientesMedidoresSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    clienteMedidorId?: boolean;
    clienteId?: boolean;
    medidorId?: boolean;
    fechaAsignacion?: boolean;
    fechaRetiro?: boolean;
    cliente?: boolean | Prisma.ClientesMedidores$clienteArgs<ExtArgs>;
    medidor?: boolean | Prisma.ClientesMedidores$medidorArgs<ExtArgs>;
}, ExtArgs["result"]["clientesMedidores"]>;
export type ClientesMedidoresSelectScalar = {
    clienteMedidorId?: boolean;
    clienteId?: boolean;
    medidorId?: boolean;
    fechaAsignacion?: boolean;
    fechaRetiro?: boolean;
};
export type ClientesMedidoresOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"clienteMedidorId" | "clienteId" | "medidorId" | "fechaAsignacion" | "fechaRetiro", ExtArgs["result"]["clientesMedidores"]>;
export type ClientesMedidoresInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.ClientesMedidores$clienteArgs<ExtArgs>;
    medidor?: boolean | Prisma.ClientesMedidores$medidorArgs<ExtArgs>;
    lecturas?: boolean | Prisma.ClientesMedidores$lecturasArgs<ExtArgs>;
    _count?: boolean | Prisma.ClientesMedidoresCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ClientesMedidoresIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.ClientesMedidores$clienteArgs<ExtArgs>;
    medidor?: boolean | Prisma.ClientesMedidores$medidorArgs<ExtArgs>;
};
export type ClientesMedidoresIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.ClientesMedidores$clienteArgs<ExtArgs>;
    medidor?: boolean | Prisma.ClientesMedidores$medidorArgs<ExtArgs>;
};
export type $ClientesMedidoresPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClientesMedidores";
    objects: {
        cliente: Prisma.$ClientesPayload<ExtArgs> | null;
        medidor: Prisma.$MedidoresPayload<ExtArgs> | null;
        lecturas: Prisma.$LecturasPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        clienteMedidorId: bigint;
        clienteId: bigint | null;
        medidorId: bigint | null;
        fechaAsignacion: Date;
        fechaRetiro: Date | null;
    }, ExtArgs["result"]["clientesMedidores"]>;
    composites: {};
};
export type ClientesMedidoresGetPayload<S extends boolean | null | undefined | ClientesMedidoresDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload, S>;
export type ClientesMedidoresCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClientesMedidoresFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientesMedidoresCountAggregateInputType | true;
};
export interface ClientesMedidoresDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClientesMedidores'];
        meta: {
            name: 'ClientesMedidores';
        };
    };
    findUnique<T extends ClientesMedidoresFindUniqueArgs>(args: Prisma.SelectSubset<T, ClientesMedidoresFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClientesMedidoresFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClientesMedidoresFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClientesMedidoresFindFirstArgs>(args?: Prisma.SelectSubset<T, ClientesMedidoresFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClientesMedidoresFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClientesMedidoresFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClientesMedidoresFindManyArgs>(args?: Prisma.SelectSubset<T, ClientesMedidoresFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClientesMedidoresCreateArgs>(args: Prisma.SelectSubset<T, ClientesMedidoresCreateArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClientesMedidoresCreateManyArgs>(args?: Prisma.SelectSubset<T, ClientesMedidoresCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClientesMedidoresCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClientesMedidoresCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClientesMedidoresDeleteArgs>(args: Prisma.SelectSubset<T, ClientesMedidoresDeleteArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClientesMedidoresUpdateArgs>(args: Prisma.SelectSubset<T, ClientesMedidoresUpdateArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClientesMedidoresDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClientesMedidoresDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClientesMedidoresUpdateManyArgs>(args: Prisma.SelectSubset<T, ClientesMedidoresUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClientesMedidoresUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClientesMedidoresUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClientesMedidoresUpsertArgs>(args: Prisma.SelectSubset<T, ClientesMedidoresUpsertArgs<ExtArgs>>): Prisma.Prisma__ClientesMedidoresClient<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClientesMedidoresCountArgs>(args?: Prisma.Subset<T, ClientesMedidoresCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClientesMedidoresCountAggregateOutputType> : number>;
    aggregate<T extends ClientesMedidoresAggregateArgs>(args: Prisma.Subset<T, ClientesMedidoresAggregateArgs>): Prisma.PrismaPromise<GetClientesMedidoresAggregateType<T>>;
    groupBy<T extends ClientesMedidoresGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClientesMedidoresGroupByArgs['orderBy'];
    } : {
        orderBy?: ClientesMedidoresGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClientesMedidoresGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientesMedidoresGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClientesMedidoresFieldRefs;
}
export interface Prisma__ClientesMedidoresClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    cliente<T extends Prisma.ClientesMedidores$clienteArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientesMedidores$clienteArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    medidor<T extends Prisma.ClientesMedidores$medidorArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientesMedidores$medidorArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    lecturas<T extends Prisma.ClientesMedidores$lecturasArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientesMedidores$lecturasArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LecturasPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClientesMedidoresFieldRefs {
    readonly clienteMedidorId: Prisma.FieldRef<"ClientesMedidores", 'BigInt'>;
    readonly clienteId: Prisma.FieldRef<"ClientesMedidores", 'BigInt'>;
    readonly medidorId: Prisma.FieldRef<"ClientesMedidores", 'BigInt'>;
    readonly fechaAsignacion: Prisma.FieldRef<"ClientesMedidores", 'DateTime'>;
    readonly fechaRetiro: Prisma.FieldRef<"ClientesMedidores", 'DateTime'>;
}
export type ClientesMedidoresFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    where: Prisma.ClientesMedidoresWhereUniqueInput;
};
export type ClientesMedidoresFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    where: Prisma.ClientesMedidoresWhereUniqueInput;
};
export type ClientesMedidoresFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    where?: Prisma.ClientesMedidoresWhereInput;
    orderBy?: Prisma.ClientesMedidoresOrderByWithRelationInput | Prisma.ClientesMedidoresOrderByWithRelationInput[];
    cursor?: Prisma.ClientesMedidoresWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientesMedidoresScalarFieldEnum | Prisma.ClientesMedidoresScalarFieldEnum[];
};
export type ClientesMedidoresFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    where?: Prisma.ClientesMedidoresWhereInput;
    orderBy?: Prisma.ClientesMedidoresOrderByWithRelationInput | Prisma.ClientesMedidoresOrderByWithRelationInput[];
    cursor?: Prisma.ClientesMedidoresWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientesMedidoresScalarFieldEnum | Prisma.ClientesMedidoresScalarFieldEnum[];
};
export type ClientesMedidoresFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    where?: Prisma.ClientesMedidoresWhereInput;
    orderBy?: Prisma.ClientesMedidoresOrderByWithRelationInput | Prisma.ClientesMedidoresOrderByWithRelationInput[];
    cursor?: Prisma.ClientesMedidoresWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientesMedidoresScalarFieldEnum | Prisma.ClientesMedidoresScalarFieldEnum[];
};
export type ClientesMedidoresCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientesMedidoresCreateInput, Prisma.ClientesMedidoresUncheckedCreateInput>;
};
export type ClientesMedidoresCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClientesMedidoresCreateManyInput | Prisma.ClientesMedidoresCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClientesMedidoresCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    data: Prisma.ClientesMedidoresCreateManyInput | Prisma.ClientesMedidoresCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClientesMedidoresIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClientesMedidoresUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientesMedidoresUpdateInput, Prisma.ClientesMedidoresUncheckedUpdateInput>;
    where: Prisma.ClientesMedidoresWhereUniqueInput;
};
export type ClientesMedidoresUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClientesMedidoresUpdateManyMutationInput, Prisma.ClientesMedidoresUncheckedUpdateManyInput>;
    where?: Prisma.ClientesMedidoresWhereInput;
    limit?: number;
};
export type ClientesMedidoresUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientesMedidoresUpdateManyMutationInput, Prisma.ClientesMedidoresUncheckedUpdateManyInput>;
    where?: Prisma.ClientesMedidoresWhereInput;
    limit?: number;
    include?: Prisma.ClientesMedidoresIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClientesMedidoresUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    where: Prisma.ClientesMedidoresWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesMedidoresCreateInput, Prisma.ClientesMedidoresUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClientesMedidoresUpdateInput, Prisma.ClientesMedidoresUncheckedUpdateInput>;
};
export type ClientesMedidoresDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
    where: Prisma.ClientesMedidoresWhereUniqueInput;
};
export type ClientesMedidoresDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesMedidoresWhereInput;
    limit?: number;
};
export type ClientesMedidores$clienteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where?: Prisma.ClientesWhereInput;
};
export type ClientesMedidores$medidorArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    where?: Prisma.MedidoresWhereInput;
};
export type ClientesMedidores$lecturasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientesMedidoresDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesMedidoresSelect<ExtArgs> | null;
    omit?: Prisma.ClientesMedidoresOmit<ExtArgs> | null;
    include?: Prisma.ClientesMedidoresInclude<ExtArgs> | null;
};
export {};
