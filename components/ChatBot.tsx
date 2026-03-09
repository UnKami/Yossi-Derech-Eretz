import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Icons } from './Icons';
import { Course } from '../types';
import { API_URL } from '../constants';

interface ChatBotProps {
  courses: Course[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ courses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false); // UI State for the overlay form
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'היי! אני העוזר האישי של יוסי כהן. אני כאן כדי לענות על שאלות, לספר על הקורסים, או לקשר ביניכם. במה אפשר לעזור?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat session ref to persist conversation
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, showContactForm]);

  // Define the tool for submitting contact details via NLP
  const contactTool: FunctionDeclaration = {
    name: "submit_contact_details",
    description: "Sends the user's contact details (name, email) to Yossi Cohen's team when the user wants to be contacted or register.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "User's full name" },
        email: { type: Type.STRING, description: "User's email address" },
      },
      required: ["name", "email"]
    }
  };

  const initChat = () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const courseContext = courses.length > 0 
        ? `Active Courses:\n${courses.map(c => `- ${c.title}: ${c.subtitle} (${c.date}, ${c.location})`).join('\n')}`
        : "No active courses currently.";

      const systemInstruction = `
        You are an AI expert assistant for "Yossi Cohen - NLP".
        Yossi is an NLP Master, Business Consultant, and Mentor.
        
        Key Bio:
        - Born 1980, lives in Hod HaSharon.
        - Injured in 2000 during military service, experienced clinical death.
        - Philosophy: "Pain is not the end, it's the starting point."
        - 20+ years experience, 1000+ graduates.
        
        Services:
        1. NLP & Personal Coaching (Trauma release, empowerment).
        2. Mortgage & Family Economics.
        3. Business Consulting.
        4. Real Estate & Brokerage.

        Current Course Info:
        ${courseContext}

        Your Goal:
        Provide insights, answer questions about NLP and Yossi's method, and be empathetic.
        
        IMPORTANT - LEAD GENERATION:
        If a user asks to register, be contacted, or get more info personally:
        1. Ask for their Name and Email.
        2. Once they provide it, IMMEDIATELY call the function 'submit_contact_details'.
        3. After the function executes, confirm to the user that we will get back to them.

        Language: Reply in Hebrew (Ivrit) by default, unless the user speaks English.
        Tone: Professional, warm, empowering, concise.
      `;

      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: [contactTool] }]
        }
      });
    } catch (error) {
      console.error("Failed to initialize AI", error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initChat();
  }, [courses]);

  // Shared function to submit data to GAS
  const submitLeadToGAS = async (name: string, email: string) => {
      const formData = new URLSearchParams();
      formData.append('action', 'lead'); // 'action' tells script to use Contact logic (Contacts tab)
      formData.append('fullName', name);
      formData.append('email', email);

      await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
          mode: 'no-cors' 
      });
  };

  // Handle Manual Form Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    
    setIsSubmittingForm(true);
    try {
      await submitLeadToGAS(contactName, contactEmail);
      setFormSuccess(true);
      // Inform AI context (optional but nice)
      setMessages(prev => [...prev, { role: 'user', text: `השארתי פרטים: ${contactName}, ${contactEmail}` }]);
      
      setTimeout(() => {
        setShowContactForm(false);
        setFormSuccess(false);
        setContactName('');
        setContactEmail('');
      }, 3000);
    } catch (err) {
      console.error("Manual submission failed", err);
      alert("אירעה שגיאה בשליחת הפרטים. אנא נסה שוב.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) initChat();
      
      let response = await chatSessionRef.current.sendMessage({ message: userText });
      
      const functionCalls = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall);
      
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0].functionCall;
        
        if (call.name === 'submit_contact_details') {
          const args = call.args as any;
          
          try {
            await submitLeadToGAS(args.name, args.email);

            response = await chatSessionRef.current.sendMessage({
                message: [
                    {
                        functionResponse: {
                            name: 'submit_contact_details',
                            response: { result: 'success', message: 'Details sent successfully to system.' },
                            id: call.id 
                        }
                    }
                ]
            });
            
          } catch (err) {
            console.error("Error submitting contact details", err);
            response = await chatSessionRef.current.sendMessage({
                message: [
                    {
                        functionResponse: {
                            name: 'submit_contact_details',
                            response: { result: 'error', message: 'Network error submitting details.' }
                        }
                    }
                ]
            });
          }
        }
      }

      const aiText = response.text;
      if (aiText) {
        setMessages(prev => [...prev, { role: 'model', text: aiText }]);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'סליחה, נתקלתי בבעיה טכנית. אנא נסה שנית.' }]);
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
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center group"
        >
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          <Icons.MessageCircle size={28} />
          <div className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            התייעץ עם ה-AI של יוסי
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp border border-gray-100 font-sans">
          
          {/* Header */}
          <div className="bg-gradient-to-l from-blue-700 to-blue-600 p-4 flex justify-between items-center shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                <Icons.Bot size={22} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-none">יוסי כהן AI</h3>
                <span className="text-blue-100 text-xs flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  מחובר כעת
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowContactForm(!showContactForm)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg flex items-center gap-1 bg-white/10 px-2"
                title="השארת פרטים"
              >
                <Icons.Users size={16} />
                <span className="text-xs font-medium">השאר פרטים</span>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <Icons.Minimize2 size={20} />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden bg-gray-50 flex flex-col">
            
            {/* Visual Contact Form Overlay */}
            {showContactForm && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-6 flex flex-col justify-center animate-fadeIn">
                 {formSuccess ? (
                    <div className="text-center">
                       <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                         <Icons.CheckCircle size={32} />
                       </div>
                       <h3 className="text-xl font-bold text-blue-900 mb-2">הפרטים נשלחו!</h3>
                       <p className="text-gray-600 text-sm">ניצור איתך קשר בהקדם.</p>
                       <button 
                         onClick={() => setShowContactForm(false)} 
                         className="mt-6 text-blue-600 font-medium hover:underline text-sm"
                       >
                         חזור לצ'אט
                       </button>
                    </div>
                 ) : (
                     <form onSubmit={handleManualSubmit} className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                           <Icons.Users size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">נשמח לחזור אליך</h3>
                        <p className="text-xs text-gray-500 mt-1">השאר/י פרטים ויוסי או הצוות יחזרו בהקדם</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 mr-1">שם מלא</label>
                        <input 
                          type="text" 
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="ישראל ישראלי"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 mr-1">כתובת מייל</label>
                        <input 
                          type="email" 
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="example@email.com"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowContactForm(false)}
                          className="flex-1 py-3 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          ביטול
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmittingForm}
                          className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {isSubmittingForm ? <Icons.Loader2 size={16} className="animate-spin" /> : 'שליחה'}
                        </button>
                      </div>
                    </form>
                 )}
              </div>
            )}

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tl-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tr-none border border-gray-100 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 relative z-30">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="כתוב הודעה..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute left-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Icons.Send size={18} className={isLoading ? 'opacity-0' : 'opacity-100'} />
                {isLoading && <Icons.Loader2 size={18} className="absolute top-2 left-2 animate-spin" />}
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400">מופעל על ידי Gemini AI • יכולות להיות טעויות</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatBot;