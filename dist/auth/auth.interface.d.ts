import { Request } from 'express';
import { ConnectResponse } from '../funds-manager/funds-manager.interfaces';
export interface VerifyResponse extends ConnectResponse {
    accessToken: string;
    refreshToken: string;
}
export interface AccessRefreshPair {
    accessToken: string;
    refreshToken: string;
}
export interface JwtData {
    address: string;
}
export interface Signature {
    signature: string;
}
export interface RefreshRequestBody {
    refreshToken: string;
}
export interface User extends JwtData {
    socketId?: string;
}
export interface AuthenticatedRequest extends Request {
    user: User;
}
