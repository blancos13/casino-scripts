import { ROULETTE } from './../../constants/settings';
import { GameTypeEnum } from './../../constants/game-type.enum';
import { UserService } from './../user/user.service';
import { GatewayService, NewBalanceBody } from './../gateway/gateway.service';
import { SettingsService } from './../settings/settings.service';
import { UserBet } from './../../models/user/user-bet.entity';
import { User } from './../../models/user/user.entity';
import { RouletteGame } from './../../models/games/roulette/roulette.entity';
import { RouletteBetType, RouletteGameBet } from './../../models/games/roulette/roulette-bet.entity';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { RandomService } from '../random/random.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, In, Repository } from 'typeorm';
import WS_BALANCE from '../../constants/websocket/balance'
import WS_ROULETTE from '../../constants/websocket/roulette'
import { IsNull } from 'typeorm/index';
import { Cron, CronExpression } from '@nestjs/schedule';

class RouletteGameView {
  public id: number;
  public date: Date;
  public winSide: RouletteBetType;
  public red: TeamGameSideView;
  public gray: TeamGameSideView;
  public green: TeamGameSideView;
  public serverDate: Date;

  static async build(game: RouletteGame, manager: EntityManager): Promise<RouletteGameView> {
    const gameView = new RouletteGameView();

    gameView.id = game.id;
    gameView.date = game.date;
    gameView.winSide = game.winSide;
    gameView.serverDate = new Date();

    const redBets = await game.redBets(manager);
    const grayBets = await game.grayBets(manager);
    const greenBets = await game.greenBets(manager);

    let users = [];
    if (redBets.length > 0 || grayBets.length > 0 || greenBets.length > 0) {
      users = await manager.find(User,
        { id: In([
          ...redBets.map(bet => bet.userId),
          ...grayBets.map(bet => bet.userId),
          ...greenBets.map(bet => bet.userId)
        ])
      });
    }

    gameView.red = await TeamGameSideView.build(redBets, [ ...grayBets, ...greenBets ], users);
    gameView.gray = await TeamGameSideView.build(grayBets, [ ...redBets, ...greenBets ], users);
    gameView.green = await TeamGameSideView.build(greenBets, [ ...grayBets, ...greenBets ], users);
    return gameView;
  }
}

class TeamGameSideView {
  public sum: number;
  public percent: number;
  public bets: TeamGameSideBetView[];

  static async build(teamGameBets: RouletteGameBet[], anotherGameBets: RouletteGameBet[], users: User[]): Promise<TeamGameSideView> {
    const sideView = new TeamGameSideView();
    sideView.sum = +(teamGameBets.map(bet => bet.bet.bet).reduce((betSum, bet) => betSum + bet, 0)).toFixed(2);
    const anotherSum = anotherGameBets.map(bet => bet.bet.bet).reduce((betSum, bet) => betSum + bet, 0);
    sideView.percent = sideView.sum / (sideView.sum + anotherSum) * 100;
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
      betView.sum = entry.bets.map(bet => bet.bet.bet).reduce((totalSum, value) => totalSum + value, 0);
      betView.percent = +(betView.sum / sideView.sum * 100).toFixed(2);

      sideView.bets.push(betView);
    }
    return sideView;

  }

  public static groupByUser(bets: RouletteGameBet[]): TeamBetUserEntry[] {
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
  constructor(public userId: number, public bets: RouletteGameBet[]) {}
}

class TeamGameSideBetView {
  public userId: number;
  public userName: string;
  public photo: string;
  public sum: number;
  public percent: number;
}

let isRunningCalculatingScheduler = false;

@Injectable()
class RouletteService {
  constructor(
    private keyValueService: SettingsService,
    private randomService: RandomService,
    private userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private connection: Connection,
    @Inject(forwardRef(() => GatewayService))
    private wsGateway: GatewayService
  ) {}

  public async getCurrentGameView(): Promise<RouletteGameView> {
    const view = await RouletteGameView.build(await this.getCurrentGame(this.connection.manager), this.connection.manager);
    if (view.red.percent === 0 && view.gray.percent === 0 && view.green.percent === 0) {
      view.red.percent = 50;
      view.gray.percent = 50;
      view.green.percent = 50;
    }
    return view;
  }

  private async lockCurrentGame(manager: EntityManager): Promise<void> {
    await manager.query('select * from roulette_game where "winSide" is null');
  }

  private async getCurrentGame(manager: EntityManager): Promise<RouletteGame> {
    await this.lockCurrentGame(manager);
    let game = await manager.findOne(RouletteGame, { winSide: IsNull() });
    if (game) {
      return game;
    }
    game = new RouletteGame();
    return await manager.save(game);
  }

