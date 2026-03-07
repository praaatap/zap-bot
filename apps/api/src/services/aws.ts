import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client(): S3Client {
    return new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: process.env.AWS_ACCESS_KEY_ID
            ? {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
            }
            : undefined,
    });
}

function getLambdaClient(): LambdaClient {
    return new LambdaClient({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: process.env.AWS_ACCESS_KEY_ID
            ? {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
            }
            : undefined,
    });
}

const BUCKET = process.env.AWS_S3_BUCKET || "zap-bot-meetings";

export async function uploadRecording(key: string, buffer: Buffer): Promise<string> {
    if (!process.env.AWS_ACCESS_KEY_ID) {
        console.log(`[Mock] upload recording: ${key}`);
        return `s3://${BUCKET}/${key}`;
    }

    const s3 = getS3Client();
    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: "video/mp4",
        })
    );

    return `s3://${BUCKET}/${key}`;
}

export async function uploadTranscript(key: string, json: string): Promise<string> {
    if (!process.env.AWS_ACCESS_KEY_ID) {
        console.log(`[Mock] upload transcript: ${key}`);
        return `s3://${BUCKET}/${key}`;
    }

    const s3 = getS3Client();
    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: json,
            ContentType: "application/json",
        })
    );

    return `s3://${BUCKET}/${key}`;
}

export async function getPresignedUrl(key: string): Promise<string> {
    if (!process.env.AWS_ACCESS_KEY_ID) {
        return `https://${BUCKET}.s3.amazonaws.com/${key}`;
    }

    const s3 = getS3Client();
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, command, { expiresIn: 3600 });
}

async function invokeLambda(functionName: string, payload: unknown, invocationType: "Event" | "RequestResponse") {
    const lambda = getLambdaClient();
    const response = await lambda.send(
        new InvokeCommand({
            FunctionName: functionName,
            InvocationType: invocationType,
            Payload: new TextEncoder().encode(JSON.stringify(payload)),
        })
    );

    let parsedPayload: unknown = undefined;
    if (response.Payload) {
        const raw = new TextDecoder().decode(response.Payload);
        try {
            parsedPayload = raw ? JSON.parse(raw) : undefined;
        } catch {
            parsedPayload = raw;
        }
    }

    return {
        statusCode: response.StatusCode || 200,
        payload: parsedPayload,
    };
}

export async function invokeProcessing(
    meetingId: string,
    s3Keys: { s3RecordingKey?: string; s3TranscriptKey?: string }
): Promise<{ statusCode: number; result: string }> {
    const functionName = process.env.AWS_LAMBDA_FUNCTION || "zap-bot-meeting-processor";

    if (!process.env.AWS_ACCESS_KEY_ID) {
        console.log(`[Mock] invoke processing lambda: ${functionName} (${meetingId})`);
        return {
            statusCode: 200,
            result: "Mock processing complete",
        };
    }

    const response = await invokeLambda(
        functionName,
        { meetingId, bucket: BUCKET, ...s3Keys },
        "Event"
    );

    return {
        statusCode: response.statusCode,
        result: "Processing started",
    };
}
