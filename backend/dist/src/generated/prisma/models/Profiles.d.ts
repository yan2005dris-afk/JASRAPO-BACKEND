import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ProfilesModel = runtime.Types.Result.DefaultSelection<Prisma.$ProfilesPayload>;
export type AggregateProfiles = {
    _count: ProfilesCountAggregateOutputType | null;
    _avg: ProfilesAvgAggregateOutputType | null;
    _sum: ProfilesSumAggregateOutputType | null;
    _min: ProfilesMinAggregateOutputType | null;
    _max: ProfilesMaxAggregateOutputType | null;
};
export type ProfilesAvgAggregateOutputType = {
    profileId: number | null;
    usersId: number | null;
};
export type ProfilesSumAggregateOutputType = {
    profileId: number | null;
    usersId: number | null;
};
export type ProfilesMinAggregateOutputType = {
    profileId: number | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    usersId: number | null;
};
export type ProfilesMaxAggregateOutputType = {
    profileId: number | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    usersId: number | null;
};
export type ProfilesCountAggregateOutputType = {
    profileId: number;
    firstName: number;
    lastName: number;
    phone: number;
    avatar: number;
    createdAt: number;
    updatedAt: number;
    usersId: number;
    _all: number;
};
export type ProfilesAvgAggregateInputType = {
    profileId?: true;
    usersId?: true;
};
export type ProfilesSumAggregateInputType = {
    profileId?: true;
    usersId?: true;
};
export type ProfilesMinAggregateInputType = {
    profileId?: true;
    firstName?: true;
    lastName?: true;
    phone?: true;
    createdAt?: true;
    updatedAt?: true;
    usersId?: true;
};
export type ProfilesMaxAggregateInputType = {
    profileId?: true;
    firstName?: true;
    lastName?: true;
    phone?: true;
    createdAt?: true;
    updatedAt?: true;
    usersId?: true;
};
export type ProfilesCountAggregateInputType = {
    profileId?: true;
    firstName?: true;
    lastName?: true;
    phone?: true;
    avatar?: true;
    createdAt?: true;
    updatedAt?: true;
    usersId?: true;
    _all?: true;
};
export type ProfilesAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProfilesWhereInput;
    orderBy?: Prisma.ProfilesOrderByWithRelationInput | Prisma.ProfilesOrderByWithRelationInput[];
    cursor?: Prisma.ProfilesWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ProfilesCountAggregateInputType;
    _avg?: ProfilesAvgAggregateInputType;
    _sum?: ProfilesSumAggregateInputType;
    _min?: ProfilesMinAggregateInputType;
    _max?: ProfilesMaxAggregateInputType;
};
export type GetProfilesAggregateType<T extends ProfilesAggregateArgs> = {
    [P in keyof T & keyof AggregateProfiles]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProfiles[P]> : Prisma.GetScalarType<T[P], AggregateProfiles[P]>;
};
export type ProfilesGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProfilesWhereInput;
    orderBy?: Prisma.ProfilesOrderByWithAggregationInput | Prisma.ProfilesOrderByWithAggregationInput[];
    by: Prisma.ProfilesScalarFieldEnum[] | Prisma.ProfilesScalarFieldEnum;
    having?: Prisma.ProfilesScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProfilesCountAggregateInputType | true;
    _avg?: ProfilesAvgAggregateInputType;
    _sum?: ProfilesSumAggregateInputType;
    _min?: ProfilesMinAggregateInputType;
    _max?: ProfilesMaxAggregateInputType;
};
export type ProfilesGroupByOutputType = {
    profileId: number;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar: runtime.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    usersId: number;
    _count: ProfilesCountAggregateOutputType | null;
    _avg: ProfilesAvgAggregateOutputType | null;
    _sum: ProfilesSumAggregateOutputType | null;
    _min: ProfilesMinAggregateOutputType | null;
    _max: ProfilesMaxAggregateOutputType | null;
};
type GetProfilesGroupByPayload<T extends ProfilesGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProfilesGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProfilesGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProfilesGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProfilesGroupByOutputType[P]>;
}>>;
export type ProfilesWhereInput = {
    AND?: Prisma.ProfilesWhereInput | Prisma.ProfilesWhereInput[];
    OR?: Prisma.ProfilesWhereInput[];
    NOT?: Prisma.ProfilesWhereInput | Prisma.ProfilesWhereInput[];
    profileId?: Prisma.IntFilter<"Profiles"> | number;
    firstName?: Prisma.StringNullableFilter<"Profiles"> | string | null;
    lastName?: Prisma.StringNullableFilter<"Profiles"> | string | null;
    phone?: Prisma.StringNullableFilter<"Profiles"> | string | null;
    avatar?: Prisma.JsonNullableFilter<"Profiles">;
    createdAt?: Prisma.DateTimeFilter<"Profiles"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Profiles"> | Date | string;
    usersId?: Prisma.IntFilter<"Profiles"> | number;
    user?: Prisma.XOR<Prisma.UsersScalarRelationFilter, Prisma.UsersWhereInput>;
};
export type ProfilesOrderByWithRelationInput = {
    profileId?: Prisma.SortOrder;
    firstName?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastName?: Prisma.SortOrderInput | Prisma.SortOrder;
    phone?: Prisma.SortOrderInput | Prisma.SortOrder;
    avatar?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    user?: Prisma.UsersOrderByWithRelationInput;
};
export type ProfilesWhereUniqueInput = Prisma.AtLeast<{
    profileId?: number;
    usersId?: number;
    AND?: Prisma.ProfilesWhereInput | Prisma.ProfilesWhereInput[];
    OR?: Prisma.ProfilesWhereInput[];
    NOT?: Prisma.ProfilesWhereInput | Prisma.ProfilesWhereInput[];
    firstName?: Prisma.StringNullableFilter<"Profiles"> | string | null;
    lastName?: Prisma.StringNullableFilter<"Profiles"> | string | null;
    phone?: Prisma.StringNullableFilter<"Profiles"> | string | null;
    avatar?: Prisma.JsonNullableFilter<"Profiles">;
    createdAt?: Prisma.DateTimeFilter<"Profiles"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Profiles"> | Date | string;
    user?: Prisma.XOR<Prisma.UsersScalarRelationFilter, Prisma.UsersWhereInput>;
}, "profileId" | "usersId">;
export type ProfilesOrderByWithAggregationInput = {
    profileId?: Prisma.SortOrder;
    firstName?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastName?: Prisma.SortOrderInput | Prisma.SortOrder;
    phone?: Prisma.SortOrderInput | Prisma.SortOrder;
    avatar?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
    _count?: Prisma.ProfilesCountOrderByAggregateInput;
    _avg?: Prisma.ProfilesAvgOrderByAggregateInput;
    _max?: Prisma.ProfilesMaxOrderByAggregateInput;
    _min?: Prisma.ProfilesMinOrderByAggregateInput;
    _sum?: Prisma.ProfilesSumOrderByAggregateInput;
};
export type ProfilesScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProfilesScalarWhereWithAggregatesInput | Prisma.ProfilesScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProfilesScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProfilesScalarWhereWithAggregatesInput | Prisma.ProfilesScalarWhereWithAggregatesInput[];
    profileId?: Prisma.IntWithAggregatesFilter<"Profiles"> | number;
    firstName?: Prisma.StringNullableWithAggregatesFilter<"Profiles"> | string | null;
    lastName?: Prisma.StringNullableWithAggregatesFilter<"Profiles"> | string | null;
    phone?: Prisma.StringNullableWithAggregatesFilter<"Profiles"> | string | null;
    avatar?: Prisma.JsonNullableWithAggregatesFilter<"Profiles">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Profiles"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Profiles"> | Date | string;
    usersId?: Prisma.IntWithAggregatesFilter<"Profiles"> | number;
};
export type ProfilesCreateInput = {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UsersCreateNestedOneWithoutProfileInput;
};
export type ProfilesUncheckedCreateInput = {
    profileId?: number;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    usersId: number;
};
export type ProfilesUpdateInput = {
    firstName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UsersUpdateOneRequiredWithoutProfileNestedInput;
};
export type ProfilesUncheckedUpdateInput = {
    profileId?: Prisma.IntFieldUpdateOperationsInput | number;
    firstName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ProfilesCreateManyInput = {
    profileId?: number;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    usersId: number;
};
export type ProfilesUpdateManyMutationInput = {
    firstName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProfilesUncheckedUpdateManyInput = {
    profileId?: Prisma.IntFieldUpdateOperationsInput | number;
    firstName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usersId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ProfilesCountOrderByAggregateInput = {
    profileId?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    lastName?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    avatar?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
};
export type ProfilesAvgOrderByAggregateInput = {
    profileId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
};
export type ProfilesMaxOrderByAggregateInput = {
    profileId?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    lastName?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
};
export type ProfilesMinOrderByAggregateInput = {
    profileId?: Prisma.SortOrder;
    firstName?: Prisma.SortOrder;
    lastName?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
};
export type ProfilesSumOrderByAggregateInput = {
    profileId?: Prisma.SortOrder;
    usersId?: Prisma.SortOrder;
};
export type ProfilesNullableScalarRelationFilter = {
    is?: Prisma.ProfilesWhereInput | null;
    isNot?: Prisma.ProfilesWhereInput | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type ProfilesCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ProfilesCreateWithoutUserInput, Prisma.ProfilesUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.ProfilesCreateOrConnectWithoutUserInput;
    connect?: Prisma.ProfilesWhereUniqueInput;
};
export type ProfilesUncheckedCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ProfilesCreateWithoutUserInput, Prisma.ProfilesUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.ProfilesCreateOrConnectWithoutUserInput;
    connect?: Prisma.ProfilesWhereUniqueInput;
};
export type ProfilesUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ProfilesCreateWithoutUserInput, Prisma.ProfilesUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.ProfilesCreateOrConnectWithoutUserInput;
    upsert?: Prisma.ProfilesUpsertWithoutUserInput;
    disconnect?: Prisma.ProfilesWhereInput | boolean;
    delete?: Prisma.ProfilesWhereInput | boolean;
    connect?: Prisma.ProfilesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProfilesUpdateToOneWithWhereWithoutUserInput, Prisma.ProfilesUpdateWithoutUserInput>, Prisma.ProfilesUncheckedUpdateWithoutUserInput>;
};
export type ProfilesUncheckedUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ProfilesCreateWithoutUserInput, Prisma.ProfilesUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.ProfilesCreateOrConnectWithoutUserInput;
    upsert?: Prisma.ProfilesUpsertWithoutUserInput;
    disconnect?: Prisma.ProfilesWhereInput | boolean;
    delete?: Prisma.ProfilesWhereInput | boolean;
    connect?: Prisma.ProfilesWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProfilesUpdateToOneWithWhereWithoutUserInput, Prisma.ProfilesUpdateWithoutUserInput>, Prisma.ProfilesUncheckedUpdateWithoutUserInput>;
};
export type ProfilesCreateWithoutUserInput = {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProfilesUncheckedCreateWithoutUserInput = {
    profileId?: number;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProfilesCreateOrConnectWithoutUserInput = {
    where: Prisma.ProfilesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProfilesCreateWithoutUserInput, Prisma.ProfilesUncheckedCreateWithoutUserInput>;
};
export type ProfilesUpsertWithoutUserInput = {
    update: Prisma.XOR<Prisma.ProfilesUpdateWithoutUserInput, Prisma.ProfilesUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ProfilesCreateWithoutUserInput, Prisma.ProfilesUncheckedCreateWithoutUserInput>;
    where?: Prisma.ProfilesWhereInput;
};
export type ProfilesUpdateToOneWithWhereWithoutUserInput = {
    where?: Prisma.ProfilesWhereInput;
    data: Prisma.XOR<Prisma.ProfilesUpdateWithoutUserInput, Prisma.ProfilesUncheckedUpdateWithoutUserInput>;
};
export type ProfilesUpdateWithoutUserInput = {
    firstName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProfilesUncheckedUpdateWithoutUserInput = {
    profileId?: Prisma.IntFieldUpdateOperationsInput | number;
    firstName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProfilesSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    profileId?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    phone?: boolean;
    avatar?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    usersId?: boolean;
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["profiles"]>;
export type ProfilesSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    profileId?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    phone?: boolean;
    avatar?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    usersId?: boolean;
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["profiles"]>;
export type ProfilesSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    profileId?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    phone?: boolean;
    avatar?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    usersId?: boolean;
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["profiles"]>;
export type ProfilesSelectScalar = {
    profileId?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    phone?: boolean;
    avatar?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    usersId?: boolean;
};
export type ProfilesOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"profileId" | "firstName" | "lastName" | "phone" | "avatar" | "createdAt" | "updatedAt" | "usersId", ExtArgs["result"]["profiles"]>;
export type ProfilesInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
};
export type ProfilesIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
};
export type ProfilesIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UsersDefaultArgs<ExtArgs>;
};
export type $ProfilesPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Profiles";
    objects: {
        user: Prisma.$UsersPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        profileId: number;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: runtime.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        usersId: number;
    }, ExtArgs["result"]["profiles"]>;
    composites: {};
};
export type ProfilesGetPayload<S extends boolean | null | undefined | ProfilesDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProfilesPayload, S>;
export type ProfilesCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProfilesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProfilesCountAggregateInputType | true;
};
export interface ProfilesDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Profiles'];
        meta: {
            name: 'Profiles';
        };
    };
    findUnique<T extends ProfilesFindUniqueArgs>(args: Prisma.SelectSubset<T, ProfilesFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ProfilesFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProfilesFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ProfilesFindFirstArgs>(args?: Prisma.SelectSubset<T, ProfilesFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ProfilesFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProfilesFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ProfilesFindManyArgs>(args?: Prisma.SelectSubset<T, ProfilesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ProfilesCreateArgs>(args: Prisma.SelectSubset<T, ProfilesCreateArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ProfilesCreateManyArgs>(args?: Prisma.SelectSubset<T, ProfilesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ProfilesCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProfilesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ProfilesDeleteArgs>(args: Prisma.SelectSubset<T, ProfilesDeleteArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ProfilesUpdateArgs>(args: Prisma.SelectSubset<T, ProfilesUpdateArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ProfilesDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProfilesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ProfilesUpdateManyArgs>(args: Prisma.SelectSubset<T, ProfilesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ProfilesUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProfilesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ProfilesUpsertArgs>(args: Prisma.SelectSubset<T, ProfilesUpsertArgs<ExtArgs>>): Prisma.Prisma__ProfilesClient<runtime.Types.Result.GetResult<Prisma.$ProfilesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ProfilesCountArgs>(args?: Prisma.Subset<T, ProfilesCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProfilesCountAggregateOutputType> : number>;
    aggregate<T extends ProfilesAggregateArgs>(args: Prisma.Subset<T, ProfilesAggregateArgs>): Prisma.PrismaPromise<GetProfilesAggregateType<T>>;
    groupBy<T extends ProfilesGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProfilesGroupByArgs['orderBy'];
    } : {
        orderBy?: ProfilesGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProfilesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProfilesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ProfilesFieldRefs;
}
export interface Prisma__ProfilesClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UsersDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UsersDefaultArgs<ExtArgs>>): Prisma.Prisma__UsersClient<runtime.Types.Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ProfilesFieldRefs {
    readonly profileId: Prisma.FieldRef<"Profiles", 'Int'>;
    readonly firstName: Prisma.FieldRef<"Profiles", 'String'>;
    readonly lastName: Prisma.FieldRef<"Profiles", 'String'>;
    readonly phone: Prisma.FieldRef<"Profiles", 'String'>;
    readonly avatar: Prisma.FieldRef<"Profiles", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"Profiles", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Profiles", 'DateTime'>;
    readonly usersId: Prisma.FieldRef<"Profiles", 'Int'>;
}
export type ProfilesFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    where: Prisma.ProfilesWhereUniqueInput;
};
export type ProfilesFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    where: Prisma.ProfilesWhereUniqueInput;
};
export type ProfilesFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    where?: Prisma.ProfilesWhereInput;
    orderBy?: Prisma.ProfilesOrderByWithRelationInput | Prisma.ProfilesOrderByWithRelationInput[];
    cursor?: Prisma.ProfilesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProfilesScalarFieldEnum | Prisma.ProfilesScalarFieldEnum[];
};
export type ProfilesFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    where?: Prisma.ProfilesWhereInput;
    orderBy?: Prisma.ProfilesOrderByWithRelationInput | Prisma.ProfilesOrderByWithRelationInput[];
    cursor?: Prisma.ProfilesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProfilesScalarFieldEnum | Prisma.ProfilesScalarFieldEnum[];
};
export type ProfilesFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    where?: Prisma.ProfilesWhereInput;
    orderBy?: Prisma.ProfilesOrderByWithRelationInput | Prisma.ProfilesOrderByWithRelationInput[];
    cursor?: Prisma.ProfilesWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProfilesScalarFieldEnum | Prisma.ProfilesScalarFieldEnum[];
};
export type ProfilesCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProfilesCreateInput, Prisma.ProfilesUncheckedCreateInput>;
};
export type ProfilesCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ProfilesCreateManyInput | Prisma.ProfilesCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ProfilesCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    data: Prisma.ProfilesCreateManyInput | Prisma.ProfilesCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ProfilesIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ProfilesUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProfilesUpdateInput, Prisma.ProfilesUncheckedUpdateInput>;
    where: Prisma.ProfilesWhereUniqueInput;
};
export type ProfilesUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ProfilesUpdateManyMutationInput, Prisma.ProfilesUncheckedUpdateManyInput>;
    where?: Prisma.ProfilesWhereInput;
    limit?: number;
};
export type ProfilesUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProfilesUpdateManyMutationInput, Prisma.ProfilesUncheckedUpdateManyInput>;
    where?: Prisma.ProfilesWhereInput;
    limit?: number;
    include?: Prisma.ProfilesIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ProfilesUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    where: Prisma.ProfilesWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProfilesCreateInput, Prisma.ProfilesUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ProfilesUpdateInput, Prisma.ProfilesUncheckedUpdateInput>;
};
export type ProfilesDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
    where: Prisma.ProfilesWhereUniqueInput;
};
export type ProfilesDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProfilesWhereInput;
    limit?: number;
};
export type ProfilesDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfilesSelect<ExtArgs> | null;
    omit?: Prisma.ProfilesOmit<ExtArgs> | null;
    include?: Prisma.ProfilesInclude<ExtArgs> | null;
};
export {};
