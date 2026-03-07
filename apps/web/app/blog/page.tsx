import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Blog | Zap Bot',
    description: 'Latest news, updates, and insights from the Zap Bot team',
}

export default function BlogPage() {
    const posts = [
        {
            title: "How AI is Revolutionizing Meeting Productivity",
            excerpt: "Discover how artificial intelligence is transforming the way teams collaborate and make decisions in meetings.",
            date: "October 25, 2024",
            readTime: "5 min read",
            href: "#"
        },
        {
            title: "Best Practices for Remote Team Meetings",
            excerpt: "Learn essential tips for conducting effective remote meetings and maximizing team engagement.",
            date: "October 18, 2024",
            readTime: "4 min read",
            href: "#"
        },
        {
            title: "Integrating Zap Bot with Your Workflow",
            excerpt: "Step-by-step guide to seamlessly integrate Zap Bot with your existing tools and processes.",
            date: "October 11, 2024",
            readTime: "6 min read",
            href: "#"
        }
    ]

    return (
        <div className="min-h-screen bg-background font-inter">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Blog</h1>
                    <p className="text-lg text-muted-foreground">
                        Insights, updates, and stories from the Zap Bot team
                    </p>
                </div>

                <div className="space-y-12">
                    {posts.map((post, index) => (
                        <article key={index} className="group border-b border-border pb-12 last:border-b-0">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{post.readTime}</span>
                                <span>•</span>
                                <span>{post.date}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                                <Link href={post.href}>{post.title}</Link>
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                                {post.excerpt}
                            </p>
                            <Link
                                href={post.href}
                                className="text-primary font-semibold hover:underline inline-flex items-center group/link transition-all"
                            >
                                Read more
                                <svg className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </article>
                    ))}
                </div>

                <div className="mt-24 p-8 lg:p-12 bg-muted/20 border border-border rounded-3xl text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-4">Stay Updated</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Subscribe to our newsletter for the latest updates and AI meeting insights delivered to your inbox.
                    </p>
                    <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-6 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
