/**
 * Dispatched to the web worker when the web worker has initialized on the ui thread.
 * As part of this command, you can, if necessary, initialize your services placed in the web worker.
 **/
export type InitCommand = {
  type: 'INIT';
};

/**
 * A payload message is sent at the time the class method is called.
 * The payload is the method arguments and meta information to navigate the message to the desired service method in the web worker
 **/
export type SendMsgCommand = {
  type: 'SEND_MSG';
  payload: SendMsgPayload;
};

/**
 * A command is sent to the web worker when we use the RxJS's Observable object and unsubscribe from it occurs in the ui stream.
 * Prevents memory leaks in web worker
 */
export type UnsubscribeCommand = {
  type: 'UNSUBSCRIBE';
  payload: SendMsgPayload;
};

/**
 * The command is sent from the web worker to the ui stream.
 * The payload will be the result of executing the method.
 * It doesn't matter what type of return value the method has - Promise or Observable
 */
export type ReturnNextCommand = {
  type: 'RETURN_NEXT';
  payload: {
    value: unknown;
    messageId: string;
  };
};

/**
 * The command is sent from the web worker to the ui stream.
 * The payload will be the error result of the method execution.
 * It doesn't matter what type of return value the method has - Promise or Observable
 */
export type ReturnErrorCommand = {
  type: 'RETURN_ERROR';
  payload: {
    errorMsg: string;
    messageId: string;
  };
};

/**
 * The command is sent from the web worker to the ui thread.
 * When the Observable object finishes its work in the worker,
 * we tell the corresponding Observable object on the ui thread so that it also finishes its work.
 */
export type ReturnCompleteCommand = {
  type: 'RETURN_COMPLETE';
  payload: {
    messageId: string;
  };
};

export interface SendMsgPayload {
  messageId: string;
  serviceName: string;
  methodName: string;
  args: unknown[];
}

/**
 * Describes a callback that receives a service identifier as input and must return an instance of it
 * @param {string | symbol} serviceIdentifier - service ID
 */
export type ServiceGetter = (serviceIdentifier: string | symbol) => unknown;

/**
 * Describes a callback that receives a service identifier as input and must return an instance of it
 * @param {string | symbol} serviceIdentifier - service ID
 */
export type InitEventHandler = () => void;

export type ReturnCommand = ReturnNextCommand | ReturnErrorCommand | ReturnCompleteCommand;

export type SendCommand = InitCommand | SendMsgCommand | UnsubscribeCommand;

/**
 * An enum that tells the bus what the service that is in the web worker is working with.
 * There is a restriction that methods must be asynchronous (because the message passing procedure itself is)
 * and there must be only one return type for methods.
 **/
export enum ReturnType {
  /** The service works with promises */
  promise,
  /** The service works with rxjs observable objects */
  rxjsObservable,
}

/** Type describing the callback that will be called when a message is received from main thread */
export type OnMessageHandler = (event: MessageEvent<SendCommand | ReturnCommand>) => void;

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
