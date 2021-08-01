import { Test, TestingModule } from '@nestjs/testing';
import { BankrollService } from './bankroll.service';

describe('BankrollService', () => {
  let service: BankrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankrollService],
    }).compile();

    service = module.get<BankrollService>(BankrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
