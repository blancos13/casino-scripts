import { Test, TestingModule } from '@nestjs/testing';
import { HiloService } from './hilo.service';

describe('HiloService', () => {
  let service: HiloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HiloService],
    }).compile();

    service = module.get<HiloService>(HiloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
