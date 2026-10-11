import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Role } from '../../types';
import { AIService } from '../../services/aiService';

interface AIAssistantViewProps {
  currentRole: Role;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ currentRole }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'assistant',
      content: `Xin chào! Tôi là Trợ lý Phản biện & Kiểm chứng AI (Socratic Critical Thinking Coach).
Tôi ở đây để hướng dẫn bạn các phương pháp tra cứu học liệu, đặt câu hỏi phản biện để phát hiện ảo giác AI trong môn Hóa học 11 và Khoa học Tự nhiên.
Lưu ý: Tôi sẽ KHÔNG giải thay bài tập hay đưa ra đáp án cuối cùng cho bạn!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    'Làm thế nào để phát hiện AI bịa hằng số Kc trong cân bằng hóa học?',
    'Giải thích nguyên lý Le Chatelier khi thay đổi nhiệt độ?',
    'Cách kiểm tra nguồn tài liệu trích dẫn của AI có thật hay không?',
    'Phương pháp 5 bước kiểm chứng nội dung AI tạo sinh?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await AIService.chat(
        [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: text },
        ],
        'Bạn là Trợ lý Phản biện Học tập THPT. Hãy gợi ý phương pháp kiểm tra kiến thức, đặt các câu hỏi phản biện đối chứng, nhưng KHÔNG làm thay bài tập cho học sinh.'
      );

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `Không thể kết nối máy chủ AI lúc này. Gợi ý kiểm chứng nhanh: Luôn đối chiếu công thức Kc và phát biểu Le Chatelier trực tiếp trong SGK Hóa học 11 Bài 1.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Trợ Lý Phản Biện & Kiểm Chứng AI (Socratic Coach)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gợi ý cách kiểm tra, đặt câu hỏi phản biện đối chứng. AI hỗ trợ người học tư duy — người học tự ra quyết định.
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'm-1',
                role: 'assistant',
                content: 'Cuộc trò chuyện đã được làm mới. Bạn cần hỗ trợ kiểm chứng nội dung nào?',
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm mới hội thoại</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 max-w-2xl ${
                m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                }`}
              >
                {m.role === 'user' ? 'HS' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                <span
                  className={`block text-[10px] mt-2 text-right ${
                    m.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-500 animate-pulse">
                Trợ lý AI đang suy nghĩ câu hỏi phản biện...
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt buttons */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/50 scrollbar-none">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-indigo-50 border rounded-full whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Đặt câu hỏi về cách kiểm chứng hoặc đối chiếu kiến thức..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
