export const enum BROWSER_ACTIONS {
  DELEGATE_REQUEST = 'DELEGATE_REQUEST',
  START_REQUEST = 'START_REQUEST',
  SEND_RESPONSE = 'SEND_RESPONSE',
}

export interface BrowserMessage<T> {
  message: string;
  payload?: T;
}
