import { Injectable } from '@nestjs/common';

@Injectable()
export class BetsService {
  validate(stringAmount: string): boolean {
    if (typeof stringAmount !== 'string') {
      throw 'AMOUNT_WRONG_TYPE';
    }

    if (!stringAmount) {
      throw 'AMOUNT_MISSING';
    }

    if (stringAmount.length < 18) {
      throw 'INVALID_LENGTH';
    }

    let amount: BigInt;

    try {
      amount = BigInt(stringAmount);
    } catch (err) {
      throw 'INVALID_STRING';
    }

    if (amount <= BigInt(0)) {
      throw 'AMOUNT_ZERO_OR_LESS';
    }

    return true;
  }

  validateTargetMultiplier(target: number): boolean {
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

  calculateWinnings(amount: string, targetMultiplier?: number): string {
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
}
