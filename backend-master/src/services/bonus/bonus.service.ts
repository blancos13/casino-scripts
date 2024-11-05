import { BonusType } from './../../models/user/enums/bonus-type.enum';
import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { TypeUpPayment } from '../../models/user/user-balance-change.entity'
import { Repository, EntityManager, Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BonusOneTime } from '../../models/bonus/one-time-bonus.entity';
import { VkontakteService } from './../vkontakte/vkontakte.service';
import { QuestsEnum } from './../../models/bonus/enum/quests.anum';
import { SettingsService } from './../settings/settings.service';
import { BonusQuests } from './../../models/bonus/quests.entity';
import { GatewayService } from './../gateway/gateway.service';
import { RandomService } from '../random/random.service';
import { User } from '../../models/user/user.entity';
import { UserBonus } from '../../models/user/user-bonus.entity';
import { UserService } from './../user/user.service';
import { BONUSES } from './../../constants/settings';
import WS_BALANCE from '../../constants/websocket/balance';
import WS_BONUS from '../../constants/websocket/bonus'
import { NewBalanceBody } from '../../services/gateway/gateway.service'

const checkDateMap = {};

@Injectable()
export class BonusService {
  private readonly day = 1000 * 60 * 60 * 24;
  private readonly quests = {
    "en":[
        {"title":"VK identification","gainId":1,"id":0},
        {"title":"Subscription to VK group","gainId":2,"id":1},
        {"title":"Subscribe to VK newsletter","gainId":3,"id":2},
        {"title":"Subscribing to PUSH notifications","gainId":4,"id":3},
        {"title":"Subscription to the Telegram channel","gainId":5,"id":4},
        {"title":"Top up balance for 100 rubles","gainId":6,"id":5},
        {"title":"Top up balance by 300 rubles","gainId":7,"id":6},
        {"title":"Top up balance by 500 rubles","gainId":8,"id":7},
        {"title":"Top up balance by 1000 rubles","gainId":9,"id":8},
        {"title":"Top up balance by 1500 rubles","gainId":10,"id":9},
        {"title":"Top up balance by 2000 rubles","gainId":11,"id":10},
        {"title":"Top up balance by 3000 rubles","gainId":12,"id":11},
        {"title":"Top up balance by 5000 rubles","gainId":13,"id":12}
    ],
    "ru":[
        {"title":"Идентификация по ВК","gainId":1,"id":0},
        {"title":"Подписка на группу ВК","gainId":2,"id":1},
        {"title":"Подписка на рассылку ВК","gainId":3,"id":2},
        {"title":"Подписка на PUSH уведомления","gainId":4,"id":3},
        {"title":"Подписка на Телеграм канал","gainId":5,"id":4},
        {"title":"Пополнить баланс на 100 рублей","gainId":6,"id":5},
        {"title":"Пополнить баланс на 300 рублей","gainId":7,"id":6},
        {"title":"Пополнить баланс на 500 рублей","gainId":8,"id":7},
        {"title":"Пополнить баланс на 1000 рублей","gainId":9,"id":8},
        {"title":"Пополнить баланс на 1500 рублей","gainId":10,"id":9},
        {"title":"Пополнить баланс на 2000 рублей","gainId":11,"id":10},
        {"title":"Пополнить баланс на 3000 рублей","gainId":12,"id":11},
        {"title":"Пополнить баланс на 5000 рублей","gainId":13,"id":12}
    ],
    "gainIds":{
        1:30,
        2:30,
        3:30,
        4:30,
        5:30,
        6:30,
        7:30,
        8:30,
        9:30,
        10:30,
        11:30,
        12:30,
        13:30
    }
};
  
