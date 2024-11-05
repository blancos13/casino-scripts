import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { SettingsService } from '../../services/settings/settings.service';

@ApiTags('Services: Common controller')
@Controller('services')
export class ServicesController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('/full-block')
  async getFullBlockData(): Promise<any> {
    return {
      title: 'title',
      description: 'description',
      background: 'background',
    };
  }
}
