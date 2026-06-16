import { useState } from 'react';
import { MessageSquare, Send, Bot, X } from 'lucide-react';
import axios from 'axios';

export default function ChatbotPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI assistant. Ask me anything about your leads, like 'Show me leads with score above 80' or 'Summarize recent trends.'", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { message: userMessage.text });
      const botMessage = { id: Date.now(), text: response.data.reply, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I couldn't process your request.", isBot: true, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden dark:bg-slate-800 dark:border-slate-700">
      <div className="bg-emerald-600 px-4 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded-lg transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.isBot 
                ? msg.isError 
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
                  : 'bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200' 
                : 'bg-emerald-600 text-white'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
