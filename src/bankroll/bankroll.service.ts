import { Injectable } from '@nestjs/common';

@Injectable()
export class BankrollService {
  private bankFunds = '15000000000000000000000'; //esto es 15k
  private maxProfit = '';

  constructor() {
    this.setMaxProfit();
  }

  /**
   * @Brief sets to the atribute maxProfit the maximum value
   * that a player can earn on a match
   */
  setMaxProfit(): void {
    const bankFundsParsed = BigInt(this.bankFunds);
    const houseProfit = (bankFundsParsed / BigInt(100)) * BigInt(1);
    this.maxProfit = houseProfit.toString();
  }

  /**
   * @Brief calculates the max target_multiplier a player can reach,
   *    if max target_multiplier is less than 1 so its set to 1.01
   * @Return value with the max_target_multiplier : float
   */
  getMaxMultiplierForAmount(amount: string): number {
    let maxTargMultiplier = parseFloat(this.maxProfit) / parseFloat(amount);
    if (maxTargMultiplier <= 1) maxTargMultiplier = 1.01;
    return parseFloat(maxTargMultiplier.toFixed(2));
  }
}
