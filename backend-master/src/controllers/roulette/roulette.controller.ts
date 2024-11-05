import { EntityManager } from 'typeorm';
import { Controller, Get, Request } from '@nestjs/common';
import { RouletteService, RouletteGameView } from '../../services/roulette/roulette.service'
import { RouletteBetType } from '../../models/games/roulette/roulette-bet.entity'

@Controller('roulette')
export class RouletteController {
  constructor(
    private manager: EntityManager,
    private teamService: RouletteService) {
  }

  @Get('/stats')
  async getStats(): Promise<any> {
    const counts = await this.manager.query(`select * from roulette_game where "winSide" is not null order by date desc limit 100`)
    
    return {
      counts: {
        red: counts.filter(itm => itm.winSide === RouletteBetType.RED).length,
        green: counts.filter(itm => itm.winSide === RouletteBetType.GREEN).length,
        gray: counts.filter(itm => itm.winSide === RouletteBetType.GRAY).length,
      },
      history: await this.manager.query(`select "winSide" from roulette_game where "winSide" is not null order by date desc limit 10`)
    }
  }

  @Get('/current')
  async getCurrentGame(@Request() req): Promise<RouletteGameView> {
    return this.teamService.getCurrentGameView()
  }
}