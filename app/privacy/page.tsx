import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | Zap Bot',
    description: 'Privacy policy for Zap Bot - AI-powered meeting assistant',
}

export default function PrivacyPage() {
    const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-background font-inter">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: {lastUpdated}
                    </p>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Zap Bot (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered meeting assistant service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-foreground mb-2">2.1 Personal Information</h3>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Name and email address (via Clerk authentication)</li>
                                    <li>Calendar access tokens (when you connect your calendar)</li>
                                    <li>Meeting recordings and transcripts</li>
                                    <li>Usage data and preferences</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-foreground mb-2">2.2 Meeting Data</h3>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Audio recordings of meetings</li>
                                    <li>Transcripts generated from recordings</li>
                                    <li>Meeting metadata (title, time, participants)</li>
                                    <li>AI-generated summaries and action items</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>To provide our meeting recording and transcription services</li>
                            <li>To generate AI-powered summaries and action items</li>
                            <li>To sync with your calendar and automatically join meetings</li>
                            <li>To integrate with your preferred productivity tools</li>
                            <li>To improve our AI models and service performance</li>
                            <li>To ensure platform security and prevent fraud</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
                        <p>
                            We implement enterprise-grade technical and organizational security measures to protect your personal information, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 mt-4">
                            <li>Encryption of data in transit (TLS) and at rest (AES-256)</li>
                            <li>Secure authentication through Clerk</li>
                            <li>Regular security monitoring and infrastructure updates</li>
                            <li>Strict access controls for our internal systems</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <div className="bg-muted/30 p-6 rounded-2xl border border-border mt-4">
                            <p className="text-foreground font-semibold">Email: privacy@zapbot.ai</p>
                            <p>Zap Bot HQ</p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-center text-sm text-muted-foreground">
                        By using Zap Bot, you agree to the collection and use of information in accordance with this policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
