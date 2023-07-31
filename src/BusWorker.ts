import { finalize, isObservable, Subscription } from 'rxjs';
import {
  SendCommand,
  SendMsgPayload,
  ReturnNextCommand,
  ReturnErrorCommand,
  ReturnCompleteCommand,
  InitEventHandler,
  ServiceGetter,
  ITransport,
} from './BusTypes';

type DictionaryFunction = {
  [key: string]: (...args: unknown[]) => unknown;
};

export class BusWorker {
  private constructor() {}

  private static _instance: BusWorker;

  private readonly msgToSubs: Map<string, Subscription> = new Map();

  private initHandler?: InitEventHandler;

  getService!: ServiceGetter;

  transport!: ITransport;

  static connectToBus(transport: ITransport, getService: ServiceGetter, initHandler?: InitEventHandler) {
    if (this._instance) return;
    if (typeof window !== 'undefined') throw new Error('Class BusWorker must use only in web worker context!');

    this._instance = new BusWorker();
    this._instance.getService = getService;
    this._instance.initHandler = initHandler;
    this._instance.transport = transport;
    this._instance.transport.onMessage = this._instance.messageHandler;
    return;
  }

  private messageHandler = ({ data }: MessageEvent<SendCommand>): void => {
    switch (data.type) {
      case 'INIT':
        this.initHandler?.();
        break;
      case 'SEND_MSG':
        this.handleSendMsgCommand(data.payload);
        break;

      case 'UNSUBSCRIBE':
        this.handleUnsubscribeCommand(data.payload);
        break;
    }
  };

  private handleUnsubscribeCommand({ messageId, serviceName, methodName }: SendMsgPayload): void {
    const key = this.getKeyMap(messageId, serviceName, methodName);
    const subs = this.msgToSubs.get(key);
    if (subs == null) {
      return;
    }
    if (!subs.closed) {
      subs.unsubscribe();
    }
    this.msgToSubs.delete(key);
    return;
  }

  private async handleSendMsgCommand({ messageId, serviceName, methodName, args }: SendMsgPayload): Promise<void> {
    if (!this.getService) return;

    const service = this.getService(serviceName);
    const fn = (service as DictionaryFunction)?.[methodName];

    if (!fn || !(fn instanceof Function)) return;

    const key = this.getKeyMap(messageId, serviceName, methodName);
    try {
      const returnValue = (service as DictionaryFunction)?.[methodName](...args);

      if (returnValue instanceof Promise) {
        const value = await returnValue;
        this.transport.sendMsg({ type: 'RETURN_NEXT', payload: { value, messageId } } as ReturnNextCommand);
        return;
      } else if (!isObservable(returnValue)) {
        this.transport.sendMsg({
          type: 'RETURN_NEXT',
          payload: { value: returnValue, messageId },
        } as ReturnNextCommand);
        return;
      }

      const subs = returnValue
        .pipe(
          finalize(() => {
            this.transport.sendMsg({ type: 'RETURN_COMPLETE', payload: { messageId } } as ReturnCompleteCommand);
            this.msgToSubs.delete(key);
          }),
        )
        .subscribe({
          next: (value) => {
            this.transport.sendMsg({ type: 'RETURN_NEXT', payload: { value, messageId } } as ReturnNextCommand);
          },
          error: (eMsg) => {
            this.transport.sendMsg({
              type: 'RETURN_ERROR',
              payload: { errorMsg: eMsg, messageId },
            } as ReturnErrorCommand);
          },
          complete: () => {},
        });
      this.msgToSubs.set(key, subs);
    } catch (error) {
      const errorMsg = (error as Error).message;
      this.transport.sendMsg({ type: 'RETURN_ERROR', payload: { errorMsg, messageId } } as ReturnErrorCommand);
    }
  }

  private getKeyMap(messageId: string, serviceName: string, methodName: string): string {
    return `${messageId}-${serviceName}.${methodName}`;
  }
}
