import { Test, TestingModule } from '@nestjs/testing';
import { VkontakteService } from './vkontakte.service';

describe('VkontakteService', () => {
  let service: VkontakteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VkontakteService],
    }).compile();

    service = module.get<VkontakteService>(VkontakteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
