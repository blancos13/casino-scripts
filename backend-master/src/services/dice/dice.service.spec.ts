import { Test, TestingModule } from '@nestjs/testing';
import { DiceService } from './dice.service';

describe('DiceService', () => {
  let service: DiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiceService],
    }).compile();

    service = module.get<DiceService>(DiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
