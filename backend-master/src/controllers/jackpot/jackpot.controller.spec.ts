import { Test, TestingModule } from '@nestjs/testing';
import { JackpotController } from './jackpot.controller';

describe('JackpotController', () => {
  let controller: JackpotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JackpotController],
    }).compile();

    controller = module.get<JackpotController>(JackpotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
