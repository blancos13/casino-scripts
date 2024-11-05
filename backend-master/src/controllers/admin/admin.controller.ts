import { IsNumber, Min } from 'class-validator';
import { Connection } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  ValidationPipe,
  HttpException,
  HttpStatus,
  Controller,
  UseGuards,
  Param,
  Query,
  Body,
  Post,
  Put,
  Get,
} from '@nestjs/common';

import { SettingsService } from './../../services/settings/settings.service';
import { AdminService } from '../../services/admin/admin.service';

import { UserStatusChat } from '../../models/user/user-status-chat.entity';
import { User } from '../../models/user/user.entity';

import {
  MAIN_PAGE_FULL_BLOCK_CONTENT,
  ACTIVE_BANK_CALLBACK_URL,
  PAYMENT_OUTCOME_EMAILS,
  MAIN_PAGE_STATISTICS,
  COMMISSION,
  BASE_URL,
  CRASH,
  PAYMENT,
  DICE,
  BONUSES,
  SOCIAL,
  SEO,
} from './../../constants/settings';

import {SetItemDto, SetSettingDto} from '../../models/settings/dto/set-item.dto';
import { RulesDto } from './../../models/admin/dto/rules.dto';
import { FaqDto } from './../../models/admin/dto/faq.dto';

import { statusChatEnum } from './../../models/user/enums/status-chat.enum';
import { PaymentDirection } from '../../services/payment/PaymentService'

import { AdminGuard } from '../../middlewares/admin/admin.guard';
import { AuthGuard } from '../../middlewares/auth/auth.guard';
import { MoneyOutcomeStatus } from 'src/models/payment/outcome.entity';
import { MoneyIncomeStatus } from 'src/models/payment/income.entity';

class UserView {
  public id: number;
  public photoUrl: string;
  public url: string;
  public socialUrl: string;
  public username: string;
  public vkId: string;

  public registrationDate: Date;
  public lastActionDate: Date;
  public balance: number;
  public status: number;
  public role: string;
  public ip: string;

  public totalIncome: number;
  public totalOutcome: number;
  public lastIncome: number;

  public gamesCount: number;

  public diceCount: number;
  public minesCount: number;
  public rouletteCount: number;
  public crashCount: number;
  public hiloCount: number;
  public battleCount: number;
  public jackpotCount: number;

  public statusChat: number;

  // public totalReferrals: number;
  // public referralOwnerId: number;
  // public isReferralBonusesBlocked: boolean;

  public static async mapRow(row: any, controller: AdminController): Promise<UserView> {
    const view = new UserView();

    view.id = row.id;
    view.photoUrl = row.photo_url;
    view.vkId = row.vk_id;
    view.url = controller.getUserUrl(view.id);
    view.socialUrl = AdminController.getUserSocialUrl(view.vkId);
    view.username = row.username;
    view.registrationDate = new Date(row.registration_date);
    view.lastActionDate = new Date(row.last_action_date);
    view.balance = +(+row.balance).toFixed(2);
    view.gamesCount = row.games_count;
    view.ip = row.ip;

    view.status = row.status;
    view.role = row.role;

    view.totalIncome = row.total_income ? row.total_income : 0;
    view.totalOutcome = row.total_outcome ? row.total_outcome : 0;
    view.lastIncome = row.last_income;

    view.diceCount = row.dice_count;
    view.minesCount = row.mines_count;
    view.rouletteCount = row.roulette_count;
    view.crashCount = row.crash_count;
    view.battleCount = row.battle_count;
    view.hiloCount = row.hilo_count;
    view.jackpotCount = row.jackpot_count;

    view.statusChat = row.status_chat;

    // view.totalReferrals = row.total_referrals;
    // view.referralOwnerId = row.referral_owner_user_id;
    // view.isReferralBonusesBlocked = row.is_referral_bonuses_blocked;
    return view;
  }
}

class LandingSettings {
  public totalGames: number;

  public full_block: any;

  public seo: { en: [], ru: [] };
}

