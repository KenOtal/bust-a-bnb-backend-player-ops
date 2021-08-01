import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedRequest,
  User as UserType,
} from 'src/auth/auth.interface';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserType => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
