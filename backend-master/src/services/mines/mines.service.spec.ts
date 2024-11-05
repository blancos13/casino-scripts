import { Test, TestingModule } from '@nestjs/testing';
import { MinesService } from './mines.service';

describe('MinesService', () => {
  let service: MinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinesService],
    }).compile();

    service = module.get<MinesService>(MinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