  private async calculateResults(manager: EntityManager): Promise<RouletteGame> {
    let winnersBets: RouletteGameBet[];

      await this.lockCurrentGame(manager);
      const game = await this.getCurrentGame(manager);

      const greenBets = await game.greenBets(manager);
      const greenSum = greenBets.reduce((sum, bet) => sum + bet.bet.bet, 0);

      const redBets = await game.redBets(manager);
      const redSum = redBets.reduce((sum, bet) => sum + bet.bet.bet, 0);

      const grayBets = await game.grayBets(manager);
      const graySum = grayBets.reduce((sum, bet) => sum + bet.bet.bet, 0);

      const bank = greenSum + redSum + graySum;

      let winnersSum: number;
      let losersBets: RouletteGameBet[];
      let losersSum: number;

      if ((await this.randomService.getRandom(1, 100)) <= greenSum / bank * 100) {
        game.winSide = RouletteBetType.GREEN;
        winnersBets = await game.greenBets(manager);
        winnersSum = greenSum;
        losersBets = [...await game.redBets(manager), ...await game.grayBets(manager)];
        losersSum = redSum + graySum;
      } else if ((await this.randomService.getRandom(1, 100)) <= redSum / bank * 100) {
        game.winSide = RouletteBetType.RED;
        winnersBets = await game.redBets(manager);
        winnersSum = redSum;
        losersBets = [...await game.greenBets(manager), ...await game.grayBets(manager)];
        losersSum = graySum + greenSum;
      } else {
        game.winSide = RouletteBetType.GRAY;
        winnersBets = await game.grayBets(manager);
        winnersSum = graySum;
        losersBets = [...await game.greenBets(manager), ...await game.redBets(manager)];
        losersSum = redSum + greenSum;
      }

      await manager.save(game);

      // Делим банк у победителей и сохраняем в историю ставок
      const mapped = TeamGameSideView.groupByUser(winnersBets);

      for (const entry of mapped) {
        const user = await this.userRepository.findOne({ id: entry.userId });
        const gainCommissionPercents = +(await this.keyValueService.get(ROULETTE.TEAM_GAME_GAIN_COMMISSION));

        for (const teamGameBet of entry.bets) {
          const userBet = teamGameBet.bet;
          const betSum = userBet.bet;

          const commissionSum = (betSum / winnersSum * bank - betSum) * gainCommissionPercents / 100;
          const prize = (betSum / winnersSum) * bank - commissionSum;

          userBet.prize = +prize;
          userBet.chance = +(winnersSum / bank * 100);
          userBet.commission = commissionSum;

          await manager.save(userBet);

          await this.userService.changeBalance({ balance: prize, id: user.id }, manager, `Победа в рулетке ${game.id}`);
          setTimeout(async () => {
            await this.wsGateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(userBet.prize, await this.userService.getBalance(user.id, this.connection.manager))), user.id);
          }, 7000);
        }
      }

      // Сохраняем историю ставок проигравших
      for (const looseBet of losersBets) {
        const looseUserBet = looseBet.bet;
        looseUserBet.chance = +(losersSum / bank * 100);
        looseUserBet.prize = 0;
        await manager.save(looseUserBet);
      }


    setTimeout(async () => {
      const grayBets = await game.grayBets(this.connection.manager);
      const greenBets = await game.greenBets(this.connection.manager);
      const redBets = await game.redBets(this.connection.manager);

      this.wsGateway.sendAllBetsHistory(new Set([
        ...greenBets.map(bet => bet.userId),
        ...grayBets.map(bet => bet.userId),
        ...redBets.map(bet => bet.userId),
      ]));
    }, 7500);

    return game;
  }

  private async startGame(game: RouletteGame, manager: EntityManager): Promise<RouletteGame> {
    const date = new Date();
    date.setTime(date.getTime() + 30 * 1000);
    game.date = date;
    game = await manager.save(game);

    const view = await RouletteGameView.build(game, manager);
    this.wsGateway.broadcastAll(WS_ROULETTE.TEAM_GAME_START, JSON.stringify(view));
    return game;
  }

  public async play(sum: number, gameId: number, betType: RouletteBetType, userId: number): Promise<void> {
    let userBetId: number;
    const gameResult = await this.connection.transaction(async manager => {
      await this.lockCurrentGame(manager);

      let game = await this.getCurrentGame(manager);

      if (game.id !== gameId) {
        throw new BadRequestException('Игра уже закончилась');
      }

      const balanceData = (await manager.query(`select balance from public."user" where id = ${userId}`))[0];
      const balance = +balanceData.balance.toFixed(2);

      if (balance < sum) {
        throw new BadRequestException('NOT_ENOUGH_BALANCE');
      }

      const user = await manager.findOne(User, { id: userId });

      const conditions : any = {
        userId: user.id
      }
      if(betType === RouletteBetType.RED) {
        conditions.redRouletteGame = game;
      } else if (betType === RouletteBetType.GRAY) {
        conditions.grayRouletteGame = game;
      } else {
        conditions.greenRouletteGame = game;
      }

      let teamGameBet = await manager.findOne(RouletteGameBet, conditions);
      if (!teamGameBet) {
        const userBet = new UserBet();
        userBet.date = new Date();
        userBet.userId = userId;
        userBet.game = GameTypeEnum.ROULETTE;
        userBet.bet = 0;

        teamGameBet = new RouletteGameBet();
        teamGameBet.betType = betType;

        if(betType === RouletteBetType.GREEN) {
          teamGameBet.greenRouletteGame = game;
        } else if (betType === RouletteBetType.RED) {
          teamGameBet.redRouletteGame = game;
        } else {
          teamGameBet.grayRouletteGame = game;
        }

        teamGameBet.userId = user.id;
        teamGameBet.bet = userBet;
      }

      teamGameBet.bet.date = new Date();
      teamGameBet.bet.bet += sum;

      teamGameBet = await manager.save(teamGameBet);
      userBetId = teamGameBet.bet.id;

      /*const blueGameId = betType === TeamBetType.BLUE ? game.id : null;
      const redGameId = betType === TeamBetType.RED ? game.id : null;

      await manager.query(`insert into user_bet (game, "userId", date, bet) values (${GameType.TEAM}, ${userId}, now(), ${+sum.toFixed(2)})`);
      userBetId = (await manager.query(`select currval('user_bet_id_seq') id`))[0].id;
      await manager.query(`insert into team_game_bet ("userId", "blueTeamGameId", "redTeamGameId", "betType", user_bet_id) values (${userId}, ${blueGameId}, ${redGameId}, ${betType}, ${userBetId})`);*/

      await this.userService.changeBalance({ balance: -sum, id: userId }, manager, `Ставка в рулетке ${game.id}`);
      this.wsGateway.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(-sum, await this.userService.getBalance(userId, manager))), userId);

      if (!game.date) {
        const query = `
        select
       (select count(distinct "userId") from roulette_game_bet where "greenRouletteGameId" is not null and "greenRouletteGameId" = tg.id) as green_count,
       (select count(distinct "userId") from roulette_game_bet where "redRouletteGameId" is not null and "redRouletteGameId" = tg.id) as red_count,
       (select count(distinct "userId") from roulette_game_bet where "grayRouletteGameId" is not null and "grayRouletteGameId" = tg.id) as gray_count,
       (
           select count(un2.user_id)
           from (
                    select distinct un.user_id
                    from (
                             select distinct "userId" as user_id
                             from roulette_game_bet
                             where "greenRouletteGameId" is not null
                               and "greenRouletteGameId" = tg.id
                             union
                             select distinct "userId" as user_id
                             from roulette_game_bet
                             where "grayRouletteGameId" is not null
                               and "grayRouletteGameId" = tg.id
                             union
                             select distinct "userId" as user_id
                             from roulette_game_bet
                             where "redRouletteGameId" is not null
                               and "redRouletteGameId" = tg.id
                          ) un except
                    select distinct "userId" as user_id
                    from roulette_game_bet
                    where "greenRouletteGameId" is not null
                      and "greenRouletteGameId" = tg.id) un2
            ) as diff
        from roulette_game tg
        where tg.id = ${game.id};
        `;

        const checkResult = (await manager.query(query))[0];
        // Если в каждой команде есть по игроку, начинается игра
        console.log(checkResult)
        const counter = checkResult.green_count + checkResult.red_count + checkResult.gray_count;
        if (counter >= 2) {
          game = await this.startGame(game, manager);
        }
      }

      return game;
    });

    const view = await RouletteGameView.build(gameResult, this.connection.manager);
    this.wsGateway.broadcastAll(WS_ROULETTE.TEAM_GAME_BET, JSON.stringify(view));
    this.wsGateway.sendAllBetsHistory(new Set([
      ...view.gray.bets.map(bet => bet.userId),
      ...view.red.bets.map(bet => bet.userId),
      ...view.green.bets.map(bet => bet.userId)
    ]));

    this.wsGateway.broadcastUser(WS_ROULETTE.TEAM_GAME_BET_ANSWER, JSON.stringify(view), userId);

    // this.eventBus.publish(new BetEvent(userBetId));
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

          const view = await RouletteGameView.build(game, manager);
          this.wsGateway.broadcastAll(WS_ROULETTE.TEAM_GAME_RESULT, JSON.stringify(view));
        }
      })
    } finally {
      isRunningCalculatingScheduler = false;
    }
  }
}

export { RouletteService, RouletteGameView };
