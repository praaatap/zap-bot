import Link from "next/link";
import styles from "./feature-overview.module.css";

export default function FeatureOverviewPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <span className={styles.brandBadge}>Z</span>
            <span>Zap Bot</span>
          </div>
          <div className={styles.navLinks}>
            <a className={styles.navLink} href="#product">Product</a>
            <a className={styles.navLink} href="#pipeline">Pipeline</a>
            <a className={styles.navLink} href="#surfaces">Surfaces</a>
          </div>
          <Link className={styles.navCta} href="/dashboard">Open Dashboard</Link>
        </div>
      </nav>

      <main className={styles.container}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Project Feature Overview</h1>
          <p className={styles.subtitle}>
            Zap Bot is a meeting intelligence platform that joins calls, captures transcript context, runs
            serverless embedding/query pipelines, and supports live AI suggestions.
          </p>
          <div className={styles.pillRow}>
            <span className={styles.pill}>Google Meet</span>
            <span className={styles.pill}>Zoom</span>
            <span className={styles.pill}>Teams</span>
            <span className={styles.pill}>Lambda + Pinecone</span>
            <span className={styles.pill}>Groq Embeddings</span>
            <span className={styles.pill}>Live Copilot Extension</span>
          </div>
        </section>

        <section id="product" className={styles.grid}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Meeting Automation</h2>
            <p className={styles.cardDesc}>Connect calendar or launch manually to dispatch bot in one click.</p>
            <div className={styles.list}>
              <div>Auto-dispatch from upcoming meetings</div>
              <div>Manual URL launch with Bot Launchpad</div>
              <div>Status tracking across join/record/process</div>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>AI Copilot</h2>
            <p className={styles.cardDesc}>Ask transcript questions and get real-time suggested responses.</p>
            <div className={styles.list}>
              <div>Context-aware meeting Q&amp;A</div>
              <div>Live response suggestion mode</div>
              <div>Agent bridge with node/python failover</div>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Serverless Intelligence</h2>
            <p className={styles.cardDesc}>Lambda units handle embedding pipeline and RAG query responses.</p>
            <div className={styles.list}>
              <div>Transcript to vectors in Pinecone</div>
              <div>Groq embedding first, Bedrock fallback</div>
              <div>Query lambda returns GenAI answers</div>
            </div>
          </article>
        </section>

        <section id="pipeline" className={styles.flow}>
          <h3 className={styles.flowTitle}>Pipeline Overview</h3>
          <p className={styles.flowText}>
            Meeting starts &rarr; bot joins and records &rarr; webhook sends transcript &rarr; Node API stores transcript in S3 &rarr;
            embedding lambda chunks and embeds transcript &rarr; Pinecone upsert &rarr; user query triggers query lambda &rarr;
            retrieval plus GenAI answer returns to web chat and extension.
          </p>
        </section>

        <section id="surfaces" className={styles.grid} style={{ marginTop: 14 }}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Dashboard</h2>
            <p className={styles.cardDesc}>Modern SaaS dashboard with system status and launch controls.</p>
          </article>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Meeting View</h2>
            <p className={styles.cardDesc}>Summary, transcript, participants, and assistant tools in one place.</p>
          </article>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Browser Extension</h2>
            <p className={styles.cardDesc}>Reads visible captions and provides live response guidance.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
