import { Client, Users, Databases, Storage, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

export const users = new Users(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };

export default client;