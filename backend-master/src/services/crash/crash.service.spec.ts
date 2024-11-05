import { Test, TestingModule } from '@nestjs/testing';
import { CrashService } from './crash.service';

describe('CrashService', () => {
  let service: CrashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrashService],
    }).compile();

    service = module.get<CrashService>(CrashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
