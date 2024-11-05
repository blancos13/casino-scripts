import { Test, TestingModule } from '@nestjs/testing';
import { CrashController } from './crash.controller';

describe('CrashController', () => {
  let controller: CrashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrashController],
    }).compile();

    controller = module.get<CrashController>(CrashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
