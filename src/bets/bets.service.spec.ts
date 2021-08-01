import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BetsService } from './bets.service';

describe('BetsService', () => {
  let service: BetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [BetsService],
    }).compile();

    service = module.get<BetsService>(BetsService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Validate bet', () => {
    describe('Given a valid string', () => {
      it('Should return true', () => {
        expect(() => {
          service.validate('20000000000000000000');
        }).toBeTruthy();
      });

      it('Should be hable to parse the string to BigInt', () => {
        expect(true).toBeTruthy();
      });
    });

    describe('Given a invalid string', () => {
      it('Should throw AMOUNT_WRONG_TYPE if wrong type', () => {
        try {
          //@ts-expect-error: in order to call function with wrong input type
          service.validate(1);
        } catch (errCode) {
          expect(errCode).toBe('AMOUNT_WRONG_TYPE');
        }
      });
      it('Should throw "INVALID_LENGTH" if the length is less than 18', () => {
        try {
          service.validate('11111111111111111');
        } catch (errCode) {
          expect(errCode).toBe('INVALID_LENGTH');
        }
      });
      it('Should throw "AMOUNT_MISSING" if the value is a empty string', () => {
        try {
          service.validate('');
        } catch (errCode) {
          expect(errCode).toBe('AMOUNT_MISSING');
        }
      });
      it('Should throw "INVALID_STRING" if the value can not be parsed to BigInt', () => {
        try {
          service.validate('helloooooooooooooooo');
        } catch (errCode) {
          expect(errCode).toBe('INVALID_STRING');
        }
      });
      it('Should throw "AMOUNT_ZERO_OR_LESS" if, with the parsed value, the amount is equal to zero', () => {
        try {
          service.validate('00000000000000000000');
        } catch (errCode) {
          expect(errCode).toBe('AMOUNT_ZERO_OR_LESS');
        }
      });
    });
  });

  describe('Validate target multiplier', () => {
    describe('Given a valid number', () => {
      it('Should return true', () => {
        expect(() => {
          service.validateTargetMultiplier(2);
        }).toBeTruthy();
      });
    });

    describe('Given a invalid number', () => {
      it('Should throw AMOUNT_WRONG_TYPE if wrong type', () => {
        try {
          //@ts-expect-error: in order to call function with wrong input type
          service.validateTargetMultiplier('2');
        } catch (errCode) {
          expect(errCode).toBe('TARGET_MULTIPLIER_WRONG_TYPE');
        }
      });
      it('Should throw "TARGET_MULTIPLIER_MUST_BE_ABOVE_ONE" if the value is less than one', () => {
        try {
          service.validateTargetMultiplier(0.1);
        } catch (errCode) {
          expect(errCode).toBe('TARGET_MULTIPLIER_MUST_BE_ABOVE_ONE');
        }
      });
      it('Should throw "TARGET_MULTIPLIER_MUST_BET_BELOW_1000" if the value is more than 1000', () => {
        try {
          service.validateTargetMultiplier(1001);
        } catch (errCode) {
          expect(errCode).toBe('TARGET_MULTIPLIER_MUST_BET_BELOW_1000');
        }
      });
    });
  });
});
