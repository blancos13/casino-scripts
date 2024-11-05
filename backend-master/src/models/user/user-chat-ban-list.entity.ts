import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { User } from './user.entity'

@Entity({
  name: 'chat_ban_list'
})
export class ChatBanList {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: false })
  public reason: string

  @Column({ nullable: false, default: new Date() })
  public date: Date

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  public user: string
}