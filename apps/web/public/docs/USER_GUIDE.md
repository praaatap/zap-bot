# Zap Bot Documentation

## Table of Contents
1. [Getting Started](#getting-started)
2. [Google Calendar Integration](#google-calendar-integration)
3. [Recording Meetings](#recording-meetings)
4. [Dashboard Guide](#dashboard-guide)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is Zap Bot?

Zap Bot is an intelligent meeting recording and transcription platform that:
- **Automatically joins** your scheduled meetings
- **Records high-fidelity audio and video** from multiple platforms
- **Generates AI-powered summaries** and transcripts
- **Integrates with your calendar** (Google Calendar support)
- **Provides meeting analytics** and insights

### Supported Platforms

Zap Bot works with all major video conferencing platforms:
- ✅ Google Meet
- ✅ Zoom
- ✅ Microsoft Teams
- ✅ Webex
- ✅ And most other platforms with accessible meeting links

### Quick Setup (5 minutes)

1. **Sign Up**: Create your account on Zap Bot
2. **Connect Calendar**: Click "Connect Google Calendar" on the Dashboard
3. **Authorize**: Grant Zap Bot permission to access your calendar
4. **Start Recording**: Zap Bot will automatically join your meetings!

---

## Google Calendar Integration

### Connecting Your Google Calendar

#### Step 1: Navigate to Calendar
Go to **Dashboard → Calendar** and click **"Connect Google Calendar"**

#### Step 2: Authorize
You'll be redirected to Google's login page. Sign in with your Google account.

#### Step 3: Grant Permission
Click **"Allow"** to let Zap Bot access your calendar events and manage recordings.

#### Step 4: Confirmation
You'll see a success message: *"Google Calendar connected successfully!"*

### Troubleshooting Connection Issues

**Error: "Failed to connect: callback_failed"**
- **Cause**: Environment variables or redirect URI mismatch
- **Solution**:
  1. Check that your `.env` file has all required variables:
     ```
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```
  2. Restart your development server: `pnpm dev`
  3. Try connecting again

**Error: "Failed to connect: missing_credentials"**
- **Cause**: Google OAuth credentials are missing
- **Solution**: 
  1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
  2. Create an OAuth 2.0 application
  3. Set redirect URI to: `http://localhost:3000/api/calendar/callback`
  4. Add credentials to `.env`

**Error: "Failed to connect: google_auth_error"**
- **Cause**: Google rejected the authentication request
- **Solution**:
  1. Verify your Google credentials haven't expired
  2. Check that your API is enabled in Google Cloud Console
  3. Ensure your consent screen is configured
  4. Add your test email to authorized users (if in Testing mode)

### Manual Calendar Setup (Alternative)

If you prefer not to connect your calendar:
1. Go to **Dashboard**
2. Paste your meeting link in "Quick Join"
3. Click **"Schedule Bot"** to record that specific meeting

---

## Recording Meetings

### What Gets Recorded?

When Zap Bot joins a meeting, it records:
- 📹 **Video**: High-quality video stream
- 🔊 **Audio**: Crystal-clear audio from all participants
- 📋 **Metadata**: Meeting duration, participants, platform

### Storage & Processing

All recordings are:
- Stored securely in **AWS S3**
- Automatically transcribed using **AI models**
- Summarized with **key action items**
- Available in your **Recordings dashboard** within 1-2 hours

### Upcoming Recordings

The **Dashboard** shows all scheduled recordings in the next 30 days:

#### Status Indicators:
- 🟢 **Ready**: Bot is scheduled and will join automatically
- 🟡 **Pending**: Meeting is scheduled but bot not yet prepared
- 🔴 **Failed**: There was an issue joining the meeting

#### View Your Upcoming Recordings:
1. Go to **Dashboard**
2. Scroll to **"Upcoming Recordings"** section
3. Click any meeting to see details, including:
   - Meeting time and duration
   - Participants
   - Recording status
   - Generated transcript
   - AI summary

### Pause or Cancel Recording

To prevent Zap Bot from joining a specific meeting:
1. Click the meeting in **Upcoming Recordings**
2. Click **"Pause Recording"** or **"Cancel"**
3. Zap Bot will skip that meeting

---

## Dashboard Guide

### Dashboard Sections

#### 1. **Quick Join Panel**
Manually add meetings for immediate recording:
- Paste your meeting link
- Add optional title and start time
- Click **"Schedule Bot"** to dispatch immediately

#### 2. **System Status**
Real-time system health:
- ✅ All Services Online: System running normally
- ⚠️ Degraded Performance: Some features may be slow
- ❌ Service Error: Critical issue detected

#### 3. **Statistics Cards**
Key metrics at a glance:
- **Total Meetings**: Lifetime number of recorded meetings
- **Hours Transcribed**: Total transcription time
- **Active Meetings**: Currently recording
- **This Week**: Meetings recorded this week

#### 4. **Upcoming Recordings**
Next 30 days of scheduled recordings with:
- Meeting title and time
- Participants
- Bot preparation status
- Quick access to full details

#### 5. **Calendar Widget** (Coming Soon)
Visual calendar with inline meeting events

---

## API Reference

### Authentication
All API requests require Clerk authentication. Include your session cookie or auth token.

### Endpoints

#### Get Upcoming Recordings
```
GET /api/meetings/upcoming-recordings
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "meeting-123",
      "title": "Team Standup",
      "startTime": "2026-03-10T09:00:00Z",
      "platform": "google_meet",
      "botScheduled": true,
      "participants": ["alice@example.com", "bob@example.com"]
    }
  ]
}
```

#### Get Calendar Events
```
GET /api/calendar/events
```

**Response:**
```json
{
  "success": true,
  "connected": true,
  "data": [
    {
      "id": "event-123",
      "title": "Project Review",
      "start": "2026-03-10T14:00:00Z",
      "meetingUrl": "https://meet.google.com/abc-defg-hij"
    }
  ]
}
```

#### Connect Google Calendar
```
GET /api/calendar/connect
```
Redirects to Google OAuth consent screen.

#### Dispatch Bot to Meeting
```
POST /api/bot/dispatch
```

**Body:**
```json
{
  "meetingUrl": "https://meet.google.com/abc-defg-hij",
  "title": "My Meeting",
  "startTime": "2026-03-10T09:00:00Z"
}
```

---

## Troubleshooting

### General Issues

**Q: Why didn't the bot join my meeting?**
- Network connectivity issue
- Invalid meeting link
- Bot was paused for that meeting
- Meeting link was removed from calendar

**Solution**: Check the meeting's details page for error logs.

---

**Q: How long does transcription take?**
- Small meetings (< 1 hour): 15-30 minutes
- Standard meetings (1-3 hours): 30-60 minutes
- Long meetings (> 3 hours): 1-2 hours

---

**Q: Can I manually upload a video for transcription?**
- Coming soon! This feature is in development.

---

### Performance Issues

**Q: Dashboard is loading slowly**
- Clear browser cache (Ctrl+Shift+Del)
- Check your internet connection
- Try a different browser

---

**Q: Recordings are processing slowly**
- Our system is experiencing high load
- Check status at [Status Page](https://status.zapbot.example.com)
- Processing typically completes within 2 hours

---

### Data & Privacy

**Q: Where are my recordings stored?**
- All recordings stored on AWS S3 in secure, encrypted buckets
- Only you and authorized team members can access them
- Automatic deletion after 90 days (configurable)

---

**Q: Can I export/download my recordings?**
- Yes! Go to **Recordings → [Meeting] → Download**
- Export options: MP4 video, MP3 audio, SRT transcript

---

### Advanced Features

**Q: Can the bot mute itself?**
- Yes, the bot joins as a silent participant
- No video or audio output from bot

---

**Q: Can multiple bots join the same meeting?**
- Currently limited to 1 bot per meeting
- Multiple recordings of same meeting: Schedule different time windows

---

## Getting Help

- 📧 **Email Support**: support@zapbot.example.com
- 💬 **Community Chat**: [Discord](https://discord.gg/zapbot)
- 📚 **Knowledge Base**: [kb.zapbot.example.com](https://kb.zapbot.example.com)
- 🐛 **Report Bugs**: [GitHub Issues](https://github.com/zapbot/issues)

---

**Last Updated**: March 2026
**Version**: 1.0.0
