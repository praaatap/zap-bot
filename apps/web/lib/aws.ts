import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Permission, Role, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { storage } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";

function isR2Enabled() {
    return process.env.OBJECT_STORAGE_PROVIDER === "r2" || Boolean(process.env.R2_ENDPOINT);
}

function isAppwriteStorageEnabled() {
    return process.env.OBJECT_STORAGE_PROVIDER === "appwrite" || Boolean(process.env.APPWRITE_STORAGE_BUCKET_ID);
}

export function getObjectStorageProvider() {
    if (isAppwriteStorageEnabled()) return "appwrite";
    return isR2Enabled() ? "r2" : "s3";
}

export function isObjectStorageKey(value?: string | null) {
    return typeof value === "string" && (/^(recordings|transcripts|metadata)\//.test(value) || value.startsWith("appwrite:"));
}

export function isRecordingStoredInR2(value?: string | null) {
    return isR2Enabled() && isObjectStorageKey(value);
}

function resolveS3Endpoint() {
    return process.env.R2_ENDPOINT || process.env.AWS_S3_ENDPOINT;
}

function resolveCredentials() {
    return {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
    };
}

// Initialize AWS clients
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: resolveS3Endpoint(),
    forcePathStyle: Boolean(resolveS3Endpoint()),
    credentials: resolveCredentials(),
});

const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.OBJECT_STORAGE_BUCKET || process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || "zap-bot-meetings";

function normalizeRecordingExtension(contentType: string) {
    if (contentType.includes("mp4")) return "mp4";
    if (contentType.includes("mpeg")) return "mp3";
    if (contentType.includes("ogg")) return "ogg";
    if (contentType.includes("webm")) return "webm";
    return "bin";
}

/**
 * Upload meeting recording to S3
 */
