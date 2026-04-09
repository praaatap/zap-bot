import {
  Client,
  Databases,
  Storage,
  ID,
  Permission,
  Role,
} from "node-appwrite";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const key = process.env.APPWRITE_API_KEY;

if (!project || !key) {
  console.error("Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_KEY");
  process.exit(1);
}

const ids = {
  db: process.env.APPWRITE_DATABASE_ID || "zapbot-main",
  bucket: process.env.APPWRITE_STORAGE_BUCKET_ID || "recordings",
  users: process.env.APPWRITE_USERS_COLLECTION_ID || "users",
  meetings: process.env.APPWRITE_MEETINGS_COLLECTION_ID || "meetings",
  integrations: process.env.APPWRITE_INTEGRATIONS_COLLECTION_ID || "user_integrations",
  transcriptChunks:
    process.env.APPWRITE_TRANSCRIPT_CHUNKS_COLLECTION_ID || "transcript_chunks",
  chatMessages: process.env.APPWRITE_CHAT_MESSAGES_COLLECTION_ID || "chat_messages",
  slackInstallations:
    process.env.APPWRITE_SLACK_INSTALLATIONS_COLLECTION_ID || "slack_installations",
};

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(key);
const databases = new Databases(client);
const storage = new Storage(client);

const perms = [
  Permission.read(Role.any()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users()),
];

async function ensureDatabase() {
  try {
    await databases.get(ids.db);
    console.log(`Database exists: ${ids.db}`);
  } catch {
    await databases.create(ids.db, "Zap Bot Main DB");
    console.log(`Created database: ${ids.db}`);
  }
}

async function ensureCollection(collectionId, name) {
  try {
    await databases.getCollection(ids.db, collectionId);
    console.log(`Collection exists: ${collectionId}`);
  } catch {
    await databases.createCollection(ids.db, collectionId, name, perms, false, true);
    console.log(`Created collection: ${collectionId}`);
  }
}

async function ensureBucket() {
  try {
    await storage.getBucket(ids.bucket);
    console.log(`Bucket exists: ${ids.bucket}`);
  } catch {
    await storage.createBucket(
      ids.bucket,
      "Meeting Recordings",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false,
      true
    );
    console.log(`Created bucket: ${ids.bucket}`);
  }
}

async function tryCreate(fn, label) {
  try {
    await fn();
    console.log(`Created: ${label}`);
  } catch (error) {
    const message = String(error?.message || error);
    if (message.includes("already exists")) {
      console.log(`Exists: ${label}`);
      return;
    }
    if (message.includes("maximum number or size of attributes") || message.includes("attribute_limit_exceeded")) {
      console.warn(`Skipped due to Appwrite attribute limit: ${label}`);
      return;
    }
    throw error;
  }
}

async function createUsersSchema() {
  const c = ids.users;
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "clerkId", 255, true), `${c}.clerkId`);
  await tryCreate(() => databases.createEmailAttribute(ids.db, c, "email", false), `${c}.email`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "name", 255, false), `${c}.name`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "botImageUrl", 2048, false), `${c}.botImageUrl`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "botName", 255, false, "Zap Bot"), `${c}.botName`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "assistantTone", 60, false, "balanced"), `${c}.assistantTone`);
  await tryCreate(() => databases.createIntegerAttribute(ids.db, c, "retentionDays", false, 90), `${c}.retentionDays`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "storageRegion", 40, false, "us-east-1"), `${c}.storageRegion`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "autoJoinMeetings", false, true), `${c}.autoJoinMeetings`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "autoRecordMeetings", false, true), `${c}.autoRecordMeetings`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "aiSummary", false, true), `${c}.aiSummary`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "actionItems", false, true), `${c}.actionItems`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "workflowFollowUpEmail", false, true), `${c}.workflowFollowUpEmail`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "workflowSlackSummary", false, false), `${c}.workflowSlackSummary`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "workflowJiraTasks", false, false), `${c}.workflowJiraTasks`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "workflowCrmSync", false, false), `${c}.workflowCrmSync`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "currentPlan", 40, false, "free"), `${c}.currentPlan`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "subscriptionStatus", 40, false, "inactive"), `${c}.subscriptionStatus`);
  await tryCreate(() => databases.createIntegerAttribute(ids.db, c, "meetingsThisMonth", false, 0), `${c}.meetingsThisMonth`);
  await tryCreate(() => databases.createIntegerAttribute(ids.db, c, "chatMessagesToday", false, 0), `${c}.chatMessagesToday`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "calendarConnected", false, false), `${c}.calendarConnected`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "slackConnected", false, false), `${c}.slackConnected`);
  await tryCreate(() => databases.createIndex(ids.db, c, "users_clerkId_idx", "key", ["clerkId"]), `${c}.users_clerkId_idx`);
}

async function createMeetingsSchema() {
  const c = ids.meetings;
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "userId", 255, true), `${c}.userId`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "title", 500, true), `${c}.title`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "description", 2000, false), `${c}.description`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "meetingUrl", 2048, false), `${c}.meetingUrl`);
  await tryCreate(() => databases.createDatetimeAttribute(ids.db, c, "startTime", true), `${c}.startTime`);
  await tryCreate(() => databases.createDatetimeAttribute(ids.db, c, "endTime", true), `${c}.endTime`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "botScheduled", false, true), `${c}.botScheduled`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "botSent", false, false), `${c}.botSent`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "meetingEnded", false, false), `${c}.meetingEnded`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "transcriptReady", false, false), `${c}.transcriptReady`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "processed", false, false), `${c}.processed`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "ragProcessed", false, false), `${c}.ragProcessed`);
  await tryCreate(() => databases.createBooleanAttribute(ids.db, c, "emailSent", false, false), `${c}.emailSent`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "recordingUrl", 2048, false), `${c}.recordingUrl`);
  await tryCreate(() => databases.createStringAttribute(ids.db, c, "summary", 8000, false), `${c}.summary`);
  await tryCreate(() => databases.createIndex(ids.db, c, "meetings_userId_idx", "key", ["userId"]), `${c}.meetings_userId_idx`);
  await tryCreate(() => databases.createIndex(ids.db, c, "meetings_startTime_idx", "key", ["startTime"]), `${c}.meetings_startTime_idx`);
}

async function createSimpleCollection(collectionId, name) {
  await ensureCollection(collectionId, name);
  await tryCreate(() => databases.createStringAttribute(ids.db, collectionId, "userId", 255, false), `${collectionId}.userId`);
}

async function main() {
  await ensureDatabase();
  await ensureBucket();
  await ensureCollection(ids.users, "Users");
  await ensureCollection(ids.meetings, "Meetings");
  await createSimpleCollection(ids.integrations, "User Integrations");
  await createSimpleCollection(ids.transcriptChunks, "Transcript Chunks");
  await createSimpleCollection(ids.chatMessages, "Chat Messages");
  await createSimpleCollection(ids.slackInstallations, "Slack Installations");
  await createUsersSchema();
  await createMeetingsSchema();
  console.log("Appwrite schema setup complete.");
}

main().catch((error) => {
  console.error("Failed to setup Appwrite schema", error);
  process.exit(1);
});
