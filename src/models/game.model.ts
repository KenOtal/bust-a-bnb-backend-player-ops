import { AcceptedBet } from './bets.model';

export enum State {
  GAME_STARTED = 'GAME_STARTED',
  TAKING_BETS = 'TAKING_BETS',
  ROUND_IN_PROGRESS = 'ROUND_IN_PROGRESS',
  GAME_CRASHED = 'GAME_CRASHED',
  EXIT_ROUND = 'EXIT_ROUND',
  OFF = 'OFF',
}

export enum EventType {
  CHANGE_STATE = 'CHANGE_STATE',
}

export interface IGame {
  state: State;
  data: GameData;
}

export interface GameData {
  roundNumber: number;
  multiplier?: number;
  tickNumber?: number;
  timestamp?: number;
  currentMultiplier?: number;
  acceptedBets?: Array<AcceptedBet>;
  seed?: string;
  salt?: string;
  countDown?: number;
  jackpot?: boolean;
}
