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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("../admin/admin.service");
const user_decorator_1 = require("../decorators/user.decorator");
const funds_manager_interfaces_1 = require("../funds-manager/funds-manager.interfaces");
const funds_manager_service_1 = require("../funds-manager/funds-manager.service");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService, fundsService, adminService) {
        this.authService = authService;
        this.fundsService = fundsService;
        this.adminService = adminService;
    }
    async getChallengeString(socketId, { address }) {
        const isAllowListEnabled = process.env.ALLOW_LIST_ENABLED === 'true';
        if (isAllowListEnabled) {
            await this.adminService.verifyIfAddressIsAllowed(address.toLowerCase());
        }
        const hash = this.authService.createTemporalHash(socketId, address);
        return hash;
    }
    async vefiryWallet(socketId, body) {
        const verifiedAddress = await this.authService.getVerifiedAddress(body.signature, socketId);
        const isAllowListEnabled = process.env.ALLOW_LIST_ENABLED === 'true';
        if (isAllowListEnabled) {
            await this.adminService.verifyIfAddressIsAllowed(verifiedAddress.toLowerCase());
        }
        const accessToken = this.authService.getAccessToken(verifiedAddress);
        const refreshToken = this.authService.getRefeshToken(verifiedAddress);
        const { data: currentBalance } = await this.fundsService.connect(verifiedAddress);
        return Object.assign(Object.assign({}, currentBalance), { accessToken,
            refreshToken });
    }
    async refreshSession(payload) {
        const { accessToken, refreshToken } = this.authService.refreshSession(payload.refreshToken);
        const jwtData = this.authService.decodeToken(refreshToken);
        await this.adminService.verifyIfAddressIsAllowed(jwtData.address.toLowerCase());
        return { accessToken, refreshToken };
    }
    logout(user, payload) {
        this.authService.logout(user.address, payload.refreshToken);
    }
    async getProfile(user) {
        const { data } = await this.fundsService.connect(user.address);
        return Object.assign(Object.assign({}, data), { address: user.address });
    }
};
__decorate([
    common_1.Post('/:socketId/challenge'),
    __param(0, common_1.Param('socketId')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getChallengeString", null);
__decorate([
    common_1.Post('/:socketId/verify'),
    __param(0, common_1.Param('socketId')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "vefiryWallet", null);
__decorate([
    common_1.Post('/refresh'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshSession", null);
__decorate([
    common_1.Post('/logout'),
    __param(0, user_decorator_1.User()),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    common_1.Get('/me'),
    __param(0, user_decorator_1.User()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
AuthController = __decorate([
    common_1.Controller('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        funds_manager_service_1.FundsManagerService,
        admin_service_1.AdminService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map