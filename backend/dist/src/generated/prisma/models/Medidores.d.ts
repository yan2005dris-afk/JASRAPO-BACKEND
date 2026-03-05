import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MedidoresModel = runtime.Types.Result.DefaultSelection<Prisma.$MedidoresPayload>;
export type AggregateMedidores = {
    _count: MedidoresCountAggregateOutputType | null;
    _avg: MedidoresAvgAggregateOutputType | null;
    _sum: MedidoresSumAggregateOutputType | null;
    _min: MedidoresMinAggregateOutputType | null;
    _max: MedidoresMaxAggregateOutputType | null;
};
export type MedidoresAvgAggregateOutputType = {
    medidorId: number | null;
};
export type MedidoresSumAggregateOutputType = {
    medidorId: bigint | null;
};
export type MedidoresMinAggregateOutputType = {
    medidorId: bigint | null;
    codigo: string | null;
    estado: string | null;
    createdAt: Date | null;
};
export type MedidoresMaxAggregateOutputType = {
    medidorId: bigint | null;
    codigo: string | null;
    estado: string | null;
    createdAt: Date | null;
};
export type MedidoresCountAggregateOutputType = {
    medidorId: number;
    codigo: number;
    estado: number;
    createdAt: number;
    _all: number;
};
export type MedidoresAvgAggregateInputType = {
    medidorId?: true;
};
export type MedidoresSumAggregateInputType = {
    medidorId?: true;
};
export type MedidoresMinAggregateInputType = {
    medidorId?: true;
    codigo?: true;
    estado?: true;
    createdAt?: true;
};
export type MedidoresMaxAggregateInputType = {
    medidorId?: true;
    codigo?: true;
    estado?: true;
    createdAt?: true;
};
export type MedidoresCountAggregateInputType = {
    medidorId?: true;
    codigo?: true;
    estado?: true;
    createdAt?: true;
    _all?: true;
};
export type MedidoresAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MedidoresWhereInput;
    orderBy?: Prisma.MedidoresOrderByWithRelationInput | Prisma.MedidoresOrderByWithRelationInput[];
    cursor?: Prisma.MedidoresWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MedidoresCountAggregateInputType;
    _avg?: MedidoresAvgAggregateInputType;
    _sum?: MedidoresSumAggregateInputType;
    _min?: MedidoresMinAggregateInputType;
    _max?: MedidoresMaxAggregateInputType;
};
export type GetMedidoresAggregateType<T extends MedidoresAggregateArgs> = {
    [P in keyof T & keyof AggregateMedidores]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMedidores[P]> : Prisma.GetScalarType<T[P], AggregateMedidores[P]>;
};
export type MedidoresGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MedidoresWhereInput;
    orderBy?: Prisma.MedidoresOrderByWithAggregationInput | Prisma.MedidoresOrderByWithAggregationInput[];
    by: Prisma.MedidoresScalarFieldEnum[] | Prisma.MedidoresScalarFieldEnum;
    having?: Prisma.MedidoresScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MedidoresCountAggregateInputType | true;
    _avg?: MedidoresAvgAggregateInputType;
    _sum?: MedidoresSumAggregateInputType;
    _min?: MedidoresMinAggregateInputType;
    _max?: MedidoresMaxAggregateInputType;
};
export type MedidoresGroupByOutputType = {
    medidorId: bigint;
    codigo: string;
    estado: string;
    createdAt: Date;
    _count: MedidoresCountAggregateOutputType | null;
    _avg: MedidoresAvgAggregateOutputType | null;
    _sum: MedidoresSumAggregateOutputType | null;
    _min: MedidoresMinAggregateOutputType | null;
    _max: MedidoresMaxAggregateOutputType | null;
};
type GetMedidoresGroupByPayload<T extends MedidoresGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MedidoresGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MedidoresGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MedidoresGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MedidoresGroupByOutputType[P]>;
}>>;
export type MedidoresWhereInput = {
    AND?: Prisma.MedidoresWhereInput | Prisma.MedidoresWhereInput[];
    OR?: Prisma.MedidoresWhereInput[];
    NOT?: Prisma.MedidoresWhereInput | Prisma.MedidoresWhereInput[];
    medidorId?: Prisma.BigIntFilter<"Medidores"> | bigint | number;
    codigo?: Prisma.StringFilter<"Medidores"> | string;
    estado?: Prisma.StringFilter<"Medidores"> | string;
    createdAt?: Prisma.DateTimeFilter<"Medidores"> | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresListRelationFilter;
};
export type MedidoresOrderByWithRelationInput = {
    medidorId?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    clientesMedidores?: Prisma.ClientesMedidoresOrderByRelationAggregateInput;
};
export type MedidoresWhereUniqueInput = Prisma.AtLeast<{
    medidorId?: bigint | number;
    codigo?: string;
    AND?: Prisma.MedidoresWhereInput | Prisma.MedidoresWhereInput[];
    OR?: Prisma.MedidoresWhereInput[];
    NOT?: Prisma.MedidoresWhereInput | Prisma.MedidoresWhereInput[];
    estado?: Prisma.StringFilter<"Medidores"> | string;
    createdAt?: Prisma.DateTimeFilter<"Medidores"> | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresListRelationFilter;
}, "medidorId" | "codigo">;
export type MedidoresOrderByWithAggregationInput = {
    medidorId?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.MedidoresCountOrderByAggregateInput;
    _avg?: Prisma.MedidoresAvgOrderByAggregateInput;
    _max?: Prisma.MedidoresMaxOrderByAggregateInput;
    _min?: Prisma.MedidoresMinOrderByAggregateInput;
    _sum?: Prisma.MedidoresSumOrderByAggregateInput;
};
export type MedidoresScalarWhereWithAggregatesInput = {
    AND?: Prisma.MedidoresScalarWhereWithAggregatesInput | Prisma.MedidoresScalarWhereWithAggregatesInput[];
    OR?: Prisma.MedidoresScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MedidoresScalarWhereWithAggregatesInput | Prisma.MedidoresScalarWhereWithAggregatesInput[];
    medidorId?: Prisma.BigIntWithAggregatesFilter<"Medidores"> | bigint | number;
    codigo?: Prisma.StringWithAggregatesFilter<"Medidores"> | string;
    estado?: Prisma.StringWithAggregatesFilter<"Medidores"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Medidores"> | Date | string;
};
export type MedidoresCreateInput = {
    medidorId?: bigint | number;
    codigo: string;
    estado: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresCreateNestedManyWithoutMedidorInput;
};
export type MedidoresUncheckedCreateInput = {
    medidorId?: bigint | number;
    codigo: string;
    estado: string;
    createdAt?: Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedCreateNestedManyWithoutMedidorInput;
};
export type MedidoresUpdateInput = {
    medidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUpdateManyWithoutMedidorNestedInput;
};
export type MedidoresUncheckedUpdateInput = {
    medidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientesMedidores?: Prisma.ClientesMedidoresUncheckedUpdateManyWithoutMedidorNestedInput;
};
export type MedidoresCreateManyInput = {
    medidorId?: bigint | number;
    codigo: string;
    estado: string;
    createdAt?: Date | string;
};
export type MedidoresUpdateManyMutationInput = {
    medidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MedidoresUncheckedUpdateManyInput = {
    medidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MedidoresNullableScalarRelationFilter = {
    is?: Prisma.MedidoresWhereInput | null;
    isNot?: Prisma.MedidoresWhereInput | null;
};
export type MedidoresCountOrderByAggregateInput = {
    medidorId?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MedidoresAvgOrderByAggregateInput = {
    medidorId?: Prisma.SortOrder;
};
export type MedidoresMaxOrderByAggregateInput = {
    medidorId?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MedidoresMinOrderByAggregateInput = {
    medidorId?: Prisma.SortOrder;
    codigo?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MedidoresSumOrderByAggregateInput = {
    medidorId?: Prisma.SortOrder;
};
export type MedidoresCreateNestedOneWithoutClientesMedidoresInput = {
    create?: Prisma.XOR<Prisma.MedidoresCreateWithoutClientesMedidoresInput, Prisma.MedidoresUncheckedCreateWithoutClientesMedidoresInput>;
    connectOrCreate?: Prisma.MedidoresCreateOrConnectWithoutClientesMedidoresInput;
    connect?: Prisma.MedidoresWhereUniqueInput;
};
export type MedidoresUpdateOneWithoutClientesMedidoresNestedInput = {
    create?: Prisma.XOR<Prisma.MedidoresCreateWithoutClientesMedidoresInput, Prisma.MedidoresUncheckedCreateWithoutClientesMedidoresInput>;
    connectOrCreate?: Prisma.MedidoresCreateOrConnectWithoutClientesMedidoresInput;
    upsert?: Prisma.MedidoresUpsertWithoutClientesMedidoresInput;
    disconnect?: Prisma.MedidoresWhereInput | boolean;
    delete?: Prisma.MedidoresWhereInput | boolean;
    connect?: Prisma.MedidoresWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MedidoresUpdateToOneWithWhereWithoutClientesMedidoresInput, Prisma.MedidoresUpdateWithoutClientesMedidoresInput>, Prisma.MedidoresUncheckedUpdateWithoutClientesMedidoresInput>;
};
export type MedidoresCreateWithoutClientesMedidoresInput = {
    medidorId?: bigint | number;
    codigo: string;
    estado: string;
    createdAt?: Date | string;
};
export type MedidoresUncheckedCreateWithoutClientesMedidoresInput = {
    medidorId?: bigint | number;
    codigo: string;
    estado: string;
    createdAt?: Date | string;
};
export type MedidoresCreateOrConnectWithoutClientesMedidoresInput = {
    where: Prisma.MedidoresWhereUniqueInput;
    create: Prisma.XOR<Prisma.MedidoresCreateWithoutClientesMedidoresInput, Prisma.MedidoresUncheckedCreateWithoutClientesMedidoresInput>;
};
export type MedidoresUpsertWithoutClientesMedidoresInput = {
    update: Prisma.XOR<Prisma.MedidoresUpdateWithoutClientesMedidoresInput, Prisma.MedidoresUncheckedUpdateWithoutClientesMedidoresInput>;
    create: Prisma.XOR<Prisma.MedidoresCreateWithoutClientesMedidoresInput, Prisma.MedidoresUncheckedCreateWithoutClientesMedidoresInput>;
    where?: Prisma.MedidoresWhereInput;
};
export type MedidoresUpdateToOneWithWhereWithoutClientesMedidoresInput = {
    where?: Prisma.MedidoresWhereInput;
    data: Prisma.XOR<Prisma.MedidoresUpdateWithoutClientesMedidoresInput, Prisma.MedidoresUncheckedUpdateWithoutClientesMedidoresInput>;
};
export type MedidoresUpdateWithoutClientesMedidoresInput = {
    medidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MedidoresUncheckedUpdateWithoutClientesMedidoresInput = {
    medidorId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    codigo?: Prisma.StringFieldUpdateOperationsInput | string;
    estado?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MedidoresCountOutputType = {
    clientesMedidores: number;
};
export type MedidoresCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientesMedidores?: boolean | MedidoresCountOutputTypeCountClientesMedidoresArgs;
};
export type MedidoresCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresCountOutputTypeSelect<ExtArgs> | null;
};
export type MedidoresCountOutputTypeCountClientesMedidoresArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesMedidoresWhereInput;
};
export type MedidoresSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    medidorId?: boolean;
    codigo?: boolean;
    estado?: boolean;
    createdAt?: boolean;
    clientesMedidores?: boolean | Prisma.Medidores$clientesMedidoresArgs<ExtArgs>;
    _count?: boolean | Prisma.MedidoresCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["medidores"]>;
export type MedidoresSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    medidorId?: boolean;
    codigo?: boolean;
    estado?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["medidores"]>;
export type MedidoresSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    medidorId?: boolean;
    codigo?: boolean;
    estado?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["medidores"]>;
export type MedidoresSelectScalar = {
    medidorId?: boolean;
    codigo?: boolean;
    estado?: boolean;
    createdAt?: boolean;
};
export type MedidoresOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"medidorId" | "codigo" | "estado" | "createdAt", ExtArgs["result"]["medidores"]>;
export type MedidoresInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientesMedidores?: boolean | Prisma.Medidores$clientesMedidoresArgs<ExtArgs>;
    _count?: boolean | Prisma.MedidoresCountOutputTypeDefaultArgs<ExtArgs>;
};
export type MedidoresIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type MedidoresIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $MedidoresPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Medidores";
    objects: {
        clientesMedidores: Prisma.$ClientesMedidoresPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        medidorId: bigint;
        codigo: string;
        estado: string;
        createdAt: Date;
    }, ExtArgs["result"]["medidores"]>;
    composites: {};
};
export type MedidoresGetPayload<S extends boolean | null | undefined | MedidoresDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MedidoresPayload, S>;
export type MedidoresCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MedidoresFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MedidoresCountAggregateInputType | true;
};
export interface MedidoresDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Medidores'];
        meta: {
            name: 'Medidores';
        };
    };
    findUnique<T extends MedidoresFindUniqueArgs>(args: Prisma.SelectSubset<T, MedidoresFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MedidoresFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MedidoresFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MedidoresFindFirstArgs>(args?: Prisma.SelectSubset<T, MedidoresFindFirstArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MedidoresFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MedidoresFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MedidoresFindManyArgs>(args?: Prisma.SelectSubset<T, MedidoresFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MedidoresCreateArgs>(args: Prisma.SelectSubset<T, MedidoresCreateArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MedidoresCreateManyArgs>(args?: Prisma.SelectSubset<T, MedidoresCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MedidoresCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MedidoresCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MedidoresDeleteArgs>(args: Prisma.SelectSubset<T, MedidoresDeleteArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MedidoresUpdateArgs>(args: Prisma.SelectSubset<T, MedidoresUpdateArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MedidoresDeleteManyArgs>(args?: Prisma.SelectSubset<T, MedidoresDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MedidoresUpdateManyArgs>(args: Prisma.SelectSubset<T, MedidoresUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MedidoresUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MedidoresUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MedidoresUpsertArgs>(args: Prisma.SelectSubset<T, MedidoresUpsertArgs<ExtArgs>>): Prisma.Prisma__MedidoresClient<runtime.Types.Result.GetResult<Prisma.$MedidoresPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MedidoresCountArgs>(args?: Prisma.Subset<T, MedidoresCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MedidoresCountAggregateOutputType> : number>;
    aggregate<T extends MedidoresAggregateArgs>(args: Prisma.Subset<T, MedidoresAggregateArgs>): Prisma.PrismaPromise<GetMedidoresAggregateType<T>>;
    groupBy<T extends MedidoresGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MedidoresGroupByArgs['orderBy'];
    } : {
        orderBy?: MedidoresGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MedidoresGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMedidoresGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MedidoresFieldRefs;
}
export interface Prisma__MedidoresClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientesMedidores<T extends Prisma.Medidores$clientesMedidoresArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Medidores$clientesMedidoresArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesMedidoresPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MedidoresFieldRefs {
    readonly medidorId: Prisma.FieldRef<"Medidores", 'BigInt'>;
    readonly codigo: Prisma.FieldRef<"Medidores", 'String'>;
    readonly estado: Prisma.FieldRef<"Medidores", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Medidores", 'DateTime'>;
}
export type MedidoresFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    where: Prisma.MedidoresWhereUniqueInput;
};
export type MedidoresFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    where: Prisma.MedidoresWhereUniqueInput;
};
export type MedidoresFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    where?: Prisma.MedidoresWhereInput;
    orderBy?: Prisma.MedidoresOrderByWithRelationInput | Prisma.MedidoresOrderByWithRelationInput[];
    cursor?: Prisma.MedidoresWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MedidoresScalarFieldEnum | Prisma.MedidoresScalarFieldEnum[];
};
export type MedidoresFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    where?: Prisma.MedidoresWhereInput;
    orderBy?: Prisma.MedidoresOrderByWithRelationInput | Prisma.MedidoresOrderByWithRelationInput[];
    cursor?: Prisma.MedidoresWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MedidoresScalarFieldEnum | Prisma.MedidoresScalarFieldEnum[];
};
export type MedidoresFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    where?: Prisma.MedidoresWhereInput;
    orderBy?: Prisma.MedidoresOrderByWithRelationInput | Prisma.MedidoresOrderByWithRelationInput[];
    cursor?: Prisma.MedidoresWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MedidoresScalarFieldEnum | Prisma.MedidoresScalarFieldEnum[];
};
export type MedidoresCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MedidoresCreateInput, Prisma.MedidoresUncheckedCreateInput>;
};
export type MedidoresCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MedidoresCreateManyInput | Prisma.MedidoresCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MedidoresCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    data: Prisma.MedidoresCreateManyInput | Prisma.MedidoresCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MedidoresUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MedidoresUpdateInput, Prisma.MedidoresUncheckedUpdateInput>;
    where: Prisma.MedidoresWhereUniqueInput;
};
export type MedidoresUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MedidoresUpdateManyMutationInput, Prisma.MedidoresUncheckedUpdateManyInput>;
    where?: Prisma.MedidoresWhereInput;
    limit?: number;
};
export type MedidoresUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MedidoresUpdateManyMutationInput, Prisma.MedidoresUncheckedUpdateManyInput>;
    where?: Prisma.MedidoresWhereInput;
    limit?: number;
};
export type MedidoresUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    where: Prisma.MedidoresWhereUniqueInput;
    create: Prisma.XOR<Prisma.MedidoresCreateInput, Prisma.MedidoresUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MedidoresUpdateInput, Prisma.MedidoresUncheckedUpdateInput>;
};
export type MedidoresDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
    where: Prisma.MedidoresWhereUniqueInput;
};
export type MedidoresDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MedidoresWhereInput;
    limit?: number;
};
export type Medidores$clientesMedidoresArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MedidoresDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MedidoresSelect<ExtArgs> | null;
    omit?: Prisma.MedidoresOmit<ExtArgs> | null;
    include?: Prisma.MedidoresInclude<ExtArgs> | null;
};
export {};
