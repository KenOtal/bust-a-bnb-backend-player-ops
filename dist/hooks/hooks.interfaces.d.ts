export declare class WithdrawalRequestBody {
    amount: string;
    transferAddress: string;
    accessToken: string;
    nonce: string;
}
export interface UpdateBalanceRequest {
    amount: string;
    deposit?: boolean;
}
