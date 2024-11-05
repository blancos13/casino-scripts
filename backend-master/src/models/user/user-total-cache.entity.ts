import { Column, Entity } from 'typeorm';
import { PrimaryColumn } from 'typeorm/index';

@Entity({
  name: 'user_totals_cache',
})
export class UserTotalsCache {
  @PrimaryColumn({name: 'user_id'})
  public id: number;

  @Column({ nullable: false, name: 'referral_count_composite' })
  public compositeReferralCount: string;

  @Column({ nullable: true, name: 'total_referrals' })
  public totalReferrals: number;

  @Column({ nullable: true, name: 'total_active_referrals' })
  public totalActiveReferrals: number;

  @Column({ nullable: true, name: 'total_payable_referrals' })
  public totalPayableReferrals: number;

  @Column({ nullable: false, name: 'referral_income_composite' })
  public compositeReferralIncome: string;

  @Column({ nullable: true, name: 'total_referral_income', type: 'float' })
  public totalReferralIncome: number;

  @Column({ nullable: true, name: 'today_referral_income', type: 'float' })
  public todayReferralIncome: number;

  @Column({ nullable: false, name: 'games_count' })
  public gamesCount: number;
}
