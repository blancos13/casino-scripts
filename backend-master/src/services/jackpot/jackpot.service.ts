import { JackpotGameBet } from './../../models/games/jackpot/jackpot-bet.entity';
import { JackpotGame } from './../../models/games/jackpot/jackpot.entity';
import { ROULETTE } from './../../constants/settings';
import { GameTypeEnum } from './../../constants/game-type.enum';
import { UserService } from './../user/user.service';
import { GatewayService, NewBalanceBody } from './../gateway/gateway.service';
import { SettingsService } from './../settings/settings.service';
import { UserBet } from './../../models/user/user-bet.entity';
import { User } from './../../models/user/user.entity';
import { RouletteBetType, RouletteGameBet } from './../../models/games/roulette/roulette-bet.entity';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { RandomService } from '../random/random.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, In, Repository } from 'typeorm';
import WS_BALANCE from '../../constants/websocket/balance'
import WS_JACKPOT from '../../constants/websocket/jackpot'
import { IsNull } from 'typeorm/index';
import { Cron, CronExpression } from '@nestjs/schedule';

class JackpotGameView {
  public id: number;
  public date: Date;
  public muchWin: number;
  public winUserName: string;
  public winUserId: number;
  public bets: TeamGameSideView;
  public serverDate: Date;

  static async build(game: JackpotGame, manager: EntityManager): Promise<JackpotGameView> {
    const gameView = new JackpotGameView();

    gameView.id = game.id;
    gameView.date = game.date;
    gameView.winUserId = game.winUserId;
    gameView.serverDate = new Date();
    gameView.muchWin = 0;

    const bets = await game.bets(manager)

    let users = [];
    if (bets.length > 0) {
      gameView.muchWin = bets.reduceRight((prev, itm) => itm.amount + prev, 0);

      users = await manager.find(User,
        { id: In([ ...bets.map(bet => bet.userId) ])
      });
    }

    if (game.winUserId) {
      const data = (await manager.query(`select username from public."user" where id = ${game.winUserId}`))[0]      
      gameView.winUserName = data.username
    }

    gameView.bets = await TeamGameSideView.build(bets, users);
    
    return gameView;
  }
}

class TeamGameSideView {
  public sum: number;
  public percent: number;
  public bets: TeamGameSideBetView[];

  static async build(teamGameBets: JackpotGameBet[], users: User[]): Promise<TeamGameSideView> {
    const sideView = new TeamGameSideView();
    sideView.sum = +(teamGameBets.map(bet => bet.bet.bet).reduce((betSum, bet) => betSum + bet, 0)).toFixed(2);
    sideView.percent = sideView.sum / (sideView.sum) * 100;
    if (!sideView.percent) {
      sideView.percent = 0;
    } else {
      sideView.percent = +sideView.percent.toFixed(2);
    }
    sideView.bets = [];

    for (const entry of TeamGameSideView.groupByUser(teamGameBets)) {
      const betView = new TeamGameSideBetView();
      const user = users.find(user => user.id === entry.userId);
      betView.userId = user.id;
      betView.userName = user.username;
      betView.photo = user.photoUrl;
      betView.id = entry.bets[0].id;
      betView.amount = entry.bets[0].amount;
      betView.chance = entry.bets[0].chance;
      betView.sum = entry.bets.map(bet => bet.bet.bet).reduce((totalSum, value) => totalSum + value, 0);
      betView.percent = +(betView.sum / sideView.sum * 100).toFixed(2);

      sideView.bets.push(betView);
    }
    return sideView;
  }

  public static groupByUser(bets: JackpotGameBet[]): TeamBetUserEntry[] {
    const mapped = [];
    bets.forEach(bet => {
      const entry = mapped.find(mappedItem => mappedItem.userId === bet.userId);
      if (entry) {
        entry.bets.push(bet);
      } else {
        mapped.push(new TeamBetUserEntry(bet.userId, [bet]));
      }
    });
    return mapped;
  }
}

class TeamBetUserEntry {
  constructor(public userId: number, public bets: JackpotGameBet[]) {}
}

class TeamGameSideBetView {
  public userId: number;
  public userName: string;
  public id: number;
  public photo: string;
  public sum: number;
  public amount: number;
  public chance: number;
  public percent: number;
}

let isRunningCalculatingScheduler = false;

@Injectable()
export class JackpotService {
  constructor(
    private randomService: RandomService,
    private keyValueService: SettingsService,
    private userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private connection: Connection,
    @Inject(forwardRef(() => GatewayService))
    private wsGateway: GatewayService
  ) {}

  async getGameView(userId?: number) {
    return this.connection.transaction(async manager => {
      return await JackpotGameView.build(await this.getCurrentGame(manager, userId), manager);
    })
  }

  public async getCurrentGame(manager?: EntityManager, userId?: number): Promise<JackpotGame> {
    const manag = manager || this.connection.manager
    let game = await manag.findOne(JackpotGame, { winUserId: IsNull() });
    if (game) {
      const bets = await game.bets(manag)
      
      if (bets.length) {
        if (!userId) {
          return game
        }
        const gameWithThisUser = bets.find(itm => itm.userId === userId)
        if (gameWithThisUser) {
          return game
        } else {
          game = new JackpotGame();    
          return await manag.save(game);
        }
      } else {
        game
      }
      return game
    }
    
    game = new JackpotGame();    
    return await manag.save(game);
  }

