import { MAIN_PAGE_STATISTICS } from './../../constants/settings';
import { SettingsService } from './../../services/settings/settings.service';
import { Connection } from 'typeorm';
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';

import { AuthGuard } from './../../middlewares/auth/auth.guard';

import { BetService } from '../../services/bet/bet.service';

import { UserBetListItemViewDto } from './../../models/user/dto/user-bet-item-view.dto';

@Controller('/bet')
export class BetController {
  constructor(
    private betService: BetService,
    private readonly settingService: SettingsService,
    private readonly connection: Connection
    
  ) {}

  @Get('/')
  getAllBets(
    @Query('skip') skip: number, 
    @Query('count') count: number
  ): Promise<UserBetListItemViewDto[]> {
    skip = skip ? skip : 0;
    count = count ? count : 10;

    return this.betService.getAllBets(0, 50);
  }

  @Get('/stats')
  async getStats(): Promise<any> {
    return this.connection.transaction(async manager => {
      const totalDef = +(await this.settingService.get(MAIN_PAGE_STATISTICS.TOTAL_GAMES))

      const userIdMuchWin = (await manager.query(`select "userId", prize from user_bet order by bet desc limit 1`))[0]
      let much_win = {}
      if (userIdMuchWin) {
        much_win = (await manager.query(`select username, "photoUrl" from public."user" where id = ${userIdMuchWin.userId}`))[0]
      }

      const userLuckyDay = (await manager.query(`select "userId", prize from user_bet where Date(date) = current_date order by bet desc limit 1`))[0]
      let lucky_day = {}
      if (userLuckyDay) {
        lucky_day = (await manager.query(`select username, "photoUrl" from public."user" where id = ${userLuckyDay.userId}`))[0]
      }

      return {
        total: +(await manager.query(`select count(id) from user_bet where Date(date) = current_date`))[0].count + totalDef,
        lucky_day: userLuckyDay ? { ...lucky_day, win: +userLuckyDay.prize } : {},
        much_win: userIdMuchWin ? { ...much_win, win: +userIdMuchWin.prize } : {}
      }
    })
    
  }

  @Get('/my')
  @UseGuards(new AuthGuard())
  getByBets(
    @Query('skip') skip: number,
    @Query('count') count: number,
    @Request() req: any
  ): Promise<UserBetListItemViewDto[]> {
    skip = skip ? skip : 0;
    count = count ? count : 10;
    return this.betService.getByBets(0, 50, req.user.id);
  }
}
