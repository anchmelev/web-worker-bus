import { OnMessageHandler, SendCommand } from './BusTypes';

export class ObjectCopyTransport {
  constructor(private readonly ctx: Worker) {
    this.ctx.onmessage = this.messageHandler;
  }

  onMessage!: OnMessageHandler;

  private messageHandler = (event: MessageEvent<SendCommand>): void => this.onMessage?.(event);

  sendMsg(msg: unknown): void {
    this.ctx.postMessage(msg);
  }
}
