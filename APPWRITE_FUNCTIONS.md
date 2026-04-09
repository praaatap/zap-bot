# AppWrite Functions Setup Guide

This guide explains how to set up AppWrite Functions for heavy compute operations that should be offloaded from the Next.js serverless environment.

## What are AppWrite Functions?

AppWrite Functions allow you to run serverless functions in response to database events, HTTP requests, or scheduled tasks. This is perfect for:
- **AI Processing**: Meeting summarization, action item extraction
- **RAG Indexing**: Creating embeddings and indexing transcripts
- **Transcript Processing**: Converting audio to text, speaker diarization
- **Email Generation**: Creating follow-up emails from meeting summaries
- **Integration Sync**: Syncing data to Slack, Jira, Asana, etc.

## Function Architecture

### Current Setup (Next.js API Routes)
✅ **Already migrated to AppWrite Database:**
- Meeting CRUD operations
- User management
- Chat/RAG queries
- Dashboard overview
- Calendar events
- Integrations

### Recommended AppWrite Functions

For heavy compute tasks that exceed Next.js serverless timeouts (10s on Vercel Hobby, 60s on Pro), you should create AppWrite Functions:

---

## Function 1: Meeting Processor (AI Pipeline)

**Purpose**: Process meeting recordings/transcripts to generate summaries, action items, and RAG embeddings.

**Trigger**: Database event (when `meetings` document has `transcriptReady=true` but `processed=false`)

**Runtime**: Python 3.11 or Node.js 20

### Python Implementation (`meeting-processor/main.py`):

