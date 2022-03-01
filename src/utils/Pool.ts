export default abstract class Pool<T>{

    *[Symbol.iterator](){
        yield* this.flat(this.toMultidimensionalArray())
    }

    protected abstract toMultidimensionalArray(): T[][]

    protected *flat(a?: any, ...r: any){
        if(Array.isArray(a)){
            yield* this.flat(...a)
        }else{
            yield a
        }

        if(r.length){
            yield* this.flat(...r)
        }
    }

}