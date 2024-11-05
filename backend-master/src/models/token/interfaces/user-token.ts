export interface IUserToken {
  readonly token: string;
  readonly uId: string;
  readonly expireAt: Date;
}
