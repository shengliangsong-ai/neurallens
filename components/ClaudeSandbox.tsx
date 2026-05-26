import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, ArrowLeft, Command, Cpu, Loader2, Sparkles, AlertCircle, Settings } from 'lucide-react';
import { getClaudeClient } from '../utils/claudeConfig';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ClaudeSandbox: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: input.trim() }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const claude = getClaudeClient();
            const response = await claude.messages.create({
                model: 'claude-3-7-sonnet-20250219',
                max_tokens: 4096,
                messages: newMessages.map(msg => ({ role: msg.role, content: msg.content }))
            });

            const assistantContent = response.content[0].type === 'text' ? response.content[0].text : 'Did not receive text output.';

            setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
            
        } catch (err: any) {
            console.error("Claude Sync Error:", err);
            setError(err.message || 'Failed to communicate with Claude.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        if (window.confirm('Clear all conversation history?')) {
            setMessages([]);
            setError(null);
        }
    };

    return (
        <div className="flex-1 overflow-hidden bg-slate-950 flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between p-4 border-b border-white/5 bg-slate-900 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 aspect-square hover:bg-slate-800 rounded-xl transition-all shadow-lg text-slate-400 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                           <Command size={18} className="text-purple-400"/>
                           Claude <span className="text-purple-400 font-light">Sandbox</span>
                        </h2>
                        <div className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mt-1 flex items-center gap-1.5"><Cpu size={10}/> Model: Claude 3.7 Sonnet</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.dispatchEvent(new Event('MISSING_API_KEY'))}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all text-xs font-bold uppercase"
                    >
                        <Settings size={14} /> Keys
                    </button>
                    <button 
                        onClick={handleClear} 
                        disabled={messages.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase"
                    >
                        <Trash2 size={14} /> Clear
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 w-full max-w-4xl max-h-full overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
                {messages.length === 0 && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 opacity-50 select-none">
                        <Command size={48} className="mb-4 text-slate-600" />
                        <h3 className="text-xl font-bold">Claude Intelligence Matrix</h3>
                        <p className="text-sm font-medium">Type a message below to initialize sequence.</p>
                    </div>
                )}
                
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                                <Bot size={16} className="text-purple-400" />
                            </div>
                        )}
                        <div className={`px-5 py-4 rounded-2xl max-w-[85%] shadow-xl font-medium text-[13px] leading-relaxed whitespace-pre-wrap flex flex-col gap-2
                            ${msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none border border-indigo-500' 
                                : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-bl-none'
                            }
                        `}>
                            {msg.content}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                <User size={16} className="text-indigo-400" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 justify-start animate-fade-in-up">
                         <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                            <Bot size={16} className="text-purple-400" />
                        </div>
                        <div className="px-5 py-4 rounded-2xl max-w-[85%] bg-slate-800 border border-slate-700 text-slate-400 rounded-bl-none shadow-xl flex items-center gap-3">
                            <Loader2 size={14} className="animate-spin text-purple-400" />
                            <span className="text-xs uppercase tracking-widest font-bold">Synthesizing...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex gap-4 justify-center animate-fade-in-up mt-8">
                        <div className="px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-xl flex items-center gap-3 w-full">
                            <AlertCircle size={20} className="shrink-0" />
                            <div className="text-sm font-medium">{error}</div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="w-full max-w-4xl p-4 shrink-0">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur group-hover:blur-md transition-all -z-10"></div>
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Initialize query... (Shift+Enter for newline)"
                        disabled={isLoading}
                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-2xl resize-none min-h-[80px] disabled:opacity-50"
                        rows={3}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute bottom-4 right-4 p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-xl transition-all shadow-lg flex items-center justify-center disabled:cursor-not-allowed group/btn"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="group-hover/btn:scale-110 transition-transform" />}
                    </button>
                    {!isLoading && <Sparkles size={16} className="absolute top-4 right-4 text-slate-700 pointer-events-none" />}
                </div>
                <div className="flex justify-center mt-3 text-[10px] uppercase font-black tracking-widest text-slate-500"><Command size={10} className="mr-1 inline-block" /> Powered by Anthropic Claude 3.7</div>
            </div>
        </div>
    );
};
