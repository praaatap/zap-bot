import React from 'react'

interface ChatSuggestionsProps {
    suggestions: string[]
    onSuggestionClick: (suggestion: string) => void
}

function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
    return (
        <div className='flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-12'>
            <div className='text-center'>
                <h2 className='text-2xl font-semibold text-white mb-3'>
                    Ask Zap Bot any question about all your meetings
                </h2>
                <p className='text-gray-400'>
                    I can search across all your meetings to find information, summarize discussions, and answer questions
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl'>
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion)}
                        className='p-4 bg-[#1e1e21] border border-white/10 rounded-xl hover:bg-white/5 hover:border-cyan-500/30 transition-all text-left group cursor-pointer'
                    >
                        <p className='text-sm text-gray-300 group-hover:text-cyan-400 transition-colors'>
                            ⚡️ {suggestion}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default ChatSuggestions
