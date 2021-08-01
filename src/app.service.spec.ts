/* eslint-disable @typescript-eslint/no-empty-function */
import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { BetsService } from './bets/bets.service';
import { Bet, IBet } from './auditories/schemas/bet.schema';
import { PlayerExit } from './auditories/schemas/player.schema';
import { AuditoriesService } from './auditories/auditories.service';
import { GameData, State } from './models/game.model';
import { ExitRoundRequest, PlaceBetRequest } from './interfaces/bets.interface';
import {
  BET_ALREADY_ACCEPTED,
  COUNT_DOWN,
  EXIT_ROUND_BATCH,
  INVALID_STATE_FOR_EXIT,
  INVALID_STATE_TO_TAKE_BETS,
  PLAYER_ALREADY_EXITED,
  PLAYER_DOESNT_HAVE_ACCEPTED_BET,
} from './constants/messages';
import { AuthService } from './auth/auth.service';
import { FundsManagerService } from './funds-manager/funds-manager.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from './auth/auth.interface';
import { AcceptedBet } from './models/bets.model';
import { BankrollService } from './bankroll/bankroll.service';

class betModel {
  save() {}
  find() {}
}
class playerExitModel {
  save() {}
  find() {}
  insertMany() {}
}

describe('App Service', () => {
  let appService: AppService;
  let auditoriesService: AuditoriesService;
  let betsService: BetsService;

  const mockData = {
    roundNumber: 1,
    tickNumber: 1,
    currentMultiplier: 2,
  };

  const mockServer = {
    emit: jest.fn(),
  } as any;

  const gameData: GameData = {
    roundNumber: 1,
  };
  const address = '111';

  const mockedUser: User = {
    address: '111',
    socketId: '111',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secret: process.env.AUTH_SECRET_KEY,
        }),
      ],
      providers: [
        AppService,
        BetsService,
        AuditoriesService,
        AuthService,
        FundsManagerService,
        BankrollService,
        {
          provide: getModelToken(Bet.name),
          useValue: betModel,
        },
        {
          provide: getModelToken(PlayerExit.name),
          useValue: playerExitModel,
        },
      ],
    }).compile();

    auditoriesService = module.get<AuditoriesService>(AuditoriesService);
    betsService = module.get<BetsService>(BetsService);
    appService = module.get<AppService>(AppService);
    appService.acceptedBets = [
      {
        address: '1',
        amount: '111111111111111111',
        targetMultiplier: 2,
        maxMultiplier: 3,
      },
      {
        address: '2',
        amount: '222222222222222222',
        targetMultiplier: 2,
        maxMultiplier: 3,
      },
    ];
  });

  const sendExits = () =>
    jest
      .spyOn(appService, 'sendExitBatchToFundsManager')
      .mockImplementation(() => Promise.resolve());

  it('appService should be defined', () => {
    expect(appService).toBeDefined();
  });
  it('setServer sets server', () => {
    appService.setServer(mockServer);
    expect(appService['server']).toStrictEqual(mockServer);
  });
  it('getCurrentGameState gets the game', () => {
    const game = appService.getCurrentGameState();
    expect(game).toStrictEqual({
      state: State.OFF,
      data: {
        roundNumber: 0,
      },
    });
  });
  it('validateSingleBet validates single bet', () => {
    try {
      appService.validateSingleBet('1');
    } catch (e) {
      expect(e).toBe(BET_ALREADY_ACCEPTED);
    }
  });
  it('handleGameCrash clears acceptedBets array', () => {
    appService.handleGameCrash();
    expect(appService.acceptedBets).toStrictEqual([]);
  });
  describe('For handlePlaceBet Method', () => {
    const mockRecordBet = (recordedBet: IBet) => {
      return jest
        .spyOn(auditoriesService, 'recordBet')
        .mockImplementation(() => Promise.resolve(recordedBet));
    };
    const mockBetValidation = (succeed: boolean, result: any) => {
      return jest.spyOn(betsService, 'validate').mockImplementation(() => {
        if (succeed) {
          return result;
        } else {
          throw result;
        }
      });
    };
    const mockTargetValidate = (succeed: boolean, result: any) => {
      return jest
        .spyOn(betsService, 'validateTargetMultiplier')
        .mockImplementation(() => {
          if (succeed) {
            return result;
          } else {
            throw result;
          }
        });
    };

    const recordedBet: IBet = {
      address: '3',
      amount: '20000000000000000000',
      timestamp: Date.now(),
      gameState: 'TAKING_BETS',
      targetMultiplier: 3,
      roundNumber: 1,
      accepted: true,
    };
    const placeBetRequest: PlaceBetRequest = {
      accessToken: '1',
      amount: '1000000000000000000',
      targetMultiplier: 1.25,
    };
    describe('SUCCESS', () => {
      beforeEach(() => {
        appService.setCurrentGameState(State.TAKING_BETS, gameData);
      });
      it('should call validateSingleBet with right address', () => {
        const validateSingleBetSpy = spyOn(appService, 'validateSingleBet');
        appService.handlePlaceBet(placeBetRequest, mockedUser);
        expect(validateSingleBetSpy).toBeCalledTimes(1);
        expect(validateSingleBetSpy).toBeCalledWith(address);
      });
      // it('Should create a bet record', async () => {
      //   const recordBet = mockRecordBet(recordedBet);
      //   await appService.handlePlaceBet(placeBetRequest, mockedUser);
      //   expect(recordBet).toHaveBeenCalledTimes(1);
      // });
      // it('Should validate the bet amount', async () => {
      //   const validateBet = mockBetValidation(true, true);

      //   await appService.handlePlaceBet(placeBetRequest, mockedUser);
      //   expect(validateBet).toHaveBeenCalledTimes(1);
      // });
      // it('Should validate the target multiplier', async () => {
      //   const targetValidate = mockTargetValidate(true, true);

      //   await appService.handlePlaceBet(placeBetRequest, mockedUser);
      //   expect(targetValidate).toHaveBeenCalledTimes(1);
      // });
      // it('should call validateSingleBet with right address', async () => {
      //   const validateSingleBetSpy = jest.spyOn(
      //     appService,
      //     'validateSingleBet',
      //   );

      //   await appService.handlePlaceBet(placeBetRequest, mockedUser);
      //   expect(validateSingleBetSpy).toBeCalledTimes(1);
      //   expect(validateSingleBetSpy).toBeCalledWith(address);
      // });
    });
    describe('ERROR', () => {
      describe('Place a bet with invalid state', () => {
        it('should throw error if state is ROUND_IN_PROGRESS', () => {
          appService.setCurrentGameState(State.ROUND_IN_PROGRESS, gameData);
          try {
            appService.handlePlaceBet(placeBetRequest, mockedUser);
          } catch (err) {
            expect(err).toBe(INVALID_STATE_TO_TAKE_BETS);
          }
        });

        it('should throw error if state is EXIT_ROUND', () => {
          appService.setCurrentGameState(State.EXIT_ROUND, gameData);
          try {
            appService.handlePlaceBet(placeBetRequest, mockedUser);
          } catch (err) {
            expect(err).toBe(INVALID_STATE_TO_TAKE_BETS);
          }
        });

        it('should throw error if state is GAME_CRASHED', () => {
          appService.setCurrentGameState(State.GAME_CRASHED, gameData);
          try {
            appService.handlePlaceBet(placeBetRequest, mockedUser);
          } catch (err) {
            expect(err).toBe(INVALID_STATE_TO_TAKE_BETS);
          }
        });

        it('should throw error if state is GAME_STARTED', () => {
          appService.setCurrentGameState(State.GAME_STARTED, gameData);
          try {
            appService.handlePlaceBet(placeBetRequest, mockedUser);
          } catch (err) {
            expect(err).toBe(INVALID_STATE_TO_TAKE_BETS);
          }
        });

        it('should throw error if state is ROUND_IN_PROGRESS', () => {
          appService.setCurrentGameState(State.ROUND_IN_PROGRESS, gameData);
          try {
            appService.handlePlaceBet(placeBetRequest, mockedUser);
          } catch (err) {
            expect(err).toBe(INVALID_STATE_TO_TAKE_BETS);
          }
        });
      });
      it('Should return an error if bet targetMultiplier is not valid', () => {
        mockTargetValidate(false, 'INVALID_TARGET');
        try {
          appService.handlePlaceBet(placeBetRequest, mockedUser);
        } catch (e) {
          expect(e).toBe('INVALID_TARGET');
        }
      });
      it('Should return an error if bet validation fails', () => {
        mockBetValidation(false, 'ERROR');
        try {
          appService.handlePlaceBet(placeBetRequest, mockedUser);
        } catch (e) {
          expect(e).toBe('ERROR');
        }
      });
      it('Should return an error if address duplicates', () => {
        try {
          appService.handlePlaceBet(placeBetRequest, mockedUser);
        } catch (e) {
          expect(e).toBe(BET_ALREADY_ACCEPTED);
        }
      });
    });
  });
  describe('For handleExitRound method', () => {
    const exitRoundRequest: ExitRoundRequest = {
      accessToken: '1',
    };
    beforeEach(() => {
      const gameData = {
        roundNumber: 1,
        currentMultiplier: 2,
      };
      appService.setCurrentGameState(State.ROUND_IN_PROGRESS, gameData);
    });
    describe('Calls validateExit method', () => {
      // it('Should return the exit when suceed', async () => {
      //   const userBet = await appService.handleExitRound(
      //     exitRoundRequest,
      //     mockedUser,
      //   );
      //   expect(userBet).toStrictEqual({
      //     address: '1',
      //     amount: '111111111111111111',
      //     targetMultiplier: 2,
      //     exitMultiplier: 2,
      //   });
      // });
      it('Should throw when game state is ', () => {
        appService.setCurrentGameState(State.TAKING_BETS, gameData);
        try {
          appService.handleExitRound(exitRoundRequest, mockedUser);
        } catch (e) {
          expect(e).toBe(INVALID_STATE_FOR_EXIT);
        }
      });
      it('Should throw when user did not place bet', () => {
        try {
          appService.handleExitRound(exitRoundRequest, mockedUser);
        } catch (e) {
          expect(e).toBe(PLAYER_DOESNT_HAVE_ACCEPTED_BET);
        }
      });
      it('Should throw when user object has exit multiplier', () => {
        appService.acceptedBets = [
          {
            address: '1',
            amount: '111111111111111111',
            targetMultiplier: 2,
            maxMultiplier: 3,
          },
          {
            address: '2',
            amount: '222222222222222222',
            targetMultiplier: 2,
            exitMultiplier: 2,
            maxMultiplier: 3,
          },
        ];
        try {
          appService.handleExitRound(exitRoundRequest, mockedUser);
        } catch (e) {
          expect(e).toBe(PLAYER_ALREADY_EXITED);
        }
      });
    });
    describe('ERROR', () => {
      it('throw error when game in wrong state', () => {
        appService.setCurrentGameState(State.GAME_CRASHED, gameData);
        try {
          appService.handleExitRound(exitRoundRequest, mockedUser);
        } catch (e) {
          expect(e).toBe(INVALID_STATE_FOR_EXIT);
        }
      });
      it('throw error when there is no bet', () => {
        try {
          appService.handleExitRound(exitRoundRequest, mockedUser);
        } catch (e) {
          expect(e).toBe(PLAYER_DOESNT_HAVE_ACCEPTED_BET);
        }
      });
      it('throw error when player already exited', () => {
        appService.acceptedBets = [
          {
            address: '1',
            amount: '2',
            exitMultiplier: 3,
            maxMultiplier: 3,
          },
        ];
        try {
          appService.handleExitRound(exitRoundRequest, mockedUser);
        } catch (e) {
          expect(e).toBe(PLAYER_ALREADY_EXITED);
        }
      });
    });
  });
  it('For sendExitBatchtoFundsManager method', async () => {
    const calculateWinnings = jest.spyOn(betsService, 'calculateWinnings');
    const exits = [
      {
        address: '1',
        amount: '2',
        exitMultiplier: 2,
        maxMultiplier: 3,
      },
      {
        address: '1',
        amount: '2',
        exitMultiplier: 2,
        maxMultiplier: 3,
      },
    ];
    await appService.sendExitBatchToFundsManager(exits);
    expect(calculateWinnings).toHaveBeenCalledTimes(2);
  });
  describe('For handleBatchExitsForTargetAndMaxMultiplier method', () => {
    const recordExits = () =>
      jest
        .spyOn(auditoriesService, 'recordExitsFromAcceptedBets')
        .mockImplementation(() => Promise.resolve());
    beforeEach(() => {
      appService.setCurrentGameState(State.ROUND_IN_PROGRESS, mockData);
    });
    describe('SUCCESS', () => {
      const expectedExitsArray: AcceptedBet[] = [
        {
          address: '1',
          amount: '111111111111111111',
          targetMultiplier: 2,
          exitMultiplier: 2,
          maxMultiplier: 3,
        },
        {
          address: '2',
          amount: '222222222222222222',
          targetMultiplier: 2,
          exitMultiplier: 2,
          maxMultiplier: 3,
        },
      ];
      it('Should create an exit record', async () => {
        appService.setServer(mockServer);
        const recordExitsSpy = recordExits();
        sendExits();
        await appService.handleBatchExitsForTargetAndMaxMultiplier(2);
        expect(recordExitsSpy).toHaveBeenCalled();
      });
      it('Should emit the exit array', async () => {
        appService.setServer(mockServer);
        recordExits();
        sendExits();
        await appService.handleBatchExitsForTargetAndMaxMultiplier(2);
        expect(mockServer.emit).toHaveBeenCalled();
        expect(mockServer.emit).toHaveBeenCalledWith(
          EXIT_ROUND_BATCH,
          expectedExitsArray,
        );
      });
    });
    describe('ERROR', () => {});
  });
  describe('Given an exitAllJackpots function', () => {
    beforeEach(() => {
      appService.acceptedBets = [
        {
          address: '1',
          amount: '111111111111111111',
          maxMultiplier: 30,
        },
        {
          address: '2',
          amount: '222222222222222222',
          maxMultiplier: 30,
        },
      ];
      appService.setServer(mockServer);
    });
  });

  describe('Given a startCountdown funtion', () => {
    beforeEach(() => {
      appService.setServer(mockServer);
      appService.setCurrentGameState(State.TAKING_BETS, mockData);
      jest.useFakeTimers();
    });
    afterEach(() => {
      clearInterval();
      jest.clearAllTimers();
    });
    describe('SUCCESS', () => {
      it('Should start the timer if event is TAKING_BETS', () => {
        appService.startCountdown();
        jest.advanceTimersByTime(1000);
        expect(mockServer.emit).toHaveBeenCalled();
      });
      it('Sould clear the interval if the timeLeft >= TIME_BETWEEN_BETS_AND_RUNNING', () => {
        appService.startCountdown();
        jest.advanceTimersByTime(6000);
        expect(clearInterval).toHaveBeenCalled();
      });
    });
  });
});
