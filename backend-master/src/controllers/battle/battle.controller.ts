import { AuthGuard } from './../../middlewares/auth/auth.guard';
import { GameTypeEnum } from './../../constants/game-type.enum';
import { BattleService } from './../../services/battle/battle.service';
import { EntityManager } from 'typeorm';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('battle')
@UseGuards(new AuthGuard())
export class BattleController {
  constructor(
    private readonly manager: EntityManager,
    private readonly battleService: BattleService
  ) {}

  @Get('/stats')
  async getStats(): Promise<any> {
    return {
      gamers: +(await this.manager.query(`select count(DISTINCT "userId") from user_bet where game = ${GameTypeEnum.BATTLE}`))[0].count,
      count: +(await this.manager.query(`select count(id) from user_bet where game = ${GameTypeEnum.BATTLE}`))[0].count,
      history: await this.manager.query(`select prize from user_bet where game = ${GameTypeEnum.BATTLE} order by date limit 100`)
    }
  }

  @Get('/current')
  async getCurrentGame(): Promise<any> {
    return this.battleService.getGameView()
  }
}
