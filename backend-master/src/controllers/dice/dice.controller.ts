import { DICE } from './../../constants/settings';
import { AuthGuard } from './../../middlewares/auth/auth.guard';
import { GameTypeEnum } from './../../constants/game-type.enum';
import { EntityManager } from 'typeorm';
import { SettingsService } from './../../services/settings/settings.service';
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { IsNumber, IsPositive, Min } from 'class-validator';
import { DiceService, DiceResult } from '../../services/dice/dice.service'

class DicePlayRequest {
  @IsPositive({message: 'Сумма ставки должна быть полножительной'})
  @IsNumber({},{message: 'Сумма ставки должны быть числом'})
  @Min(1, {message: 'Минимальная сумма ставки 1 рубль'})
  public sum: number;

  @IsPositive({message: 'Шанс ставки должен быть полножительной'})
  @IsNumber({},{message: 'Шанс ставки должен быть числом'})
  public chance: number;
}

@Controller('/dice')
export class DiceController {
  constructor(
    private manager: EntityManager,
    private diceService: DiceService,
    private settingsService: SettingsService) {
  }

  @Get('/stats')
  async getStatistics(): Promise<any> {
    return {
      gamers: +(await this.manager.query(`select count(DISTINCT "userId") from user_bet where game = ${GameTypeEnum.DICE}`))[0].count,
      count: +(await this.manager.query(`select count(id) from user_bet where game = ${GameTypeEnum.DICE}`))[0].count
    }
  }

  @Post('/play')
  @UseGuards(new AuthGuard())
  play(@Body() body: DicePlayRequest, @Request() req): Promise<DiceResult> {
    return this.diceService.play(body.sum, body.chance, req.user)
  }

  @Get('/settings')
  public async getSettings(): Promise<any> {
    return {
      commission: +(await this.settingsService.get(DICE.DICE_BET_COMMISSION)),
      defaultChance: +(await this.settingsService.get(DICE.DICE_DEFAULT_WIN_CHANCE)),
      minChance: +(await this.settingsService.get(DICE.DICE_MIN_WIN_CHANCE)),
      maxChance: +(await this.settingsService.get(DICE.DICE_MAX_WIN_CHANCE))
    }
  }
}