import { Model } from 'mongoose';
import { AcceptedBet } from 'src/models/bets.model';
import { IGame } from 'src/models/game.model';
import { IBet, BetDocument } from './schemas/bet.schema';
import { IPlayerExit, PlayerExitDocument } from './schemas/player.schema';
export declare class AuditoriesService {
    private playerExitModel;
    private betModel;
    constructor(playerExitModel: Model<PlayerExitDocument>, betModel: Model<BetDocument>);
    recordBet(bet: IBet): Promise<IBet>;
    recordExit(playerExit: IPlayerExit): Promise<IPlayerExit>;
    recordExitsFromAcceptedBets(playersExit: AcceptedBet[], gameSnapshot: IGame): void;
}
