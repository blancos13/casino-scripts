import { Module, HttpModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n';

// Config
import { configService } from './config/config.service';

// Entities
import { PhoneVerification } from './models/phone-verification/phone-verification.entity';
import { RouletteGameBet } from './models/games/roulette/roulette-bet.entity';
import { UserBalanceChange } from './models/user/user-balance-change.entity';
import { JackpotGameBet } from './models/games/jackpot/jackpot-bet.entity';
import { BattleGameBet } from './models/games/battle/battle-bet.entity';
import { UserTotalsCache } from './models/user/user-total-cache.entity';
import { RouletteGame } from './models/games/roulette/roulette.entity';
import { UserStatusChat } from './models/user/user-status-chat.entity';
import { ChatBanList } from './models/user/user-chat-ban-list.entity';
import { JackpotGame } from './models/games/jackpot/jackpot.entity';
import { BonusOneTime } from './models/bonus/one-time-bonus.entity';
import { Attachment } from './models/attachment/attachment.entity';
import { BattleGame } from './models/games/battle/battle.entity';
import { UnitpayIncome } from './models/payment/unitpay.entity';
import { UserSession } from './models/user/user-session.entity';
import { MoneyOutcome } from './models/payment/outcome.entity';
import { CrashGameBet } from './models/games/crash-bet.entity';
import { MoneyIncome } from './models/payment/income.entity';
import { Settings } from './models/settings/settings.entity';
import { Referral } from './models/referral/referral.entity';
import { UserBonus } from './models/user/user-bonus.entity';
import { BonusQuests } from './models/bonus/quests.entity';
import { Message } from './models/message/message.entity';
import { UserBet } from './models/user/user-bet.entity';
import { Token } from './models/token/token.entity';
import { Crash } from './models/games/crash.entity';
import { Mines } from './models/games/mines.entity';
import { Hilo } from './models/games/hilo.entity';
import { User } from './models/user/user.entity';

// Controllers
import { AttachmentController } from './controllers/attachment/attachment.controller';
import { SettingsController } from './controllers/settings/settings.controller';
import { ServicesController } from './controllers/services/services.controller';
import { PaymentController } from './controllers/payment/payment.controller';
import { BattleController } from './controllers/battle/battle.controller';
import { AdminController } from './controllers/admin/admin.controller';
import { BonusController } from './controllers/bonus/bonus.controller';
import { JackpotController } from './controllers/jackpot/jackpot.controller';
import { CrashController } from './controllers/crash/crash.controller';
import { MinesController } from './controllers/mines/mines.controller';
import { UserController } from './controllers/user/user.controller';
import { AuthController } from './controllers/auth/auth.controller';
import { ChatController } from './controllers/chat/chat.controller';

import { RouletteController } from './controllers/roulette/roulette.controller';
import { HiloController } from './controllers/hilo/hilo.controller';
import { DiceController } from './controllers/dice/dice.controller';

import { BanController } from './controllers/ban/ban.controller';
import { BetController } from './controllers/bet/bet.controller';

// Services
import { ProvablyFairService } from './services/provably-fair/provably-fair.service';
import { AttachmentService } from './services/attachment/attachment.service';
import { VkontakteService } from './services/vkontakte/vkontakte.service';
import { SettingsService } from './services/settings/settings.service';
import { RouletteService } from './services/roulette/roulette.service';
import { JackpotService } from './services/jackpot/jackpot.service';
import { GatewayService } from './services/gateway/gateway.service';
import { PiastrixService } from './services/payment/PiastrixService';
import { UnitpayService } from './services/payment/UnitpayService';
import { PaymentService } from './services/payment/PaymentService';
import { PayeerService } from './services/payment/PayeerService';
import { BattleService } from './services/battle/battle.service';
import { MailerService } from './services/mailer/mailer.service';
import { RandomService } from './services/random/random.service';
import { TokenService } from './services/token/token.service';
import { AdminService } from './services/admin/admin.service';
import { BonusService } from './services/bonus/bonus.service';
import { MinesService } from './services/mines/mines.service';
import { CrashService } from './services/crash/crash.service';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { ChatService } from './services/chat/chat.service';
import { DiceService } from './services/dice/dice.service';
import { HiloService } from './services/hilo/hilo.service';
import { BetService } from './services/bet/bet.service';
import {FreeKassaService} from "./services/payment/FreeKassaService";

@Module({
  imports: [
    I18nModule.forRoot(configService.getConfigI18n()),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([
      PhoneVerification,
      UserBalanceChange,
      UserTotalsCache,
      UserStatusChat,
      UnitpayIncome,
      BonusOneTime,
      MoneyOutcome,
      UserSession,
      CrashGameBet,
      ChatBanList,
      MoneyIncome,
      BonusQuests,
      Attachment,
      JackpotGame,
      JackpotGameBet,
      BattleGame,
      BattleGameBet,
      UserBonus,
      Referral,
      Settings,
      Message,
      UserBet,

      RouletteGame,
      RouletteGameBet,

      Mines,
      Crash,
      Hilo,

      Token,
      User,
    ]),
    ScheduleModule.forRoot(),
    HttpModule
  ],
  controllers: [
    AttachmentController,
    SettingsController,
    ServicesController,
    PaymentController,
    MinesController,
    JackpotController,
    AdminController,
    BonusController,
    BattleController,

    RouletteController,
    CrashController,
    HiloController,
    DiceController,

    UserController,
    AuthController,
    ChatController,
    BanController,
    BetController,
  ],
  providers: [
    AttachmentService,
    JackpotService,
    VkontakteService,
    ProvablyFairService,
    SettingsService,
    GatewayService,
    PaymentService,
    BattleService,
    PiastrixService,
    // JackpotService,
    UnitpayService,
    PayeerService,
    FreeKassaService,
    RandomService,
    MailerService,
    MinesService,
    TokenService,
    BonusService,
    AdminService,

    RouletteService,
    CrashService,
    HiloService,
    DiceService,

    AuthService,
    UserService,
    ChatService,
    BetService,
  ],
})
export class AppModule {}
