import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icons } from './Icons';
import { User } from '../types';

interface VaultProps {
  user: User;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Vault: React.FC<VaultProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `שלום ${user.name}. אני כאן. איפה תרצה שנמשיך היום?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initChat = () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        Role: You are "Yossi-AI", a Personal Assistant and NLP Coach in the Member Hub.
        User: ${user.name}.
        
        Directives:
        1. Presence over Progress: NEVER show progress bars or scores. Focus on the "Now".
        2. Style: Use "Clean Language" and reframing. Do not diagnose. Ask: "What would you like to have happen?"
        3. Continuity: You are a private confidant.
        4. Tone: Minimalist, calm, sophisticated.
        5. Bridge Logic:
           - If user mentions "Anxiety" or "Stress", suggest checking the Academy for the "Relaxation" module.
           - If user has a breakthrough, suggest sharing in "The Square".
           - If user needs deep work, mention Physical Courses/Retreats.
        
        Language: Hebrew (Ivrit) primarily.
      `;

      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: systemInstruction,
        }
      });
    } catch (error) {
      console.error("Failed to initialize Vault AI", error);
    }
  };

  useEffect(() => {
    initChat();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) initChat();
      
      const response = await chatSessionRef.current.sendMessage({ message: userText });
      const aiText = response.text;
      
      if (aiText) {
        setMessages(prev => [...prev, { role: 'model', text: aiText }]);
      }
    } catch (error) {
      console.error("Vault Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'מערכת הכספת מתאתחלת... אנא נסה שוב.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 my-4 md:my-8 md:mx-8 animate-fadeIn">
        {/* Vault Header */}
        <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">THE VAULT // SECURE CHANNEL</span>
            </div>
            <Icons.Bot className="text-gray-300" size={20} />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-xl text-sm leading-7 ${
                        msg.role === 'user' 
                        ? 'bg-gray-100 text-gray-800 rounded-tl-none' 
                        : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-tr-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="flex items-center gap-2 p-4 text-gray-400">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="כתוב כאן..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 pr-12 text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-sm"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute left-2 top-2 p-2 text-gray-400 hover:text-teal-600 transition-colors"
                >
                    <Icons.Send size={20} />
                </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">הכספת היא סביבה פרטית. השיחות נשמרות באופן מאובטח.</span>
            </div>
        </div>
    </div>
  );
};

export default Vault;