import { Test, TestingModule } from '@nestjs/testing';
import { ProvablyFairService } from './provably-fair.service';

describe('ProvablyFairService', () => {
  let service: ProvablyFairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvablyFairService],
    }).compile();

    service = module.get<ProvablyFairService>(ProvablyFairService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
