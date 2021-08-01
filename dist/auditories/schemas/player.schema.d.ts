import { Document } from 'mongoose';
export declare type PlayerExitDocument = PlayerExit & Document;
export interface IPlayerExit {
    address: string;
    timestamp: number;
    roundNumber: number;
    gameState: string;
    tickNumber: number;
    multiplier: number;
    exited: boolean;
}
export declare class PlayerExit {
    address: string;
    timestamp: number;
    roundNumber: number;
    tickNumber: number;
    multiplier: number;
    exited: boolean;
    gameState: string;
}
export declare const PlayerExitSchema: import("mongoose").Schema<Document<PlayerExit, any, any>, import("mongoose").Model<any, any, any>, undefined, any>;
