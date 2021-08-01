import { Injectable, Logger } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { Server } from 'socket.io';
import { AuditoriesService } from './auditories/auditories.service';
import { BankrollService } from './bankroll/bankroll.service';
import { User } from './auth/auth.interface';
import { BetsService } from './bets/bets.service';
import {
  BET_ACCEPTED,
  BET_ALREADY_ACCEPTED,
  EXIT_ROUND_BATCH,
  EXIT_ROUND_SUCCESS,
  GAME_CRASHED,
  INVALID_STATE_FOR_EXIT,
  INVALID_STATE_TO_TAKE_BETS,
  OFF,
  PLAYER_ALREADY_EXITED,
  PLAYER_DOESNT_HAVE_ACCEPTED_BET,
  TAKING_BETS,
  UPDATE_BALANCE,
} from './constants/messages';
import {
  CurrentBalance,
  NewOperationRequest,
} from './funds-manager/funds-manager.interfaces';
import { FundsManagerService } from './funds-manager/funds-manager.service';
import { ExitRoundRequest, PlaceBetRequest } from './interfaces/bets.interface';
import { AcceptedBet } from './models/bets.model';
import { GameData, IGame, State } from './models/game.model';

@Injectable()
export class AppService {
  public countdown = 0;
  public acceptedBets: AcceptedBet[] = [];
  private game: IGame;

  private server: Server;
  private logger: Logger;

  constructor(
    private readonly betsService: BetsService,
    private readonly auditoriesService: AuditoriesService,
    private readonly fundsManagerService: FundsManagerService,
    private readonly bankrollService: BankrollService,
  ) {
    this.logger = new Logger('app-service');

    this.game = {
      state: State[OFF],
      data: {
        roundNumber: 0,
      },
    };
  }

  setServer(server: Server) {
    this.server = server;
  }

  getServer(): Server {
    return this.server;
  }

  setCurrentGameState(state: State, data: GameData): void {
    this.game = { state, data };
  }

  getCurrentGameState(): IGame {
    return this.game;
  }

  validateSingleBet(address: string) {
    if (this.acceptedBets.find((bet) => bet.address === address)) {
      throw BET_ALREADY_ACCEPTED;
    }
  }

  private validateExit(address: string): AcceptedBet {
    if (this.game.state !== State.ROUND_IN_PROGRESS) {
      throw INVALID_STATE_FOR_EXIT;
    }

    const userBet = this.acceptedBets.find((bet) => bet.address === address);

    if (!userBet) {
      throw PLAYER_DOESNT_HAVE_ACCEPTED_BET;
    }

    if (userBet.exitMultiplier) {
      throw PLAYER_ALREADY_EXITED;
    }

    return userBet;
  }

  public handleGameCrash() {
    this.logger.debug('Handling game crashed');

    if (this.game.data.jackpot) {
      this.handleJackpot();
    }

    this.acceptedBets = [];
    this.logger.debug('Accepted bets array cleared');
  }

  private acceptBet(user: User, bet: PlaceBetRequest) {
    this.logger.debug(`Accepted bet for user ${user.address}`);
    const maxMultiplier = this.bankrollService.getMaxMultiplierForAmount(
      bet.amount,
    );

    const acceptedBet: AcceptedBet = {
      address: user.address,
      amount: bet.amount,
      maxMultiplier: maxMultiplier,
      targetMultiplier: bet.targetMultiplier,
    };

    this.acceptedBets.push(acceptedBet);

    return acceptedBet;
  }

  private async dispatchFundManagerOperation(
    user: User,
    operation: NewOperationRequest,
  ): Promise<CurrentBalance> {
    const newBalance = await this.fundsManagerService.dispatchEvent(
      user.address,
      operation,
    );

    this.server.emit(UPDATE_BALANCE, {
      deposit: false,
      address: user.address,
      balance: newBalance.balance,
    });

    return newBalance;
  }