export async function uploadRecordingToS3(
    meetingId: string,
    recordingBuffer: Buffer,
    contentType: string = "video/mp4"
): Promise<string> {
    if (isAppwriteStorageEnabled()) {
        const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || APPWRITE_IDS.storageBucketId;
        if (!bucketId) {
            throw new Error("Missing APPWRITE_STORAGE_BUCKET_ID");
        }
        const ext = normalizeRecordingExtension(contentType);
        const fileName = `recording-${String(meetingId).replace(/[^a-zA-Z0-9-_]/g, "-")}-${Date.now()}.${ext}`;
        const file = await storage.createFile(
            bucketId,
            ID.unique(),
            InputFile.fromBuffer(recordingBuffer, fileName),
            [Permission.read(Role.any())]
        );
        return `appwrite:${file.$id}`;
    }

    const ext = normalizeRecordingExtension(contentType);
    const key = `recordings/${meetingId}/${Date.now()}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: recordingBuffer,
        ContentType: contentType,
        Metadata: {
            meetingId,
            uploadedAt: new Date().toISOString(),
        },
    });

    await s3Client.send(command);

    return key;
}

/**
 * Fetch remote recording and store it in object storage.
 */
export async function uploadRecordingFromUrl(
    meetingId: string,
    remoteUrl: string
): Promise<string> {
    const response = await fetch(remoteUrl);
    if (!response.ok) {
        throw new Error(`Failed to download recording (${response.status})`);
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const bytes = await response.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!buffer.length) {
        throw new Error("Downloaded recording is empty");
    }

    return uploadRecordingToS3(meetingId, buffer, contentType);
}

/**
 * Upload transcript to S3
 */
export async function uploadTranscriptToS3(
    meetingId: string,
    transcript: string
): Promise<string> {
    if (isAppwriteStorageEnabled()) {
        const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || APPWRITE_IDS.storageBucketId;
        if (!bucketId) {
            throw new Error("Missing APPWRITE_STORAGE_BUCKET_ID");
        }
        const fileName = `transcript-${String(meetingId).replace(/[^a-zA-Z0-9-_]/g, "-")}-${Date.now()}.json`;
        const file = await storage.createFile(
            bucketId,
            ID.unique(),
            InputFile.fromBuffer(Buffer.from(transcript), fileName),
            [Permission.read(Role.any())]
        );
        return `appwrite:${file.$id}`;
    }

    const key = `transcripts/${meetingId}/${Date.now()}.json`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: transcript,
        ContentType: "application/json",
        Metadata: {
            meetingId,
            uploadedAt: new Date().toISOString(),
        },
    });

    await s3Client.send(command);

    return key;
}

/**
 * Get signed URL for accessing recording
 */
export async function getRecordingUrl(s3Key: string): Promise<string> {
    if (s3Key.startsWith("appwrite:")) {
        const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || APPWRITE_IDS.storageBucketId;
        const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1").replace(/\/$/, "");
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
        const fileId = s3Key.replace("appwrite:", "");

        if (!bucketId || !projectId || !fileId) {
            throw new Error("Missing Appwrite storage configuration for recording URL");
        }

        return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    }

    const publicBase = process.env.R2_PUBLIC_BASE_URL;
    if (isR2Enabled() && publicBase) {
        return `${publicBase.replace(/\/$/, "")}/${s3Key}`;
    }

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
    });

    // URL expires in 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
}

export async function resolveRecordingUrl(recordingValue?: string | null): Promise<string | null> {
    if (!recordingValue) {
        return null;
    }

    if (!isObjectStorageKey(recordingValue)) {
        return recordingValue;
    }

    return getRecordingUrl(recordingValue);
}

/**
 * Invoke Lambda function for meeting processing
 */
export async function invokeMeetingProcessor(
    meetingId: string,
    s3RecordingKey: string,
    s3TranscriptKey?: string
): Promise<any> {
    const payload = {
        meetingId,
        s3RecordingKey,
        s3TranscriptKey,
        bucket: BUCKET_NAME,
        timestamp: new Date().toISOString(),
    };

    const command = new InvokeCommand({
        FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME || "zap-bot-processor",
        InvocationType: "Event", // Async invocation
        Payload: JSON.stringify(payload),
    });

    const response = await lambdaClient.send(command);

    return {
        statusCode: response.StatusCode,
        requestId: response.$metadata.requestId,
    };
}

/**
 * Invoke Lambda for transcript processing
 */
export async function invokeTranscriptProcessor(
    meetingId: string,
    transcript: string
): Promise<any> {
    const payload = {
        meetingId,
        transcript,
        action: "process_transcript",
        timestamp: new Date().toISOString(),
    };

    const command = new InvokeCommand({
        FunctionName: process.env.AWS_LAMBDA_TRANSCRIPT_FUNCTION || "zap-bot-transcript-processor",
        InvocationType: "RequestResponse", // Sync invocation
        Payload: JSON.stringify(payload),
    });

    const response = await lambdaClient.send(command);

    if (response.Payload) {
        const result = JSON.parse(Buffer.from(response.Payload).toString());
        return result;
    }

    return null;
}

/**
 * Store meeting metadata in S3
 */
export async function storeMeetingMetadata(
    meetingId: string,
    metadata: any
): Promise<string> {
    if (isAppwriteStorageEnabled()) {
        const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || APPWRITE_IDS.storageBucketId;
        if (!bucketId) {
            throw new Error("Missing APPWRITE_STORAGE_BUCKET_ID");
        }
        const fileName = `metadata-${String(meetingId).replace(/[^a-zA-Z0-9-_]/g, "-")}.json`;
        const file = await storage.createFile(
            bucketId,
            ID.unique(),
            InputFile.fromBuffer(Buffer.from(JSON.stringify(metadata, null, 2)), fileName),
            [Permission.read(Role.any())]
        );
        return `appwrite:${file.$id}`;
    }

    const key = `metadata/${meetingId}.json`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: "application/json",
    });

    await s3Client.send(command);

    return key;
}
