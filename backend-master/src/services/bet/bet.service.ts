import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { User } from '../../models/user/user.entity';
import { UserBet } from '../../models/user/user-bet.entity';
import { GameTypeEnum } from '../../constants/game-type.enum';

class UserBetListItemView {
  public game: GameTypeEnum;
  public user: string;
  public photo: string;
  public date: Date;
  public bet: number;
  public chance: string;
  public prize: number;
}

@Injectable()
class BetService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserBet)
    private userBetRepository: Repository<UserBet>) {
  }

  private buildGetListRequest(skip: number, count: number): SelectQueryBuilder<any> {
    const query = this.userBetRepository
      .createQueryBuilder('user_bet')
      .innerJoin(User, 'user', 'user.id = user_bet.userId')
      .addSelect(['user.username', 'user.photoUrl'])
      .addOrderBy('user_bet.date', 'DESC')

    if(skip !== -1) {
      query.skip(skip);
    }
    if(count !== -1) {
      query.limit(count);
    }
    return query;
  }

  private mapBetListItem(betRow: any) : UserBetListItemView {
    const bet = new UserBetListItemView();
    
    bet.game = betRow.user_bet_game;
    bet.user = betRow.user_username;
    bet.photo = betRow.user_photoUrl;
    bet.date = betRow.user_bet_date;
    bet.bet = betRow.user_bet_bet;
    bet.chance = betRow.user_bet_chance === null ? '?' : betRow.user_bet_chance + '%';
    bet.prize = betRow.user_bet_prize === null ? '?' : betRow.user_bet_prize;
    return bet;
  }

  public async getAllBets(skip: number, count: number): Promise<UserBetListItemView[]> {

    const bets = await this.buildGetListRequest(skip, count).getRawMany();
    return bets.map(betRow => this.mapBetListItem(betRow));
  }

  public async getByBets(skip: number, count: number, userId: number): Promise<UserBetListItemView[]> {
    const bets = await this.buildGetListRequest(skip, count)
      .where(`user_bet.userId = ${userId}`)
      .getRawMany();
    return bets.map(betRow => this.mapBetListItem(betRow));
  }
}

export { UserBetListItemView, BetService };