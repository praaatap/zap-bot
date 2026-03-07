const byTabId = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "ZAP_CAPTIONS_UPDATE" && sender.tab?.id) {
    byTabId.set(sender.tab.id, message.payload);
  }

  if (message?.type === "ZAP_GET_LATEST_CAPTIONS") {
    const tabId = message?.tabId;
    const data = byTabId.get(tabId) || null;
    sendResponse({ ok: true, data });
    return true;
  }
});
