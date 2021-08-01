import { Model } from 'mongoose';
import { AllowListDocument } from './schema/allowList.schema';
export declare class AdminService {
    private allowModel;
    constructor(allowModel: Model<AllowListDocument>);
    createAllowAddress(address: string): Promise<AllowListDocument>;
    deleteAllowAddress(address: string): Promise<AllowListDocument>;
    getAllowAddressList(): Promise<AllowListDocument[]>;
    verifyIfAddressIsAllowed(address: string): Promise<import("mongoose").LeanDocument<AllowListDocument>>;
}
