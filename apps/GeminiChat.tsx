import React, { useState, useRef, useEffect } from 'react';
import { WindowProps } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const GeminiChat: React.FC<WindowProps> = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'model', text: 'Hello! I am your Gemini AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY not found in environment.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: input,
        });
        
        const responseText = response.text || "I couldn't generate a response.";
        
        setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: responseText 
        }]);
    } catch (error: any) {
        setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: `Error: ${error.message || "Something went wrong."}` 
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-purple-600'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            <div 
                className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed shadow-sm 
                ${msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}
            >
                {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none border border-gray-200 shadow-sm flex items-center">
                    <Loader2 size={16} className="animate-spin text-purple-600" />
                </div>
             </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gemini..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
                <Send size={18} />
            </button>
        </form>
      </div>
    </div>
  );
};