export type Resolver = (
    parent: any,
    args: any,
    context: any,
    info: any
) => Promise<any> | any

export interface QueryType{
    [key: string]: Resolver
}

export interface MutationType{
    [key: string]: Resolver
}

export interface ResolverMap{
    [key: string]: {
        [key: string]: Resolver
    }
}