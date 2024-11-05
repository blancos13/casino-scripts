import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'user_session'
})
export class UserSession {
  @PrimaryColumn()
  public sessionId: string;

  @Column({nullable: false})
  public userId: number;
}