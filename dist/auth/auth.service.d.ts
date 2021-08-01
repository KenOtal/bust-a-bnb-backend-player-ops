import { JwtService } from '@nestjs/jwt';
import { AccessRefreshPair, JwtData } from './auth.interface';
export interface TemporalHash {
    timestamp: Date;
    hash: string;
    original: string;
    address: string;
}
export declare class AuthService {
    private jwt;
    private temporalHashes;
    private refreshTokenByAddress;
    private readonly authSecretKey;
    constructor(jwt: JwtService);
    createTemporalHash(id: string, address: string): string;
    getVerifiedAddress(signature: string, clientId: string): Promise<string>;
    getAccessToken(address: string): string;
    getRefeshToken(address: string): string;
    decodeToken(token: any): JwtData;
    refreshSession(refreshToken: string): AccessRefreshPair;
    logout(address: string, refreshToken: string): void;
}
