import { UserDecorator } from './../../middlewares/decorators/user/user.decorator';
import { Controller, UseGuards, Post, Get, Query, Req, Param, Body } from '@nestjs/common';

import { AuthGuard } from './../../middlewares/auth/auth.guard';

import { BonusService } from './../../services/bonus/bonus.service';
import { SettingsService } from './../../services/settings/settings.service';

import { BONUSES } from './../../constants/settings';

@Controller('bonus')
export class BonusController {
    constructor(
        private readonly bonusService: BonusService,
        private readonly settingService: SettingsService
    ) {}

    @UseGuards(new AuthGuard())
    @Get('/activate/one-time')
    async activateOneTimeBonus(
        @Req() req: any,
        @Query('name') name: string,
    ): Promise<boolean> {
        return await this.bonusService.activate(name, req.user)
    }

    @UseGuards(new UserDecorator())
    @Get('/diamonds')
    async getSelectedDiamonds(
        @Req() req: any
    ): Promise<number> {
        return await this.bonusService.getSelectedDiamonds(req.user && req.user.id)
    }

    @UseGuards(new UserDecorator())
    @Get('/quests')
    async getQuests(
        @Req() req: any,
    ): Promise<any> {
        return await this.bonusService.getBonusState(req.user && req.user.id)
    }

    @UseGuards(new AuthGuard())
    @Post('/quests')
    takeDailyBonus(
        @Req() req: any,
        @Body() body: any
    ): Promise<any> {
      return this.bonusService.takeBonus(req.user.id, body.id);
    }

    @Get('/chest')
    async getChest(): Promise<number> {
        return +(await this.settingService.get(BONUSES.COUNT_DIAMOND_NEED_FOR_OPEN_CHEST))
    }

    @UseGuards(new AuthGuard())
    @Post('/chest')
    async takeChest(
        @Req() req: any
    ): Promise<boolean> {
        return this.bonusService.takeChest(req.user.id)
    }
}
