import { UserService } from './UserService';

export const USER_SERVICE = 'USER_SERVICE';

export const container = {
  [USER_SERVICE]: new UserService(),
};