  constructor(
    @InjectRepository(BonusQuests)
    private readonly bonusQuestsRepo: Repository<BonusQuests>,
    @InjectRepository(BonusOneTime)
    private readonly bonusOneTimeRepo: Repository<BonusOneTime>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserBonus)
    private readonly userBonusRepo: Repository<UserBonus>,
    private readonly settingService: SettingsService,
    private readonly userService: UserService,
    private readonly vkService: VkontakteService,
    private readonly gatewayService: GatewayService,
    private readonly randomService: RandomService,
    private readonly manager: EntityManager,
    private readonly connection: Connection
  ) {}

  async activate(payload: string, userPayload: User): Promise<any> {
    let bonus = await this.bonusOneTimeRepo.findOne({ name: payload })
    const user = await this.userRepo.findOne({ id: userPayload.id })

    if (!user.lastActivationPromocode) {
      user.lastActivationPromocode = new Date()
    } else {
      const diffTime = (new Date().valueOf() - new Date(user.lastActivationPromocode).valueOf()) / 1000 / 60 / 60

      if (diffTime < 24) {
        return {
          error_message: 'promocode_user_error_max_activation'
        }
      }

      user.lastActivationPromocode = new Date()
    }

    if (!bonus) {
      const bonuses = JSON.parse(await this.settingService.get(BONUSES.ONE_TIME))
      bonus = bonuses.find((item: any) => item.name === payload)
      
      if (!bonus) {
        throw new HttpException(`Bonus with name = ${payload} not found`, HttpStatus.NOT_FOUND);
      }

      bonus = new BonusOneTime({ ...bonus, user })
    }

    if (!bonus.indefinitely) {
      const expireAtBonus = (new Date()).valueOf() - (new Date(bonus.date)).valueOf()
      if (!expireAtBonus) {
        return {
          error_message: 'promocode_error_expire_at'
        }
      }
    }

    if (!+bonus.countActivation) {
      return {
        error_message: 'promocode_error_count_activation'
      }
    }

    try {
      if (+bonus.gain) {
        await this.userService.changeBalance({ id: user.id, balance: +bonus.gain }, this.manager, `Активация разового бонуса с названием ${payload}`)
        this.gatewayService.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(+bonus.gain, await this.userService.getBalance(user.id, this.manager))), user.id);
      }

      if (+bonus.gainDiamond) {
        await this.userService.changeBalance({ id: user.id, demoBalance: +bonus.gainDiamond }, this.manager, `Активация разового бонуса с названием ${payload}`)
        this.gatewayService.broadcastUser(WS_BALANCE.NEW_DEMO_BALANCE, JSON.stringify(new NewBalanceBody(+bonus.gainDiamond, await this.userService.getBalance(user.id, this.manager))), user.id);
      }

      bonus.countActivation = +bonus.countActivation - 1

      await this.manager.save(bonus)

      return true
    } catch(e) {
      throw new HttpException("Error change user data: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async takeChest(userId: string): Promise<any> {
    const chest = +(await this.settingService.get(BONUSES.CHEST))
    let bonus = await this.manager.query(`select is_taken, id from user_bonus where user_id = ${userId} and Date(date) = current_date`)

    if (!bonus.length) {
      throw new Error('Сундук не был найден')
    }

    // if (bonus.length > 1) {
    //   throw new Error('Найдено более одного сундука')
    // }

    bonus = bonus[0]

    if (bonus.is_taken) {
      return {
        error_message: 'chest.error_was_open'
      }
    }

    const selectedBonuses = +(await this.getSelectedDiamonds(userId))

    if (selectedBonuses < chest) {
      return {
        error_message: 'chest.error_count_diamonds'
      }
    }

    return this.connection.transaction(async manager => {
      await manager.query(`update user_bonus set is_taken = true where id = ${bonus.id}`)
      await this.userService.update({ id: userId, last_activation_chest: new Date().toUTCString() })
      await this.userService.changeBalance({ id: userId, balance: chest }, manager, 'Открытие сундука')

      this.gatewayService.broadcastUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(chest, await this.userService.getBalance(+userId, manager))), +userId);

      return this.getBonusState(+userId)
    })
  }

  async takeBonus(userId: string, typeBonusId: QuestsEnum): Promise<any> {
    const type = +typeBonusId
    const user = await this.userService.get({ id: userId })
    const chest = +(await this.settingService.get(BONUSES.CHEST))

    if (type === undefined) {
      throw new BadRequestException('Необходимо передать id бонуса');
    }

    if(checkDateMap[userId] && checkDateMap[userId].getTime() + 30000 > new Date().getTime()) {
      return {
        error_message: 'quests.error_timeout'
      }
    }

    checkDateMap[userId] = new Date();

    // const bonuses = JSON.parse(await this.settingService.get(BONUSES.QUESTS))
    const bonus = this.quests.ru.find((item: any) => item.id === typeBonusId)
    
    let bonusPrize = this.quests.gainIds[bonus.gainId]

    let todayBonus = await this.manager.query(`select * from user_bonus where user_id = ${userId} and type = ${BonusType.QUESTS} and Date(date) = current_date`)

    if (!todayBonus || !todayBonus.length) {
      todayBonus = new UserBonus()

      todayBonus.user = user
      todayBonus.prize = chest
      todayBonus.type = BonusType.QUESTS;
      todayBonus.date = new Date();

      await this.manager.save(todayBonus)
    }

    if (todayBonus.length) {
      if (todayBonus.length > 1) {
        return {
          error_message: 'quests.max_one_quets_in_day'
        }
      }
  
      todayBonus = todayBonus[0]
    }

    if (todayBonus.is_taken) {
      return {
        error_message: 'chest.error_was_open'
      }
    }

    let bonusQuest = (await this.manager.query(`select * from bonus_quests where user_bonus_id = ${todayBonus.id} and user_id = ${userId} and type = ${type}`))[0]
    
    if (!bonusQuest) {
      await this.manager.query(`insert into bonus_quests (user_id, user_bonus_id, type, date, prize) values(${user.id}, ${todayBonus.id}, ${type}, now(), ${bonusPrize})`)
      bonusQuest = (await this.manager.query(`select * from bonus_quests where user_id = ${user.id} and type = ${type} and is_taken = false and user_bonus_id = ${todayBonus.id} and Date(date) = current_date`))[0]
    }
    
    if (bonusQuest.is_taken) {
      return {
        error_message: 'quests.error_already_open'
      }
    }

    if (QuestsEnum.VK_IDENTIFICATION === type) {
      if(!user.vkId) {
        return {
          error_message: 'quests.error_vk_auth'
        }
      }
    } else if (QuestsEnum.VK_SUBSCRIBE_GROUP === type) {
      if (!user.vkId || !this.vkService.isGroupMember(user.vkId)) {
        return {
          error_message: 'quests.error_vk_subscribe_group'
        }
      }
    } else if (QuestsEnum.VK_SUBSCRIBE_NEWSLETTER === type) {
      if (!user.vkId || !this.vkService.isGroupMessageAvailable(user.vkId)) {
        return {
          error_message: 'quests.error_vk_subscribe_news'
        }
      }
    } else if (QuestsEnum.SUBSCRIBE_NOTIFICATION === type) {
      // notification
    } else if (QuestsEnum.TELEGRAM_SUBSCRIBE === type) {
      // telegram
    }
    
    if (type > 4) {
      const payment = +(await this.manager.query(`select sum(sum) from payment_income where user_id = ${userId} and date > '${user.lastActivationChest.toUTCString()}'`))[0].sum

      if (QuestsEnum.UP_100 === type) {
        if (payment < 100) {
          return {
            error_message: 'quests.error_payment_100'
          }
        }
      } else if (QuestsEnum.UP_300 === type) {
        if (payment < 300) {
          return {
            error_message: 'quests.error_payment_300'
          }
        }
      } else if (QuestsEnum.UP_500 === type) {
        if (payment < 500) {
          return {
            error_message: 'quests.error_payment_500'
          }
        }
      } else if (QuestsEnum.UP_1000 === type) {
        if (payment < 1000) {
          return {
            error_message: 'quests.error_payment_1000'
          }
        }
      } else if (QuestsEnum.UP_1500 === type) {
        if (payment < 1500) {
          return {
            error_message: 'quests.error_payment_1500'
          }
        }
      } else if (QuestsEnum.UP_2000 === type) {
        if (payment < 2000) {
          return {
            error_message: 'quests.error_payment_2000'
          }
        }
      } else if (QuestsEnum.UP_3000 === type) {
        if (payment < 3000) {
          return {
            error_message: 'quests.error_payment_3000'
          }
        }
      } else if (QuestsEnum.UP_5000 === type) {
        if (payment < 5000) {
          return {
            error_message: 'quests.error_payment_5000'
          }
        }
      }
    }

    await this.manager.query(`update bonus_quests set is_taken = true where id = ${bonusQuest.id}`)

    await this.userService.changeBalance({ id: userId, demoBalance: bonusPrize }, this.manager, `Открытие ежедневного бонуса ${type}`)
    this.gatewayService.broadcastUser(WS_BALANCE.NEW_DEMO_BALANCE, JSON.stringify(new NewBalanceBody(bonusPrize, await this.userService.getDemoBalance(user.id, this.connection.manager))), user.id);
    
    this.gatewayService.broadcastUser(WS_BONUS.CHANGE_SELECTED_DIAMONDS, JSON.stringify({ data: bonusPrize }), user.id)

    return this.getBonusState(+userId);
  }

  async getSelectedDiamonds(userId: string): Promise<number> {
    return userId ? (await this.manager.query(`select sum(prize) from bonus_quests where user_id = ${userId} and Date(date) = current_date and is_taken = true`))[0].sum : 0
  }

  async getBonusState(userId?: number) {
    // let bonuses = JSON.parse(await this.settingService.get(BONUSES.QUESTS))
    let types = []
    let game = null

    if (userId) {
      game = await this.manager.query(`select * from user_bonus where user_id = ${userId} and Date(date) = current_date and is_taken = true`)
      types = await this.manager.query(`select type from bonus_quests where user_id = ${userId} and Date(date) = current_date and is_taken = true`)
      types = types.length ? types.map((item: any) => item.type) : []
    }
    
    // id 3 - Subscribe notification
    // id 4 - Telegram chanel
    // Don't work telegram, push
    types.push(3)
    types.push(4)
    // /Don't work telegram, push

    return { 
      // ...bonuses,
      types,
      isEnd: game && game.length
    }
  }
}
