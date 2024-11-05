import {UserBet} from './../../models/user/user-bet.entity';
import {User} from './../../models/user/user.entity';
import {CrashGameBet} from './../../models/games/crash-bet.entity';
import {GatewayService, NewBalanceBody} from './../gateway/gateway.service';
import {ProvablyFairService} from './../provably-fair/provably-fair.service';
import {RandomService} from './../random/random.service';
import {UserService} from './../user/user.service';
import {AVAILABLE_GAMES, CRASH} from './../../constants/settings';
import {SettingsService} from './../settings/settings.service';
import {Connection, EntityManager, In, IsNull, Not, Repository} from 'typeorm';
import {Crash} from './../../models/games/crash.entity';
import {Cron, CronExpression} from '@nestjs/schedule';
import {BadRequestException, forwardRef, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import WS_BALANCE from '../../constants/websocket/balance'
import WS_CRASH from '../../constants/websocket/crash'
import {GameStatusEnum} from 'src/models/games/enum/game-status.enum';
import {GameTypeEnum} from 'src/constants/game-type.enum';

class BattleGameView {
  public id: number;
  public date: Date;
  public muchWin: number;
  public winUserName: string;
  public winUserId: number;
  public bets: TeamGameSideView;
  public serverDate: Date;

  static async build(game: Crash, manager: EntityManager): Promise<BattleGameView> {
    const gameView = new BattleGameView();

    gameView.id = game.id;
    gameView.date = game.date;
    gameView.winUserId = game.win;
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

    if (gameView.winUserId) {
      const data = (await manager.query(`select username from public."user" where id = ${gameView.winUserId}`))[0]
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

  static async build(teamGameBets: CrashGameBet[], users: User[]): Promise<TeamGameSideView> {
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
      betView.withdraw = entry.bets[0].autoPay;
      betView.sum = entry.bets.map(bet => bet.bet.bet).reduce((totalSum, value) => totalSum + value, 0);
      betView.percent = +(betView.sum / sideView.sum * 100).toFixed(2);

      sideView.bets.push(betView);
    }
    return sideView;
  }

  public static groupByUser(bets: CrashGameBet[]): TeamBetUserEntry[] {
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
  constructor(public userId: number, public bets: CrashGameBet[]) {}
}

class TeamGameSideBetView {
  public userId: number;
  public userName: string;
  public id: number;
  public photo: string;
  public sum: number;
  public amount: number;
  public withdraw: number;
  public percent: number;
}

let isRunningCalculatingScheduler = false;

@Injectable()
export class CrashService {
  private readonly name = 'crash'

  constructor(
    private readonly manager: EntityManager,
    private readonly settingsService: SettingsService,
    private readonly randomService: RandomService,
    private readonly userService: UserService,
    private readonly connection: Connection,
    private readonly provablyFair: ProvablyFairService,
    @Inject(forwardRef(() => GatewayService))
    private wsGateway: GatewayService,
    @InjectRepository(Crash)
    private readonly crashRepo: Repository<Crash>
  ) {}

  async crash(wager: number, userId: number): Promise<any> {
    const games = JSON.parse(await this.settingsService.get(AVAILABLE_GAMES))

    if (!games.includes(this.name)) {
      return {
        error_message: 'crash.errors.not_available'
      }
    }

    if (wager < 0.1) {
      return {
        error_message: 'crash.errors.min_bet'
      }
    }

    const user = await this.userService.get({ id: userId })

    if (user.balance < wager) {
      return {
        error_message: 'crash.errors.balance_not'
      }
    }

    let hash = this.provablyFair.generateServerSeed()

    const settings: any = {
      crash_s: +(await this.settingsService.get(CRASH.CRASH_FAIL_S)),
      crash_m: +(await this.settingsService.get(CRASH.CRASH_FAIL_M)),
      crash_b: +(await this.settingsService.get(CRASH.CRASH_FAIL_B)),
      crash_h: +(await this.settingsService.get(CRASH.CRASH_FAIL_H)),
      crash_u: +(await this.settingsService.get(CRASH.CRASH_FAIL_U)),
    }

    if(await this.randomService.getRandom(0, 100) > settings.crash_s) {
        if(await this.randomService.getRandom(0, 100) > settings.crash_m) {
            if(await this.randomService.getRandom(0, 100) > settings.crash_b) {
                if(await this.randomService.getRandom(0, 100) > settings.crash_h) {
                    if(await this.randomService.getRandom(0, 100) > settings.crash_u) hash = await this.provablyFair.generateSeedRange(1001, 2000, user.id);
                    else hash = await this.provablyFair.generateSeedRange(401, 1000, user.id);
                } else hash = await this.provablyFair.generateSeedRange(401, 1000, user.id);
            } else hash = await this.provablyFair.generateSeedRange(251, 400, user.id);
        } else hash = await this.provablyFair.generateSeedRange(151, 250, user.id);
    } else hash = await this.provablyFair.generateSeedRange(101, 150, user.id);

    const clientSeed = await this.provablyFair.getUserSeed(user.id)
    let at = this.provablyFair.provably_fair(hash, clientSeed)

    if (at > 20) at = 20.0
    if (at < 1) at = 1.0

    const allGames = await this.getCurrentGame(this.manager);
    console.log('GAMES: ', allGames);
    const game = allGames;
    let id = null
    let date = null

    if (game.userId === null) {
      date = new Date()
      date.setTime(date.getTime() + 30 * 1000)

      game.userId = +user.id;
      game.cell1 = at;
      game.cell2 = wager;
      game.cell3 = -1;
      game.bet = wager;
      game.status = GameStatusEnum.NEW;
      game.serverSeed = hash;
      game.date = date;

      await this.manager.save(game);
    }

    if (!game) {
      date = new Date()
      date.setTime(date.getTime() + 30 * 1000)

      const newCrash = this.crashRepo.create();
      newCrash.userId = +user.id;
      newCrash.cell1 = at;
      newCrash.cell2 = wager;
      newCrash.cell3 = -1;
      newCrash.bet = wager;
      newCrash.status = GameStatusEnum.NEW;
      newCrash.serverSeed = hash;
      newCrash.date = date;

      const crashGame = await this.crashRepo.save(newCrash);

      id = crashGame.id;

      console.log(id);
      // update user
    }

    return { id: id || game.id, date: date || game.date }
  }

  async crashTick(id: number): Promise<any> {
    const game = await this.crashRepo.findOne({ id })

    if (!game) {
      return {
        error_message: 'crash.errors.not_found'
      }
    }

    if ((+game.cell2) < 20) game.cell2 = +((+game.cell2) + 0.033);
    game.mul = +game.cell2

    await this.manager.save(game)

    if (+game.cell2 >= game.cell1) {
      if (game.cell3 === -1) {
        //        $user = User::where('id', $game->user_id)->first();
        //        $user->money = $user->money - $game->bet;
        //        $user->save();
        //        self::logTransaction(-$game->bet, 2, 3, $game->user_id);
        // update user

        game.cell3 = 1
        game.status = GameStatusEnum.REJECT
      }

      game.winBetId = 0;

      await this.manager.save(game)

      return {
        error_message: 'Вы проиграли',
        bet: game.bet
      }
    }

    return {
      mul: game.mul,
      bet: game.bet
    }
  }

  async crashTake(id: number, userId: number): Promise<any> {
    const game = await this.crashRepo.findOne({ id })

    if (!game) {
      return {
        error_message: 'crash.errors.not_found'
      }
    }

    if (game.status === GameStatusEnum.REJECT || game.status === GameStatusEnum.WIN) {
      return {
        error_message: 'crash.errors.game_is_end'
      }
    }

    let profit = game.bet * (+game.cell2 - 1)
    profit = +game.cell2 < 1 ? 0 : profit

    // const user = await this.userService.get(game.user.id)
    // update user
    //         $user->money = $user->money + $profit;
    //         $user->save();
    //         self::logTransaction($profit, 2, 3, $game->user_id);

    game.status = GameStatusEnum.WIN
    game.win = profit
    game.mul = +game.cell2
    game.winBetId = userId
    await this.manager.save(game)

    return {
      profit,
      mul: game.cell2,
      crash: game.cell1
    }
  }

  public async play(sum: number, gameId: number, withdraw: number, userId: number): Promise<void> {
    let userBetId: number;

    const gameResult = await this.connection.transaction(async manager => {
      let game = await this.getCurrentGame(manager);

      const games = JSON.parse(await this.settingsService.get(AVAILABLE_GAMES))

      if (!games.includes(this.name)) {
        throw new BadRequestException('crash.errors.not_available')
      }

      console.log(game, gameId, game.id === gameId);
      if (game.id !== gameId) {
        throw new BadRequestException('Игра уже закончилась');
      }

      const balanceData = (await manager.query(`select balance from public."user" where id = ${userId}`))[0];
      const balance = +balanceData.balance.toFixed(2);

      if (balance < sum) {
        throw new BadRequestException('NOT_ENOUGH_BALANCE');
      }

      const user = await manager.findOne(User, { id: userId });

      const conditions: any = {
        userId: user.id,
        game: game
      }

      let teamGameBet = await manager.findOne(CrashGameBet, conditions);

      if (!teamGameBet) {
        const userBet = new UserBet();
        userBet.date = new Date();
        userBet.userId = userId;
        userBet.game = GameTypeEnum.CRASH;
        userBet.bet = 0;

        teamGameBet = new CrashGameBet();

        teamGameBet.userId = user.id;
        teamGameBet.game = game;
        teamGameBet.amount = 0;
        teamGameBet.autoPay = withdraw;
        teamGameBet.bet = userBet;
        // обновление ставки пользователя
      }

      teamGameBet.bet.date = new Date();
      teamGameBet.bet.bet += sum;

      teamGameBet.amount += sum;

      teamGameBet = await manager.save(teamGameBet);
      userBetId = teamGameBet.bet.id;

      await this.userService.changeBalance({ balance: -sum, id: userId }, manager, `Ставка в краше ${game.id}`);
      this.wsGateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(-sum, await this.userService.getBalance(userId, manager))), userId);

      if (!game.date) {
        const checkResult = (await manager.query(`select count(id) from crash_game_bet where "battleId" = ${game.id}`))[0];

        game = await this.startGame(game, manager);
      }

      return game
    })

    const view = await BattleGameView.build(gameResult, this.connection.manager)

    this.wsGateway.broadcastAll(WS_CRASH.CRASH_GAME_BET, JSON.stringify(view));
    this.wsGateway.sendAllBetsHistory(new Set([...view.bets.bets.map(bet => bet.userId)]));
    this.wsGateway.broadcastUser(WS_CRASH.CRASH_GAME_BET_ANSWER, JSON.stringify(view), userId);
  }

  private async lockCurrentGame(manager: EntityManager): Promise<void> {
    await manager.query('select * from crash_game where "winBetId" is null');
  }

  async getGame() {
    return this.connection.transaction(async manager => {
      return BattleGameView.build(await this.getCurrentGame(manager), manager)
    })
  }

  async getCurrentGame(manager: EntityManager, userId = 0): Promise<any> {
    await this.lockCurrentGame(manager);
    const query: any = (userId > 0) ? {
      winBetId: IsNull(),
      userId: Not(null),
      status: Not(null),
    } : {
      winBetId: IsNull(),
    };

    let game = await manager.findOne(Crash, query);

    if (game) {
      return game;
    }

    game = new Crash();
    return await manager.save(game);
  }

  private async startGame(game: any, manager: EntityManager): Promise<any> {
    const date = new Date();
    date.setTime(date.getTime() + 60 * 1000);
    game.date = date;

    // let hash = this.provablyFair.generateServerSeed()

    // const settings: any = {
    //   crash_s: +(await this.settingsService.get(CRASH.CRASH_FAIL_S)),
    //   crash_m: +(await this.settingsService.get(CRASH.CRASH_FAIL_M)),
    //   crash_b: +(await this.settingsService.get(CRASH.CRASH_FAIL_B)),
    //   crash_h: +(await this.settingsService.get(CRASH.CRASH_FAIL_H)),
    //   crash_u: +(await this.settingsService.get(CRASH.CRASH_FAIL_U)),
    // }

    // if(await this.randomService.getRandom(0, 100) > settings.crash_s) {
    //     if(await this.randomService.getRandom(0, 100) > settings.crash_m) {
    //         if(await this.randomService.getRandom(0, 100) > settings.crash_b) {
    //             if(await this.randomService.getRandom(0, 100) > settings.crash_h) {
    //                 if(await this.randomService.getRandom(0, 100) > settings.crash_u) hash = await this.provablyFair.generateSeedRange(1001, 2000, user.id);
    //                 else hash = await this.provablyFair.generateSeedRange(401, 1000, user.id);
    //             } else hash = await this.provablyFair.generateSeedRange(401, 1000, user.id);
    //         } else hash = await this.provablyFair.generateSeedRange(251, 400, user.id);
    //     } else hash = await this.provablyFair.generateSeedRange(151, 250, user.id);
    // } else hash = await this.provablyFair.generateSeedRange(101, 150, user.id);

    // const clientSeed = await this.provablyFair.getUserSeed(user.id)
    // let at = this.provablyFair.provably_fair(hash, clientSeed)

    // if (at > 20) at = 20.0
    // if (at < 1) at = 1.0

    // const game = (await this.manager.query(`select * from crash_game where user_id = ${user.id} and status = ${GameStatusEnum.NEW}`))[0]
    // let id = null
    // let date = null

    // if (!game) {
    //   date = new Date()
    //   date.setTime(date.getTime() + 30 * 1000)

      // id = await this.create({
      //   wager: +wager,
      //   user,
      //   cell1: at,
      //   cell2: 1,
      //   cell3: -1,
      //   amount: -1,
      //   status: GameStatusEnum.NEW,
      //   serverSeed: hash,
      //   date
      // })

      // update user
    // }

    game = await manager.save(game);

    const view = await BattleGameView.build(game, manager);

    this.wsGateway.broadcastAll(WS_CRASH.CRASH_GAME_START, JSON.stringify(view));
    return game;
  }

  private async calculateResults(manager: EntityManager): Promise<Crash> {
      let winnersBets: CrashGameBet[];

      await this.lockCurrentGame(manager);
      const game = await this.getCurrentGame(manager);

  //     const greenBets = await game.greenBets(manager);
  //     const greenSum = greenBets.reduce((sum, bet) => sum + bet.bet.bet, 0);

  //     const redBets = await game.redBets(manager);
  //     const redSum = redBets.reduce((sum, bet) => sum + bet.bet.bet, 0);

  //     const grayBets = await game.grayBets(manager);
  //     const graySum = grayBets.reduce((sum, bet) => sum + bet.bet.bet, 0);

  //     const bank = greenSum + redSum + graySum;

  //     let winnersSum: number;
  //     let losersBets: RouletteGameBet[];
  //     let losersSum: number;

  //     if ((await this.randomService.getRandom(1, 100)) <= greenSum / bank * 100) {
  //       game.winSide = RouletteBetType.GREEN;
  //       winnersBets = await game.greenBets(manager);
  //       winnersSum = greenSum;
  //       losersBets = [...await game.redBets(manager), ...await game.grayBets(manager)];
  //       losersSum = redSum + graySum;
  //     } else if ((await this.randomService.getRandom(1, 100)) <= redSum / bank * 100) {
  //       game.winSide = RouletteBetType.RED;
  //       winnersBets = await game.redBets(manager);
  //       winnersSum = redSum;
  //       losersBets = [...await game.greenBets(manager), ...await game.grayBets(manager)];
  //       losersSum = graySum + greenSum;
  //     } else {
  //       game.winSide = RouletteBetType.GRAY;
  //       winnersBets = await game.grayBets(manager);
  //       winnersSum = graySum;
  //       losersBets = [...await game.greenBets(manager), ...await game.redBets(manager)];
  //       losersSum = redSum + greenSum;
  //     }

  //     await manager.save(game);

  //     // Делим банк у победителей и сохраняем в историю ставок
  //     const mapped = TeamGameSideView.groupByUser(winnersBets);

  //     for (const entry of mapped) {
  //       const user = await this.userRepository.findOne({ id: entry.userId });
  //       const gainCommissionPercents = +(await this.keyValueService.get(ROULETTE.TEAM_GAME_GAIN_COMMISSION));

  //       for (const teamGameBet of entry.bets) {
  //         const userBet = teamGameBet.bet;
  //         const betSum = userBet.bet;

  //         const commissionSum = (betSum / winnersSum * bank - betSum) * gainCommissionPercents / 100;
  //         const prize = (betSum / winnersSum) * bank - commissionSum;

  //         userBet.prize = +prize;
  //         userBet.chance = +(winnersSum / bank * 100);
  //         userBet.commission = commissionSum;

  //         await manager.save(userBet);

  //         await this.userService.changeBalance({ balance: prize, id: user.id }, manager, `Победа в рулетке ${game.id}`);
  //         setTimeout(async () => {
  //           await this.wsGateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(userBet.prize, await this.userService.getBalance(user.id, this.connection.manager))), user.id);
  //         }, 7000);
  //       }
  //     }

  //     // Сохраняем историю ставок проигравших
  //     for (const looseBet of losersBets) {
  //       const looseUserBet = looseBet.bet;
  //       looseUserBet.chance = +(losersSum / bank * 100);
  //       looseUserBet.prize = 0;
  //       await manager.save(looseUserBet);
  //     }


  //   setTimeout(async () => {
  //     const grayBets = await game.grayBets(this.connection.manager);
  //     const greenBets = await game.greenBets(this.connection.manager);
  //     const redBets = await game.redBets(this.connection.manager);

  //     this.wsGateway.sendAllBetsHistory(new Set([
  //       ...greenBets.map(bet => bet.userId),
  //       ...grayBets.map(bet => bet.userId),
  //       ...redBets.map(bet => bet.userId),
  //     ]));
  //   }, 7500);

    return game;
  }

  @Cron(CronExpression.EVERY_SECOND)
  private async runCalculatingScheduler() {
    if(isRunningCalculatingScheduler) {
      return
    }

    try {
      isRunningCalculatingScheduler = true;

      await this.connection.transaction(async manager => {
        await this.lockCurrentGame(manager);
        let game = await this.getCurrentGame(manager);

        if (game.date && game.date.getTime() <= new Date().getTime() && game.winSide === null) {
          game = await this.calculateResults(manager);

          const view = await BattleGameView.build(game, manager);
          this.wsGateway.broadcastAll(WS_CRASH.CRASH_GAME_RESULT, JSON.stringify(view));
        }
      })
    } finally {
      isRunningCalculatingScheduler = false;
    }
  }
}
