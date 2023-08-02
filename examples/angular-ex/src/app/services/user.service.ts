import { Observable } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map } from 'rxjs/operators';

export type UserComments = {
  userId: string;
  userName: string;
  commentCount: number;
};

type CommentDTO = {
  id: number;
  body: string;
  postId: number;
  user: {
    id: number;
    username: string;
  };
};

export class UserServiceWithObservable {
  /** давайте построи график зависимости пользователя количества его комментариев  */
  public getUserComments(): Observable<UserComments[]> {
    const resp = fromFetch('https://dummyjson.com/comments', {
      selector: (response) => response.json() as Promise<{ comments: CommentDTO[] }>,
    }).pipe(
      map((data) => groupBy(data.comments, (item) => item.user.id)),
      map((group) => {
        doHardWork();
        return [...Object.entries(group)].map(
          ([userId, comments]) =>
            ({
              userId,
              userName: (comments as CommentDTO[])[0].user.username,
              commentCount: (comments as CommentDTO[]).length,
            } as UserComments),
        );
      }),
    );

    return resp;
  }
}

export class UserServiceWithPromise {
  public async getUserComments(): Promise<UserComments[]> {
    const resp = await fetch('https://dummyjson.com/comments');
    const data = (await resp.json()) as { comments: CommentDTO[] };
    const group = groupBy(data.comments, (item) => item.user.id);
    doHardWork();
    return [...Object.entries(group)].map(
      ([userId, comments]) =>
        ({
          userId,
          userName: (comments as CommentDTO[])[0].user.username,
          commentCount: (comments as CommentDTO[]).length,
        } as UserComments),
    );
  }
}

const groupBy = <T>(data: T[], keyFn: (item: T) => string | number) =>
  data.reduce((agg: any, item: any) => {
    const group = keyFn(item);
    agg[group] = [...(agg[group] || []), item];
    return agg;
  }, {});

const doHardWork = () => {
  function fibonacci(n: number): number {
    return n < 1 ? 0 : n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
  }

  for (let index = 0; index < 39; index++) {
    fibonacci(index);
  }
};
