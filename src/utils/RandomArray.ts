export default class RandomArray<T extends any[]>{

    constructor(private readonly array: T){}

    public random(n: number = 1){
        let result = new Array(n), len = this.array.length, taken = new Array(len)

        if(n > len){
            throw new RangeError('Need more elements')
        }

        while(n--){
            let x = Math.floor(Math.random() * len)
            result[n] = this.array[x in taken ? taken[x] : x]
            taken[x] = --len in taken ? taken[len] : len
        }

        return result
    }

    public shuffle(): T{
        let currentIndex = this.array.length, temporaryValue, randomIndex;

        while(currentIndex !== 0){
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex -= 1

            temporaryValue = this.array[currentIndex]
            this.array[currentIndex] = this.array[randomIndex]
            this.array[randomIndex] = temporaryValue
        }

        return this.array
    }

}
