import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AcceptedBet } from 'src/models/bets.model';
import { IGame } from 'src/models/game.model';
import { Bet, IBet, BetDocument } from './schemas/bet.schema';
import {
  IPlayerExit,
  PlayerExit,
  PlayerExitDocument,
} from './schemas/player.schema';

@Injectable()
export class AuditoriesService {
  constructor(
    @InjectModel(PlayerExit.name)
    private playerExitModel: Model<PlayerExitDocument>,
    @InjectModel(Bet.name)
    private betModel: Model<BetDocument>,
  ) {}

  recordBet(bet: IBet): Promise<IBet> {
    const record = new this.betModel(bet);
    return record.save();
  }

  recordExit(playerExit: IPlayerExit): Promise<IPlayerExit> {
    const record = new this.playerExitModel(playerExit);
    return record.save();
  }

  recordExitsFromAcceptedBets(playersExit: AcceptedBet[], gameSnapshot: IGame) {
    const records = playersExit.map((exit) => ({
      gameState: gameSnapshot.state,
      roundNumber: gameSnapshot.data.roundNumber,
      multiplier: exit.exitMultiplier,
      tickNumber: gameSnapshot.data.tickNumber,
      address: exit.address,
      exited: true,
      timestamp: Date.now(),
    }));

    this.playerExitModel.insertMany(records);
  }
}
