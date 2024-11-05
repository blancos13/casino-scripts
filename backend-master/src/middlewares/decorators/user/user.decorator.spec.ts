import { UserDecorator } from './user.decorator';

describe('UserGuard', () => {
  it('should be defined', () => {
    expect(new UserDecorator()).toBeDefined();
  });
});
