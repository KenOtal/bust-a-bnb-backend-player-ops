import { AdminService } from 'src/admin/admin.service';
import { Profile } from 'src/funds-manager/funds-manager.interfaces';
import { FundsManagerService } from 'src/funds-manager/funds-manager.service';
import { AccessRefreshPair, JwtData, RefreshRequestBody, Signature, User as UserType, VerifyResponse } from './auth.interface';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly fundsService;
    private readonly adminService;
    constructor(authService: AuthService, fundsService: FundsManagerService, adminService: AdminService);
    getChallengeString(socketId: string, { address }: JwtData): Promise<string>;
    vefiryWallet(socketId: string, body: Signature): Promise<VerifyResponse>;
    refreshSession(payload: RefreshRequestBody): Promise<AccessRefreshPair>;
    logout(user: UserType, payload: RefreshRequestBody): void;
    getProfile(user: UserType): Promise<Profile>;
}
