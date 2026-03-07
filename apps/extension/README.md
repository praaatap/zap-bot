# Zap Bot Browser Extension (MVP)

This extension captures live captions from Google Meet / Zoom / Teams tabs and asks your Zap Bot API for live response suggestions.

## Load locally

1. Open Chrome: `chrome://extensions`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select `apps/extension`

## Use

1. Open a meeting tab and enable captions in the meeting UI.
2. Open the extension popup.
3. Set API URL (default `http://localhost:3001`) and Meeting ID.
4. Enter what help you need and click `Get Suggestion`.

## Notes

- Caption selectors differ by platform and can change; update `content.js` selectors if needed.
- This MVP reads visible captions text only; it does not capture raw microphone audio.
