import { Test, TestingModule } from '@nestjs/testing';
import { BetController } from './bet.controller';

describe('BetController', () => {
  let controller: BetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BetController],
    }).compile();

    controller = module.get<BetController>(BetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
