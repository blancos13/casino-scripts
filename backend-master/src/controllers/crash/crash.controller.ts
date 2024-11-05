import { GameTypeEnum } from './../../constants/game-type.enum';
import { GameStatusEnum } from './../../models/games/enum/game-status.enum';
import { EntityManager } from 'typeorm';
import { CrashService } from './../../services/crash/crash.service';
import { AuthGuard } from './../../middlewares/auth/auth.guard';
import { Controller, UseGuards, Get, Param, Req } from '@nestjs/common';

@Controller('crash')
@UseGuards(new AuthGuard())
export class CrashController {
  constructor(
    private readonly crashService: CrashService,
    private readonly manager: EntityManager
  ) {}

  @Get('/stats')
  async getStatistics(): Promise<any> {
    return {
      gamers: +(await this.manager.query(`select count(DISTINCT "userId") from user_bet where game = ${GameTypeEnum.CRASH}`))[0].count,
      count: +(await this.manager.query(`select count(id) from user_bet where game = ${GameTypeEnum.CRASH}`))[0].count,
      history: await this.manager.query(`select prize from user_bet where game = ${GameTypeEnum.CRASH} order by date limit 100`)
    }
  }

  @Get('/current')
  async getGame(): Promise<any> {
    return this.crashService.getGame()
  }

  @Get('/:wager')
  async crash(
    @Param() { wager }: any,
    @Req() { user }: any
  ): Promise<any> {
    return this.crashService.crash(+wager, +user.id)
  }

  @Get('/tick/:id')
  async crashTick(
    @Param() { id }: any
  ): Promise<any> {
    return this.crashService.crashTick(+id)
  }

  @Get('/take/:id')
  async crashTake(
    @Param() { id }: any,
    @Req() { user }: any
  ): Promise<any> {
    return this.crashService.crashTake(+id, +user.id)
  }
}
