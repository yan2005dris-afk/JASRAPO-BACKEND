import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SolicitudesModel = runtime.Types.Result.DefaultSelection<Prisma.$SolicitudesPayload>;
export type AggregateSolicitudes = {
    _count: SolicitudesCountAggregateOutputType | null;
    _avg: SolicitudesAvgAggregateOutputType | null;
    _sum: SolicitudesSumAggregateOutputType | null;
    _min: SolicitudesMinAggregateOutputType | null;
    _max: SolicitudesMaxAggregateOutputType | null;
};
export type SolicitudesAvgAggregateOutputType = {
    solicitudId: number | null;
    clienteId: number | null;
};
export type SolicitudesSumAggregateOutputType = {
    solicitudId: bigint | null;
    clienteId: bigint | null;
};
export type SolicitudesMinAggregateOutputType = {
    solicitudId: bigint | null;
    clienteId: bigint | null;
    tipoSolicitud: string | null;
    estado: string | null;
    fechaSolicitud: Date | null;
    fechaResolucion: Date | null;
};
export type SolicitudesMaxAggregateOutputType = {
    solicitudId: bigint | null;
    clienteId: bigint | null;
    tipoSolicitud: string | null;
    estado: string | null;
    fechaSolicitud: Date | null;
    fechaResolucion: Date | null;
};
export type SolicitudesCountAggregateOutputType = {
    solicitudId: number;
    clienteId: number;
    tipoSolicitud: number;
    estado: number;
    fechaSolicitud: number;
    fechaResolucion: number;
    _all: number;
};
export type SolicitudesAvgAggregateInputType = {
    solicitudId?: true;
    clienteId?: true;
};
export type SolicitudesSumAggregateInputType = {
    solicitudId?: true;
    clienteId?: true;
};
export type SolicitudesMinAggregateInputType = {
    solicitudId?: true;
    clienteId?: true;
    tipoSolicitud?: true;
    estado?: true;
    fechaSolicitud?: true;
    fechaResolucion?: true;
};
export type SolicitudesMaxAggregateInputType = {
    solicitudId?: true;
    clienteId?: true;
    tipoSolicitud?: true;
    estado?: true;
    fechaSolicitud?: true;
    fechaResolucion?: true;
};
export type SolicitudesCountAggregateInputType = {
    solicitudId?: true;
    clienteId?: true;
    tipoSolicitud?: true;
    estado?: true;
    fechaSolicitud?: true;
    fechaResolucion?: true;
    _all?: true;
};
export type SolicitudesAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SolicitudesWhereInput;
    orderBy?: Prisma.SolicitudesOrderByWithRelationInput | Prisma.SolicitudesOrderByWithRelationInput[];
    cursor?: Prisma.SolicitudesWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SolicitudesCountAggregateInputType;
    _avg?: SolicitudesAvgAggregateInputType;
    _sum?: SolicitudesSumAggregateInputType;
    _min?: SolicitudesMinAggregateInputType;
    _max?: SolicitudesMaxAggregateInputType;
};
export type GetSolicitudesAggregateType<T extends SolicitudesAggregateArgs> = {
    [P in keyof T & keyof AggregateSolicitudes]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSolicitudes[P]> : Prisma.GetScalarType<T[P], AggregateSolicitudes[P]>;
};
export type SolicitudesGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SolicitudesWhereInput;
    orderBy?: Prisma.SolicitudesOrderByWithAggregationInput | Prisma.SolicitudesOrderByWithAggregationInput[];
    by: Prisma.SolicitudesScalarFieldEnum[] | Prisma.SolicitudesScalarFieldEnum;
    having?: Prisma.SolicitudesScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SolicitudesCountAggregateInputType | true;
    _avg?: SolicitudesAvgAggregateInputType;
    _sum?: SolicitudesSumAggregateInputType;
    _min?: SolicitudesMinAggregateInputType;
    _max?: SolicitudesMaxAggregateInputType;
};
export type SolicitudesGroupByOutputType = {
    solicitudId: bigint;
    clienteId: bigint | null;
    tipoSolicitud: string;
    estado: string | null;
    fechaSolicitud: Date;
    fechaResolucion: Date | null;
    _count: SolicitudesCountAggregateOutputType | null;
    _avg: SolicitudesAvgAggregateOutputType | null;
    _sum: SolicitudesSumAggregateOutputType | null;
    _min: SolicitudesMinAggregateOutputType | null;
    _max: SolicitudesMaxAggregateOutputType | null;
};
type GetSolicitudesGroupByPayload<T extends SolicitudesGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SolicitudesGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SolicitudesGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SolicitudesGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SolicitudesGroupByOutputType[P]>;
}>>;
export type SolicitudesWhereInput = {
    AND?: Prisma.SolicitudesWhereInput | Prisma.SolicitudesWhereInput[];
    OR?: Prisma.SolicitudesWhereInput[];
    NOT?: Prisma.SolicitudesWhereInput | Prisma.SolicitudesWhereInput[];
    solicitudId?: Prisma.BigIntFilter<"Solicitudes"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"Solicitudes"> | bigint | number | null;
    tipoSolicitud?: Prisma.StringFilter<"Solicitudes"> | string;
    estado?: Prisma.StringNullableFilter<"Solicitudes"> | string | null;
    fechaSolicitud?: Prisma.DateTimeFilter<"Solicitudes"> | Date | string;
    fechaResolucion?: Prisma.DateTimeNullableFilter<"Solicitudes"> | Date | string | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
};
export type SolicitudesOrderByWithRelationInput = {
    solicitudId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    tipoSolicitud?: Prisma.SortOrder;
    estado?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaSolicitud?: Prisma.SortOrder;
    fechaResolucion?: Prisma.SortOrderInput | Prisma.SortOrder;
    cliente?: Prisma.ClientesOrderByWithRelationInput;
};
export type SolicitudesWhereUniqueInput = Prisma.AtLeast<{
    solicitudId?: bigint | number;
    AND?: Prisma.SolicitudesWhereInput | Prisma.SolicitudesWhereInput[];
    OR?: Prisma.SolicitudesWhereInput[];
    NOT?: Prisma.SolicitudesWhereInput | Prisma.SolicitudesWhereInput[];
    clienteId?: Prisma.BigIntNullableFilter<"Solicitudes"> | bigint | number | null;
    tipoSolicitud?: Prisma.StringFilter<"Solicitudes"> | string;
    estado?: Prisma.StringNullableFilter<"Solicitudes"> | string | null;
    fechaSolicitud?: Prisma.DateTimeFilter<"Solicitudes"> | Date | string;
    fechaResolucion?: Prisma.DateTimeNullableFilter<"Solicitudes"> | Date | string | null;
    cliente?: Prisma.XOR<Prisma.ClientesNullableScalarRelationFilter, Prisma.ClientesWhereInput> | null;
}, "solicitudId">;
export type SolicitudesOrderByWithAggregationInput = {
    solicitudId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    tipoSolicitud?: Prisma.SortOrder;
    estado?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaSolicitud?: Prisma.SortOrder;
    fechaResolucion?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.SolicitudesCountOrderByAggregateInput;
    _avg?: Prisma.SolicitudesAvgOrderByAggregateInput;
    _max?: Prisma.SolicitudesMaxOrderByAggregateInput;
    _min?: Prisma.SolicitudesMinOrderByAggregateInput;
    _sum?: Prisma.SolicitudesSumOrderByAggregateInput;
};
export type SolicitudesScalarWhereWithAggregatesInput = {
    AND?: Prisma.SolicitudesScalarWhereWithAggregatesInput | Prisma.SolicitudesScalarWhereWithAggregatesInput[];
    OR?: Prisma.SolicitudesScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SolicitudesScalarWhereWithAggregatesInput | Prisma.SolicitudesScalarWhereWithAggregatesInput[];
    solicitudId?: Prisma.BigIntWithAggregatesFilter<"Solicitudes"> | bigint | number;
    clienteId?: Prisma.BigIntNullableWithAggregatesFilter<"Solicitudes"> | bigint | number | null;
    tipoSolicitud?: Prisma.StringWithAggregatesFilter<"Solicitudes"> | string;
    estado?: Prisma.StringNullableWithAggregatesFilter<"Solicitudes"> | string | null;
    fechaSolicitud?: Prisma.DateTimeWithAggregatesFilter<"Solicitudes"> | Date | string;
    fechaResolucion?: Prisma.DateTimeNullableWithAggregatesFilter<"Solicitudes"> | Date | string | null;
};
export type SolicitudesCreateInput = {
    solicitudId?: bigint | number;
    tipoSolicitud: string;
    estado?: string | null;
    fechaSolicitud: Date | string;
    fechaResolucion?: Date | string | null;
    cliente?: Prisma.ClientesCreateNestedOneWithoutSolicitudesInput;
};
export type SolicitudesUncheckedCreateInput = {
    solicitudId?: bigint | number;
    clienteId?: bigint | number | null;
    tipoSolicitud: string;
    estado?: string | null;
    fechaSolicitud: Date | string;
    fechaResolucion?: Date | string | null;
};
export type SolicitudesUpdateInput = {
    solicitudId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    tipoSolicitud?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaSolicitud?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaResolucion?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    cliente?: Prisma.ClientesUpdateOneWithoutSolicitudesNestedInput;
};
export type SolicitudesUncheckedUpdateInput = {
    solicitudId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    tipoSolicitud?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaSolicitud?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaResolucion?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SolicitudesCreateManyInput = {
    solicitudId?: bigint | number;
    clienteId?: bigint | number | null;
    tipoSolicitud: string;
    estado?: string | null;
    fechaSolicitud: Date | string;
    fechaResolucion?: Date | string | null;
};
export type SolicitudesUpdateManyMutationInput = {
    solicitudId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    tipoSolicitud?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaSolicitud?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaResolucion?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SolicitudesUncheckedUpdateManyInput = {
    solicitudId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clienteId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    tipoSolicitud?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaSolicitud?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaResolucion?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SolicitudesListRelationFilter = {
    every?: Prisma.SolicitudesWhereInput;
    some?: Prisma.SolicitudesWhereInput;
    none?: Prisma.SolicitudesWhereInput;
};
export type SolicitudesOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SolicitudesCountOrderByAggregateInput = {
    solicitudId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    tipoSolicitud?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    fechaSolicitud?: Prisma.SortOrder;
    fechaResolucion?: Prisma.SortOrder;
};
export type SolicitudesAvgOrderByAggregateInput = {
    solicitudId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
};
export type SolicitudesMaxOrderByAggregateInput = {
    solicitudId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    tipoSolicitud?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    fechaSolicitud?: Prisma.SortOrder;
    fechaResolucion?: Prisma.SortOrder;
};
export type SolicitudesMinOrderByAggregateInput = {
    solicitudId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
    tipoSolicitud?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    fechaSolicitud?: Prisma.SortOrder;
    fechaResolucion?: Prisma.SortOrder;
};
export type SolicitudesSumOrderByAggregateInput = {
    solicitudId?: Prisma.SortOrder;
    clienteId?: Prisma.SortOrder;
};
export type SolicitudesCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.SolicitudesCreateWithoutClienteInput, Prisma.SolicitudesUncheckedCreateWithoutClienteInput> | Prisma.SolicitudesCreateWithoutClienteInput[] | Prisma.SolicitudesUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.SolicitudesCreateOrConnectWithoutClienteInput | Prisma.SolicitudesCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.SolicitudesCreateManyClienteInputEnvelope;
    connect?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
};
export type SolicitudesUncheckedCreateNestedManyWithoutClienteInput = {
    create?: Prisma.XOR<Prisma.SolicitudesCreateWithoutClienteInput, Prisma.SolicitudesUncheckedCreateWithoutClienteInput> | Prisma.SolicitudesCreateWithoutClienteInput[] | Prisma.SolicitudesUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.SolicitudesCreateOrConnectWithoutClienteInput | Prisma.SolicitudesCreateOrConnectWithoutClienteInput[];
    createMany?: Prisma.SolicitudesCreateManyClienteInputEnvelope;
    connect?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
};
export type SolicitudesUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.SolicitudesCreateWithoutClienteInput, Prisma.SolicitudesUncheckedCreateWithoutClienteInput> | Prisma.SolicitudesCreateWithoutClienteInput[] | Prisma.SolicitudesUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.SolicitudesCreateOrConnectWithoutClienteInput | Prisma.SolicitudesCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.SolicitudesUpsertWithWhereUniqueWithoutClienteInput | Prisma.SolicitudesUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.SolicitudesCreateManyClienteInputEnvelope;
    set?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
    disconnect?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
    delete?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
    connect?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
    update?: Prisma.SolicitudesUpdateWithWhereUniqueWithoutClienteInput | Prisma.SolicitudesUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.SolicitudesUpdateManyWithWhereWithoutClienteInput | Prisma.SolicitudesUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.SolicitudesScalarWhereInput | Prisma.SolicitudesScalarWhereInput[];
};
export type SolicitudesUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: Prisma.XOR<Prisma.SolicitudesCreateWithoutClienteInput, Prisma.SolicitudesUncheckedCreateWithoutClienteInput> | Prisma.SolicitudesCreateWithoutClienteInput[] | Prisma.SolicitudesUncheckedCreateWithoutClienteInput[];
    connectOrCreate?: Prisma.SolicitudesCreateOrConnectWithoutClienteInput | Prisma.SolicitudesCreateOrConnectWithoutClienteInput[];
    upsert?: Prisma.SolicitudesUpsertWithWhereUniqueWithoutClienteInput | Prisma.SolicitudesUpsertWithWhereUniqueWithoutClienteInput[];
    createMany?: Prisma.SolicitudesCreateManyClienteInputEnvelope;
    set?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
    disconnect?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
    delete?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
    connect?: Prisma.SolicitudesWhereUniqueInput | Prisma.SolicitudesWhereUniqueInput[];
    update?: Prisma.SolicitudesUpdateWithWhereUniqueWithoutClienteInput | Prisma.SolicitudesUpdateWithWhereUniqueWithoutClienteInput[];
    updateMany?: Prisma.SolicitudesUpdateManyWithWhereWithoutClienteInput | Prisma.SolicitudesUpdateManyWithWhereWithoutClienteInput[];
    deleteMany?: Prisma.SolicitudesScalarWhereInput | Prisma.SolicitudesScalarWhereInput[];
};
export type SolicitudesCreateWithoutClienteInput = {
    solicitudId?: bigint | number;
    tipoSolicitud: string;
    estado?: string | null;
    fechaSolicitud: Date | string;
    fechaResolucion?: Date | string | null;
};
export type SolicitudesUncheckedCreateWithoutClienteInput = {
    solicitudId?: bigint | number;
    tipoSolicitud: string;
    estado?: string | null;
    fechaSolicitud: Date | string;
    fechaResolucion?: Date | string | null;
};
export type SolicitudesCreateOrConnectWithoutClienteInput = {
    where: Prisma.SolicitudesWhereUniqueInput;
    create: Prisma.XOR<Prisma.SolicitudesCreateWithoutClienteInput, Prisma.SolicitudesUncheckedCreateWithoutClienteInput>;
};
export type SolicitudesCreateManyClienteInputEnvelope = {
    data: Prisma.SolicitudesCreateManyClienteInput | Prisma.SolicitudesCreateManyClienteInput[];
    skipDuplicates?: boolean;
};
export type SolicitudesUpsertWithWhereUniqueWithoutClienteInput = {
    where: Prisma.SolicitudesWhereUniqueInput;
    update: Prisma.XOR<Prisma.SolicitudesUpdateWithoutClienteInput, Prisma.SolicitudesUncheckedUpdateWithoutClienteInput>;
    create: Prisma.XOR<Prisma.SolicitudesCreateWithoutClienteInput, Prisma.SolicitudesUncheckedCreateWithoutClienteInput>;
};
export type SolicitudesUpdateWithWhereUniqueWithoutClienteInput = {
    where: Prisma.SolicitudesWhereUniqueInput;
    data: Prisma.XOR<Prisma.SolicitudesUpdateWithoutClienteInput, Prisma.SolicitudesUncheckedUpdateWithoutClienteInput>;
};
export type SolicitudesUpdateManyWithWhereWithoutClienteInput = {
    where: Prisma.SolicitudesScalarWhereInput;
    data: Prisma.XOR<Prisma.SolicitudesUpdateManyMutationInput, Prisma.SolicitudesUncheckedUpdateManyWithoutClienteInput>;
};
export type SolicitudesScalarWhereInput = {
    AND?: Prisma.SolicitudesScalarWhereInput | Prisma.SolicitudesScalarWhereInput[];
    OR?: Prisma.SolicitudesScalarWhereInput[];
    NOT?: Prisma.SolicitudesScalarWhereInput | Prisma.SolicitudesScalarWhereInput[];
    solicitudId?: Prisma.BigIntFilter<"Solicitudes"> | bigint | number;
    clienteId?: Prisma.BigIntNullableFilter<"Solicitudes"> | bigint | number | null;
    tipoSolicitud?: Prisma.StringFilter<"Solicitudes"> | string;
    estado?: Prisma.StringNullableFilter<"Solicitudes"> | string | null;
    fechaSolicitud?: Prisma.DateTimeFilter<"Solicitudes"> | Date | string;
    fechaResolucion?: Prisma.DateTimeNullableFilter<"Solicitudes"> | Date | string | null;
};
export type SolicitudesCreateManyClienteInput = {
    solicitudId?: bigint | number;
    tipoSolicitud: string;
    estado?: string | null;
    fechaSolicitud: Date | string;
    fechaResolucion?: Date | string | null;
};
export type SolicitudesUpdateWithoutClienteInput = {
    solicitudId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    tipoSolicitud?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaSolicitud?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaResolucion?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SolicitudesUncheckedUpdateWithoutClienteInput = {
    solicitudId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    tipoSolicitud?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaSolicitud?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaResolucion?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SolicitudesUncheckedUpdateManyWithoutClienteInput = {
    solicitudId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    tipoSolicitud?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaSolicitud?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    fechaResolucion?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SolicitudesSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    solicitudId?: boolean;
    clienteId?: boolean;
    tipoSolicitud?: boolean;
    estado?: boolean;
    fechaSolicitud?: boolean;
    fechaResolucion?: boolean;
    cliente?: boolean | Prisma.Solicitudes$clienteArgs<ExtArgs>;
}, ExtArgs["result"]["solicitudes"]>;
export type SolicitudesSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    solicitudId?: boolean;
    clienteId?: boolean;
    tipoSolicitud?: boolean;
    estado?: boolean;
    fechaSolicitud?: boolean;
    fechaResolucion?: boolean;
    cliente?: boolean | Prisma.Solicitudes$clienteArgs<ExtArgs>;
}, ExtArgs["result"]["solicitudes"]>;
export type SolicitudesSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    solicitudId?: boolean;
    clienteId?: boolean;
    tipoSolicitud?: boolean;
    estado?: boolean;
    fechaSolicitud?: boolean;
    fechaResolucion?: boolean;
    cliente?: boolean | Prisma.Solicitudes$clienteArgs<ExtArgs>;
}, ExtArgs["result"]["solicitudes"]>;
export type SolicitudesSelectScalar = {
    solicitudId?: boolean;
    clienteId?: boolean;
    tipoSolicitud?: boolean;
    estado?: boolean;
    fechaSolicitud?: boolean;
    fechaResolucion?: boolean;
};
export type SolicitudesOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"solicitudId" | "clienteId" | "tipoSolicitud" | "estado" | "fechaSolicitud" | "fechaResolucion", ExtArgs["result"]["solicitudes"]>;
export type SolicitudesInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Solicitudes$clienteArgs<ExtArgs>;
};
export type SolicitudesIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Solicitudes$clienteArgs<ExtArgs>;
};
export type SolicitudesIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cliente?: boolean | Prisma.Solicitudes$clienteArgs<ExtArgs>;
};
export type $SolicitudesPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Solicitudes";
    objects: {
        cliente: Prisma.$ClientesPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        solicitudId: bigint;
        clienteId: bigint | null;
        tipoSolicitud: string;
        estado: string | null;
        fechaSolicitud: Date;
        fechaResolucion: Date | null;
    }, ExtArgs["result"]["solicitudes"]>;
    composites: {};
};
export type SolicitudesGetPayload<S extends boolean | null | undefined | SolicitudesDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload, S>;
export type SolicitudesCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SolicitudesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SolicitudesCountAggregateInputType | true;
};
export interface SolicitudesDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Solicitudes'];
        meta: {
            name: 'Solicitudes';
        };
    };
    findUnique<T extends SolicitudesFindUniqueArgs>(args: Prisma.SelectSubset<T, SolicitudesFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SolicitudesClient<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SolicitudesFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SolicitudesFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SolicitudesClient<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SolicitudesFindFirstArgs>(args?: Prisma.SelectSubset<T, SolicitudesFindFirstArgs<ExtArgs>>): Prisma.Prisma__SolicitudesClient<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SolicitudesFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SolicitudesFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SolicitudesClient<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SolicitudesFindManyArgs>(args?: Prisma.SelectSubset<T, SolicitudesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SolicitudesCreateArgs>(args: Prisma.SelectSubset<T, SolicitudesCreateArgs<ExtArgs>>): Prisma.Prisma__SolicitudesClient<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SolicitudesCreateManyArgs>(args?: Prisma.SelectSubset<T, SolicitudesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SolicitudesCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SolicitudesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SolicitudesDeleteArgs>(args: Prisma.SelectSubset<T, SolicitudesDeleteArgs<ExtArgs>>): Prisma.Prisma__SolicitudesClient<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SolicitudesUpdateArgs>(args: Prisma.SelectSubset<T, SolicitudesUpdateArgs<ExtArgs>>): Prisma.Prisma__SolicitudesClient<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SolicitudesDeleteManyArgs>(args?: Prisma.SelectSubset<T, SolicitudesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SolicitudesUpdateManyArgs>(args: Prisma.SelectSubset<T, SolicitudesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SolicitudesUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SolicitudesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SolicitudesUpsertArgs>(args: Prisma.SelectSubset<T, SolicitudesUpsertArgs<ExtArgs>>): Prisma.Prisma__SolicitudesClient<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SolicitudesCountArgs>(args?: Prisma.Subset<T, SolicitudesCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SolicitudesCountAggregateOutputType> : number>;
    aggregate<T extends SolicitudesAggregateArgs>(args: Prisma.Subset<T, SolicitudesAggregateArgs>): Prisma.PrismaPromise<GetSolicitudesAggregateType<T>>;
    groupBy<T extends SolicitudesGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SolicitudesGroupByArgs['orderBy'];
    } : {
        orderBy?: SolicitudesGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SolicitudesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSolicitudesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SolicitudesFieldRefs;
}
export interface Prisma__SolicitudesClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    cliente<T extends Prisma.Solicitudes$clienteArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Solicitudes$clienteArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SolicitudesFieldRefs {
    readonly solicitudId: Prisma.FieldRef<"Solicitudes", 'BigInt'>;
    readonly clienteId: Prisma.FieldRef<"Solicitudes", 'BigInt'>;
    readonly tipoSolicitud: Prisma.FieldRef<"Solicitudes", 'String'>;
    readonly estado: Prisma.FieldRef<"Solicitudes", 'String'>;
    readonly fechaSolicitud: Prisma.FieldRef<"Solicitudes", 'DateTime'>;
    readonly fechaResolucion: Prisma.FieldRef<"Solicitudes", 'DateTime'>;
}
export type SolicitudesFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    where: Prisma.SolicitudesWhereUniqueInput;
};
export type SolicitudesFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    where: Prisma.SolicitudesWhereUniqueInput;
};
export type SolicitudesFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    where?: Prisma.SolicitudesWhereInput;
    orderBy?: Prisma.SolicitudesOrderByWithRelationInput | Prisma.SolicitudesOrderByWithRelationInput[];
    cursor?: Prisma.SolicitudesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SolicitudesScalarFieldEnum | Prisma.SolicitudesScalarFieldEnum[];
};
export type SolicitudesFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    where?: Prisma.SolicitudesWhereInput;
    orderBy?: Prisma.SolicitudesOrderByWithRelationInput | Prisma.SolicitudesOrderByWithRelationInput[];
    cursor?: Prisma.SolicitudesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SolicitudesScalarFieldEnum | Prisma.SolicitudesScalarFieldEnum[];
};
export type SolicitudesFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    where?: Prisma.SolicitudesWhereInput;
    orderBy?: Prisma.SolicitudesOrderByWithRelationInput | Prisma.SolicitudesOrderByWithRelationInput[];
    cursor?: Prisma.SolicitudesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SolicitudesScalarFieldEnum | Prisma.SolicitudesScalarFieldEnum[];
};
export type SolicitudesCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SolicitudesCreateInput, Prisma.SolicitudesUncheckedCreateInput>;
};
export type SolicitudesCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SolicitudesCreateManyInput | Prisma.SolicitudesCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SolicitudesCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    data: Prisma.SolicitudesCreateManyInput | Prisma.SolicitudesCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SolicitudesIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SolicitudesUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SolicitudesUpdateInput, Prisma.SolicitudesUncheckedUpdateInput>;
    where: Prisma.SolicitudesWhereUniqueInput;
};
export type SolicitudesUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SolicitudesUpdateManyMutationInput, Prisma.SolicitudesUncheckedUpdateManyInput>;
    where?: Prisma.SolicitudesWhereInput;
    limit?: number;
};
export type SolicitudesUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SolicitudesUpdateManyMutationInput, Prisma.SolicitudesUncheckedUpdateManyInput>;
    where?: Prisma.SolicitudesWhereInput;
    limit?: number;
    include?: Prisma.SolicitudesIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SolicitudesUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    where: Prisma.SolicitudesWhereUniqueInput;
    create: Prisma.XOR<Prisma.SolicitudesCreateInput, Prisma.SolicitudesUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SolicitudesUpdateInput, Prisma.SolicitudesUncheckedUpdateInput>;
};
export type SolicitudesDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
    where: Prisma.SolicitudesWhereUniqueInput;
};
export type SolicitudesDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SolicitudesWhereInput;
    limit?: number;
};
export type Solicitudes$clienteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where?: Prisma.ClientesWhereInput;
};
export type SolicitudesDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudesSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudesOmit<ExtArgs> | null;
    include?: Prisma.SolicitudesInclude<ExtArgs> | null;
};
export {};
