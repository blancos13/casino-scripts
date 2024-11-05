import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { NewBalanceBody, GatewayService } from './../gateway/gateway.service';
import { GameTypeEnum } from './../../constants/game-type.enum';
import { DICE } from './../../constants/settings';
import { UserService } from './../user/user.service';
import { User } from './../../models/user/user.entity';
import { SettingsService } from './../settings/settings.service';
import { BadRequestException, Injectable, forwardRef, Inject, } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { RandomService } from '../random/random.service';
import WS_BALANCE from '../../constants/websocket/balance'

class DiceResult {
  constructor(public result: boolean, public gain: number, public showPopup: boolean, public commission: number) {}
}

@Injectable()
class DiceService {
  constructor(
    private keyValueService: SettingsService,
    private randomService: RandomService,
    private connection: Connection,
    private userService: UserService,
    @Inject(forwardRef(() => GatewayService))
    private wsGateway: GatewayService
  ) {}

  private getGainRate(chancePercent: number): number {
    return (100 / chancePercent) - 1;
  };

  public async play(sum: number, percent: number, userId: number): Promise<DiceResult> {
    let userBetId = null;
    let result = null;
    await this.connection.transaction(async manager => {
      const balanceData = (await manager.query(`select balance from public."user" where id = ${userId} for update`))[0];
      const balance = +balanceData.balance.toFixed(2);
      const lastMinuteCountQuery = `select count(id) from user_bet where (game = 0 or game = 3) and "userId" = ${userId} and date >= to_timestamp(${moment().subtract(1, 'minutes').unix()})`;
      const lastMinuteCount = +((await manager.query(lastMinuteCountQuery))[0].count);
      if (lastMinuteCount > 120) {
        throw new BadRequestException('Максимум можно сыграть 120 раз в минуту');
      }

      if (balance < sum) {
        throw new BadRequestException('NOT_ENOUGH_BALANCE');
      }

      result = await this.calculateResult(sum, percent);
      

      this.wsGateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(-sum, +(balance - sum).toFixed(2))), userId);

      const gameType = GameTypeEnum.DICE;
      const prize = result.result ? sum + result.gain : 0;
      const commission = result.result ? result.commission : 0;

      await manager.query(`insert into user_bet (game, "userId", date, bet, chance, prize, commission) values (${gameType}, ${userId}, now(), ${+sum.toFixed(2)}, ${+percent.toFixed(2)}, ${+prize.toFixed(2)}, ${+commission.toFixed(2)})`);
      userBetId = (await manager.query(`select currval('user_bet_id_seq') id`))[0].id;

      if (result.result) {
        await this.userService.changeBalance({ balance: result.gain, id: userId }, manager, `Ставка и победа в дайс ${userBetId}`);
      } else {
        await this.userService.changeBalance({ balance: -sum, id: userId }, manager, `Ставка и поражение в дайс ${userBetId}`);
      }

      return result;
    });


    if (result.result) {
      this.wsGateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(+(sum + result.gain).toFixed(2), await this.userService.getBalance(userId, this.connection.manager))), userId);
    }

    this.wsGateway.sendAllBetsHistory(new Set([userId]));

    return result;
  }


  private async calculateResult(sum: number, percent: number): Promise<DiceResult> {
    const minPercents = +(await this.keyValueService.get(DICE.DICE_MIN_WIN_CHANCE));
    const maxPercents = +(await this.keyValueService.get(DICE.DICE_MAX_WIN_CHANCE));
    const commissionPercents = +(await this.keyValueService.get(DICE.DICE_BET_COMMISSION));
    const degradationChancePercents = +(await this.keyValueService.get(DICE.DICE_CHANCE_DEGRADATION));


    if (percent < minPercents) {
      throw new BadRequestException(`Шанс не может быть меньше ${minPercents}%`);
    } else if (percent > maxPercents) {
      throw new BadRequestException(`Шанс не может быть больше ${maxPercents}%`);
    }

    const random = await this.randomService.getRandom(1, 10000);

    const calculatingPercent = percent * (1 - degradationChancePercents / 100);
    const result = random <= calculatingPercent*100;
    let showPopup = false;
    let gain = 0;
    let commission = 0;
    if (result) {
      gain = sum * this.getGainRate(percent); // базовый выигрыш

      commission = gain * (commissionPercents / 100);
      gain = +(gain - commission).toFixed(2); // минус комиссия

      showPopup = random > 20;
    }

    return new DiceResult(result, gain, showPopup, commission);
  }
}

export { DiceResult, DiceService };
