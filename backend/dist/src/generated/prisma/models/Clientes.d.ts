import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClientesModel = runtime.Types.Result.DefaultSelection<Prisma.$ClientesPayload>;
export type AggregateClientes = {
    _count: ClientesCountAggregateOutputType | null;
    _avg: ClientesAvgAggregateOutputType | null;
    _sum: ClientesSumAggregateOutputType | null;
    _min: ClientesMinAggregateOutputType | null;
    _max: ClientesMaxAggregateOutputType | null;
};
export type ClientesAvgAggregateOutputType = {
    clienteId: number | null;
    comunidadId: number | null;
};
export type ClientesSumAggregateOutputType = {
    clienteId: bigint | null;
    comunidadId: bigint | null;
};
export type ClientesMinAggregateOutputType = {
    clienteId: bigint | null;
    comunidadId: bigint | null;
    nombre: string | null;
    createdAt: Date | null;
};
export type ClientesMaxAggregateOutputType = {
    clienteId: bigint | null;
    comunidadId: bigint | null;
    nombre: string | null;
    createdAt: Date | null;
};
export type ClientesCountAggregateOutputType = {
    clienteId: number;
    comunidadId: number;
    nombre: number;
    createdAt: number;
    _all: number;
};
export type ClientesAvgAggregateInputType = {
    clienteId?: true;
    comunidadId?: true;
};
export type ClientesSumAggregateInputType = {
    clienteId?: true;
    comunidadId?: true;
};
export type ClientesMinAggregateInputType = {
    clienteId?: true;
    comunidadId?: true;
    nombre?: true;
    createdAt?: true;
};
export type ClientesMaxAggregateInputType = {
    clienteId?: true;
    comunidadId?: true;
    nombre?: true;
    createdAt?: true;
};
export type ClientesCountAggregateInputType = {
    clienteId?: true;
    comunidadId?: true;
    nombre?: true;
    createdAt?: true;
    _all?: true;
};
export type ClientesAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesWhereInput;
    orderBy?: Prisma.ClientesOrderByWithRelationInput | Prisma.ClientesOrderByWithRelationInput[];
    cursor?: Prisma.ClientesWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClientesCountAggregateInputType;
    _avg?: ClientesAvgAggregateInputType;
    _sum?: ClientesSumAggregateInputType;
    _min?: ClientesMinAggregateInputType;
    _max?: ClientesMaxAggregateInputType;
};
export type GetClientesAggregateType<T extends ClientesAggregateArgs> = {
    [P in keyof T & keyof AggregateClientes]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClientes[P]> : Prisma.GetScalarType<T[P], AggregateClientes[P]>;
};
export type ClientesGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesWhereInput;
    orderBy?: Prisma.ClientesOrderByWithAggregationInput | Prisma.ClientesOrderByWithAggregationInput[];
    by: Prisma.ClientesScalarFieldEnum[] | Prisma.ClientesScalarFieldEnum;
    having?: Prisma.ClientesScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientesCountAggregateInputType | true;
    _avg?: ClientesAvgAggregateInputType;
    _sum?: ClientesSumAggregateInputType;
    _min?: ClientesMinAggregateInputType;
    _max?: ClientesMaxAggregateInputType;
};
export type ClientesGroupByOutputType = {
    clienteId: bigint;
    comunidadId: bigint | null;
    nombre: string;
    createdAt: Date;
    _count: ClientesCountAggregateOutputType | null;
    _avg: ClientesAvgAggregateOutputType | null;
    _sum: ClientesSumAggregateOutputType | null;
    _min: ClientesMinAggregateOutputType | null;
    _max: ClientesMaxAggregateOutputType | null;
};
type GetClientesGroupByPayload<T extends ClientesGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClientesGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClientesGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClientesGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClientesGroupByOutputType[P]>;
}>>;
export type ClientesWhereInput = {
    AND?: Prisma.ClientesWhereInput | Prisma.ClientesWhereInput[];
    OR?: Prisma.ClientesWhereInput[];
    NOT?: Prisma.ClientesWhereInput | Prisma.ClientesWhereInput[];
    clienteId?: Prisma.BigIntFilter<"Clientes"> | bigint | number;
    comunidadId?: Prisma.BigIntNullableFilter<"Clientes"> | bigint | number | null;
    nombre?: Prisma.StringFilter<"Clientes"> | string;
    createdAt?: Prisma.DateTimeFilter<"Clientes"> | Date | string;
    comunidad?: Prisma.XOR<Prisma.ComunidadesNullableScalarRelationFilter, Prisma.ComunidadesWhereInput> | null;
    clientesMedidores?: Prisma.ClientesMedidoresListRelationFilter;
    facturas?: Prisma.FacturasListRelationFilter;
    pagos?: Prisma.PagosListRelationFilter;
    convenios?: Prisma.ConveniosListRelationFilter;
    solicitudes?: Prisma.SolicitudesListRelationFilter;
};
export type ClientesOrderByWithRelationInput = {
    clienteId?: Prisma.SortOrder;
    comunidadId?: Prisma.SortOrderInput | Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    comunidad?: Prisma.ComunidadesOrderByWithRelationInput;
    clientesMedidores?: Prisma.ClientesMedidoresOrderByRelationAggregateInput;
    facturas?: Prisma.FacturasOrderByRelationAggregateInput;
    pagos?: Prisma.PagosOrderByRelationAggregateInput;
    convenios?: Prisma.ConveniosOrderByRelationAggregateInput;
    solicitudes?: Prisma.SolicitudesOrderByRelationAggregateInput;
};
export type ClientesWhereUniqueInput = Prisma.AtLeast<{
    clienteId?: bigint | number;
    AND?: Prisma.ClientesWhereInput | Prisma.ClientesWhereInput[];
    OR?: Prisma.ClientesWhereInput[];
    NOT?: Prisma.ClientesWhereInput | Prisma.ClientesWhereInput[];
    comunidadId?: Prisma.BigIntNullableFilter<"Clientes"> | bigint | number | null;
    nombre?: Prisma.StringFilter<"Clientes"> | string;
    createdAt?: Prisma.DateTimeFilter<"Clientes"> | Date | string;
    comunidad?: Prisma.XOR<Prisma.ComunidadesNullableScalarRelationFilter, Prisma.ComunidadesWhereInput> | null;
    clientesMedidores?: Prisma.ClientesMedidoresListRelationFilter;
    facturas?: Prisma.FacturasListRelationFilter;
    pagos?: Prisma.PagosListRelationFilter;
    convenios?: Prisma.ConveniosListRelationFilter;
    solicitudes?: Prisma.SolicitudesListRelationFilter;
}, "clienteId">;
export type ClientesOrderByWithAggregationInput = {
    clienteId?: Prisma.SortOrder;
    comunidadId?: Prisma.SortOrderInput | Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ClientesCountOrderByAggregateInput;
    _avg?: Prisma.ClientesAvgOrderByAggregateInput;
    _max?: Prisma.ClientesMaxOrderByAggregateInput;
    _min?: Prisma.ClientesMinOrderByAggregateInput;
    _sum?: Prisma.ClientesSumOrderByAggregateInput;
};
export type ClientesScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClientesScalarWhereWithAggregatesInput | Prisma.ClientesScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClientesScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClientesScalarWhereWithAggregatesInput | Prisma.ClientesScalarWhereWithAggregatesInput[];
    clienteId?: Prisma.BigIntWithAggregatesFilter<"Clientes"> | bigint | number;
    comunidadId?: Prisma.BigIntNullableWithAggregatesFilter<"Clientes"> | bigint | number | null;
    nombre?: Prisma.StringWithAggregatesFilter<"Clientes"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Clientes"> | Date | string;
};
export type ClientesCreateInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
    comunidad?: Prisma.ComunidadesCreateNestedOneWithoutClientesInput;
    clientesMedidores?: Prisma.ClientesMedidoresCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesCreateNestedManyWithoutClienteInput;
};
export type ClientesUncheckedCreateInput = {
    clienteId?: bigint | number;
    comunidadId?: bigint | number | null;
    nombre: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasUncheckedCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosUncheckedCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesUncheckedCreateNestedManyWithoutClienteInput;
};
export type ClientesUpdateInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    comunidad?: Prisma.ComunidadesUpdateOneWithoutClientesNestedInput;
    clientesMedidores?: Prisma.ClientesMedidoresUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUpdateManyWithoutClienteNestedInput;
};
export type ClientesUncheckedUpdateInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    comunidadId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUncheckedUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUncheckedUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUncheckedUpdateManyWithoutClienteNestedInput;
};
export type ClientesCreateManyInput = {
    clienteId?: bigint | number;
    comunidadId?: bigint | number | null;
    nombre: string;
    createdAt?: Date | string;
};
export type ClientesUpdateManyMutationInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClientesUncheckedUpdateManyInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    comunidadId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClientesCountOrderByAggregateInput = {
    clienteId?: Prisma.SortOrder;
    comunidadId?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ClientesAvgOrderByAggregateInput = {
    clienteId?: Prisma.SortOrder;
    comunidadId?: Prisma.SortOrder;
};
export type ClientesMaxOrderByAggregateInput = {
    clienteId?: Prisma.SortOrder;
    comunidadId?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ClientesMinOrderByAggregateInput = {
    clienteId?: Prisma.SortOrder;
    comunidadId?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ClientesSumOrderByAggregateInput = {
    clienteId?: Prisma.SortOrder;
    comunidadId?: Prisma.SortOrder;
};
export type ClientesNullableScalarRelationFilter = {
    is?: Prisma.ClientesWhereInput | null;
    isNot?: Prisma.ClientesWhereInput | null;
};
export type ClientesListRelationFilter = {
    every?: Prisma.ClientesWhereInput;
    some?: Prisma.ClientesWhereInput;
    none?: Prisma.ClientesWhereInput;
};
export type ClientesOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number;
    increment?: bigint | number;
    decrement?: bigint | number;
    multiply?: bigint | number;
    divide?: bigint | number;
};
export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null;
    increment?: bigint | number;
    decrement?: bigint | number;
    multiply?: bigint | number;
    divide?: bigint | number;
};
export type ClientesCreateNestedOneWithoutClientesMedidoresInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutClientesMedidoresInput, Prisma.ClientesUncheckedCreateWithoutClientesMedidoresInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutClientesMedidoresInput;
    connect?: Prisma.ClientesWhereUniqueInput;
};
export type ClientesUpdateOneWithoutClientesMedidoresNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutClientesMedidoresInput, Prisma.ClientesUncheckedCreateWithoutClientesMedidoresInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutClientesMedidoresInput;
    upsert?: Prisma.ClientesUpsertWithoutClientesMedidoresInput;
    disconnect?: Prisma.ClientesWhereInput | boolean;
    delete?: Prisma.ClientesWhereInput | boolean;
    connect?: Prisma.ClientesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientesUpdateToOneWithWhereWithoutClientesMedidoresInput, Prisma.ClientesUpdateWithoutClientesMedidoresInput>, Prisma.ClientesUncheckedUpdateWithoutClientesMedidoresInput>;
};
export type ClientesCreateNestedManyWithoutComunidadInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutComunidadInput, Prisma.ClientesUncheckedCreateWithoutComunidadInput> | Prisma.ClientesCreateWithoutComunidadInput[] | Prisma.ClientesUncheckedCreateWithoutComunidadInput[];
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutComunidadInput | Prisma.ClientesCreateOrConnectWithoutComunidadInput[];
    createMany?: Prisma.ClientesCreateManyComunidadInputEnvelope;
    connect?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
};
export type ClientesUncheckedCreateNestedManyWithoutComunidadInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutComunidadInput, Prisma.ClientesUncheckedCreateWithoutComunidadInput> | Prisma.ClientesCreateWithoutComunidadInput[] | Prisma.ClientesUncheckedCreateWithoutComunidadInput[];
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutComunidadInput | Prisma.ClientesCreateOrConnectWithoutComunidadInput[];
    createMany?: Prisma.ClientesCreateManyComunidadInputEnvelope;
    connect?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
};
export type ClientesUpdateManyWithoutComunidadNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutComunidadInput, Prisma.ClientesUncheckedCreateWithoutComunidadInput> | Prisma.ClientesCreateWithoutComunidadInput[] | Prisma.ClientesUncheckedCreateWithoutComunidadInput[];
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutComunidadInput | Prisma.ClientesCreateOrConnectWithoutComunidadInput[];
    upsert?: Prisma.ClientesUpsertWithWhereUniqueWithoutComunidadInput | Prisma.ClientesUpsertWithWhereUniqueWithoutComunidadInput[];
    createMany?: Prisma.ClientesCreateManyComunidadInputEnvelope;
    set?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
    disconnect?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
    delete?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
    connect?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
    update?: Prisma.ClientesUpdateWithWhereUniqueWithoutComunidadInput | Prisma.ClientesUpdateWithWhereUniqueWithoutComunidadInput[];
    updateMany?: Prisma.ClientesUpdateManyWithWhereWithoutComunidadInput | Prisma.ClientesUpdateManyWithWhereWithoutComunidadInput[];
    deleteMany?: Prisma.ClientesScalarWhereInput | Prisma.ClientesScalarWhereInput[];
};
export type ClientesUncheckedUpdateManyWithoutComunidadNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutComunidadInput, Prisma.ClientesUncheckedCreateWithoutComunidadInput> | Prisma.ClientesCreateWithoutComunidadInput[] | Prisma.ClientesUncheckedCreateWithoutComunidadInput[];
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutComunidadInput | Prisma.ClientesCreateOrConnectWithoutComunidadInput[];
    upsert?: Prisma.ClientesUpsertWithWhereUniqueWithoutComunidadInput | Prisma.ClientesUpsertWithWhereUniqueWithoutComunidadInput[];
    createMany?: Prisma.ClientesCreateManyComunidadInputEnvelope;
    set?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
    disconnect?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
    delete?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
    connect?: Prisma.ClientesWhereUniqueInput | Prisma.ClientesWhereUniqueInput[];
    update?: Prisma.ClientesUpdateWithWhereUniqueWithoutComunidadInput | Prisma.ClientesUpdateWithWhereUniqueWithoutComunidadInput[];
    updateMany?: Prisma.ClientesUpdateManyWithWhereWithoutComunidadInput | Prisma.ClientesUpdateManyWithWhereWithoutComunidadInput[];
    deleteMany?: Prisma.ClientesScalarWhereInput | Prisma.ClientesScalarWhereInput[];
};
export type ClientesCreateNestedOneWithoutConveniosInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutConveniosInput, Prisma.ClientesUncheckedCreateWithoutConveniosInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutConveniosInput;
    connect?: Prisma.ClientesWhereUniqueInput;
};
export type ClientesUpdateOneWithoutConveniosNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutConveniosInput, Prisma.ClientesUncheckedCreateWithoutConveniosInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutConveniosInput;
    upsert?: Prisma.ClientesUpsertWithoutConveniosInput;
    disconnect?: Prisma.ClientesWhereInput | boolean;
    delete?: Prisma.ClientesWhereInput | boolean;
    connect?: Prisma.ClientesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientesUpdateToOneWithWhereWithoutConveniosInput, Prisma.ClientesUpdateWithoutConveniosInput>, Prisma.ClientesUncheckedUpdateWithoutConveniosInput>;
};
export type ClientesCreateNestedOneWithoutFacturasInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutFacturasInput, Prisma.ClientesUncheckedCreateWithoutFacturasInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutFacturasInput;
    connect?: Prisma.ClientesWhereUniqueInput;
};
export type ClientesUpdateOneWithoutFacturasNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutFacturasInput, Prisma.ClientesUncheckedCreateWithoutFacturasInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutFacturasInput;
    upsert?: Prisma.ClientesUpsertWithoutFacturasInput;
    disconnect?: Prisma.ClientesWhereInput | boolean;
    delete?: Prisma.ClientesWhereInput | boolean;
    connect?: Prisma.ClientesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientesUpdateToOneWithWhereWithoutFacturasInput, Prisma.ClientesUpdateWithoutFacturasInput>, Prisma.ClientesUncheckedUpdateWithoutFacturasInput>;
};
export type ClientesCreateNestedOneWithoutPagosInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutPagosInput, Prisma.ClientesUncheckedCreateWithoutPagosInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutPagosInput;
    connect?: Prisma.ClientesWhereUniqueInput;
};
export type ClientesUpdateOneWithoutPagosNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutPagosInput, Prisma.ClientesUncheckedCreateWithoutPagosInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutPagosInput;
    upsert?: Prisma.ClientesUpsertWithoutPagosInput;
    disconnect?: Prisma.ClientesWhereInput | boolean;
    delete?: Prisma.ClientesWhereInput | boolean;
    connect?: Prisma.ClientesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientesUpdateToOneWithWhereWithoutPagosInput, Prisma.ClientesUpdateWithoutPagosInput>, Prisma.ClientesUncheckedUpdateWithoutPagosInput>;
};
export type ClientesCreateNestedOneWithoutSolicitudesInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutSolicitudesInput, Prisma.ClientesUncheckedCreateWithoutSolicitudesInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutSolicitudesInput;
    connect?: Prisma.ClientesWhereUniqueInput;
};
export type ClientesUpdateOneWithoutSolicitudesNestedInput = {
    create?: Prisma.XOR<Prisma.ClientesCreateWithoutSolicitudesInput, Prisma.ClientesUncheckedCreateWithoutSolicitudesInput>;
    connectOrCreate?: Prisma.ClientesCreateOrConnectWithoutSolicitudesInput;
    upsert?: Prisma.ClientesUpsertWithoutSolicitudesInput;
    disconnect?: Prisma.ClientesWhereInput | boolean;
    delete?: Prisma.ClientesWhereInput | boolean;
    connect?: Prisma.ClientesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientesUpdateToOneWithWhereWithoutSolicitudesInput, Prisma.ClientesUpdateWithoutSolicitudesInput>, Prisma.ClientesUncheckedUpdateWithoutSolicitudesInput>;
};
export type ClientesCreateWithoutClientesMedidoresInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
    comunidad?: Prisma.ComunidadesCreateNestedOneWithoutClientesInput;
    facturas?: Prisma.FacturasCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesCreateNestedManyWithoutClienteInput;
};
export type ClientesUncheckedCreateWithoutClientesMedidoresInput = {
    clienteId?: bigint | number;
    comunidadId?: bigint | number | null;
    nombre: string;
    createdAt?: Date | string;
    facturas?: Prisma.FacturasUncheckedCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosUncheckedCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesUncheckedCreateNestedManyWithoutClienteInput;
};
export type ClientesCreateOrConnectWithoutClientesMedidoresInput = {
    where: Prisma.ClientesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutClientesMedidoresInput, Prisma.ClientesUncheckedCreateWithoutClientesMedidoresInput>;
};
export type ClientesUpsertWithoutClientesMedidoresInput = {
    update: Prisma.XOR<Prisma.ClientesUpdateWithoutClientesMedidoresInput, Prisma.ClientesUncheckedUpdateWithoutClientesMedidoresInput>;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutClientesMedidoresInput, Prisma.ClientesUncheckedCreateWithoutClientesMedidoresInput>;
    where?: Prisma.ClientesWhereInput;
};
export type ClientesUpdateToOneWithWhereWithoutClientesMedidoresInput = {
    where?: Prisma.ClientesWhereInput;
    data: Prisma.XOR<Prisma.ClientesUpdateWithoutClientesMedidoresInput, Prisma.ClientesUncheckedUpdateWithoutClientesMedidoresInput>;
};
export type ClientesUpdateWithoutClientesMedidoresInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    comunidad?: Prisma.ComunidadesUpdateOneWithoutClientesNestedInput;
    facturas?: Prisma.FacturasUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUpdateManyWithoutClienteNestedInput;
};
export type ClientesUncheckedUpdateWithoutClientesMedidoresInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    comunidadId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    facturas?: Prisma.FacturasUncheckedUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUncheckedUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUncheckedUpdateManyWithoutClienteNestedInput;
};
export type ClientesCreateWithoutComunidadInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesCreateNestedManyWithoutClienteInput;
};
export type ClientesUncheckedCreateWithoutComunidadInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasUncheckedCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosUncheckedCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesUncheckedCreateNestedManyWithoutClienteInput;
};
export type ClientesCreateOrConnectWithoutComunidadInput = {
    where: Prisma.ClientesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutComunidadInput, Prisma.ClientesUncheckedCreateWithoutComunidadInput>;
};
export type ClientesCreateManyComunidadInputEnvelope = {
    data: Prisma.ClientesCreateManyComunidadInput | Prisma.ClientesCreateManyComunidadInput[];
    skipDuplicates?: boolean;
};
export type ClientesUpsertWithWhereUniqueWithoutComunidadInput = {
    where: Prisma.ClientesWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientesUpdateWithoutComunidadInput, Prisma.ClientesUncheckedUpdateWithoutComunidadInput>;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutComunidadInput, Prisma.ClientesUncheckedCreateWithoutComunidadInput>;
};
export type ClientesUpdateWithWhereUniqueWithoutComunidadInput = {
    where: Prisma.ClientesWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientesUpdateWithoutComunidadInput, Prisma.ClientesUncheckedUpdateWithoutComunidadInput>;
};
export type ClientesUpdateManyWithWhereWithoutComunidadInput = {
    where: Prisma.ClientesScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientesUpdateManyMutationInput, Prisma.ClientesUncheckedUpdateManyWithoutComunidadInput>;
};
export type ClientesScalarWhereInput = {
    AND?: Prisma.ClientesScalarWhereInput | Prisma.ClientesScalarWhereInput[];
    OR?: Prisma.ClientesScalarWhereInput[];
    NOT?: Prisma.ClientesScalarWhereInput | Prisma.ClientesScalarWhereInput[];
    clienteId?: Prisma.BigIntFilter<"Clientes"> | bigint | number;
    comunidadId?: Prisma.BigIntNullableFilter<"Clientes"> | bigint | number | null;
    nombre?: Prisma.StringFilter<"Clientes"> | string;
    createdAt?: Prisma.DateTimeFilter<"Clientes"> | Date | string;
};
export type ClientesCreateWithoutConveniosInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
    comunidad?: Prisma.ComunidadesCreateNestedOneWithoutClientesInput;
    clientesMedidores?: Prisma.ClientesMedidoresCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesCreateNestedManyWithoutClienteInput;
};
export type ClientesUncheckedCreateWithoutConveniosInput = {
    clienteId?: bigint | number;
    comunidadId?: bigint | number | null;
    nombre: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasUncheckedCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesUncheckedCreateNestedManyWithoutClienteInput;
};
export type ClientesCreateOrConnectWithoutConveniosInput = {
    where: Prisma.ClientesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutConveniosInput, Prisma.ClientesUncheckedCreateWithoutConveniosInput>;
};
export type ClientesUpsertWithoutConveniosInput = {
    update: Prisma.XOR<Prisma.ClientesUpdateWithoutConveniosInput, Prisma.ClientesUncheckedUpdateWithoutConveniosInput>;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutConveniosInput, Prisma.ClientesUncheckedCreateWithoutConveniosInput>;
    where?: Prisma.ClientesWhereInput;
};
export type ClientesUpdateToOneWithWhereWithoutConveniosInput = {
    where?: Prisma.ClientesWhereInput;
    data: Prisma.XOR<Prisma.ClientesUpdateWithoutConveniosInput, Prisma.ClientesUncheckedUpdateWithoutConveniosInput>;
};
export type ClientesUpdateWithoutConveniosInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    comunidad?: Prisma.ComunidadesUpdateOneWithoutClientesNestedInput;
    clientesMedidores?: Prisma.ClientesMedidoresUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUpdateManyWithoutClienteNestedInput;
};
export type ClientesUncheckedUpdateWithoutConveniosInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    comunidadId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUncheckedUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUncheckedUpdateManyWithoutClienteNestedInput;
};
export type ClientesCreateWithoutFacturasInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
    comunidad?: Prisma.ComunidadesCreateNestedOneWithoutClientesInput;
    clientesMedidores?: Prisma.ClientesMedidoresCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesCreateNestedManyWithoutClienteInput;
};
export type ClientesUncheckedCreateWithoutFacturasInput = {
    clienteId?: bigint | number;
    comunidadId?: bigint | number | null;
    nombre: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosUncheckedCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesUncheckedCreateNestedManyWithoutClienteInput;
};
export type ClientesCreateOrConnectWithoutFacturasInput = {
    where: Prisma.ClientesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutFacturasInput, Prisma.ClientesUncheckedCreateWithoutFacturasInput>;
};
export type ClientesUpsertWithoutFacturasInput = {
    update: Prisma.XOR<Prisma.ClientesUpdateWithoutFacturasInput, Prisma.ClientesUncheckedUpdateWithoutFacturasInput>;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutFacturasInput, Prisma.ClientesUncheckedCreateWithoutFacturasInput>;
    where?: Prisma.ClientesWhereInput;
};
export type ClientesUpdateToOneWithWhereWithoutFacturasInput = {
    where?: Prisma.ClientesWhereInput;
    data: Prisma.XOR<Prisma.ClientesUpdateWithoutFacturasInput, Prisma.ClientesUncheckedUpdateWithoutFacturasInput>;
};
export type ClientesUpdateWithoutFacturasInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    comunidad?: Prisma.ComunidadesUpdateOneWithoutClientesNestedInput;
    clientesMedidores?: Prisma.ClientesMedidoresUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUpdateManyWithoutClienteNestedInput;
};
export type ClientesUncheckedUpdateWithoutFacturasInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    comunidadId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUncheckedUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUncheckedUpdateManyWithoutClienteNestedInput;
};
export type ClientesCreateWithoutPagosInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
    comunidad?: Prisma.ComunidadesCreateNestedOneWithoutClientesInput;
    clientesMedidores?: Prisma.ClientesMedidoresCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesCreateNestedManyWithoutClienteInput;
};
export type ClientesUncheckedCreateWithoutPagosInput = {
    clienteId?: bigint | number;
    comunidadId?: bigint | number | null;
    nombre: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasUncheckedCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosUncheckedCreateNestedManyWithoutClienteInput;
    solicitudes?: Prisma.SolicitudesUncheckedCreateNestedManyWithoutClienteInput;
};
export type ClientesCreateOrConnectWithoutPagosInput = {
    where: Prisma.ClientesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutPagosInput, Prisma.ClientesUncheckedCreateWithoutPagosInput>;
};
export type ClientesUpsertWithoutPagosInput = {
    update: Prisma.XOR<Prisma.ClientesUpdateWithoutPagosInput, Prisma.ClientesUncheckedUpdateWithoutPagosInput>;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutPagosInput, Prisma.ClientesUncheckedCreateWithoutPagosInput>;
    where?: Prisma.ClientesWhereInput;
};
export type ClientesUpdateToOneWithWhereWithoutPagosInput = {
    where?: Prisma.ClientesWhereInput;
    data: Prisma.XOR<Prisma.ClientesUpdateWithoutPagosInput, Prisma.ClientesUncheckedUpdateWithoutPagosInput>;
};
export type ClientesUpdateWithoutPagosInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    comunidad?: Prisma.ComunidadesUpdateOneWithoutClientesNestedInput;
    clientesMedidores?: Prisma.ClientesMedidoresUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUpdateManyWithoutClienteNestedInput;
};
export type ClientesUncheckedUpdateWithoutPagosInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    comunidadId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUncheckedUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUncheckedUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUncheckedUpdateManyWithoutClienteNestedInput;
};
export type ClientesCreateWithoutSolicitudesInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
    comunidad?: Prisma.ComunidadesCreateNestedOneWithoutClientesInput;
    clientesMedidores?: Prisma.ClientesMedidoresCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosCreateNestedManyWithoutClienteInput;
};
export type ClientesUncheckedCreateWithoutSolicitudesInput = {
    clienteId?: bigint | number;
    comunidadId?: bigint | number | null;
    nombre: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedCreateNestedManyWithoutClienteInput;
    facturas?: Prisma.FacturasUncheckedCreateNestedManyWithoutClienteInput;
    pagos?: Prisma.PagosUncheckedCreateNestedManyWithoutClienteInput;
    convenios?: Prisma.ConveniosUncheckedCreateNestedManyWithoutClienteInput;
};
export type ClientesCreateOrConnectWithoutSolicitudesInput = {
    where: Prisma.ClientesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutSolicitudesInput, Prisma.ClientesUncheckedCreateWithoutSolicitudesInput>;
};
export type ClientesUpsertWithoutSolicitudesInput = {
    update: Prisma.XOR<Prisma.ClientesUpdateWithoutSolicitudesInput, Prisma.ClientesUncheckedUpdateWithoutSolicitudesInput>;
    create: Prisma.XOR<Prisma.ClientesCreateWithoutSolicitudesInput, Prisma.ClientesUncheckedCreateWithoutSolicitudesInput>;
    where?: Prisma.ClientesWhereInput;
};
export type ClientesUpdateToOneWithWhereWithoutSolicitudesInput = {
    where?: Prisma.ClientesWhereInput;
    data: Prisma.XOR<Prisma.ClientesUpdateWithoutSolicitudesInput, Prisma.ClientesUncheckedUpdateWithoutSolicitudesInput>;
};
export type ClientesUpdateWithoutSolicitudesInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    comunidad?: Prisma.ComunidadesUpdateOneWithoutClientesNestedInput;
    clientesMedidores?: Prisma.ClientesMedidoresUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUpdateManyWithoutClienteNestedInput;
};
export type ClientesUncheckedUpdateWithoutSolicitudesInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    comunidadId?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUncheckedUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUncheckedUpdateManyWithoutClienteNestedInput;
};
export type ClientesCreateManyComunidadInput = {
    clienteId?: bigint | number;
    nombre: string;
    createdAt?: Date | string;
};
export type ClientesUpdateWithoutComunidadInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUpdateManyWithoutClienteNestedInput;
};
export type ClientesUncheckedUpdateWithoutComunidadInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedUpdateManyWithoutClienteNestedInput;
    facturas?: Prisma.FacturasUncheckedUpdateManyWithoutClienteNestedInput;
    pagos?: Prisma.PagosUncheckedUpdateManyWithoutClienteNestedInput;
    convenios?: Prisma.ConveniosUncheckedUpdateManyWithoutClienteNestedInput;
    solicitudes?: Prisma.SolicitudesUncheckedUpdateManyWithoutClienteNestedInput;
};
export type ClientesUncheckedUpdateManyWithoutComunidadInput = {
    clienteId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClientesCountOutputType = {
    clientesMedidores: number;
    facturas: number;
    pagos: number;
    convenios: number;
    solicitudes: number;
};
export type ClientesCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientesMedidores?: boolean | ClientesCountOutputTypeCountClientesMedidoresArgs;
    facturas?: boolean | ClientesCountOutputTypeCountFacturasArgs;
    pagos?: boolean | ClientesCountOutputTypeCountPagosArgs;
    convenios?: boolean | ClientesCountOutputTypeCountConveniosArgs;
    solicitudes?: boolean | ClientesCountOutputTypeCountSolicitudesArgs;
};
export type ClientesCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesCountOutputTypeSelect<ExtArgs> | null;
};
export type ClientesCountOutputTypeCountClientesMedidoresArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesMedidoresWhereInput;
};
export type ClientesCountOutputTypeCountFacturasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FacturasWhereInput;
};
export type ClientesCountOutputTypeCountPagosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PagosWhereInput;
};
export type ClientesCountOutputTypeCountConveniosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConveniosWhereInput;
};
export type ClientesCountOutputTypeCountSolicitudesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SolicitudesWhereInput;
};
export type ClientesSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    clienteId?: boolean;
    comunidadId?: boolean;
    nombre?: boolean;
    createdAt?: boolean;
    comunidad?: boolean | Prisma.Clientes$comunidadArgs<ExtArgs>;
    clientesMedidores?: boolean | Prisma.Clientes$clientesMedidoresArgs<ExtArgs>;
    facturas?: boolean | Prisma.Clientes$facturasArgs<ExtArgs>;
    pagos?: boolean | Prisma.Clientes$pagosArgs<ExtArgs>;
    convenios?: boolean | Prisma.Clientes$conveniosArgs<ExtArgs>;
    solicitudes?: boolean | Prisma.Clientes$solicitudesArgs<ExtArgs>;
    _count?: boolean | Prisma.ClientesCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientes"]>;
