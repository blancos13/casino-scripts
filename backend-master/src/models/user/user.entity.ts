import { Entity, Column, PrimaryGeneratedColumn, EntityManager } from 'typeorm';

import { UserStatusChat } from './user-status-chat.entity'

import { ReadUserDto } from './dto/read-user.dto';
import { MessageUserDto } from './dto/message-user.dto';

import { statusChatEnum } from './enums/status-chat.enum';
import { statusEnum } from './enums/status.enum';
import { roleEnum } from './enums/role.enum';

@Entity({
  name: 'user',
})
export class User {
  private readonly publicFields = [
    'username',
    'email',
    'phone',
    'id',
    'role',
    'photoUrl',
    'statusChat',
    'status',
    'balance',
    'demoBalance',
    'registrationDate',
    'lastActivationPromocode',
    'lastActivationChest'
  ];
  private readonly chatFields = [
    'id',
    'statusChatEnum',
    'username',
    'photoUrl',
    'email',
    'role',
  ];

  constructor(data?: {
    login?: string;
    email: string;
    passwordHash: string;
    photo?: string;
    randomCode: string;
  }) {
    if (data) {
      this.username = data.login;
      this.email = data.email;
      this.randomCode = data.randomCode;
      this.photoUrl = data.photo;
      this.passwordHash = data.passwordHash;
      this.registrationDate = new Date();
    }
  }

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true, unique: true })
  public phone: string;

  @Column({ nullable: true })
  public name: string;
  @Column({ nullable: true })
  public surName: string;
  @Column({ nullable: true })
  public username: string;
  @Column({ nullable: true, length: 1000 })
  public photoUrl: string;

  @Column({ nullable: false, default: 0, type: 'float', name: 'balance' })
  private _balance: number;
  @Column({ nullable: false, default: 0, type: 'float', name: 'demo_balance' })
  private _demoBalance: number;

  @Column({ nullable: true, unique: true })
  public vkId: number;
  @Column({ nullable: true, unique: true })
  public okId: string;
  @Column({ nullable: true, unique: true })
  public fbId: string;

  @Column({ nullable: false, default: false, name: 'is_web_notification_enabled' })
  public isWebNotificationEnabled: boolean;

  @Column({ nullable: true })
  public ip: string;
  @Column({ nullable: true, name: 'registration_date' })
  public registrationDate: Date;
  @Column({ nullable: true, name: 'last_action_date' })
  public lastActionDate: Date;
  @Column({ nullable: true, name: 'mute_time', default: new Date() })
  public muteTime: Date;

  @Column({ nullable: true, name: 'email' })
  public email: string;
  @Column({ nullable: false, name: 'is_admin', default: false })
  public isAdmin: boolean;

  @Column({ nullable: true, name: 'demo_money_bonus_date' })
  public demoMoneyBonusDate: Date;
  @Column({ nullable: true, name: 'last_activation_promocode' })
  public lastActivationPromocode: Date;
  @Column({ nullable: true, name: 'last_activation_chest' })
  public lastActivationChest: Date;
  @Column({ nullable: false, default: 0, name: 'referral_transitions' })
  public referralTransitions: number;
  @Column({ nullable: false, default: false, name: 'is_referral_bonuses_blocked' })
  public isReferralBonusesBlocked: boolean;
  @Column({ nullable: false, default: false, name: 'is_phone_verified' })
  public isPhoneVerified: boolean;
  @Column({ name: 'phone_verified', nullable: true })
  public phoneVerified: string;

  @Column({ nullable: true, default: false, name: 'password_hash' })
  public passwordHash: string;

  @Column({ nullable: true, name: 'random_code' })
  public randomCode: string;

  @Column({ nullable: true, name: 'client_seed' })
  public clientSeed: string;

  @Column({ nullable: false, default: roleEnum.user })
  public role: string;
  @Column({ nullable: false, default: statusChatEnum.default, name: 'status_chat' })
  public statusChat: statusChatEnum;
  @Column({ nullable: false, default: statusEnum.new })
  public status: number;

  public getPublicFields(): ReadUserDto {
    const fields = {};

    this.publicFields.forEach((item) => {
      fields[item] = this[item];
    });

    return <ReadUserDto>fields;
  }
  public getFieldsForChat(): MessageUserDto {
    const fields = {};

    this.chatFields.forEach((item) => {
      fields[item] = this[item];
    });

    return <MessageUserDto>fields;
  }

  get balance(): number {
    return this._balance ? Math.floor(this._balance * 100) / 100 : this._balance;
  }

  set balance(value: number) {
    this._balance = value ? +value.toFixed(2) : value;
  }

  get demoBalance(): number {
    return this._demoBalance ? Math.floor(this._demoBalance * 100) / 100 : this._demoBalance;
  }

  set demoBalance(value: number) {
    this._demoBalance = value ? +value.toFixed(2) : value;
  }

  public async statusList(manager: EntityManager): Promise<UserStatusChat[]> {
    return manager.find(UserStatusChat, { user: this });
  }
}
