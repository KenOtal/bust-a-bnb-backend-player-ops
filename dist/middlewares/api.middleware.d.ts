import { NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express-serve-static-core';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
export declare class ApiMiddleware implements NestMiddleware {
    use(req: AuthenticatedRequest, _: Response, next: NextFunction): void;
}