```python
import requests
import os
import json
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)

DATABASE_ID = os.getenv('DATABASE_ID')
MEETINGS_COLLECTION_ID = os.getenv('MEETINGS_COLLECTION_ID')
TRANSCRIPT_CHUNKS_COLLECTION_ID = os.getenv('TRANSCRIPT_CHUNKS_COLLECTION_ID')

def main(req):
    """Process a meeting: generate summary, extract action items, create RAG embeddings"""
    
    meeting_id = req.get('meetingId')
    if not meeting_id:
        return {'success': False, 'error': 'meetingId required'}
    
    # Get meeting from AppWrite
    meeting = databases.get_document(DATABASE_ID, MEETINGS_COLLECTION_ID, meeting_id)
    
    if not meeting.get('transcript'):
        return {'success': False, 'error': 'No transcript available'}
    
    if meeting.get('processed'):
        return {'success': True, 'message': 'Already processed'}
    
    transcript = meeting['transcript']
    meeting_title = meeting.get('title', 'Untitled Meeting')
    
    # 1. Generate Summary using Groq/OpenAI
    summary = generate_summary(transcript, meeting_title)
    
    # 2. Extract Action Items
    action_items = extract_action_items(transcript)
    
    # 3. Create RAG Embeddings (using OpenAI embeddings API)
    create_rag_embeddings(transcript, meeting_id, meeting.get('userId'))
    
    # 4. Update meeting document
    databases.update_document(
        DATABASE_ID,
        MEETINGS_COLLECTION_ID,
        meeting_id,
        {
            'summary': summary,
            'actionItems': action_items,
            'processed': True
        }
    )
    
    # 5. Trigger follow-up workflows (email, Slack, etc.)
    trigger_workflows(meeting_id, meeting.get('userId'), summary, action_items)
    
    return {
        'success': True,
        'meetingId': meeting_id,
        'summaryLength': len(summary),
        'actionItemsCount': len(action_items)
    }

def generate_summary(transcript, title):
    """Generate meeting summary using Groq API"""
    import requests
    
    groq_api_key = os.getenv('GROQ_API_KEY')
    
    prompt = f"""
    Summarize the following meeting transcript for "{title}".
    
    Provide:
    1. A concise 3-4 sentence executive summary
    2. Key decisions made
    3. Main discussion points (bullet format)
    
    Transcript:
    {transcript[:8000]}  # Limit context to fit model
    """
    
    response = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {groq_api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'mixtral-8x7b-32768',
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.7,
            'max_tokens': 1000
        }
    )
    
    return response.json()['choices'][0]['message']['content']

def extract_action_items(transcript):
    """Extract action items from transcript"""
    import requests
    
    groq_api_key = os.getenv('GROQ_API_KEY')
    
    prompt = f"""
    Extract all action items from this meeting transcript.
    
    Return as JSON array with format:
    [
        {{
            "text": "Description of the task",
            "owner": "Person assigned (or null)",
            "dueDate": "Due date mentioned (or null)",
            "status": "new"
        }}
    ]
    
    Transcript:
    {transcript[:8000]}
    """
    
    response = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {groq_api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'mixtral-8x7b-32768',
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.3,
            'max_tokens': 1500
        }
    )
    
    # Parse JSON response
    content = response.json()['choices'][0]['message']['content']
    try:
        return json.loads(content)
    except:
        return []

def create_rag_embeddings(transcript, meeting_id, user_id):
    """Split transcript into chunks and create embeddings for RAG"""
    import requests
    from openai import OpenAI
    
    openai_api_key = os.getenv('OPENAI_API_KEY')
    pinecone_api_key = os.getenv('PINECONE_API_KEY')
    pinecone_index = os.getenv('PINECONE_INDEX')
    
    client = OpenAI(api_key=openai_api_key)
    
    # Split transcript into chunks (~500 tokens each)
    chunks = split_text_into_chunks(transcript, chunk_size=500)
    
    # Create embeddings for each chunk
    for i, chunk in enumerate(chunks):
        # Get embedding from OpenAI
        embedding_response = client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk
        )
        embedding = embedding_response.data[0].embedding
        
        # Store in AppWrite transcript_chunks collection
        databases.create_document(
            DATABASE_ID,
            TRANSCRIPT_CHUNKS_COLLECTION_ID,
            f"{meeting_id}_chunk_{i}",
            {
                'meetingId': meeting_id,
                'userId': user_id,
                'chunkIndex': i,
                'text': chunk,
                'embedding': embedding  # Store embedding in AppWrite
            }
        )
        
        # Also upsert to Pinecone for vector search
        upsert_to_pinecone(pinecone_index, pinecone_api_key, [
            {
                'id': f"{meeting_id}_chunk_{i}",
                'values': embedding,
                'metadata': {
                    'meetingId': meeting_id,
                    'userId': user_id,
                    'chunkIndex': i,
                    'text': chunk[:200]  # Store preview
                }
            }
        ])

def split_text_into_chunks(text, chunk_size=500):
    """Split text into chunks by sentences"""
    sentences = text.replace('! ', '!|').replace('? ', '?|').replace('. ', '.|').split('|')
    chunks = []
    current_chunk = []
    current_length = 0
    
    for sentence in sentences:
        current_length += len(sentence.split())
        current_chunk.append(sentence)
        
        if current_length >= chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_length = 0
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def upsert_to_pinecone(index_name, api_key, vectors):
    """Upsert vectors to Pinecone"""
    import requests
    
    response = requests.post(
        f'https://{index_name}.svc.api.pinecone.io/vectors/upsert',
        headers={
            'Api-Key': api_key,
            'Content-Type': 'application/json'
        },
        json={'vectors': vectors}
    )
    
    return response.json()

def trigger_workflows(meeting_id, user_id, summary, action_items):
    """Trigger follow-up workflows (email, Slack, Jira, etc.)"""
    # This would check user's workflow preferences and trigger accordingly
    # For now, just log
    print(f"Workflows triggered for meeting {meeting_id}")
```

### Deployment Steps:

1. **Create Function in AppWrite Console**:
   - Go to Functions > Create Function
   - Name: `meeting-processor`
   - Runtime: `Python 3.11`
   - Execute Permissions: `Any` (or restrict to specific roles)

2. **Set Environment Variables**:
   ```
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   DATABASE_ID=zapbot-main
   MEETINGS_COLLECTION_ID=meetings
   TRANSCRIPT_CHUNKS_COLLECTION_ID=transcript_chunks
   GROQ_API_KEY=your_groq_key
   OPENAI_API_KEY=your_openai_key
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX=your_index_name
   ```

3. **Deploy Code**:
   ```bash
   # Install AppWrite CLI
   npm install -g appwrite-cli
   
   # Login
   appwrite login
   
   # Deploy function
   cd meeting-processor
   appwrite init function
   appwrite create deploy
   ```

4. **Create Database Event Trigger**:
   - Go to your Database > Meetings Collection
   - Events > Create Event
   - Event: `databases.[database_id].collections.[meetings_id].documents.*.update`
   - Function: `meeting-processor`
   - Conditions: `transcriptReady == true && processed == false`

---

## Function 2: RAG Query Optimizer

