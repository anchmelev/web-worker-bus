import { UserServiceWithObservable, UserServiceWithPromise } from './UserService';

export const USER_SERVICE_WITH_OBSERVABLE = 'USER_SERVICE_WITH_OBSERVABLE';
export const USER_SERVICE_WITH_PROMISE = 'USER_SERVICE_WITH_PROMISE';

export const container = {
  [USER_SERVICE_WITH_OBSERVABLE]: new UserServiceWithObservable(),
  [USER_SERVICE_WITH_PROMISE]: new UserServiceWithPromise(),
};
