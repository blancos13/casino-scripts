import { Test, TestingModule } from '@nestjs/testing';
import { DiceController } from './dice.controller';

describe('DiceController', () => {
  let controller: DiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiceController],
    }).compile();

    controller = module.get<DiceController>(DiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