**Purpose**: Optimize RAG queries by fetching relevant chunks and generating contextual answers.

**Trigger**: HTTP Request (called from `/api/chat/all` and `/api/chat/route.ts`)

### Node.js Implementation (`rag-query/index.js`):

```javascript
const { Client, Databases, Query } = require('node-appwrite');
const { OpenAI } = require('openai');

module.exports = async function({ req, res, log }) {
    try {
        const { query, userId, meetingId } = JSON.parse(req.body || '{}');
        
        if (!query || !userId) {
            return res.json({ success: false, error: 'query and userId required' }, 400);
        }
        
        // Initialize AppWrite client
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);
        
        const databases = new Databases(client);
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // 1. Generate query embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query
        });
        const queryEmbedding = embeddingResponse.data[0].embedding;
        
        // 2. Fetch relevant transcript chunks from AppWrite
        let chunksQuery = [
            Query.equal('userId', userId),
            Query.limit(20)
        ];
        
        if (meetingId) {
            chunksQuery = [
                Query.equal('userId', userId),
                Query.equal('meetingId', meetingId),
                Query.limit(20)
            ];
        }
        
        const chunksResult = await databases.listDocuments(
            process.env.DATABASE_ID,
            process.env.TRANSCRIPT_CHUNKS_COLLECTION_ID,
            chunksQuery
        );
        
        // 3. Calculate similarity (you could use Pinecone here for vector search)
        const rankedChunks = chunksResult.documents
            .map(chunk => ({
                ...chunk,
                similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);
        
        // 4. Generate answer using Groq
        const context = rankedChunks.map(c => c.text).join('\n\n');
        
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that answers questions based on meeting transcripts. Always cite which meeting the information came from.'
                    },
                    {
                        role: 'user',
                        content: `Based on the following meeting transcripts, answer this question:\n\nQuestion: ${query}\n\nContext:\n${context}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        const groqData = await groqResponse.json();
        const answer = groqData.choices?.[0]?.message?.content || 'I could not find relevant information in the transcripts.';
        
        // 5. Store chat message in AppWrite
        await databases.createDocument(
            process.env.DATABASE_ID,
            process.env.CHAT_MESSAGES_COLLECTION_ID,
            ID.unique(),
            {
                userId,
                meetingId: meetingId || 'all',
                role: 'user',
                content: query
            }
        );
        
        await databases.createDocument(
            process.env.DATABASE_ID,
            process.env.CHAT_MESSAGES_COLLECTION_ID,
            ID.unique(),
            {
                userId,
                meetingId: meetingId || 'all',
                role: 'assistant',
                content: answer
            }
        );
        
        // 6. Increment chat usage counter
        const userDocs = await databases.listDocuments(
            process.env.DATABASE_ID,
            process.env.USERS_COLLECTION_ID,
            [Query.equal('clerkId', userId), Query.limit(1)]
        );
        
        if (userDocs.total > 0) {
            const user = userDocs.documents[0];
            await databases.updateDocument(
                process.env.DATABASE_ID,
                process.env.USERS_COLLECTION_ID,
                user.$id,
                {
                    chatMessagesToday: (user.chatMessagesToday || 0) + 1
                }
            );
        }
        
        return res.json({
            success: true,
            answer,
            sources: rankedChunks.slice(0, 3).map(c => ({
                meetingId: c.meetingId,
                chunkIndex: c.chunkIndex
            })),
            backend: 'rag-function'
        });
        
    } catch (error) {
        log(error.message);
        return res.json({ success: false, error: error.message }, 500);
    }
};

function cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] ** 2;
        normB += b[i] ** 2;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

**Dependencies** (`package.json`):
```json
{
  "dependencies": {
    "node-appwrite": "^11.0.0",
    "openai": "^4.0.0"
  }
}
```

---

## Function 3: Email Summary Generator

**Purpose**: Generate and send follow-up emails after meetings.

**Trigger**: Database event (when `meetings.processed == true` and `emailSent == false`)

### Python Implementation (`email-summary/main.py`):

