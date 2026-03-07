import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'About Us | Zap Bot',
    description: 'Learn about Zap Bot - AI-powered meeting assistant revolutionizing team collaboration',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4 font-inter">About Zap Bot</h1>
                    <p className="text-lg text-muted-foreground font-inter">
                        Revolutionizing team collaboration with AI-powered meeting intelligence
                    </p>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none font-inter">
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Our Mission</h2>
                        <p className="text-muted-foreground mb-6">
                            At Zap Bot, we believe that meetings should be productive, insightful, and actionable. Our AI-powered platform transforms the way teams collaborate by automatically recording, transcribing, and analyzing meetings to extract valuable insights and action items.
                        </p>
                        <p className="text-muted-foreground">
                            We&apos;re on a mission to eliminate the inefficiencies of traditional meeting workflows and empower teams to focus on what matters most - driving results and innovation.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">What We Do</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <h3 className="text-xl font-semibold text-foreground mb-3">Smart Recording</h3>
                                <p className="text-muted-foreground text-sm">
                                    Automatically join and record your meetings across all major platforms, ensuring no important discussion is ever missed.
                                </p>
                            </div>
                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <h3 className="text-xl font-semibold text-foreground mb-3">AI Transcription</h3>
                                <p className="text-muted-foreground text-sm">
                                    Convert speech to text with high accuracy, making meeting content searchable and accessible to all team members.
                                </p>
                            </div>
                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <h3 className="text-xl font-semibold text-foreground mb-3">Intelligent Summaries</h3>
                                <p className="text-muted-foreground text-sm">
                                    Generate comprehensive meeting summaries with key points, decisions, and action items automatically extracted.
                                </p>
                            </div>
                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <h3 className="text-xl font-semibold text-foreground mb-3">Seamless Integration</h3>
                                <p className="text-muted-foreground text-sm">
                                    Connect with your favorite tools like Slack, Jira, Trello, and Asana to keep workflows uninterrupted.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Our Story</h2>
                        <p className="text-muted-foreground mb-6">
                            Founded with the goal of making meetings better, Zap Bot was born from the frustration of sitting through countless unproductive meetings and struggling to capture important decisions.
                        </p>
                        <p className="text-muted-foreground mb-6">
                            After extensive research and development with the latest LLM models, we launched Zap Bot to transform meeting culture into a strategic advantage. Today, teams everywhere rely on our platform to make their collaboration more impactful.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-border">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-foreground mb-4 font-inter">Ready to get started?</h3>
                        <p className="text-muted-foreground mb-6 font-inter">
                            Join teams who are already using Zap Bot to transform their meetings.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all font-inter"
                        >
                            Start Free Trial
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
