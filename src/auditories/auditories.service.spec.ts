import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriesService } from './auditories.service';
import { PlayerExit, PlayerExitDocument } from './schemas/player.schema';
import { Bet, BetDocument } from './schemas/bet.schema';

const playerExitModel = jest.fn().mockImplementation(() => {
  return {
    save: jest.fn(),
  } as any;
});

const betModel = jest.fn().mockImplementation(() => {
  return {
    save: jest.fn(),
  } as any;
});

describe('Auditories Service', () => {
  let service: AuditoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriesService,
        {
          provide: getModelToken(PlayerExit.name),
          useValue: playerExitModel,
        },
        {
          provide: getModelToken(Bet.name),
          useValue: betModel,
        },
      ],
      imports: [ConfigModule.forRoot()],
    }).compile();

    service = module.get<AuditoriesService>(AuditoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Record Exit', () => {
    it('Should save given a valid model', async () => {
      await service.recordExit({} as PlayerExitDocument);
      expect(
        playerExitModel.mock.results[0]['value']['save'],
      ).toHaveBeenCalled();
    });
  });
  describe('Record Bet', () => {
    describe('Given a valid model', () => {
      it('Should save', async () => {
        await service.recordBet({} as BetDocument);
        expect(betModel.mock.results[0]['value']['save']).toHaveBeenCalled();
      });
    });
  });
});