```python
import requests
import os
from appwrite.client import Client
from appwrite.services.databases import Databases

def main(req):
    """Generate and send follow-up email for a processed meeting"""
    
    meeting_id = req.get('meetingId')
    
    # Get meeting details
    client = Client()
    client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
    client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
    client.set_key(os.getenv('APPWRITE_API_KEY'))
    
    databases = Databases(client)
    
    meeting = databases.get_document(
        os.getenv('DATABASE_ID'),
        os.getenv('MEETINGS_COLLECTION_ID'),
        meeting_id
    )
    
    if not meeting.get('summary') or meeting.get('emailSent'):
        return {'success': False, 'error': 'No summary or already sent'}
    
    # Get user email
    user_docs = databases.list_documents(
        os.getenv('DATABASE_ID'),
        os.getenv('USERS_COLLECTION_ID'),
        [Query.equal('clerkId', meeting.get('userId')), Query.limit(1)]
    )
    
    if user_docs['total'] == 0:
        return {'success': False, 'error': 'User not found'}
    
    user = user_docs['documents'][0]
    user_email = user.get('email')
    
    # Generate email content using Groq
    email_content = generate_email(meeting.get('title'), meeting.get('summary'), meeting.get('actionItems'))
    
    # Send email via Resend
    resend_response = requests.post(
        'https://api.resend.com/emails',
        headers={
            'Authorization': f'Bearer {os.getenv("RESEND_API_KEY")}',
            'Content-Type': 'application/json'
        },
        json={
            'from': 'ZapBot <noreply@yourdomain.com>',
            'to': [user_email],
            'subject': f"Meeting Summary: {meeting.get('title')}",
            'html': email_content
        }
    )
    
    # Mark email as sent
    databases.update_document(
        os.getenv('DATABASE_ID'),
        os.getenv('MEETINGS_COLLECTION_ID'),
        meeting_id,
        {'emailSent': True}
    )
    
    return {'success': True, 'emailSent': True}

def generate_email(title, summary, action_items):
    """Generate HTML email content"""
    import requests
    
    groq_api_key = os.getenv('GROQ_API_KEY')
    
    prompt = f"""
    Create a professional follow-up email for this meeting.
    
    Meeting: {title}
    Summary: {summary}
    Action Items: {action_items}
    
    Format as HTML with:
    - Greeting
    - Brief summary
    - Action items table
    - Professional closing
    """
    
    response = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {groq_api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'mixtral-8x7b-32768',
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.7,
            'max_tokens': 1500
        }
    )
    
    return response.json()['choices'][0]['message']['content']
```

---

## How to Update Next.js API Routes to Call AppWrite Functions

Instead of running heavy AI processing in Next.js (which has timeout limits), call AppWrite Functions:

### Example: Update `/api/meetings/[id]/process/route.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const user = await getOrCreateUser(userId);
    
    // Get meeting
    const meetingDoc = await databases.listDocuments(
        APPWRITE_IDS.databaseId,
        APPWRITE_IDS.meetingsCollectionId,
        [Query.equal("$id", id), Query.limit(1)]
    );
    
    if (meetingDoc.total === 0) {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }
    
    const meeting = meetingDoc.documents[0] as any;
    
    if (meeting.userId !== user.$id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Trigger AppWrite Function instead of processing locally
    const functionResponse = await fetch(
        `${process.env.APPWRITE_ENDPOINT}/functions/meeting-processor/executions`,
        {
            method: 'POST',
            headers: {
                'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID!,
                'X-Appwrite-Key': process.env.APPWRITE_API_KEY!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                body: JSON.stringify({ meetingId: meeting.$id })
            })
        }
    );
    
    const result = await functionResponse.json();
    
    return NextResponse.json({
        success: true,
        message: "Processing started",
        executionId: result.$id
    });
}
```

---

## Monitoring and Debugging

1. **View Function Logs**: AppWrite Console > Functions > Your Function > Logs tab
2. **Track Executions**: Functions > Your Function > Executions tab
3. **Set Up Alerts**: Configure email notifications for failed executions

---

## Cost Optimization

- **Use Groq instead of OpenAI** for LLM calls (10x cheaper, faster)
- **Batch process embeddings** instead of one-by-one
- **Cache common responses** in AppWrite cache collection
- **Set memory limits** appropriately (512MB-1GB for most functions)
- **Use scheduled functions** for bulk operations (nightly RAG reindexing)

---

## Next Steps

1. ✅ Database migrated to AppWrite
2. ✅ API routes updated to use AppWrite
3. 🔄 Create AppWrite Functions (use templates above)
4. 🔄 Set up database event triggers
5. 🔄 Test end-to-end workflows
6. 🔄 Monitor and optimize function performance

For more information, see: https://appwrite.io/docs/products/functions
