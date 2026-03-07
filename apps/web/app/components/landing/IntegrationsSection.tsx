"use client"

import React from 'react'
import Image from 'next/image'

const integrations = [
    { name: "Slack", icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" },
    { name: "Google Calendar", icon: "https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" },
    { name: "Zoom", icon: "https://st1.zoom.us/static/6.3.26296/image/new/ZoomLogo.png" },
    { name: "Microsoft Teams", icon: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg" },
    { name: "Jira", icon: "https://cdn.worldvectorlogo.com/logos/jira-1.svg" },
    { name: "Trello", icon: "https://cdn.worldvectorlogo.com/logos/trello.svg" },
    { name: "Asana", icon: "https://cdn.worldvectorlogo.com/logos/asana-1.svg" }
]

export default function IntegrationsSection() {
    return (
        <section className="py-24 bg-[#050510] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
                        Works With Your Favorite Tools
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto opacity-80">
                        Seamlessly connect Zap Bot with the platforms your team already loves. No complex setup, just pure productivity.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 hover:opacity-100 transition-opacity duration-700">
                    {integrations.map((item, index) => (
                        <div key={index} className="group relative grayscale hover:grayscale-0 transition-all duration-500 transform hover:scale-110">
                            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <img
                                src={item.icon}
                                alt={item.name}
                                className="h-10 md:h-12 w-auto object-contain relative z-10"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
