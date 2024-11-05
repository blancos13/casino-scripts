import { Test, TestingModule } from '@nestjs/testing';
import { JackpotService } from './jackpot.service';

describe('JackpotService', () => {
  let service: JackpotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JackpotService],
    }).compile();

    service = module.get<JackpotService>(JackpotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
