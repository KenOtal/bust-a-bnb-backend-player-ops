export declare type OperationType = 'ADD' | 'SUBSTRACT';
export declare class NewOperationRequest {
    amount: string;
    type: OperationType;
}
export interface CurrentBalance {
    addressId: string;
    balance: string;
}
export interface ConnectResponse {
    balance: string;
    depositAddress: string;
}
export interface Profile {
    address: string;
    balance: string;
    depositAddress: string;
}
export interface DepositDto {
    amount: string;
    address: string;
}
