import { CrashService } from './../crash/crash.service';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer
} from '@nestjs/websockets';

import { AuthService } from './../auth/auth.service';
import { BetService } from '../bet/bet.service';

import { User } from './../../models/user/user.entity';
import { UserSession } from './../../models/user/user-session.entity';

import WS_MESSAGE from '../../constants/websocket/bet'
import WS_CHAT from '../../constants/websocket/chat'
import WS_CRASH from '../../constants/websocket/crash'
import WS_BATTLE from '../../constants/websocket/battle'
import WS_DICE from '../../constants/websocket/dice'
import WS_ROULETTE from '../../constants/websocket/roulette'
import WS_JACKPOT from '../../constants/websocket/jackpot'

import { DiceService } from '../dice/dice.service';
import { RouletteService } from '../roulette/roulette.service';
import { JackpotService } from '../jackpot/jackpot.service';
import { BattleService } from './../battle/battle.service';

export class NewBalanceBody {
  constructor(public change: number, public newBalance: number) {}
}

export class UserSocketEntry {
  constructor(public client: Socket, public userId: number) {}
}

let isBetUpdating = false;
let isNeedBetUpdating = false;
const needBetUpdatingUsers: Set<number> = new Set<number>();

@WebSocketGateway()
export class GatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('AppGateway');
  private static userSockets: UserSocketEntry[];
  private static notUserSockets: Socket[];
  @InjectRepository(User)
  userRepository: Repository<User>;
  @InjectRepository(UserSession)
  userSessionRepository: Repository<UserSession>;

  constructor(
    private readonly rouletteService: RouletteService,
    private readonly jackpotService: JackpotService,
    private readonly battleService: BattleService,
    private readonly crashService: CrashService,
    private readonly authService: AuthService,
    private readonly diceService: DiceService,
    private readonly betService: BetService
  ) {
    GatewayService.userSockets = [];
    GatewayService.notUserSockets = [];
  }

  afterInit(server: Server): any {
    this.logger.log('After init server path: ' + server.path());
  }

  async handleConnection(client: any, ...args: any[]): Promise<any> {
    const token = client.handshake.query.token;

    if (token) {
      const user = await this.authService.checkToken(token);

      if (!user) {
        client.disconnect();
        return;
      }

      GatewayService.userSockets.push(new UserSocketEntry(client, +user.id));
    } else {
      GatewayService.notUserSockets.push(client);
    }

    this.server.emit(WS_CHAT.UPDATE_COUNT_ONLINE_USERS, GatewayService.userSockets.length + GatewayService.notUserSockets.length)
  }

  handleDisconnect(client: any): any {
    let index = -1;
    GatewayService.userSockets.forEach((entry, i) => {
      if (entry.client.id === client.id) {
        index = i;
      }
    });
    if (index !== -1) {
      GatewayService.userSockets.splice(index, 1);
      this.server.emit(WS_CHAT.UPDATE_COUNT_ONLINE_USERS, GatewayService.userSockets.length + GatewayService.notUserSockets.length)
      return;
    }

    GatewayService.notUserSockets.forEach((entryClient, i) => {
      if (entryClient.id === client.id) {
        index = i;
      }
    });
    if (index !== -1) {
      GatewayService.notUserSockets.splice(index, 1);
      this.server.emit(WS_CHAT.UPDATE_COUNT_ONLINE_USERS, GatewayService.userSockets.length + GatewayService.notUserSockets.length)
      return;
    }
  }

  @SubscribeMessage(WS_DICE.SEND_DICE_BET)
  async handleDiceBet(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const entry = GatewayService.userSockets.find(entry => entry.client.id === client.id);
    if (!entry) {
      const message = {
        error: 'Необходимо авторизоваться',
        status: 401,
      };
      client.emit(WS_DICE.DICE_BET_RESULT, JSON.stringify(message));
      return;
    }

    const userId = entry.userId;

    let sum = 0;
    let chance = 0;

    const minSum = 0.1;
    if (!body.sum || isNaN(body.sum) || body.sum < minSum) {
      const message = {
        error: `Минимальная сумма ставки ${minSum} рублей`,
        status: 400,
      };
      client.emit(WS_DICE.DICE_BET_RESULT, JSON.stringify(message));
      return;
    }
    sum = body.sum;

    if (!body.chance || isNaN(body.chance)) {
      const message = {
        error: 'Необходимо указать шанс',
        status: 400,
      };
      client.emit(WS_DICE.DICE_BET_RESULT, JSON.stringify(message));
      return;
    }
    chance = +body.chance;

    let result = null;
    try {
      result = await this.diceService.play(sum, chance, userId);
    } catch (e) {
      const message = {
        error: e.message,
        status: 400,
      };
      client.emit(WS_DICE.DICE_BET_RESULT, JSON.stringify(message));
      return;
    }

    client.emit(WS_DICE.DICE_BET_RESULT, JSON.stringify({ status: 200, result: result }));
  }

  @SubscribeMessage(WS_ROULETTE.TEAM_GAME_BET)
  async handleEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const entry = GatewayService.userSockets.find(entry => entry.client.id === client.id);
    if (!entry) {
      const message = {
        error: 'Необходимо авторизоваться',
        status: 401,
      };
      client.emit(WS_ROULETTE.TEAM_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }

    const userId = entry.userId;

    let sum = 0;
    let betType = 0;
    let gameId = -1;

    if (!body.sum || isNaN(body.sum) || body.sum < 0.1) {
      const message = {
        error: `Минимальная сумма ставки ${0.1} рублей`,
        status: 400,
      };
      client.emit(WS_ROULETTE.TEAM_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }
    sum = body.sum;

    if (isNaN(body.betType) || ![0, 1, 2].includes(body.betType)) {
      const message = {
        error: 'Необходимо указать команду',
        status: 400,
      };
      client.emit(WS_ROULETTE.TEAM_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }

    betType = +body.betType;
    gameId = +body.gameId;

    try {
      await this.rouletteService.play(sum, gameId, betType, userId);
    } catch (e) {
      const message = {
        error: e.message,
        status: 400,
      };
      client.emit(WS_ROULETTE.TEAM_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }
    client.emit(WS_ROULETTE.TEAM_GAME_BET_ANSWER, JSON.stringify({ status: 200 }));
  }

  @SubscribeMessage(WS_JACKPOT.JACKPOT_GAME_BET)
  async handleEventJackpot(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const entry = GatewayService.userSockets.find(entry => entry.client.id === client.id);
    if (!entry) {
      const message = {
        error: 'Необходимо авторизоваться',
        status: 401,
      };
      client.emit(WS_JACKPOT.JACKPOT_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }

    const userId = entry.userId;

    let sum = 0;
    let gameId = -1;

    if (!body.sum || isNaN(body.sum) || body.sum < 0.1) {
      const message = {
        error: `Минимальная сумма ставки 0.1 рублей`,
        status: 400,
      };
      client.emit(WS_JACKPOT.JACKPOT_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }

    sum = body.sum;
    gameId = +body.gameId;

    try {
      await this.jackpotService.play(sum, gameId, +body.chance, userId);
    } catch (e) {
      const message = {
        error: e.message,
        status: 400,
      };
      client.emit(WS_JACKPOT.JACKPOT_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }
    client.emit(WS_JACKPOT.JACKPOT_GAME_BET_ANSWER, JSON.stringify({ status: 200 }));
  }

  @SubscribeMessage(WS_BATTLE.BATTLE_GAME_BET)
  async handleEventBattle(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const entry = GatewayService.userSockets.find(entry => entry.client.id === client.id);
    if (!entry) {
      const message = {
        error: 'Необходимо авторизоваться',
        status: 401,
      };
      client.emit(WS_BATTLE.BATTLE_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }

    const userId = entry.userId;

    let sum = 0;
    let gameId = -1;

    if (!body.sum || isNaN(body.sum) || body.sum < 0.1) {
      const message = {
        error: `Минимальная сумма ставки 0.1 рублей`,
        status: 400,
      };
      client.emit(WS_BATTLE.BATTLE_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }

    sum = body.sum;
    gameId = +body.gameId;

    try {
      await this.battleService.play(sum, gameId, +body.chance, userId);
    } catch (e) {
      const message = {
        error: e.message,
        status: 400,
      };
      client.emit(WS_BATTLE.BATTLE_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }
    client.emit(WS_BATTLE.BATTLE_GAME_BET_ANSWER, JSON.stringify({ status: 200 }));
  }

  @SubscribeMessage(WS_CRASH.CRASH_GAME_BET)
  async handleBetCrash(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const entry = GatewayService.userSockets.find(entry => entry.client.id === client.id);
    if (!entry) {
      const message = {
        error: 'Необходимо авторизоваться',
        status: 401,
      };
      client.emit(WS_CRASH.CRASH_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }

    const userId = entry.userId;

    let sum = 0;
    let gameId = -1;

    if (!body.sum || isNaN(body.sum) || body.sum < 0.1) {
      const message = {
        error: `Минимальная сумма ставки 0.1 рублей`,
        status: 400,
      };
      client.emit(WS_CRASH.CRASH_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }

    sum = body.sum;
    gameId = +body.gameId;

    try {
      await this.crashService.play(sum, gameId, +body.withdraw, userId);
    } catch (e) {
      const message = {
        error: e.message,
        status: 400,
      };
      client.emit(WS_CRASH.CRASH_GAME_BET_ANSWER, JSON.stringify(message));
      return;
    }
    client.emit(WS_CRASH.CRASH_GAME_BET_ANSWER, JSON.stringify({ status: 200 }));
  }

  public getUserIds(): number[] {
    return GatewayService.userSockets.map(entry => entry.userId);
  }

  public static broadcastStaticUser(messageType: string, message: string, userId: number) {
    const sockets = this.userSockets.filter(entry => entry.client.connected && entry.userId === userId).map(entry => entry.client);

    for (const socket of sockets) {
      try {
        socket.emit(messageType, message);
      } catch (e) {
        console.log('Ошибка при бродкастинке ws к ' + userId);
      }
    }
  }

  public broadcastUser(messageType: string, message: string, userId: number) {
    GatewayService.broadcastStaticUser(messageType, message, userId);
  }

  public broadcastNotUser(messageType: string, message: string) {
    for (const socket of GatewayService.notUserSockets) {
      try {
        socket.emit(messageType, message);
      } catch (e) {
        console.log('Ошибка при бродкастинге ws');
      }
    }
  }

  public broadcastAll(messageType: string, message: string) {
    const sockets = [];
    sockets.push(...GatewayService.notUserSockets);
    sockets.push(...(GatewayService.userSockets.map(entry => entry.client)));
    for (const socket of sockets.filter(socket => socket.connected)) {
      try {
        socket.emit(messageType, message);
      } catch (e) {
        console.log('Ошибка при бродкастинге ws');
      }
    }
  }

  /**
   * Отправляет историю ставок всем, а также обновлет личную историю ставок у указанных пользователей
   * @param userIds
   */
  public async sendAllBetsHistory(userIds: Set<number>) {
    if (isBetUpdating) {
      isNeedBetUpdating = true;
      for (const userId of userIds) {
        needBetUpdatingUsers.add(userId);
      }
      return;
    }

    isBetUpdating = true;

    const lastBets = await this.betService.getAllBets(0, 50);

    this.broadcastAll(WS_MESSAGE.BET_HISTORY_ANSWER, JSON.stringify(lastBets))

    for (const userId of userIds) {
      const userBets = await this.betService.getByBets(0, 50, userId);
      this.broadcastUser(WS_MESSAGE.MY_BET_HISTORY_ANSWER, JSON.stringify(userBets), userId)
    }

    isBetUpdating = false;

    if (isNeedBetUpdating) {
      const ids = Array.from(needBetUpdatingUsers.values())
      isNeedBetUpdating = false;
      needBetUpdatingUsers.clear();

      this.sendAllBetsHistory(new Set<number>(ids))
    }
  }

  public async disconnectUser(userId: number) {
    const clientEntry = GatewayService.userSockets.find(entry => entry.userId === userId);
    if (!clientEntry || !clientEntry.client.connected) {
      return;
    }
    clientEntry.client.disconnect();
  }
}