export type ClientesSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    clienteId?: boolean;
    comunidadId?: boolean;
    nombre?: boolean;
    createdAt?: boolean;
    comunidad?: boolean | Prisma.Clientes$comunidadArgs<ExtArgs>;
}, ExtArgs["result"]["clientes"]>;
export type ClientesSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    clienteId?: boolean;
    comunidadId?: boolean;
    nombre?: boolean;
    createdAt?: boolean;
    comunidad?: boolean | Prisma.Clientes$comunidadArgs<ExtArgs>;
}, ExtArgs["result"]["clientes"]>;
export type ClientesSelectScalar = {
    clienteId?: boolean;
    comunidadId?: boolean;
    nombre?: boolean;
    createdAt?: boolean;
};
export type ClientesOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"clienteId" | "comunidadId" | "nombre" | "createdAt", ExtArgs["result"]["clientes"]>;
export type ClientesInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    comunidad?: boolean | Prisma.Clientes$comunidadArgs<ExtArgs>;
    clientesMedidores?: boolean | Prisma.Clientes$clientesMedidoresArgs<ExtArgs>;
    facturas?: boolean | Prisma.Clientes$facturasArgs<ExtArgs>;
    pagos?: boolean | Prisma.Clientes$pagosArgs<ExtArgs>;
    convenios?: boolean | Prisma.Clientes$conveniosArgs<ExtArgs>;
    solicitudes?: boolean | Prisma.Clientes$solicitudesArgs<ExtArgs>;
    _count?: boolean | Prisma.ClientesCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ClientesIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    comunidad?: boolean | Prisma.Clientes$comunidadArgs<ExtArgs>;
};
export type ClientesIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    comunidad?: boolean | Prisma.Clientes$comunidadArgs<ExtArgs>;
};
export type $ClientesPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Clientes";
    objects: {
        comunidad: Prisma.$ComunidadesPayload<ExtArgs> | null;
        clientesMedidores: Prisma.$ClientesMedidoresPayload<ExtArgs>[];
        facturas: Prisma.$FacturasPayload<ExtArgs>[];
        pagos: Prisma.$PagosPayload<ExtArgs>[];
        convenios: Prisma.$ConveniosPayload<ExtArgs>[];
        solicitudes: Prisma.$SolicitudesPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        clienteId: bigint;
        comunidadId: bigint | null;
        nombre: string;
        createdAt: Date;
    }, ExtArgs["result"]["clientes"]>;
    composites: {};
};
export type ClientesGetPayload<S extends boolean | null | undefined | ClientesDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClientesPayload, S>;
export type ClientesCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClientesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientesCountAggregateInputType | true;
};
export interface ClientesDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Clientes'];
        meta: {
            name: 'Clientes';
        };
    };
    findUnique<T extends ClientesFindUniqueArgs>(args: Prisma.SelectSubset<T, ClientesFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClientesFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClientesFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClientesFindFirstArgs>(args?: Prisma.SelectSubset<T, ClientesFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClientesFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClientesFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClientesFindManyArgs>(args?: Prisma.SelectSubset<T, ClientesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClientesCreateArgs>(args: Prisma.SelectSubset<T, ClientesCreateArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClientesCreateManyArgs>(args?: Prisma.SelectSubset<T, ClientesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClientesCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClientesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClientesDeleteArgs>(args: Prisma.SelectSubset<T, ClientesDeleteArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClientesUpdateArgs>(args: Prisma.SelectSubset<T, ClientesUpdateArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClientesDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClientesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClientesUpdateManyArgs>(args: Prisma.SelectSubset<T, ClientesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClientesUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClientesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClientesUpsertArgs>(args: Prisma.SelectSubset<T, ClientesUpsertArgs<ExtArgs>>): Prisma.Prisma__ClientesClient<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClientesCountArgs>(args?: Prisma.Subset<T, ClientesCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClientesCountAggregateOutputType> : number>;
    aggregate<T extends ClientesAggregateArgs>(args: Prisma.Subset<T, ClientesAggregateArgs>): Prisma.PrismaPromise<GetClientesAggregateType<T>>;
    groupBy<T extends ClientesGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClientesGroupByArgs['orderBy'];
    } : {
        orderBy?: ClientesGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClientesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClientesFieldRefs;
}
export interface Prisma__ClientesClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    comunidad<T extends Prisma.Clientes$comunidadArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Clientes$comunidadArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    clientesMedidores<T extends Prisma.Clientes$clientesMedidoresArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Clientes$clientesMedidoresArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    facturas<T extends Prisma.Clientes$facturasArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Clientes$facturasArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FacturasPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    pagos<T extends Prisma.Clientes$pagosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Clientes$pagosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PagosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    convenios<T extends Prisma.Clientes$conveniosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Clientes$conveniosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConveniosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    solicitudes<T extends Prisma.Clientes$solicitudesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Clientes$solicitudesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SolicitudesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClientesFieldRefs {
    readonly clienteId: Prisma.FieldRef<"Clientes", 'BigInt'>;
    readonly comunidadId: Prisma.FieldRef<"Clientes", 'BigInt'>;
    readonly nombre: Prisma.FieldRef<"Clientes", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Clientes", 'DateTime'>;
}
export type ClientesFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where: Prisma.ClientesWhereUniqueInput;
};
export type ClientesFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where: Prisma.ClientesWhereUniqueInput;
};
export type ClientesFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where?: Prisma.ClientesWhereInput;
    orderBy?: Prisma.ClientesOrderByWithRelationInput | Prisma.ClientesOrderByWithRelationInput[];
    cursor?: Prisma.ClientesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientesScalarFieldEnum | Prisma.ClientesScalarFieldEnum[];
};
export type ClientesFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where?: Prisma.ClientesWhereInput;
    orderBy?: Prisma.ClientesOrderByWithRelationInput | Prisma.ClientesOrderByWithRelationInput[];
    cursor?: Prisma.ClientesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientesScalarFieldEnum | Prisma.ClientesScalarFieldEnum[];
};
export type ClientesFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where?: Prisma.ClientesWhereInput;
    orderBy?: Prisma.ClientesOrderByWithRelationInput | Prisma.ClientesOrderByWithRelationInput[];
    cursor?: Prisma.ClientesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientesScalarFieldEnum | Prisma.ClientesScalarFieldEnum[];
};
export type ClientesCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientesCreateInput, Prisma.ClientesUncheckedCreateInput>;
};
export type ClientesCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClientesCreateManyInput | Prisma.ClientesCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClientesCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    data: Prisma.ClientesCreateManyInput | Prisma.ClientesCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClientesIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClientesUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientesUpdateInput, Prisma.ClientesUncheckedUpdateInput>;
    where: Prisma.ClientesWhereUniqueInput;
};
export type ClientesUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClientesUpdateManyMutationInput, Prisma.ClientesUncheckedUpdateManyInput>;
    where?: Prisma.ClientesWhereInput;
    limit?: number;
};
export type ClientesUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientesUpdateManyMutationInput, Prisma.ClientesUncheckedUpdateManyInput>;
    where?: Prisma.ClientesWhereInput;
    limit?: number;
    include?: Prisma.ClientesIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClientesUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where: Prisma.ClientesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientesCreateInput, Prisma.ClientesUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClientesUpdateInput, Prisma.ClientesUncheckedUpdateInput>;
};
export type ClientesDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
    where: Prisma.ClientesWhereUniqueInput;
};
export type ClientesDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesWhereInput;
    limit?: number;
};
export type Clientes$comunidadArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    where?: Prisma.ComunidadesWhereInput;
};
export type Clientes$clientesMedidoresArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Clientes$facturasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Clientes$pagosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Clientes$conveniosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Clientes$solicitudesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientesDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientesSelect<ExtArgs> | null;
    omit?: Prisma.ClientesOmit<ExtArgs> | null;
    include?: Prisma.ClientesInclude<ExtArgs> | null;
};
export {};
