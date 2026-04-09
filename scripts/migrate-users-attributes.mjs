/**
 * Migration script to add missing attributes to the users collection
 * This adds: retentionDays, storageRegion, autoJoinMeetings, autoRecordMeetings,
 * aiSummary, actionItems, workflowFollowUpEmail, workflowSlackSummary,
 * workflowJiraTasks, workflowCrmSync
 */

import { Client, Databases } from "node-appwrite";
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
  users: process.env.APPWRITE_USERS_COLLECTION_ID || "users",
};

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(key);
const databases = new Databases(client);

async function tryCreateAttribute(fn, label) {
  try {
    await fn();
    console.log(`✓ Created attribute: ${label}`);
  } catch (error) {
    const message = String(error?.message || error);
    if (message.includes("already exists")) {
      console.log(`✓ Already exists: ${label}`);
    } else if (message.includes("attribute_limit_exceeded") || message.includes("maximum number")) {
      console.warn(`⚠ Skipped - Appwrite attribute limit reached: ${label}`);
    } else {
      console.error(`✗ Failed to create: ${label}`);
      console.error(`  Error: ${message}`);
    }
  }
}

async function migrateUsersCollection() {
  const c = ids.users;
  console.log(`\nMigrating users collection in database: ${ids.db}`);
  console.log("Adding missing attributes...\n");

  await tryCreateAttribute(
    () => databases.createIntegerAttribute(ids.db, c, "retentionDays", false, 90),
    `${c}.retentionDays (integer, default: 90)`
  );

  await tryCreateAttribute(
    () => databases.createStringAttribute(ids.db, c, "storageRegion", 40, false, "us-east-1"),
    `${c}.storageRegion (string, default: "us-east-1")`
  );

  await tryCreateAttribute(
    () => databases.createBooleanAttribute(ids.db, c, "autoJoinMeetings", false, true),
    `${c}.autoJoinMeetings (boolean, default: true)`
  );

  await tryCreateAttribute(
    () => databases.createBooleanAttribute(ids.db, c, "autoRecordMeetings", false, true),
    `${c}.autoRecordMeetings (boolean, default: true)`
  );

  await tryCreateAttribute(
    () => databases.createBooleanAttribute(ids.db, c, "aiSummary", false, true),
    `${c}.aiSummary (boolean, default: true)`
  );

  await tryCreateAttribute(
    () => databases.createBooleanAttribute(ids.db, c, "actionItems", false, true),
    `${c}.actionItems (boolean, default: true)`
  );

  await tryCreateAttribute(
    () => databases.createBooleanAttribute(ids.db, c, "workflowFollowUpEmail", false, true),
    `${c}.workflowFollowUpEmail (boolean, default: true)`
  );

  await tryCreateAttribute(
    () => databases.createBooleanAttribute(ids.db, c, "workflowSlackSummary", false, false),
    `${c}.workflowSlackSummary (boolean, default: false)`
  );

  await tryCreateAttribute(
    () => databases.createBooleanAttribute(ids.db, c, "workflowJiraTasks", false, false),
    `${c}.workflowJiraTasks (boolean, default: false)`
  );

  await tryCreateAttribute(
    () => databases.createBooleanAttribute(ids.db, c, "workflowCrmSync", false, false),
    `${c}.workflowCrmSync (boolean, default: false)`
  );

  console.log("\n✓ Migration complete!");
}

async function main() {
  console.log("=== Appwrite Users Collection Migration ===\n");
  console.log(`Database ID: ${ids.db}`);
  console.log(`Users Collection ID: ${ids.users}`);
  console.log(`Appwrite Endpoint: ${endpoint}\n`);

  await migrateUsersCollection();

  console.log("\nYou can now restart your application. The 'retentionDays' error should be resolved.");
}

main().catch((error) => {
  console.error("\n✗ Migration failed:", error.message);
  process.exit(1);
});
