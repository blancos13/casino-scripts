import { Test, TestingModule } from '@nestjs/testing';
import { RouletteController } from './roulette.controller';

describe('RouletteController', () => {
  let controller: RouletteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouletteController],
    }).compile();

    controller = module.get<RouletteController>(RouletteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
