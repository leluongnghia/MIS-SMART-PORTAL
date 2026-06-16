"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { getChatInitialData, getConversationMessages, sendMessageAction, softDeleteMessageAction, createGroupChat, createDirectMessageChat } from "./actions";
import { 
  Send, Hash, MessageSquare, Megaphone, Users, Plus, 
  Trash2, X, ChevronRight, User, CornerUpLeft, Info, 
  AlertCircle, ShieldAlert 
} from "lucide-react";

type Actor = {
  id: string;
  name: string;
  role: string;
  departmentId: string | null;
};

type ChatUser = {
  id: string;
  name: string;
  role: string;
  roleName: string | null;
  title: string | null;
  email: string | null;
  departmentId: string | null;
};

type Department = {
  id: string;
  name: string;
  code: string;
};

type Conversation = {
  id: string;
  type: string;
  name: string | null;
  description: string | null;
  departmentId: string | null;
  createdBy: string | null;
  status: string;
  isPinned: boolean;
  members: { id: string; name: string; role: string }[];
  lastMessage: { content: string; createdAt: Date; senderId: string } | null;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderRole: string;
  content: string;
  type: string;
  replyToMessageId: string | null;
  isPinned: boolean;
  isEdited: boolean;
  deletedAt: Date | null;
  createdAt: Date;
};

