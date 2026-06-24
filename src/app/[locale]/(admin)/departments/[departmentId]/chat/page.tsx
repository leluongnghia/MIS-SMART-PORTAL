'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Send, Image as ImageIcon, Paperclip, Smile } from 'lucide-react';
import { WORKSPACES } from '@/src/mockData';

interface Message {
  id: string;
  sender: string;
  senderName: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'u1',
    senderName: 'Nguyễn Văn A',
    content: 'Chào mọi người, tổ mình chuẩn bị nộp giáo án tuần 6 nhé.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isMe: false
  },
  {
    id: 'm2',
    sender: 'u2',
    senderName: 'Trần Thị B',
    content: 'Dạ sếp, em đang hoàn thiện, chiều nay em nộp ạ.',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    isMe: false
  }
];

export default function DepartmentChatPage({ params }: { params: Promise<{ departmentId: string }> }) {
  const { departmentId } = React.use(params);
  const departmentName = WORKSPACES.find(w => w.id === departmentId)?.name || 'Bộ phận';
  
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      senderName: 'Tôi',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      isMe: true
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="shrink-0">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Chat nội bộ</h1>
        <p className="text-sm text-slate-500 mt-1">Không gian thảo luận trực tuyến của {departmentName}</p>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col shadow-none border-slate-200 dark:border-slate-800">
        <CardContent className="flex-1 p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, index) => {
              const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;
              return (
                <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {showAvatar ? (
                    <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                      {msg.senderName.charAt(0)}
                    </div>
                  ) : (
                    <div className="h-8 w-8 shrink-0" />
                  )}
                  <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {showAvatar && (
                      <span className="text-xs font-bold text-slate-500 mb-1 px-1">
                        {msg.senderName} <span className="text-[10px] font-normal ml-1">{new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                      </span>
                    )}
                    <div 
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        msg.isMe 
                          ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm shadow-blue-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-slate-600">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-slate-600">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-slate-600">
                  <Smile className="h-5 w-5" />
                </Button>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 h-10 px-4 bg-slate-100 dark:bg-slate-900 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30"
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
