import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { User as UserType } from 'src/auth/auth.interface';
import { FundsManagerService } from 'src/funds-manager/funds-manager.service';
import {
  UpdateBalanceRequest,
  WithdrawalRequestBody,
} from './hooks.interfaces';
import { User } from 'src/decorators/user.decorator';
import { CurrentBalance } from 'src/funds-manager/funds-manager.interfaces';
import { AppService } from 'src/app.service';
import { UPDATE_BALANCE } from 'src/constants/messages';

@Controller('hooks')
export class HooksController {
  constructor(
    private readonly fundsManagerService: FundsManagerService,
    private readonly appService: AppService,
  ) {}

  @Post('/withdrawal')
  async withdrawalRequest(
    @User() user: UserType,
    @Body() body: WithdrawalRequestBody,
  ): Promise<CurrentBalance> {
    const res = await this.fundsManagerService.withdrawalRequest(
      user.address,
      body,
    );

    return res;
  }

  @Put('/:address/balance')
  updateUserBalance(
    @Body() body: UpdateBalanceRequest,
    @Param('address') address: string,
  ) {
    this.appService.getServer().emit(UPDATE_BALANCE, {
      ...body,
      address,
      deposit: true,
    });
  }
}
