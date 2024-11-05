import { RandomService } from './../random/random.service';
import { GatewayService, NewBalanceBody } from './../gateway/gateway.service';
import { GameTypeEnum } from './../../constants/game-type.enum';
import { UserService } from './../user/user.service';
import { CreateHiloInterface } from './../../models/games/interfaces/create-hilo.interface';
import { GameStatusEnum } from './../../models/games/enum/game-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, EntityManager } from 'typeorm'
import { Injectable, BadRequestException } from '@nestjs/common';
import { SettingsService } from './../settings/settings.service';
import { AVAILABLE_GAMES, COMMISSION } from './../../constants/settings';
import { Hilo } from './../../models/games/hilo.entity';
import WS_BALANCE from '../../constants/websocket/balance'

const types = [
  "higher",
  "lower",
  "red",
  "black",
  "29",
  "jqka",
  "ka",
  "a",
  "joker",
];

@Injectable()
export class HiloService {
  private readonly name = 'hilo'
  constructor(
    private readonly settingsService: SettingsService,
    private readonly connection: Connection,
    private readonly userService: UserService,
    private readonly randomService: RandomService,
    private readonly gateway: GatewayService,
    private readonly manager: EntityManager,
    @InjectRepository(Hilo)
    private readonly hiloRepo: Repository<Hilo>
  ) {}

