import { EntityManager, Repository, Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { SettingsService } from './../settings/settings.service';
import { GatewayService, NewBalanceBody } from './../gateway/gateway.service';
import { RandomService } from './../random/random.service';
import { UserService } from './../user/user.service';

import { Mines } from '../../models/games/mines.entity';

import { AVAILABLE_GAMES, COMMISSION } from './../../constants/settings';

import WS_BALANCE from '../../constants/websocket/balance'

import { GameStatusEnum } from './../../models/games/enum/game-status.enum';
import { GameTypeEnum } from './../../constants/game-type.enum';

import { CreateMinesInterface } from './../../models/games/interfaces/create-mines.interface';

@Injectable()
export class MinesService {
  private readonly name = 'mine'
  private readonly mines_min = 2
  private readonly mines_max = 24

  constructor(
    private readonly settingsService: SettingsService,
    private readonly randomService: RandomService,
    private readonly userService: UserService,
    private readonly manager: EntityManager,
    private readonly connection: Connection,
    private readonly gatewayService: GatewayService,
    @InjectRepository(Mines)
    private readonly minesRepo: Repository<Mines>
  ) {}

  async mines(wager: number, mines: number, userId: number | string): Promise<any> {
    const games = JSON.parse(await this.settingsService.get(AVAILABLE_GAMES))

    if (!games.includes(this.name)) {
      return {
        error_message: 'mines.errors.not_available'
      }
    }
    if (mines < this.mines_min || mines > this.mines_max) {
      return {
        error_message: 'games.errors.count_bombs'
      }
    }

    const user = await this.userService.get({ id: userId })

    if (+user.balance < +wager) {
      return {
        error_message: 'games.errors.balance'
      }
    }

    const game = await this.manager.query(`select id, selected, bet from mines_game where user_id = ${userId} and status = ${GameStatusEnum.NEW}`)
    
    let id = null

    if (!game.length) {
      const grid = []

      for(let i = 0; i < 5 * 5; i++) {
        grid.push(0)
      }
  
      let bombsLeft = mines
      do {
        const b = await this.randomService.getRandom(0, (5 * 5) - 1)
        if (grid[b] === 1) continue;
        grid[b] = 1
        bombsLeft -= 1
      } while (bombsLeft != 0)

      id = await this.create({
        wager,
        user,
        cell1: mines.toString(),
        cell2: '0',
        cell3: '-1',
        cell4: JSON.stringify(grid),
        status: GameStatusEnum.NEW,
        selected: '[]'
      })

      const commission = +(await this.settingsService.get(COMMISSION.MINES_WIN_COMMISSION))

      this.connection.transaction(async manager => {
        await manager.query(`insert into user_bet (game, "userId", date, bet, commission, game_finished) values (${GameTypeEnum.MINES}, ${userId}, now(), ${(+wager).toFixed(2)}, ${+commission.toFixed(2)}, false)`);
        const userBetId = (await manager.query(`select currval('user_bet_id_seq') id`))[0].id;

        await this.userService.changeBalance({ id: userId, balance: -(+wager) }, manager, `Ставка в минах ${userBetId}`);
        this.gatewayService.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(+(+wager).toFixed(2), await this.userService.getBalance(+userId, manager))), +userId);
      })
    }

    return { id: id || game[0].id, bet: wager, selected: game.length ? JSON.parse(game[0].selected) : [] }
  }
  async minesMine(id: number, mineId: number): Promise<any> {
    const game = await this.minesRepo.findOne({ id })

    if (!game) {
      return {
        error_message: 'mines.errors.not_found'
      }
    }
    if (game.status === GameStatusEnum.REJECT || game.status === GameStatusEnum.WIN) {
      return {
        error_message: 'mines.errors.game_is_end'
      }
    }

    let selected = JSON.parse(game.selected)

    if (selected.includes(+mineId)) {
      return {
        error_message: 'mines.cell_is_open'
      }
    }

    game.cell2 = (+game.cell2 + 1).toString()

    let win = true
    const grid = JSON.parse(game.cell4)
    const coefficient = this.getMinesMultiplierTable()[+game.cell1][+game.cell2]

    if (grid[mineId] === 1) {
      win = false
    }

    if (!win) {
      game.status = GameStatusEnum.REJECT
    }

    game.coefficient = coefficient
    
    selected = JSON.parse(game.selected)
    selected.push(+mineId)
    game.selected = JSON.stringify(selected)

    this.connection.transaction(async manager => {
      await manager.save(game)

      const userBet = (await manager.query(`select id, bet from user_bet where game_finished = false and "userId" = ${game.user.id}`))[0]

      if (userBet) {
        const chance = 1 / coefficient * 100

        if (win) {
          const prize = +userBet.bet * coefficient
          await manager.query(`update user_bet set (chance, prize) = (${chance.toFixed(2)}, ${prize.toFixed(2)}) where id = ${userBet.id}`)
        } else {
          await manager.query(`update user_bet set (chance, prize, game_finished) = (${chance.toFixed(2)}, 0, true) where id = ${userBet.id}`)
          await this.userService.changeBalance({ id: game.user.id, balance: -0 }, manager, `Проигрыш в минах ${userBet.id}`);
        }

        this.gatewayService.sendAllBetsHistory(new Set([game.user.id]));
      }
    })

    return {
      status: win ? 'continue' : GameStatusEnum.REJECT,
      games: +game.cell2,
      grid: win ? 'Game is still in progress' : grid,
      coefficient,
      profit: game.bet * coefficient,
      selected: JSON.parse(game.selected)
    }
  }
  async mineMultiplier(bombs: number): Promise<any> {
    return this.getMinesMultiplierTable()[+bombs]
  }
  async minesTake(id: number): Promise<any> {
    const game = await this.minesRepo.findOne({ id })

    if (!game) {
      return {
        error_message: 'mines.errors.not_found'
      }
    }

    if (game.status === GameStatusEnum.REJECT || game.status === GameStatusEnum.WIN) {
      return {
        error_message: 'mines.errors.game_is_end'
      }
    }

    const user = await this.userService.get({ id: game.user.id })

    if (!user) {
      return {
        error_message: 'mines.errors.not_found'
      }
    }

    const coefficient = +game.cell2 > 0 ? this.getMinesMultiplierTable()[game.cell1][game.cell2] : 0
    const profit = coefficient === 0 ? 0 : (game.bet * coefficient)
    const status = profit > 0 ? GameStatusEnum.WIN : GameStatusEnum.REJECT

    this.connection.transaction(async manager => {
      await manager.query(`update mines_game set (win, status, coefficient) = (${profit}, ${status}, ${coefficient}) where id = ${id}`)

      const userBet = (await manager.query(`select * from user_bet where game_finished = false and "userId" = ${user.id}`))[0]
      if (userBet) {
        await manager.query(`update user_bet set(chance, prize, game_finished) = (${coefficient}, ${profit}, true) where id = ${userBet.id}`)
        
        let wager = profit > 0 ? profit - userBet.bet : profit
        const commis = wager / 100 * userBet.commission
        wager = wager - commis

        await this.userService.changeBalance({ id: user.id, balance: wager }, manager, `Выйгрыш в минах ${userBet.id}`);
        this.gatewayService.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(+(+wager).toFixed(2), await this.userService.getBalance(user.id, manager))), user.id);
      }
    })

    return 0
  }

  private async create(payload: CreateMinesInterface): Promise<number> {
    try {
      const data = new Mines({ ...payload })
      await this.manager.save(data)

      return data.id
    } catch(e) {
      throw new Error(e);
    }
  }
  private getMinesMultiplierTable() {
    return {
      2: [1.03, 1.12, 1.23, 1.35, 1.5, 1.66, 1.86, 2.09, 2.37, 2.71, 3.13, 3.65, 4.31, 5.18, 6.36, 7.91, 10.17, 13.57, 19, 28.5, 47.5, 95, 285],
      3: [1.07, 1.23, 1.41, 1.64, 1.91, 2.25, 2.67, 3.21, 3.9, 4.8, 6, 7.63, 9.93, 13.24, 18.2, 26.01, 39.01, 62.42, 109.25, 218.5, 546.25, 2190],
      4: [1.13, 1.35, 1.64, 2, 2.48, 3.1, 3.92, 5.04, 6.6, 8.8, 12, 16.8, 24.27, 36.41, 57.22, 95.37, 171.67, 343.35, 801.16, 2400, 12020],
      5: [1.18, 1.5, 1.91, 2.48, 3.25, 4.34, 5.89, 8.15, 11.55, 16.8, 25.21, 39.21, 63.72, 109.25, 200.29, 400.58, 901.31, 2400, 8410, 50470],
      6: [1.25, 1.66, 2.25, 3.1, 4.34, 6.2, 9.06, 13.59, 21, 33.61, 56.02, 98.04, 182.02, 364.16, 801.16, 2000, 6010, 24040, 168000],
      7: [1.31, 1.86, 2.67, 3.92, 5.89, 9.06, 14.34, 23.48, 39.91, 70.96, 133.06, 266.12, 576.59, 1380, 3810, 12690, 57080, 457000],
      8: [1.39, 2.09, 3.21, 5.04, 8.15, 13.59, 23.48, 42.26, 79.83, 159.67, 342.15, 768.36, 2080, 6230, 22830, 114000, 1030000],
      9: [1.48, 2.37, 3.9, 6.6, 11.55, 21, 39.91, 79.83, 169.65, 387.77, 969.44, 2710, 8820, 35290, 194000, 1940000],
      10: [1.58, 2.71, 4.8, 8.8, 16.8, 33.61, 70.96, 159.67, 387.77, 1030, 3100, 10860, 47050, 282000, 3110000],
      11: [1.69, 3.13, 6, 12, 25.21, 56.02, 133.06, 342.15, 969.44, 3100, 11630, 54290, 353000, 4230000],
      12: [1.82, 3.65, 7.63, 16.8, 39.21, 98.04, 266.12, 798.36, 2710, 10860, 54290, 380000, 4940000],
      13: [1.97, 4.31, 9.93, 24.27, 63.72, 182.08, 576.59, 2080, 8820, 47050, 353000, 4940000],
      14: [2.15, 5.18, 13.24, 36.41, 109.25, 364.16, 1380, 6230, 35290, 282000, 4230000],
      15: [2.37, 6.33, 18.2, 57.22, 200.29, 801.16, 3810, 22830, 194000, 3100000],
      16: [2.63, 7.91, 26.01, 95.37, 400.58, 2000, 12690, 14000, 1940000],
      17: [2.96, 10.17, 39.01, 171.67, 901.31, 6010, 57080, 1030000],
      18: [3.39, 13.57, 62.42, 343.35, 2400, 24030, 457000],
      19: [3.95, 19, 109.25, 801.16, 8410, 168000],
      20: [4.75, 28.5, 218.5, 2400, 50470],
      21: [5.93, 47.5, 546.25, 12020],
      22: [7.91, 95, 2190],
      23: [11.87, 285],
      24: [23.75],
    }
  }
}
