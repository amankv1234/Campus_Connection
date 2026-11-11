import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AIAssistant = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.name}! I'm your AI Career Assistant. Ask me anything about resumes, interviews, or career advice.` }
  ]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/ai/ask', { 
        question: userMessage.content,
        history: messages 
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my brain right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      { role: 'assistant', content: `Hello ${user?.name}! I'm your AI Career Assistant powered by Google Gemini. Ask me anything about resumes, interviews, or career advice.` }
    ]);
  };

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">AI Career Assistant</h1>
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">
              Gemini 1.5
            </span>
          </div>
          <p className="text-gray-600 mt-1">Get real-time advice on interviews, resume building, and placement prep.</p>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleClearChat}
            className="text-xs text-gray-500 hover:text-red-600 transition underline"
          >
            Clear conversation
          </button>
        )}
      </div>

      <div className="flex-grow bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50">
           {messages.map((m, idx) => (
             <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div className="flex-shrink-0">
                     {m.role === 'user' ? (
                       <img src={user.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} alt="User" className="w-10 h-10 rounded-full mx-3"/>
                     ) : (
                       <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-primary-500 flex items-center justify-center text-white font-bold mx-3">AI</div>
                     )}
                   </div>
                   <div className={`p-4 rounded-xl shadow-sm ${m.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'}`}>
                     <p className="whitespace-pre-wrap leading-relaxed text-sm">{m.content}</p>
                     {m.role === 'assistant' && (
                       <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                         <button
                           type="button"
                           onClick={() => navigator.clipboard.writeText(m.content)}
                           className="text-[11px] text-gray-400 hover:text-primary-600 flex items-center gap-1 transition"
                           title="Copy response"
                         >
                           📋 Copy response
                         </button>
                       </div>
                     )}
                   </div>
                </div>
             </div>
           ))}
           {isLoading && (
             <div className="flex justify-start">
                <div className="flex max-w-[80%] flex-row">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-primary-500 flex items-center justify-center text-white font-bold mx-3 flex-shrink-0">AI</div>
                   <div className="p-4 rounded-xl shadow-sm bg-white text-gray-500 rounded-tl-none border border-gray-200 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                   </div>
                </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
           {/* Quick Prompts */}
           <div className="flex gap-2 overflow-x-auto pb-3 text-xs scrollbar-none">
             {[
               "📄 Resume Review Checklist",
               "💻 60-Day DSA Roadmap",
               "🎯 Top 5 HR Interview Questions",
               "🚀 How to get Off-Campus Referrals?"
             ].map((prompt, i) => (
               <button
                 key={i}
                 type="button"
                 onClick={() => setQuestion(prompt.replace(/^[^\s]+\s/, ''))}
                 className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 rounded-full border border-gray-200 transition"
               >
                 {prompt}
               </button>
             ))}
           </div>
           
           <form onSubmit={handleSubmit} className="flex relative items-center">
              <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me about resume tips or interview prep..."
                className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              />
              <button 
                type="submit"
                disabled={!question.trim() || isLoading}
                className="absolute right-2 bg-primary-600 text-white px-5 py-2 rounded-full font-medium hover:bg-primary-700 transition disabled:opacity-50"
              >
                Ask
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
