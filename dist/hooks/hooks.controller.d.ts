import { User as UserType } from 'src/auth/auth.interface';
import { FundsManagerService } from 'src/funds-manager/funds-manager.service';
import { UpdateBalanceRequest, WithdrawalRequestBody } from './hooks.interfaces';
import { CurrentBalance } from 'src/funds-manager/funds-manager.interfaces';
import { AppService } from 'src/app.service';
export declare class HooksController {
    private readonly fundsManagerService;
    private readonly appService;
    constructor(fundsManagerService: FundsManagerService, appService: AppService);
    withdrawalRequest(user: UserType, body: WithdrawalRequestBody): Promise<CurrentBalance>;
    updateUserBalance(body: UpdateBalanceRequest, address: string): void;
}
