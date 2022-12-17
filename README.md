# web-worker-bus

This package makes it easy to host your services in Web Workers and hides the complexity of messaging with them. 
It can be used with any of your favorite frameworks such as React, Angular and Vue.js

## Installation

Install the web-worker-bus package using [npm](https://www.npmjs.com/):

```bash
npm i web-worker-bus
```

## Usage

To use the web-worker-bus, it is convenient to use the package [worker-loader](https://www.npmjs.com/package/worker-loader):
Using this package is as follows:

```ts
import MyWorker from "worker-loader!./MyWorker.ts";
```

In order for the typescript not to give an error, you need to add the following setting to yours tsconfig.json

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/web-worker-bus/types.d.ts"]
  },
}
```

Consider the example of a service that loads user data and a service that will download goods. 
We’ll take this data from [dummyjson](https://dummyjson.com/).
The user service will use promises, and the product service, for example, will use rxjs observable.

### UserService.ts

```ts
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
}

export class UserService {
  async getUsers(): Promise<User[]> {
    const resp = await fetch("https://dummyjson.com/users");
    const data = await resp.json();
    return data.users as User[];
  }
}
```

### ProductService.ts

```ts
export type Product = {
  id: number;
  title: string;
};

export class ProductService {
  async getProducts(): Observable<Product[]> {
    const resp = fromFetch("https://dummyjson.com/products", {
      selector: (response) => response.json() as Promise<{ products: Product[] }>,
    }).pipe(
      map((data) => data.products),
    );
    return resp;
  }
}
```

Let's define service identifiers. Which can be used to build weak links in the code ([dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)).
I like the library [InversifyJS](https://github.com/inversify/InversifyJS). I recommend checking out this package.
For the current example, one web worker would be enough, but for the example, consider hosting each service in your own web worker.
For simplicity, we use an ordinary object as a hash table.

### UserWorkerContainer.ts

```ts
import { UserService } from './UserService';

export const USER_SERVICE = 'USER_SERVICE'

export const container = {
   [USER_SERVICE]: new UserService() 
}
```

### ProductWorkerContainer.ts

```ts
import { ProductService } from './ProductService';

export const PRODUCT_SERVICE = 'PRODUCT_SERVICE'

export const container = {
   [PRODUCT_SERVICE]: new ProductService() 
}
```

Now let's configure the bus for strict web workers

### UserWorker.ts

```ts
import { BusWorker, ObjectCopyTransport } from 'web-worker-bus';
import { container } from './UserWorkerContainer';

/* eslint-disable-next-line no-restricted-globals */
const worker = self as unknown as Worker; // self in our case is a global variable that contains a global object - an instance of the Worker class

const transport = new ObjectCopyTransport(worker);
BusWorker.connectToBus(transport, (serviceName) => container[serviceName]);
```

### ProductWorker.ts

```ts
import { BusWorker, ObjectCopyTransport } from 'web-worker-bus';
import { container } from './ProductWorkerContainer';

/* eslint-disable-next-line no-restricted-globals */
const worker = self as unknown as Worker; // self in our case is a global variable that contains a global object - an instance of the Worker class

const transport = new ObjectCopyTransport(worker);
BusWorker.connectToBus(transport, (serviceName) => container[serviceName]);
```

As you can see the bus configuration is almost identical. To set up a bus, we must make sure to pass an instance of the transport layer to it. Currently, the transport level of sending messages with data [structured cloning](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) is used (the mechanism [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage))

you can implement your own transport layer by implementing an interface from a package web-worker-bus:

```ts
/** An interface that provides work with the transport layer for delivering messages between threads */
export interface ITransport {
  /** A callback that will be called when a message is received from main thread */
  onMessage: OnMessageHandler;
  /**
   * Method for sending messages to the main thread
   * @param msg - the message to be sent to the main thread
   */
  sendMsg(msg: unknown): void;
}
```

Now let's configure the bus at the UI thread level. For this the MainThreadBus class is used. 
We must define the same transport layer that we defined in the web worker. We use ObjectCopyTransport and pass in an instance of the web worker, which returns the worker-loader to us. We then have to register our transport layers with the MainThreadBus. 
And for each web worker, create a service creation factory.


### ConfigBuses.ts

```ts
/* eslint import/no-webpack-loader-syntax: off */
import { MainThreadBus, ObjectCopyTransport } from "web-worker-bus";
import UserWorker from "worker-loader!./UserWorker";
import ProductWorker from "worker-loader!./ProductWorker";

const userTransport = new ObjectCopyTransport(new UserWorker());
const productTransport = new ObjectCopyTransport(new ProductWorker());

MainThreadBus.instance.registerBusWorkers([userTransport, productTransport]);

export const userWorkerFactory = MainThreadBus.instance.createFactoryService(userTransport);
export const productWorkerFactory = MainThreadBus.instance.createFactoryService(productTransport);

```

The userWorkerFactory and productWorkerFactory factories create proxy objects that communicate with service instances located in their web workers.

### App.ts

```ts
import { ReturnType } from "web-worker-bus";
import { UserWorker } from './UserWorker';
import { ProductService } from './ProductService';
import { USER_SERVICE } from './UserWorkerContainer';
import { PRODUCT_SERVICE } from './ProductWorkerContainer';

const userService = userWorkerFactory<UserWorker>(USER_SERVICE);
const productService = userWorkerFactory<ProductService>(PRODUCT_SERVICE, ReturnType.rxjsObservable);
```

Now, you can use the proxy userService and productService objects in the ui stream. Typescript will think that you are using real service instances. All the complexity of communicating with a web worker is hidden from the end user of the services. Also, at any time, without changing the code base that uses the services, you can move the location of the services between the threads of your application - remove the web workers altogether or put everything into one web worker, for which it is enough to change only the configuration of the ui thread bus.