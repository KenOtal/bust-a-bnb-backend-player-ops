import { Document } from 'mongoose';
export declare type AllowListDocument = AllowList & Document;
export interface IAllowList {
    address: string;
}
export declare class AllowList {
    address: string;
}
export declare const AllowListSchema: import("mongoose").Schema<Document<AllowList, any, any>, import("mongoose").Model<any, any, any>, undefined, any>;
