import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../user/user.entity';

@Entity({ name: 'referral' })
export class Referral {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'owner_user_id' })
  public owner: User;

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'referral_user_id' })
  public referral: User;
}
