import { GameStatusEnum } from './../enum/game-status.enum';
import { User } from './../../user/user.entity';

export interface CreateCrashInterface {
  wager: number;
  amount?: number;
  user: User;
  status: GameStatusEnum;
  serverSeed: string;
  cell1: number;
  cell2: number;
  cell3: number;
  date: Date;
}