  async hilo(wager: number, starting: number, userId: number):Promise<any> {
    const games = JSON.parse(await this.settingsService.get(AVAILABLE_GAMES))

    if (!games.includes(this.name)) {
      return {
        error_message: 'hilo.errors.not_available'
      }
    }

    if (+wager < 0.1) {
      return {
        error_message: 'hilo.errors.min_bet'
      }
    }

    if (+starting < 1 || +starting > 52) {
      return {
        error_message: 'hilo.errors.min_bet'
      }
    }

    if (this.getDeck()[+starting]['rank'] === 0 || this.getDeck()[+starting]['rank'] === 12) {
      return {
        error_message: 'hilo.errors.new_game'
      }
    }

    const user = await this.userService.get({ id: userId })
    const game = (await this.manager.query(`select * from hilo_game where user_id = ${userId} and status = ${GameStatusEnum.NEW}`))[0]
    let id = null

    if (!game) {
      id = await this.create({
        wager: +wager,
        amount: -1,
        user,
        status: GameStatusEnum.NEW,
        cell1: 0,
        cell2: 0,
        cell3: +starting,
      })

      const commission = +(await this.settingsService.get(COMMISSION.HILO_WIN_COMMISSION))

      this.connection.transaction(async manager => {
        await manager.query(`insert into user_bet (game, "userId", date, bet, commission, game_finished) values (${GameTypeEnum.HILO}, ${userId}, now(), ${(+wager).toFixed(2)}, ${+commission.toFixed(2)}, false)`);
        const userBetId = (await manager.query(`select currval('user_bet_id_seq') id`))[0].id;

        await this.userService.changeBalance({ id: userId, balance: -(+wager) }, manager, `Ставка в хило ${userBetId}`);
        this.gateway.sendAllBetsHistory(new Set([userId]));
        this.gateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(+(+wager).toFixed(2), await this.userService.getBalance(+userId, manager))), +userId);
      })
    }

    return { id: game ? game.id : id, wager: game ? +game.bet : +wager }
  }

  async hiloTake(id: number, userId: number):Promise<any> {
    const game = await this.get(id)

    if (!game) {
      return {
        error_message: 'hilo.errors.not_found'
      }
    }

    if (game.status !== GameStatusEnum.NEW) {
      throw new BadRequestException('Server cancelled input')
    }

    const profit = game.bet * game.cell1

    if (profit > 0) {
      this.connection.transaction(async manager => {

        const userBet = (await manager.query(`select * from user_bet where game_finished = false and "userId" = ${userId}`))[0]
        if (userBet) {
          const started = this.getDeck()[+game.cell3]
          const chance = ((started.slot / 14) * 100).toFixed(2);

          await manager.query(`update user_bet set(chance, prize, game_finished) = (${chance}, ${profit}, true) where id = ${userBet.id}`)

          let wager = profit > 0 ? profit - userBet.bet : profit
          const commis = wager / 100 * userBet.commission
          wager = wager - commis

          await this.userService.changeBalance({ id: userId, balance: wager }, manager, `Выйгрыш в хило ${userBet.id}`);
          this.gateway.sendAllBetsHistory(new Set([userId]));
          this.gateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(+(+wager).toFixed(2), await this.userService.getBalance(userId, manager))), userId);
        }
      })
    }

    game.status = profit > 0 ? 1 : 0
    game.win = profit
    game.mul = game.cell1
    await this.manager.save(game)

    return { profit }
  }

  async hiloFlip(id: number, type: string):Promise<any> {
    const game = await this.get(id)

    if (!game) {
      return {
        error_message: 'hilo.errors.not_found'
      }
    }

    if (game.status !== GameStatusEnum.NEW) {
      throw new BadRequestException('Server cancelled input')
    }

    if (types.indexOf(type) < 0) {
      return {
        error_message: 'hilo.errors.unknown_type',
      };
    }

    let random = await this.randomService.getRandom(1, 52)

    const generated = this.getDeck()[random]
    const started = this.getDeck()[+game.cell3]

    let win = true
    if ((type === 'higher' && started['rank'] > generated['rank']) || (type === 'lower' && started['rank'] < generated['rank'])) {
        win = false
    }

    if (type === 'black' && (generated['type'] === 'hearts' || generated['type'] === 'diamonds')) {
      win = false;
    }

    if (type === 'red' && (generated['type'] === 'clubs' || generated['type'] === 'spades')) {
      win = false;
    }

    if (type === '29' && (generated['rank'] > 9 || generated['rank'] === 0)) {
      win = false;
    }

    if (type === 'jqka' && (generated['rank'] !== 0 || generated['rank'] < 10)) {
      win = false;
    }

    if (type === 'ka' && (generated['rank'] !== 0 || generated['rank'] !== 12)) {
      win = false;
    }

    if (type === 'a' && generated['rank'] !== 0) {
      win = false;
    }

    if (win) {
      game.cell2 = (game.cell2 + 1).toFixed(2)
      const m = type === 'higher' ? (12.350 / (13 - (started['slot'] - 1))) : (12.350 / started['slot'])

      game.cell3 = random
      game.cell1 = game.cell1 + m
    } else game.status = GameStatusEnum.REJECT

    game.mul = game.cell1 <= 0 ? 0 : game.cell1

    await this.connection.transaction(async manager => {
      await manager.save(game)

      try {
        const userBet = (await manager.query(`select * from user_bet where game_finished = false and "userId" = ${game.user.id}`))[0]
        if (userBet) {
          const chance = ((started.slot / 14) * 100).toFixed(2);

          const profit = +game.mul * +game.bet
          await manager.query(`update user_bet set(chance, prize, game_finished) = (${chance}, ${profit}, true) where id = ${userBet.id}`)

          let wager = profit > 0 ? profit - userBet.bet : profit
          const commis = wager / 100 * userBet.commission
          wager = wager - commis

          await this.userService.changeBalance({ id: game.user.id, balance: wager }, manager, `Выйгрыш в хило ${userBet.id}`);
          this.gateway.sendAllBetsHistory(new Set([game.user.id]));
          this.gateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(+(+wager).toFixed(2), await this.userService.getBalance(game.user.id, manager))), game.user.id);
        }
      } catch (e) {
        console.log('Flip ', e);
      }
    })

    return {
      startedAt: JSON.stringify(started),
      generated: JSON.stringify(generated),
      deckIndex: random,
      win,
      games: game.cell2,
      mul: game.mul,
    }
  }

  private async create(payload: CreateHiloInterface): Promise<number> {
    try {
      const data = new Hilo({ ...payload })
      await this.manager.save(data)

      return data.id
    } catch (e) {
      console.log('Error create hilo game', e.message);
    }
  }
  private async get(id: number): Promise<any> {
    return await this.hiloRepo.findOne({ id })
  }
  private getDeck(): any {
    return {
        1 : {'type' : 'spades', 'value' : 'A', 'rank' : 0, 'slot' : 1, 'blackjackValue' : 11},
        2 : {'type' : 'spades', 'value' : '2', 'rank' : 1, 'slot' : 2, 'blackjackValue' : 2},
        3 : {'type' : 'spades', 'value' : '3', 'rank' : 2, 'slot' : 3, 'blackjackValue' : 3},
        4 : {'type' : 'spades', 'value' : '4', 'rank' : 3, 'slot' : 4, 'blackjackValue' : 4},
        5 : {'type' : 'spades', 'value' : '5', 'rank' : 4, 'slot' : 5, 'blackjackValue' : 5},
        6 : {'type' : 'spades', 'value' : '6', 'rank' : 5, 'slot' : 6, 'blackjackValue' : 6},
        7 : {'type' : 'spades', 'value' : '7', 'rank' : 6, 'slot' : 7, 'blackjackValue' : 7},
        8 : {'type' : 'spades', 'value' : '8', 'rank' : 7, 'slot' : 8, 'blackjackValue' : 8},
        9 : {'type' : 'spades', 'value' : '9', 'rank' : 8, 'slot' : 9, 'blackjackValue' : 9},
        10 : {'type' : 'spades', 'value' : '10', 'rank' : 9, 'slot' : 10, 'blackjackValue' : 10},
        11 : {'type' : 'spades', 'value' : 'J', 'rank' : 10, 'slot' : 11, 'blackjackValue' : 10},
        12 : {'type' : 'spades', 'value' : 'Q', 'rank' : 11, 'slot' : 12, 'blackjackValue' : 10},
        13 : {'type' : 'spades', 'value' : 'K', 'rank' : 12, 'slot' : 13, 'blackjackValue' : 10},
        14 : {'type' : 'hearts', 'value' : 'A', 'rank' : 0, 'slot' : 1, 'blackjackValue' : 11},
        15 : {'type' : 'hearts', 'value' : '2', 'rank' : 1, 'slot' : 2, 'blackjackValue' : 2},
        16 : {'type' : 'hearts', 'value' : '3', 'rank' : 2, 'slot' : 3, 'blackjackValue' : 3},
        17 : {'type' : 'hearts', 'value' : '4', 'rank' : 3, 'slot' : 4, 'blackjackValue' : 4},
        18 : {'type' : 'hearts', 'value' : '5', 'rank' : 4, 'slot' : 5, 'blackjackValue' : 5},
        19 : {'type' : 'hearts', 'value' : '6', 'rank' : 5, 'slot' : 6, 'blackjackValue' : 6},
        20 : {'type' : 'hearts', 'value' : '7', 'rank' : 6, 'slot' : 7, 'blackjackValue' : 7},
        21 : {'type' : 'hearts', 'value' : '8', 'rank' : 7, 'slot' : 8, 'blackjackValue' : 8},
        22 : {'type' : 'hearts', 'value' : '9', 'rank' : 8, 'slot' : 9, 'blackjackValue' : 9},
        23 : {'type' : 'hearts', 'value' : '10', 'rank' : 9, 'slot' : 10, 'blackjackValue' : 10},
        24 : {'type' : 'hearts', 'value' : 'J', 'rank' : 10, 'slot' : 11, 'blackjackValue' : 10},
        25 : {'type' : 'hearts', 'value' : 'Q', 'rank' : 11, 'slot' : 12, 'blackjackValue' : 10},
        26 : {'type' : 'hearts', 'value' : 'K', 'rank' : 12, 'slot' : 13, 'blackjackValue' : 10},
        27 : {'type' : 'clubs', 'value' : 'A', 'rank' : 0, 'slot' : 1, 'blackjackValue' : 11},
        28 : {'type' : 'clubs', 'value' : '2', 'rank' : 1, 'slot' : 2, 'blackjackValue' : 2},
        29 : {'type' : 'clubs', 'value' : '3', 'rank' : 2, 'slot' : 3, 'blackjackValue' : 3},
        30 : {'type' : 'clubs', 'value' : '4', 'rank' : 3, 'slot' : 4, 'blackjackValue' : 4},
        31 : {'type' : 'clubs', 'value' : '5', 'rank' : 4, 'slot' : 5, 'blackjackValue' : 5},
        32 : {'type' : 'clubs', 'value' : '6', 'rank' : 5, 'slot' : 6, 'blackjackValue' : 6},
        33 : {'type' : 'clubs', 'value' : '7', 'rank' : 6, 'slot' : 7, 'blackjackValue' : 7},
        34 : {'type' : 'clubs', 'value' : '8', 'rank' : 7, 'slot' : 8, 'blackjackValue' : 8},
        35 : {'type' : 'clubs', 'value' : '9', 'rank' : 8, 'slot' : 9, 'blackjackValue' : 9},
        36 : {'type' : 'clubs', 'value' : '10', 'rank' : 9, 'slot' : 10, 'blackjackValue' : 10},
        37 : {'type' : 'clubs', 'value' : 'J', 'rank' : 10, 'slot' : 11, 'blackjackValue' : 10},
        38 : {'type' : 'clubs', 'value' : 'Q', 'rank' : 11, 'slot' : 12, 'blackjackValue' : 10},
        39 : {'type' : 'clubs', 'value' : 'K', 'rank' : 12, 'slot' : 13, 'blackjackValue' : 10},
        40 : {'type' : 'diamonds', 'value' : 'A', 'rank' : 0, 'slot' : 1, 'blackjackValue' : 11},
        41 : {'type' : 'diamonds', 'value' : '2', 'rank' : 1, 'slot' : 2, 'blackjackValue' : 2},
        42 : {'type' : 'diamonds', 'value' : '3', 'rank' : 2, 'slot' : 3, 'blackjackValue' : 3},
        43 : {'type' : 'diamonds', 'value' : '4', 'rank' : 3, 'slot' : 4, 'blackjackValue' : 4},
        44 : {'type' : 'diamonds', 'value' : '5', 'rank' : 4, 'slot' : 5, 'blackjackValue' : 5},
        45 : {'type' : 'diamonds', 'value' : '6', 'rank' : 5, 'slot' : 6, 'blackjackValue' : 6},
        46 : {'type' : 'diamonds', 'value' : '7', 'rank' : 6, 'slot' : 7, 'blackjackValue' : 7},
        47 : {'type' : 'diamonds', 'value' : '8', 'rank' : 7, 'slot' : 8, 'blackjackValue' : 8},
        48 : {'type' : 'diamonds', 'value' : '9', 'rank' : 8, 'slot' : 9, 'blackjackValue' : 9},
        49 : {'type' : 'diamonds', 'value' : '10', 'rank' : 9, 'slot' : 10, 'blackjackValue' : 10},
        50 : {'type' : 'diamonds', 'value' : 'J', 'rank' : 10, 'slot' : 11, 'blackjackValue' : 10},
        51 : {'type' : 'diamonds', 'value' : 'Q', 'rank' : 11, 'slot' : 12, 'blackjackValue' : 10},
        52 : {'type' : 'diamonds', 'value' : 'K', 'rank' : 12, 'slot' : 13, 'blackjackValue' : 10},
    }
  }
}
