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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundsManagerService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("@nestjs/config");
const bets_service_1 = require("../bets/bets.service");
const hooks_interfaces_1 = require("../hooks/hooks.interfaces");
let FundsManagerService = class FundsManagerService {
    constructor(configService, betsService) {
        this.configService = configService;
        this.betsService = betsService;
        const baseURL = this.configService.get('FUNDS_MANAGER_URL');
        if (!baseURL) {
            throw 'MISSING_FUNDS_MANAGER_URL';
        }
        this.apiClient = axios_1.default.create({
            baseURL,
        });
    }
    connect(addressId) {
        return this.apiClient.post(`/balances/${addressId}/connect`);
    }
    async dispatchEvent(addressId, body) {
        const { data } = await this.apiClient.post(`/balances/${addressId}/operations`, body);
        return data;
    }
    async withdrawalRequest(addressId, withdrawalRequestBody) {
        const { data } = await this.apiClient.post(`/balances/${addressId}/withdrawal`, withdrawalRequestBody);
        return data;
    }
};
FundsManagerService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        bets_service_1.BetsService])
], FundsManagerService);
exports.FundsManagerService = FundsManagerService;
//# sourceMappingURL=funds-manager.service.js.map