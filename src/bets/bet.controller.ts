import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { User as UserType } from 'src/auth/auth.interface';
import { User } from 'src/decorators/user.decorator';
import {
  ExitRoundRequest,
  PlaceBetRequest,
} from 'src/interfaces/bets.interface';
import { AcceptedBet } from 'src/models/bets.model';

@Controller('bets')
export class BetController {
  constructor(private readonly appService: AppService) {}

  @Post('/')
  async placeBet(
    @Body() body: PlaceBetRequest,
    @User() user: UserType,
  ): Promise<AcceptedBet> {
    const acceptedBet = await this.appService.handlePlaceBet(body, user);

    return acceptedBet;
  }

  @Post('/exit')
  async exitRound(
    @Body() body: ExitRoundRequest,
    @User() user: UserType,
  ): Promise<AcceptedBet> {
    const acceptedExit = await this.appService.handleExitRound(body, user);

    return acceptedExit;
  }
}
