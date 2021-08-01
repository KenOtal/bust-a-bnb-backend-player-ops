import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction } from 'express-serve-static-core';
import { AuthenticatedRequest } from 'src/auth/auth.interface';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, _: Response, next: NextFunction) {
    const apiKey = req.headers['admin-api-key'];

    if (apiKey !== process.env.ADMIN_API_KEY) {
      throw new UnauthorizedException();
    }

    next();
  }
}
