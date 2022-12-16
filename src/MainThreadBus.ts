import { finalize, Observable, Subject, Subscription } from 'rxjs';
import { generateId } from './generateId';
import {
  InitCommand,
  ITransport,
  ReturnCommand,
  ReturnType,
  SendMsgCommand,
  SendMsgPayload,
  UnsubscribeCommand,
} from './BusTypes';

type TransportSettings = {
  initialized: boolean;
};

type SendMsgOptions = {
  serviceName: string;
  methodName: string | symbol;
  args: unknown[];
  transport: ITransport;
  useReturnType: ReturnType;
};

type CreateProxyResultOptions = {
  messageId: string;
  command: SendMsgCommand;
  transport: ITransport;
  useReturnType: ReturnType;
  proxySubject: Subject<unknown>;
};

type MessageTransaction = {
  proxySubject: Subject<unknown>;
  proxyReceiverSubscription: Subscription;
};

export class MainThreadBus {
  private constructor() {}

  private readonly transportToSettings = new Map<ITransport, TransportSettings>();

  private readonly pending = new Map<string, MessageTransaction>();

  static readonly instance = new MainThreadBus();

  registerBusWorkers(transports: ITransport[]) {
    for (const transport of transports) {
      this.transportToSettings.set(transport, {
        initialized: false,
      });
    }
  }

  createFactoryService(transport: ITransport) {
    this.tryInit(transport);
    return <T extends object>(serviceName: string, useReturnType = ReturnType.promise): T => {
      return new Proxy<T>(new (class MockService {})() as T, {
        get: (_, methodName) => {
          return (...args: unknown[]) =>
            this.sendMessage({ serviceName, methodName, args: [...args], transport, useReturnType });
        },
      });
    };
  }

  private sendMessage({ serviceName, methodName, args, transport, useReturnType }: SendMsgOptions) {
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

    const proxySubject = new Subject<unknown>();
    const result = this.createProxyResult({ messageId, transport, command, useReturnType, proxySubject });
    transport.sendMsg(command);
    return result;
  }

  private createProxyResult({ messageId, transport, command, useReturnType, proxySubject }: CreateProxyResultOptions) {
    const proxyReceiver$ = proxySubject.asObservable();

    if (useReturnType === ReturnType.promise) {
      return new Promise((resolve, reject) => {
        const sub = proxyReceiver$.subscribe({
          next: (v) => {
            this.dispose(transport, messageId, command.payload);
            resolve(v);
          },
          error: (e) => {
            this.dispose(transport, messageId, command.payload);
            reject(e);
          },
          complete: () => {
            proxySubject.complete();
            this.dispose(transport, messageId, command.payload);
          },
        });
        this.saveTransaction(messageId, proxySubject, sub);
      });
    }

    return new Observable((observer) => {
      const sub = proxyReceiver$.pipe(finalize(() => this.dispose(transport, messageId, command.payload))).subscribe({
        next: (v) => observer.next(v),
        error: (e) => {
          this.dispose(transport, messageId, command.payload);
          observer.error(e);
        },
        complete: () => {
          proxySubject.complete();
          this.dispose(transport, messageId, command.payload);
          observer.complete();
        },
      });

      this.saveTransaction(messageId, proxySubject, sub);

      return sub;
    });
  }

  private dispose(transport: ITransport, messageId: string, payload: SendMsgPayload) {
    transport.sendMsg({ type: 'UNSUBSCRIBE', payload } as UnsubscribeCommand);
    const msgTransaction = this.pending.get(messageId);
    msgTransaction?.proxyReceiverSubscription?.unsubscribe();
    this.pending.delete(messageId);
  }

  private saveTransaction(messageId: string, proxySubject: Subject<unknown>, subscription: Subscription) {
    this.pending.set(messageId, { proxySubject, proxyReceiverSubscription: subscription });
  }

  private tryInit(transport: ITransport): void {
    const typeSettings = this.transportToSettings.get(transport);
    if (!typeSettings) {
      throw new Error(
        `Unregister transport type ${transport.toString()}. Before use createFactoryService, you need invoke registerBusWorkers with your transport.`,
      );
    }

    if (!typeSettings.initialized) {
      transport.sendMsg({ type: 'INIT' } as InitCommand);
      transport.onMessage = this.handleTransportMsg;
      this.transportToSettings.set(transport, { ...typeSettings, initialized: true });
    }
  }

  private handleTransportMsg = ({ data }: MessageEvent<ReturnCommand>) => {
    const { messageId } = data.payload;
    const msgTransaction = this.pending.get(messageId);

    if (!msgTransaction) return;
    const { proxySubject } = msgTransaction;
    const type = data.type;

    switch (type) {
      case 'RETURN_NEXT':
        proxySubject.next(data.payload.value);
        break;

      case 'RETURN_ERROR':
        proxySubject.error(data.payload.errorMsg);
        break;

      case 'RETURN_COMPLETE':
        proxySubject.complete();
        break;

      default:
        console.error(`unknown command type ${type}`);
        break;
    }
  };
}
