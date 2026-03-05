import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SessionsModel = runtime.Types.Result.DefaultSelection<Prisma.$SessionsPayload>;
export type AggregateSessions = {
    _count: SessionsCountAggregateOutputType | null;
    _avg: SessionsAvgAggregateOutputType | null;
    _sum: SessionsSumAggregateOutputType | null;
    _min: SessionsMinAggregateOutputType | null;
    _max: SessionsMaxAggregateOutputType | null;
};
export type SessionsAvgAggregateOutputType = {
    sessionsId: number | null;
    usersId: number | null;
};
export type SessionsSumAggregateOutputType = {
    sessionsId: number | null;
    usersId: number | null;
};
export type SessionsMinAggregateOutputType = {
    sessionsId: number | null;
    usersId: number | null;
    refreshToken: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    isRevoked: boolean | null;
    expiresAt: Date | null;
    createdAt: Date | null;
};
export type SessionsMaxAggregateOutputType = {
    sessionsId: number | null;
    usersId: number | null;
    refreshToken: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    isRevoked: boolean | null;
    expiresAt: Date | null;
    createdAt: Date | null;
};
export type SessionsCountAggregateOutputType = {
    sessionsId: number;
    usersId: number;
    refreshToken: number;
    ipAddress: number;
    userAgent: number;
    isRevoked: number;
    expiresAt: number;
    createdAt: number;
    _all: number;
};
export type SessionsAvgAggregateInputType = {
    sessionsId?: true;
    usersId?: true;
};
export type SessionsSumAggregateInputType = {
    sessionsId?: true;
    usersId?: true;
};
export type SessionsMinAggregateInputType = {
    sessionsId?: true;
    usersId?: true;
    refreshToken?: true;
    ipAddress?: true;
    userAgent?: true;
    isRevoked?: true;
    expiresAt?: true;
    createdAt?: true;
};
export type SessionsMaxAggregateInputType = {
    sessionsId?: true;
    usersId?: true;
    refreshToken?: true;
    ipAddress?: true;
    userAgent?: true;
    isRevoked?: true;
    expiresAt?: true;
    createdAt?: true;
};
export type SessionsCountAggregateInputType = {
    sessionsId?: true;
    usersId?: true;
    refreshToken?: true;
    ipAddress?: true;
    userAgent?: true;
    isRevoked?: true;
    expiresAt?: true;
    createdAt?: true;
    _all?: true;
};
export type SessionsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessionsWhereInput;
    orderBy?: Prisma.SessionsOrderByWithRelationInput | Prisma.SessionsOrderByWithRelationInput[];
    cursor?: Prisma.SessionsWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SessionsCountAggregateInputType;
    _avg?: SessionsAvgAggregateInputType;
    _sum?: SessionsSumAggregateInputType;
    _min?: SessionsMinAggregateInputType;
    _max?: SessionsMaxAggregateInputType;
};
export type GetSessionsAggregateType<T extends SessionsAggregateArgs> = {
    [P in keyof T & keyof AggregateSessions]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSessions[P]> : Prisma.GetScalarType<T[P], AggregateSessions[P]>;
};
export type SessionsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessionsWhereInput;
    orderBy?: Prisma.SessionsOrderByWithAggregationInput | Prisma.SessionsOrderByWithAggregationInput[];
    by: Prisma.SessionsScalarFieldEnum[] | Prisma.SessionsScalarFieldEnum;
    having?: Prisma.SessionsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SessionsCountAggregateInputType | true;
    _avg?: SessionsAvgAggregateInputType;
    _sum?: SessionsSumAggregateInputType;
    _min?: SessionsMinAggregateInputType;
    _max?: SessionsMaxAggregateInputType;
};
export type SessionsGroupByOutputType = {
    sessionsId: number;
    usersId: number;
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
    isRevoked: boolean;
    expiresAt: Date;
    createdAt: Date;
    _count: SessionsCountAggregateOutputType | null;
    _avg: SessionsAvgAggregateOutputType | null;
    _sum: SessionsSumAggregateOutputType | null;
    _min: SessionsMinAggregateOutputType | null;
    _max: SessionsMaxAggregateOutputType | null;
};
type GetSessionsGroupByPayload<T extends SessionsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SessionsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SessionsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SessionsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SessionsGroupByOutputType[P]>;
}>>;
export type SessionsWhereInput = {
    AND?: Prisma.SessionsWhereInput | Prisma.SessionsWhereInput[];
    OR?: Prisma.SessionsWhereInput[];
    NOT?: Prisma.SessionsWhereInput | Prisma.SessionsWhereInput[];
    sessionsId?: Prisma.IntFilter<"Sessions"> | number;
    usersId?: Prisma.IntFilter<"Sessions"> | number;
    refreshToken?: Prisma.StringFilter<"Sessions"> | string;
    ipAddress?: Prisma.StringFilter<"Sessions"> | string;
    userAgent?: Prisma.StringFilter<"Sessions"> | string;
    isRevoked?: Prisma.BoolFilter<"Sessions"> | boolean;
    expiresAt?: Prisma.DateTimeFilter<"Sessions"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"Sessions"> | Date | string;
    users?: Prisma.XOR<Prisma.UsersScalarRelationFilter, Prisma.UsersWhereInput>;
};
export type SessionsOrderByWithRelationInput = {
    sessionsId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    isRevoked?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    users?: Prisma.UsersOrderByWithRelationInput;
};
export type SessionsWhereUniqueInput = Prisma.AtLeast<{
    sessionsId?: number;
    AND?: Prisma.SessionsWhereInput | Prisma.SessionsWhereInput[];
    OR?: Prisma.SessionsWhereInput[];
    NOT?: Prisma.SessionsWhereInput | Prisma.SessionsWhereInput[];
    usersId?: Prisma.IntFilter<"Sessions"> | number;
    refreshToken?: Prisma.StringFilter<"Sessions"> | string;
    ipAddress?: Prisma.StringFilter<"Sessions"> | string;
    userAgent?: Prisma.StringFilter<"Sessions"> | string;
    isRevoked?: Prisma.BoolFilter<"Sessions"> | boolean;
    expiresAt?: Prisma.DateTimeFilter<"Sessions"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"Sessions"> | Date | string;
    users?: Prisma.XOR<Prisma.UsersScalarRelationFilter, Prisma.UsersWhereInput>;
}, "sessionsId">;
export type SessionsOrderByWithAggregationInput = {
    sessionsId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    isRevoked?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.SessionsCountOrderByAggregateInput;
    _avg?: Prisma.SessionsAvgOrderByAggregateInput;
    _max?: Prisma.SessionsMaxOrderByAggregateInput;
    _min?: Prisma.SessionsMinOrderByAggregateInput;
    _sum?: Prisma.SessionsSumOrderByAggregateInput;
};
export type SessionsScalarWhereWithAggregatesInput = {
    AND?: Prisma.SessionsScalarWhereWithAggregatesInput | Prisma.SessionsScalarWhereWithAggregatesInput[];
    OR?: Prisma.SessionsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SessionsScalarWhereWithAggregatesInput | Prisma.SessionsScalarWhereWithAggregatesInput[];
    sessionsId?: Prisma.IntWithAggregatesFilter<"Sessions"> | number;
    usersId?: Prisma.IntWithAggregatesFilter<"Sessions"> | number;
    refreshToken?: Prisma.StringWithAggregatesFilter<"Sessions"> | string;
    ipAddress?: Prisma.StringWithAggregatesFilter<"Sessions"> | string;
    userAgent?: Prisma.StringWithAggregatesFilter<"Sessions"> | string;
    isRevoked?: Prisma.BoolWithAggregatesFilter<"Sessions"> | boolean;
    expiresAt?: Prisma.DateTimeWithAggregatesFilter<"Sessions"> | Date | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Sessions"> | Date | string;
};
export type SessionsCreateInput = {
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
    isRevoked: boolean;
    expiresAt: Date | string;
    createdAt?: Date | string;
    users: Prisma.UsersCreateNestedOneWithoutSessionsInput;
};
export type SessionsUncheckedCreateInput = {
    sessionsId?: number;
    usersId: number;
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
    isRevoked: boolean;
    expiresAt: Date | string;
    createdAt?: Date | string;
};
export type SessionsUpdateInput = {
    refreshToken?: Prisma.StringFieldUpdateOperationsInput | string;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    isRevoked?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UsersUpdateOneRequiredWithoutSessionsNestedInput;
};
export type SessionsUncheckedUpdateInput = {
    sessionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    refreshToken?: Prisma.StringFieldUpdateOperationsInput | string;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    isRevoked?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionsCreateManyInput = {
    sessionsId?: number;
    usersId: number;
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
    isRevoked: boolean;
    expiresAt: Date | string;
    createdAt?: Date | string;
};
export type SessionsUpdateManyMutationInput = {
    refreshToken?: Prisma.StringFieldUpdateOperationsInput | string;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    isRevoked?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionsUncheckedUpdateManyInput = {
    sessionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
    refreshToken?: Prisma.StringFieldUpdateOperationsInput | string;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    isRevoked?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionsCountOrderByAggregateInput = {
    sessionsId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    isRevoked?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type SessionsAvgOrderByAggregateInput = {
    sessionsId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
};
export type SessionsMaxOrderByAggregateInput = {
    sessionsId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    isRevoked?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type SessionsMinOrderByAggregateInput = {
    sessionsId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    isRevoked?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type SessionsSumOrderByAggregateInput = {
    sessionsId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
};
export type SessionsListRelationFilter = {
    every?: Prisma.SessionsWhereInput;
    some?: Prisma.SessionsWhereInput;
    none?: Prisma.SessionsWhereInput;
};
export type SessionsOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SessionsCreateNestedManyWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.SessionsCreateWithoutUsersInput, Prisma.SessionsUncheckedCreateWithoutUsersInput> | Prisma.SessionsCreateWithoutUsersInput[] | Prisma.SessionsUncheckedCreateWithoutUsersInput[];
    connectOrCreate?: Prisma.SessionsCreateOrConnectWithoutUsersInput | Prisma.SessionsCreateOrConnectWithoutUsersInput[];
    createMany?: Prisma.SessionsCreateManyUsersInputEnvelope;
    connect?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
};
export type SessionsUncheckedCreateNestedManyWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.SessionsCreateWithoutUsersInput, Prisma.SessionsUncheckedCreateWithoutUsersInput> | Prisma.SessionsCreateWithoutUsersInput[] | Prisma.SessionsUncheckedCreateWithoutUsersInput[];
    connectOrCreate?: Prisma.SessionsCreateOrConnectWithoutUsersInput | Prisma.SessionsCreateOrConnectWithoutUsersInput[];
    createMany?: Prisma.SessionsCreateManyUsersInputEnvelope;
    connect?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
};
export type SessionsUpdateManyWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.SessionsCreateWithoutUsersInput, Prisma.SessionsUncheckedCreateWithoutUsersInput> | Prisma.SessionsCreateWithoutUsersInput[] | Prisma.SessionsUncheckedCreateWithoutUsersInput[];
    connectOrCreate?: Prisma.SessionsCreateOrConnectWithoutUsersInput | Prisma.SessionsCreateOrConnectWithoutUsersInput[];
    upsert?: Prisma.SessionsUpsertWithWhereUniqueWithoutUsersInput | Prisma.SessionsUpsertWithWhereUniqueWithoutUsersInput[];
    createMany?: Prisma.SessionsCreateManyUsersInputEnvelope;
    set?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
    disconnect?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
    delete?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
    connect?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
    update?: Prisma.SessionsUpdateWithWhereUniqueWithoutUsersInput | Prisma.SessionsUpdateWithWhereUniqueWithoutUsersInput[];
    updateMany?: Prisma.SessionsUpdateManyWithWhereWithoutUsersInput | Prisma.SessionsUpdateManyWithWhereWithoutUsersInput[];
    deleteMany?: Prisma.SessionsScalarWhereInput | Prisma.SessionsScalarWhereInput[];
};
export type SessionsUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.SessionsCreateWithoutUsersInput, Prisma.SessionsUncheckedCreateWithoutUsersInput> | Prisma.SessionsCreateWithoutUsersInput[] | Prisma.SessionsUncheckedCreateWithoutUsersInput[];
    connectOrCreate?: Prisma.SessionsCreateOrConnectWithoutUsersInput | Prisma.SessionsCreateOrConnectWithoutUsersInput[];
    upsert?: Prisma.SessionsUpsertWithWhereUniqueWithoutUsersInput | Prisma.SessionsUpsertWithWhereUniqueWithoutUsersInput[];
    createMany?: Prisma.SessionsCreateManyUsersInputEnvelope;
    set?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
    disconnect?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
    delete?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
    connect?: Prisma.SessionsWhereUniqueInput | Prisma.SessionsWhereUniqueInput[];
    update?: Prisma.SessionsUpdateWithWhereUniqueWithoutUsersInput | Prisma.SessionsUpdateWithWhereUniqueWithoutUsersInput[];
    updateMany?: Prisma.SessionsUpdateManyWithWhereWithoutUsersInput | Prisma.SessionsUpdateManyWithWhereWithoutUsersInput[];
    deleteMany?: Prisma.SessionsScalarWhereInput | Prisma.SessionsScalarWhereInput[];
};
export type SessionsCreateWithoutUsersInput = {
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
    isRevoked: boolean;
    expiresAt: Date | string;
    createdAt?: Date | string;
};
export type SessionsUncheckedCreateWithoutUsersInput = {
    sessionsId?: number;
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
    isRevoked: boolean;
    expiresAt: Date | string;
    createdAt?: Date | string;
};
export type SessionsCreateOrConnectWithoutUsersInput = {
    where: Prisma.SessionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessionsCreateWithoutUsersInput, Prisma.SessionsUncheckedCreateWithoutUsersInput>;
};
export type SessionsCreateManyUsersInputEnvelope = {
    data: Prisma.SessionsCreateManyUsersInput | Prisma.SessionsCreateManyUsersInput[];
    skipDuplicates?: boolean;
};
export type SessionsUpsertWithWhereUniqueWithoutUsersInput = {
    where: Prisma.SessionsWhereUniqueInput;
    update: Prisma.XOR<Prisma.SessionsUpdateWithoutUsersInput, Prisma.SessionsUncheckedUpdateWithoutUsersInput>;
    create: Prisma.XOR<Prisma.SessionsCreateWithoutUsersInput, Prisma.SessionsUncheckedCreateWithoutUsersInput>;
};
export type SessionsUpdateWithWhereUniqueWithoutUsersInput = {
    where: Prisma.SessionsWhereUniqueInput;
    data: Prisma.XOR<Prisma.SessionsUpdateWithoutUsersInput, Prisma.SessionsUncheckedUpdateWithoutUsersInput>;
};
export type SessionsUpdateManyWithWhereWithoutUsersInput = {
    where: Prisma.SessionsScalarWhereInput;
    data: Prisma.XOR<Prisma.SessionsUpdateManyMutationInput, Prisma.SessionsUncheckedUpdateManyWithoutUsersInput>;
};
export type SessionsScalarWhereInput = {
    AND?: Prisma.SessionsScalarWhereInput | Prisma.SessionsScalarWhereInput[];
    OR?: Prisma.SessionsScalarWhereInput[];
    NOT?: Prisma.SessionsScalarWhereInput | Prisma.SessionsScalarWhereInput[];
    sessionsId?: Prisma.IntFilter<"Sessions"> | number;
    usersId?: Prisma.IntFilter<"Sessions"> | number;
    refreshToken?: Prisma.StringFilter<"Sessions"> | string;
    ipAddress?: Prisma.StringFilter<"Sessions"> | string;
    userAgent?: Prisma.StringFilter<"Sessions"> | string;
    isRevoked?: Prisma.BoolFilter<"Sessions"> | boolean;
    expiresAt?: Prisma.DateTimeFilter<"Sessions"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"Sessions"> | Date | string;
};
export type SessionsCreateManyUsersInput = {
    sessionsId?: number;
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
    isRevoked: boolean;
    expiresAt: Date | string;
    createdAt?: Date | string;
};
export type SessionsUpdateWithoutUsersInput = {
    refreshToken?: Prisma.StringFieldUpdateOperationsInput | string;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    isRevoked?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionsUncheckedUpdateWithoutUsersInput = {
    sessionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    refreshToken?: Prisma.StringFieldUpdateOperationsInput | string;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    isRevoked?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionsUncheckedUpdateManyWithoutUsersInput = {
    sessionsId?: Prisma.IntFieldUpdateOperationsInput | number;
    refreshToken?: Prisma.StringFieldUpdateOperationsInput | string;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    isRevoked?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    sessionsId?: boolean;
    usersId?: boolean;
    refreshToken?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    isRevoked?: boolean;
    expiresAt?: boolean;
    createdAt?: boolean;
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["sessions"]>;
export type SessionsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    sessionsId?: boolean;
    usersId?: boolean;
    refreshToken?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    isRevoked?: boolean;
    expiresAt?: boolean;
    createdAt?: boolean;
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["sessions"]>;
export type SessionsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    sessionsId?: boolean;
    usersId?: boolean;
    refreshToken?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    isRevoked?: boolean;
    expiresAt?: boolean;
    createdAt?: boolean;
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["sessions"]>;
export type SessionsSelectScalar = {
    sessionsId?: boolean;
    usersId?: boolean;
    refreshToken?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    isRevoked?: boolean;
    expiresAt?: boolean;
    createdAt?: boolean;
};
export type SessionsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"sessionsId" | "usersId" | "refreshToken" | "ipAddress" | "userAgent" | "isRevoked" | "expiresAt" | "createdAt", ExtArgs["result"]["sessions"]>;
export type SessionsInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
};
export type SessionsIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
};
export type SessionsIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
};
export type $SessionsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Sessions";
    objects: {
        users: Prisma.$UsersPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        sessionsId: number;
        usersId: number;
        refreshToken: string;
        ipAddress: string;
        userAgent: string;
        isRevoked: boolean;
        expiresAt: Date;
        createdAt: Date;
    }, ExtArgs["result"]["sessions"]>;
    composites: {};
};
export type SessionsGetPayload<S extends boolean | null | undefined | SessionsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SessionsPayload, S>;
export type SessionsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SessionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SessionsCountAggregateInputType | true;
};
export interface SessionsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Sessions'];
        meta: {
            name: 'Sessions';
        };
    };
    findUnique<T extends SessionsFindUniqueArgs>(args: Prisma.SelectSubset<T, SessionsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SessionsClient<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SessionsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SessionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SessionsClient<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SessionsFindFirstArgs>(args?: Prisma.SelectSubset<T, SessionsFindFirstArgs<ExtArgs>>): Prisma.Prisma__SessionsClient<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SessionsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SessionsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SessionsClient<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SessionsFindManyArgs>(args?: Prisma.SelectSubset<T, SessionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SessionsCreateArgs>(args: Prisma.SelectSubset<T, SessionsCreateArgs<ExtArgs>>): Prisma.Prisma__SessionsClient<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SessionsCreateManyArgs>(args?: Prisma.SelectSubset<T, SessionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SessionsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SessionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SessionsDeleteArgs>(args: Prisma.SelectSubset<T, SessionsDeleteArgs<ExtArgs>>): Prisma.Prisma__SessionsClient<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SessionsUpdateArgs>(args: Prisma.SelectSubset<T, SessionsUpdateArgs<ExtArgs>>): Prisma.Prisma__SessionsClient<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SessionsDeleteManyArgs>(args?: Prisma.SelectSubset<T, SessionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SessionsUpdateManyArgs>(args: Prisma.SelectSubset<T, SessionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SessionsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SessionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SessionsUpsertArgs>(args: Prisma.SelectSubset<T, SessionsUpsertArgs<ExtArgs>>): Prisma.Prisma__SessionsClient<runtime.Types.Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SessionsCountArgs>(args?: Prisma.Subset<T, SessionsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SessionsCountAggregateOutputType> : number>;
    aggregate<T extends SessionsAggregateArgs>(args: Prisma.Subset<T, SessionsAggregateArgs>): Prisma.PrismaPromise<GetSessionsAggregateType<T>>;
    groupBy<T extends SessionsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SessionsGroupByArgs['orderBy'];
    } : {
        orderBy?: SessionsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SessionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SessionsFieldRefs;
}
export interface Prisma__SessionsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    users<T extends Prisma.UsersDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UsersDefaultArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SessionsFieldRefs {
    readonly sessionsId: Prisma.FieldRef<"Sessions", 'Int'>;
    readonly usersId: Prisma.FieldRef<"Sessions", 'Int'>;
    readonly refreshToken: Prisma.FieldRef<"Sessions", 'String'>;
    readonly ipAddress: Prisma.FieldRef<"Sessions", 'String'>;
    readonly userAgent: Prisma.FieldRef<"Sessions", 'String'>;
    readonly isRevoked: Prisma.FieldRef<"Sessions", 'Boolean'>;
    readonly expiresAt: Prisma.FieldRef<"Sessions", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Sessions", 'DateTime'>;
}
export type SessionsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    where: Prisma.SessionsWhereUniqueInput;
};
export type SessionsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    where: Prisma.SessionsWhereUniqueInput;
};
export type SessionsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    where?: Prisma.SessionsWhereInput;
    orderBy?: Prisma.SessionsOrderByWithRelationInput | Prisma.SessionsOrderByWithRelationInput[];
    cursor?: Prisma.SessionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessionsScalarFieldEnum | Prisma.SessionsScalarFieldEnum[];
};
export type SessionsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    where?: Prisma.SessionsWhereInput;
    orderBy?: Prisma.SessionsOrderByWithRelationInput | Prisma.SessionsOrderByWithRelationInput[];
    cursor?: Prisma.SessionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessionsScalarFieldEnum | Prisma.SessionsScalarFieldEnum[];
};
export type SessionsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    where?: Prisma.SessionsWhereInput;
    orderBy?: Prisma.SessionsOrderByWithRelationInput | Prisma.SessionsOrderByWithRelationInput[];
    cursor?: Prisma.SessionsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessionsScalarFieldEnum | Prisma.SessionsScalarFieldEnum[];
};
export type SessionsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SessionsCreateInput, Prisma.SessionsUncheckedCreateInput>;
};
export type SessionsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SessionsCreateManyInput | Prisma.SessionsCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SessionsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    data: Prisma.SessionsCreateManyInput | Prisma.SessionsCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SessionsIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SessionsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SessionsUpdateInput, Prisma.SessionsUncheckedUpdateInput>;
    where: Prisma.SessionsWhereUniqueInput;
};
export type SessionsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SessionsUpdateManyMutationInput, Prisma.SessionsUncheckedUpdateManyInput>;
    where?: Prisma.SessionsWhereInput;
    limit?: number;
};
export type SessionsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SessionsUpdateManyMutationInput, Prisma.SessionsUncheckedUpdateManyInput>;
    where?: Prisma.SessionsWhereInput;
    limit?: number;
    include?: Prisma.SessionsIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SessionsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    where: Prisma.SessionsWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessionsCreateInput, Prisma.SessionsUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SessionsUpdateInput, Prisma.SessionsUncheckedUpdateInput>;
};
export type SessionsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
    where: Prisma.SessionsWhereUniqueInput;
};
export type SessionsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessionsWhereInput;
    limit?: number;
};
export type SessionsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionsSelect<ExtArgs> | null;
    omit?: Prisma.SessionsOmit<ExtArgs> | null;
    include?: Prisma.SessionsInclude<ExtArgs> | null;
};
export {};
