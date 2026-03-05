import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ComunidadesModel = runtime.Types.Result.DefaultSelection<Prisma.$ComunidadesPayload>;
export type AggregateComunidades = {
    _count: ComunidadesCountAggregateOutputType | null;
    _avg: ComunidadesAvgAggregateOutputType | null;
    _sum: ComunidadesSumAggregateOutputType | null;
    _min: ComunidadesMinAggregateOutputType | null;
    _max: ComunidadesMaxAggregateOutputType | null;
};
export type ComunidadesAvgAggregateOutputType = {
    comunidadId: number | null;
};
export type ComunidadesSumAggregateOutputType = {
    comunidadId: bigint | null;
};
export type ComunidadesMinAggregateOutputType = {
    comunidadId: bigint | null;
    nombre: string | null;
};
export type ComunidadesMaxAggregateOutputType = {
    comunidadId: bigint | null;
    nombre: string | null;
};
export type ComunidadesCountAggregateOutputType = {
    comunidadId: number;
    nombre: number;
    _all: number;
};
export type ComunidadesAvgAggregateInputType = {
    comunidadId?: true;
};
export type ComunidadesSumAggregateInputType = {
    comunidadId?: true;
};
export type ComunidadesMinAggregateInputType = {
    comunidadId?: true;
    nombre?: true;
};
export type ComunidadesMaxAggregateInputType = {
    comunidadId?: true;
    nombre?: true;
};
export type ComunidadesCountAggregateInputType = {
    comunidadId?: true;
    nombre?: true;
    _all?: true;
};
export type ComunidadesAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ComunidadesWhereInput;
    orderBy?: Prisma.ComunidadesOrderByWithRelationInput | Prisma.ComunidadesOrderByWithRelationInput[];
    cursor?: Prisma.ComunidadesWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ComunidadesCountAggregateInputType;
    _avg?: ComunidadesAvgAggregateInputType;
    _sum?: ComunidadesSumAggregateInputType;
    _min?: ComunidadesMinAggregateInputType;
    _max?: ComunidadesMaxAggregateInputType;
};
export type GetComunidadesAggregateType<T extends ComunidadesAggregateArgs> = {
    [P in keyof T & keyof AggregateComunidades]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateComunidades[P]> : Prisma.GetScalarType<T[P], AggregateComunidades[P]>;
};
export type ComunidadesGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ComunidadesWhereInput;
    orderBy?: Prisma.ComunidadesOrderByWithAggregationInput | Prisma.ComunidadesOrderByWithAggregationInput[];
    by: Prisma.ComunidadesScalarFieldEnum[] | Prisma.ComunidadesScalarFieldEnum;
    having?: Prisma.ComunidadesScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ComunidadesCountAggregateInputType | true;
    _avg?: ComunidadesAvgAggregateInputType;
    _sum?: ComunidadesSumAggregateInputType;
    _min?: ComunidadesMinAggregateInputType;
    _max?: ComunidadesMaxAggregateInputType;
};
export type ComunidadesGroupByOutputType = {
    comunidadId: bigint;
    nombre: string;
    _count: ComunidadesCountAggregateOutputType | null;
    _avg: ComunidadesAvgAggregateOutputType | null;
    _sum: ComunidadesSumAggregateOutputType | null;
    _min: ComunidadesMinAggregateOutputType | null;
    _max: ComunidadesMaxAggregateOutputType | null;
};
type GetComunidadesGroupByPayload<T extends ComunidadesGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ComunidadesGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ComunidadesGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ComunidadesGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ComunidadesGroupByOutputType[P]>;
}>>;
export type ComunidadesWhereInput = {
    AND?: Prisma.ComunidadesWhereInput | Prisma.ComunidadesWhereInput[];
    OR?: Prisma.ComunidadesWhereInput[];
    NOT?: Prisma.ComunidadesWhereInput | Prisma.ComunidadesWhereInput[];
    comunidadId?: Prisma.BigIntFilter<"Comunidades"> | bigint | number;
    nombre?: Prisma.StringFilter<"Comunidades"> | string;
    clientes?: Prisma.ClientesListRelationFilter;
};
export type ComunidadesOrderByWithRelationInput = {
    comunidadId?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    clientes?: Prisma.ClientesOrderByRelationAggregateInput;
};
export type ComunidadesWhereUniqueInput = Prisma.AtLeast<{
    comunidadId?: bigint | number;
    AND?: Prisma.ComunidadesWhereInput | Prisma.ComunidadesWhereInput[];
    OR?: Prisma.ComunidadesWhereInput[];
    NOT?: Prisma.ComunidadesWhereInput | Prisma.ComunidadesWhereInput[];
    nombre?: Prisma.StringFilter<"Comunidades"> | string;
    clientes?: Prisma.ClientesListRelationFilter;
}, "comunidadId">;
export type ComunidadesOrderByWithAggregationInput = {
    comunidadId?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    _count?: Prisma.ComunidadesCountOrderByAggregateInput;
    _avg?: Prisma.ComunidadesAvgOrderByAggregateInput;
    _max?: Prisma.ComunidadesMaxOrderByAggregateInput;
    _min?: Prisma.ComunidadesMinOrderByAggregateInput;
    _sum?: Prisma.ComunidadesSumOrderByAggregateInput;
};
export type ComunidadesScalarWhereWithAggregatesInput = {
    AND?: Prisma.ComunidadesScalarWhereWithAggregatesInput | Prisma.ComunidadesScalarWhereWithAggregatesInput[];
    OR?: Prisma.ComunidadesScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ComunidadesScalarWhereWithAggregatesInput | Prisma.ComunidadesScalarWhereWithAggregatesInput[];
    comunidadId?: Prisma.BigIntWithAggregatesFilter<"Comunidades"> | bigint | number;
    nombre?: Prisma.StringWithAggregatesFilter<"Comunidades"> | string;
};
export type ComunidadesCreateInput = {
    comunidadId?: bigint | number;
    nombre: string;
    clientes?: Prisma.ClientesCreateNestedManyWithoutComunidadInput;
};
export type ComunidadesUncheckedCreateInput = {
    comunidadId?: bigint | number;
    nombre: string;
    clientes?: Prisma.ClientesUncheckedCreateNestedManyWithoutComunidadInput;
};
export type ComunidadesUpdateInput = {
    comunidadId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    clientes?: Prisma.ClientesUpdateManyWithoutComunidadNestedInput;
};
export type ComunidadesUncheckedUpdateInput = {
    comunidadId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    clientes?: Prisma.ClientesUncheckedUpdateManyWithoutComunidadNestedInput;
};
export type ComunidadesCreateManyInput = {
    comunidadId?: bigint | number;
    nombre: string;
};
export type ComunidadesUpdateManyMutationInput = {
    comunidadId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ComunidadesUncheckedUpdateManyInput = {
    comunidadId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ComunidadesNullableScalarRelationFilter = {
    is?: Prisma.ComunidadesWhereInput | null;
    isNot?: Prisma.ComunidadesWhereInput | null;
};
export type ComunidadesCountOrderByAggregateInput = {
    comunidadId?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
};
export type ComunidadesAvgOrderByAggregateInput = {
    comunidadId?: Prisma.SortOrder;
};
export type ComunidadesMaxOrderByAggregateInput = {
    comunidadId?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
};
export type ComunidadesMinOrderByAggregateInput = {
    comunidadId?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
};
export type ComunidadesSumOrderByAggregateInput = {
    comunidadId?: Prisma.SortOrder;
};
export type ComunidadesCreateNestedOneWithoutClientesInput = {
    create?: Prisma.XOR<Prisma.ComunidadesCreateWithoutClientesInput, Prisma.ComunidadesUncheckedCreateWithoutClientesInput>;
    connectOrCreate?: Prisma.ComunidadesCreateOrConnectWithoutClientesInput;
    connect?: Prisma.ComunidadesWhereUniqueInput;
};
export type ComunidadesUpdateOneWithoutClientesNestedInput = {
    create?: Prisma.XOR<Prisma.ComunidadesCreateWithoutClientesInput, Prisma.ComunidadesUncheckedCreateWithoutClientesInput>;
    connectOrCreate?: Prisma.ComunidadesCreateOrConnectWithoutClientesInput;
    upsert?: Prisma.ComunidadesUpsertWithoutClientesInput;
    disconnect?: Prisma.ComunidadesWhereInput | boolean;
    delete?: Prisma.ComunidadesWhereInput | boolean;
    connect?: Prisma.ComunidadesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ComunidadesUpdateToOneWithWhereWithoutClientesInput, Prisma.ComunidadesUpdateWithoutClientesInput>, Prisma.ComunidadesUncheckedUpdateWithoutClientesInput>;
};
export type ComunidadesCreateWithoutClientesInput = {
    comunidadId?: bigint | number;
    nombre: string;
};
export type ComunidadesUncheckedCreateWithoutClientesInput = {
    comunidadId?: bigint | number;
    nombre: string;
};
export type ComunidadesCreateOrConnectWithoutClientesInput = {
    where: Prisma.ComunidadesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ComunidadesCreateWithoutClientesInput, Prisma.ComunidadesUncheckedCreateWithoutClientesInput>;
};
export type ComunidadesUpsertWithoutClientesInput = {
    update: Prisma.XOR<Prisma.ComunidadesUpdateWithoutClientesInput, Prisma.ComunidadesUncheckedUpdateWithoutClientesInput>;
    create: Prisma.XOR<Prisma.ComunidadesCreateWithoutClientesInput, Prisma.ComunidadesUncheckedCreateWithoutClientesInput>;
    where?: Prisma.ComunidadesWhereInput;
};
export type ComunidadesUpdateToOneWithWhereWithoutClientesInput = {
    where?: Prisma.ComunidadesWhereInput;
    data: Prisma.XOR<Prisma.ComunidadesUpdateWithoutClientesInput, Prisma.ComunidadesUncheckedUpdateWithoutClientesInput>;
};
export type ComunidadesUpdateWithoutClientesInput = {
    comunidadId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ComunidadesUncheckedUpdateWithoutClientesInput = {
    comunidadId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ComunidadesCountOutputType = {
    clientes: number;
};
export type ComunidadesCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientes?: boolean | ComunidadesCountOutputTypeCountClientesArgs;
};
export type ComunidadesCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesCountOutputTypeSelect<ExtArgs> | null;
};
export type ComunidadesCountOutputTypeCountClientesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientesWhereInput;
};
export type ComunidadesSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    comunidadId?: boolean;
    nombre?: boolean;
    clientes?: boolean | Prisma.Comunidades$clientesArgs<ExtArgs>;
    _count?: boolean | Prisma.ComunidadesCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["comunidades"]>;
export type ComunidadesSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    comunidadId?: boolean;
    nombre?: boolean;
}, ExtArgs["result"]["comunidades"]>;
export type ComunidadesSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    comunidadId?: boolean;
    nombre?: boolean;
}, ExtArgs["result"]["comunidades"]>;
export type ComunidadesSelectScalar = {
    comunidadId?: boolean;
    nombre?: boolean;
};
export type ComunidadesOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"comunidadId" | "nombre", ExtArgs["result"]["comunidades"]>;
export type ComunidadesInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientes?: boolean | Prisma.Comunidades$clientesArgs<ExtArgs>;
    _count?: boolean | Prisma.ComunidadesCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ComunidadesIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ComunidadesIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ComunidadesPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Comunidades";
    objects: {
        clientes: Prisma.$ClientesPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        comunidadId: bigint;
        nombre: string;
    }, ExtArgs["result"]["comunidades"]>;
    composites: {};
};
export type ComunidadesGetPayload<S extends boolean | null | undefined | ComunidadesDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload, S>;
export type ComunidadesCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ComunidadesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ComunidadesCountAggregateInputType | true;
};
export interface ComunidadesDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Comunidades'];
        meta: {
            name: 'Comunidades';
        };
    };
    findUnique<T extends ComunidadesFindUniqueArgs>(args: Prisma.SelectSubset<T, ComunidadesFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ComunidadesFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ComunidadesFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ComunidadesFindFirstArgs>(args?: Prisma.SelectSubset<T, ComunidadesFindFirstArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ComunidadesFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ComunidadesFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ComunidadesFindManyArgs>(args?: Prisma.SelectSubset<T, ComunidadesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ComunidadesCreateArgs>(args: Prisma.SelectSubset<T, ComunidadesCreateArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ComunidadesCreateManyArgs>(args?: Prisma.SelectSubset<T, ComunidadesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ComunidadesCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ComunidadesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ComunidadesDeleteArgs>(args: Prisma.SelectSubset<T, ComunidadesDeleteArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ComunidadesUpdateArgs>(args: Prisma.SelectSubset<T, ComunidadesUpdateArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ComunidadesDeleteManyArgs>(args?: Prisma.SelectSubset<T, ComunidadesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ComunidadesUpdateManyArgs>(args: Prisma.SelectSubset<T, ComunidadesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ComunidadesUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ComunidadesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ComunidadesUpsertArgs>(args: Prisma.SelectSubset<T, ComunidadesUpsertArgs<ExtArgs>>): Prisma.Prisma__ComunidadesClient<runtime.Types.Result.GetResult<Prisma.$ComunidadesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ComunidadesCountArgs>(args?: Prisma.Subset<T, ComunidadesCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ComunidadesCountAggregateOutputType> : number>;
    aggregate<T extends ComunidadesAggregateArgs>(args: Prisma.Subset<T, ComunidadesAggregateArgs>): Prisma.PrismaPromise<GetComunidadesAggregateType<T>>;
    groupBy<T extends ComunidadesGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ComunidadesGroupByArgs['orderBy'];
    } : {
        orderBy?: ComunidadesGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ComunidadesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetComunidadesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ComunidadesFieldRefs;
}
export interface Prisma__ComunidadesClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientes<T extends Prisma.Comunidades$clientesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Comunidades$clientesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ComunidadesFieldRefs {
    readonly comunidadId: Prisma.FieldRef<"Comunidades", 'BigInt'>;
    readonly nombre: Prisma.FieldRef<"Comunidades", 'String'>;
}
export type ComunidadesFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    where: Prisma.ComunidadesWhereUniqueInput;
};
export type ComunidadesFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    where: Prisma.ComunidadesWhereUniqueInput;
};
export type ComunidadesFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    where?: Prisma.ComunidadesWhereInput;
    orderBy?: Prisma.ComunidadesOrderByWithRelationInput | Prisma.ComunidadesOrderByWithRelationInput[];
    cursor?: Prisma.ComunidadesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ComunidadesScalarFieldEnum | Prisma.ComunidadesScalarFieldEnum[];
};
export type ComunidadesFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    where?: Prisma.ComunidadesWhereInput;
    orderBy?: Prisma.ComunidadesOrderByWithRelationInput | Prisma.ComunidadesOrderByWithRelationInput[];
    cursor?: Prisma.ComunidadesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ComunidadesScalarFieldEnum | Prisma.ComunidadesScalarFieldEnum[];
};
export type ComunidadesFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    where?: Prisma.ComunidadesWhereInput;
    orderBy?: Prisma.ComunidadesOrderByWithRelationInput | Prisma.ComunidadesOrderByWithRelationInput[];
    cursor?: Prisma.ComunidadesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ComunidadesScalarFieldEnum | Prisma.ComunidadesScalarFieldEnum[];
};
export type ComunidadesCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ComunidadesCreateInput, Prisma.ComunidadesUncheckedCreateInput>;
};
export type ComunidadesCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ComunidadesCreateManyInput | Prisma.ComunidadesCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ComunidadesCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    data: Prisma.ComunidadesCreateManyInput | Prisma.ComunidadesCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ComunidadesUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ComunidadesUpdateInput, Prisma.ComunidadesUncheckedUpdateInput>;
    where: Prisma.ComunidadesWhereUniqueInput;
};
export type ComunidadesUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ComunidadesUpdateManyMutationInput, Prisma.ComunidadesUncheckedUpdateManyInput>;
    where?: Prisma.ComunidadesWhereInput;
    limit?: number;
};
export type ComunidadesUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ComunidadesUpdateManyMutationInput, Prisma.ComunidadesUncheckedUpdateManyInput>;
    where?: Prisma.ComunidadesWhereInput;
    limit?: number;
};
export type ComunidadesUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    where: Prisma.ComunidadesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ComunidadesCreateInput, Prisma.ComunidadesUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ComunidadesUpdateInput, Prisma.ComunidadesUncheckedUpdateInput>;
};
export type ComunidadesDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
    where: Prisma.ComunidadesWhereUniqueInput;
};
export type ComunidadesDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ComunidadesWhereInput;
    limit?: number;
};
export type Comunidades$clientesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ComunidadesDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComunidadesSelect<ExtArgs> | null;
    omit?: Prisma.ComunidadesOmit<ExtArgs> | null;
    include?: Prisma.ComunidadesInclude<ExtArgs> | null;
};
export {};
