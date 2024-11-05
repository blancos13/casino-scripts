import { GameTypeEnum } from './../../constants/game-type.enum';
import { EntityManager } from 'typeorm';
import { Controller, UseGuards, Get, Param, Req } from '@nestjs/common';

import { AuthGuard } from './../../middlewares/auth/auth.guard';

import { HiloService } from './../../services/hilo/hilo.service';

@Controller('hilo')
@UseGuards(new AuthGuard())
export class HiloController {
  constructor(
    private readonly hiloService: HiloService,
    private readonly manager: EntityManager
  ) {}

  @Get('/stats')
  async getStatistics(): Promise<any> {
    return {
      gamers: +(await this.manager.query(`select count(DISTINCT "userId") from user_bet where game = ${GameTypeEnum.HILO}`))[0].count,
      count: +(await this.manager.query(`select count(id) from user_bet where game = ${GameTypeEnum.HILO}`))[0].count,
      history: await this.manager.query(`select * from hilo_game order by date limit 15`)
    }
  }

  @Get('take/:id')
  async hiloTake(
    @Param() { id }: any,
    @Req() { user }: any,
  ): Promise<any> {
    return this.hiloService.hiloTake(id, +user.id)
  }

  @Get(':wager/:starting')
  async hilo(
    @Param() { wager, starting }: any,
    @Req() { user }: any,
  ): Promise<any> {
    return this.hiloService.hilo(wager, starting, +user.id);
  }
  
  @Get('flip/:id/:type')
  async hiloFlip(
    @Param() { id, type }: any
  ): Promise<any> {
    return this.hiloService.hiloFlip(id, type)
  }
}
