import React from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
    chatInput: string
    onInputChange: (value: string) => void
    onSendMessage: () => void
    isLoading: boolean
}

function ChatInput({
    chatInput,
    onInputChange,
    onSendMessage,
    isLoading
}: ChatInputProps) {
    return (
        <div className='p-4 md:p-6 bg-[#050510] border-t border-white/10'>
            <div className='flex gap-3 max-w-4xl mx-auto'>
                <input
                    type='text'
                    value={chatInput}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                    placeholder={'Ask about any meeting - deadlines, decisions, action items, participants...'}
                    className='flex-1 px-4 py-3 bg-[#1e1e21] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all'
                    disabled={isLoading}
                />

                <button
                    onClick={onSendMessage}
                    disabled={isLoading || !chatInput.trim()}
                    className='flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                >
                    <Send className='h-5 w-5' />
                </button>
            </div>
            <div className="text-center mt-3">
                <p className="text-xs text-gray-500">AI can make mistakes. Verify important information.</p>
            </div>
        </div>
    )
}

export default ChatInput
