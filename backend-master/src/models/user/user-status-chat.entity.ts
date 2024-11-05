import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { statusChatEnum } from './enums/status-chat.enum';

import { User } from './user.entity';

@Entity({
  name: 'user_status_chat',
})
class UserStatusChat {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public type: statusChatEnum;
  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  public user: User;

  public name() {
    switch (this.type) {
      case statusChatEnum.default:
        return 'Новый';
      case statusChatEnum.mute:
        return 'Отключен';
      case statusChatEnum.ban:
        return 'Забанен';
      default:
        return null;
    }
  }

  public static getTypeByName(name: string) {
    if(!name) {
      return null;
    }
    
    switch (name.toLowerCase()) {
      case 'новый':
        return statusChatEnum.default;
      case 'отключен':
        return statusChatEnum.mute;
      case 'забанен':
        return statusChatEnum.ban;
      default:
        return null;
    }
  }
}

export { UserStatusChat }
