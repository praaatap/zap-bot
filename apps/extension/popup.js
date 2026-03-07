const apiUrlEl = document.getElementById("apiUrl");
const meetingIdEl = document.getElementById("meetingId");
const promptEl = document.getElementById("prompt");
const outputEl = document.getElementById("output");
const suggestBtn = document.getElementById("suggestBtn");
const statusEl = document.getElementById("status");

const storageKey = "zap_copilot_settings";

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function saveSettings() {
  const settings = {
    apiUrl: apiUrlEl.value || "http://localhost:3001",
    meetingId: meetingIdEl.value || "",
  };
  chrome.storage.local.set({ [storageKey]: settings });
}

async function loadSettings() {
  const saved = await chrome.storage.local.get(storageKey);
  const settings = saved?.[storageKey] || {};
  apiUrlEl.value = settings.apiUrl || "http://localhost:3001";
  meetingIdEl.value = settings.meetingId || "";
}

async function getLatestCaptions(tabId) {
  const response = await chrome.runtime.sendMessage({
    type: "ZAP_GET_LATEST_CAPTIONS",
    tabId,
  });
  return response?.data || null;
}

async function handleSuggest() {
  outputEl.textContent = "Generating suggestion...";
  saveSettings();

  const meetingId = meetingIdEl.value.trim();
  const prompt = promptEl.value.trim();
  if (!meetingId || !prompt) {
    outputEl.textContent = "Meeting ID and prompt are required.";
    return;
  }

  const activeTab = await getActiveTab();
  const captionsData = await getLatestCaptions(activeTab.id);
  const context = captionsData?.captions?.slice(-8)?.join("\n") || "No live captions captured yet.";

  statusEl.textContent = captionsData
    ? `Captured ${captionsData.captions.length} caption lines (${captionsData.platform}).`
    : "No captured captions found yet. Make sure captions are enabled in meeting tab.";

  const response = await fetch(`${apiUrlEl.value.replace(/\/$/, "")}/api/chat/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meetingId,
      prompt: `${prompt}\n\nLive captions context:\n${context}`
    })
  });

  if (!response.ok) {
    outputEl.textContent = "Suggestion API request failed.";
    return;
  }

  const json = await response.json();
  outputEl.textContent = json.suggestion || "No suggestion returned.";
}

apiUrlEl.addEventListener("change", saveSettings);
meetingIdEl.addEventListener("change", saveSettings);
suggestBtn.addEventListener("click", handleSuggest);

loadSettings();
