import { GameTypeEnum } from './../../constants/game-type.enum';
import { EntityManager } from 'typeorm';
import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';

import { MinesService } from './../../services/mines/mines.service';

import { AuthGuard } from './../../middlewares/auth/auth.guard';

@Controller('mines')
export class MinesController {
  constructor(
    private readonly minesService: MinesService,
    private readonly manager: EntityManager
  ) {}

  @Get('/')
  async getStatistics(): Promise<any> {
    return {
      gamers: +(await this.manager.query(`select count(DISTINCT "userId") from user_bet where game = ${GameTypeEnum.MINES}`))[0].count,
      count: +(await this.manager.query(`select count(id) from user_bet where game = ${GameTypeEnum.MINES}`))[0].count
    }
  }

  @Get('/mul/:bombs')
  async minesMultiplier(
    @Param('bombs') bombs: number
  ): Promise<any> {
    return await this.minesService.mineMultiplier(bombs);
  }

  @Get('/mine/:id/:mine_id')
  async minesMine(
    @Param('id') id: number,
    @Param('mine_id') mine_id: number,
  ): Promise<any> {
    return await this.minesService.minesMine(id, mine_id);
  }

  @Get('/take/:id')
  @UseGuards(new AuthGuard())
  async minesTake(
    @Param('id') id: number,
  ): Promise<any> {
    return await this.minesService.minesTake(id);
  }

  @Get('/:wager/:bombs')
  @UseGuards(new AuthGuard())
  async mines(
    @Param('wager') wager: number,
    @Param('bombs') bombs: number,
    @Req() { user }: any
  ): Promise<any> {
    return await this.minesService.mines(wager, bombs, user.id);
  }
}