class GameSettings {
  public seo: { en: [], ru: [] };
  public commission: number
}

class MoneyIncomeView {
  public id: number;
  public userId: number;
  public userPhotoUrl: string;
  public userUrl: string;
  public userSocialUrl: string;
  public name: string;

  public direction: PaymentDirection;
  public sum: number;
  public totalIncome: number;
  public totalOutcome: number;
  public date: Date;
  public status: MoneyIncomeStatus;

  public static async mapRow(row: any, controller: AdminController): Promise<MoneyIncomeView> {
    const view = new MoneyIncomeView();

    view.id = row.id;
    view.userId = row.user_id;
    view.userPhotoUrl = row.user_photo_url;
    view.userUrl = controller.getUserUrl(view.userId);
    view.userSocialUrl = AdminController.getUserSocialUrl(row.vk_id);
    view.name = row.user_name;
    view.direction = row.direction;
    view.sum = row.sum;
    view.totalIncome = row.total_income ? row.total_income : 0;
    view.totalOutcome = row.total_outcome ? row.total_outcome : 0;
    view.date = row.date;
    view.status = row.status;

    return view;
  }
}

class MoneyOutcomeView {
  public id: number;
  public userId: number;
  public userPhotoUrl: string;
  public userUrl: string;
  public userSocialUrl: string;
  public name: string;

  public direction: PaymentDirection;
  public sum: number;
  public totalIncome: number;
  public totalOutcome: number;
  public date: Date;
  public status: MoneyOutcomeStatus;

  public static async mapRow(row: any, controller: AdminController): Promise<MoneyIncomeView> {
    const view = new MoneyIncomeView();

    view.id = row.id;
    view.userId = row.user_id;
    view.userPhotoUrl = row.user_photo_url;
    view.userUrl = controller.getUserUrl(view.userId);
    view.userSocialUrl = AdminController.getUserSocialUrl(row.vk_id);
    view.name = row.user_name;
    view.direction = row.direction;
    view.sum = row.sum;
    view.totalIncome = row.total_income ? row.total_income : 0;
    view.totalOutcome = row.total_outcome ? row.total_outcome : 0;
    view.date = row.date;
    view.status = row.status;

    return view;
  }
}

class EvetyBonusSettings {
  public title: string;

  public gain: number;
}

class OneTimeBonus {
  name: string;
  gainDiamond?: number;
  gain?: number;
  time?: Date;
  countActivation?: number;
  indefinitely?: boolean
}

class BonusSettings {
  public quests: { en: EvetyBonusSettings, ru: EvetyBonusSettings, gainIds: { [id: number]: number } }

  @IsNumber()
  @Min(0)
  public payment: number

  @IsNumber()
  @Min(0)
  public chest: number

  @IsNumber()
  @Min(0)
  public countDiamondForChest: number

  public oneTime: Array<OneTimeBonus>
}

class SocialSettings {
  public telegram: string;
  public telegramSupport: string;

  public vk: string;

  public facebook: string;
}

const USER_LIST_QUERY = `
select u.id                                              id,
       u."photoUrl"                                      photo_url,
       CONCAT(u.name, ' ', u."surName")               as name,
       u.username                                     as username,
       u.balance                                      as balance,
       coalesce(utc.games_count, 0)                   as games_count,
       coalesce(utc.referral_income_composite, '0/0') as income_composite,
       coalesce(utc.referral_count_composite, '0/0')  as referral_composite,
       u.ip                                           as ip,
       u.last_action_date                             as last_action_date,
       u.registration_date                            as registration_date,
       u."vkId"                                       as vk_id,
       ref.owner_user_id referral_owner_user_id
from public.user u
         left join user_totals_cache utc on u.id = utc.user_id
         left join referral ref on ref.referral_user_id = u.id
where u.is_admin = false
`;