export default function ChatClient({ locale, initialActor }: { locale: string; initialActor: Actor }) {
  const [actor, setActor] = useState<Actor>(initialActor);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [inputContent, setInputContent] = useState("");
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewDmOpen, setIsNewDmOpen] = useState(false);
  
  // Group creation state
  const [groupName, setGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<string[]>([]);
  
  // DM creation state
  const [dmTargetUserId, setDmTargetUserId] = useState("");

  // Mention dropdown state
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat directory
  const loadInitialData = async (silent = false) => {
    try {
      const res = await getChatInitialData();
      setUsers(res.users);
      setDepartments(res.departments);
      setConversations(res.conversations as any);
      setActor(res.actor);
      
      // Auto-select first conversation on initial load if none active
      if (!silent && res.conversations.length > 0 && !activeConvId) {
        setActiveConvId(res.conversations[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load messages for active conversation
  const loadMessages = async (convId: string, silent = false) => {
    if (!silent) setIsLoadingMessages(true);
    try {
      const msgs = await getConversationMessages(convId);
      setMessages(msgs as any);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Polling loop
  useEffect(() => {
    const interval = setInterval(() => {
      loadInitialData(true);
      if (activeConvId) {
        loadMessages(activeConvId, true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
      setReplyingMessage(null);
    }
  }, [activeConvId]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConv = conversations.find(c => c.id === activeConvId);

  // Parse accent-free string for flexible search
  const stripAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  };

  // Mention matches
  const mentionSuggestions = () => {
    const q = stripAccents(mentionQuery);
    
    // Filter users
    const matchedUsers = users
      .filter(u => stripAccents(u.name).includes(q))
      .map(u => ({ id: u.id, type: "user", name: u.name, desc: u.title || u.roleName }));
      
    // Filter departments (only show department if allowed)
    const matchedDepts = departments
      .filter(d => stripAccents(d.name).includes(q))
      .map(d => ({ id: d.id, type: "dept", name: d.name, desc: "Cả phòng ban" }));

    // Add @all for Admin
    const allOption = (actor.role === 'ADMIN' && 'toan truong'.includes(q)) 
      ? [{ id: "all", type: "all", name: "all", desc: "Toàn bộ thành viên nhà trường" }] 
      : [];

    return [...allOption, ...matchedDepts, ...matchedUsers].slice(0, 8);
  };

  // Handle Input typing and mention triggers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputContent(val);

    const selectionStart = e.target.selectionStart;
    const beforeCursor = val.substring(0, selectionStart);
    const lastAtIdx = beforeCursor.lastIndexOf("@");

    if (lastAtIdx !== -1 && !beforeCursor.substring(lastAtIdx).includes(" ")) {
      const query = beforeCursor.substring(lastAtIdx + 1);
      setMentionQuery(query);
      setMentionOpen(true);
      setMentionIndex(0);
      
      // Simple positioning helper
      const coords = getSelectionCoords(e.target, lastAtIdx);
      setMentionPosition({ top: coords.top - 180, left: coords.left });
    } else {
      setMentionOpen(false);
    }
  };

  const getSelectionCoords = (textarea: HTMLTextAreaElement, index: number) => {
    const { offsetTop, offsetLeft } = textarea;
    return { top: offsetTop, left: offsetLeft + Math.min(index * 8, 300) };
  };

  const insertMention = (suggestion: any) => {
    if (!inputRef.current) return;
    const val = inputContent;
    const cursor = inputRef.current.selectionStart;
    const beforeCursor = val.substring(0, cursor);
    const lastAtIdx = beforeCursor.lastIndexOf("@");

    if (lastAtIdx !== -1) {
      let replacement = "";
      if (suggestion.type === "all") {
        replacement = "@all";
      } else {
        replacement = `@[${suggestion.name}](${suggestion.type}:${suggestion.id})`;
      }

      const nextVal = val.substring(0, lastAtIdx) + replacement + " " + val.substring(cursor);
      setInputContent(nextVal);
      setMentionOpen(false);
      
      setTimeout(() => {
        inputRef.current?.focus();
        const nextCursor = lastAtIdx + replacement.length + 1;
        inputRef.current?.setSelectionRange(nextCursor, nextCursor);
      }, 10);
    }
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen) {
      const suggestions = mentionSuggestions();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((idx) => (idx + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((idx) => (idx - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (suggestions[mentionIndex]) {
          insertMention(suggestions[mentionIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setMentionOpen(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Send message with permission validations & tags warning
  const handleSend = async () => {
    if (!activeConvId || !inputContent.trim()) return;

    // Checks for @all
    if (inputContent.includes("@all") && actor.role !== 'ADMIN') {
      alert("Chỉ Admin trường mới có quyền dùng mention @all toàn trường.");
      return;
    }

    if (inputContent.includes("@all")) {
      const proceed = confirm("Bạn đang gửi tin nhắn nhắc đến @all toàn trường. Mọi người dùng sẽ nhận được thông báo. Bạn chắc chắn muốn gửi?");
      if (!proceed) return;
    }

    // Check for department tags with high member counts
    const deptMentionRegex = /@\[([^\]]+)\]\(dept:([^\)]+)\)/g;
    let match;
    while ((match = deptMentionRegex.exec(inputContent)) !== null) {
      const deptId = match[2];
      const deptName = match[1];
      const deptUsersCount = users.filter(u => u.departmentId === deptId).length;

      if (deptUsersCount > 20) {
        const proceed = confirm(`Bạn đang nhắc đến toàn bộ phòng "${deptName}" gồm ${deptUsersCount} thành viên. Tiếp tục gửi?`);
        if (!proceed) return;
      }
    }

    try {
      const res = await sendMessageAction(activeConvId, inputContent, replyingMessage?.id);
      if (res.success) {
        setInputContent("");
        setReplyingMessage(null);
        loadMessages(activeConvId);
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) {
      const res = await softDeleteMessageAction(msgId);
      if (res.success) {
        if (activeConvId) loadMessages(activeConvId);
      } else {
        alert(res.error);
      }
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    if (selectedGroupUsers.length === 0) {
      alert("Vui lòng chọn ít nhất một thành viên vào nhóm.");
      return;
    }

    const res = await createGroupChat(groupName, selectedGroupUsers);
    if (res.success && res.conversationId) {
      setIsNewGroupOpen(false);
      setGroupName("");
      setSelectedGroupUsers([]);
      loadInitialData();
      setActiveConvId(res.conversationId);
    } else {
      alert(res.error);
    }
  };

  const handleCreateDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmTargetUserId) return;

    const res = await createDirectMessageChat(dmTargetUserId);
    if (res.success && res.conversationId) {
      setIsNewDmOpen(false);
      setDmTargetUserId("");
      loadInitialData();
      setActiveConvId(res.conversationId);
    } else {
      alert(res.error);
    }
  };

  // Convert mentions in display message HTML
  const formatMessageContent = (content: string) => {
    // 1. User mention formatting
    let formatted = content.replace(/@\[([^\]]+)\]\(user:([^\)]+)\)/g, '<span class="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">@$1</span>');
    // 2. Department mention formatting
    formatted = formatted.replace(/@\[([^\]]+)\]\(dept:([^\)]+)\)/g, '<span class="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.5 rounded">@$1</span>');
    // 3. School mention @all
    formatted = formatted.replace(/@all/g, '<span class="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-1 py-0.5 rounded">@toàn trường</span>');

    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* 1. Conversations Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <span className="font-black text-slate-800 dark:text-white text-base tracking-tight">Kênh thảo luận</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setIsNewDmOpen(true)}
              title="Nhắn tin 1-1"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 transition"
            >
              <User className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setIsNewGroupOpen(true)}
              title="Tạo nhóm chat mới"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List of Conversations scroll container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
          
          {/* Section: School Ann */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Thông báo chung</div>
            <div className="space-y-0.5">
              {conversations.filter(c => c.type === 'SCHOOL_ANNOUNCEMENT').map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition text-left ${
                    activeConvId === conv.id 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  <Megaphone className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{conv.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Department channels */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kênh phòng ban</div>
            <div className="space-y-0.5">
              {conversations.filter(c => c.type === 'DEPARTMENT_CHANNEL').map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition text-left ${
                    activeConvId === conv.id 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{conv.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Group Chat */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nhóm công việc</div>
            <div className="space-y-0.5">
              {conversations.filter(c => c.type === 'GROUP_CHAT').map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition text-left ${
                    activeConvId === conv.id 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{conv.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Direct messages */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tin nhắn cá nhân</div>
            <div className="space-y-0.5">
              {conversations.filter(c => c.type === 'DIRECT_MESSAGE').map(conv => {
                const partner = conv.members.find(m => m.id !== actor.id) || conv.members[0];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition text-left ${
                      activeConvId === conv.id 
                        ? 'bg-indigo-600 text-white font-bold' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="h-5 w-5 rounded-full bg-slate-300 text-[10px] text-slate-800 flex items-center justify-center font-bold uppercase shrink-0">
                      {partner?.name.charAt(0)}
                    </div>
                    <span className="truncate flex-1">{partner?.name || 'DM'}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Middle Message Stream */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative">
        
        {/* Middle Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="min-w-0 flex items-center gap-2">
            <span className="font-black text-slate-800 dark:text-white text-base truncate">
              {activeConv?.type === 'DIRECT_MESSAGE'
                ? activeConv.members.find(m => m.id !== actor.id)?.name || 'Hội thoại cá nhân'
                : activeConv?.name || 'Đang chọn hội thoại...'}
            </span>
            {activeConv?.description && (
              <span className="text-xs text-slate-400 hidden sm:inline truncate border-l border-slate-200 pl-2">
                {activeConv.description}
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowInfoPanel(p => !p)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-855 rounded-xl text-slate-500 transition"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>

        {/* Message Feeds */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {isLoadingMessages ? (
            <div className="h-full flex items-center justify-center text-slate-500 space-y-2 flex-col">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold animate-pulse">Đang tải cuộc trò chuyện...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 flex-col space-y-2">
              <MessageSquare className="h-12 w-12 text-slate-300" />
              <p className="text-sm font-semibold">Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === actor.id;
              
              return (
                <div key={msg.id} className={`flex gap-3 group relative max-w-full ${isMe ? 'flex-row-reverse' : ''}`}>
                  {/* Sender Avatar */}
                  <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold uppercase shrink-0">
                    {msg.senderName.charAt(0)}
                  </div>

                  <div className={`min-w-0 max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Message Meta */}
                    <div className={`flex items-center gap-1.5 text-xs mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Message Body */}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm border relative group ${
                      isMe 
                        ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.deletedAt ? (
                        <span className="italic text-xs text-slate-400">Tin nhắn đã bị xóa</span>
                      ) : (
                        formatMessageContent(msg.content)
                      )}
                    </div>
                  </div>

                  {/* Actions (Delete, Reply hover options) */}
                  {!msg.deletedAt && (
                    <div className={`absolute top-4 hidden group-hover:flex items-center bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-800 shadow-sm rounded-lg py-0.5 px-1 gap-1 z-10 ${
                      isMe ? 'left-0' : 'right-0'
                    }`}>
                      <button
                        onClick={() => setReplyingMessage(msg)}
                        title="Trả lời tin nhắn"
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded transition"
                      >
                        <CornerUpLeft className="h-3.5 w-3.5" />
                      </button>
                      {(isMe || actor.role === 'ADMIN' || (actor.role === 'MANAGER' && activeConv?.type === 'DEPARTMENT_CHANNEL' && actor.departmentId === activeConv.departmentId)) && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Xóa tin nhắn"
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input panel */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative">
          
          {/* Replying indicator */}
          {replyingMessage && (
            <div className="absolute top-0 left-0 right-0 -translate-y-full bg-slate-100 dark:bg-slate-950 border-t border-slate-250 px-6 py-2 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate flex items-center gap-1.5">
                <CornerUpLeft className="h-3.5 w-3.5" />
                Đang trả lời <strong>{replyingMessage.senderName}</strong>: "{replyingMessage.content}"
              </span>
              <button onClick={() => setReplyingMessage(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Autocomplete Dropdown overlay */}
          {mentionOpen && mentionSuggestions().length > 0 && (
            <div 
              style={{ top: mentionPosition.top, left: mentionPosition.left }}
              className="absolute z-20 w-72 bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto"
            >
              {mentionSuggestions().map((sug, idx) => (
                <button
                  key={sug.id}
                  onClick={() => insertMention(sug)}
                  onMouseEnter={() => setMentionIndex(idx)}
                  className={`w-full text-left px-4 py-2 text-xs transition flex flex-col ${
                    mentionIndex === idx 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    {sug.type === "dept" ? <Hash className="h-3 w-3" /> : sug.type === "all" ? <Megaphone className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {sug.name}
                  </span>
                  <span className={`text-[10px] ${mentionIndex === idx ? 'text-slate-200' : 'text-slate-400'}`}>
                    {sug.desc}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Textarea inputs */}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputContent}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Gõ tin nhắn, sử dụng @ để nhắc đến thành viên/phòng ban..."
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputContent.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Conversation details right panel */}
      {showInfoPanel && activeConv && (
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center">
            <span className="font-black text-slate-800 dark:text-white text-base">Thông tin hội thoại</span>
            <button onClick={() => setShowInfoPanel(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-sm">
            
            {/* Conversation meta details */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thông tin chung</span>
              <h4 className="font-bold text-slate-800 dark:text-white">
                {activeConv.type === 'DIRECT_MESSAGE'
                  ? activeConv.members.find(m => m.id !== actor.id)?.name || 'Hội thoại cá nhân'
                  : activeConv.name}
              </h4>
              <p className="text-xs text-slate-500">{activeConv.description || "Không có mô tả chi tiết"}</p>
            </div>

            {/* List of members in conversation */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thành viên ({activeConv.members.length})</span>
              <div className="space-y-2">
                {activeConv.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] uppercase">
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold block truncate text-slate-700 dark:text-slate-300 text-xs">{m.name}</span>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">{m.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* NEW GROUP MODAL */}
      {isNewGroupOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-800 dark:text-white text-base">Tạo nhóm chat mới</h3>
              <button onClick={() => setIsNewGroupOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tên nhóm *</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nhóm dự án, nhóm chuyên môn..."
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Thành viên tham gia *</label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 max-h-56 overflow-y-auto p-2 space-y-1.5">
                  {users.filter(u => u.id !== actor.id).map(user => {
                    const isChecked = selectedGroupUsers.includes(user.id);
                    return (
                      <label key={user.id} className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedGroupUsers(prev => 
                              isChecked ? prev.filter(id => id !== user.id) : [...prev, user.id]
                            );
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{user.name}</span>
                          <span className="text-[10px] text-slate-450 block">{user.title || user.roleName}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewGroupOpen(false)}
                  className="px-4 py-2 text-sm font-bold border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                >
                  Tạo nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW DIRECT MESSAGE MODAL */}
      {isNewDmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-800 dark:text-white text-base">Bắt đầu chat 1-1</h3>
              <button onClick={() => setIsNewDmOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDm} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Chọn đồng nghiệp *</label>
                <select
                  required
                  value={dmTargetUserId}
                  onChange={(e) => setDmTargetUserId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Chọn thành viên --</option>
                  {users.filter(u => u.id !== actor.id).map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.title || user.roleName})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewDmOpen(false)}
                  className="px-4 py-2 text-sm font-bold border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                >
                  Trò chuyện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
