"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetsService = void 0;
const common_1 = require("@nestjs/common");
let BetsService = class BetsService {
    validate(stringAmount) {
        if (typeof stringAmount !== 'string') {
            throw 'AMOUNT_WRONG_TYPE';
        }
        if (!stringAmount) {
            throw 'AMOUNT_MISSING';
        }
        if (stringAmount.length < 18) {
            throw 'INVALID_LENGTH';
        }
        let amount;
        try {
            amount = BigInt(stringAmount);
        }
        catch (err) {
            throw 'INVALID_STRING';
        }
        if (amount <= BigInt(0)) {
            throw 'AMOUNT_ZERO_OR_LESS';
        }
        return true;
    }
    validateTargetMultiplier(target) {
        if (typeof target !== 'number') {
            throw 'TARGET_MULTIPLIER_WRONG_TYPE';
        }
        if (target <= 1) {
            throw 'TARGET_MULTIPLIER_MUST_BE_ABOVE_ONE';
        }
        if (target >= 1000) {
            throw 'TARGET_MULTIPLIER_MUST_BET_BELOW_1000';
        }
        return true;
    }
    calculateWinnings(amount, targetMultiplier) {
        if (!targetMultiplier) {
            return amount;
        }
        const [integer, decimal] = targetMultiplier.toString().split('.');
        let fix = 1;
        let multiplier = integer;
        if (decimal) {
            fix = 10 ** decimal.length;
            multiplier = `${integer}${decimal}`;
        }
        const result = (BigInt(amount) * BigInt(multiplier)) / BigInt(fix);
        return result.toString();
    }
};
BetsService = __decorate([
    common_1.Injectable()
], BetsService);
exports.BetsService = BetsService;
//# sourceMappingURL=bets.service.js.map