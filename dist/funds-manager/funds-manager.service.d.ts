import { ConnectResponse, CurrentBalance, NewOperationRequest } from './funds-manager.interfaces';
import { ConfigService } from '@nestjs/config';
import { BetsService } from '../bets/bets.service';
import { WithdrawalRequestBody } from 'src/hooks/hooks.interfaces';
export declare class FundsManagerService {
    private readonly configService;
    private readonly betsService;
    foundsManagerUrl: string;
    private readonly apiClient;
    constructor(configService: ConfigService, betsService: BetsService);
    connect(addressId: string): Promise<import("axios").AxiosResponse<ConnectResponse>>;
    dispatchEvent(addressId: string, body: NewOperationRequest): Promise<CurrentBalance>;
    withdrawalRequest(addressId: string, withdrawalRequestBody: WithdrawalRequestBody): Promise<CurrentBalance>;
}
