import { UserService } from './user.service';

export const USER_SERVICE = 'USER_SERVICE';

export const container = {
  [USER_SERVICE]: new UserService(),
};
