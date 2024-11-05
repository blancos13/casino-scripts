import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { BonusQuests } from './../bonus/quests.entity';
import { User } from './user.entity';

import { BonusType } from './enums/bonus-type.enum';

@Entity({
  name: 'user_bonus'
})
export class UserBonus {
  @PrimaryGeneratedColumn()
  public id: number

  @ManyToOne(() => User, {nullable: false, eager: true})
  @JoinColumn({name: 'user_id'})
  public user: User;

  @Column({nullable: false})
  public date: Date;

  @Column({nullable: false})
  public type: BonusType;

  @Column({nullable: false, default: false, name: 'is_taken'})
  public isTaken: boolean;  

  @Column({nullable: false, name: 'prize', type: 'float'})
  private _prize: number;

  @OneToMany(() => BonusQuests, (quest:BonusQuests) => quest.userBonus)
  public quests: BonusQuests[];

  get prize(): number {
    return this._prize;
  }

  set prize(value: number) {
    this._prize = value ? +value.toFixed(2) : value;
  }
}