  async handlePlaceBet(bet: PlaceBetRequest, user: User): Promise<AcceptedBet> {
    const partialAuditory = {
      ...bet,
      gameState: this.game.state,
      roundNumber: this.game.data.roundNumber,
      address: user.address,
    };

    try {
      if (this.game.state !== TAKING_BETS) {
        throw INVALID_STATE_TO_TAKE_BETS;
      }

      this.validateSingleBet(user.address);
      this.betsService.validate(bet.amount);

      if (bet.targetMultiplier) {
        this.betsService.validateTargetMultiplier(bet.targetMultiplier);
      }

      await this.dispatchFundManagerOperation(user, {
        amount: bet.amount,
        type: 'SUBSTRACT',
      });

      this.auditoriesService.recordBet({
        ...partialAuditory,
        accepted: true,
        timestamp: Date.now(),
      });

      const acceptedBet = this.acceptBet(user, bet);

      this.server.emit(BET_ACCEPTED, acceptedBet);

      return acceptedBet;
    } catch (err) {
      this.auditoriesService.recordBet({
        ...partialAuditory,
        accepted: false,
        timestamp: Date.now(),
      });

      throw err;
    }
  }

  public async handleExitRound(
    exitRequest: ExitRoundRequest,
    user: User,
  ): Promise<AcceptedBet> {
    const partialAuditory = {
      ...exitRequest,
      gameState: this.game.state,
      roundNumber: this.game.data.roundNumber,
      multiplier: this.game.data.currentMultiplier,
      tickNumber: this.game.data.tickNumber,
      address: user.address,
    };

    try {
      const gameState: GameData = { ...this.game.data };

      const userBet = this.validateExit(user.address);

      const winning = this.betsService.calculateWinnings(
        userBet.amount,
        gameState.currentMultiplier,
      );

      await this.dispatchFundManagerOperation(user, {
        amount: winning,
        type: 'ADD',
      });

      userBet.exitMultiplier = gameState.currentMultiplier;

      this.auditoriesService.recordExit({
        ...partialAuditory,
        exited: true,
        timestamp: Date.now(),
      });

      this.server.emit(EXIT_ROUND_SUCCESS, userBet);

      return userBet;
    } catch (err) {
      this.auditoriesService.recordExit({
        ...partialAuditory,
        exited: false,
        timestamp: Date.now(),
      });

      throw err;
    }
  }

  async sendExitBatchToFundsManager(exits: AcceptedBet[]): Promise<void> {
    exits.forEach((exit) => {
      const amount = this.betsService.calculateWinnings(
        exit.amount,
        exit.exitMultiplier,
      );

      this.dispatchFundManagerOperation(
        { address: exit.address },
        { amount, type: 'ADD' },
      );
    });
  }

  async handleBatchExitsForTargetAndMaxMultiplier(
    currentMultiplier: number,
  ): Promise<void> {
    const gameSnapshot = cloneDeep(this.game);

    const betsToExitInBatch = this.acceptedBets.filter(
      (bet) =>
        !bet.exitMultiplier &&
        [bet.targetMultiplier, bet.maxMultiplier].includes(currentMultiplier),
    );

    if (betsToExitInBatch.length) {
      betsToExitInBatch.forEach((bet) => {
        bet.exitMultiplier = currentMultiplier;
      });

      this.auditoriesService.recordExitsFromAcceptedBets(
        betsToExitInBatch,
        gameSnapshot,
      );

      this.server.emit(EXIT_ROUND_BATCH, betsToExitInBatch);

      this.sendExitBatchToFundsManager(betsToExitInBatch);
    }
  }

  handleJackpot() {
    this.logger.debug('Handling jackpot');

    const { currentMultiplier } = this.game.data;

    const jackpotExits = this.acceptedBets.filter((bet) => !bet.exitMultiplier);

    jackpotExits.forEach((bet) => {
      bet.exitMultiplier = currentMultiplier;
    });

    this.server.emit(GAME_CRASHED, {
      jackpot: true,
      jackpotExits,
      currentMultiplier,
    });

    this.sendExitBatchToFundsManager(jackpotExits);
  }

  startCountdown() {
    this.countdown = 500;

    const countDownInterval = setInterval(() => {
      this.countdown -= 1;

      if (this.countdown <= 0) {
        clearInterval(countDownInterval);
      }
    }, 10);
  }
}
