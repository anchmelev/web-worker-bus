import { NgZone } from '@angular/core';
import { SendCommand } from '../../../../src/BusTypes';
import { ObjectCopyTransport } from '../../../../src/ObjectCopyTransport';

export class NgObjectCopyTransport extends ObjectCopyTransport {
  ngZone: NgZone | null = null;

  protected override messageHandler(event: MessageEvent<SendCommand>): void {
    if (!this.ngZone) return;

    this.ngZone.run(() => {
      super.messageHandler(event);
    });
  }
}
