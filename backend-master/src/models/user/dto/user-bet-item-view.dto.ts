import { GameTypeEnum } from './../../../constants/game-type.enum';

export class UserBetListItemViewDto {
  public game: GameTypeEnum;
  public user: string;
  public date: Date;
  public bet: number;
  public chance: string;
  public prize: number;
}