const USER_QUERY = `
select u.id                                                                                    id,
       u."photoUrl"                                                                            photo_url,
       CONCAT(u.name, ' ', u."surName")                                                    as  name,
       u.balance                                                                           as  balance,
       (select coalesce(sum(sum),0) from money_income where status = 1 and user_id = u.id)             as  total_income,
       (select coalesce(max(sum),0) from money_outcome where status = 1 and user_id = u.id)            as  total_outcome,
       (select coalesce(max(sum),0)
        from money_income
        where status = 1
          and user_id = u.id
          and date = (select max(date) from money_income where status = 1 and user_id = u.id)) as last_income,
       (select count(id) from referral where owner_user_id = u.id)                         as  total_referrals,
       (select count(id)
        from user_bet
        where (game = 5)
          and "userId" = u.id)                                                             as  dice_count,
       (select count(id)
        from user_bet
        where (game = 4)
          and "userId" = u.id)                                                             as  mines_count,
       (select count(id)
        from user_bet
        where (game = 0)
          and "userId" = u.id)                                                             as  roulette_count,
       (select count(id)
        from user_bet
        where (game = 1)
          and "userId" = u.id)                                                             as  jackpot_count,
       (select count(id)
        from user_bet
        where (game = 2)
          and "userId" = u.id)                                                             as  battle_count,
       (select count(id)
        from user_bet
        where (game = 3)
          and "userId" = u.id)                                                             as  crash_count,
       (select count(id)
        from user_bet
        where (game = 6)
          and "userId" = u.id)                                                             as  hilo_count,
       u.ip                                                                                as  ip,
       u.status_chat                                                                                as  status_chat,
       u.last_action_date                                                                  as  last_action_date,
       u.registration_date                                                                 as  registration_date,
       u."vkId"                                                                            as  vk_id,
       u.is_referral_bonuses_blocked as is_referral_bonuses_blocked
from public.user u
where 1=1
`;

