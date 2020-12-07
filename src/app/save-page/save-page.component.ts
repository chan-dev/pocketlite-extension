import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import {
  BROWSER_ACTIONS,
  BrowserMessage,
} from 'src/shared/constants/browser-extension';
import { ChromeApiHelperService } from '../browser-extension-wrapper.service';

@Component({
  selector: 'app-save-page',
  templateUrl: './save-page.component.html',
  styles: [],
})
export class SavePageComponent implements OnInit {
  showLoader = false;
  allItems = [];
  tagControl = new FormControl([], Validators.required);

  constructor(
    private cd: ChangeDetectorRef,
    private chromeApiHelperService: ChromeApiHelperService
  ) {}

  ngOnInit(): void {
    // We're changing component state outside of Angular scope because
    // we're changing it inside the chrome API w/c Angular doesn't
    // monkey-patched, so we have to call change detection manually
    chrome.runtime.onMessage.addListener((message: BrowserMessage<unknown>) => {
      if (message.message === BROWSER_ACTIONS.SEND_RESPONSE) {
        this.logToBackground({
          message,
          component: 'SavePageComponent',
        });
        this.showLoader = false;
        if (message) {
          window.close();
        }
      } else if (message.message === BROWSER_ACTIONS.START_REQUEST) {
        this.showLoader = true;
        this.logToBackground('show loader');
        this.logToBackground({
          message,
        });
      }

      this.cd.detectChanges();
    });
  }

  saveBookmark(): void {
    this.logToBackground('saving bookmark');
    if (this.tagControl.valid) {
      const browserMessage: BrowserMessage<{ tags: string[] }> = {
        message: BROWSER_ACTIONS.DELEGATE_REQUEST,
        payload: {
          tags: this.tagControl.value,
        },
      };

      chrome.runtime.sendMessage(browserMessage);
    } else {
      this.logToBackground('tagControl invalid');
    }
  }

  close(): void {
    window.close();
  }

  logToBackground(message: unknown): void {
    this.chromeApiHelperService.logToBackground(message, 'From Popup Page');
  }
}
