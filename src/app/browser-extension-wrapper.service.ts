import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChromeApiHelperService {
  constructor() {}

  sendMessage<T>(message: T): void {
    chrome.runtime.sendMessage(message);
  }

  disablePopup(tabId?: number): void {
    chrome.browserAction.disable(tabId);
  }
  enablePopup(tabId?: number): void {
    chrome.browserAction.enable(tabId);
  }

  logToBackground(message: unknown, context: string): void {
    const bgPage = chrome.extension.getBackgroundPage();
    (bgPage as any).console.log(context, message);
  }
}
