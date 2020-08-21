import { IPremium, PremiumType } from '../models/Server';

class Premium implements IPremium{

    public type: PremiumType
    public finishAt: Date
    public startAt: Date

    constructor(data){
        this.type = data.type
        this.finishAt = data.finishAt
        this.startAt = data.startAt
    }

    hasExpired(): boolean{
        return +this.finishAt - Date.now() > 0
    }

    humanizeType(): string{
        switch(this.type){
            case 'LIMITED':
                return 'Normal üyelik'

            case 'PERMANENT':
                return 'Sınırsız Üyelik'

            default:
                return 'Unknown'
        }
    }

}

export default Premium
