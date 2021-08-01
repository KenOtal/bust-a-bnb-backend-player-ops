import { Document } from 'mongoose';
export declare type BetDocument = Bet & Document;
export interface IBet {
    address: string;
    amount: string;
    timestamp: number;
    gameState: string;
    roundNumber: number;
    accepted: boolean;
    targetMultiplier?: number;
}
export declare class Bet {
    address: string;
    amount: string;
    targetMultiplier: number;
    timestamp: number;
    gameState: string;
    roundNumber: number;
    accepted: boolean;
}
export declare const BetSchema: import("mongoose").Schema<Document<Bet, any, any>, import("mongoose").Model<any, any, any>, undefined, any>;
