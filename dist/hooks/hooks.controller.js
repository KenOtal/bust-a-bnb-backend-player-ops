"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HooksController = void 0;
const common_1 = require("@nestjs/common");
const auth_interface_1 = require("../auth/auth.interface");
const funds_manager_service_1 = require("../funds-manager/funds-manager.service");
const hooks_interfaces_1 = require("./hooks.interfaces");
const user_decorator_1 = require("../decorators/user.decorator");
const funds_manager_interfaces_1 = require("../funds-manager/funds-manager.interfaces");
const app_service_1 = require("../app.service");
const messages_1 = require("../constants/messages");
let HooksController = class HooksController {
    constructor(fundsManagerService, appService) {
        this.fundsManagerService = fundsManagerService;
        this.appService = appService;
    }
    async withdrawalRequest(user, body) {
        const res = await this.fundsManagerService.withdrawalRequest(user.address, body);
        return res;
    }
    updateUserBalance(body, address) {
        this.appService.getServer().emit(messages_1.UPDATE_BALANCE, Object.assign(Object.assign({}, body), { address, deposit: true }));
    }
};
__decorate([
    common_1.Post('/withdrawal'),
    __param(0, user_decorator_1.User()),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, hooks_interfaces_1.WithdrawalRequestBody]),
    __metadata("design:returntype", Promise)
], HooksController.prototype, "withdrawalRequest", null);
__decorate([
    common_1.Put('/:address/balance'),
    __param(0, common_1.Body()),
    __param(1, common_1.Param('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HooksController.prototype, "updateUserBalance", null);
HooksController = __decorate([
    common_1.Controller('hooks'),
    __metadata("design:paramtypes", [funds_manager_service_1.FundsManagerService,
        app_service_1.AppService])
], HooksController);
exports.HooksController = HooksController;
//# sourceMappingURL=hooks.controller.js.map