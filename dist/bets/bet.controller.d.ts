import { AppService } from 'src/app.service';
import { User as UserType } from 'src/auth/auth.interface';
import { ExitRoundRequest, PlaceBetRequest } from 'src/interfaces/bets.interface';
import { AcceptedBet } from 'src/models/bets.model';
export declare class BetController {
    private readonly appService;
    constructor(appService: AppService);
    placeBet(body: PlaceBetRequest, user: UserType): Promise<AcceptedBet>;
    exitRound(body: ExitRoundRequest, user: UserType): Promise<AcceptedBet>;
}
