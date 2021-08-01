"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin/admin.controller");
const admin_service_1 = require("./admin/admin.service");
const allowList_schema_1 = require("./admin/schema/allowList.schema");
const Joi = require("joi");
const app_gateway_1 = require("./app.gateway");
const app_service_1 = require("./app.service");
const auditories_service_1 = require("./auditories/auditories.service");
const bet_schema_1 = require("./auditories/schemas/bet.schema");
const player_schema_1 = require("./auditories/schemas/player.schema");
const auth_controller_1 = require("./auth/auth.controller");
const bankroll_service_1 = require("./bankroll/bankroll.service");
const auth_service_1 = require("./auth/auth.service");
const bet_controller_1 = require("./bets/bet.controller");
const bets_service_1 = require("./bets/bets.service");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const funds_manager_service_1 = require("./funds-manager/funds-manager.service");
const api_middleware_1 = require("./middlewares/api.middleware");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const mongo_module_1 = require("./mongo/mongo.module");
const hooks_controller_1 = require("./hooks/hooks.controller");
const hooks_middleware_1 = require("./middlewares/hooks.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(auth_middleware_1.AuthMiddleware)
            .forRoutes({ path: '/auth/me', method: common_1.RequestMethod.GET }, { path: '/auth/logout', method: common_1.RequestMethod.POST }, { path: '/bets', method: common_1.RequestMethod.POST }, { path: '/bets/exit', method: common_1.RequestMethod.POST }, { path: '/hooks/withdrawal', method: common_1.RequestMethod.POST });
        consumer
            .apply(api_middleware_1.ApiMiddleware)
            .forRoutes({ path: '/admin/allow-list/', method: common_1.RequestMethod.GET }, { path: '/admin/allow-list/:address', method: common_1.RequestMethod.POST }, { path: '/admin/allow-list/:address', method: common_1.RequestMethod.DELETE });
        consumer
            .apply(hooks_middleware_1.HooksMiddleware)
            .forRoutes({ path: '/hooks/balance', method: common_1.RequestMethod.PUT });
    }
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            common_1.HttpModule,
            config_1.ConfigModule.forRoot({
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
            mongo_module_1.MongoModule,
            mongoose_1.MongooseModule.forFeature([{ name: bet_schema_1.Bet.name, schema: bet_schema_1.BetSchema }]),
            mongoose_1.MongooseModule.forFeature([
                { name: allowList_schema_1.AllowList.name, schema: allowList_schema_1.AllowListSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: player_schema_1.PlayerExit.name, schema: player_schema_1.PlayerExitSchema },
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.AUTH_SECRET_KEY,
                signOptions: {
                    expiresIn: '1m',
                },
            }),
        ],
        controllers: [
            auth_controller_1.AuthController,
            bet_controller_1.BetController,
            hooks_controller_1.HooksController,
            admin_controller_1.AdminController,
        ],
        providers: [
            app_service_1.AppService,
            app_gateway_1.AppGateway,
            auth_service_1.AuthService,
            bets_service_1.BetsService,
            auditories_service_1.AuditoriesService,
            admin_service_1.AdminService,
            funds_manager_service_1.FundsManagerService,
            bankroll_service_1.BankrollService,
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map