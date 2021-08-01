import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest, JwtData } from 'src/auth/auth.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwt: JwtService) {}

  use(req: AuthenticatedRequest, _: Response, next: NextFunction) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    try {
      this.jwt.verify(accessToken, { secret: process.env.AUTH_SECRET_KEY });
    } catch (err) {
      throw new UnauthorizedException();
    }

    const jwtData = this.jwt.decode(accessToken) as JwtData;

    req.user = {
      ...jwtData,
      socketId: req.headers['x-socket-id'] as string,
    };

    next();
  }
}
