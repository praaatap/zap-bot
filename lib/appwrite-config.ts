export const APPWRITE_IDS = {
  databaseId: process.env.APPWRITE_DATABASE_ID || "zapbot-main",
  storageBucketId: process.env.APPWRITE_STORAGE_BUCKET_ID || "",
  usersCollectionId: process.env.APPWRITE_USERS_COLLECTION_ID || "users",
  meetingsCollectionId: process.env.APPWRITE_MEETINGS_COLLECTION_ID || "meetings",
  integrationsCollectionId: process.env.APPWRITE_INTEGRATIONS_COLLECTION_ID || "user_integrations",
  transcriptChunksCollectionId:
    process.env.APPWRITE_TRANSCRIPT_CHUNKS_COLLECTION_ID || "transcript_chunks",
  chatMessagesCollectionId:
    process.env.APPWRITE_CHAT_MESSAGES_COLLECTION_ID || "chat_messages",
  slackInstallationsCollectionId:
    process.env.APPWRITE_SLACK_INSTALLATIONS_COLLECTION_ID || "slack_installations",
  webhookEventsCollectionId:
    process.env.APPWRITE_WEBHOOK_EVENTS_COLLECTION_ID || "webhook_events",
};
