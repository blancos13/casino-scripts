import { AuthGuard } from './../../middlewares/auth/auth.guard';
import { JackpotService } from './../../services/jackpot/jackpot.service';
import { GameTypeEnum } from './../../constants/game-type.enum';
import { EntityManager } from 'typeorm';
import { Controller, Get, UseGuards, Request } from '@nestjs/common';

@Controller('jackpot')
@UseGuards(new AuthGuard())
export class JackpotController {
  constructor(
    private readonly manager: EntityManager,
    private readonly jackpotService: JackpotService
  ) {}

  @Get('/stats')
  async getStats(): Promise<any> {
    return {
      gamers: +(await this.manager.query(`select count(DISTINCT "userId") from user_bet where game = ${GameTypeEnum.JACKPOT}`))[0].count,
      count: +(await this.manager.query(`select count(id) from user_bet where game = ${GameTypeEnum.JACKPOT}`))[0].count,
      history: await this.manager.query(`select prize from user_bet where game = ${GameTypeEnum.JACKPOT} order by date limit 100`)
    }
  }

  @Get('/current')
  async getCurrentGame(@Request() { user }: any): Promise<any> {
    return this.jackpotService.getGameView(user.id)
  }
}
