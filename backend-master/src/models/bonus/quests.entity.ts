import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Index } from "typeorm";

import { User } from '../user/user.entity';
import { UserBonus } from '../user/user-bonus.entity';

import { QuestsEnum } from './enum/quests.anum';

@Entity({
    name: 'bonus_quests'
})
// @Index('user_bonus_type_user_idx',['type', 'user'])
// @Index('user_bonus_type_user_date_idx',['type', 'user', 'date'])
export class BonusQuests {
    @PrimaryGeneratedColumn()
    public id: string;

    @ManyToOne(() => User, { nullable: false, eager: true })
    @JoinColumn({name: 'user_id'})
    public user: User;

    @ManyToOne(() => UserBonus, bonus => bonus.quests, { nullable: false, eager: true })
    @JoinColumn({ name: 'user_bonus_id' })
    public userBonus: UserBonus;
  
    @Column({nullable: true})
    public type: QuestsEnum;

    @Column({nullable: false, default: false, name: 'is_taken'})
    public isTaken: boolean;

    @Column({nullable: false})
    public date: Date;

    @Column({nullable: false, name: 'prize', type: 'float'})
    private _prize: number;
  
    get prize(): number {
      return this._prize;
    }
  
    set prize(value: number) {
      this._prize = value ? +value.toFixed(2) : value;
    }
}