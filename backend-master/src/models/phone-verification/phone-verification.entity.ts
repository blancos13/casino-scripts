import { User } from './../user/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { JoinColumn, ManyToOne } from 'typeorm/index';

@Entity({
  name: 'phone_verification',
})
export class PhoneVerification {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => User, {eager: true,nullable:false})
  @JoinColumn({ name: 'user_id' })
  public user: User;
  @Column({name: 'phone', nullable:false})
  public phone: string;
  @Column({name: 'code', nullable:false})
  public code: string;
  @Column({name: 'tries', nullable:false})
  public tries: number;
  @Column({name: 'date', nullable:false})
  public date: Date;
  @Column({name: 'accepted_uuid', nullable:true})
  public acceptedUUID: string;
}