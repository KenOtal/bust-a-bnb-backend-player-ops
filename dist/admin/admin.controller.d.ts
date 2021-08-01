import { AdminService } from './admin.service';
import { AllowListDocument } from './schema/allowList.schema';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    saveAllowedAddress(address: string): Promise<AllowListDocument>;
    deleteAllowedAddress(address: string): Promise<AllowListDocument>;
    getAllowList(): Promise<AllowListDocument[]>;
}
