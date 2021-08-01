import {
  HttpModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { AllowList, AllowListSchema } from './admin/schema/allowList.schema';
import * as Joi from 'joi';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { AuditoriesService } from './auditories/auditories.service';
import { Bet, BetSchema } from './auditories/schemas/bet.schema';
import {
  PlayerExit,
  PlayerExitSchema,
} from './auditories/schemas/player.schema';
import { AuthController } from './auth/auth.controller';
import { BankrollService } from './bankroll/bankroll.service';
import { AuthService } from './auth/auth.service';
import { BetController } from './bets/bet.controller';
import { BetsService } from './bets/bets.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { FundsManagerService } from './funds-manager/funds-manager.service';
import { ApiMiddleware } from './middlewares/api.middleware';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { MongoModule } from './mongo/mongo.module';
import { HooksController } from './hooks/hooks.controller';
import { HooksMiddleware } from './middlewares/hooks.middleware';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3555),
        GAME_ENGINE_URL: Joi.required(),
        FUNDS_MANAGER_URL: Joi.required(),
        MONGODB_URI: Joi.required(),
        AUTH_SECRET_KEY: Joi.required(),
        ADMIN_API_KEY: Joi.required(),
        HOOKS_API_KEY: Joi.required(),
      }),
    }),
    MongoModule,
    MongooseModule.forFeature([{ name: Bet.name, schema: BetSchema }]),
    MongooseModule.forFeature([
      { name: AllowList.name, schema: AllowListSchema },
    ]),
    MongooseModule.forFeature([
      { name: PlayerExit.name, schema: PlayerExitSchema },
    ]),
    JwtModule.register({
      secret: process.env.AUTH_SECRET_KEY,
      signOptions: {
        expiresIn: '1m',
      },
    }),
  ],
  controllers: [
    AuthController,
    BetController,
    HooksController,
    AdminController,
  ],
  providers: [
    AppService,
    AppGateway,
    AuthService,
    BetsService,
    AuditoriesService,
    AdminService,
    FundsManagerService,
    BankrollService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/auth/me', method: RequestMethod.GET },
        { path: '/auth/logout', method: RequestMethod.POST },
        { path: '/bets', method: RequestMethod.POST },
        { path: '/bets/exit', method: RequestMethod.POST },
        { path: '/hooks/withdrawal', method: RequestMethod.POST },
      );

    consumer
      .apply(ApiMiddleware)
      .forRoutes(
        { path: '/admin/allow-list/', method: RequestMethod.GET },
        { path: '/admin/allow-list/:address', method: RequestMethod.POST },
        { path: '/admin/allow-list/:address', method: RequestMethod.DELETE },
      );

    consumer
      .apply(HooksMiddleware)
      .forRoutes({ path: '/hooks/balance', method: RequestMethod.PUT });
  }
}
