const CAPTIONS_LIMIT = 16;

function detectPlatform() {
  const host = location.host;
  if (host.includes("meet.google.com")) return "google_meet";
  if (host.includes("zoom.us")) return "zoom";
  if (host.includes("teams.microsoft.com")) return "teams";
  return "unknown";
}

function scrapeCaptions() {
  const platform = detectPlatform();
  const textSet = new Set();

  if (platform === "google_meet") {
    document.querySelectorAll("div[role='listitem'] span, div[jsname] span").forEach((el) => {
      const t = el.textContent?.trim();
      if (t && t.length > 3) textSet.add(t);
    });
  }

  if (platform === "zoom") {
    document.querySelectorAll(".closed-caption-text, .caption-line, [class*='caption']").forEach((el) => {
      const t = el.textContent?.trim();
      if (t && t.length > 3) textSet.add(t);
    });
  }

  if (platform === "teams") {
    document.querySelectorAll("[data-tid='closed-caption-text'], [class*='caption']").forEach((el) => {
      const t = el.textContent?.trim();
      if (t && t.length > 3) textSet.add(t);
    });
  }

  return Array.from(textSet).slice(-CAPTIONS_LIMIT);
}

function publishCaptions() {
  const captions = scrapeCaptions();
  if (!captions.length) return;

  chrome.runtime.sendMessage({
    type: "ZAP_CAPTIONS_UPDATE",
    payload: {
      url: location.href,
      platform: detectPlatform(),
      captions,
      at: new Date().toISOString()
    }
  });
}

setInterval(publishCaptions, 4000);
