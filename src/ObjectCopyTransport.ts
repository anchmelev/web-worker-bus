import { ITransport, OnMessageHandler, SendCommand } from './BusTypes';

export class ObjectCopyTransport implements ITransport {
  constructor(private readonly ctx: Worker) {
    this.ctx.onmessage = (event) => this.messageHandler(event);
  }

  onMessage!: OnMessageHandler;

  protected messageHandler(event: MessageEvent<SendCommand>): void {
    this.onMessage?.(event);
  }

  sendMsg(msg: unknown): void {
    this.ctx.postMessage(msg);
  }
}
