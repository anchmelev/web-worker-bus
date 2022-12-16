import { finalize, Observable, Subject, Subscription } from 'rxjs';
import { generateId } from './generateId';
import { InitCommand, ReturnCommand, ReturnType, SendMsgCommand, SendMsgPayload, UnsubscribeCommand } from './BusTypes';
import { AnyBusWorker } from './types';
export { AnyBusWorker } from './types';

type BusWorkerSettings = {
  instance: Worker | null;
};

type SendMsgOptions = {
  serviceName: string;
  methodName: string | symbol;
  args: unknown[];
  worker: Worker;
  useReturnType: ReturnType;
};

type CreateProxyResultOptions = {
  messageId: string;
  command: SendMsgCommand;
  worker: Worker;
  useReturnType: ReturnType;
  transport: Subject<unknown>;
};

type MessageTransaction = {
  transport: Subject<unknown>;
  proxyReceiverSubscription: Subscription;
};

export class MainThreadBus {
  private constructor() {}

  private readonly busWorkerTypes = new Map<typeof Worker, BusWorkerSettings>();

  private readonly pending = new Map<string, MessageTransaction>();

  static readonly instance = new MainThreadBus();

  registerBusWorkers(busTypes: typeof Worker[]) {
    for (const busType of busTypes) {
      this.busWorkerTypes.set(busType, {
        instance: null,
      });
    }
  }

  createFactoryService(busType: typeof AnyBusWorker) {
    const worker = this.getWorker(busType);
    return <T extends object>(serviceName: string, useReturnType = ReturnType.promise): T => {
      return new Proxy<T>(new (class MockService {})() as T, {
        get: (_, methodName) => {
          return (...args: unknown[]) =>
            this.sendMessage({ serviceName, methodName, args: [...args], worker, useReturnType });
        },
      });
    };
  }

  private sendMessage({ serviceName, methodName, args, worker, useReturnType }: SendMsgOptions) {
    const messageId = generateId();
    const command: SendMsgCommand = {
      type: 'SEND_MSG',
      payload: {
        messageId,
        serviceName,
        methodName: methodName as string,
        args,
      },
    };

    const transport = new Subject<unknown>();
    const result = this.createProxyResult({ messageId, worker, command, useReturnType, transport });
    worker.postMessage(command);
    return result;
  }

  private createProxyResult({ messageId, worker, command, useReturnType, transport }: CreateProxyResultOptions) {
    const proxyReceiver$ = transport.asObservable();

    if (useReturnType === ReturnType.promise) {
      return new Promise((resolve, reject) => {
        const sub = proxyReceiver$.subscribe({
          next: (v) => {
            this.dispose(worker, messageId, command.payload);
            resolve(v);
          },
          error: (e) => {
            this.dispose(worker, messageId, command.payload);
            reject(e);
          },
          complete: () => {
            transport.complete();
            this.dispose(worker, messageId, command.payload);
          },
        });
        this.saveTransaction(messageId, transport, sub);
      });
    }

    return new Observable((observer) => {
      const sub = proxyReceiver$.pipe(finalize(() => this.dispose(worker, messageId, command.payload))).subscribe({
        next: (v) => observer.next(v),
        error: (e) => {
          this.dispose(worker, messageId, command.payload);
          observer.error(e);
        },
        complete: () => {
          transport.complete();
          this.dispose(worker, messageId, command.payload);
          observer.complete();
        },
      });

      this.saveTransaction(messageId, transport, sub);

      return sub;
    });
  }

  private dispose(worker: Worker, messageId: string, payload: SendMsgPayload) {
    worker.postMessage({ type: 'UNSUBSCRIBE', payload } as UnsubscribeCommand);
    const msgTransaction = this.pending.get(messageId);
    msgTransaction?.proxyReceiverSubscription?.unsubscribe();
    this.pending.delete(messageId);
  }

  private saveTransaction(messageId: string, transport: Subject<unknown>, subscription: Subscription) {
    this.pending.set(messageId, { transport, proxyReceiverSubscription: subscription });
  }

  private getWorker(busType: typeof AnyBusWorker): Worker {
    const typeSettings = this.busWorkerTypes.get(busType);
    if (!typeSettings) {
      throw new Error(
        `Unregister bus type ${busType.name}. Before use createFactoryService, you need invoke registerBusWorkers with your bus type.`,
      );
    }

    let worker = typeSettings.instance;
    if (worker == null) {
      worker = new busType();
      worker.postMessage({ type: 'INIT' } as InitCommand);
      worker.addEventListener('message', this.handleWorkerMsg);
      this.busWorkerTypes.set(busType, { ...typeSettings, instance: worker });
      typeSettings.instance = worker;
    }

    return worker;
  }

  private handleWorkerMsg = ({ data }: MessageEvent<ReturnCommand>) => {
    const { messageId } = data.payload;
    const msgTransaction = this.pending.get(messageId);

    if (!msgTransaction) return;
    const { transport } = msgTransaction;
    const type = data.type;

    switch (type) {
      case 'RETURN_NEXT':
        transport.next(data.payload.value);
        break;

      case 'RETURN_ERROR':
        transport.error(data.payload.errorMsg);
        break;

      case 'RETURN_COMPLETE':
        transport.complete();
        break;

      default:
        console.error(`unknown command type ${type}`);
        break;
    }
  };
}
