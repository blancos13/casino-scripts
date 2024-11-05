import { Test, TestingModule } from '@nestjs/testing';
import { HiloController } from './hilo.controller';

describe('HiloController', () => {
  let controller: HiloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HiloController],
    }).compile();

    controller = module.get<HiloController>(HiloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
