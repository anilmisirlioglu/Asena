import MutationReturnType from '../ReturnTypes'
import { IRaffle } from '../../models/Raffle'

export interface RaffleMutationReturnType extends MutationReturnType{
    raffle: IRaffle
}