import { User } from './../../user/user.entity';

import { GameStatusEnum } from './../enum/game-status.enum';

export interface CreateMinesInterface {
  wager: number;
  amount?: number;
  user: User;
  status: GameStatusEnum;
  selected: string;
  cell1: string;
  cell2: string;
  cell3: string;
  cell4: string;
}