  private async calculateResults(manager: EntityManager): Promise<any> {
    let winnersBet: JackpotGameBet

    const game = await this.getCurrentGame(manager)
    const bets = await game.bets(manager)

    const bank = bets.reduceRight((prev, itm) => prev + itm.amount, 0)

    let winnersSum: number
    let losersBets: JackpotGameBet[]
    let losersSum: number

    const winBet = bets[await this.randomService.getRandom(0, bets.length)]
    const winUserId = winBet.userId

    game.winUserId = winUserId;
    winnersBet = winBet
    winnersSum = winBet.amount;
    losersBets = [...bets.filter(itm => itm.id !== winBet.id)];
    losersSum = bets.reduceRight((prev, itm) => itm.id !== winBet.id ? itm.amount + prev : 0, 0);

    await manager.save(game)

    // Делим банк у победителей и сохраняем в историю ставок
    const user = await this.userRepository.findOne({ id: winnersBet.userId });
    const gainCommissionPercents = +(await this.keyValueService.get('JACKPOT_GAIN_COMMISSION'));

    const userBet = winnersBet.bet;
    const betSum = userBet.bet;

    const commissionSum = (bank - betSum) * gainCommissionPercents / 100;
    const prize = bank - betSum - commissionSum;

    userBet.prize = +prize;
    userBet.commission = commissionSum;

    await manager.save(userBet);

    await this.userService.changeBalance({ balance: prize, id: user.id }, manager, `Победа в джекпоте ${game.id}`);
    setTimeout(async () => {
      await this.wsGateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(userBet.prize, await this.userService.getBalance(user.id, this.connection.manager))), user.id);
    }, 7000);

    // Сохраняем историю ставок проигравших
    for (const looseBet of losersBets) {
      const looseUserBet = looseBet.bet;
      // looseUserBet.chance = +(losersSum / bank * 100);
      looseUserBet.prize = 0;
      await manager.save(looseUserBet);
    }

    setTimeout(async () => {
      const bets = await game.bets(this.connection.manager);

      this.wsGateway.sendAllBetsHistory(new Set([
        ...bets.map(bet => bet.userId)
      ]));
    }, 7500);

    return game;
  }

  private async startGame(game: JackpotGame, manager: EntityManager): Promise<JackpotGame> {
    const date = new Date()
    date.setTime(date.getTime() + 30 * 1000)
    game.date = date
    game = await manager.save(game)

    this.wsGateway.broadcastAll(WS_JACKPOT.JACKPOT_GAME_START, JSON.stringify(game))
    return game
  }

  public async play(sum: number, gameId: number, chance: number, userId: number): Promise<void> {
    let userBetId: number;
    const gameResult = await this.connection.transaction(async manager => {
      let game = await this.getCurrentGame(manager);

      if (game.id !== gameId) {
        throw new BadRequestException('Игра уже закончилась');
      }

      const bets = await game.bets(manager)

      if (bets.length > 2) {
        throw new BadRequestException('Ставки в игре уже сделаны');
      }

      const balanceData = (await manager.query(`select balance from public."user" where id = ${userId}`))[0];
      const balance = +balanceData.balance.toFixed(2);

      if (balance < sum) {
        throw new BadRequestException('NOT_ENOUGH_BALANCE');
      }

      const user = await manager.findOne(User, { id: userId });

      const conditions: any = {
        userId: user.id,
        battle: game
      }

      let teamGameBet = await manager.findOne(JackpotGameBet, conditions);
      
      if (!teamGameBet) {
        const userBet = new UserBet();
        userBet.date = new Date();
        userBet.userId = userId;
        userBet.game = GameTypeEnum.JACKPOT;
        userBet.bet = 0;
        userBet.chance = chance;

        teamGameBet = new JackpotGameBet();

        teamGameBet.userId = user.id;
        teamGameBet.battle = game;
        teamGameBet.amount = 0;
        teamGameBet.chance = chance;
        teamGameBet.bet = userBet;
        // обновление ставки пользователя
      }

      teamGameBet.bet.date = new Date();
      teamGameBet.bet.bet += sum;

      teamGameBet.amount += sum;

      teamGameBet = await manager.save(teamGameBet);
      userBetId = teamGameBet.bet.id;

      await this.userService.changeBalance({ balance: -sum, id: userId }, manager, `Ставка в джекпоте ${game.id}`);
      this.wsGateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(-sum, await this.userService.getBalance(userId, manager))), userId);

      if (!game.date) {
        const checkResult = (await manager.query(`select count(id) from jackpot_game_bet where "battleId" = ${game.id}`))[0];
        
        // Если 2 игрока, начинается игра
        if (+checkResult.count > 1) {
          game = await this.startGame(game, manager);
        }
      }

      return game
    })

    const view = await JackpotGameView.build(gameResult, this.connection.manager)

    this.wsGateway.broadcastAll(WS_JACKPOT.JACKPOT_GAME_BET, JSON.stringify(view));
    this.wsGateway.sendAllBetsHistory(new Set([...view.bets.bets.map(bet => bet.userId)]));
    this.wsGateway.broadcastUser(WS_JACKPOT.JACKPOT_GAME_BET_ANSWER, JSON.stringify(view), userId);
  }

  @Cron(CronExpression.EVERY_SECOND)
  private async runCalculatingScheduler() {
    if(isRunningCalculatingScheduler) {
      return
    }

    try {
      isRunningCalculatingScheduler = true;

      await this.connection.transaction(async manager => {
        let game = await this.getCurrentGame(manager);

        if (game.date && game.date.getTime() <= new Date().getTime() && game.winUserId === null) {
          game = await this.calculateResults(manager);

          const view = await JackpotGameView.build(game, manager);
          this.wsGateway.broadcastAll(WS_JACKPOT.JACKPOT_GAME_RESULT, JSON.stringify(view));
        }
      })
    } finally {
      isRunningCalculatingScheduler = false;
    }
  }
}