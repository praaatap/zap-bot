import { databases } from "@/lib/appwrite.server";

export function isAppwriteSchemaCompatibilityError(error: unknown): boolean {
    const message = String((error as { message?: unknown } | undefined)?.message || error).toLowerCase();
    return (
        message.includes("attribute") ||
        message.includes("unknown") ||
        message.includes("not found") ||
        message.includes("invalid document structure") ||
        message.includes("document_invalid_structure")
    );
}

export async function updateDocumentBestEffort(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
) {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    if (entries.length === 0) return null;

    const fullPatch = Object.fromEntries(entries);

    try {
        return await databases.updateDocument(databaseId, collectionId, documentId, fullPatch);
    } catch (error) {
        if (!isAppwriteSchemaCompatibilityError(error)) {
            throw error;
        }
    }

    let latestDocument: unknown = null;

    for (const [key, value] of entries) {
        try {
            latestDocument = await databases.updateDocument(databaseId, collectionId, documentId, {
                [key]: value,
            });
        } catch (error) {
            if (!isAppwriteSchemaCompatibilityError(error)) {
                throw error;
            }
            console.warn(`Skipping Appwrite field "${key}" because the schema is not ready yet.`);
        }
    }

    return latestDocument;
}
