# web-worker-bus

This package makes it easy to host your services in Web Workers and hides the complexity of messaging with them.
It can be used with any of your favorite frameworks such as React, Angular and Vue.js

## Installation

Install the web-worker-bus package using [npm](https://www.npmjs.com/):

```bash
npm i web-worker-bus
```

## Usage

Let's look at some examples to better understand how this system works in real-world scenarios. This will allow us to see how we can use the architecture and tools in different situations.
Library classes:

```ts
// Class for registering web workers and creating factory of proxy services
class MainThreadBus {
  // Registering web workers
  registerBusWorkers(transports: ITransport[]) {
    /* ... */
  }

  // Creating a factory for proxy services
  createFactoryService(transport: ITransport) {
    /* ... */
  }
}

// Class for registering the real service in the bus on the web worker side
class BusWorker {
  getService!: ServiceGetter;
  transport!: ITransport;
  // Connecting to the bus
  static connectToBus(transport: ITransport, getService: ServiceGetter, initHandler?: InitEventHandler) {
    /* ... */
  }
}

// Transport layer using postMessage
export class ObjectCopyTransport implements ITransport {
  constructor(private readonly ctx: Worker) {
    /* ... */
  }

  // Message handler
  protected messageHandler(event: MessageEvent<SendCommand>): void {
    /* ... */
  }

  // Sending a message
  sendMsg(msg: unknown): void {
    this.ctx.postMessage(msg);
  }
}
```

Suppose we have a UserService that takes a long time to return user comments. Let's get them out into a web worker using this bus. Main thread code:
Creating a factory bound to the UserWorker

```ts
import { MainThreadBus, ObjectCopyTransport } from 'web-worker-bus';
// Creating a web worker
const worker = new Worker(new URL('./Services/UserWorker', import.meta.url));
const userTransport = new ObjectCopyTransport(worker);
// Registering the worker
MainThreadBus.instance.registerBusWorkers([userTransport]);
// Creating a factory bound to the worker
export const userWorkerFactory = MainThreadBus.instance.createFactoryService(userTransport);
```

Web worker code

```ts
import { BusWorker, ObjectCopyTransport, ServiceGetter } from 'web-worker-bus';
import { container } from './UserWorkerContainer';

/* eslint-disable-next-line no-restricted-globals */
const worker = self as unknown as Worker;

const serviceGetter: ServiceGetter = (serviceName) => {
  // Return the UserService instance, using any container or creating the class instance directly
  return container[serviceName as keyof typeof container];
};
// Connecting the web worker to the bus
BusWorker.connectToBus(new ObjectCopyTransport(worker), serviceGetter);
```

I like the library [InversifyJS](https://github.com/inversify/InversifyJS). I recommend checking out this package.
For the current example, one web worker would be enough, but for the example, consider hosting each service in your own web worker.
For simplicity, we use an ordinary object as a hash table.

```ts
import { UserService } from './user.service';
import { RightService } from './user.service';

export const USER_SERVICE = 'USER_SERVICE';
export const RIGHT_SERVICE = 'RightService';

export const container = {
  [USER_SERVICE]: new UserService(),
  [RIGHT_SERVICE]: new RightService(),
};
```

Implementation for a services that uses Observable

```ts
// Service to get user comments
export class UserService {
  public getUserComments(): Observable<UserComments[]> {
    /* ... */
  }
}

export class RightService {
  public getUserRights(userId: number): Promise<UserRight[]> {
    /* ... */
  }
}
```

Creating a proxy service in the main thread, which is linked to the service in the web worker

```ts
const userService = userWorkerFactory<UserService>(USER_SERVICE, ReturnType.rxjsObservable);
const rightService = userWorkerFactory<RightService>(RIGHT_SERVICE, ReturnType.promise);
```

Now we can use the service as if its instance is located in the main thread. Typescript will think that you are using real service instances. All the complexity of communicating with a web worker is hidden from the end user of the services. Also, at any time, without changing the code base that uses the services, you can move the location of the services between the threads of your application - remove the web workers altogether or put everything into one web worker, for which it is enough to change only the configuration of the ui thread bus.

```ts
const subscription$ = userService.getUserComments().subscribe({
  next: (userComments) => {
    // you code ...
  },
  error: (e) => {
    // you code ...
  },
  complete: () => {
    // you code ...
  },
});

rightService
  .getUserRights()
  .then((userRights) => {
    // you code ...
  })
  .catch((error) => {
    // you code ...
  })
  .finally(() => {
    // you code ...
  });
```

You can see ready-made examples along with popular frameworks by clicking on the links below:

- [React](https://github.com/anchmelev/web-worker-bus/tree/main/examples/react-ex)
- [Angular](https://github.com/anchmelev/web-worker-bus/tree/main/examples/angular-ex)
- [Vue.js](https://github.com/anchmelev/web-worker-bus/tree/main/examples/vue-ex)

## TODO List

- [ ] Passing data by [transferring ownership](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#passing_data_by_transferring_ownership_transferable_objects) (transferable objects)
- [ ] Cover the library with tests
