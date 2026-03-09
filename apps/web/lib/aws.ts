import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize AWS clients
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "zap-bot-meetings";

/**
 * Upload meeting recording to S3
 */
export async function uploadRecordingToS3(
    meetingId: string,
    recordingBuffer: Buffer,
    contentType: string = "video/mp4"
): Promise<string> {
    const key = `recordings/${meetingId}/${Date.now()}.mp4`;

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
 * Upload transcript to S3
 */
export async function uploadTranscriptToS3(
    meetingId: string,
    transcript: string
): Promise<string> {
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
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
    });

    // URL expires in 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
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
