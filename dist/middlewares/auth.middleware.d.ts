import { NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
export declare class AuthMiddleware implements NestMiddleware {
    private readonly jwt;
    constructor(jwt: JwtService);
    use(req: AuthenticatedRequest, _: Response, next: NextFunction): void;
}
