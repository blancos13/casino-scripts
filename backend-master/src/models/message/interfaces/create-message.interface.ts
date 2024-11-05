import { User } from '../../user/user.entity';

export interface ICreateMessage {
  userId: User;
  content: string;
}
