import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service | Zap Bot',
    description: 'Terms of service for Zap Bot - AI-powered meeting assistant',
}

export default function TermsPage() {
    const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-background font-inter">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: {lastUpdated}
                    </p>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Zap Bot (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                        <p>
                            Zap Bot is an AI-powered meeting assistant that provides automated recording, transcription, and organization of meetings. Our service integrates with various platforms including Google Calendar and Slack.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                        <p>
                            To use our service, you must create an account using Clerk authentication. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Acceptable Use Policy</h2>
                        <p>
                            You agree not to use the Service to:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 mt-4">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe on intellectual property rights</li>
                            <li>Transmit harmful, offensive, or inappropriate content</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with the proper functioning of the Service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are owned by Zap Bot and are protected by international copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
                        <p>
                            In no event shall Zap Bot be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">7. Termination</h2>
                        <p>
                            We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <div className="bg-muted/30 p-6 rounded-2xl border border-border mt-4">
                            <p className="text-foreground font-semibold">Email: legal@zapbot.ai</p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-center text-sm text-muted-foreground">
                        By using Zap Bot, you agree to these Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    )
}