@ApiTags('Admin: Admin panel module')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly connection: Connection,
    private readonly keyService: SettingsService
  ) {}

  @UseGuards(new AdminGuard())
  @Post('/set-setting/:key')
  async setSetting(
    @Body(new ValidationPipe()) data: SetItemDto,
    @Param('key') key: string,
  ): Promise<boolean> {
    if (!data.value && !data.fid) {
      throw new BadRequestException(
        'You need to transfer value or file_id field',
      );
    }

    return await this.adminService.setSetting(data, key);
  }

  @UseGuards(new AdminGuard())
  @Post('/set-setting')
  async setSettings(
    @Body(new ValidationPipe()) data: Array<SetSettingDto>,
  ): Promise<boolean> {
    await Promise.all(
      data.map(async (setting) => {
        const { key, ...data } = setting;
        await this.adminService.setSetting(data, key);
      }),
    );

    return true;
  }

  @UseGuards(new AdminGuard())
  @Get('/get-setting/:key')
  async getSetting(@Param('key') key: string): Promise<string> {
    return this.adminService.getSetting(key);
  }

  @UseGuards(new AdminGuard())
  @Get('/get-settings')
  async getAllSetting() {
    return this.adminService.getAllSettings();
  }

  public getUserUrl(id: number): string {
    return '/user/' + id;
  }

  public static getUserSocialUrl(vkId: string): string {
    if (vkId !== null) {
      return `https://vk.com/id${vkId}`;
    }
    return null;
  }

  // Games
  @Get('/games')
  async getGames(): Promise<Array<string>> {
    return this.adminService.getGames()
  }

  @UseGuards(new AdminGuard())
  @Post('/games')
  async setGames(@Body(new ValidationPipe()) data: Array<string>): Promise<boolean> {
    return this.adminService.setGames(data)
  }
  // /Games

  // Faq
  @Get('/faq')
  async getFaq(@Query('admin') admin: boolean): Promise<FaqDto> {
    return this.adminService.getFaq(admin)
  }

  @UseGuards(new AdminGuard())
  @Post('/faq')
  async setFaq(
    @Query('admin') admin: boolean,
    @Body(new ValidationPipe()) data: FaqDto
  ): Promise<boolean> {
    return this.adminService.setFaq(data, admin)
  }
  // /Faq

  // Rules
  @Get('/agreement')
  async getRules(): Promise<RulesDto> {
    return this.adminService.getRules()
  }

  @UseGuards(new AdminGuard())
  @Post('/agreement')
  async setRules(@Body(new ValidationPipe()) data: RulesDto): Promise<boolean> {
    return this.adminService.setRules(data)
  }
  // /Rules

  // Users
  @UseGuards(new AdminGuard())
  @Get('/users')
  async getusers(
    @Query('skip') skip: number,
    @Query('count') count: number,
    @Query('sort_field') orderByField,
    @Query('sort_type') orderByType: string,
    @Query('filter') filter: string): Promise<any> {

      const orderByMap = {
        'id': ['id'],
        'username': ['username'],
        'registrationDate': ['registration_date'],
        'lastActionDdate': ['last_action_date'],
        'balance': ['balance'],
        'gamesCount': ['games_count'],
        'referralOwnerId': ['referral_owner_user_id'],
        'ip': ['ip'],
      };

      if (!skip) {
        skip = 0;
      }
      if (!count) {
        count = 10;
      }

      if (!['asc', 'desc'].includes(orderByType)) {
        orderByType = 'asc';
      }

      let orderBy = 'order by id asc';
      if (Object.keys(orderByMap).includes(orderByField)) {
        orderBy = `order by ${orderByMap[orderByField].map(str => str + ' ' + orderByType).join(', ')}`;
      }

      const filterStr = !!filter ? `'%${filter.toLowerCase()}%'` : '';

      const userType = UserStatusChat.getTypeByName(filter);

      const filterCondition = !!filter ? `(
      u.id::text like ${filterStr} or
      lower(u.username) like ${filterStr} or
      concat('https://vk.com/id', u."vkId") like ${filterStr} or
      exists(select * from user_status_chat us where us.user_id = u.id and us.type = ${userType ? userType.valueOf() : -1}) or
      to_char(u.registration_date, 'DD.MM.YY') like ${filterStr} or
      to_char(u.last_action_date, 'DD.MM.YY') like ${filterStr} or
      ref.owner_user_id::text like ${filterStr} or
      u.ip like ${filterStr}
      )` : '1=1'
      const query = `
      select un.* from(
      ${USER_LIST_QUERY} and ${filterCondition}
      ${orderBy} 
      ) un 
      offset ${skip} 
      limit ${count}`;

      const users = [];
      for (const row of (await this.connection.query(query))) {

        const view = await UserView.mapRow(row, this);
        view.totalIncome = row.income_composite;
        // view.totalReferrals = row.referral_composite;
        view.gamesCount = row.games_count;
        users.push(view);
      }
      return users;
  }

  @UseGuards(new AdminGuard())
  @Get('/users/:id')
  public async getUser(@Param('id') id: number): Promise<UserView> {
    const query = USER_QUERY + ' and u.id = ' + id;

    const rows = await this.connection.query(query);
    return await UserView.mapRow(rows[0], this);
  }

  @UseGuards(new AdminGuard())
  @Put('/users/:id/ban')
  public async banUser(@Param('id') id: number): Promise<void> {

    const user = await this.connection.manager.findOne(User, { id: id });
    let status = await this.connection.manager.findOne(UserStatusChat, { user: user, type: statusChatEnum.ban });

    await this.connection.manager.query(`update public."user" set status_chat = ${statusChatEnum.ban} where id = ${id}`)

    if (!status) {
      status = new UserStatusChat();
      status.user = user;
      status.type = statusChatEnum.ban;
      status = await this.connection.manager.save(status);
      // this.eventBus.publish(new NewUserStatusEvent(status.id));
    }
  }

  @UseGuards(new AdminGuard())
  @Put('/users/:id/unban')
  public async unbanUser(@Param('id') id: number): Promise<void> {
    await this.connection.manager.query(`delete from user_status_chat where user_id = ${id} and type = ${statusChatEnum.ban}`);
    await this.connection.manager.query(`update public."user" set status_chat = ${statusChatEnum.default} where id = ${id}`)
  }

  @UseGuards(new AdminGuard())
  @Put('/users/:id/balance')
  public async setUserBalance(
    @Param('id') id: number,
    @Body() body: any
    ): Promise<void> {
    await this.connection.manager.query(`update public."user" set balance = ${body.balance.toFixed(2)} where id = ${id}`);
  }
  // /Users

  // Main page
  @Get('/main-page')
  public async getLandingSettings(): Promise<any> {
    const settings = new LandingSettings();

    settings.seo = JSON.parse(await this.keyService.get(SEO.MAIN_PAGE_SEO));

    settings.full_block = JSON.parse(await this.keyService.get(MAIN_PAGE_FULL_BLOCK_CONTENT))

    settings.totalGames = +(await this.keyService.get(MAIN_PAGE_STATISTICS.TOTAL_GAMES))

    return {
      ...settings,
      chest: +(await this.keyService.get(BONUSES.COUNT_DIAMOND_NEED_FOR_OPEN_CHEST))
    };
  }

  @UseGuards(new AdminGuard())
  @Post('/main-page')
  public async setLandingSettings(@Body() body: LandingSettings) {
    await this.keyService.update({ key: SEO.MAIN_PAGE_SEO, value: JSON.stringify(body.seo) });

    await this.keyService.update({
      key: MAIN_PAGE_FULL_BLOCK_CONTENT,
      value: JSON.stringify(body.full_block)
    });

    await this.keyService.update({
      key: MAIN_PAGE_STATISTICS.TOTAL_GAMES,
      value: body.totalGames.toString()
    });
  }
  // /Main page

  // Real count games
  @UseGuards(new AdminGuard())
  @Get('/settings/landing/count-games')
  public async getCountGames(): Promise<number> {
    return +((await await this.connection.manager.query(`select count(id) from user_bet where date_trunc('day', date) = date_trunc('day', current_date)`))[0].count)
  }
  // /Real count games

  // Payment
  @UseGuards(new AdminGuard())
  @Get('/payment/history/income')
  async getIncomeHistory(): Promise<MoneyIncomeView[]> {
    const INCOME_QUERY = `
select
       mi.id                                                     as id,
       u.id                                                      as user_id,
       u."photoUrl"                                              as user_photo_url,
       concat(u.name, ' ', u."surName")                          as user_name,
       mi.direction                                              as direction,
       mi.sum                                                       sum,
       (select sum(sum) from money_income where user_id = u.id and status = 1)  as total_income,
       (select sum(sum) from money_outcome where user_id = u.id and status = 1) as total_outcome,
       mi.date                                                   as date,
       mi.status                                                 as status,
       u."vkId"                                                  as vk_id

from money_income mi
         join public."user" u on u.id = mi.user_id
order by date DESC
    `;

    const rows = await this.connection.query(INCOME_QUERY);
    const data = [];
    for (const row of rows) {
      data.push(await MoneyIncomeView.mapRow(row, this));
    }
    return data;
  }


  @UseGuards(new AdminGuard())
  @Get('/payment/history/outcome')
  async getOutcomeHistory(): Promise<MoneyOutcomeView[]> {
    const INCOME_QUERY = `
select
       mi.id                                                     as id,
       u.id                                                      as user_id,
       u."photoUrl"                                              as user_photo_url,
       concat(u.name, ' ', u."surName")                          as user_name,
       mi.direction                                              as direction,
       mi.sum                                                       sum,
       (select sum(sum) from money_income where user_id = u.id and status = 1)  as total_income,
       (select sum(sum) from money_outcome where user_id = u.id and status = 1) as total_outcome,
       mi.date                                                   as date,
       mi.status                                                 as status,
       u."vkId"                                                  as vk_id

from money_outcome mi
         join public."user" u on u.id = mi.user_id
order by date DESC
    `;

    const rows = await this.connection.query(INCOME_QUERY);
    const data = [];
    for (const row of rows) {
      data.push(await MoneyOutcomeView.mapRow(row, this));
    }
    return data;
  }

  @UseGuards(new AdminGuard())
  @Post('/settings/payment-system')
  public async setPaymentSystem(@Body() body: any) {
    await this.keyService.update({ key: PAYMENT.ACTIVE_PAYMENT_SYSTEM, value: body.paymentSystem });
  }

  @UseGuards(new AdminGuard())
  @Get('/settings/payment-system')
  public async getPaymentSystem(): Promise<any> {
    return {
      paymentSystem: await this.keyService.get(PAYMENT.ACTIVE_PAYMENT_SYSTEM),
    };
  }
  // /Payment

  // Dice
  @Get('/dice')
  public async getDice(): Promise<any> {
    return {
      seo: JSON.parse(await this.keyService.get(SEO.DICE_SEO)),
      commission: +(await this.keyService.get(DICE.DICE_BET_COMMISSION)),
      defaultChance: +(await this.keyService.get(DICE.DICE_DEFAULT_WIN_CHANCE)),
      minChance: +(await this.keyService.get(DICE.DICE_MIN_WIN_CHANCE)),
      maxChance: +(await this.keyService.get(DICE.DICE_MAX_WIN_CHANCE)),
      // bonusChance: +(await this.keyService.get(DICE.DICE_BONUS_CHANCE)),
      // bonus2Chance: +(await this.keyService.get(DICE.DICE_BONUS_2_CHANCE)),
      // degradationChance: +(await this.keyService.get(DICE.DICE_CHANCE_DEGRADATION)),
    }
  }

  @UseGuards(new AdminGuard())
  @Post('/dice')
  public async setDice(
    @Body(new ValidationPipe()) data: any
  ): Promise<boolean> {
    try {

      await this.keyService.update({ key: SEO.DICE_SEO, value: JSON.stringify(data.seo) })

      await this.keyService.update({ key: DICE.DICE_BET_COMMISSION, value: data.commission })
      await this.keyService.update({ key: DICE.DICE_DEFAULT_WIN_CHANCE, value: data.defaultChance })
      await this.keyService.update({ key: DICE.DICE_MIN_WIN_CHANCE, value: data.minChance })
      await this.keyService.update({ key: DICE.DICE_MAX_WIN_CHANCE, value: data.maxChance })
      // await this.keyService.update({ key: DICE.DICE_BONUS_CHANCE, value: data.bonusChance })
      // await this.keyService.update({ key: DICE.DICE_BONUS_2_CHANCE, value: data.bonus2Chance })
      await this.keyService.update({ key: DICE.DICE_CHANCE_DEGRADATION, value: data.degradationChance })

      return true
    } catch (e) {
      throw new HttpException("Error save dice settings: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // /Dice

  // Mines
  @Get('/mines')
  public async getMines(): Promise<GameSettings> {
    const mine = new GameSettings()

    mine.seo = JSON.parse(await this.keyService.get(SEO.MINES_SEO))
    mine.commission = +(await this.keyService.get(COMMISSION.MINES_WIN_COMMISSION))

    return mine
  }

  @UseGuards(new AdminGuard())
  @Post('/mines')
  public async setMines(
    @Body(new ValidationPipe()) data: GameSettings
  ): Promise<boolean> {
    try {

      await this.keyService.update({ key: SEO.MINES_SEO, value: JSON.stringify(data.seo) })
      await this.keyService.update({ key: COMMISSION.MINES_WIN_COMMISSION, value: data.commission.toString() })

      return true
    } catch (e) {
      throw new HttpException("Error save mines settings: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // /Mines

  // Roulette
  @Get('/roulette')
  public async getRoulette(): Promise<GameSettings> {
    const mine = new GameSettings()

    mine.seo = JSON.parse(await this.keyService.get(SEO.ROULETTE_SEO))

    return mine
  }

  @UseGuards(new AdminGuard())
  @Post('/roulette')
  public async setRoulette(
    @Body(new ValidationPipe()) data: GameSettings
  ): Promise<boolean> {
    try {

      await this.keyService.update({ key: SEO.ROULETTE_SEO, value: JSON.stringify(data.seo) })

      return true
    } catch (e) {
      throw new HttpException("Error save roulette settings: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // /Roulette

  // Crash
  @Get('/crash')
  public async getCrash(): Promise<any> {
    return {
      seo: JSON.parse(await this.keyService.get(SEO.CRASH_SEO)),
      commission: await this.keyService.get(COMMISSION.CRASH_WIN_COMMISSION),
      crash_s: +(await this.keyService.get(CRASH.CRASH_FAIL_S)),
      crash_m: +(await this.keyService.get(CRASH.CRASH_FAIL_M)),
      crash_b: +(await this.keyService.get(CRASH.CRASH_FAIL_B)),
      crash_h: +(await this.keyService.get(CRASH.CRASH_FAIL_H)),
    }
  }

  @UseGuards(new AdminGuard())
  @Post('/crash')
  public async setCrash(
    @Body(new ValidationPipe()) data: any
  ): Promise<boolean> {
    try {

      await this.keyService.update({ key: SEO.CRASH_SEO, value: JSON.stringify(data.seo) })

      await this.keyService.update({ key: COMMISSION.CRASH_WIN_COMMISSION, value: data.commission })

      await this.keyService.update({ key: CRASH.CRASH_FAIL_S, value: data.crash_s })
      await this.keyService.update({ key: CRASH.CRASH_FAIL_M, value: data.crash_m })
      await this.keyService.update({ key: CRASH.CRASH_FAIL_B, value: data.crash_b })
      await this.keyService.update({ key: CRASH.CRASH_FAIL_H, value: data.crash_h })

      return true
    } catch (e) {
      throw new HttpException("Error save crash settings: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // /Crash

  // Hilo
  @Get('/hilo')
  public async getHilo(): Promise<any> {
    return {
      seo: JSON.parse(await this.keyService.get(SEO.HILO_SEO)),
      commission: await this.keyService.get(COMMISSION.HILO_WIN_COMMISSION)
    }
  }

  @UseGuards(new AdminGuard())
  @Post('/hilo')
  public async setHilo(
    @Body(new ValidationPipe()) data: any
  ): Promise<boolean> {
    try {

      await this.keyService.update({ key: SEO.HILO_SEO, value: JSON.stringify(data.seo) })

      await this.keyService.update({ key: COMMISSION.HILO_WIN_COMMISSION, value: data.commission })

      return true
    } catch (e) {
      throw new HttpException("Error save hilo settings: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // /Hilo

  // Jackpot
  @Get('/jackpot')
  public async getJackPot(): Promise<GameSettings> {
    const mine = new GameSettings()

    mine.seo = JSON.parse(await this.keyService.get(SEO.JACKPOT_SEO))

    return mine
  }

  @UseGuards(new AdminGuard())
  @Post('/jackpot')
  public async setJackPot(
    @Body(new ValidationPipe()) data: GameSettings
  ): Promise<boolean> {
    try {

      await this.keyService.update({ key: SEO.JACKPOT_SEO, value: JSON.stringify(data.seo) })

      return true
    } catch (e) {
      throw new HttpException("Error save jackpot settings: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // /Jackpot

  // Battle
  @Get('/battle')
  public async getBattle(): Promise<GameSettings> {
    const mine = new GameSettings()

    mine.seo = JSON.parse(await this.keyService.get(SEO.BATTLE_SEO))

    return mine
  }

  @UseGuards(new AdminGuard())
  @Post('/battle')
  public async setBattle(
    @Body(new ValidationPipe()) data: GameSettings
  ): Promise<boolean> {
    try {

      await this.keyService.update({ key: SEO.BATTLE_SEO, value: JSON.stringify(data.seo) })

      return true
    } catch (e) {
      throw new HttpException("Error save battle settings: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // /Battle

  // Bonus
  @Get('/settings/bonus')
  public async getBonusSettings(): Promise<BonusSettings> {
    const settings = new BonusSettings();

    settings.chest = +(await this.keyService.get(BONUSES.CHEST));
    settings.quests = JSON.parse(await this.keyService.get(BONUSES.QUESTS))
    settings.countDiamondForChest = +(await this.keyService.get(BONUSES.COUNT_DIAMOND_NEED_FOR_OPEN_CHEST))

    settings.payment = +(await this.keyService.get(BONUSES.PAYMENT));

    settings.oneTime = JSON.parse(await this.keyService.get(BONUSES.ONE_TIME))

    return settings;
  }

  @UseGuards(new AdminGuard())
  @Post('/settings/bonus')
  public async setBonusSettings(@Body() body: BonusSettings) {
    await this.keyService.update({ key: BONUSES.PAYMENT, value: body.payment + '' })

    await this.keyService.update({ key: BONUSES.CHEST, value: body.chest + '' })
    await this.keyService.update({ key: BONUSES.QUESTS, value: JSON.stringify(body.quests) })
    await this.keyService.update({ key: BONUSES.COUNT_DIAMOND_NEED_FOR_OPEN_CHEST, value: body.countDiamondForChest + '' })

    await this.keyService.update({ key: BONUSES.ONE_TIME, value: JSON.stringify(body.oneTime) })
  }
  // /Bonus

  // Main link
  @UseGuards(new AdminGuard())
  @Post('/settings/main-link')
  async setMainLink(@Body() body: any) {
    await this.keyService.update({ key: BASE_URL, value: body.link });
  }

  @UseGuards(new AdminGuard())
  @Get('/settings/main-link')
  async getMainLink(): Promise<any> {
    return {
      link: await this.keyService.get(BASE_URL),
    };
  }
  // /Main link

  // Pay link
  @UseGuards(new AdminGuard())
  @Post('/settings/pay-link')
  async setPayLink(@Body() body: any) {
    await this.keyService.update({ key: ACTIVE_BANK_CALLBACK_URL, value: body.link });
  }

  @UseGuards(new AdminGuard())
  @Get('/settings/pay-link')
  async getPayLink(): Promise<any> {
    return {
      link: await this.keyService.get(ACTIVE_BANK_CALLBACK_URL),
    };
  }
  // /Pay link

  // Notification email
  @UseGuards(new AdminGuard())
  @Post('/settings/notification-email')
  async setNotificationEmail(@Body() body: any) {
    await this.keyService.update({ key: PAYMENT_OUTCOME_EMAILS, value: JSON.stringify(body) });
  }

  @UseGuards(new AdminGuard())
  @Get('/settings/notification-email')
  async getNotificationEmail(): Promise<any> {
    return JSON.parse(await this.keyService.get(PAYMENT_OUTCOME_EMAILS));
  }
  // /Notification email

  // Social
  @Get('/settings/social')
  async getSocial(): Promise<SocialSettings> {
    const data = new SocialSettings()

    data.telegram = await this.keyService.get(SOCIAL.TELEGRAM)
    data.telegramSupport = await this.keyService.get(SOCIAL.TELEGRAM_SUPPORT)

    data.vk = await this.keyService.get(SOCIAL.VK)

    data.facebook = await this.keyService.get(SOCIAL.FACEBOOK)

    return data
  }

  @UseGuards(new AdminGuard())
  @Post('/settings/social')
  async setSocial(@Body() data: SocialSettings): Promise<boolean> {
    try {

      await this.keyService.update({ key: SOCIAL.FACEBOOK, value: data.facebook })

      await this.keyService.update({ key: SOCIAL.VK, value: data.vk })

      await this.keyService.update({ key: SOCIAL.TELEGRAM, value: data.telegram })
      await this.keyService.update({ key: SOCIAL.TELEGRAM_SUPPORT, value: data.telegramSupport })

      return true;
    } catch (e) {
      throw new HttpException('Error save social links: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  // /Social
}
