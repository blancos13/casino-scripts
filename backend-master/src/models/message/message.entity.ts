import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';

import { User } from '../user/user.entity';

import { ICreateMessage } from './interfaces/create-message.interface';

@Entity({
  name: 'message',
})
export class Message {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column({ default: 'main' })
  private room: string;

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  public uid: User;

  @Column({ nullable: false, default: new Date() })
  public date: Date;

  @Column({ nullable: false, name: 'content' })
  public content: string;

  constructor(data: ICreateMessage) {
    if (data) {
      this.uid = data.userId;
      this.content = data.content;
    }
  }
}
