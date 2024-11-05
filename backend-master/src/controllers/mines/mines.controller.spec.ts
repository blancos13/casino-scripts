import { Test, TestingModule } from '@nestjs/testing';
import { MinesController } from './mines.controller';

describe('MinesController', () => {
  let controller: MinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinesController],
    }).compile();

    controller = module.get<MinesController>(MinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
