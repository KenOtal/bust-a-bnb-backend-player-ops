export interface AcceptedBet {
    address: string;
    amount: string;
    maxMultiplier: number;
    exitMultiplier?: number;
    targetMultiplier?: number;
}
