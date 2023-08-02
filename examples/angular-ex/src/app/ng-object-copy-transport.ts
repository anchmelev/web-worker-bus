import { NgZone } from '@angular/core';
import { SendCommand } from '../../../../src/BusTypes';
import { ObjectCopyTransport } from '../../../../src/ObjectCopyTransport';

/**
 * It is necessary to wrap all messages from the worker in ngZone in order to correctly work out the mechanics of rendering angular
 */
export class NgObjectCopyTransport extends ObjectCopyTransport {
  ngZone: NgZone | null = null;

  protected override messageHandler(event: MessageEvent<SendCommand>): void {
    if (!this.ngZone) return;

    this.ngZone.run(() => {
      super.messageHandler(event);
    });
  }
}
