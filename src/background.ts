import { environment } from './environments/environment';

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const activeTabUrl = activeTab.url as string;
    const httpsVersion = environment.apiURL.replace('http://', 'https://');

    // disable when visiting the main app's website
    if (
      activeTabUrl.indexOf(environment.apiURL) === 0 ||
      activeTabUrl.indexOf(httpsVersion) === 0
    ) {
      chrome.browserAction.disable(activeTab.id);
    }
  });
});
