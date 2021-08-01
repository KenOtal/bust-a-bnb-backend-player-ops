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
exports.BankrollService = void 0;
const common_1 = require("@nestjs/common");
let BankrollService = class BankrollService {
    constructor() {
        this.bankFunds = '15000000000000000000000';
        this.maxProfit = '';
        this.setMaxProfit();
    }
    setMaxProfit() {
        const bankFundsParsed = BigInt(this.bankFunds);
        const houseProfit = (bankFundsParsed / BigInt(100)) * BigInt(1);
        this.maxProfit = houseProfit.toString();
    }
    getMaxMultiplierForAmount(amount) {
        let maxTargMultiplier = parseFloat(this.maxProfit) / parseFloat(amount);
        if (maxTargMultiplier <= 1)
            maxTargMultiplier = 1.01;
        return parseFloat(maxTargMultiplier.toFixed(2));
    }
};
BankrollService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], BankrollService);
exports.BankrollService = BankrollService;
//# sourceMappingURL=bankroll.service.js.map