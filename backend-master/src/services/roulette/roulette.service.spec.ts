import { Test, TestingModule } from '@nestjs/testing';
import { RouletteService } from './roulette.service';

describe('RouletteService', () => {
  let service: RouletteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RouletteService],
    }).compile();

    service = module.get<RouletteService>(RouletteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
