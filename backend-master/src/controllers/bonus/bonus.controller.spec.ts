import { Test, TestingModule } from '@nestjs/testing';
import { BonusController } from './bonus.controller';

describe('BonusController', () => {
  let controller: BonusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BonusController],
    }).compile();

    controller = module.get<BonusController>(BonusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
