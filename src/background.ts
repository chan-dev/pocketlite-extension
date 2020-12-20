import { environment } from './environments/environment';

import { Tag } from './app/tag.interface';
import { Bookmark } from './app/bookmark.interface';
import {
  BROWSER_ACTIONS,
  BrowserMessage,
} from './shared/constants/browser-extension';
import { handlePromise, handleFetchResponse } from './shared/helpers/promise';
import { ChromeApiHelperService } from './app/browser-extension-wrapper.service';

interface BookmarkWithTags {
  bookmark: Bookmark;
  newTags: Tag[];
}

class BackgroundPage {
  constructor(private chromeApiHelperService: ChromeApiHelperService) {}

  init(): void {
    this.chromeApiHelperService.disablePopup();

    chrome.webNavigation.onCompleted.addListener(
      (_) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab) {
            this.chromeApiHelperService.enablePopup(activeTab.id);
          }
        });
      },
      {
        url: [
          {
            schemes: ['http', 'https'],
          },
        ],
      }
    );

    chrome.runtime.onMessage.addListener(
      (message: BrowserMessage<{ tags: string[] }>) => {
        console.log({ message });

        if (message.message === BROWSER_ACTIONS.DELEGATE_REQUEST) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            async (tabs) => {
              const activeTab = tabs[0];
              const activeTabUrl = activeTab?.url as string;

              if (activeTabUrl) {
                console.log({ activeTabUrl });

                this.sendResponse<BrowserMessage<null>>({
                  message: BROWSER_ACTIONS.START_REQUEST,
                });

                try {
                  const [error, response] = await handlePromise(
                    this.saveBookmark(activeTabUrl)
                  );

                  console.log({ error, response });

                  let bookmarkId = '';
                  // in the api, there's an error for duplicate url, so in
                  // this case if we're on a website that have already been saved then
                  // just ignore the error and use its bookmark.id
                  if (
                    response ||
                    (error.statusCode === 422 && error.errorCode === 'ERR_DUPS')
                  ) {
                    bookmarkId = response
                      ? response?.bookmark.id
                      : error?.payload.id;
                    console.log({ error, response, bookmarkId });

                    const bookmarkWithTags = await this.saveBookmarkTags(
                      bookmarkId,
                      message?.payload?.tags || []
                    );

                    const responseMessage: BrowserMessage<BookmarkWithTags> = {
                      message: BROWSER_ACTIONS.SEND_RESPONSE,
                      payload: bookmarkWithTags,
                    };

                    this.sendResponse<BrowserMessage<BookmarkWithTags>>(
                      responseMessage
                    );
                  } else {
                    throw { ...error };
                  }
                } catch (err) {
                  console.error({ err });
                }
              }
            }
          );
        }
      }
    );
  }

  async saveBookmark(url: string): Promise<{ bookmark: Bookmark }> {
    const API_URL = `${environment.apiURL}/api/bookmarks`;
    const payload = {
      url,
    };
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(API_URL, fetchOptions).then(
      handleFetchResponse
    );

    return response;
  }

  async saveBookmarkTags(
    bookmarkId: string,
    tags: string[]
  ): Promise<BookmarkWithTags> {
    const API_URL = `${environment.apiURL}/api/bookmarks/${bookmarkId}/tags?override=0`;
    const payload = {
      selectedTags: tags,
    };
    const fetchOptions = {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(API_URL, fetchOptions);
    return response.json();
  }

  private sendResponse<T>(message: T): void {
    this.chromeApiHelperService.sendMessage(message);
  }
}

// we need to wrap it in curly braces to prevent
// already declared variables
// https://stackoverflow.com/a/55836491/9732932
{
  const backgroundPage = new BackgroundPage(new ChromeApiHelperService());
  backgroundPage.init();
}
