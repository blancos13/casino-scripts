import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../user/user.entity';

@Entity({
  name: 'token',
})
export class Token {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  @IsNotEmpty()
  @IsString()
  public content: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @IsNotEmpty()
  @IsString()
  public uId: string;

  @Column({ nullable: false, name: 'expire_at' })
  @IsNotEmpty()
  @IsDateString()
  public expireAt: Date;

  constructor(props: { uId: string; expireAt: Date; content: string }) {
    if (props) {
      this.content = props.content;
      this.uId = props.uId;
      this.expireAt = props.expireAt;
    }
  }
}
